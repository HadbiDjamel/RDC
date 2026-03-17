import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle, CheckCircle2, Database, Stethoscope, FileText, Activity,
    Zap, Shield, Microscope, Phone, FlaskConical, ChevronDown, User
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────
const FEMALE_SITES = ['C50', 'C51', 'C52', 'C53', 'C54', 'C55', 'C56', 'C57', 'C58'];
const MALE_SITES = ['C60', 'C61', 'C62', 'C63'];
const PAIRED_SITES = ['C50', 'C34', 'C64', 'C69', 'C74', 'C62', 'C56', 'C44'];

function calcAge(b: string, r: string): number | null {
    const parse = (s: string) => { const p = s.split('/'); if (p.length !== 3) return null; const [d, m, y] = p.map(Number); if (!y || y === 9999) return null; return { d: d === 99 ? 1 : d, m: m === 99 ? 1 : m, y }; };
    const bp = parse(b), rp = parse(r); if (!bp || !rp) return null;
    let a = rp.y - bp.y; if (rp.m < bp.m || (rp.m === bp.m && rp.d < bp.d)) a--; return a >= 0 ? a : null;
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
            {auto && <div className="flex items-center gap-1 text-[8px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full"><Zap size={8} /> Auto</div>}
        </div>
        {options ? (
            <div className="relative group">
                <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className={`w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    {options.map(o => <option key={o.value} value={o.value} className="bg-slate-900 text-white">{o.label}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-slate-300 transition-colors"><ChevronDown size={14} /></div>
            </div>
        ) : (
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className={`w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 placeholder:text-slate-700 transition-all ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`} />
        )}
        {(error || warn) && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-[10px] mt-1 flex items-center gap-1 ${error ? 'text-rose-400' : 'text-amber-400'}`}><AlertCircle size={9} />{error || warn}</motion.p>}
    </div>
);

const SectionHeader = ({ title, icon: Icon, badge }: { title: string; icon: any; badge?: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400"><Icon size={16} /></div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex-1">{title}</h3>
        {badge && <span className="text-[8px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase border border-slate-500/20">{badge}</span>}
    </div>
);

const ReadOnlyCard = ({ title, icon: Icon, data, badge }: { title: string, icon: any, data: { label: string, value: string }[] | Record<string, string>, badge?: string }) => (
    <div className="glass-card p-5 bg-black/20 border-white/5">
        <SectionHeader title={title} icon={Icon} badge={badge || "Lecture Seule"} />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-4">
            {Array.isArray(data) ? data.map((d, i) => d.value ? (
                <div key={i}>
                    <p className="text-[10px] font-semibold text-slate-500 mb-0.5">{d.label}</p>
                    <p className="text-sm font-medium text-slate-300">{d.value}</p>
                </div>
            ) : null) : Object.entries(data).map(([label, value], i) => value ? (
                <div key={i}>
                    <p className="text-[10px] font-semibold text-slate-500 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-slate-300">{value}</p>
                </div>
            ) : null)}
        </div>
    </div>
);

// ── Props ────────────────────────────────────────────────────────
interface PatientFormProps {
    role: 'admin' | 'medecin' | 'anapate' | 'labo';
    prefillData?: any;
    initialData?: any;
    activeModule?: string | null;
}

// ── Main Form ────────────────────────────────────────────────────
const PatientForm: React.FC<PatientFormProps> = ({ role, prefillData, initialData, activeModule = 'full' }) => {
    const [formData, setFormData] = useState({
        // Identity (Médecin)
        nid: '', last_name: '', first_name: '', maiden_name: '', gender: '9', birth_date: '', birth_place: '',
        phone: '', nationality: 'Algérienne', marital_status: 'U', occupation: '',
        address_1: '', wilaya: '', commune: '',
        vital_status: 'A', date_of_death: '',
        // Clinical Base
        family_history: '9', performance_status: '9', comorbidities: '',
        smoking_status: '9', alcohol_status: '9', menopause_status: '9',
        // Clinical (Médecin)
        incidence_date: '', topo_code: '', basis_of_diagnosis: '9',
        clinical_t: '', clinical_n: '', clinical_m: '', clinical_stage: '',
        laterality: '0', notes: '',
        // Source (Médecin)
        source_type: 'CL', hospital_name: '', department: '', practitioner_name: '', clinical_text: '',
        // Pathology (Anapath)
        morpho_code: '', behaviour: '3', grade: '9',
        path_t: '', path_n: '', path_m: '', path_stage: '',
        tumor_size: '', report_number: '', pathology_text: '', reader_id: '', nodes_pos: '',
        // Labo
        psa: '', cea: '', ca125: '', ca199: '', afp: '', hcg: '',
        hemoglobin: '', wbc: '', platelets: '', ldh: '', alp: '',
        labo_notes: '', labo_date: '',
        her2: '', er_percent: '', pr_percent: '', ki67: '', egfr: '', alk: '', braf: '', pdl1: '',
        // Admin
        registration_number: '', record_status: '0', check_status: 'Unchecked',
        icd10_code: '', treatment_1: '9', treatment_2: '', mp_code: '00',
    });
    const [autoFlags, setAutoFlags] = useState<Record<string, boolean>>({});
    const [vResults, setVResults] = useState<{ errors: string[], warnings: string[] }>({ errors: [], warnings: [] });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dictOptions, setDictOptions] = useState<Record<string, { value: string, label: string }[]>>({});

    // Spatial Modular Form State
    const [activeSection, setActiveSection] = useState<'identity' | 'clinical' | 'anapath' | 'labo' | 'admin'>(() => {
        if (activeModule === 'full' || !activeModule) {
            if (role === 'medecin') return 'identity';
            if (role === 'labo') return 'labo';
            if (role === 'anapate') return 'anapath';
            return 'admin';
        }
        if (activeModule === 'morpho' || activeModule === 'ptnm') return 'anapath';
        return (activeModule as 'identity' | 'clinical' | 'anapath' | 'labo' | 'admin');
    });

    const set = (k: string, v: any) => setFormData(p => ({ ...p, [k]: v }));

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
            } catch (e) {
                console.error("Failed to fetch dictionary", e);
            }
        };
        fetchDict();
    }, []);

    useEffect(() => {
        if (prefillData) {
            setFormData(p => ({ ...p, ...prefillData }));
            const flags: Record<string, boolean> = {};
            Object.keys(prefillData).forEach(k => { flags[k] = true; });
            setAutoFlags(p => ({ ...p, ...flags }));
        }
    }, [prefillData]);

    useEffect(() => {
        if (initialData) {
            setFormData(p => ({ ...p, ...initialData }));
        }
    }, [initialData]);

    useEffect(() => {
        const prefix = formData.topo_code.toUpperCase().split('.')[0];
        if (FEMALE_SITES.includes(prefix) && formData.gender !== '2') { set('gender', '2'); setAutoFlags(p => ({ ...p, gender: true })); }
        else if (MALE_SITES.includes(prefix) && formData.gender !== '1') { set('gender', '1'); setAutoFlags(p => ({ ...p, gender: true })); }
        else { setAutoFlags(p => ({ ...p, gender: false })); }
    }, [formData.topo_code, formData.gender]); // Added formData.gender to dependencies

    useEffect(() => {
        const m = formData.morpho_code.match(/\/(\d)$/);
        if (m && m[1] !== formData.behaviour) { set('behaviour', m[1]); setAutoFlags(p => ({ ...p, behaviour: true })); }
    }, [formData.morpho_code, formData.behaviour]); // Added formData.behaviour to dependencies

    useEffect(() => {
        const b = parseInt(formData.basis_of_diagnosis);
        if ([1, 2, 4].includes(b) && !formData.morpho_code) { set('morpho_code', '8000/3'); setAutoFlags(p => ({ ...p, morpho_code: true })); }
    }, [formData.basis_of_diagnosis, formData.morpho_code]); // Added formData.morpho_code to dependencies

    const age = useMemo(() => calcAge(formData.birth_date, formData.incidence_date || new Date().toLocaleDateString('fr-FR')), [formData.birth_date, formData.incidence_date]);
    const isDead = formData.vital_status === 'D';
    const isPaired = PAIRED_SITES.some(s => formData.topo_code.toUpperCase().startsWith(s));

    useEffect(() => {
        if (!formData.topo_code && !formData.morpho_code) return;
        const t = setTimeout(async () => {
            try {
                const r = await fetch('/api/validation/check/', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gender: formData.gender, topo_code: formData.topo_code, morpho_code: formData.morpho_code, age: age ?? 45 })
                });
                if (r.ok) setVResults(await r.json());
            } catch { }
        }, 800);
        return () => clearTimeout(t);
    }, [formData.topo_code, formData.morpho_code, formData.gender, age]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        setTimeout(() => { setLoading(false); setSuccess(true); }, 1200);
    };

    if (success) return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center max-w-lg mx-auto mt-10">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-6"><CheckCircle2 size={32} /></div>
            <h3 className="text-xl font-bold text-white mb-2">
                {role === 'medecin' ? 'Patient Enregistré — En attente Labo & Anapath' :
                    role === 'labo' ? 'Résultats Laboratoire Enregistrés' :
                        role === 'anapate' ? 'Codage Pathologique Sauvegardé' : 'Dossier Validé et Finalisé'}
            </h3>
            <p className="text-slate-500 text-sm mb-8">
                {role === 'medecin' ? 'Le dossier a été créé. Le laboratoire et le pathologiste peuvent ajouter leurs résultats.' :
                    role === 'labo' ? 'Les marqueurs tumoraux et résultats biologiques ont été enregistrés.' :
                        role === 'anapate' ? 'Les codes CIM-O-3, le grade et le staging pathologique ont été enregistrés.' :
                            'Le dossier est complet et conforme aux normes IARC. N° d\'enregistrement attribué.'}
            </p>
            <button onClick={() => setSuccess(false)} className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all">Continuer</button>
        </motion.div>
    );

    // ── Hard Stop for Contextless Ancillary Roles ───────────────────
    if (role !== 'medecin' && !formData.nid) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card border-rose-500/30 p-12 text-center max-w-lg mx-auto mt-10">
                <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-400 mx-auto mb-6"><AlertCircle size={32} /></div>
                <h3 className="text-xl font-bold text-white mb-2">Aucun Patient Sélectionné</h3>
                <p className="text-slate-400 text-sm mb-6">
                    Vous ne pouvez pas effectuer de saisie sans un dossier patient actif.
                    Veuillez charger un patient depuis votre file d'attente ou l'annuaire.
                </p>
            </motion.div>
        );
    }

    const isIdentityMissing = role === 'medecin' && (!formData.nid || !formData.last_name || !formData.first_name);

    // ── Role-specific rendering ──────────────────────────────────
    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        {role === 'medecin' && <><Stethoscope size={20} className="text-sky-400" /> {activeModule === 'full' ? 'Saisie Clinique' : 'Module Spécifique'}</>}
                        {role === 'labo' && <><FlaskConical size={20} className="text-amber-400" /> Résultats Laboratoire</>}
                        {role === 'anapate' && <><Microscope size={20} className="text-emerald-400" /> Codage Anapate</>}
                        {role === 'admin' && <><Shield size={20} className="text-violet-400" /> Validation IARC</>}
                    </h2>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mt-1">Section Active: {activeSection}</p>
                </div>
                {formData.nid && (
                    <div className="glass-card px-4 py-2 flex items-center gap-3 border-sky-500/20">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400"><User size={14} /></div>
                        <div>
                            <p className="text-[10px] font-black text-white uppercase">{formData.last_name} {formData.first_name}</p>
                            <p className="text-[8px] font-mono text-slate-500">{formData.nid}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ═══ PERSISTENT SIDEBAR NAVIGATION (ORGANIC PORTALS) ═══ */}
                <aside className="lg:col-span-2 flex flex-col gap-6 sticky top-10 items-center py-4">
                    {(role === 'medecin' || role === 'admin') && (
                        <motion.button type="button" onClick={() => setActiveSection('identity')} className="relative w-20 h-20 flex flex-col items-center justify-center transition-all group" animate={{ borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"], scale: activeSection === 'identity' ? 1.1 : 1 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-sky-500/80 to-indigo-600/80 backdrop-blur-xl border border-white/20 shadow-lg ${activeSection === 'identity' ? 'ring-4 ring-sky-500/40 shadow-[0_0_30px_rgba(14,165,233,0.4)]' : 'opacity-40 hover:opacity-100'}`} style={{ borderRadius: 'inherit' }} />
                            <div className="relative z-10 flex flex-col items-center text-white"><Database size={20} /><span className="text-[7px] font-black uppercase mt-1">ID</span></div>
                            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Identité</div>
                        </motion.button>
                    )}
                    {(role === 'medecin' || role === 'admin') && (
                        <motion.button type="button" onClick={() => setActiveSection('clinical')} className="relative w-20 h-20 flex flex-col items-center justify-center transition-all group" animate={{ borderRadius: ["50% 50% 40% 60% / 40% 60% 50% 50%", "40% 60% 60% 40% / 60% 40% 40% 60%", "50% 50% 40% 60% / 40% 60% 50% 50%"], scale: activeSection === 'clinical' ? 1.1 : 1 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-rose-500/80 to-orange-600/80 backdrop-blur-xl border border-white/20 shadow-lg ${activeSection === 'clinical' ? 'ring-4 ring-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'opacity-40 hover:opacity-100'}`} style={{ borderRadius: 'inherit' }} />
                            <div className="relative z-10 flex flex-col items-center text-white"><Stethoscope size={20} /><span className="text-[7px] font-black uppercase mt-1">CLI</span></div>
                            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Clinique</div>
                        </motion.button>
                    )}
                    {(role === 'anapate' || role === 'admin') && (
                        <motion.button type="button" onClick={() => setActiveSection('anapath')} className="relative w-20 h-20 flex flex-col items-center justify-center transition-all group" animate={{ borderRadius: ["30% 70% 50% 50% / 50% 50% 70% 30%", "70% 30% 50% 50% / 50% 50% 30% 70%", "30% 70% 50% 50% / 50% 50% 70% 30%"], scale: activeSection === 'anapath' ? 1.1 : 1 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/80 to-teal-600/80 backdrop-blur-xl border border-white/20 shadow-lg ${activeSection === 'anapath' ? 'ring-4 ring-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'opacity-40 hover:opacity-100'}`} style={{ borderRadius: 'inherit' }} />
                            <div className="relative z-10 flex flex-col items-center text-white"><Microscope size={20} /><span className="text-[7px] font-black uppercase mt-1">ANA</span></div>
                            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Anapath</div>
                        </motion.button>
                    )}
                    {(role === 'labo' || role === 'admin') && (
                        <motion.button type="button" onClick={() => setActiveSection('labo')} className="relative w-20 h-20 flex flex-col items-center justify-center transition-all group" animate={{ borderRadius: ["60% 40% 50% 50% / 50% 50% 40% 60%", "40% 60% 50% 50% / 50% 50% 60% 40%", "60% 40% 50% 50% / 50% 50% 40% 60%"], scale: activeSection === 'labo' ? 1.1 : 1 }} transition={{ duration: 11, repeat: Infinity, ease: "linear" }}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/80 to-yellow-600/80 backdrop-blur-xl border border-white/20 shadow-lg ${activeSection === 'labo' ? 'ring-4 ring-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'opacity-40 hover:opacity-100'}`} style={{ borderRadius: 'inherit' }} />
                            <div className="relative z-10 flex flex-col items-center text-white"><FlaskConical size={20} /><span className="text-[7px] font-black uppercase mt-1">BIO</span></div>
                            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Laboratoire</div>
                        </motion.button>
                    )}
                    {role === 'admin' && (
                        <motion.button type="button" onClick={() => setActiveSection('admin')} className="relative w-20 h-20 flex flex-col items-center justify-center transition-all group" animate={{ borderRadius: ["45% 55% 65% 35% / 55% 45% 35% 65%", "55% 45% 35% 65% / 45% 55% 65% 35%", "45% 55% 65% 35% / 55% 45% 35% 65%"], scale: activeSection === 'admin' ? 1.1 : 1 }} transition={{ duration: 13, repeat: Infinity, ease: "linear" }}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-violet-500/80 to-fuchsia-600/80 backdrop-blur-xl border border-white/20 shadow-lg ${activeSection === 'admin' ? 'ring-4 ring-violet-500/40 shadow-[0_0_30px_rgba(139,92,246,0.4)]' : 'opacity-40 hover:opacity-100'}`} style={{ borderRadius: 'inherit' }} />
                            <div className="relative z-10 flex flex-col items-center text-white"><Shield size={20} /><span className="text-[7px] font-black uppercase mt-1">ADM</span></div>
                            <div className="absolute left-full ml-4 px-3 py-1 bg-slate-800 text-white text-[9px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Administration</div>
                        </motion.button>
                    )}
                </aside>

                {/* ═══ MAIN DYNAMIC CONTENT SPACE ═══ */}
                <main className="lg:col-span-10 space-y-6">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeSection} initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.02, y: -10 }} transition={{ duration: 0.3 }} className="space-y-6">

                            {/* IDENTITY SECTION */}
                            {(role === 'medecin' || role === 'admin') && activeSection === 'identity' && (
                                <motion.div className="space-y-6" animate={{ y: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Identification" icon={User} badge="Requis" />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <Field label="NID" value={formData.nid} onChange={v => set('nid', v)} placeholder="Ex: 175312009231..." />
                                            <Field label="Nom" value={formData.last_name} onChange={v => set('last_name', v)} placeholder="Boudiaf" />
                                            <Field label="Prénom" value={formData.first_name} onChange={v => set('first_name', v)} placeholder="Mohammed" />
                                            <Field label="Nom de jeune fille" value={formData.maiden_name} onChange={v => set('maiden_name', v)} placeholder="—" />
                                            <Field label="Sexe" value={formData.gender} onChange={v => set('gender', v)} options={[{ value: '1', label: '♂' }, { value: '2', label: '♀' }, { value: '9', label: '?' }]} auto={autoFlags.gender} />
                                            <Field label="Date Naissance" value={formData.birth_date} onChange={v => set('birth_date', v)} placeholder="JJ/MM/AAAA" />
                                            <Field label="Lieu de Naissance" value={formData.birth_place} onChange={v => set('birth_place', v)} placeholder="W. d'Alger" />
                                        </div>
                                    </div>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Contact & État Matrimonial" icon={Phone} />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <Field label="Téléphone" value={formData.phone} onChange={v => set('phone', v)} placeholder="0555 XX XX XX" />
                                            <Field label="Wilaya" value={formData.wilaya} onChange={v => set('wilaya', v)} options={WILAYA_OPTIONS} />
                                            <Field label="État Civil" value={formData.marital_status} onChange={v => set('marital_status', v)} options={[{ value: 'S', label: 'Célib.' }, { value: 'M', label: 'Marié' }, { value: 'D', label: 'Divorcé(e)' }, { value: 'W', label: 'Veuf/Veuve' }, { value: 'U', label: 'Inconnu' }]} />
                                        </div>
                                    </div>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Statut Vital" icon={Activity} />
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <Field label="État" value={formData.vital_status} onChange={v => set('vital_status', v)} options={[{ value: 'A', label: 'Actif / Vivant' }, { value: 'D', label: 'Décédé' }, { value: 'U', label: 'Inconnu' }]} />
                                            {isDead && <Field label="Date Décès" value={formData.date_of_death} onChange={v => set('date_of_death', v)} placeholder="JJ/MM/AAAA" />}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* CLINICAL SECTION */}
                            {(role === 'medecin' || role === 'admin') && activeSection === 'clinical' && (
                                <motion.div className="space-y-6" animate={{ y: [0, -4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Détails Tumeur" icon={Stethoscope} />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <Field label="Date Incidence" value={formData.incidence_date} onChange={v => set('incidence_date', v)} placeholder="JJ/MM/AAAA" />
                                            <Field label="Topo" value={formData.topo_code} onChange={v => set('topo_code', v)} placeholder="C34.1" />
                                            <Field label="Base Diagnostic" value={formData.basis_of_diagnosis} onChange={v => set('basis_of_diagnosis', v)} options={dictOptions['BASIS']} />
                                            <Field label="cT" value={formData.clinical_t} onChange={v => set('clinical_t', v)} options={T_OPTIONS} />
                                            <Field label="cN" value={formData.clinical_n} onChange={v => set('clinical_n', v)} options={N_OPTIONS} />
                                            <Field label="cM" value={formData.clinical_m} onChange={v => set('clinical_m', v)} options={M_OPTIONS} />
                                            <Field label="Stade" value={formData.clinical_stage} onChange={v => set('clinical_stage', v)} options={STAGE_OPTIONS} />
                                        </div>
                                    </div>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Antécédents & Source" icon={Activity} />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <Field label="Performance" value={formData.performance_status} onChange={v => set('performance_status', v)} options={[
                                                { value: '0', label: '0 – Asymptomatique' },
                                                { value: '1', label: '1 – Symptomatique, ambulatoire' },
                                                { value: '2', label: '2 – Alité < 50% du temps' },
                                                { value: '3', label: '3 – Alité > 50% du temps' },
                                                { value: '4', label: '4 – Confiné au lit' },
                                                { value: '9', label: 'Inconnu' }
                                            ]} />
                                            <Field label="Hôpital" value={formData.hospital_name} onChange={v => set('hospital_name', v)} placeholder="CHU Mustapha" />
                                            <Field label="Notes" value={formData.clinical_text} onChange={v => set('clinical_text', v)} placeholder="Résumé clinique…" full />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ANAPATH SECTION */}
                            {(role === 'anapate' || role === 'admin') && activeSection === 'anapath' && (
                                <motion.div className="space-y-6" animate={{ y: [0, -6, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Examen Morphologique" icon={Microscope} />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <Field label="Morpho" value={formData.morpho_code} onChange={v => set('morpho_code', v)} placeholder="8070/3" auto={autoFlags.morpho_code} />
                                            <Field label="Comportement" value={formData.behaviour} onChange={v => set('behaviour', v)} options={dictOptions['BEHAV'] || [{ value: '0', label: '/0 Bénin' }, { value: '1', label: '/1 Incertain' }, { value: '2', label: 'In situ' }, { value: '3', label: 'Malin' }]} auto={autoFlags.behaviour} />
                                            <Field label="Grade" value={formData.grade} onChange={v => set('grade', v)} options={dictOptions['GRADE'] || [{ value: '1', label: 'G1 – Bien diff.' }, { value: '2', label: 'G2 – Modéré' }, { value: '3', label: 'G3 – Peu diff.' }, { value: '4', label: 'G4 – Indifférencié' }, { value: '9', label: '9 – Non déterminé' }]} />
                                            <Field label="pT" value={formData.path_t} onChange={v => set('path_t', v)} options={T_OPTIONS} />
                                            <Field label="pN" value={formData.path_n} onChange={v => set('path_n', v)} options={N_OPTIONS} />
                                            <Field label="pM" value={formData.path_m} onChange={v => set('path_m', v)} options={M_OPTIONS} />
                                            <Field label="Nbre Ganglions +" value={formData.nodes_pos} onChange={v => set('nodes_pos', v)} type="number" />
                                            {isPaired && <div className="col-span-full p-2 bg-sky-500/10 border border-sky-500/20 rounded text-[10px] text-sky-400 font-bold uppercase tracking-wider text-center">Organe Pair détecté — Spécifier la latéralité</div>}
                                        </div>
                                    </div>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Rapport Anapath" icon={FileText} />
                                        <Field label="Rapport" value={formData.pathology_text} onChange={v => set('pathology_text', v)} placeholder="Pièce de lobectomie supérieure droite. Tumeur de 32mm…" full />
                                    </div>
                                    <ReadOnlyCard
                                        title="Résumé Clinique"
                                        icon={Stethoscope}
                                        data={{
                                            'Site': formData.topo_code || 'Non spécifié',
                                            'Diagnostic': dictOptions['BASIS']?.find(o => o.value === formData.basis_of_diagnosis)?.label || 'Inconnu',
                                            'Stade Clinique': formData.clinical_stage || 'N/A'
                                        }}
                                    />
                                </motion.div>
                            )}

                            {/* LABO SECTION */}
                            {(role === 'labo' || role === 'admin') && activeSection === 'labo' && (
                                <motion.div className="space-y-6" animate={{ y: [0, -5, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Biochimie & Marqueurs" icon={FlaskConical} />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <Field label="Date Prélèvement" value={formData.labo_date} onChange={v => set('labo_date', v)} placeholder="JJ/MM/AAAA" />
                                            <Field label="PSA (ng/mL)" value={formData.psa} onChange={v => set('psa', v)} placeholder="4.0" type="number" />
                                            <Field label="CEA (ng/mL)" value={formData.cea} onChange={v => set('cea', v)} placeholder="5.0" type="number" />
                                            <Field label="CA-125 (U/mL)" value={formData.ca125} onChange={v => set('ca125', v)} placeholder="35" type="number" />
                                            <Field label="CA-19.9 (U/mL)" value={formData.ca199} onChange={v => set('ca199', v)} placeholder="37" type="number" />
                                            <Field label="AFP (ng/mL)" value={formData.afp} onChange={v => set('afp', v)} placeholder="10" type="number" />
                                            <Field label="β-HCG (mUI/mL)" value={formData.hcg} onChange={v => set('hcg', v)} placeholder="5" type="number" />
                                        </div>
                                    </div>
                                    <div className="glass-card p-5">
                                        <SectionHeader title="Hématologie & Biochimie" icon={FlaskConical} badge="Labo" />
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                            <Field label="Hémoglobine (g/dL)" value={formData.hemoglobin} onChange={v => set('hemoglobin', v)} placeholder="14.0" type="number" />
                                            <Field label="Leucocytes (×10³/µL)" value={formData.wbc} onChange={v => set('wbc', v)} placeholder="7.5" type="number" />
                                            <Field label="Plaquettes (×10³/µL)" value={formData.platelets} onChange={v => set('platelets', v)} placeholder="250" type="number" />
                                            <Field label="LDH (U/L)" value={formData.ldh} onChange={v => set('ldh', v)} placeholder="250" type="number" />
                                            <Field label="PAL / ALP (U/L)" value={formData.alp} onChange={v => set('alp', v)} placeholder="120" type="number" />
                                            <Field label="Notes Laboratoire" value={formData.labo_notes} onChange={v => set('labo_notes', v)} placeholder="Observations, commentaires…" full />
                                        </div>
                                    </div>
                                    <div className="glass-card p-5 mt-6 border-t-4 border-amber-500/50">
                                        <SectionHeader title="Biologie Moléculaire & IHC" icon={FlaskConical} badge="Biomarkers" />
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            <Field label="Statut HER2" value={formData.her2} onChange={v => set('her2', v)} options={[{ value: '', label: 'Non testé' }, { value: '0', label: '0 (Négatif)' }, { value: '1+', label: '1+ (Négatif)' }, { value: '2+', label: '2+ (Équivoque)' }, { value: '3+', label: '3+ (Positif)' }]} />
                                            <Field label="RE (Œstrogène) %" value={formData.er_percent} onChange={v => set('er_percent', v)} placeholder="80" type="number" />
                                            <Field label="RP (Progestérone) %" value={formData.pr_percent} onChange={v => set('pr_percent', v)} placeholder="15" type="number" />
                                            <Field label="Index Ki-67 (%)" value={formData.ki67} onChange={v => set('ki67', v)} placeholder="40" type="number" />
                                            <Field label="Mutation EGFR" value={formData.egfr} onChange={v => set('egfr', v)} options={[{ value: '', label: 'Non testé' }, { value: 'Wild-Type', label: 'Sauvage (Wild-Type)' }, { value: 'Muté (Exon 19)', label: 'Muté (Exon 19)' }, { value: 'Muté (L858R)', label: 'Muté (L858R)' }]} />
                                            <Field label="Abernance ALK" value={formData.alk} onChange={v => set('alk', v)} options={[{ value: '', label: 'Non testé' }, { value: 'Négatif', label: 'Négatif' }, { value: 'Réarrangement', label: 'Réarrangement Positif' }]} />
                                            <Field label="Mutation BRAF" value={formData.braf} onChange={v => set('braf', v)} options={[{ value: '', label: 'Non testé' }, { value: 'Wild-Type', label: 'Sauvage (Wild-Type)' }, { value: 'V600E', label: 'Muté V600E' }]} />
                                            <Field label="PD-L1 (TPS/CPS)" value={formData.pdl1} onChange={v => set('pdl1', v)} placeholder="Ex: TPS > 50%" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ADMIN SECTION */}
                            {role === 'admin' && activeSection === 'admin' && (
                                <motion.div className="glass-card p-5" animate={{ y: [0, -4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
                                    <SectionHeader title="Validation Finale" icon={Shield} />
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        <Field label="N° Reg" value={formData.registration_number} onChange={v => set('registration_number', v)} placeholder="RC-2024-XXXXX" />
                                        <Field label="Statut" value={formData.record_status} onChange={v => set('record_status', v)} options={[{ value: '0', label: 'Attente' }, { value: '1', label: 'Validé' }, { value: '2', label: 'Archivé' }]} />
                                        <Field label="CIM-10" value={formData.icd10_code} onChange={v => set('icd10_code', v)} placeholder="C34.1" />
                                        <Field label="Code MP (Multiples)" value={formData.mp_code} onChange={v => set('mp_code', v)} placeholder="00" />
                                        <Field label="Traitement Principal" value={formData.treatment_1} onChange={v => set('treatment_1', v)}
                                            options={dictOptions['TREAT'] || [{ value: '0', label: 'Aucun' }, { value: '1', label: 'Chirurgie' }, { value: '2', label: 'Radiothérapie' }, { value: '3', label: 'Chimiothérapie' }, { value: '4', label: 'Hormonothérapie' }, { value: '5', label: 'Immunothérapie' }, { value: '7', label: 'Combinaison' }, { value: '9', label: 'Inconnu' }]} />
                                        <Field label="Traitement Secondaire" value={formData.treatment_2} onChange={v => set('treatment_2', v)}
                                            options={[{ value: '', label: '—' }, { value: '1', label: 'Chirurgie' }, { value: '2', label: 'Radiothérapie' }, { value: '3', label: 'Chimiothérapie' }, { value: '5', label: 'Immunothérapie' }]} />
                                        <Field label="Check IARC" value={formData.check_status} onChange={v => set('check_status', v)}
                                            options={[{ value: 'Unchecked', label: 'Non vérifié' }, { value: 'OK', label: 'Conforme' }, { value: 'Rare', label: 'Rare' }, { value: 'Invalid', label: 'Invalide' }]} />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Validation Summary */}
                    {(vResults.errors.length > 0 || vResults.warnings.length > 0) && (
                        <div className="glass-card p-4 bg-rose-500/5 border-rose-500/10 space-y-2">
                            {vResults.errors.map((e, i) => <div key={i} className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-rose-400 text-xs"><strong>❌</strong> {e}</div>)}
                            {vResults.warnings.map((w, i) => <div key={i} className="p-2 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-xs"><strong>⚠</strong> {w}</div>)}
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5 rounded-2xl glass-card">
                        <button type="button" onClick={() => {
                            const order: ("identity" | "clinical" | "anapath" | "labo" | "admin")[] = ['identity', 'clinical', 'anapath', 'labo', 'admin'];
                            const idx = order.indexOf(activeSection);
                            if (idx > 0) setActiveSection(order[idx - 1]);
                        }} className={`px-5 py-2 text-slate-400 hover:text-white transition-colors font-bold text-xs ${activeSection === 'identity' ? 'opacity-0 pointer-events-none' : ''}`}>
                            ← Précédent
                        </button>
                        <div className="flex items-center gap-4">
                            {isIdentityMissing && <p className="text-[10px] text-rose-400 font-bold animate-pulse">Identité incomplète</p>}
                            <button
                                type="submit"
                                disabled={loading || vResults.errors.length > 0 || isIdentityMissing}
                                className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${loading || vResults.errors.length > 0 || isIdentityMissing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20'}`}
                            >
                                {loading ? 'Traitement...' : role === 'admin' ? 'Valider le Dossier' : 'Enregistrer'}
                            </button>
                        </div>
                    </div>

                </main>
            </div>
        </form>
    );
};

export default PatientForm;
