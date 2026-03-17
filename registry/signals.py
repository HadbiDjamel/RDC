from django.db.models.signals import post_save
from django.dispatch import receiver
from registry.models import Patient
import logging

logger = logging.getLogger(__name__)

# To prevent infinite recursion if saving within the signal
_MERGE_IN_PROGRESS = set()

@receiver(post_save, sender=Patient)
def trigger_auto_merge(sender, instance, created, **kwargs):
    if instance.patient_id in _MERGE_IN_PROGRESS:
        return
        
    # Only try to merge when a new patient is created
    # or if we explicitly want to check on updates too.
    # For now, we will check on all saves.
    
    _MERGE_IN_PROGRESS.add(instance.patient_id)
    try:
        from registry.utils.auto_merge import find_and_merge_duplicates
        # If merged, instance might be deleted. 
        find_and_merge_duplicates(instance)
    except Exception as e:
        logger.error(f"Auto-merge failed for Patient {instance.patient_id}: {str(e)}")
    finally:
        _MERGE_IN_PROGRESS.discard(instance.patient_id)
