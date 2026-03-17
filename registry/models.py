from django.db import models # type: ignore
from django.contrib.auth.models import User # type: ignore
import uuid



class Wilaya(models.Model):
    code = models.CharField(max_length=2, primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Commune(models.Model):
    wilaya = models.ForeignKey(Wilaya, on_delete=models.CASCADE, related_name='communes')
    code = models.CharField(max_length=5, primary_key=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class IcdO3(models.Model):
    TYPE_CHOICES = [('topography', 'Topography'), ('morphology', 'Morphology')]
    code = models.CharField(max_length=10, unique=True)
    description_fr = models.TextField()
    description_ar = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    def __str__(self):
        return f"{self.code} - {self.description_fr}"


class Icd10(models.Model):
    code = models.CharField(max_length=10, unique=True)
    description_fr = models.TextField()
    description_ar = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.code} - {self.description_fr}"


# ═══════════════════════════════════════════════════════════════════════════
# PATIENT TABLE — CanReg5 Complete Specification
# ═══════════════════════════════════════════════════════════════════════════
class Patient(models.Model):
    GENDER_CHOICES = [(1, 'Masculin'), (2, 'Féminin'), (9, 'Inconnu')]
    VITAL_STATUS = [('A', 'Vivant'), ('D', 'Décédé'), ('U', 'Inconnu')]

    # ── Core Identity ─────────────────────────────────────────────────
    patient_id = models.AutoField(primary_key=True)
    registration_number = models.CharField(max_length=20, unique=True, blank=True, null=True,
                                           help_text="Numéro d'enregistrement du registre")
    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom de famille")
    maiden_name = models.CharField(max_length=100, blank=True, null=True, verbose_name="Nom de jeune fille")
    gender = models.IntegerField(choices=GENDER_CHOICES, default=9, verbose_name="Sexe")
    birth_date = models.CharField(max_length=10, verbose_name="Date de naissance",
                                  help_text="DD/MM/YYYY (99 = inconnu)")

    # ── National Identifiers ──────────────────────────────────────────
    nid = models.CharField(max_length=18, unique=True, null=True, blank=True,
                           verbose_name="NID (Identifiant National)")
    passport_number = models.CharField(max_length=20, blank=True, null=True)
    social_security_number = models.CharField(max_length=20, blank=True, null=True,
                                              verbose_name="N° Sécurité Sociale")

    # ── Contact & Demographics ────────────────────────────────────────
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Téléphone")
    nationality = models.CharField(max_length=50, default='Algérienne', verbose_name="Nationalité")
    ethnicity = models.CharField(max_length=50, blank=True, null=True, verbose_name="Ethnie/Groupe")
    marital_status = models.CharField(max_length=1, blank=True, null=True,
                                      choices=[('S', 'Célibataire'), ('M', 'Marié(e)'),
                                               ('D', 'Divorcé(e)'), ('W', 'Veuf/Veuve'),
                                               ('U', 'Inconnu')],
                                      verbose_name="Statut matrimonial")
    occupation = models.CharField(max_length=100, blank=True, null=True, verbose_name="Profession")
    education_level = models.CharField(max_length=50, blank=True, null=True, verbose_name="Niveau d'éducation")
    income_bracket = models.CharField(max_length=50, blank=True, null=True, verbose_name="Revenu/CSP")
    email = models.EmailField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=200, blank=True, null=True, verbose_name="Contact d'urgence")

    # ── Address (CanReg5: up to 3 address lines) ──────────────────────
    address_1 = models.CharField(max_length=200, blank=True, null=True, verbose_name="Adresse ligne 1")
    address_2 = models.CharField(max_length=200, blank=True, null=True, verbose_name="Adresse ligne 2")
    wilaya = models.ForeignKey(Wilaya, on_delete=models.SET_NULL, null=True, blank=True)
    commune = models.ForeignKey(Commune, on_delete=models.SET_NULL, null=True, blank=True)

    # ── Vital Status & Follow-up ──────────────────────────────────────
    vital_status = models.CharField(max_length=1, choices=VITAL_STATUS, default='U')
    date_of_death = models.CharField(max_length=10, blank=True, null=True,
                                     help_text="DD/MM/YYYY (99 = inconnu)")
    cause_of_death_icd10 = models.CharField(max_length=10, blank=True, null=True,
                                            verbose_name="Cause de décès (CIM-10)")
    autopsy = models.CharField(max_length=1, blank=True, null=True,
                                choices=[('Y', 'Oui'), ('N', 'Non'), ('U', 'Inconnu')],
                                verbose_name="Autopsie")
    last_contact_date = models.CharField(max_length=10, blank=True, null=True,
                                         verbose_name="Date dernier contact")

    # ── Record Management (CanReg5) ───────────────────────────────────
    record_status = models.CharField(max_length=1, default='0',
                                     choices=[('0', 'En attente'), ('1', 'Vérifié'),
                                              ('2', 'Archivé')],
                                     verbose_name="Statut du dossier")
    check_status = models.CharField(max_length=20, default='Unchecked',
                                    choices=[('Unchecked', 'Non vérifié'),
                                             ('OK', 'Conforme'), ('Rare', 'Rare'),
                                             ('Invalid', 'Invalide')],
                                    verbose_name="Statut de vérification")
    updated_by = models.CharField(max_length=50, blank=True, null=True, verbose_name="Modifié par")

    # ── Workflow State ────────────────────────────────────────────────
    workflow = models.CharField(
        max_length=20, 
        default='clinique', 
        choices=[('clinique', 'En attente'), ('anapath', 'En validation'), ('valide', 'Complet')],
        verbose_name="Statut du Workflow"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.last_name} {self.first_name} [{self.registration_number or self.patient_id}]"


