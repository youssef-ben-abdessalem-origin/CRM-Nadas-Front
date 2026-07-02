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

def set_nested(data, key, value):
    parts = key.split('.')
    curr = data
    for part in parts[:-1]:
        if part not in curr or not isinstance(curr[part], dict):
            curr[part] = {}
        curr = curr[part]
    if parts[-1] not in curr:
        curr[parts[-1]] = value

def main():
    en_json_path = r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales\en.json'
    missing_keys_path = r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\scratch\missing_keys_output_utf8.json'

    with open(en_json_path, 'r', encoding='utf-8') as f:
        en_json = json.load(f)

    with open(missing_keys_path, 'r', encoding='utf-8-sig') as f:
        missing_keys = json.load(f)

    # 1. Handle re-nesting and merging
    
    # Move auditLogs to settings.auditLogs
    if 'auditLogs' in en_json and 'settings' in en_json:
        if 'auditLogs' not in en_json['settings']:
            en_json['settings']['auditLogs'] = en_json.pop('auditLogs')
    
    # Move accounts to settings.accounts
    if 'accounts' in en_json and 'settings' in en_json:
         if 'accounts' not in en_json['settings']:
            en_json['settings']['accounts'] = en_json.pop('accounts')

    # Merge team.products into products (root)
    if 'team' in en_json and 'products' in en_json['team']:
        team_products = en_json['team'].pop('products')
        if 'products' not in en_json:
            en_json['products'] = {}
        # Simple merge
        for k, v in team_products.items():
            if k not in en_json['products']:
                en_json['products'][k] = v
            elif isinstance(v, dict) and isinstance(en_json['products'][k], dict):
                en_json['products'][k].update(v)

    # 2. Add missing keys
    for key in missing_keys:
        # Skip dynamic keys and URLs
        if '${' in key or key.startswith('/') or ' ' in key:
            continue
        
        # If key already exists after re-nesting, skip
        if get_nested(en_json, key) is not None:
            continue
            
        # Guess value from last part of key
        parts = key.split('.')
        last_part = parts[-1]
        
        # Beautify last part: camelCase to Title Case
        import re
        value = re.sub(r'([A-Z])', r' \1', last_part).strip().capitalize()
        
        # Specific context overrides
        if 'notifications' in key:
            if 'created' in key or 'Success' in key:
                value = f"{parts[-3].capitalize()} created successfully"
            elif 'updated' in key:
                value = f"{parts[-3].capitalize()} updated successfully"
            elif 'deleted' in key:
                value = f"{parts[-3].capitalize()} deleted successfully"

        if 'dialogs' in key or 'dialog' in key:
            if 'title' in key:
                value = f"{parts[-3].capitalize()} Settings"
            elif 'description' in key or 'desc' in key:
                value = f"Manage your {parts[-3].lower()} configuration and preferences."

        set_nested(en_json, key, value)

    # Save updated en.json
    with open(en_json_path, 'w', encoding='utf-8') as f:
        json.dump(en_json, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
