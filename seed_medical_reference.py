import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from registry.models import MedicalDictionary, ToxicityCriteria

def seed_complete_reference():
    print("📚 Seeding COMPLETE Medical Dictionary & Toxicity Criteria...")
    
    MedicalDictionary.objects.all().delete()
    ToxicityCriteria.objects.all().delete()

    dict_data = [
        # Topographies
        ('TOPO', 'C00', 'Lèvre', 'Tumeurs malignes de la lèvre.'),
        ('TOPO', 'C15', 'Œsophage', 'Tumeurs malignes de l\'œsophage.'),
        ('TOPO', 'C16', 'Estomac', 'Tumeurs malignes de l\'estomac.'),
        ('TOPO', 'C18', 'Côlon', 'Tumeurs malignes du côlon.'),
        ('TOPO', 'C20', 'Rectum', 'Tumeurs malignes du rectum.'),
        ('TOPO', 'C22', 'Foie et voies biliaires intrahépatiques', 'Carcinome hépatocellulaire, etc.'),
        ('TOPO', 'C25', 'Pancréas', 'Tumeurs malignes du pancréas.'),
        ('TOPO', 'C34', 'Bronches et poumon', 'Cancers bronchopulmonaires.'),
        ('TOPO', 'C43', 'Mélanome malin de la peau', 'Mélanomes cutanés.'),
        ('TOPO', 'C50', 'Sein', 'Tumeurs malignes du sein, tous quadrants.'),
        ('TOPO', 'C53', 'Col de l\'utérus', 'Cancers cervicaux.'),
        ('TOPO', 'C54', 'Corps de l\'utérus', 'Cancers de l\'endomètre.'),
        ('TOPO', 'C56', 'Ovaire', 'Tumeurs malignes de l\'ovaire.'),
        ('TOPO', 'C61', 'Prostate', 'Cancers prostatiques.'),
        ('TOPO', 'C64', 'Rein', 'Hors bassinet.'),
        ('TOPO', 'C67', 'Vessie', 'Tumeurs malignes de la vessie.'),
        ('TOPO', 'C71', 'Encéphale', 'Tumeurs cérébrales malignes.'),
        ('TOPO', 'C73', 'Glande thyroïde', 'Cancers thyroïdiens.'),
        ('TOPO', 'C81', 'Maladie de Hodgkin', 'Lymphomes hodgkiniens.'),
        ('TOPO', 'C82', 'Lymphome non hodgkinien folliculaire', 'LNH.'),
        ('TOPO', 'C91', 'Leucémie lymphoïde', 'LLC, LLA.'),
        ('TOPO', 'C92', 'Leucémie myéloïde', 'LMC, LMA.'),
        
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
        ('LAB', '03C', 'Centre Pierre et Marie Curie (CPMC)', 'Alger'),
        ('LAB', '04D', 'Laboratoire Privé d\'Anatomopathologie', 'Constantine'),
    ]

    for section, code, label, desc in dict_data:
        MedicalDictionary.objects.create(
            section=section, 
            code=code, 
            label=label, 
            description=desc
        )

    tox_data = [
        ('Gastro-Intestinal', 'Nausées', 
         'Nausée légère. Perte d\'appétit sans altération des habitudes alimentaires.', 
         'Prise orale altérée sans perte de poids ni déshydratation significative.', 
         'Déshydratation sévère ou malnutrition nécessitant soutien tubaire ou IV.', 
         'Conséquences engageant le pronostic vital.', 
         'Décès'),
        ('Gastro-Intestinal', 'Vomissements',
         '1 à 2 épisodes en 24h.',
         '3 à 5 épisodes en 24h.',
         '>= 6 épisodes en 24h; recours à NPT ou hospitalisation.',
         'Conséquences engageant le pronostic vital.',
         'Décès'),
        ('Gastro-Intestinal', 'Diarrhée',
         'Augmentation de <4 selles/jour par rapport à la base.',
         'Augmentation de 4-6 selles/jour par rapport à la base.',
         'Augmentation de >=7 selles/jour; incontinence; hospitalisation.',
         'Menace vitale (ex. collapsus hémodynamique).',
         'Décès'),
        ('Hématologique', 'Neutropénie',
         'PNN < LLN - 1500/mm3',
         'PNN < 1500 - 1000/mm3',
         'PNN < 1000 - 500/mm3',
         'PNN < 500/mm3',
         'Décès'),
        ('Hématologique', 'Anémie',
         'Hb < LLN - 10.0 g/dL',
         'Hb < 10.0 - 8.0 g/dL',
         'Hb < 8.0 g/dL; transfusion recommandée',
         'Conséquences engageant le pronostic vital.',
         'Décès'),
        ('Hématologique', 'Thrombopénie',
         'Plaquettes < LLN - 75,000/mm3',
         'Plaquettes < 75,000 - 50,000/mm3',
         'Plaquettes < 50,000 - 25,000/mm3',
         'Plaquettes < 25,000/mm3',
         'Décès'),
        ('Cardiologique', 'Hypertension Artérielle',
         'HTA asymptomatique nécessitant aucune intervention.',
         'HTA modérée, symptomatologie légère, nécessitant une monothérapie.',
         'HTA sévère, plusieurs médicaments prescrits.',
         'Crise hypertensive menaçant le pronostic vital.',
         'Décès'),
        ('Neurologique', 'Neuropathie Périphérique (Sensorielle)',
         'Asymptomatique; perte des réflexes ou paresthésie.',
         'Symptômes modérés; altérant la fonction instrumentale de l\'AVQ.',
         'Symptômes sévères; altérant la fonction de l\'AVQ autonome.',
         'Menace vitale; paralysie ou défaillance fonctionnelle.',
         'Décès'),
        ('Général', 'Fatigue / Asthénie',
         'Fatigue soulagée par le repos.',
         'Fatigue non soulagée par le repos, altérant les AVQ instrumentales.',
         'Fatigue sévère altérant l\'autonomie pour les AVQ de base.',
         'N/A',
         'N/A'),
        ('Dermatologique', 'Alopécie',
         'Perte de cheveux <50% normale pour le patient.',
         'Perte de cheveux >=50% normale; impact psychosocial.',
         'N/A',
         'N/A',
         'N/A')
    ]

    for cat, term, g1, g2, g3, g4, g5 in tox_data:
        ToxicityCriteria.objects.create(
            category=cat,
            term=term,
            grade_1=g1, grade_2=g2, grade_3=g3, grade_4=g4, grade_5=g5
        )

    print(f"✅ Created {len(dict_data)} dictionary items and {len(tox_data)} CTCAE criteria.")

if __name__ == '__main__':
    seed_complete_reference()
