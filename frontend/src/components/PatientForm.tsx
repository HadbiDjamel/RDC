import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle, CheckCircle2, Database, Stethoscope, FileText, Activity,
    Zap, Shield, Microscope, Phone, FlaskConical, ChevronDown, User, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

// ── Helpers ──────────────────────────────────────────────────────
const FEMALE_SITES = ['C50', 'C51', 'C52', 'C53', 'C54', 'C55', 'C56', 'C57', 'C58'];
const MALE_SITES = ['C60', 'C61', 'C62', 'C63'];
const PAIRED_SITES = ['C50', 'C34', 'C64', 'C69', 'C74', 'C62', 'C56', 'C44'];

function calcAge(b: string, r: string): number | null {
    const parse = (s: string) => { 
        const p = s.split('/'); 
        if (p.length !== 3) return null; 
        const [d, m, y] = p.map(Number); 
        if (!y || y === 9999) return null; 
        return { d: d === 99 ? 1 : d, m: m === 99 ? 1 : m, y }; 
    };
    const bp = parse(b), rp = parse(r); 
    if (!bp || !rp) return null;
    let a = rp.y - bp.y; 
    if (rp.m < bp.m || (rp.m === bp.m && rp.d < bp.d)) a--; 
    return a >= 0 ? a : null;
}

const WILAYA_OPTIONS = [
    { value: '', label: '— Sélectionner —' },
    { value: '01', label: '01 - Adrar' }, { value: '02', label: '02 - Chlef' }, { value: '03', label: '03 - Laghouat' }, { value: '04', label: '04 - Oum El Bouaghi' }, { value: '05', label: '05 - Batna' },
    { value: '06', label: '06 - Béjaïa' }, { value: '07', label: '07 - Biskra' }, { value: '08', label: '08 - Béchar' }, { value: '09', label: '09 - Blida' }, { value: '10', label: '10 - Bouira' },
    { value: '11', label: '11 - Tamanrasset' }, { value: '12', label: '12 - Tébessa' }, { value: '13', label: '13 - Tlemcen' }, { value: '14', label: '14 - Tiaret' }, { value: '15', label: '15 - Tizi Ouzou' },
    { value: '16', label: '16 - Alger' }, { value: '17', label: '17 - Djelfa' }, { value: '18', label: '18 - Jijel' }, { value: '19', label: '19 - Sétif' }, { value: '20', label: '20 - Saïda' },
    { value: '21', label: '21 - Skikda' }, { value: '22', label: '22 - Sidi Bel Abbès' }, { value: '23', label: '23 - Annaba' }, { value: '24', label: '24 - Guelma' }, { value: '25', label: '25 - Constantine' },
    { value: '26', label: '26 - Médéa' }, { value: '27', label: '27 - Mostaganem' }, { value: '28', label: '28 - M\'Sila' }, { value: '29', label: '29 - Mascara' }, { value: '30', label: '30 - Ouargla' },
    { value: '31', label: '31 - Oran' }, { value: '32', label: '32 - El Bayadh' }, { value: '33', label: '33 - Illizi' }, { value: '34', label: '34 - Bordj Bou Arreridj' }, { value: '35', label: '35 - Boumerdès' },
    { value: '36', label: '36 - El Tarf' }, { value: '37', label: '37 - Tindouf' }, { value: '38', label: '38 - Tissemsilt' }, { value: '39', label: '39 - El Oued' }, { value: '40', label: '40 - Khenchela' },
    { value: '41', label: '41 - Souk Ahras' }, { value: '42', label: '42 - Tipaza' }, { value: '43', label: '43 - Mila' }, { value: '44', label: '44 - Aïn Defla' }, { value: '45', label: '45 - Naâma' },
    { value: '46', label: '46 - Aïn Témouchent' }, { value: '47', label: '47 - Ghardaïa' }, { value: '48', label: '48 - Relizane' }, { value: '49', label: '49 - Timimoun' }, { value: '50', label: '50 - Bordj Badji Mokhtar' },
    { value: '51', label: '51 - Ouled Djellal' }, { value: '52', label: '52 - Béni Abbès' }, { value: '53', label: '53 - In Salah' }, { value: '54', label: '54 - In Guezzam' }, { value: '55', label: '55 - Touggourt' },
    { value: '56', label: '56 - Djanet' }, { value: '57', label: '57 - El M\'Ghair' }, { value: '58', label: '58 - El Meniaa' }
];

