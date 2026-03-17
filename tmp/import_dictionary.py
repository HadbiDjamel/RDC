import os
import django
import sys

# Setup Django environment
sys.path.append(r"d:\myprojects\Registre_cancer")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from registry.services.dictionary_service import DictionaryService

success, message = DictionaryService.import_dictionary()
print(f"Success: {success}, Message: {message}")
