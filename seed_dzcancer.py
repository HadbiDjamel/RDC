import os
import django
import random
import uuid
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from registry.models import (
    Patient, Tumor, Wilaya, Commune, IcdO3, UserProfile, 
    HabitQuestionnaire, MedicalHistory, Source, Biomarker
)

def clear_db():
    print("🧹 Emptying database...")
    User.objects.exclude(is_superuser=True).delete()
    Patient.objects.all().delete()
    # (Cascading deletes should handle tumors, history etc.)
    print("✅ Database cleared.")

def seed_essentials():
    print("🌱 Seeding essential metadata...")
    # Wilayas
    wilayas_data = {
        '01': 'Adrar', '02': 'Chlef', '03': 'Laghouat', '04': 'Oum El Bouaghi', '05': 'Batna',
        '06': 'Béjaïa', '07': 'Biskra', '08': 'Béchar', '09': 'Blida', '10': 'Bouira',
        '11': 'Tamanrasset', '12': 'Tébessa', '13': 'Tlemcen', '14': 'Tiaret', '15': 'Tizi Ouzou',
        '16': 'Alger', '17': 'Djelfa', '18': 'Jijel', '19': 'Sétif', '20': 'Saïda',
        '21': 'Skikda', '22': 'Sidi Bel Abbès', '23': 'Annaba', '24': 'Guelma', '25': 'Constantine',
        '26': 'Médéa', '27': 'Mostaganem', '28': 'M\'Sila', '29': 'Mascara', '30': 'Ouargla',
        '31': 'Oran', '32': 'El Bayadh', '33': 'Illizi', '34': 'Bordj Bou Arreridj', '35': 'Boumerdès',
        '36': 'El Tarf', '37': 'Tindouf', '38': 'Tissemsilt', '39': 'El Oued', '40': 'Khenchela',
        '41': 'Souk Ahras', '42': 'Tipaza', '43': 'Mila', '44': 'Aïn Defla', '45': 'Naâma',
        '46': 'Aïn Témouchent', '47': 'Ghardaïa', '48': 'Relizane', '49': 'Timimoun', '50': 'Bordj Badji Mokhtar',
        '51': 'Ouled Djellal', '52': 'Béni Abbès', '53': 'In Salah', '54': 'In Guezzam', '55': 'Touggourt',
        '56': 'Djanet', '57': 'El M\'Ghair', '58': 'El Meniaa'
    }
    for code, name in wilayas_data.items():
        Wilaya.objects.get_or_create(code=code, defaults={'name': name})
    
    # Simple IcdO3 subsets
    icd_data = [
        ('C34.1', 'Poumon, lobe supérieur', 'topography'),
        ('C50.9', 'Sein, SAI', 'topography'),
        ('C18.9', 'Côlon, SAI', 'topography'),
        ('C20.9', 'Rectum, SAI', 'topography'),
        ('C61.9', 'Prostate', 'topography'),
        ('8070/3', 'Carcinome épidermoïde', 'morphology'),
        ('8140/3', 'Adénocarcinome', 'morphology'),
    ]
    for code, desc, t in icd_data:
        IcdO3.objects.get_or_create(code=code, defaults={'description_fr': desc, 'type': t})
    print("✅ Metadata seeded.")

def create_users():
    print("👥 Creating role-based users...")
    roles = [
        ('admin', 'Registraire', 'ADMIN'),
        ('dr_ahmed', 'Ahmed', 'DOCTOR'),
        ('pr_belka', 'Belkacem', 'ANAPATH'),
        ('lab_mana', 'Mansouri', 'LAB'),
    ]
    for uname, last, role in roles:
        user, created = User.objects.get_or_create(username=uname, defaults={
            'first_name': 'Système',
            'last_name': last,
            'email': f'{uname}@dzcancer.dz',
            'is_staff': (role == 'ADMIN')
        })
        if created:
            user.set_password('admin123')
            user.save()
            UserProfile.objects.create(user=user, role=role, institution="Hôpital Central d'Alger")
    print("✅ Users ready.")