# ═══════════════════════════════════════════════════════════════════════════
# TUMOUR TABLE — CanReg5 Complete Specification
# ═══════════════════════════════════════════════════════════════════════════
class Tumor(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='tumors')

    # ── Dates ─────────────────────────────────────────────────────────
    incidence_date = models.CharField(max_length=10, verbose_name="Date d'incidence",
                                      help_text="DD/MM/YYYY")
    date_of_last_contact = models.CharField(max_length=10, blank=True, null=True)

    # ── ICD-O-3 Coding (Core) ─────────────────────────────────────────
    topo_code = models.CharField(max_length=5, verbose_name="Topographie (CIM-O-3)",
                                 help_text="Ex: C34.1")
    morpho_code = models.CharField(max_length=6, verbose_name="Morphologie (CIM-O-3)",
                                   help_text="Ex: 8070/3")
    behaviour = models.CharField(max_length=1, verbose_name="Comportement (/0-/3)",
                                  choices=[('0', '/0 Bénin'), ('1', '/1 Incertain'),
                                           ('2', '/2 In situ'), ('3', '/3 Malin'),
                                           ('6', '/6 Malin, métastatique'),
                                           ('9', '/9 Malin, incertain')])
    grade = models.CharField(max_length=1, default='9', verbose_name="Grade / Différenciation",
                              choices=[('1', 'G1 – Bien différencié'),
                                       ('2', 'G2 – Modérément'),
                                       ('3', 'G3 – Peu différencié'),
                                       ('4', 'G4 – Indifférencié / anaplasique'),
                                       ('5', 'T-cell'), ('6', 'B-cell'),
                                       ('8', 'NK-cell'), ('9', 'Non déterminé')])

    # ── ICD-10 Conversion ─────────────────────────────────────────────
    icd10_code = models.CharField(max_length=6, blank=True, null=True,
                                  verbose_name="Conversion CIM-10")

    # ── Basis of Diagnosis (IARC Codes 0-9) ───────────────────────────
    BASIS_CHOICES = [
        ('0', '0 – DCO (Certificat de décès uniquement)'),
        ('1', '1 – Clinique'),
        ('2', '2 – Recherche clinique (Imagerie, Endoscopie, Chirurgie exploratoire)'),
        ('4', '4 – Marqueurs tumoraux spécifiques'),
        ('5', '5 – Cytologie / Hématologie'),
        ('6', '6 – Histologie de la métastase'),
        ('7', '7 – Histologie de la tumeur primitive'),
        ('8', '8 – Autopsie avec histologie'),
        ('9', '9 – Inconnu'),
    ]
    basis_of_diagnosis = models.CharField(max_length=1, choices=BASIS_CHOICES, default='9',
                                          verbose_name="Base du diagnostic")

    # ── Laterality (for paired organs) ────────────────────────────────
    LATERALITY_CHOICES = [
        ('0', 'Non applicable'), ('1', 'Droite'), ('2', 'Gauche'),
        ('3', 'Bilatéral'), ('4', 'Origine unique, bilatéral'),
        ('9', 'Inconnu'),
    ]
    laterality = models.CharField(max_length=1, choices=LATERALITY_CHOICES, default='0',
                                  verbose_name="Latéralité")

    # ── TNM Staging (cTNM and pTNM, CanStaging+) ─────────────────────
    clinical_t = models.CharField(max_length=5, blank=True, null=True, verbose_name="cT")
    clinical_n = models.CharField(max_length=5, blank=True, null=True, verbose_name="cN")
    clinical_m = models.CharField(max_length=5, blank=True, null=True, verbose_name="cM")
    clinical_stage_group = models.CharField(max_length=10, blank=True, null=True,
                                            verbose_name="Stade clinique (I-IV)")
    pathological_t = models.CharField(max_length=5, blank=True, null=True, verbose_name="pT")
    pathological_n = models.CharField(max_length=5, blank=True, null=True, verbose_name="pN")
    pathological_m = models.CharField(max_length=5, blank=True, null=True, verbose_name="pM")
    pathological_stage_group = models.CharField(max_length=10, blank=True, null=True,
                                                verbose_name="Stade pathologique (I-IV)")
    tnm_edition = models.CharField(max_length=2, default='8', verbose_name="Édition TNM",
                                   help_text="7 ou 8")
    tumor_size = models.IntegerField(null=True, blank=True, verbose_name="Taille tumeur (mm)")
    
    # ── Oncology Priority Fields ──────────────────────────────────────
    diagnostic_status = models.CharField(max_length=20, default='En attente',
                                        choices=[('En attente', 'En attente'), 
                                                 ('Confirmé', 'Confirmé'), 
                                                 ('Inconnu', 'Inconnu'), 
                                                 ('Inclassable', 'Inclassable')],
                                        verbose_name="État du Diagnostic")
    histology_detail = models.TextField(blank=True, null=True, verbose_name="Détails Histologiques")
    who_classification = models.CharField(max_length=100, blank=True, null=True, verbose_name="Classification OMS")

    # ── Multiple Primaries & Sequence ─────────────────────────────────
    mp_code = models.CharField(max_length=2, default='00', verbose_name="Code MP",
                               help_text="00=unique, 01-09=séquence")
    is_most_valid = models.BooleanField(default=True, verbose_name="Diagnostic le plus valide")
    tumour_number = models.IntegerField(default=1, verbose_name="N° Tumeur pour ce patient")

    # ── Treatment (summary, CanReg5 extension) ────────────────────────
    TREATMENT_CHOICES = [
        ('0', 'Aucun'), ('1', 'Chirurgie'), ('2', 'Radiothérapie'),
        ('3', 'Chimiothérapie'), ('4', 'Hormonothérapie'),
        ('5', 'Immunothérapie'), ('6', 'Thérapie ciblée'),
        ('7', 'Combinaison'), ('8', 'Autre'), ('9', 'Inconnu'),
    ]
    treatment_1 = models.CharField(max_length=1, choices=TREATMENT_CHOICES, default='9',
                                   verbose_name="Traitement principal")
    treatment_2 = models.CharField(max_length=1, choices=TREATMENT_CHOICES, blank=True,
                                   null=True, verbose_name="Traitement secondaire")
    date_of_treatment = models.CharField(max_length=10, blank=True, null=True,
                                         verbose_name="Date du traitement")

    # ── Quality & Notes ───────────────────────────────────────────────
    check_status = models.CharField(max_length=20, default='Unchecked',
                                    choices=[('Unchecked', 'Non vérifié'),
                                             ('OK', 'Conforme'), ('Rare', 'Rare'),
                                             ('Invalid', 'Invalide')])
    notes = models.TextField(blank=True, verbose_name="Notes / Observations")
    updated_by = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        ordering = ['-incidence_date']

    def __str__(self):
        return f"Tumeur {self.topo_code} ({self.morpho_code}) – {self.patient}"


