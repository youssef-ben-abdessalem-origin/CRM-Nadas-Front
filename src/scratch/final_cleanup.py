import json
import os

def main():
    en_json_path = r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales\en.json'

    with open(en_json_path, 'r', encoding='utf-8') as f:
        en_json = json.load(f)

    def fix_to_obj(parent, key, title):
        if key in parent and isinstance(parent[key], str):
            val = parent[key]
            parent[key] = {"title": val if val != key.capitalize() else title}
        elif key not in parent:
            parent[key] = {"title": title}

    # Fix Contacts
    if 'contacts' in en_json:
        c = en_json['contacts']
        if c.get('title') == 'Title': c['title'] = 'Personnel Directory'
        if c.get('subtitle') == 'Subtitle': c['subtitle'] = 'Manage your organizational personnel and influence nodes.'
        
        fix_to_obj(c, 'tiers', 'Influence Tiers')
        c['tiers'].update({
            "gold": "Gold Tier",
            "tier_1": "Tier 1",
            "loading": "Mapping influence tiers...",
            "empty": "No tiers defined"
        })
        
        fix_to_obj(c, 'statuses', 'Engagement Statuses')
        c['statuses'].update({
            "active": "Active",
            "inactive": "Inactive",
            "loading": "Syncing engagement states..."
        })

    # Fix Leads
    if 'leads' in en_json:
        l = en_json['leads']
        if 'dialog' in l and isinstance(l['dialog'], dict):
            d = l['dialog']
            if d.get('title') == 'Leads Settings': d['title'] = 'Lead Intelligence Configuration'
            if d.get('coreIdent') == 'Core ident': d['coreIdent'] = 'Core Identity'
            if d.get('editInfo') == 'Edit info': d['editInfo'] = 'Edit Information'

    # Fix Products
    if 'products' in en_json:
        p = en_json['products']
        if p.get('subtitle') == 'Subtitle': p['subtitle'] = 'Manage your product catalog and service offerings.'

    # Fix Automations
    if 'automations' in en_json:
        a = en_json['automations']
        if 'operators' in a and isinstance(a['operators'], dict):
            ops = a['operators']
            mapping = {
                "equals": "Equals",
                "not_equals": "Does not equal",
                "contains": "Contains",
                "is_empty": "Is empty",
                "is_not_empty": "Is not empty",
                "gt": "Greater than",
                "gte": "Greater than or equal",
                "lt": "Less than",
                "lte": "Less than or equal"
            }
            for k, v in mapping.items():
                if ops.get(k) == k.replace('_', ' ').capitalize():
                    ops[k] = v

    # Save
    with open(en_json_path, 'w', encoding='utf-8') as f:
        json.dump(en_json, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
