import json
import os

def get_nested(data, key):
    parts = key.split('.')
    for part in parts:
        if isinstance(data, dict) and part in data:
            data = data[part]
        else:
            return None
    return data

def main():
    root = r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales'
    with open(os.path.join(root, 'en.json'), 'r', encoding='utf-8') as f:
        en = json.load(f)
    with open(os.path.join(root, 'missing_ar.json'), 'r', encoding='utf-8') as f:
        missing = json.load(f)
    
    unique_vals = set()
    for key in missing:
        val = get_nested(en, key)
        if val and isinstance(val, str):
            unique_vals.add(val)
    
    print(f"Unique English values to translate: {len(unique_vals)}")
    with open(os.path.join(root, 'unique_missing_vals.json'), 'w', encoding='utf-8') as f:
        json.dump(sorted(list(unique_vals)), f, indent=2)

if __name__ == "__main__":
    main()
