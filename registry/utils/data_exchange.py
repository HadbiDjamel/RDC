import pandas as pd
from .models import Patient, Tumor

def export_to_seer(queryset):
    """
    Export Tumor data to SEER*Stat compatible format.
    """
    data = []
    for tumor in queryset:
        patient = tumor.patient
        data.append({
            'Patient ID': patient.id,
            'NID': patient.nid,
            'Gender': patient.gender,
            'Birth Date': patient.birth_date,
            'Incidence Date': tumor.incidence_date,
            'Topo': tumor.topo_code,
            'Morpho': tumor.morpho_code,
            'Behavior': tumor.behavior,
            'Grade': tumor.grade,
            'Basis': tumor.basis_of_diagnosis
        })
    
    df = pd.DataFrame(data)
    # Mapping for SEER*Stat would go here
    return df

def export_to_iarc(queryset):
    """
    Export to IARCcrgTools (Fixed width or CSV).
    """
    df = export_to_seer(queryset)
    # IARC specific formatting
    return df
