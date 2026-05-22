import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Layout, Eye, EyeOff, Asterisk, Save, 
    RefreshCcw, Search, ChevronRight, Lock, Plus, X, Settings2, ShieldCheck, Database, Trash2
} from 'lucide-react';

interface FieldConfig {
    id?: number;
    form_name: string;
    section?: string;
    field_id: string;
    label: string;
    type?: 'text' | 'number' | 'date' | 'select';
    options?: string;
    is_required: boolean;
    is_visible: boolean;
    depends_on_field?: string;
    depends_on_value?: string;
    is_native?: boolean;
}

const AdminDynamicFields: React.FC = () => {
    const [configs, setConfigs] = useState<FieldConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newField, setNewField] = useState<Partial<FieldConfig>>({ 
        field_id: '', label: '', section: 'identity', type: 'text', 
        depends_on_field: '', depends_on_value: '', options: '' 
    });

    const forms = ['PatientForm', 'TumorForm', 'LabForm'];
    const [selectedForm, setSelectedForm] = useState('PatientForm');

    useEffect(() => {
        fetchConfigs();
    }, [selectedForm]);

    const fetchConfigs = () => {
        setLoading(true);
        setTimeout(() => {
            const allConfigs = JSON.parse(localStorage.getItem('dynamic_fields_config') || '[]');
            
            // Core native fields distributed by form module
            const nativeFields: FieldConfig[] = [
                // === PATIENTFORM ===
                // Identité & Démographie
                { form_name: 'PatientForm', field_id: 'nid', label: 'NID', is_required: true, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'last_name', label: 'Nom', is_required: true, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'first_name', label: 'Prénom', is_required: true, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'maiden_name', label: 'Nom de jeune fille', is_required: false, is_visible: true, section: 'identity', type: 'text', depends_on_field: 'gender', depends_on_value: '2', is_native: true },
                { form_name: 'PatientForm', field_id: 'birth_date', label: 'Date de Naissance', is_required: true, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'birth_place', label: 'Lieu de Naissance', is_required: false, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'gender', label: 'Sexe', is_required: true, is_visible: true, section: 'identity', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'nationality', label: 'Nationalité', is_required: false, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'marital_status', label: 'Situation Familiale', is_required: false, is_visible: true, section: 'identity', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'occupation', label: 'Profession', is_required: false, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'phone', label: 'Numéro de Téléphone', is_required: false, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'address_1', label: 'Adresse Précise', is_required: false, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'wilaya', label: 'Wilaya', is_required: true, is_visible: true, section: 'identity', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'commune', label: 'Commune', is_required: false, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'vital_status', label: 'Statut Vital', is_required: true, is_visible: true, section: 'identity', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'date_of_death', label: 'Date de décès', is_required: false, is_visible: true, section: 'identity', type: 'text', depends_on_field: 'vital_status', depends_on_value: 'D', is_native: true },
                { form_name: 'PatientForm', field_id: 'autopsy', label: 'Autopsie', is_required: false, is_visible: true, section: 'identity', type: 'select', depends_on_field: 'vital_status', depends_on_value: 'D', is_native: true },
                { form_name: 'PatientForm', field_id: 'family_history', label: 'Antécédents Familiaux', is_required: false, is_visible: true, section: 'identity', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'comorbidities', label: 'Comorbidités', is_required: false, is_visible: true, section: 'identity', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'smoking_status', label: 'Tabagisme', is_required: false, is_visible: true, section: 'identity', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'alcohol_status', label: 'Alcoolisme', is_required: false, is_visible: true, section: 'identity', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'menopause_status', label: 'Statut Ménopausique', is_required: false, is_visible: true, section: 'identity', type: 'select', is_native: true },
                // Administration & Traitement
                { form_name: 'PatientForm', field_id: 'registration_number', label: 'N° Enregistrement', is_required: false, is_visible: true, section: 'admin', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'record_status', label: 'Statut Enregistrement', is_required: true, is_visible: true, section: 'admin', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'check_status', label: 'Vérification IARC', is_required: true, is_visible: true, section: 'admin', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'icd10_code', label: 'Code CIM-10', is_required: false, is_visible: true, section: 'admin', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'treatment_1', label: 'Traitement Principal', is_required: false, is_visible: true, section: 'admin', type: 'select', is_native: true },
                { form_name: 'PatientForm', field_id: 'treatment_2', label: 'Traitement Secondaire', is_required: false, is_visible: true, section: 'admin', type: 'text', is_native: true },
                { form_name: 'PatientForm', field_id: 'mp_code', label: 'Code Tumeurs Multiples', is_required: false, is_visible: true, section: 'admin', type: 'text', is_native: true },

                // === TUMORFORM ===
                // Bilan Clinique
                { form_name: 'TumorForm', field_id: 'incidence_date', label: 'Date Incidence', is_required: true, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'topo_code', label: 'Topographie', is_required: true, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'laterality', label: 'Latéralité', is_required: false, is_visible: true, section: 'clinical', type: 'select', is_native: true },
                { form_name: 'TumorForm', field_id: 'basis_of_diagnosis', label: 'Base du Diagnostic', is_required: true, is_visible: true, section: 'clinical', type: 'select', is_native: true },
                { form_name: 'TumorForm', field_id: 'clinical_t', label: 'cT (T Clinique)', is_required: false, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'clinical_n', label: 'cN (N Clinique)', is_required: false, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'clinical_m', label: 'cM (M Clinique)', is_required: false, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'clinical_stage', label: 'Stade Clinique', is_required: false, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'source_type', label: 'Type de Source', is_required: false, is_visible: true, section: 'clinical', type: 'select', is_native: true },
                { form_name: 'TumorForm', field_id: 'hospital_name', label: 'Nom de l\'Hôpital', is_required: false, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'department', label: 'Service Saisisseur', is_required: false, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'practitioner_name', label: 'Médecin Praticien', is_required: false, is_visible: true, section: 'clinical', type: 'text', is_native: true },
                // Anatomie Pathologique
                { form_name: 'TumorForm', field_id: 'morpho_code', label: 'Morphologie', is_required: true, is_visible: true, section: 'anapath', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'behaviour', label: 'Comportement', is_required: true, is_visible: true, section: 'anapath', type: 'select', is_native: true },
                { form_name: 'TumorForm', field_id: 'grade', label: 'Grade', is_required: false, is_visible: true, section: 'anapath', type: 'select', is_native: true },
                { form_name: 'TumorForm', field_id: 'path_t', label: 'pT (T Pathologique)', is_required: false, is_visible: true, section: 'anapath', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'path_n', label: 'pN (N Pathologique)', is_required: false, is_visible: true, section: 'anapath', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'path_m', label: 'pM (M Pathologique)', is_required: false, is_visible: true, section: 'anapath', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'path_stage', label: 'Stade Pathologique', is_required: false, is_visible: true, section: 'anapath', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'tumor_size', label: 'Taille de la Tumeur (mm)', is_required: false, is_visible: true, section: 'anapath', type: 'number', is_native: true },
                { form_name: 'TumorForm', field_id: 'report_number', label: 'Numéro CR Anapath', is_required: false, is_visible: true, section: 'anapath', type: 'text', is_native: true },
                { form_name: 'TumorForm', field_id: 'nodes_pos', label: 'Ganglions Positifs', is_required: false, is_visible: true, section: 'anapath', type: 'number', is_native: true },

                // === LABFORM ===
                // Laboratoire & Marqueurs
                { form_name: 'LabForm', field_id: 'psa', label: 'PSA', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'cea', label: 'CEA', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'ca125', label: 'CA 125', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'ca199', label: 'CA 19-9', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'afp', label: 'AFP', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'hcg', label: 'HCG', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'hemoglobin', label: 'Hémoglobine', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'wbc', label: 'Globules Blancs', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'platelets', label: 'Plaquettes', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'ldh', label: 'LDH', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'alp', label: 'Phosphatase Alcaline', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'labo_date', label: 'Date Labo', is_required: false, is_visible: true, section: 'labo', type: 'text', is_native: true },
                // Biomarqueurs & Génétique
                { form_name: 'LabForm', field_id: 'her2', label: 'HER2', is_required: false, is_visible: true, section: 'labo', type: 'select', is_native: true },
                { form_name: 'LabForm', field_id: 'er_percent', label: 'ER (%)', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'pr_percent', label: 'PR (%)', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'ki67', label: 'Ki-67 (%)', is_required: false, is_visible: true, section: 'labo', type: 'number', is_native: true },
                { form_name: 'LabForm', field_id: 'egfr', label: 'EGFR Mutation', is_required: false, is_visible: true, section: 'labo', type: 'select', is_native: true },
                { form_name: 'LabForm', field_id: 'alk', label: 'ALK Mutation', is_required: false, is_visible: true, section: 'labo', type: 'select', is_native: true },
                { form_name: 'LabForm', field_id: 'braf', label: 'BRAF Mutation', is_required: false, is_visible: true, section: 'labo', type: 'select', is_native: true },
                { form_name: 'LabForm', field_id: 'pdl1', label: 'PD-L1 Status', is_required: false, is_visible: true, section: 'labo', type: 'select', is_native: true },
            ];

            // Merge logic: ensure native fields always exist. If they were already in localStorage, use their saved settings.
            const mergedConfigs = [...nativeFields];
            
            allConfigs.forEach((saved: any) => {
                const existingIndex = mergedConfigs.findIndex(n => n.field_id === saved.field_id);
                if (existingIndex >= 0) {
                    // Update native field with saved user preferences (visibility, required)
                    mergedConfigs[existingIndex] = { ...mergedConfigs[existingIndex], is_visible: saved.is_visible, is_required: saved.is_required };
                } else {
                    // It's a completely custom field
                    mergedConfigs.push(saved);
                }
            });

            // If we are showing PatientForm, filter the merged list
            const finalView = mergedConfigs.filter((c: any) => c.form_name === selectedForm);
            setConfigs(finalView);
            setLoading(false);
        }, 500);
    };

    const toggleField = (fieldId: string, property: 'is_required' | 'is_visible') => {
        setConfigs(prev => {
            const next = prev.map(c => 
                c.field_id === fieldId ? { ...c, [property]: !c[property] } : c
            );
            // Save immediately in real-time
            const allConfigs = JSON.parse(localStorage.getItem('dynamic_fields_config') || '[]');
            const otherForms = allConfigs.filter((c: any) => c.form_name !== selectedForm);
            const updatedTotal = [...otherForms, ...next];
            localStorage.setItem('dynamic_fields_config', JSON.stringify(updatedTotal));
            window.dispatchEvent(new Event('dynamic_fields_updated'));
            return next;
        });
    };

    const handleAddField = () => {
        if (!newField.field_id || !newField.label) return;
        const cleanId = newField.field_id.toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        if (configs.find(c => c.field_id === cleanId)) return;

        const newItem: FieldConfig = {
            form_name: selectedForm,
            field_id: cleanId,
            label: newField.label!,
            section: newField.section,
            type: newField.type as any,
            options: newField.options,
            depends_on_field: newField.depends_on_field,
            depends_on_value: newField.depends_on_value,
            is_visible: true,
            is_required: false
        };

        setConfigs(prev => {
            const next = [newItem, ...prev];
            // Save immediately in real-time
            const allConfigs = JSON.parse(localStorage.getItem('dynamic_fields_config') || '[]');
            const otherForms = allConfigs.filter((c: any) => c.form_name !== selectedForm);
            const updatedTotal = [...otherForms, ...next];
            localStorage.setItem('dynamic_fields_config', JSON.stringify(updatedTotal));
            window.dispatchEvent(new Event('dynamic_fields_updated'));
            return next;
        });

        setNewField({ field_id: '', label: '', section: 'identity', type: 'text', depends_on_field: '', depends_on_value: '', options: '' });
        setIsAdding(false);
    };

    const handleDeleteField = (fieldId: string) => {
        setConfigs(prev => {
            const next = prev.filter(c => c.field_id !== fieldId);
            // Save immediately in real-time
            const allConfigs = JSON.parse(localStorage.getItem('dynamic_fields_config') || '[]');
            const otherForms = allConfigs.filter((c: any) => c.form_name !== selectedForm);
            const updatedTotal = [...otherForms, ...next];
            localStorage.setItem('dynamic_fields_config', JSON.stringify(updatedTotal));
            window.dispatchEvent(new Event('dynamic_fields_updated'));
            return next;
        });
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            const allConfigs = JSON.parse(localStorage.getItem('dynamic_fields_config') || '[]');
            const otherForms = allConfigs.filter((c: any) => c.form_name !== selectedForm);
            const updatedTotal = [...otherForms, ...configs];
            
            localStorage.setItem('dynamic_fields_config', JSON.stringify(updatedTotal));
            setSaving(false);
            
            // Broadcast event for other components to update
            window.dispatchEvent(new Event('dynamic_fields_updated'));
        }, 500);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Settings2 size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Studio Formulaires</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Champs Dynamiques</h2>
                    <p className="text-slate-500 text-sm font-medium">Configuration de la structure des formulaires (Région Algérie)</p>
                </div>
                
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                    {saving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                    Enregistrer la Structure
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Form Selector Rail */}
                <div className="lg:col-span-1 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4">Modules Disponibles</p>
                    {forms.map(f => (
                        <button
                            key={f}
                            onClick={() => setSelectedForm(f)}
                            className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all border ${
                                selectedForm === f 
                                ? 'bg-white border-blue-200 text-blue-600 shadow-sm ring-1 ring-blue-50' 
                                : 'bg-slate-50/50 border-transparent text-slate-500 hover:bg-white hover:border-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl transition-colors ${selectedForm === f ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400 group-hover:bg-slate-300'}`}>
                                    <Layout size={16} />
                                </div>
                                <span className="text-xs font-black uppercase tracking-tight">{f}</span>
                            </div>
                            <ChevronRight size={14} className={`transition-transform duration-300 ${selectedForm === f ? 'rotate-90 text-blue-600' : 'opacity-0 group-hover:opacity-100'}`} />
                        </button>
                    ))}

                    <div className="mt-8 p-6 bg-blue-50 rounded-[24px] border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <ShieldCheck size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Contrôle d'accès</span>
                        </div>
                        <p className="text-[10px] text-blue-700/70 font-medium leading-relaxed">
                            Les modifications ici affectent instantanément l'interface de saisie pour tous les terminaux de la région.
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-4 flex-1 max-w-md bg-white border border-slate-200 rounded-xl px-4 py-2 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
                            <Search className="text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Filtrer les champs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs text-slate-800 w-full placeholder:text-slate-400 font-bold"
                            />
                        </div>
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                isAdding 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                            }`}
                        >
                            {isAdding ? <X size={14} /> : <Plus size={14} />}
                            {isAdding ? 'Annuler' : 'Nouveau Champ'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-[500px]">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-32 space-y-4">
                                    <RefreshCcw className="animate-spin text-blue-600" size={32} />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronisation structurelle...</p>
                                </div>
                            ) : configs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-32 text-center space-y-6">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                        <Database size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Aucune configuration trouvée</p>
                                        <p className="text-[10px] text-slate-400 font-medium">Initialisez la structure pour {selectedForm}</p>
                                    </div>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Champ & Identifiant</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visibilité</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Obligatoire</th>
                                            <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {isAdding && (
                                            <motion.tr 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="bg-emerald-50/30"
                                            >
                                                <td className="px-8 py-6">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="flex flex-col gap-3">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Libellé du champ..."
                                                                    className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                                                    value={newField.label}
                                                                    onChange={e => setNewField({...newField, label: e.target.value})}
                                                                    autoFocus
                                                                />
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-emerald-100 rounded-lg w-fit">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ID:</span>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="code_unique"
                                                                        className="bg-transparent border-none outline-none text-[10px] text-emerald-600 font-mono font-bold"
                                                                        value={newField.field_id}
                                                                        onChange={e => setNewField({...newField, field_id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <select 
                                                                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none"
                                                                    value={newField.section}
                                                                    onChange={e => setNewField({...newField, section: e.target.value})}
                                                                >
                                                                    <option value="identity">Section: Identité</option>
                                                                    <option value="clinical">Section: Bilan Clinique</option>
                                                                    <option value="anapath">Section: Anapath</option>
                                                                    <option value="labo">Section: Laboratoire</option>
                                                                    <option value="admin">Section: Administration</option>
                                                                </select>
                                                                <select 
                                                                    className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none"
                                                                    value={newField.type}
                                                                    onChange={e => setNewField({...newField, type: e.target.value as any})}
                                                                >
                                                                    <option value="text">Type: Texte</option>
                                                                    <option value="number">Type: Nombre</option>
                                                                    <option value="date">Type: Date</option>
                                                                    <option value="select">Type: Menu Déroulant</option>
                                                                </select>
                                                                {newField.type === 'select' && (
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="Options (ex: Option1, Option2)"
                                                                        className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-700 outline-none"
                                                                        value={newField.options}
                                                                        onChange={e => setNewField({...newField, options: e.target.value})}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div className="col-span-2 flex items-center gap-2 px-3 py-2 bg-emerald-100/50 rounded-xl border border-emerald-200/50">
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Visible si :</span>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Champ parent (ID)"
                                                                    className="w-1/2 bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-[10px] font-mono font-bold text-slate-700 outline-none"
                                                                    value={newField.depends_on_field}
                                                                    onChange={e => setNewField({...newField, depends_on_field: e.target.value})}
                                                                />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">==</span>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Valeur requise"
                                                                    className="w-1/2 bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-[10px] font-mono font-bold text-slate-700 outline-none"
                                                                    value={newField.depends_on_value}
                                                                    onChange={e => setNewField({...newField, depends_on_value: e.target.value})}
                                                                />
                                                            </div>
                                                        </div>
                                                </td>
                                                <td colSpan={2} className="px-8 py-6 text-center">
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                                        Nouveau Champ Dynamique
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={handleAddField}
                                                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                                                    >
                                                        Valider
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        )}
                                        {configs.filter(c => c.label.toLowerCase().includes(searchTerm.toLowerCase())).map((c, i) => (
                                            <motion.tr 
                                                layout
                                                key={c.field_id} 
                                                className="hover:bg-slate-50 transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all relative">
                                                            <Asterisk size={16} />
                                                            {(c as any).is_native && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 mb-0.5 flex items-center gap-2">
                                                                {c.label}
                                                                {(c as any).is_native && <span className="text-[8px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-wider">Natif</span>}
                                                            </p>
                                                            <code className="text-[9px] text-slate-400 font-mono tracking-tighter group-hover:text-blue-500 transition-colors">{c.field_id}</code>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button 
                                                        onClick={() => toggleField(c.field_id, 'is_visible')}
                                                        className={`p-3 rounded-2xl transition-all border ${
                                                            c.is_visible 
                                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm' 
                                                            : 'bg-slate-50 border-slate-100 text-slate-300'
                                                        }`}
                                                    >
                                                        {c.is_visible ? <Eye size={18} strokeWidth={2.5} /> : <EyeOff size={18} strokeWidth={2.5} />}
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button 
                                                        onClick={() => toggleField(c.field_id, 'is_required')}
                                                        className={`p-3 rounded-2xl transition-all border ${
                                                            c.is_required 
                                                            ? 'bg-rose-50 border-rose-100 text-rose-600 shadow-sm ring-1 ring-rose-100/50' 
                                                            : 'bg-slate-50 border-slate-100 text-slate-300'
                                                        }`}
                                                    >
                                                        <Asterisk size={18} strokeWidth={3} />
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    {!(c as any).is_native && (
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleDeleteField(c.field_id)}
                                                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Supprimer ce champ"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDynamicFields;