const T_OPTIONS = [
    { value: '', label: '—' }, { value: 'TX', label: 'TX' }, { value: 'T0', label: 'T0' }, { value: 'Tis', label: 'Tis' },
    { value: 'T1', label: 'T1' }, { value: 'T1a', label: 'T1a' }, { value: 'T1b', label: 'T1b' }, { value: 'T1c', label: 'T1c' },
    { value: 'T2', label: 'T2' }, { value: 'T2a', label: 'T2a' }, { value: 'T2b', label: 'T2b' }, { value: 'T2c', label: 'T2c' },
    { value: 'T3', label: 'T3' }, { value: 'T3a', label: 'T3a' }, { value: 'T3b', label: 'T3b' }, { value: 'T3c', label: 'T3c' },
    { value: 'T4', label: 'T4' }, { value: 'T4a', label: 'T4a' }, { value: 'T4b', label: 'T4b' }, { value: 'T4c', label: 'T4c' }
];

const N_OPTIONS = [
    { value: '', label: '—' }, { value: 'NX', label: 'NX' }, { value: 'N0', label: 'N0' }, { value: 'N1', label: 'N1' },
    { value: 'N2', label: 'N2' }, { value: 'N2a', label: 'N2a' }, { value: 'N2b', label: 'N2b' }, { value: 'N2c', label: 'N2c' },
    { value: 'N3', label: 'N3' }, { value: 'N3a', label: 'N3a' }, { value: 'N3b', label: 'N3b' }, { value: 'N3c', label: 'N3c' }
];

const M_OPTIONS = [
    { value: '', label: '—' }, { value: 'MX', label: 'MX' }, { value: 'M0', label: 'M0' }, { value: 'M1', label: 'M1' },
    { value: 'M1a', label: 'M1a' }, { value: 'M1b', label: 'M1b' }, { value: 'M1c', label: 'M1c' }
];

const STAGE_OPTIONS = [
    { value: '', label: '—' }, { value: '0', label: '0' }, { value: 'I', label: 'I' }, { value: 'IA', label: 'IA' }, { value: 'IB', label: 'IB' },
    { value: 'II', label: 'II' }, { value: 'IIA', label: 'IIA' }, { value: 'IIB', label: 'IIB' },
    { value: 'III', label: 'III' }, { value: 'IIIA', label: 'IIIA' }, { value: 'IIIB', label: 'IIIB' }, { value: 'IIIC', label: 'IIIC' },
    { value: 'IV', label: 'IV' }, { value: 'IVA', label: 'IVA' }, { value: 'IVB', label: 'IVB' }, { value: 'IVC', label: 'IVC' }, { value: 'Inconnu', label: 'Inconnu' }
];

