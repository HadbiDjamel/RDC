def check_sex_site(gender, topo_code):
    """
    Standard IARC: Check if the site is compatible with the patient's sex.
    C60-C63: Male only
    C51-C58: Female only
    """
    if gender == 1: # Masculin
        if topo_code.startswith(('C51', 'C52', 'C53', 'C54', 'C55', 'C56', 'C57', 'C58')):
            return False, "Site incompatible avec le sexe masculin."
    elif gender == 2: # Féminin
        if topo_code.startswith(('C60', 'C61', 'C62', 'C63')):
            return False, "Site incompatible avec le sexe féminin."
    return True, ""

def check_age_site_morpho(age, topo_code, morpho_code):
    """
    Example: Certain morphologies are rare in children.
    """
    # Simplified version for now
    if age < 15 and topo_code.startswith('C61'): # Prostate
        return False, "Cancer de la prostate très rare chez l'enfant."
    return True, ""