# ═══════════════════════════════════════════════════════════════════════════
# SOURCE TABLE — CanReg5 Complete Specification
# ═══════════════════════════════════════════════════════════════════════════
class Source(models.Model):
    tumor = models.ForeignKey(Tumor, on_delete=models.CASCADE, related_name='sources')

    SOURCE_TYPES = [
        ('HP', 'Histopathologie'), ('CY', 'Cytologie'),
        ('HE', 'Hématologie'), ('CL', 'Clinique'),
        ('IM', 'Imagerie'), ('DC', 'DCO (Certificat décès)'),
        ('AU', 'Autopsie'), ('RT', 'Registre des tumeurs (échange)'),
        ('LA', 'Laboratoire (marqueurs)'), ('OT', 'Autre'),
    ]
    source_type = models.CharField(max_length=2, choices=SOURCE_TYPES, verbose_name="Type de source")
    source_description = models.CharField(max_length=200, blank=True, null=True,
                                          verbose_name="Description de la source")

    # ── Hospital / Lab ────────────────────────────────────────────────
    hospital_code = models.CharField(max_length=20, blank=True, null=True,
                                     verbose_name="Code établissement")
    hospital_name = models.CharField(max_length=200, blank=True, null=True,
                                     verbose_name="Nom de l'établissement")
    department = models.CharField(max_length=100, blank=True, null=True, verbose_name="Service")

    # ── Report details ────────────────────────────────────────────────
    report_number = models.CharField(max_length=50, blank=True, null=True,
                                     verbose_name="N° de rapport")
    date_of_report = models.CharField(max_length=10, blank=True, null=True,
                                      verbose_name="Date du rapport")
    practitioner_name = models.CharField(max_length=150, blank=True, null=True,
                                         verbose_name="Praticien / Pathologiste")
    reader_id = models.CharField(max_length=50, blank=True, null=True,
                                 verbose_name="Agent / Lecteur")

    # ── Text (from report) ────────────────────────────────────────────
    clinical_text = models.TextField(blank=True, null=True, verbose_name="Texte clinique")
    pathology_text = models.TextField(blank=True, null=True, verbose_name="Texte pathologique")

    date_received = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Source {self.get_source_type_display()} – Rapport {self.report_number or '?'}"


