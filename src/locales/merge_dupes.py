import json

def deep_merge(dict1, dict2):
    for key, value in dict2.items():
        if key in dict1 and isinstance(dict1[key], dict) and isinstance(value, dict):
            deep_merge(dict1[key], value)
        else:
            dict1[key] = value

def merge_dupes_hook(pairs):
    d = {}
    for k, v in pairs:
        if k in d:
            if isinstance(d[k], dict) and isinstance(v, dict):
                deep_merge(d[k], v)
            else:
                # If not both dicts, the second one wins (standard JSON behavior but explicit here)
                d[k] = v
        else:
            d[k] = v
    return d

import sys
file_path = sys.argv[1] if len(sys.argv) > 1 else r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales\en.json'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

try:
    data = json.loads(content, object_pairs_hook=merge_dupes_hook)
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Merge successful")
except Exception as e:
    print(f"Merge failed: {e}")
