import json
import os

def set_nested(data, key, value):
    parts = key.split('.')
    curr = data
    for part in parts[:-1]:
        if part not in curr or not isinstance(curr[part], dict):
            curr[part] = {}
        curr = curr[part]
    curr[parts[-1]] = value

def main():
    en_json_path = r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales\en.json'

    with open(en_json_path, 'r', encoding='utf-8') as f:
        en_json = json.load(f)

    # Restore accounts and contacts to root
    if 'settings' in en_json:
        if 'accounts' in en_json['settings']:
            # Clone to root if not exists
            if 'accounts' not in en_json:
                en_json['accounts'] = en_json['settings']['accounts'].copy()
            else:
                en_json['accounts'].update(en_json['settings']['accounts'])
        
        if 'contacts' in en_json['settings']:
            if 'contacts' not in en_json:
                en_json['contacts'] = en_json['settings']['contacts'].copy()
            else:
                en_json['contacts'].update(en_json['settings']['contacts'])

    # Ensure vendors exists at root too
    if 'settings' in en_json and 'vendors' in en_json['settings']:
        if 'vendors' not in en_json:
            en_json['vendors'] = en_json['settings']['vendors'].copy()

    # Save
    with open(en_json_path, 'w', encoding='utf-8') as f:
        json.dump(en_json, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
