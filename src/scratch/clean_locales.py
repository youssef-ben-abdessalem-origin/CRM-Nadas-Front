import json
import os

def merge_dicts(dict1, dict2):
    """
    Recursively merges dict2 into dict1.
    """
    for key, value in dict2.items():
        if key in dict1 and isinstance(dict1[key], dict) and isinstance(value, dict):
            merge_dicts(dict1[key], value)
        else:
            dict1[key] = value
    return dict1

def clean_locale(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We can't use json.loads directly if there are duplicate keys because it will just take the last one.
    # However, for our purpose, we WANT to find the duplicates and merge them intelligently.
    # Actually, if we use a custom object_hook or just parse it manually, we can find them.
    
    # A simpler way since we know the structure:
    # 1. Parse the file into a list of (key, value) pairs where possible, or just use the fact that
    #    subsequent definitions of the same key in a dict will overwrite previous ones in standard JSON parsers.
    # 2. If we want to MERGE instead of just OVERWRITE, we need to be more careful.
    
    # Let's try to parse it with a decoder that collects all values for duplicate keys.
    from collections import defaultdict

    class MergingDecoder(json.JSONDecoder):
        def __init__(self, *args, **kwargs):
            super().__init__(object_pairs_hook=self.merge_pairs, *args, **kwargs)

        def merge_pairs(self, pairs):
            d = {}
            for k, v in pairs:
                if k in d:
                    if isinstance(d[k], dict) and isinstance(v, dict):
                        merge_dicts(d[k], v)
                    else:
                        d[k] = v # Overwrite with latest if not dicts
                else:
                    d[k] = v
            return d

    data = json.loads(content, cls=MergingDecoder)
    
    # Now write it back with nice indentation
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    paths = [
        r"c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales\en.json",
        r"c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales\fr.json",
        r"c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales\ar.json"
    ]
    for p in paths:
        if os.path.exists(p):
            print(f"Cleaning {p}")
            clean_locale(p)
