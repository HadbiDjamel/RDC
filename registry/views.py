from rest_framework import viewsets, permissions # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from .serializers import ( # type: ignore
    PatientSerializer, TumorSerializer, SourceSerializer, WilayaSerializer, 
    CommuneSerializer, IcdO3Serializer, Icd10Serializer,
    MedicalHistorySerializer, PharmacovigilanceSerializer, MergedRecordSerializer,
    MedicalDictionarySerializer, ToxicityCriteriaSerializer,
    UserSerializer, HabitQuestionnaireSerializer,
    DynamicFormConfigSerializer, PersonalizedMapSerializer
)
from .models import ( # type: ignore
    Patient, Tumor, Source, Wilaya, Commune, IcdO3, Icd10, MedicalHistory, 
    Pharmacovigilance, MergedRecord, MedicalDictionary, ToxicityCriteria,
    HabitQuestionnaire, DynamicFormConfig, PersonalizedMap
)
from django.contrib.auth.models import User # type: ignore
from .utils.xml_manager import XMLConfigManager # type: ignore
from .utils.statistics import calculate_asr, calculate_crude_rate, get_age_group # type: ignore
from .utils.validation import EditCheckManager # type: ignore
from datetime import date
from django.db.models import Q, Count # type: ignore
from .services.mia_service import MiaAgent # type: ignore

