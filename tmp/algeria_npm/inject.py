import json
import re

json_path = r'd:\myprojects\Registre_cancer\tmp\algeria_npm\parsed_wilayas_all.json'
tsx_path = r'd:\myprojects\Registre_cancer\frontend\src\components\AlgeriaMap.tsx'

with open(json_path, 'r', encoding='utf-8') as f:
    wilayas = json.load(f)

# generate typescript code for WILAYA_PATHS
ts_array = "const WILAYA_PATHS: WilayaPath[] = [\n"
for w in wilayas:
    d_clean = w['d']
    name_clean = w['name'].replace('\ufffd', 'e') # simplistic fix for encoding issues from the log if any
    ts_array += f'    {{ id: "{w["id"]}", name: "{name_clean}", d: "{d_clean}" }},\n'
ts_array += "];"

with open(tsx_path, 'r', encoding='utf-8') as f:
    tsx_content = f.read()

# Replace the array
tsx_content = re.sub(
    r'const WILAYA_PATHS: WilayaPath\[\] = \[.*?\];',
    ts_array,
    tsx_content,
    flags=re.DOTALL
)

# Update viewBox
tsx_content = re.sub(
    r'viewBox="0 0 1000 1000"',
    r'viewBox="-248.385 -239.386 982.451 955.452"',
    tsx_content
)

# Write back
with open(tsx_path, 'w', encoding='utf-8') as f:
    f.write(tsx_content)

print("Updated AlgeriaMap.tsx with true paths.")