// ── Shared Components ────────────────────────────────────────────
interface FieldProps {
    label: string, value: string, onChange: (v: string) => void,
    placeholder?: string, options?: { value: string, label: string }[],
    type?: string, full?: boolean, auto?: boolean, disabled?: boolean,
    error?: string, warn?: string;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, placeholder, options, type = 'text', full, auto, disabled, error, warn }) => (
    <div className={`space-y-1 ${full ? 'col-span-full' : ''}`}>
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</label>
            {auto && <div className="flex items-center gap-1 text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100"><Zap size={8} /> Auto</div>}
        </div>
        {options ? (
            <div className="relative group">
                <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-50/50 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    {options.map(o => <option key={o.value} value={o.value} className="bg-white text-slate-800">{o.label}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors"><ChevronDown size={14} /></div>
            </div>
        ) : (
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-300 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-50/50 ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`} />
        )}
        {(error || warn) && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-[10px] mt-1 flex items-center gap-1 ${error ? 'text-rose-400' : 'text-amber-400'}`}><AlertCircle size={9} />{error || warn}</motion.p>}
    </div>
);

const SectionHeader = ({ title, icon: Icon, badge }: { title: string; icon: any; badge?: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><Icon size={16} /></div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex-1">{title}</h3>
        {badge && <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase border border-slate-200">{badge}</span>}
    </div>
);

const ReadOnlyCard = ({ title, icon: Icon, data, badge }: { title: string, icon: any, data: { label: string, value: string }[] | Record<string, string>, badge?: string }) => (
    <div className="portal-card p-5 bg-slate-50/50 border-slate-200">
        <SectionHeader title={title} icon={Icon} badge={badge || "Lecture Seule"} />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4">
            {Array.isArray(data) ? data.map((d, i) => d.value ? (
                <div key={i}>
                    <p className="text-[10px] font-semibold text-slate-500 mb-0.5">{d.label}</p>
                    <p className="text-sm font-medium text-slate-700">{d.value}</p>
                </div>
            ) : null) : Object.entries(data).map(([label, value], i) => value ? (
                <div key={i}>
                    <p className="text-[10px] font-semibold text-slate-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-slate-700">{value}</p>
                </div>
            ) : null)}
        </div>
    </div>
);

// ── Main Form Component ──────────────────────────────────────────
interface PatientFormProps {
    role: 'admin' | 'medecin' | 'anapate' | 'labo';
    prefillData?: any;
    initialData?: any;
    activeModule?: string | null;
}

const PatientForm: React.FC<PatientFormProps> = ({ role, prefillData, initialData, activeModule = 'full' }) => {
    const [formData, setFormData] = useState({
        nid: '', last_name: '', first_name: '', maiden_name: '', gender: '9', birth_date: '', birth_place: '',
        phone: '', nationality: 'Algérienne', marital_status: 'U', occupation: '',
        address_1: '', wilaya: '', commune: '',
        vital_status: 'A', date_of_death: '', autopsy: '',
        family_history: '9', performance_status: '9', comorbidities: '',
        smoking_status: '9', alcohol_status: '9', menopause_status: '9',
        incidence_date: '', topo_code: '', basis_of_diagnosis: '9',
        clinical_t: '', clinical_n: '', clinical_m: '', clinical_stage: '',
        laterality: '0', notes: '',
        source_type: 'CL', hospital_name: '', department: '', practitioner_name: '', clinical_text: '',
        morpho_code: '', behaviour: '3', grade: '9',
        path_t: '', path_n: '', path_m: '', path_stage: '',
        tumor_size: '', report_number: '', pathology_text: '', reader_id: '', nodes_pos: '',
        psa: '', cea: '', ca125: '', ca199: '', afp: '', hcg: '',
        hemoglobin: '', wbc: '', platelets: '', ldh: '', alp: '',
        labo_notes: '', labo_date: '',
        her2: '', er_percent: '', pr_percent: '', ki67: '', egfr: '', alk: '', braf: '', pdl1: '',
        registration_number: '', record_status: '0', check_status: 'Unchecked',
        icd10_code: '', treatment_1: '9', treatment_2: '', mp_code: '00',
    });

    const [dynamicData, setDynamicData] = useState<Record<string, string>>({});
    const [dynamicConfigs, setDynamicConfigs] = useState<any[]>([]);
    const [autoFlags, setAutoFlags] = useState<Record<string, boolean>>({});
    const [vResults, setVResults] = useState<{ errors: string[], warnings: string[] }>({ errors: [], warnings: [] });
    const [collisionData, setCollisionData] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dictOptions, setDictOptions] = useState<Record<string, { value: string, label: string }[]>>({});

    const [activeSection, setActiveSection] = useState<'identity' | 'clinical' | 'anapath' | 'labo' | 'admin'>(() => {
        if (activeModule === 'full' || !activeModule) {
            if (role === 'medecin') return 'identity';
            if (role === 'labo') return 'labo';
            if (role === 'anapate') return 'anapath';
            return 'admin';
        }
        return 'clinical';
    });

    const [tumors, setTumors] = useState<any[]>([
        { id: 1, name: 'Tumeur 1', morpho_code: '', topo_code: '', laterality: '0', basis_of_diagnosis: '9', behaviour: '3', grade: '9', path_t: '', path_n: '', path_m: '', path_stage: '', tumor_size: '', report_number: '', nodes_pos: '' }
    ]);
    const [activeTumorId, setActiveTumorId] = useState<number>(1);

    const tumorFieldKeys = [
        'morpho_code', 'topo_code', 'laterality', 'basis_of_diagnosis', 
        'behaviour', 'grade', 'path_t', 'path_n', 'path_m', 'path_stage', 
        'tumor_size', 'report_number', 'nodes_pos'
    ];

    const set = (k: string, v: any) => {
        setFormData(p => {
            const next = { ...p, [k]: v };
            if (tumorFieldKeys.includes(k)) {
                setTumors(tums => tums.map(t => t.id === activeTumorId ? { ...t, [k]: v } : t));
            }
            return next;
        });
    };

    const switchActiveTumor = (targetId: number) => {
        const targetTumor = tumors.find(t => t.id === targetId);
        if (!targetTumor) return;
        setActiveTumorId(targetId);
        setFormData(p => {
            const next = { ...p };
            tumorFieldKeys.forEach(key => {
                next[key] = targetTumor[key] || (key === 'behaviour' ? '3' : key === 'grade' || key === 'basis_of_diagnosis' ? '9' : '');
            });
            return next;
        });
    };

    const addMultipleTumor = () => {
        const nextId = tumors.length + 1;
        const newTumor = {
            id: nextId,
            name: `Tumeur ${nextId}`,
            morpho_code: '',
            topo_code: '',
            laterality: '0',
            basis_of_diagnosis: '9',
            behaviour: '3',
            grade: '9',
            path_t: '',
            path_n: '',
            path_m: '',
            path_stage: '',
            tumor_size: '',
            report_number: '',
            nodes_pos: ''
        };
        setTumors(prev => [...prev, newTumor]);
        setActiveTumorId(nextId);
        setFormData(p => {
            const next = { ...p };
            tumorFieldKeys.forEach(key => {
                next[key] = newTumor[key];
            });
            return next;
        });
    };

    useEffect(() => {
        const fetchDict = async () => {
            try {
                const res = await fetch('/api/dictionary/');
                if (res.ok) {
                    const data = await res.json();
                    const grouped: Record<string, { value: string, label: string }[]> = {};
                    data.forEach((item: any) => {
                        if (!grouped[item.section]) grouped[item.section] = [];
                        grouped[item.section].push({ value: item.code, label: `${item.code} - ${item.label}` });
                    });
                    setDictOptions(grouped);
                }
            } catch (e) { console.error(e); }
        };
        fetchDict();
        
        const configs = JSON.parse(localStorage.getItem('dynamic_fields_config') || '[]');
        setDynamicConfigs(configs);
    }, []);

    useEffect(() => {
        if (initialData) {
            // Retrieve any codes entered in the Codage CIM-O-3 Batch Terminal!
            const batchCoded = JSON.parse(localStorage.getItem('batch_coded_patients') || '{}');
            const patientCoded = batchCoded[initialData.nid] || {};
            setFormData(p => ({ 
                ...p, 
                ...initialData,
                ...patientCoded
            }));
        }
    }, [initialData]);

    useEffect(() => {
        if (prefillData) setFormData(p => ({ ...p, ...prefillData }));
    }, [prefillData]);

    const age = useMemo(() => calcAge(formData.birth_date, formData.incidence_date || ''), [formData.birth_date, formData.incidence_date]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => { setLoading(false); setSuccess(true); }, 1000);
    };

    const isDisabled = (section: 'identity' | 'clinical' | 'anapath' | 'labo' | 'admin') => {
        if (role === 'admin') return false;
        if (role === 'medecin') return !(section === 'identity' || section === 'clinical');
        if (role === 'anapate') return section !== 'anapath' && section !== 'clinical';
        if (role === 'labo') return section !== 'labo';
        return true;
    };

    const removeTumor = (tumorId: number) => {
        if (tumorId === 1) return; // Main tumor must remain
        
        setTumors(prev => {
            const filtered = prev.filter(t => t.id !== tumorId);
            // Re-index remaining tumors sequentially (Tumeur 1, Tumeur 2...)
            return filtered.map((t, idx) => ({
                ...t,
                id: idx + 1,
                name: `Tumeur ${idx + 1}`
            }));
        });
        
        if (activeTumorId === tumorId) {
            switchActiveTumor(1);
        } else if (activeTumorId > tumorId) {
            setActiveTumorId(prev => prev - 1);
        }
    };

    const isVisible = (fieldId: string) => {
        const config = dynamicConfigs.find(c => c.field_id === fieldId);
        return config ? config.is_visible : true;
    };

    if (success) return <div className="p-10 text-center">Succès !</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <Database size={24} className="text-blue-600" /> Registre Clinique
                </h2>
                <div className="flex gap-2">
                    {['identity', 'clinical', 'anapath', 'labo', 'admin'].map(s => (
                        <button key={s} type="button" onClick={() => setActiveSection(s as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeSection === s ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Helper for rendering custom dynamic fields from Studio */}
            <div className="hidden">
                {/* We will just inject this logic directly into the sections below */}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {activeSection === 'identity' && (
                    <fieldset disabled={isDisabled('identity')} className="portal-card p-6 bg-white border-slate-200 space-y-6 border-none outline-none disabled:bg-slate-50/30">
                        <SectionHeader title="Identité & Démographie" icon={User} badge={isDisabled('identity') ? "Lecture Seule" : undefined} />
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {isVisible('nid') && <Field label="NID" value={formData.nid} onChange={v => set('nid', v)} />}
                            {isVisible('last_name') && <Field label="Nom" value={formData.last_name} onChange={v => set('last_name', v)} />}
                            {isVisible('first_name') && <Field label="Prénom" value={formData.first_name} onChange={v => set('first_name', v)} />}
                            
                            <AnimatePresence>
                                {formData.gender === '2' && isVisible('maiden_name') && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <Field label="Nom de jeune fille" value={formData.maiden_name} onChange={v => set('maiden_name', v)} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isVisible('birth_date') && <Field label="Date de Naissance" value={formData.birth_date} onChange={v => set('birth_date', v)} />}
                            {isVisible('birth_place') && <Field label="Lieu de Naissance" value={formData.birth_place} onChange={v => set('birth_place', v)} />}
                            {isVisible('gender') && <Field label="Sexe" value={formData.gender} onChange={v => set('gender', v)} options={[{value:'1', label:'Homme'}, {value:'2', label:'Femme'}, {value:'9', label:'Inconnu'}]} />}
                            {isVisible('nationality') && <Field label="Nationalité" value={formData.nationality} onChange={v => set('nationality', v)} />}
                            {isVisible('marital_status') && <Field label="Situation Familiale" value={formData.marital_status} onChange={v => set('marital_status', v)} options={[{value:'S', label:'Célibataire'}, {value:'M', label:'Marié'}, {value:'D', label:'Divorcé'}, {value:'W', label:'Veuf'}, {value:'U', label:'Inconnu'}]} />}
                            {isVisible('occupation') && <Field label="Profession" value={formData.occupation} onChange={v => set('occupation', v)} />}
                            {isVisible('phone') && <Field label="Numéro de Téléphone" value={formData.phone} onChange={v => set('phone', v)} />}
                            {isVisible('address_1') && <Field label="Adresse Précise" value={formData.address_1} onChange={v => set('address_1', v)} />}
                            {isVisible('wilaya') && <Field label="Wilaya" value={formData.wilaya} onChange={v => set('wilaya', v)} options={WILAYA_OPTIONS} />}
                            {isVisible('commune') && <Field label="Commune" value={formData.commune} onChange={v => set('commune', v)} />}
                            {isVisible('vital_status') && <Field label="Statut Vital" value={formData.vital_status} onChange={v => set('vital_status', v)} options={[{value:'A', label:'Vivant'}, {value:'D', label:'Décédé'}, {value:'U', label:'Inconnu'}]} />}

                            <AnimatePresence>
                                {formData.vital_status === 'D' && (
                                    <>
                                        {isVisible('date_of_death') && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                <Field label="Date de décès" value={formData.date_of_death} onChange={v => set('date_of_death', v)} />
                                            </motion.div>
                                        )}
                                        {isVisible('autopsy') && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                <Field label="Autopsie" value={formData.autopsy || ''} onChange={v => set('autopsy', v)} options={[{value:'Y', label:'Oui'}, {value:'N', label:'Non'}, {value:'U', label:'Inconnu'}]} />
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </AnimatePresence>

                            {isVisible('family_history') && <Field label="Antécédents Familiaux" value={formData.family_history} onChange={v => set('family_history', v)} options={[{value:'0', label:'Aucun'}, {value:'1', label:'Présents'}, {value:'9', label:'Inconnu'}]} />}
                            {isVisible('comorbidities') && <Field label="Comorbidités" value={formData.comorbidities} onChange={v => set('comorbidities', v)} />}
                            {isVisible('smoking_status') && <Field label="Tabagisme" value={formData.smoking_status} onChange={v => set('smoking_status', v)} options={[{value:'0', label:'Non-fumeur'}, {value:'1', label:'Fumeur actif'}, {value:'2', label:'Ex-fumeur'}, {value:'9', label:'Inconnu'}]} />}
                            {isVisible('alcohol_status') && <Field label="Alcoolisme" value={formData.alcohol_status} onChange={v => set('alcohol_status', v)} options={[{value:'0', label:'Non-consommateur'}, {value:'1', label:'Consommateur actif'}, {value:'9', label:'Inconnu'}]} />}
                            {isVisible('menopause_status') && <Field label="Statut Ménopausique" value={formData.menopause_status} onChange={v => set('menopause_status', v)} options={[{value:'0', label:'Non ménopausée'}, {value:'1', label:'Ménopausée'}, {value:'9', label:'Inconnu'}]} />}

                            {/* Render custom dynamic fields for identity */}
                            <AnimatePresence>
                                {dynamicConfigs.filter(c => c.section === 'identity' && c.is_visible).map(c => {
                                    if (c.depends_on_field && c.depends_on_value && (formData as any)[c.depends_on_field] !== c.depends_on_value) return null;
                                    let opts = undefined;
                                    if (c.type === 'select' && c.options) opts = c.options.split(',').map((o: string) => ({ value: o.trim(), label: o.trim() }));
                                    return (
                                        <motion.div key={c.field_id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <Field label={c.label} value={dynamicData[c.field_id] || ''} onChange={v => setDynamicData(p => ({ ...p, [c.field_id]: v }))} type={c.type === 'date' ? 'text' : c.type} options={opts} />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </fieldset>
                )}

                {activeSection === 'clinical' && (
                    <fieldset disabled={isDisabled('clinical')} className="portal-card p-6 bg-white border-slate-200 space-y-6 border-none outline-none disabled:bg-slate-50/30">
                        <SectionHeader title="Bilan Clinique" icon={Stethoscope} badge={isDisabled('clinical') ? "Lecture Seule" : undefined} />
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {isVisible('incidence_date') && <Field label="Date Incidence" value={formData.incidence_date} onChange={v => set('incidence_date', v)} />}
                            {isVisible('topo_code') && <Field label="Topographie" value={formData.topo_code} onChange={v => set('topo_code', v)} />}
                            
                            <AnimatePresence>
                                {PAIRED_SITES.some(code => formData.topo_code?.startsWith(code)) && isVisible('laterality') && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <Field label="Latéralité" value={formData.laterality} onChange={v => set('laterality', v)} options={[{value:'1', label:'Droite'}, {value:'2', label:'Gauche'}, {value:'3', label:'Unilatérale (NSP)'}, {value:'4', label:'Bilatérale'}]} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {isVisible('basis_of_diagnosis') && (
                                <Field label="Base du Diagnostic" value={formData.basis_of_diagnosis} onChange={v => {
                                    set('basis_of_diagnosis', v);
                                    if (v === '0') set('vital_status', 'D'); // DCO implies Dead
                                }} options={dictOptions['BASIS']} />
                            )}

                            {isVisible('clinical_t') && <Field label="cT (T Clinique)" value={formData.clinical_t} onChange={v => set('clinical_t', v)} />}
                            {isVisible('clinical_n') && <Field label="cN (N Clinique)" value={formData.clinical_n} onChange={v => set('clinical_n', v)} />}
                            {isVisible('clinical_m') && <Field label="cM (M Clinique)" value={formData.clinical_m} onChange={v => set('clinical_m', v)} />}
                            {isVisible('clinical_stage') && <Field label="Stade Clinique" value={formData.clinical_stage} onChange={v => set('clinical_stage', v)} />}
                            {isVisible('source_type') && <Field label="Type de Source" value={formData.source_type} onChange={v => set('source_type', v)} options={[{value:'CL', label:'Clinique'}, {value:'AP', label:'Anapath'}, {value:'LB', label:'Labo'}, {value:'CO', label:'Certificat de Décès (DCO)'}]} />}
                            {isVisible('hospital_name') && <Field label="Nom de l'Hôpital" value={formData.hospital_name} onChange={v => set('hospital_name', v)} />}
                            {isVisible('department') && <Field label="Service Saisisseur" value={formData.department} onChange={v => set('department', v)} />}
                            {isVisible('practitioner_name') && <Field label="Médecin Praticien" value={formData.practitioner_name} onChange={v => set('practitioner_name', v)} />}

                            {/* Render custom dynamic fields for clinical */}
                            <AnimatePresence>
                                {dynamicConfigs.filter(c => c.section === 'clinical' && c.is_visible).map(c => {
                                    if (c.depends_on_field && c.depends_on_value && (formData as any)[c.depends_on_field] !== c.depends_on_value) return null;
                                    let opts = undefined;
                                    if (c.type === 'select' && c.options) opts = c.options.split(',').map((o: string) => ({ value: o.trim(), label: o.trim() }));
                                    return (
                                        <motion.div key={c.field_id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <Field label={c.label} value={dynamicData[c.field_id] || ''} onChange={v => setDynamicData(p => ({ ...p, [c.field_id]: v }))} type={c.type === 'date' ? 'text' : c.type} options={opts} />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </fieldset>
                )}

                {activeSection === 'anapath' && (
                    <fieldset disabled={isDisabled('anapath')} className="portal-card p-6 bg-white border-slate-200 space-y-6 border-none outline-none disabled:bg-slate-50/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                            <SectionHeader title="Anatomie Pathologique" icon={Microscope} badge={isDisabled('anapath') ? "Lecture Seule" : undefined} />
                            
                            {/* Tumor manager list */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tumeurs ({tumors.length}) :</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {tumors.map(t => (
                                        <div key={t.id} className="flex items-center bg-slate-100 hover:bg-slate-200 rounded-lg p-0.5 transition-all">
                                            <button 
                                                type="button" 
                                                onClick={() => switchActiveTumor(t.id)}
                                                className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all ${activeTumorId === t.id ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600'}`}
                                            >
                                                {t.name} {t.morpho_code ? `(${t.morpho_code})` : ''}
                                            </button>
                                            {t.id > 1 && !isDisabled('anapath') && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeTumor(t.id)}
                                                    className="px-1 text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Supprimer cette tumeur"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {!isDisabled('anapath') && (
                                        <button 
                                            type="button" 
                                            onClick={addMultipleTumor}
                                            className="px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                                        >
                                            + Ajouter
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {isVisible('morpho_code') && <Field label="Morphologie" value={formData.morpho_code} onChange={v => set('morpho_code', v)} />}
                            {isVisible('behaviour') && <Field label="Comportement" value={formData.behaviour} onChange={v => set('behaviour', v)} options={[{value:'3', label:'Malin'}]} />}
                            {isVisible('grade') && <Field label="Grade" value={formData.grade} onChange={v => set('grade', v)} options={[{value:'9', label:'Inconnu'}]} />}
                            {isVisible('path_t') && <Field label="pT (T Pathologique)" value={formData.path_t} onChange={v => set('path_t', v)} />}
                            {isVisible('path_n') && <Field label="pN (N Pathologique)" value={formData.path_n} onChange={v => set('path_n', v)} />}
                            {isVisible('path_m') && <Field label="pM (M Pathologique)" value={formData.path_m} onChange={v => set('path_m', v)} />}
                            {isVisible('path_stage') && <Field label="Stade Pathologique" value={formData.path_stage} onChange={v => set('path_stage', v)} />}
                            {isVisible('tumor_size') && <Field label="Taille Tumeur (mm)" value={formData.tumor_size} onChange={v => set('tumor_size', v)} type="number" />}
                            {isVisible('report_number') && <Field label="Numéro CR Anapath" value={formData.report_number} onChange={v => set('report_number', v)} />}
                            {isVisible('nodes_pos') && <Field label="Ganglions Positifs" value={formData.nodes_pos} onChange={v => set('nodes_pos', v)} type="number" />}
                            
                            {/* Render custom dynamic fields for anapath */}
                            <AnimatePresence>
                                {dynamicConfigs.filter(c => c.section === 'anapath' && c.is_visible).map(c => {
                                    if (c.depends_on_field && c.depends_on_value && (formData as any)[c.depends_on_field] !== c.depends_on_value) return null;
                                    let opts = undefined;
                                    if (c.type === 'select' && c.options) opts = c.options.split(',').map((o: string) => ({ value: o.trim(), label: o.trim() }));
                                    return (
                                        <motion.div key={c.field_id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <Field label={c.label} value={dynamicData[c.field_id] || ''} onChange={v => setDynamicData(p => ({ ...p, [c.field_id]: v }))} type={c.type === 'date' ? 'text' : c.type} options={opts} />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </fieldset>
                )}

                {activeSection === 'labo' && (
                    <fieldset disabled={isDisabled('labo')} className="portal-card p-6 bg-white border-slate-200 space-y-6 border-none outline-none disabled:bg-slate-50/30">
                        <SectionHeader title="Laboratoire" icon={FlaskConical} badge={isDisabled('labo') ? "Lecture Seule" : undefined} />
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {isVisible('psa') && <Field label="PSA" value={formData.psa} onChange={v => set('psa', v)} type="number" />}
                            {isVisible('cea') && <Field label="CEA" value={formData.cea} onChange={v => set('cea', v)} type="number" />}
                            {isVisible('ca125') && <Field label="CA 125" value={formData.ca125} onChange={v => set('ca125', v)} type="number" />}
                            {isVisible('ca199') && <Field label="CA 19-9" value={formData.ca199} onChange={v => set('ca199', v)} type="number" />}
                            {isVisible('afp') && <Field label="AFP" value={formData.afp} onChange={v => set('afp', v)} type="number" />}
                            {isVisible('hcg') && <Field label="HCG" value={formData.hcg} onChange={v => set('hcg', v)} type="number" />}
                            {isVisible('hemoglobin') && <Field label="Hémoglobine" value={formData.hemoglobin} onChange={v => set('hemoglobin', v)} type="number" />}
                            {isVisible('wbc') && <Field label="Globules Blancs" value={formData.wbc} onChange={v => set('wbc', v)} type="number" />}
                            {isVisible('platelets') && <Field label="Plaquettes" value={formData.platelets} onChange={v => set('platelets', v)} type="number" />}
                            {isVisible('ldh') && <Field label="LDH" value={formData.ldh} onChange={v => set('ldh', v)} type="number" />}
                            {isVisible('alp') && <Field label="Phosphatase Alcaline" value={formData.alp} onChange={v => set('alp', v)} type="number" />}
                            {isVisible('labo_date') && <Field label="Date Labo" value={formData.labo_date} onChange={v => set('labo_date', v)} />}
                            {isVisible('her2') && <Field label="HER2" value={formData.her2} onChange={v => set('her2', v)} options={[{value:'0', label:'Négatif'}, {value:'1', label:'1+'}, {value:'2', label:'2+'}, {value:'3', label:'3+'}, {value:'U', label:'Inconnu'}]} />}
                            {isVisible('er_percent') && <Field label="ER (%)" value={formData.er_percent} onChange={v => set('er_percent', v)} type="number" />}
                            {isVisible('pr_percent') && <Field label="PR (%)" value={formData.pr_percent} onChange={v => set('pr_percent', v)} type="number" />}
                            {isVisible('ki67') && <Field label="Ki-67 (%)" value={formData.ki67} onChange={v => set('ki67', v)} type="number" />}
                            {isVisible('egfr') && <Field label="EGFR Mutation" value={formData.egfr} onChange={v => set('egfr', v)} options={[{value:'M', label:'Muté'}, {value:'W', label:'Sauvage'}, {value:'U', label:'Inconnu'}]} />}
                            {isVisible('alk') && <Field label="ALK Mutation" value={formData.alk} onChange={v => set('alk', v)} options={[{value:'P', label:'Positif'}, {value:'N', label:'Négatif'}, {value:'U', label:'Inconnu'}]} />}
                            {isVisible('braf') && <Field label="BRAF Mutation" value={formData.braf} onChange={v => set('braf', v)} options={[{value:'M', label:'Muté'}, {value:'W', label:'Sauvage'}, {value:'U', label:'Inconnu'}]} />}
                            {isVisible('pdl1') && <Field label="PD-L1 Status" value={formData.pdl1} onChange={v => set('pdl1', v)} options={[{value:'P', label:'Positif'}, {value:'N', label:'Négatif'}, {value:'U', label:'Inconnu'}]} />}

                            {/* Render custom dynamic fields for labo */}
                            <AnimatePresence>
                                {dynamicConfigs.filter(c => c.section === 'labo' && c.is_visible).map(c => {
                                    if (c.depends_on_field && c.depends_on_value && (formData as any)[c.depends_on_field] !== c.depends_on_value) return null;
                                    let opts = undefined;
                                    if (c.type === 'select' && c.options) opts = c.options.split(',').map((o: string) => ({ value: o.trim(), label: o.trim() }));
                                    return (
                                        <motion.div key={c.field_id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <Field label={c.label} value={dynamicData[c.field_id] || ''} onChange={v => setDynamicData(p => ({ ...p, [c.field_id]: v }))} type={c.type === 'date' ? 'text' : c.type} options={opts} />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </fieldset>
                )}

                {activeSection === 'admin' && (
                    <fieldset disabled={isDisabled('admin')} className="portal-card p-6 bg-white border-slate-200 space-y-6 border-none outline-none disabled:bg-slate-50/30">
                        <SectionHeader title="Administration" icon={Shield} badge={isDisabled('admin') ? "Lecture Seule" : undefined} />
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {isVisible('registration_number') && <Field label="N° Enregistrement" value={formData.registration_number} onChange={v => set('registration_number', v)} />}
                            {isVisible('record_status') && <Field label="Statut" value={formData.record_status} onChange={v => set('record_status', v)} options={[{value:'0', label:'Attente'}, {value:'1', label:'Validé'}]} />}
                            {isVisible('check_status') && <Field label="Vérification IARC" value={formData.check_status} onChange={v => set('check_status', v)} options={[{value:'OK', label:'Conforme'}]} />}
                            {isVisible('icd10_code') && <Field label="Code CIM-10" value={formData.icd10_code} onChange={v => set('icd10_code', v)} />}
                            {isVisible('treatment_1') && <Field label="Traitement Principal" value={formData.treatment_1} onChange={v => set('treatment_1', v)} options={[{value:'0', label:'Chirurgie'}, {value:'1', label:'Chimiothérapie'}, {value:'2', label:'Radiothérapie'}, {value:'3', label:'Hormonothérapie'}, {value:'9', label:'Inconnu'}]} />}
                            {isVisible('treatment_2') && <Field label="Traitement Secondaire" value={formData.treatment_2} onChange={v => set('treatment_2', v)} />}
                            {isVisible('mp_code') && <Field label="Code Multiples" value={formData.mp_code} onChange={v => set('mp_code', v)} />}

                            {/* Render custom dynamic fields for admin */}
                            <AnimatePresence>
                                {dynamicConfigs.filter(c => c.section === 'admin' && c.is_visible).map(c => {
                                    if (c.depends_on_field && c.depends_on_value && (formData as any)[c.depends_on_field] !== c.depends_on_value) return null;
                                    let opts = undefined;
                                    if (c.type === 'select' && c.options) opts = c.options.split(',').map((o: string) => ({ value: o.trim(), label: o.trim() }));
                                    return (
                                        <motion.div key={c.field_id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <Field label={c.label} value={dynamicData[c.field_id] || ''} onChange={v => setDynamicData(p => ({ ...p, [c.field_id]: v }))} type={c.type === 'date' ? 'text' : c.type} options={opts} />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </fieldset>
                )}
            </div>

            <div className="flex justify-end pt-4">
                <button type="submit" className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                    Enregistrer le Dossier
                </button>
            </div>
        </form>
    );
};

export default PatientForm;