from rest_framework.decorators import action # type: ignore
import csv
import pandas as pd
from django.http import HttpResponse # type: ignore

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def analytics(self, request):
        tumors = Tumor.objects.select_related('patient', 'patient__wilaya').all()
        data = []
        for t in tumors:
            p = t.patient
            data.append({
                'id': t.id,
                'birth_date': p.birth_date,
                'gender': p.gender,
                'wilaya_name': p.wilaya.name if p.wilaya else 'Inconnu',
                'wilaya_code': p.wilaya.code if p.wilaya else None,
                'topo_code': t.topo_code,
                'morpho_code': t.morpho_code,
                'incidence_date': t.incidence_date,
                'basis_of_diagnosis': t.basis_of_diagnosis
            })
        return Response(data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def habits_token(self, request, pk=None):
        patient = self.get_object()
        habits, created = HabitQuestionnaire.objects.get_or_create(patient=patient)
        return Response({'access_token': str(habits.access_token)})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def check_collision_single(self, request):
        nid = request.data.get('nid')
        first_name = request.data.get('first_name', '').strip().lower()
        last_name = request.data.get('last_name', '').strip().lower()
        birth_date = request.data.get('birth_date')

        # Criteria: Exact NID OR (Exact Name AND Exact Birthdate)
        query = Q()
        if nid:
            query |= Q(nid=nid)
        if first_name and last_name and birth_date:
            query |= Q(first_name__iexact=first_name, last_name__iexact=last_name, birth_date=birth_date)

        conflicts = list(Patient.objects.filter(query).values('id', 'nid', 'first_name', 'last_name', 'birth_date'))
        
        return Response({
            'has_collision': len(conflicts) > 0,
            'collisions': conflicts
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bulk_import(self, request):
        # Placeholder for CSV parsing & bulk duplication checking logic
        # In this MVP, we mock the conflict return if file is empty
        return Response({'has_collisions': False, 'collisions': []})

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny], authentication_classes=[])
    def export_csv(self, request):
        # 1. Authenticate JWT token from query parameters OR fallback to Authorization header
        token = request.query_params.get('token')
        user = None
        
        if token:
            try:
                from rest_framework_simplejwt.authentication import JWTAuthentication
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
            except Exception:
                pass
                
        if not user:
            # Fallback: check Authorization header if it was sent
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                raw_token = auth_header.split(' ')[1]
                try:
                    from rest_framework_simplejwt.authentication import JWTAuthentication
                    jwt_auth = JWTAuthentication()
                    validated_token = jwt_auth.get_validated_token(raw_token)
                    user = jwt_auth.get_user(validated_token)
                except Exception:
                    pass
        
        if not user or not user.is_authenticated:
            return HttpResponse("Non autorisé. Veuillez vous connecter.", status=401)

        # 2. Proceed with generating the CSV
        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="registre_export.csv"'
        response.write('\ufeff')  # BOM for Excel UTF-8

        writer = csv.writer(response)

        # ── Headers ───────────────────────────────────────────────────────
        PATIENT_HEADERS = [
            'patient_id', 'registration_number', 'nid', 'last_name', 'first_name',
            'maiden_name', 'gender', 'birth_date', 'birth_place',
            'passport_number', 'social_security_number',
            'phone', 'email', 'nationality', 'ethnicity',
            'marital_status', 'occupation', 'education_level', 'income_bracket',
            'emergency_contact',
            'address_1', 'address_2', 'wilaya', 'wilaya_name', 'commune', 'commune_name',
            'vital_status', 'date_of_death', 'cause_of_death_icd10', 'autopsy',
            'last_contact_date',
            'record_status', 'check_status', 'workflow',
            'updated_by', 'created_at', 'updated_at',
        ]
        TUMOR_HEADERS = [
            'tumeur_incidence_date', 'tumeur_topo_code', 'tumeur_morpho_code',
            'tumeur_behaviour', 'tumeur_grade', 'tumeur_icd10_code',
            'tumeur_basis_of_diagnosis', 'tumeur_laterality',
            'tumeur_cT', 'tumeur_cN', 'tumeur_cM', 'tumeur_clinical_stage',
            'tumeur_pT', 'tumeur_pN', 'tumeur_pM', 'tumeur_pathological_stage',
            'tumeur_tnm_edition', 'tumeur_tumor_size',
            'tumeur_diagnostic_status', 'tumeur_histology_detail', 'tumeur_who_classification',
            'tumeur_mp_code', 'tumeur_tumour_number',
            'tumeur_treatment_1', 'tumeur_treatment_2', 'tumeur_date_of_treatment',
            'tumeur_check_status', 'tumeur_notes',
        ]
        SOURCE_HEADERS = [
            'source_type', 'source_hospital_name', 'source_department',
            'source_report_number', 'source_date_of_report',
            'source_practitioner_name', 'source_reader_id',
            'source_clinical_text', 'source_pathology_text',
        ]
        BIOMARKER_HEADERS = [
            'bio_HER2', 'bio_ER', 'bio_PR', 'bio_Ki67',
            'bio_EGFR', 'bio_ALK', 'bio_BRAF', 'bio_PD-L1',
        ]

        writer.writerow(PATIENT_HEADERS + TUMOR_HEADERS + SOURCE_HEADERS + BIOMARKER_HEADERS)

        # ── Rows ──────────────────────────────────────────────────────────
        patients = Patient.objects.select_related('wilaya', 'commune').prefetch_related(
            'tumors__sources', 'tumors__biomarkers'
        ).all()

        BIOMARKER_NAMES = ['HER2', 'ER', 'PR', 'Ki67', 'EGFR', 'ALK', 'BRAF', 'PD-L1']

        for p in patients:
            tumor = p.tumors.first()
            source = tumor.sources.first() if tumor else None
            biomarkers = {b.test_name: b.result_value for b in tumor.biomarkers.all()} if tumor else {}

            p_row = [
                p.patient_id, p.registration_number, p.nid,
                p.last_name, p.first_name, p.maiden_name or '',
                p.get_gender_display(), p.birth_date, getattr(p, 'birth_place', ''),
                p.passport_number or '', p.social_security_number or '',
                p.phone or '', p.email or '', p.nationality, p.ethnicity or '',
                p.get_marital_status_display() if p.marital_status else '',
                p.occupation or '', p.education_level or '', p.income_bracket or '',
                p.emergency_contact or '',
                p.address_1 or '', p.address_2 or '',
                p.wilaya_id or '', p.wilaya.name if p.wilaya else '',
                p.commune_id or '', p.commune.name if p.commune else '',
                p.get_vital_status_display(), p.date_of_death or '',
                p.cause_of_death_icd10 or '', p.autopsy or '',
                p.last_contact_date or '',
                p.get_record_status_display(), p.get_check_status_display(), p.get_workflow_display(),
                p.updated_by or '',
                p.created_at.strftime('%Y-%m-%d %H:%M') if p.created_at else '',
                p.updated_at.strftime('%Y-%m-%d %H:%M') if p.updated_at else '',
            ]

            t_row = [''] * len(TUMOR_HEADERS)
            if tumor:
                t_row = [
                    tumor.incidence_date, tumor.topo_code, tumor.morpho_code,
                    tumor.behaviour, tumor.grade, tumor.icd10_code or '',
                    tumor.basis_of_diagnosis, tumor.laterality,
                    tumor.clinical_t or '', tumor.clinical_n or '', tumor.clinical_m or '',
                    tumor.clinical_stage_group or '',
                    tumor.pathological_t or '', tumor.pathological_n or '', tumor.pathological_m or '',
                    tumor.pathological_stage_group or '',
                    tumor.tnm_edition, tumor.tumor_size or '',
                    tumor.diagnostic_status, tumor.histology_detail or '', tumor.who_classification or '',
                    tumor.mp_code, tumor.tumour_number,
                    tumor.get_treatment_1_display(), tumor.treatment_2 or '', tumor.date_of_treatment or '',
                    tumor.check_status, tumor.notes or '',
                ]

            s_row = [''] * len(SOURCE_HEADERS)
            if source:
                s_row = [
                    source.get_source_type_display(), source.hospital_name or '',
                    source.department or '', source.report_number or '',
                    source.date_of_report or '', source.practitioner_name or '',
                    source.reader_id or '',
                    source.clinical_text or '', source.pathology_text or '',
                ]

            b_row = [biomarkers.get(name, '') for name in BIOMARKER_NAMES]

            writer.writerow(p_row + t_row + s_row + b_row)

        return response

class TumorViewSet(viewsets.ModelViewSet):
    queryset = Tumor.objects.all()
    serializer_class = TumorSerializer

class SourceViewSet(viewsets.ModelViewSet):
    queryset = Source.objects.all()
    serializer_class = SourceSerializer

class MedicalHistoryViewSet(viewsets.ModelViewSet):
    queryset = MedicalHistory.objects.all()
    serializer_class = MedicalHistorySerializer

class PharmacovigilanceViewSet(viewsets.ModelViewSet):
    queryset = Pharmacovigilance.objects.all()
    serializer_class = PharmacovigilanceSerializer

class MergedRecordViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MergedRecord.objects.all().order_by('-merged_at')
    serializer_class = MergedRecordSerializer

class WilayaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Wilaya.objects.all()
    serializer_class = WilayaSerializer

class CommuneViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Commune.objects.all()
    serializer_class = CommuneSerializer

class IcdO3ViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = IcdO3.objects.all()
    serializer_class = IcdO3Serializer
    filterset_fields = ['type']

class Icd10ViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Icd10.objects.all()
    serializer_class = Icd10Serializer

class MedicalDictionaryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MedicalDictionary.objects.all()
    serializer_class = MedicalDictionarySerializer
    filterset_fields = ['section', 'code']

class ToxicityCriteriaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ToxicityCriteria.objects.all()
    serializer_class = ToxicityCriteriaSerializer
    search_fields = ['category', 'term']

class SystemStudioView(APIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request):
        manager = XMLConfigManager()
        return Response({"xml": manager.read_config()})
    
    def post(self, request):
        manager = XMLConfigManager()
        var_name = request.data.get("name")
        value = request.data.get("value")
        action = request.data.get("action", "update")
        
        if action == "add":
            manager.add_variable(var_name, value)
        else:
            manager.update_variable(var_name, value)
            
        return Response({"status": "success"})

class AnalysisView(APIView):
    def get(self, request):
        WORLD_STD = {
            '0-4': 12000, '5-9': 10000, '10-14': 9000, '15-19': 9000,
            '20-24': 8000, '25-29': 8000, '30-34': 6000, '35-39': 6000,
            '40-44': 6000, '45-49': 6000, '50-54': 5000, '55-59': 4000,
            '60-64': 4000, '65-69': 3000, '70-74': 2000, '75-79': 1000,
            '80-84': 500, '85+': 500
        }
        TOTAL_STD = sum(WORLD_STD.values())

        tumors = list(Tumor.objects.select_related('patient').all())
        total_cases = len(tumors)
        if total_cases == 0:
            return Response({"error": "Aucune donnée disponible"}, status=404)

        def get_age(t):
            try:
                # Try YYYY-MM-DD
                if '-' in t.incidence_date:
                    i_year = int(t.incidence_date.split('-')[0])
                else:
                    i_year = int(t.incidence_date.split('/')[-1])      
                if '-' in t.patient.birth_date:
                    b_year = int(t.patient.birth_date.split('-')[0])
                else:
                    b_year = int(t.patient.birth_date.split('/')[-1])
                return max(0, i_year - b_year)
            except: return None

        def get_group(age):
            if age is None: return None
            if age >= 85: return '85+'
            start = (age // 5) * 5
            return f"{start}-{start+4}"

        # Initialize aggregators
        data_map: dict[tuple[str, str], dict[str, int]] = {}
        age_dist_counts: dict[str, int] = {f"{i}-{i+4}": 0 for i in range(0, 85, 5)}
        age_dist_counts['85+'] = 0
        pyramid_counts: dict[str, dict[str, int]] = {f"{i}-{i+4}": {'M': 0, 'F': 0} for i in range(0, 85, 5)}
        pyramid_counts['85+'] = {'M': 0, 'F': 0}
        age_raw: list[int] = []
        trends_map: dict[str, dict[str, int | str]] = {} 
        main_type_codes = ["C34", "C50", "C18", "C20", "C61"]
        # Quality metrics counters
        mv_count = 0
        dco_count = 0
        incid_date_unknown_count = 0

        # One single pass for O(N) performance
        for t in tumors:
            age = get_age(t)
            group = get_group(age)
            sex_key = 'M' if t.patient.gender == 1 else 'F'
            topo = t.topo_code if t.topo_code else "Inconnu"
            
            # 1. Age Distribution & Pyramid
            if isinstance(group, str) and group in age_dist_counts:
                age_dist_counts[group] += 1
                if sex_key in pyramid_counts[group]:
                    pyramid_counts[group][sex_key] += (1 if sex_key == 'M' else -1)
                if age is not None: age_raw.append(age)
            
            # 2. ASR Data Mapping
            key: tuple[str, str] = (sex_key, str(topo))
            if key not in data_map: data_map[key] = {g: 0 for g in WORLD_STD}
            if isinstance(group, str) and group in data_map[key]:
                data_map[key][group] += 1
            # 3. Trends
            try:
                year = t.incidence_date.split('-')[0] if '-' in t.incidence_date else t.incidence_date.split('/')[-1]
                if len(year) == 4:
                    if year not in trends_map: 
                        trends_map[year] = {"year": year, "Total": 0}
                    
                    year_data = trends_map[year]
                    year_data["Total"] = int(year_data.get("Total", 0)) + 1
                    
                    for code in main_type_codes:
                        if str(topo).startswith(code):
                            current_count = int(year_data.get(code, 0))
                            year_data[code] = current_count + 1
            except: pass

            # 4. Quality
            if t.basis_of_diagnosis in ['5', '7', '8']: mv_count += 1
            if t.basis_of_diagnosis == '0': dco_count += 1
            if '99/99' in t.incidence_date: incid_date_unknown_count += 1

        def calc_asr(counts):
            asr = 0
            for group, weight in WORLD_STD.items():
                count = counts.get(group, 0)
                rate = (count / 100000) * 100000 # Scaling for demo visibility
                asr += (rate * (weight / TOTAL_STD))
            return round(asr, 2)

        def get_top_10(sex):
            counts = {}
            for (s, topo_site), g_counts in data_map.items():
                if s == sex: counts[topo_site] = sum(g_counts.values())
            # Explicit list cast and explicit loop to satisfy Pyre2 slicing issues
            full_sorted: list[tuple[str, int]] = list(sorted(counts.items(), key=lambda x: x[1], reverse=True))
            top_10_sites: list[tuple[str, int]] = []
            for i in range(min(10, len(full_sorted))):
                top_10_sites.append(full_sorted[i])
                
            return [
                {
                    "name": site_name, 
                    "value": val, 
                    "asr": calc_asr(data_map.get((sex, site_name), {}))
                } for site_name, val in top_10_sites
            ]

        # Calculate Global ASR
        global_age_counts = {group: 0 for group in WORLD_STD}
        for group, sexes in pyramid_counts.items():
            global_age_counts[group] = sexes['M'] + abs(sexes['F'])

        quality = [
            {"name": "Vérification Microscopique", "value": mv_count},
            {"name": "Cas DCO (Death Cert.)", "value": dco_count},
            {"name": "Données Incid. Incomplètes", "value": incid_date_unknown_count},
        ]

        return Response({
            "summary": {
                "total_cases": total_cases,
                "asr_global": calc_asr(global_age_counts),
                "mv_percent": int((mv_count / total_cases * 100) * 10) / 10.0 if total_cases > 0 else 0.0
            },
            "reports": {
                "top_10_sex": {"M": get_top_10('M'), "F": get_top_10('F')},
                "age_dist": [{"name": k, "value": v} for k, v in age_dist_counts.items() if v > 0],
                "age_raw": age_raw,
                "pyramid": [{"age": k, "M": v['M'], "F": v['F']} for k, v in pyramid_counts.items()],
                "trends": sorted(trends_map.values(), key=lambda x: x['year']),
                "ci5": [{"name": "Col de l'utérus", "value": 15}, {"name": "Prostate", "value": 45}, {"name": "Colon", "value": 22}], # cspell:ignore utérus
                "iccc": [{"name": "I Leucémies", "value": 10}, {"name": "II Lymphomes", "value": 8}],
                "quality": quality
            }
        })

class ValidationView(APIView):
    def post(self, request):
        data = request.data
        results = EditCheckManager.run_all_checks(data)
        return Response(results)

class PersonSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 3: return Response([])
        
        # Simple fuzzy search implementation using Q objects
        # In production, use Soundex or pg_trgm for better results
        patients = Patient.objects.filter(
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query) | 
            Q(nid__icontains=query)
        )[:10]
        
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)

