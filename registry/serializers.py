from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Patient, Tumor, Source, Wilaya, Commune, IcdO3, Icd10,
    MedicalHistory, Pharmacovigilance, PatientRevision, MergedRecord,
    Biomarker, MedicalDictionary, ToxicityCriteria, UserProfile,
    HabitQuestionnaire, DynamicFormConfig, PersonalizedMap
)

class PersonalizedMapSerializer(serializers.ModelSerializer):
    wilaya_codes = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Wilaya.objects.all(), source='wilayas'
    )
    wilaya_names = serializers.SerializerMethodField()

    class Meta:
        model = PersonalizedMap
        fields = ['id', 'name', 'user', 'wilaya_codes', 'wilaya_names', 'zones', 'created_at']
        extra_kwargs = {
            'user': {'read_only': True}
        }

    def get_wilaya_names(self, obj):
        return [w.name for w in obj.wilayas.all()]

class CommuneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commune
        fields = '__all__'

class IcdO3Serializer(serializers.ModelSerializer):
    class Meta:
        model = IcdO3
        fields = '__all__'

class Icd10Serializer(serializers.ModelSerializer):
    class Meta:
        model = Icd10
        fields = '__all__'

class WilayaSerializer(serializers.ModelSerializer):
    communes = CommuneSerializer(many=True, read_only=True)
    class Meta:
        model = Wilaya
        fields = '__all__'

class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = '__all__'

class BiomarkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Biomarker
        fields = '__all__'

class TumorSerializer(serializers.ModelSerializer):
    sources = SourceSerializer(many=True, read_only=True)
    biomarkers = BiomarkerSerializer(many=True, read_only=True)
    class Meta:
        model = Tumor
        fields = '__all__'

class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = '__all__'

class PharmacovigilanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pharmacovigilance
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    tumors = TumorSerializer(many=True, read_only=True)
    medical_history = MedicalHistorySerializer(many=True, read_only=True)
    side_effects = PharmacovigilanceSerializer(many=True, read_only=True)
    wilaya_name = serializers.ReadOnlyField(source='wilaya.name')
    commune_name = serializers.ReadOnlyField(source='commune.name')
    
    class Meta:
        model = Patient
        fields = '__all__'

class PatientRevisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRevision
        fields = '__all__'

class MergedRecordSerializer(serializers.ModelSerializer):
    document_a_snapshot = PatientRevisionSerializer(read_only=True)
    document_b_snapshot = PatientRevisionSerializer(read_only=True)
    class Meta:
        model = MergedRecord
        fields = '__all__'

class MedicalDictionarySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalDictionary
        fields = '__all__'

class ToxicityCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToxicityCriteria
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    wilaya_name = serializers.ReadOnlyField(source='wilaya.name')
    class Meta:
        model = UserProfile
        fields = ['role', 'wilaya', 'wilaya_name', 'institution', 'phone']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'first_name', 'last_name', 'profile', 'is_staff']

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        UserProfile.objects.create(user=user, **profile_data)
        return user

class HabitQuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitQuestionnaire
        fields = '__all__'

class DynamicFormConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicFormConfig
        fields = '__all__'
