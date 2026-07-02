import os
import json
import re

def find_keys_in_file(filepath):
    keys = set()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Find t('...') or t("...") or t(`...`)
            matches = re.findall(r"t\((['\"`][^'\"`]+['\"`])", content)
            for m in matches:
                # Remove quotes
                key = m[1:-1]
                # Filter out obvious non-keys like 'en-US' or CSS classes if they ever match (unlikely with t())
                if not key.startswith(' ') and '.' in key:
                    keys.add(key)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return keys

def get_nested_key(data, key):
    parts = key.split('.')
    for part in parts:
        if isinstance(data, dict) and part in data:
            data = data[part]
        else:
            return None
    return data

def main():
    root_dir = r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src'
    en_json_path = os.path.join(root_dir, 'locales', 'en.json')

    with open(en_json_path, 'r', encoding='utf-8') as f:
        en_json = json.load(f)

    all_keys = set()
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js', '.jsx')):
                filepath = os.path.join(root, file)
                all_keys.update(find_keys_in_file(filepath))

    missing_keys = []
    for key in sorted(all_keys):
        if get_nested_key(en_json, key) is None:
            missing_keys.append(key)

    print(json.dumps(missing_keys, indent=2))

if __name__ == "__main__":
    main()
