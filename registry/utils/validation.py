import re

class EditCheckManager:
    """
    Implements IARC/IACR standard edit checks.
    Focuses on cross-validation: Sex/Site, Age/Site, Site/Morphology.
    """

    @staticmethod
    def validate_sex_site(gender, topo_code):
        """
        gender: 1(M), 2(F), 9(U)
        topo_code: ICD-O-3 code (e.g., C50.9)
        """
        if not topo_code: return True, None
        
        site = topo_code.split('.')[0] # C50
        
        # Site specific to Females (C51-C58)
        female_sites = [f"C{i}" for i in range(51, 59)]
        # Site specific to Males (C60-C63)
        male_sites = [f"C{i}" for i in range(60, 64)]

        if gender == 1 and site in female_sites:
            return False, f"Incohérence Sexe/Site: Site féminin ({site}) pour un patient masculin."
        if gender == 2 and site in male_sites:
            return False, f"Incohérence Sexe/Site: Site masculin ({site}) pour un patient féminin."
            
        return True, None

    @staticmethod
    def validate_age_site(age, topo_code):
        """
        Basic checks for childhood cancers vs adult cancers.
        """
        if age is None or not topo_code: return True, None
        
        site = topo_code.split('.')[0]
        
        # Example: Nephroblastoma (C64) common in children
        # Example: Prostate (C61) almost never in children (<15)
        if age < 15 and site == 'C61':
            return False, f"Cas Rare: Cancer de la prostate chez un enfant ({age} ans)."
        
        return True, None

    @staticmethod
    def validate_topo_morpho(topo_code, morpho_code):
        """
        Cross-check between site and morphology (e.g. Adenocarcinoma in Bone is rare as primary).
        """
        # This requires a large mapping. For now, we implement a basic placeholder.
        return True, None

    @classmethod
    def run_all_checks(cls, data):
        """
        data: Dict containing patient/tumor info
        """
        errors = []
        warnings = []
        
        # Sex/Site
        valid, msg = cls.validate_sex_site(data.get('gender'), data.get('topo_code'))
        if not valid: errors.append(msg)
        
        # Age/Site
        valid, msg = cls.validate_age_site(data.get('age'), data.get('topo_code'))
        if not valid: warnings.append(msg)
        
        return {"errors": errors, "warnings": warnings}
