import random
import datetime
from django.core.management.base import BaseCommand
from registry.models import Patient, Tumor, Source, Biomarker, Wilaya, Commune

class Command(BaseCommand):
    help = 'Seeds the database with 50+ comprehensive patient records for enterprise UX demonstration.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Wiping existing DB records...")
        Tumor.objects.all().delete()
        Patient.objects.all().delete()

        wilaya_names = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Setif', 'Tlemcen']
        
        # Ensure Wilayas exist
        wilayas = []
        for i, name in enumerate(wilaya_names, start=1):
            w, _ = Wilaya.objects.get_or_create(code=f"{i:02d}", defaults={'name': name})
            wilayas.append(w)
            
        commune, _ = Commune.objects.get_or_create(code='001', defaults={'name': 'Centre-Ville', 'wilaya': wilayas[0]})
        
        # 1. Standard Patients (Randomized diverse cancer types)
        self.stdout.write("Generating standard patients...")
        for i in range(40):
            gender = random.choice(['1', '2']) # 1: Male, 2: Female
            is_lung = random.random() > 0.5 and gender == '1'
            is_breast = gender == '2' and random.random() > 0.2
            is_prostate = gender == '1' and not is_lung

            topo = 'C34.9' if is_lung else ('C50.9' if is_breast else ('C61.9' if is_prostate else 'C18.9'))
            morpho = '8070/3' if is_lung else ('8500/3' if is_breast else '8140/3')

            last_name = random.choice(['Benali', 'Saidi', 'Mansouri', 'Bouzid', 'Dahmani', 'Kacemi', 'Belaidi'])
            first_name = random.choice(['Mohammed', 'Ahmed', 'Ali', 'Yacine']) if gender == '1' else random.choice(['Fatma', 'Aicha', 'Khadija', 'Aminata'])

            nid = f"{random.randint(10, 48)}{random.randint(10, 99)}{random.randint(10, 12)}{random.randint(100000000, 999999999)}"

            incidence_date = datetime.date(random.randint(2020, 2024), random.randint(1, 12), random.randint(1, 28))
            birth_date = incidence_date.replace(year=incidence_date.year - random.randint(35, 80))

            patient = Patient.objects.create(
                nid=nid,
                last_name=last_name.upper(),
                first_name=first_name.upper(),
                gender=gender,
                birth_date=birth_date,
                wilaya=random.choice(wilayas),
                commune=commune,
                vital_status='A',
            )

            tumor = Tumor.objects.create(
                patient=patient,
                topo_code=topo,
                morpho_code=morpho,
                behaviour='3',
                basis_of_diagnosis='7',
                incidence_date=incidence_date,
                clinical_stage_group=random.choice(['I', 'IIA', 'IIB', 'III', 'IV']),
            )

            Source.objects.create(
                tumor=tumor,
                source_type='CL',
                hospital_name='CHU Mustapha Bacha',
            )

            # Add Biomarkers if relevant
            if is_breast:
                Biomarker.objects.create(tumor=tumor, test_name='ER', percentage=random.choice([0, 10, 50, 90, 100]), result_value='Positif' if random.random() > 0.5 else 'Négatif')
                Biomarker.objects.create(tumor=tumor, test_name='PR', percentage=random.choice([0, 10, 50, 90, 100]), result_value='Positif')
                Biomarker.objects.create(tumor=tumor, test_name='HER2', result_value=random.choice(['0', '1+', '2+', '3+']))
                Biomarker.objects.create(tumor=tumor, test_name='Ki67', percentage=random.choice([5, 15, 30, 60]), result_value='')
            elif is_lung:
                Biomarker.objects.create(tumor=tumor, test_name='EGFR', result_value=random.choice(['Wild-type', 'Exon 19 del', 'L858R', 'T790M']))
                Biomarker.objects.create(tumor=tumor, test_name='ALK', result_value=random.choice(['Negative', 'Positive']))
                Biomarker.objects.create(tumor=tumor, test_name='PD-L1', percentage=random.choice([0, 1, 10, 50, 90]), result_value='')

        # 2. Duplicate Simulation (Triggering Vue Consolidation)
        self.stdout.write("Injecting deliberate duplicates...")
        dup_last = 'BOUDIAF'
        dup_first = 'MOHAMMED'
        dup_dob = datetime.date(1965, 5, 12)
        idx_date = datetime.date(2023, 10, 1)

        w_alger = wilayas[0]
        w_blida = wilayas[4]
        w_oran = wilayas[1]

        Patient.objects.create(
            nid='165051200112233', last_name=dup_last, first_name=dup_first,
            gender='1', birth_date=dup_dob, wilaya=w_alger, commune=commune
        )
        # This will trigger the auto_merge post_save signal immediately because the Soundex + DOB match exactly.
        Patient.objects.create(
            last_name='BOUDIEFF', first_name='MOHAMED', # phonetic variations
            gender='1', birth_date=dup_dob, wilaya=w_blida, commune=commune
        )
        Patient.objects.create(
            last_name=dup_last, first_name=dup_first, # Same name, different wilaya
            gender='1', birth_date=dup_dob, wilaya=w_oran, commune=commune
        )

        # 3. IARC Quality Control Errors (Triggering Validation Queue)
        self.stdout.write("Injecting IARC Validation errors...")
        error_pt = Patient.objects.create(
            nid='999999999999999', last_name='ERROR', first_name='TEST',
            gender='1', # Male
            birth_date=datetime.date(1990, 1, 1),
            wilaya=w_alger, commune=commune
        )
        Tumor.objects.create(
            patient=error_pt,
            topo_code='C53.9', # Cervix Uteri (Female Only) -> Error!
            morpho_code='8070/3',
            behaviour='3',
            incidence_date=datetime.date(2024, 1, 1)
        )

        error_pt2 = Patient.objects.create(
            nid='888888888888888', last_name='CHILD', first_name='TEST',
            gender='2',
            birth_date=datetime.date(2015, 1, 1), # 9 years old
            wilaya=w_alger, commune=commune
        )
        Tumor.objects.create(
            patient=error_pt2,
            topo_code='C61.9', # Prostate (Male Only) + Impossible Age -> Multiple Errors!
            morpho_code='8140/3',
            behaviour='3',
            incidence_date=datetime.date(2024, 1, 1)
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with 40+ standard cases, 2 duplicates, and 2 Validation errors.'))
