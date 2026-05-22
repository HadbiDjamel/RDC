import re
import json

file_path = r'd:\myprojects\Registre_cancer\tmp\algeria_npm\node_modules\react-algeria-map\src\components\Map\Map.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

wilayas = []

g_blocks = re.findall(r'<g.*?</g>', content, re.DOTALL)
for block in g_blocks:
    # Get name
    name_match = re.search(r'<title>.*?data\["([^"]+)"\].*?</title>', block)
    if not name_match:
        name_match = re.search(r'onWilayaClick\("([^"]+)"', block)
    if not name_match:
        continue
    name = name_match.group(1).replace('\ufffd', 'e')
    
    # Get id
    id_match = re.search(r'id="([^"]+)"', block)
    raw_id = id_match.group(1) if id_match else ""
    code = ""
    parts = raw_id.split('_')
    if len(parts) >= 3 and parts[1].startswith('x3'):
        code = f"{parts[1][2]}{parts[2]}".zfill(2)
    elif raw_id.isdigit():
        code = raw_id.zfill(2)
    
    # Get graphic info - FIX: use \s before d= to prevent matching id=
    d_match = re.search(r'\sd="([^"]+)"', block)
    points_match = re.search(r'\spoints="([^"]+)"', block)
    
    d_str = ""
    if d_match:
        d_str = d_match.group(1).replace('\n', ' ').replace('\r', '').strip()
    elif points_match:
        from_points = points_match.group(1).replace('\n', ' ').replace('\r', '').strip()
        pairs = [p for p in from_points.split(' ') if ',' in p]
        if pairs:
            d_str = f"M{pairs[0]} " + " ".join([f"L{p}" for p in pairs[1:]]) + " Z"
            
    if code and d_str:
        wilayas.append({
            'id': code,
            'name': name,
            'd': d_str
        })

print(f"Extracted {len(wilayas)} wilayas.")
output_path = r'd:\myprojects\Registre_cancer\tmp\algeria_npm\parsed_wilayas_all.json'
with open(output_path, 'w', encoding='utf-8') as out:
    json.dump(wilayas, out, indent=2, ensure_ascii=False)
