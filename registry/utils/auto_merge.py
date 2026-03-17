from registry.models import Patient, PatientRevision, MergedRecord
from registry.serializers import PatientSerializer
from registry.utils.phonetic_search import match_names
import logging

logger = logging.getLogger(__name__)

def create_revision(patient):
    """Create a JSON snapshot of the patient document before merge."""
    serializer = PatientSerializer(patient)
    revision = PatientRevision.objects.create(
        patient_nid=patient.nid,
        snapshot_data=serializer.data,
        created_by="Auto-Merge Engine"
    )
    return revision

def merge_patients(patient_a, patient_b, confidence):
    """
    Merge patient_b into patient_a.
    patient_b will be physically deleted, but a MergedRecord is created linking
    the surviving patient_a to the snapshots of both documents.
    """
    logger.info(f"Auto-merging {patient_b.nid} into {patient_a.nid} ({confidence})")
    
    # 1. Create snapshots BEFORE modifying anything
    rev_a = create_revision(patient_a)
    rev_b = create_revision(patient_b)

    # 2. Reassign all related objects from B to A (Tumors, MedicalHistory, Pharmacovigilance)
    # Using update() directly on the querysets
    patient_b.tumors.all().update(patient=patient_a)
    patient_b.medical_history.all().update(patient=patient_a)
    patient_b.side_effects.all().update(patient=patient_a)

    # 3. Create the audit trail record
    MergedRecord.objects.create(
        surviving_patient=patient_a,
        document_a_snapshot=rev_a,
        document_b_snapshot=rev_b,
        match_confidence=confidence,
    )

    # 4. Physically delete the duplicate patient_b
    patient_b.delete()
    
    # 5. Save patient_a to ensure any last_modified fields update
    # Use update_fields if available, or signal guards to avoid recursion.
    patient_a.save()

def find_and_merge_duplicates(new_patient):
    """
    Looks for duplicates for the newly saved/updated patient.
    """
    candidates = Patient.objects.exclude(patient_id=new_patient.patient_id)

    # Check 1: NID match (Exact Confidence)
    if new_patient.nid:
        exact_match = candidates.filter(nid=new_patient.nid).first()
        if exact_match:
            merge_patients(exact_match, new_patient, "Exact Match (NID)")
            return True

    # Check 2: Exact DOB and Soundex match (High Confidence)
    if new_patient.birth_date and new_patient.first_name and new_patient.last_name:
        dob_matches = candidates.filter(birth_date=new_patient.birth_date)
        for match in dob_matches:
            if match.first_name and match.last_name:
                if match_names(new_patient.first_name, match.first_name) and match_names(new_patient.last_name, match.last_name):
                    merge_patients(match, new_patient, "High (DOB + Soundex Name)")
                    return True
                    
    return False