# ═══════════════════════════════════════════════════════════════════════════
# POPULATION DATA — For ASR calculations
# ═══════════════════════════════════════════════════════════════════════════
class WilayaPopulation(models.Model):
    wilaya = models.ForeignKey(Wilaya, on_delete=models.CASCADE)
    year = models.IntegerField()
    age_group = models.CharField(max_length=10)
    gender = models.IntegerField(choices=[(1, 'Masculin'), (2, 'Féminin')])
    count = models.IntegerField()

    class Meta:
        unique_together = ('wilaya', 'year', 'age_group', 'gender')


# ═══════════════════════════════════════════════════════════════════════════
# CLINICAL EXTENSIONS — Medical History, Molecular, Pharmacovigilance
# ═══════════════════════════════════════════════════════════════════════════
class MedicalHistory(models.Model):
    HISTORY_TYPES = [('Personnel', 'Personnel'), ('Familial', 'Familial'), ('Chirurgical', 'Chirurgical')]
    CATEGORIES = [('Antécédents', 'Antécédents'), ('Allergie', 'Allergie'), ('Comorbidité', 'Comorbidité')]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_history')
    type = models.CharField(max_length=20, choices=HISTORY_TYPES)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    description = models.CharField(max_length=255, verbose_name="Description structurée")
    date_noted = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.description}"

class Pharmacovigilance(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='side_effects')
    effect_description = models.TextField()
    grade = models.IntegerField(choices=[(0, '0'), (1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, 'Décès')])
    is_serious = models.BooleanField(default=False)
    date_onset = models.DateField()

    def __str__(self):
        return f"Grade {self.grade} - {self.effect_description[:30]}"

