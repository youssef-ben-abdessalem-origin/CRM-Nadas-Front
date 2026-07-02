import json

with open(r'c:\Users\The Ice Flame\Desktop\_Pending\CRM_NADAS\front\src\locales\en.json', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to detect duplicates before json.loads() which would just overwrite
from collections import Counter
import re

keys = re.findall(r'^  "([^"]+)": \{', content, re.MULTILINE)
duplicates = [k for k, v in Counter(keys).items() if v > 1]
print(f"Duplicate keys: {duplicates}")
