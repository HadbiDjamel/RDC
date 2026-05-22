import re
import json

file_path = r'd:\myprojects\Registre_cancer\tmp\algeria_npm\node_modules\react-algeria-map\src\components\Map\Map.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all groups like <g onClick={() => onWilayaClick("Name", data["Name"])}>
pattern = re.compile(
    r'<g onClick=\{\(\) => onWilayaClick\("([^"]+)",[^}]+\)\}>'
    r'.*?'
    r'<(?:path|polygon)\s+[^>]*?id="([^"]+)"[^>]*?(?:d|points)="([^"]+)"[^>]*?>',
    re.DOTALL
)

wilayas = []

for match in pattern.finditer(content):
    name = match.group(1)
    raw_id = match.group(2)
    path_data = match.group(3)
    
    # Extract the wilaya number from the id or just use an index we will figure out.
    # The ids look like: _x30_1_Adrar or _x31_0_Bouira
    # _x30_ -> 0, _x31_ -> 1, etc.
    num_str = ''
    id_parts = raw_id.split('_')
    if len(id_parts) >= 4 and id_parts[1].startswith('x3'):
        digit1 = int(id_parts[1][2])
        digit2 = id_parts[2]
        num_str = f"{digit1}{digit2}"
        if len(num_str) == 1:
            num_str = "0" + num_str
    
    wilayas.append({
        'id': num_str,
        'name': name,
        'd': path_data.replace('\n', ' ').replace('\t', ' ').replace('\r', '').strip(),
        'is_polygon': 'points="' in match.group(0) # Keep track if it needs conversion to path
    })

# Convert polygon points to SVG path format "M x,y L x,y Z"
for w in wilayas:
    if w['is_polygon']:
        points_str = w['d']
        pairs = [p for p in points_str.split(' ') if ',' in p]
        if pairs:
            path_d = f"M{pairs[0]} " + " ".join([f"L{p}" for p in pairs[1:]]) + " Z"
            w['d'] = path_d

print(f"Extracted {len(wilayas)} wilayas.")

output_path = r'd:\myprojects\Registre_cancer\tmp\algeria_npm\parsed_wilayas.json'
with open(output_path, 'w', encoding='utf-8') as out:
    json.dump(wilayas, out, indent=2, ensure_ascii=False)
