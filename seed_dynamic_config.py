import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from registry.models import DynamicFormConfig

def seed_configs():
    fields = [
        # PatientForm
        ('PatientForm', 'middle_name', 'Deuxième Prénom', False, True),
        ('PatientForm', 'maiden_name', 'Nom de Jeune Fille', False, True),
        ('PatientForm', 'phone_number', 'Numéro de Téléphone', False, True),
        ('PatientForm', 'email', 'Adresse Email', False, True),
        ('PatientForm', 'address_line_2', 'Complément d\'Adresse', False, True),
        ('PatientForm', 'social_security_num', 'N° Sécurité Sociale', False, True),
        
        # TumorForm
        ('TumorForm', 'laterality', 'Latéralité', True, True),
        ('TumorForm', 'grade', 'Grade', False, True),
        ('TumorForm', 'stage_t', 'Stade T', False, True),
        ('TumorForm', 'stage_n', 'Stade N', False, True),
        ('TumorForm', 'stage_m', 'Stade M', False, True),
    ]
    
    for form, fid, label, req, vis in fields:
        DynamicFormConfig.objects.get_or_create(
            form_name=form,
            field_id=fid,
            defaults={'label': label, 'is_required': req, 'is_visible': vis}
        )
    print(f"Seeded {len(fields)} dynamic field configurations.")

if __name__ == '__main__':
    seed_configs()
