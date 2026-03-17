from django.db import models
import re

class PartialDateField(models.CharField):
    """
    IARC Standard: 99/99/YYYY
    Stored as string to allow '99' for unknown day/month.
    Format: DD/MM/YYYY
    """
    description = "A date field that allows unknown day or month (99)"

    def __init__(self, *args, **kwargs):
        kwargs['max_length'] = 10
        super().__init__(*args, **kwargs)

    def validate(self, value, model_instance):
        super().validate(value, model_instance)
        if value and not re.match(r'^(0[1-9]|[12][0-9]|3[01]|99)/(0[1-9]|1[0-2]|99)/\d{4}$', value):
            from django.core.exceptions import ValidationError
            raise ValidationError("Format invalide. Utilisez DD/MM/YYYY avec 99 pour les inconnus.")
