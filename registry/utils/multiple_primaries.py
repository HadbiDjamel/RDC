def is_multiple_primary(existing_tumors, new_tumor):
    """
    IARC/IACR Rules for Multiple Primaries (Simplified).
    Rule 1: Same site (3-digit) and same morphology group = Same Case.
    Rule 2: Different site (3-digit) = Multiple Primary.
    Rule 3: Different morphology group = Multiple Primary.
    """
    for tumor in existing_tumors:
        # Check Site Group (C00-C80)
        same_site = tumor.topo_code[:3] == new_tumor.topo_code[:3]
        
        # Simplified Morphology Groups (e.g., 8000-8009, 8010-8019)
        # In reality, this requires a complex mapping table.
        same_morpho_group = tumor.morpho_code[:3] == new_tumor.morpho_code[:3]
        
        if same_site and same_morpho_group:
            return False # Duplicate/Same Case
            
    return True # New Case
