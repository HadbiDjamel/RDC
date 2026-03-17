import os
import re
from registry.models import MedicalDictionary, ToxicityCriteria

class DictionaryService:
    DICTIONARY_PATH = r"d:\myprojects\Registre_cancer\some stuff\dictionnaire"
    
    SECTION_MAP = {
        '0': 'ETAT',
        '1': 'CTRL',
        '2': 'DBL',
        '3': 'TOPO',
        '4': 'SEXE', # Added as I saw it in the file
        '5': 'VITAL',
        '6': 'BASIS',
        '7': 'LATERAL',
        '8': 'TREAT',
        '12': 'SUIVI',
        '13': 'CAUSE',
        '14': 'PLACE',
        '15': 'ENQ',
        '16': 'LAB',
        '17': 'SERV'
    }

    @classmethod
    def import_dictionary(cls):
        if not os.path.exists(cls.DICTIONARY_PATH):
            return False, "File not found"
        
        count = 0
        current_section = None
        
        with open(cls.DICTIONARY_PATH, 'r', encoding='latin-1') as f:
            for line in f:
                line = line.strip()
                if not line: continue
                
                # Check for section header: #N ----Name
                if line.startswith('#'):
                    match = re.search(r'#(\d+)', line)
                    if match:
                        section_id = match.group(1)
                        current_section = cls.SECTION_MAP.get(section_id)
                        continue
                
                if current_section and not line.startswith('#'):
                    # Parse code and label: "CODE   LABEL"
                    # Usually formatted as "01      LEVRE" or "0       En cours"
                    parts = re.split(r'\s{2,}', line)
                    if len(parts) >= 2:
                        code = parts[0].strip()
                        label = parts[1].strip()
                        description = parts[2].strip() if len(parts) > 2 else ""
                        
                        MedicalDictionary.objects.update_or_create(
                            section=current_section,
                            code=code,
                            defaults={'label': label, 'description': description}
                        )
                        count += 1
        
        return True, f"Imported {count} entries successfully."

    @classmethod
    def import_toxicity_from_text(cls, text_content, category="General"):
        """
        Rudimentary parser for toxicity text. 
        Expects some structure but handles the messy OCR output.
        """
        # This is a placeholder for a more sophisticated LLM-based parser
        # For now, we'll try to find Grade patterns
        lines = text_content.split('\n')
        count = 0
        # Very simple heuristic: Look for lines that might be terms
        # and subsequent lines for grades.
        # REAL implementation would use MIA to structure this.
        return True, "Toxicity import requires manual structuring or MIA assistance."
