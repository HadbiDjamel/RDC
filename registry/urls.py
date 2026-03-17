from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MiaVoiceExtractView, MiaChatView,
    PatientViewSet, TumorViewSet, SourceViewSet, MedicalHistoryViewSet,
    PharmacovigilanceViewSet, MergedRecordViewSet, WilayaViewSet,
    CommuneViewSet, IcdO3ViewSet, Icd10ViewSet, MedicalDictionaryViewSet,
    ToxicityCriteriaViewSet, UserViewSet, MeView, HabitQuestionnaireViewSet,
    DynamicFormConfigViewSet, SystemStudioView, AnalysisView,
    ValidationView, PersonSearchView
)
from .tokens import MyTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'tumors', TumorViewSet)
router.register(r'sources', SourceViewSet)
router.register(r'medical-history', MedicalHistoryViewSet)
router.register(r'pharmacovigilance', PharmacovigilanceViewSet)
router.register(r'merges', MergedRecordViewSet, basename='merges')
router.register(r'wilayas', WilayaViewSet)
router.register(r'communes', CommuneViewSet)
router.register(r'icdo3', IcdO3ViewSet)
router.register(r'icd10', Icd10ViewSet)
router.register(r'dictionary', MedicalDictionaryViewSet)
router.register(r'toxicity', ToxicityCriteriaViewSet)
router.register(r'users', UserViewSet, basename='user')
router.register(r'habits', HabitQuestionnaireViewSet)
router.register(r'dynamic-form-config', DynamicFormConfigViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('system-studio/', SystemStudioView.as_view(), name='system-studio'),
    path('analysis/stats/', AnalysisView.as_view(), name='analysis-stats'),
    path('validation/check/', ValidationView.as_view(), name='validation-check'),
    path('person/search/', PersonSearchView.as_view(), name='person-search'),
    path('mia/extract-voice/', MiaVoiceExtractView.as_view(), name='mia-extract-voice'),
    path('mia/chat/', MiaChatView.as_view(), name='mia-chat'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
]
