import re

def normalize_name(name):
    """
    Remove accents, spaces, and special characters.
    """
    name = name.upper().strip()
    name = re.sub(r'[ÉÈÊË]', 'E', name)
    name = re.sub(r'[ÀÂÄ]', 'A', name)
    name = re.sub(r'[ÎÏ]', 'I', name)
    name = re.sub(r'[ÔÖ]', 'O', name)
    name = re.sub(r'[ÛÜ]', 'U', name)
    name = re.sub(r'[^A-Z]', '', name)
    return name

def soundex_fr(name):
    """
    Simple Soundex for French/Algerian Frenchized names.
    (Simplified implementation)
    """
    name = normalize_name(name)
    if not name: return ""
    
    codes = {"B": "1", "P": "1", "F": "2", "V": "2", "C": "3", "S": "3", "K": "3", "Q": "3", "J": "4", "G": "4", "L": "5", "M": "6", "N": "6", "R": "7"}
    
    res = name[0]
    for char in name[1:]:
        code = codes.get(char, "0")
        if code != "0" and code != res[-1]:
            res += code
            
    return res[:4].ljust(4, "0")

def match_names(name1, name2):
    """
    Compare two names using phonetic normalization.
    """
    return soundex_fr(name1) == soundex_fr(name2)
