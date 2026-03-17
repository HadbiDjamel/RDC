import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Registre_cancer.settings')
django.setup()

from registry.models import MedicalDictionary, ToxicityCriteria

def seed_medical_reference():
    print("📚 Seeding Medical Dictionary & Toxicity Criteria...")
    
    dict_data = [
        # Diagnosis Basis
        ('BASIS', '0', 'DC Seulement', 'Diagnostiqué uniquement à partir du certificat de décès.'),
        ('BASIS', '1', 'Clinique', 'Diagnostic reposant sur l\'examen clinique seul (sans radio ni biologie).'),
        ('BASIS', '2', 'Examen Clinique Spécialisé', 'Examens d\'imagerie, endoscopie, échographie.'),
        ('BASIS', '4', 'Marqueurs Tumoraux', 'Biologie / Marqueurs biochimiques ou immunologiques spécifiques.'),
        ('BASIS', '5', 'Cytologie', 'Frottis, ponction à l\'aiguille fine, sédiments.'),
        ('BASIS', '7', 'Histologie T. Primitive', 'Biopsie, pièce opératoire de la tumeur primitive.'),
        ('BASIS', '9', 'Inconnu', 'Non précisé dans le dossier clinique.'),
        # Vital Status
        ('ETAT', '1', 'Vivant', 'Le patient est toujours en vie au dernier suivi.'),
        ('ETAT', '2', 'Décédé du Cancer', 'Décès directement attribué à la tumeur enregistrée.'),
        ('ETAT', '3', 'Décédé Autre Cause', 'Décès dû à une autre cause (accident, autre maladie).'),
        ('ETAT', '9', 'Perdu de Vue', 'Impossible de déterminer le statut d\'évolution.'),
        # Labs
        ('LAB', '01A', 'Laboratoire Central Anapath', 'Hôpital Mustapha Bacha, Alger'),
        ('LAB', '02B', 'Laboratoire d\'Oncologie', 'CHU Oran'),
    ]

    for section, code, label, desc in dict_data:
        MedicalDictionary.objects.update_or_create(
            section=section, 
            code=code, 
            defaults={'label': label, 'description': desc}
        )

    tox_data = [
        ('Gastro-Intestinal', 'Nausées', 
         'Nausée légère. Perte d\'appétit sans altération des habitudes alimentaires.', 
         'Prise orale altérée sans perte de poids ni déshydratation significative.', 
         'Déshydratation sévère ou malnutrition nécessitant soutien tubaire ou IV.', 
         'Conséquences engageant le pronostic vital.', 
         'Décès'),
        ('Hématologique', 'Neutropénie',
         'PNN < LLN - 1500/mm3',
         'PNN < 1500 - 1000/mm3',
         'PNN < 1000 - 500/mm3',
         'PNN < 500/mm3',
         'Décès'),
        ('Cardiologique', 'Hypertension Artérielle',
         'HTA asymptomatique nécessitant aucune intervention.',
         'HTA modérée, symptomatologie légère, nécessitant une monothérapie.',
         'HTA sévère, plusieurs médicaments prescrits.',
         'Crise hypertensive menaçant le pronostic vital (ex. AVC associé).',
         'Décès')
    ]

    for cat, term, g1, g2, g3, g4, g5 in tox_data:
        ToxicityCriteria.objects.update_or_create(
            category=cat,
            term=term,
            defaults={
                'grade_1': g1, 'grade_2': g2, 'grade_3': g3, 'grade_4': g4, 'grade_5': g5
            }
        )

    print(f"✅ Created {len(dict_data)} dictionary items and {len(tox_data)} CTCAE criteria.")

if __name__ == '__main__':
    seed_medical_reference()