def generate_bulk_data(count=1000):
    print(f"🧬 Generating {count} patients and tumors...")
    first_names = ["Mohammed", "Fatma", "Amina", "Yacine", "Karim", "Zahra", "Omar", "Linda", "Rachid", "Sonia"]
    last_names = ["Boudiaf", "Belaidi", "Kacemi", "Zitouni", "Amrani", "Hadjadj", "Mansouri", "Bouzid", "Lalami", "Saidi"]
    
    wilayas = list(Wilaya.objects.all())
    
    patients_to_create = []
    
    for i in range(count):
        fname = random.choice(first_names)
        lname = random.choice(last_names)
        
        # Inject duplicates (10% chance)
        if i > 0 and random.random() < 0.1:
            prev = patients_to_create[random.randint(0, len(patients_to_create)-1)]
            fname = prev.first_name
            lname = prev.last_name
            # Same name, different NID (simulation of duplication)
            nid = "".join([str(random.randint(0, 9)) for _ in range(18)])
        else:
            nid = "".join([str(random.randint(0, 9)) for _ in range(18)])

        p = Patient(
            first_name=fname,
            last_name=lname,
            nid=nid,
            gender=random.choice([1, 2]),
            birth_date=f"{random.randint(1,28):02d}/{random.randint(1,12):02d}/{random.randint(1940, 2010)}",
            wilaya=random.choice(wilayas),
            registration_number=f"2026-{10000+i}",
            workflow=random.choice(['clinique', 'anapath', 'valide'])
        )
        patients_to_create.append(p)

    Patient.objects.bulk_create(patients_to_create)
    
    # Now create tumors for them
    all_patients = Patient.objects.all()
    tumors_to_create = []
    topos = ['C34.1', 'C50.9', 'C18.9', 'C61.9']
    
    for p in all_patients:
        t = Tumor(
            patient=p,
            incidence_date=f"{random.randint(1,28):02d}/{random.randint(1,12):02d}/{random.randint(2015, 2026)}",
            topo_code=random.choice(topos),
            morpho_code="8140/3",
            behaviour='3',
            basis_of_diagnosis=random.choice(['1', '5', '7'])
        )
        tumors_to_create.append(t)
    
    Tumor.objects.bulk_create(tumors_to_create)
    
    # Query newly created tumors to assign Sources & Biomarkers
    all_tumors = Tumor.objects.all()
    sources_to_create = []
    biomarkers_to_create = []
    
    practitioners = ['Dr. Benallal', 'Dr. Meziane', 'Pr. Khelil', 'Dr. Othmani', 'Pr. Amara']
    hospitals = ["Hôpital Mustapha Pacha", "CHU Bab El Oued", "EHS Pierre et Marie Curie", "CAC Constantine", "CHU Oran"]
    departments = ["Anatomie Pathologique", "Oncologie Médicale", "Chirurgie Oncologique", "Sénologie"]
    
    for t in all_tumors:
        # Seed Source (60% chance)
        if random.random() < 0.6:
            stype = random.choice(['HP', 'CY', 'CL', 'IM'])
            source = Source(
                tumor=t,
                source_type=stype,
                source_description=f"Rapport médical d'oncologie pour {t.patient.last_name}",
                hospital_code=f"HOSP-{random.randint(10,99)}",
                hospital_name=random.choice(hospitals),
                department=random.choice(departments),
                report_number=f"REP-{random.randint(1000, 9999)}",
                date_of_report=f"{random.randint(1,28):02d}/{random.randint(1,12):02d}/2026",
                practitioner_name=random.choice(practitioners),
                reader_id=f"AGENT-{random.randint(10,99)}",
                clinical_text=f"Suspicion de tumeur maligne au niveau du tissu {t.topo_code}.",
                pathology_text=f"Examen histopathologique montrant des cellules d'un adénocarcinome de grade {t.grade}."
            )
            sources_to_create.append(source)
            
        # Seed Biomarkers based on cancer type
        if t.topo_code == 'C50.9':  # Breast Cancer (Sein)
            biomarkers_to_create.append(Biomarker(tumor=t, test_name='HER2', result_value=random.choice(['Négatif', '1+', '2+', '3+']), percentage=None))
            er_percent = random.randint(0, 100)
            biomarkers_to_create.append(Biomarker(tumor=t, test_name='ER', result_value='Positif' if er_percent > 10 else 'Négatif', percentage=er_percent))
            pr_percent = random.randint(0, 100)
            biomarkers_to_create.append(Biomarker(tumor=t, test_name='PR', result_value='Positif' if pr_percent > 15 else 'Négatif', percentage=pr_percent))
            ki_percent = random.randint(5, 95)
            biomarkers_to_create.append(Biomarker(tumor=t, test_name='Ki67', result_value=f"{ki_percent}%", percentage=ki_percent))
            
        elif t.topo_code == 'C34.1':  # Lung Cancer (Poumon)
            biomarkers_to_create.append(Biomarker(tumor=t, test_name='EGFR', result_value=random.choice(['Muté', 'Non muté', 'Inconnu']), percentage=None))
            biomarkers_to_create.append(Biomarker(tumor=t, test_name='ALK', result_value=random.choice(['Positif', 'Négatif']), percentage=None))
            biomarkers_to_create.append(Biomarker(tumor=t, test_name='BRAF', result_value=random.choice(['Muté', 'Non muté']), percentage=None))
            pdl1_percent = random.randint(0, 100)
            biomarkers_to_create.append(Biomarker(tumor=t, test_name='PD-L1', result_value='Positif' if pdl1_percent > 1 else 'Négatif', percentage=pdl1_percent))

    if sources_to_create:
        Source.objects.bulk_create(sources_to_create)
    if biomarkers_to_create:
        Biomarker.objects.bulk_create(biomarkers_to_create)
        
    print(f"✅ Created {count} patients, {len(tumors_to_create)} associated tumors, {len(sources_to_create)} sources, and {len(biomarkers_to_create)} biomarkers.")

if __name__ == "__main__":
    clear_db()
    seed_essentials()
    create_users()
    generate_bulk_data(1000) # Start with 1000 for safety, can be increased
    print("🚀 Seeding Complete!")
