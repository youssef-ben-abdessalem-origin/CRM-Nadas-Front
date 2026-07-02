import json
import os

def get_keys(data, prefix=''):
    keys = {}
    if isinstance(data, dict):
        for k, v in data.items():
            keys.update(get_keys(v, f"{prefix}.{k}" if prefix else k))
    else:
        keys[prefix] = data
    return keys

def sync_dict(source, target):
    new_dict = {}
    for k, v in source.items():
        if isinstance(v, dict):
            # If target has it but it's not a dict, start fresh
            target_v = target.get(k) if isinstance(target.get(k), dict) else {}
            new_dict[k] = sync_dict(v, target_v)
        else:
            # If target has it, keep it. Otherwise, mark as missing (empty string for now)
            if k in target and not isinstance(target[k], dict):
                new_dict[k] = target[k]
            else:
                new_dict[k] = None # Mark for translation
    return new_dict

def find_missing(data, prefix=''):
    missing = []
    for k, v in data.items():
        if v is None:
            missing.append(f"{prefix}.{k}" if prefix else k)
        elif isinstance(v, dict):
            missing.extend(find_missing(v, f"{prefix}.{k}" if prefix else k))
    return missing

def main():
    locales_dir = r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales'
    en_path = os.path.join(locales_dir, 'en.json')
    ar_path = os.path.join(locales_dir, 'ar.json')
    fr_path = os.path.join(locales_dir, 'fr.json')

    with open(en_path, 'r', encoding='utf-8') as f:
        en = json.load(f)
    
    with open(ar_path, 'r', encoding='utf-8') as f:
        ar = json.load(f)

    with open(fr_path, 'r', encoding='utf-8') as f:
        fr = json.load(f)

    synced_ar = sync_dict(en, ar)
    synced_fr = sync_dict(en, fr)

    missing_ar = find_missing(synced_ar)
    missing_fr = find_missing(synced_fr)

    print(f"Missing in AR: {len(missing_ar)}")
    print(f"Missing in FR: {len(missing_fr)}")

    # Save the missing keys for manual translation or further processing
    with open(os.path.join(locales_dir, 'missing_ar.json'), 'w', encoding='utf-8') as f:
        json.dump(missing_ar, f, indent=2)
    
    with open(os.path.join(locales_dir, 'missing_fr.json'), 'w', encoding='utf-8') as f:
        json.dump(missing_fr, f, indent=2)

if __name__ == "__main__":
    main()
