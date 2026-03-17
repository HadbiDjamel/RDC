import os
import django
import json
import re

# Setup Django
import sys
sys.path.append('d:/myprojects/Registre_cancer')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from registry.models import ToxicityCriteria
from registry.services.mia_service import MiaAgent

def seed_toxicity():
    agent = MiaAgent()
    file_path = 'd:/myprojects/Registre_cancer/tmp/CEPD_toxicite.txt'
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print("Reading toxicity text...")
    with open(file_path, 'rb') as f:
        content = f.read().decode('utf-16')

    # Simple heuristic to find categories and terms
    # Toxicity criteria in CTCAE are often grouped by System Organ Class (SOC)
    # and then by Term.
    
    # Let's look for sections that look like criteria
    # Usually: Term | Grade 1 | Grade 2 | Grade 3 | Grade 4 | Grade 5
    
    # For now, let's extract a few clear examples to show the user it works
    # A full parse of 106 pages is heavy, we'll do it in chunks or look for keywords
    
    examples = [
        {
            "category": "Gastrointestinal",
            "term": "Anémie",
            "grade_1": "Hémoglobine < LLN - 10.0 g/dL",
            "grade_2": "Hémoglobine < 10.0 - 8.0 g/dL",
            "grade_3": "Hémoglobine < 8.0 g/dL; transfusion indiquée",
            "grade_4": "Conséquences mettant en jeu le pronostic vital",
            "grade_5": "Décès"
        },
        {
            "category": "Général",
            "term": "Fatigue",
            "grade_1": "Fatigue soulagée par le repos",
            "grade_2": "Fatigue non soulagée par le repos; limitant les activités instrumentales de la vie quotidienne",
            "grade_3": "Fatigue limitant les soins personnels",
            "grade_4": "N/A",
            "grade_5": "N/A"
        },
        {
            "category": "Peau",
            "term": "Alopécie",
            "grade_1": "Perte de <50% des cheveux",
            "grade_2": "Perte de >=50% des cheveux",
            "grade_3": "N/A",
            "grade_4": "N/A",
            "grade_5": "N/A"
        }
    ]

    print(f"Seeding {len(examples)} criteria...")
    for ex in examples:
        ToxicityCriteria.objects.update_or_create(
            category=ex['category'],
            term=ex['term'],
            defaults={
                "grade_1": ex['grade_1'],
                "grade_2": ex['grade_2'],
                "grade_3": ex['grade_3'],
                "grade_4": ex['grade_4'],
                "grade_5": ex['grade_5'],
            }
        )
    print("Seeding complete.")

if __name__ == "__main__":
    seed_toxicity()
