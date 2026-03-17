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
    DynamicFormConfigSerializer
)
from .models import ( # type: ignore
    Patient, Tumor, Source, Wilaya, Commune, IcdO3, Icd10, MedicalHistory, 
    Pharmacovigilance, MergedRecord, MedicalDictionary, ToxicityCriteria,
    HabitQuestionnaire, DynamicFormConfig
)
from django.contrib.auth.models import User # type: ignore
from .utils.xml_manager import XMLConfigManager # type: ignore
from .utils.statistics import calculate_asr, calculate_crude_rate, get_age_group # type: ignore
from .utils.validation import EditCheckManager # type: ignore
from datetime import date
from django.db.models import Q, Count # type: ignore
from .services.mia_service import MiaAgent # type: ignore

from rest_framework.decorators import action # type: ignore

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def habits_token(self, request, pk=None):
        patient = self.get_object()
        habits, created = HabitQuestionnaire.objects.get_or_create(patient=patient)
        return Response({'access_token': str(habits.access_token)})

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