class Biomarker(models.Model):
    """Tracks Immunochemistry (IHC) and Molecular/Genetic tests for Tumors."""
    tumor = models.ForeignKey(Tumor, on_delete=models.CASCADE, related_name='biomarkers')
    test_name = models.CharField(max_length=50, verbose_name="Nom du test (ex: HER2, EGFR, Ki-67)")
    result_value = models.CharField(max_length=50, verbose_name="Résultat (ex: Positif, Négatif, 3+, Muté)")
    percentage = models.IntegerField(null=True, blank=True, verbose_name="Pourcentage (ex: 80 pour 80%)")
    notes = models.CharField(max_length=200, null=True, blank=True)
    test_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.test_name}: {self.result_value} ({self.tumor.topo_code})"



# ═══════════════════════════════════════════════════════════════════════════
# AUDIT TRAIL & DUPLICATE RESOLUTION
# ═══════════════════════════════════════════════════════════════════════════
class PatientRevision(models.Model):
    """Stores a complete JSON snapshot of a patient document before a merge/edit."""
    patient_nid = models.CharField(max_length=20)
    snapshot_data = models.JSONField(verbose_name="Données historiques (Document A/B)")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=50, default='System')
    
    def __str__(self):
        return f"Revision {self.patient_nid} - {self.created_at.strftime('%Y-%m-%d')}"

class MergedRecord(models.Model):
    """Tracks the event of resolving a duplicate by mapping old IDs to the surviving NID."""
    surviving_patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='merges')
    document_a_snapshot = models.ForeignKey(PatientRevision, on_delete=models.PROTECT, related_name='merge_as_a', null=True)
    document_b_snapshot = models.ForeignKey(PatientRevision, on_delete=models.PROTECT, related_name='merge_as_b', null=True)
    match_confidence = models.CharField(max_length=50, verbose_name="Confiance (Exact, Soundex)")
    merged_at = models.DateTimeField(auto_now_add=True)
    merged_by = models.CharField(max_length=50, default='Auto-Merge Engine')
    is_active = models.BooleanField(default=True, verbose_name="Merge is active (un-merged if False)")

    def __str__(self):
        return f"Merge into {self.surviving_patient.nid} at {self.merged_at.strftime('%Y-%m-%d')}"

# ═══════════════════════════════════════════════════════════════════════════
# MEDICAL KNOWLEDGE & REFERENCE
# ═══════════════════════════════════════════════════════════════════════════

class MedicalDictionary(models.Model):
    """Stores coded values and labels for various registry fields."""
    SECTION_CHOICES = [
        ('ETAT', 'État Dossier'),
        ('CTRL', 'Contrôles'),
        ('DBL', 'Doublons'),
        ('TOPO', 'Localisation'),
        ('VITAL', 'Statut Vital'),
        ('BASIS', 'Base du Diagnostic'),
        ('CAUSE', 'Cause de Décès'),
        ('PLACE', 'Lieu de Décès'),
        ('ENQ', 'Enquêteur'),
        ('LAB', 'Laboratoire'),
        ('SERV', 'Service'),
    ]
    section = models.CharField(max_length=10, choices=SECTION_CHOICES)
    code = models.CharField(max_length=20)
    label = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('section', 'code')
        verbose_name_plural = "Medical Dictionaries"

    def __str__(self):
        return f"[{self.section}] {self.code}: {self.label}"

class ToxicityCriteria(models.Model):
    """Stores medical toxicity grading (CTCAE-style)."""
    category = models.CharField(max_length=100, help_text="Ex: Cardiaque, Gastro-intestinal")
    term = models.CharField(max_length=200, help_text="Ex: Tachycardie, Nausée")
    grade_0 = models.TextField(null=True, blank=True, verbose_name="Grade 0 (Absent)")
    grade_1 = models.TextField(null=True, blank=True, verbose_name="Grade 1 (Léger)")
    grade_2 = models.TextField(null=True, blank=True, verbose_name="Grade 2 (Modéré)")
    grade_3 = models.TextField(null=True, blank=True, verbose_name="Grade 3 (Sévère)")
    grade_4 = models.TextField(null=True, blank=True, verbose_name="Grade 4 (Menace le pronostic vital)")
    grade_5 = models.TextField(null=True, blank=True, verbose_name="Grade 5 (Décès)")

    def __str__(self):
        return f"{self.category}: {self.term}"