class MiaVoiceExtractView(APIView):
    """
    Receives text-to-speech transcription from the frontend and uses MIA
    to structure it into JSON payload.
    """
    def post(self, request):
        text = request.data.get('text', '')
        role = request.data.get('role', 'medecin')
        module = request.data.get('module', 'full')

        if not text:
            return Response({'error': 'No text provided'}, status=status.HTTP_400_BAD_REQUEST)

        agent = MiaAgent()
        extracted_data = agent.extract_voice_data(text, role, module)
        
        return Response({
            'original_text': text,
            'extracted_fields': extracted_data
        })

class MiaChatView(APIView):
    """
    Handles general conversational messages for the M.I.A. Chat interface.
    """
    def post(self, request, *args, **kwargs):
        message = request.data.get('message', '')
        if not message:
            return Response({'error': 'Message text is required'}, status=400)

        agent = MiaAgent()
        response_text = agent.chat(message)
        
        # Trend Detection Logic
        insight_data = None
        if "DATA_INSIGHT:" in response_text:
            try:
                import json
                import re
                parts = re.split(r'DATA_INSIGHT:\s*', response_text)
                clean_text = parts[0].strip()
                json_str = parts[1].strip()
                
                # Basic JSON extraction if there's trailing text
                json_match = re.search(r'\{.*\}', json_str, re.DOTALL)
                if json_match:
                    meta = json.loads(json_match.group().replace("'", '"'))
                    
                    from .utils.trend_analysis import TrendAnalyzer # type: ignore
                    if meta.get('category') == 'incidence':
                        topo = meta.get('topo') if meta.get('topo') != 'all' else None
                        real_data = TrendAnalyzer.get_yearly_incidence(topo)
                        insight_data = {"type": "chart", "category": "incidence", "points": real_data, "label": f"Évolution {topo if topo else 'Globale'}"}
                    elif meta.get('category') == 'top_sites':
                        real_data = TrendAnalyzer.get_top_cancers()
                        insight_data = {"type": "chart", "category": "top_sites", "points": [{"name": d['topo_code'], "val": d['count']} for d in real_data]}
                    elif meta.get('category') == 'wilaya':
                        real_data = TrendAnalyzer.get_wilaya_distribution()
                        insight_data = {"type": "chart", "category": "wilaya", "points": [{"name": d['wilaya'], "val": d['count']} for d in real_data]}
                
                response_text = clean_text
            except Exception as e:
                print(f"MIA Insight Error: {str(e)}")

        return Response({
            'response': response_text,
            'data': insight_data
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class HabitQuestionnaireViewSet(viewsets.ModelViewSet):
    queryset = HabitQuestionnaire.objects.all()
    serializer_class = HabitQuestionnaireSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'access_token'

class DynamicFormConfigViewSet(viewsets.ModelViewSet):
    queryset = DynamicFormConfig.objects.all()
    serializer_class = DynamicFormConfigSerializer
    permission_classes = [permissions.IsAdminUser]

class WilayaStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        metric = request.query_params.get('metric', 'cases')
        topo_code = request.query_params.get('cancer_type', None)

        # Filter tumors
        tumors = Tumor.objects.select_related('patient__wilaya').all()
        if topo_code and topo_code != 'all':
            tumors = tumors.filter(topo_code__startswith=topo_code)

        # Basic population baseline for incidence mock-calc
        # In a real system, this would be a table of wilaya populations
        WILAYA_POP_BASELINE = {
            '16': 3500000, # Alger
            '31': 1600000, # Oran
            '25': 1000000, # Constantine
            # ... others default to 500k for demo
        }

        # Aggregate data by wilaya
        stats = {}
        for t in tumors:
            w_id = t.patient.wilaya_id
            if not w_id: continue
            
            if w_id not in stats:
                stats[w_id] = {'cases': 0, 'mortality': 0}
            
            stats[w_id]['cases'] += 1
            if t.patient.vital_status == 'D':
                stats[w_id]['mortality'] += 1

        # Format for frontend
        results = []
        # Actually, let's use the provided WILAYA_CENTROIDS logic
        # Since I can't easily import from frontend/src, I'll use a helper or the model
        wilayas = Wilaya.objects.all()
        
        # Temporary centroids for backend use if not available elsewhere
        BACKEND_CENTROIDS = {
            "01": {"lat": 27.87, "lng": -0.29}, "02": {"lat": 36.17, "lng": 1.34},
            "03": {"lat": 33.80, "lng": 2.86}, "04": {"lat": 35.87, "lng": 7.11},
            "05": {"lat": 35.56, "lng": 6.17}, "06": {"lat": 36.75, "lng": 5.08},
            "07": {"lat": 34.85, "lng": 5.73}, "08": {"lat": 31.62, "lng": -2.22},
            "09": {"lat": 36.47, "lng": 2.83}, "10": {"lat": 36.38, "lng": 3.90},
            "11": {"lat": 22.79, "lng": 5.52}, "12": {"lat": 35.40, "lng": 8.12},
            "13": {"lat": 34.89, "lng": -1.32}, "14": {"lat": 35.37, "lng": 1.32},
            "15": {"lat": 36.71, "lng": 4.04}, "16": {"lat": 36.74, "lng": 3.06},
            "17": {"lat": 34.68, "lng": 3.26}, "18": {"lat": 36.82, "lng": 5.77},
            "19": {"lat": 36.19, "lng": 5.41}, "20": {"lat": 34.83, "lng": 0.15},
            "21": {"lat": 36.88, "lng": 6.91}, "22": {"lat": 35.20, "lng": -0.63},
            "23": {"lat": 36.90, "lng": 7.76}, "24": {"lat": 36.47, "lng": 7.43},
            "25": {"lat": 36.37, "lng": 6.61}, "26": {"lat": 36.26, "lng": 2.75},
            "27": {"lat": 35.93, "lng": 0.09}, "28": {"lat": 35.70, "lng": 4.54},
            "29": {"lat": 35.40, "lng": 0.14}, "30": {"lat": 31.95, "lng": 5.34},
            "31": {"lat": 35.70, "lng": -0.63}, "32": {"lat": 33.68, "lng": 1.02},
            "33": {"lat": 26.51, "lng": 8.47}, "34": {"lat": 36.07, "lng": 4.76},
            "35": {"lat": 36.76, "lng": 3.63}, "36": {"lat": 36.77, "lng": 8.31},
            "37": {"lat": 27.67, "lng": -8.14}, "38": {"lat": 35.60, "lng": 1.81},
            "39": {"lat": 33.36, "lng": 6.85}, "40": {"lat": 35.44, "lng": 7.14},
            "41": {"lat": 36.28, "lng": 7.95}, "42": {"lat": 36.59, "lng": 2.44},
            "43": {"lat": 36.45, "lng": 6.27}, "44": {"lat": 36.26, "lng": 1.97},
            "45": {"lat": 33.27, "lng": -0.31}, "46": {"lat": 35.30, "lng": -1.14},
            "47": {"lat": 32.49, "lng": 3.67}, "48": {"lat": 35.74, "lng": 0.56},
            "49": {"lat": 33.95, "lng": 5.93}, "50": {"lat": 30.58, "lng": 2.88},
            "51": {"lat": 34.42, "lng": 5.07}, "52": {"lat": 21.33, "lng": 0.95},
            "53": {"lat": 30.13, "lng": -2.17}, "54": {"lat": 29.26, "lng": 0.24},
            "55": {"lat": 33.10, "lng": 6.07}, "56": {"lat": 24.55, "lng": 9.48},
            "57": {"lat": 27.20, "lng": 2.47}, "58": {"lat": 19.57, "lng": 5.77},
        }

        for w in wilayas:
            w_id = w.code
            w_stats = stats.get(w_id, {'cases': 0, 'mortality': 0})
            coords = BACKEND_CENTROIDS.get(w_id, {"lat": 28, "lng": 2})
            
            val = 0
            if metric == 'cases':
                val = w_stats['cases']
            elif metric == 'mortality':
                val = w_stats['mortality']
            elif metric == 'incidence':
                pop = WILAYA_POP_BASELINE.get(w_id, 500000)
                val = round((w_stats['cases'] / pop) * 100000, 2)
            
            results.append({
                'wilayaId': w_id,
                'name': w.name,
                'lat': coords['lat'],
                'lng': coords['lng'],
                'value': val
            })

        return Response(results)

class PersonalizedMapViewSet(viewsets.ModelViewSet):
    serializer_class = PersonalizedMapSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Admins see all, others see only theirs (though currently mostly for admins)
        if self.request.user.is_staff:
            return PersonalizedMap.objects.all()
        return PersonalizedMap.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DataImportPreviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'Aucun fichier fourni.'}, status=400)
            
        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj, nrows=0)
            elif file_obj.name.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file_obj, nrows=0)
            else:
                return Response({'error': 'Format non supporté.'}, status=400)
                
            headers = df.columns.tolist()
            return Response({'headers': headers})
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class DataImportProcessView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('file')
        mapping_str = request.data.get('mapping')
        
        if not file_obj or not mapping_str:
            return Response({'error': 'Fichier ou mapping manquant.'}, status=400)
            
        try:
            import json
            mapping = json.loads(mapping_str)
        except:
            return Response({'error': 'Mapping JSON invalide.'}, status=400)
            
        try:
            if file_obj.name.endswith('.csv'):
                df = pd.read_csv(file_obj)
            else:
                df = pd.read_excel(file_obj)
                
            # Filter columns that are mapped and rename them
            cols_to_keep = list(mapping.keys())
            df = df[[col for col in cols_to_keep if col in df.columns]]
            df = df.rename(columns=mapping)
            
            success_count = 0
            errors = []
            
            for index, row in df.iterrows():
                try:
                    row_data = row.to_dict()
                    row_data = {k: ('' if pd.isna(v) else str(v).strip()) for k, v in row_data.items()}
                    
                    patient_data = {}
                    tumor_data = {}
                    
                    for k, v in row_data.items():
                        if k.startswith('tumor_'):
                            if v: # Only keep non-empty tumor fields
                                tumor_data[k.replace('tumor_', '')] = v
                        else:
                            patient_data[k] = v
                    
                    # ── Sanitize Patient Data ──
                    # 1. Foreign keys: wilaya_id, commune_id
                    for fk in ['wilaya_id', 'commune_id']:
                        if fk in patient_data:
                            val = patient_data[fk]
                            if val == '' or val is None:
                                patient_data[fk] = None
                            else:
                                # Ensure it's a clean string
                                patient_data[fk] = str(val).strip()

                    # 2. Integer fields: gender
                    if 'gender' in patient_data:
                        try:
                            g_val = str(patient_data['gender']).strip()
                            if g_val in ['1', '2', '9']:
                                patient_data['gender'] = int(g_val)
                            elif g_val.lower().startswith('m') or g_val.lower().startswith('h'):
                                patient_data['gender'] = 1
                            elif g_val.lower().startswith('f'):
                                patient_data['gender'] = 2
                            else:
                                patient_data['gender'] = 9
                        except:
                            patient_data['gender'] = 9
                    else:
                        patient_data['gender'] = 9

                    # 3. Clean empty strings to None (or pop them if they are foreign keys)
                    for k in list(patient_data.keys()):
                        if patient_data[k] == '':
                            patient_data[k] = None

                    # Basic validation or defaults for Patient
                    if not patient_data.get('first_name'):
                        patient_data['first_name'] = 'Inconnu'
                    if not patient_data.get('last_name'):
                        patient_data['last_name'] = 'Inconnu'
                    if not patient_data.get('birth_date'):
                        patient_data['birth_date'] = '99/99/9999'
                    
                    patient = Patient.objects.create(**patient_data)
                    
                    # Create Tumor if tumor fields were mapped
                    if tumor_data:
                        # ── Sanitize Tumor Data ──
                        # 1. Integer fields: tumor_size
                        if 'tumor_size' in tumor_data:
                            try:
                                t_size = str(tumor_data['tumor_size']).strip()
                                if t_size and t_size != '':
                                    # handle float values represented as strings (e.g. '15.0')
                                    tumor_data['tumor_size'] = int(float(t_size))
                                else:
                                    tumor_data['tumor_size'] = None
                            except:
                                tumor_data['tumor_size'] = None

                        # 2. Clean other empty fields to None
                        for k in list(tumor_data.keys()):
                            if tumor_data[k] == '':
                                tumor_data[k] = None

                        # Provide fallbacks for required core fields if missing
                        if not tumor_data.get('incidence_date'):
                            tumor_data['incidence_date'] = '99/99/9999'
                        if not tumor_data.get('topo_code'):
                            tumor_data['topo_code'] = 'C80.9'
                        if not tumor_data.get('morpho_code'):
                            tumor_data['morpho_code'] = '8000/3'
                        if not tumor_data.get('behaviour'):
                            tumor_data['behaviour'] = '3'
                            
                        Tumor.objects.create(patient=patient, **tumor_data)
                        
                    success_count += 1
                except Exception as e:
                    errors.append(f"Ligne {index + 2}: {str(e)}")
            
            return Response({
                'success_count': success_count,
                'errors': errors
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

