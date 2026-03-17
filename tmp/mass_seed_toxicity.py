import os
import django
import re

# Setup Django
import sys
sys.path.append('d:/myprojects/Registre_cancer')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from registry.models import ToxicityCriteria

def mass_seed_toxicity():
    file_path = 'd:/myprojects/Registre_cancer/tmp/CEPD_toxicite.txt'
    if not os.path.exists(file_path):
        print("Text file not found.")
        return

    print("Reading text...")
    with open(file_path, 'rb') as f:
        content = f.read().decode('utf-16')

    # CTCAE Pattern:
    # Category (SOC) usually appears as a header
    # Term | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Grade 5
    
    # This is a complex parse because OCR text is often messy.
    # We'll look for common SOCs and then try to capture terms following them.
    
    socs = [
        "Affections cardiaques", "Affections de l'oreille et du labyrinthe",
        "Affections endocriniennes", "Affections oculaires", 
        "Affections gastro-intestinales", "Troubles gÚnÚraux",
        "Affections hÚpatobiliaires", "Affections du systÚme immunitaire",
        "Infections et infestations", "LÚsions, intoxications et complications",
        "Investigations", "Troubles du mÚtabolisme et de la nutrition",
        "Affections musculosquelettiques", "Tumeurs bÚnignes, malignes",
        "Affections du systÚme nerveux", "Affections de la peau",
        "Affections psychiatriques", "Affections du rein et des voies urinaires",
        "Affections des organes de reproduction", "Affections respiratoires",
        "Affections vasculaires"
    ]

    current_soc = "DIVERS"
    lines = content.split('\n')
    
    extracted_count = 0
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line: continue
        
        # Check if line is a SOC
        found_soc = False
        for soc in socs:
            if soc.lower() in line.lower() and len(line) < len(soc) + 10:
                current_soc = soc
                found_soc = True
                break
        
        if found_soc: continue
        
        # Look for criteria pattern: alphanumeric term followed by grades
        # Simple heuristic: Term usually starts with uppercase and has Grades labeled 1, 2, 3...
        # We'll use a more targeted list of common toxicity terms to ensure quality
        
        common_terms = [
            "Insuffisance cardiaque", "Palpitations", "AnÚmie", "NeutropÚnie", 
            "ThrombocytopÚnie", "DiarrhÚe", "NausÚes", "Vomissements", "Fatigue",
            "FiÞvre", "Douleur", "Anorexie", "HyperglycÚmie", "HypokaliÚmie",
            "CÚphalÚe", "Neuropathie", "AlopÚcie", "Prurit", "Rash", "DyspnÚe", 
            "Toux", "Hypertension", "Hypotension"
        ]
        
        for term in common_terms:
            if term.lower() in line.lower() and len(line) < len(term) + 15:
                # Try to find grades in subsequent lines
                grades = {"1": "LÚger", "2": "ModÚrÚ", "3": "SÚvÞre", "4": "Pronostic vital", "5": "DÚcÞs"}
                
                # Heuristic: look at the next 5-10 lines for "Grade X" or "Grade 1..."
                for j in range(1, 8):
                    if i + j >= len(lines): break
                    next_line = lines[i+j].strip()
                    if not next_line: continue
                    
                    # Capture Grade definitions
                    m = re.search(r'Grade\s*([1-5])\s*:?\s*(.*)', next_line, re.IGNORECASE)
                    if m:
                        grades[m.group(1)] = m.group(2).strip()
                    elif ":" in next_line and any(g in next_line for g in ["Grade 1", "Grade 2", "Grade 3"]):
                         # Alternative format
                         parts = next_line.split(":")
                         if "Grade" in parts[0]:
                             gn = re.search(r'(\d)', parts[0])
                             if gn: grades[gn.group(1)] = parts[1].strip()

                ToxicityCriteria.objects.update_or_create(
                    category=current_soc,
                    term=term,
                    defaults={
                        "grade_1": grades["1"],
                        "grade_2": grades["2"],
                        "grade_3": grades["3"],
                        "grade_4": grades["4"],
                        "grade_5": grades["5"],
                    }
                )
                extracted_count += 1
                break

    print(f"Extraction complete. Added/Updated {extracted_count} criteria across multiple categories.")

if __name__ == "__main__":
    mass_seed_toxicity()
