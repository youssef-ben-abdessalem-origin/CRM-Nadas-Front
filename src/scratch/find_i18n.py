import os
import re
import json
import sys

# Set default encoding to utf-8 for printing
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

def find_hardcoded_strings(directory):
    tsx_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".tsx"):
                tsx_files.append(os.path.join(root, file))

    results = {}
    
    # Regex to find text between JSX tags
    jsx_text_pattern = re.compile(r'>\s*([A-Z\u0600-\u06FF][^<{}]*)\s*<')
    
    # Regex to find label="...", placeholder="...", title="..."
    attr_text_pattern = re.compile(r'(?:label|placeholder|title|description|alt|subject)\s*=\s*"([^"]+)"')

    for file_path in tsx_files:
        if "node_modules" in file_path: continue
        
        with open(file_path, 'r', encoding='utf-8') as f:
            try:
                content = f.read()
                
                jsx_matches = jsx_text_pattern.findall(content)
                attr_matches = attr_text_pattern.findall(content)
                
                all_matches = set()
                for m in jsx_matches:
                    m = m.strip()
                    if m and not m.startswith('t(') and not m.startswith('{'):
                        if len(m) > 1 and not re.match(r'^[a-z0-9._-]+$', m):
                            all_matches.add(m)
                
                for m in attr_matches:
                    m = m.strip()
                    if m and not m.startswith('t('):
                        if len(m) > 1 and not re.match(r'^[a-z0-9._-]+$', m):
                             all_matches.add(m)
                
                if all_matches:
                    results[file_path] = sorted(list(all_matches))
            except Exception as e:
                pass
                
    return results

if __name__ == "__main__":
    src_dir = r"c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src"
    hardcoded = find_hardcoded_strings(src_dir)
    print(json.dumps(hardcoded, indent=2, ensure_ascii=False))