# ═══════════════════════════════════════════════════════════════════════════
# USER ROLES & PROFILES
# ═══════════════════════════════════════════════════════════════════════════

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('ADMIN', 'Registraire (Admin)'),
        ('DOCTOR', 'Médecin'),
        ('ANAPATH', 'Anapath'),
        ('LAB', 'Laboratoire'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='DOCTOR')
    wilaya = models.ForeignKey(Wilaya, on_delete=models.SET_NULL, null=True, blank=True)
    institution = models.CharField(max_length=200, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"


# ═══════════════════════════════════════════════════════════════════════════
# PATIENT HABITS (QR-CODE ACCESSIBLE)
# ═══════════════════════════════════════════════════════════════════════════

class HabitQuestionnaire(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='habitudes')
    access_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    
    # ── Life Habits ───────────────────────────────────────────────────
    smoking_status = models.CharField(max_length=50, choices=[('Never', 'Jamais'), ('Former', 'Ex-fumeur'), ('Current', 'Fumeur Actuel')], default='Never')
    cigarettes_per_day = models.IntegerField(default=0)
    years_smoking = models.IntegerField(default=0)
    hookah_use = models.BooleanField(default=False, verbose_name="Usage de Chicha")
    cigar_use = models.BooleanField(default=False, verbose_name="Usage de Cigare")
    
    alcohol_consumption = models.CharField(max_length=50, choices=[('None', 'Aucune'), ('Occasional', 'Occasionnel'), ('Frequent', 'Fréquent')], default='None')
    alcohol_type = models.CharField(max_length=100, blank=True, null=True, help_text="Vin, Bière, Spiritueux, etc.")
    
    dietary_habits = models.TextField(blank=True, null=True, help_text="Consommation de viande rouge, sel, sucre, etc.")
    fruit_veg_daily = models.IntegerField(default=0, help_text="Portions de fruits/légumes par jour")
    processed_meat_freq = models.CharField(max_length=50, choices=[('Never', 'Jamais'), ('Rarely', 'Rarement'), ('Weekly', 'Hebdomadaire'), ('Daily', 'Quotidien')], default='Never')
    
    physical_activity = models.CharField(max_length=50, choices=[('Sedentary', 'Sédentaire'), ('Moderate', 'Modéré'), ('Active', 'Actif')], default='Sedentary')
    exercise_hours_weekly = models.IntegerField(default=0)
    
    occupational_exposure = models.TextField(blank=True, null=True, help_text="Amiante, produits chimiques, solvants, etc.")
    sun_exposure = models.CharField(max_length=50, choices=[('Low', 'Faible'), ('Moderate', 'Modéré'), ('High', 'Élevé')], default='Low')
    pollution_exposure = models.BooleanField(default=False, help_text="Vit/Travaille en zone très polluée")
    
    family_cancer_history = models.TextField(blank=True, null=True, help_text="Détails des cancers familiaux (Types et Degrés de parenté)")
    other_chronic_diseases = models.TextField(blank=True, null=True, help_text="Diabète, HTA, Maladies auto-immunes, etc.")
    
    weight_kg = models.FloatField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    sleep_hours = models.IntegerField(default=7, help_text="Heures de sommeil moyennes par nuit")
    stress_level = models.CharField(max_length=50, choices=[('Low', 'Faible'), ('Moderate', 'Modéré'), ('High', 'Élevé')], default='Low')
    
    last_updated = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Habitudes: {self.patient.last_name}"

class DynamicFormConfig(models.Model):
    form_name = models.CharField(max_length=100)  # e.g., 'PatientForm'
    field_id = models.CharField(max_length=100)   # e.g., 'middle_name'
    label = models.CharField(max_length=200)
    is_required = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)
    role_restriction = models.CharField(max_length=50, blank=True, null=True)
    
    class Meta:
        unique_together = ('form_name', 'field_id')

    def __str__(self):
        return f"{self.form_name} - {self.field_id}"
