import xml.etree.ElementTree as ET
import re
import json

file_path = r'd:\myprojects\Registre_cancer\tmp\algeria_npm\node_modules\react-algeria-map\src\components\Map\Map.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract just the <svg>...</svg> portion
svg_match = re.search(r'(<svg.*?</svg>)', content, re.DOTALL)
svg_content = svg_match.group(1) if svg_match else ""

# Remove {data["xyz"] ?? ""} which breaks XML parsing
svg_content = re.sub(r'\{data\["[^"]+"\] \?\? ""\}', 'Dummy Name', svg_content)
svg_content = re.sub(r'onClick=\{[^}]+\}', '', svg_content)

# Add dummy root just in case
svg_content = f"<?xml version='1.0' encoding='utf-8'?><root>{svg_content}</root>"

root = ET.fromstring(svg_content)
svg = root.find('svg')

wilayas = []

for g in svg.findall('.//g'):
    name = "Unknown"
    title = g.find('title')
    if title is not None:
        name = title.text
        
    path = g.find('path')
    polygon = g.find('polygon')
    
    code = ""
    d_str = ""
    
    node = path if path is not None else polygon
    if node is not None:
        raw_id = node.attrib.get('id', '')
        
        # Derive code
        parts = raw_id.split('_')
        if len(parts) >= 3 and parts[1].startswith('x3'):
            digit1 = parts[1][2]
            digit2 = parts[2]
            code = f"{digit1}{digit2}".zfill(2)
        elif raw_id.isdigit():
            code = raw_id.zfill(2)
            
        if 'd' in node.attrib:
            d_str = node.attrib['d'].replace('\n', ' ').strip()
        elif 'points' in node.attrib:
            from_points = node.attrib['points'].replace('\n', ' ').strip()
            pairs = [p for p in from_points.split(' ') if ',' in p]
            if pairs:
                d_str = f"M{pairs[0]} " + " ".join([f"L{p}" for p in pairs[1:]]) + " Z"
                
    if code and d_str:
        wilayas.append({
            'id': code,
            'name': name.replace('\ufffd', 'e'),
            'd': d_str
        })
        
print(f"Extracted {len(wilayas)} wilayas using ElementTree.")

output_path = r'd:\myprojects\Registre_cancer\tmp\algeria_npm\parsed_wilayas_et.json'
with open(output_path, 'w', encoding='utf-8') as out:
    json.dump(wilayas, out, indent=2, ensure_ascii=False)
