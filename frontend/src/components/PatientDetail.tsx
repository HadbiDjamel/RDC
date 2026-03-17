import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, User, Building2, Heart, MapPin, CheckCircle2,
    Stethoscope, Activity, Pill, MessageSquare,
    ChevronRight, Shield, QrCode
} from 'lucide-react';
import RCPForum from './RCPForum';
import QuestionnaireQR from './QuestionnaireQR';

interface Props { patient: any; onBack: () => void; }

// ── Shared Helpers ──────────────────────────────────────────────
const Row = ({ label, value, mono, hl }: { label: string; value: string; mono?: boolean; hl?: boolean }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0 gap-4">
        <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{label}</span>
        <span className={`text-xs font-bold text-right ${mono ? 'font-mono text-sky-400' : hl ? 'text-emerald-400' : 'text-white'}`}>{value || '—'}</span>
    </div>
);


const SectionHeader = ({ icon: Icon, title, subtitle, color, isPriority }: any) => (
    <div className={`p-4 rounded-t-2xl border-x border-t flex items-center gap-3 ${isPriority ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/[0.02] border-white/5 shadow-sm'
        }`}>
        <div className={`p-2 rounded-xl ${isPriority ? 'bg-rose-500/20 text-rose-400' : `bg-${color}-500/10 text-${color}-400`}`}>
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{title}</h3>
                {isPriority && <span className="px-1.5 py-0.5 rounded bg-rose-500 text-[8px] font-black text-white">TOP PRIORITÉ</span>}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>
        </div>
    </div>
);

const DetailCard = ({ children, isPriority, noPadding }: any) => (
    <div className={`glass-card rounded-t-none ${noPadding ? 'p-0' : 'p-6'} mb-6 border-x border-b ${isPriority ? 'border-rose-500/20 bg-rose-500/[0.02]' : 'border-white/5'
        }`}>
        {children}
    </div>
);

const SidebarItem = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0 group">
        <div className={`mt-0.5 text-slate-600 group-hover:text-${color}-400 transition-colors`}><Icon size={14} /></div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-300 truncate group-hover:text-white transition-colors">{value || 'Non renseigné'}</p>
        </div>
    </div>
);

type Tab = 'overview' | 'identity' | 'address' | 'vital' | 'tumor' | 'staging' | 'treatment' | 'sources' | 'admin' | 'rcp';

// ── Mock Data ────────────────────────────────────────────────────
const TUMOR = {
    incidence_date: '15/03/2024', topo_code: 'C34.1', topo_label: 'Lobe supérieur, Poumon',
    morpho_code: '8070/3', morpho_label: 'Carcinome épidermoïde SAI',
    icd10: 'C34.1', behaviour: '3', grade: '2', laterality: 'Droite',
    basis: '7', basis_label: 'Histologie tumeur primitive',
    cT: 'cT2a', cN: 'cN1', cM: 'cM0', cStage: 'IIB',
    pT: 'pT2a', pN: 'pN1', pM: 'pM0', pStage: 'IIB',
    tnm_ed: '8', size: 32, mp: '01', seq: 1,
    tx1: 'Chirurgie', tx2: 'Chimiothérapie', tx_date: '01/04/2024',
    check: 'OK', notes: 'Résection lobaire supérieure droite. Marges saines.',
};
const SOURCES = [
    {
        type: 'HP', label: 'Histopathologie', hospital: 'CHU Mustapha Bacha', dept: 'Anatomie Pathologique',
        report: 'AP-24/1054', date: '12/03/2024', doctor: 'Dr. Belkacem', reader: 'REG-01',
        text: 'Pièce de lobectomie supérieure droite. Tumeur 32mm, blanchâtre. Carcinome épidermoïde modérément différencié. Invasion pleurale viscérale. 3/12 ganglions envahis.'
    },
    {
        type: 'IM', label: 'Imagerie (TDM)', hospital: 'CHU Mustapha Bacha', dept: 'Radiologie',
        report: 'TDM-24/890', date: '01/03/2024', doctor: 'Dr. Mansouri', reader: 'REG-01',
        text: 'TDM thorax : Masse hilaire droite 35mm. Adénopathies médiastinales. Pas de métastase à distance.'
    },
];

// ── Summary Card (clickable) ─────────────────────────────────────
const SummaryCard = ({ icon: Icon, title, subtitle, color, onClick, children }: any) => (
    <motion.div whileHover={{ scale: 1.01 }} onClick={onClick}
        className={`morphing-card transition-all duration-300 p-4 cursor-pointer group hover:bg-${color}-500/5 hover:border-${color}-500/30 hover:shadow-[0_0_30px_rgba(var(--color-${color}-500),0.1)]`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400 group-hover:bg-${color}-500/20 group-hover:scale-110 transition-all duration-300`}><Icon size={16} /></div>
            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white group-hover:text-${color}-300 transition-colors uppercase tracking-tight">{title}</h4>
                <p className="text-[9px] text-slate-500 truncate group-hover:text-slate-400">{subtitle}</p>
            </div>
            <ChevronRight size={14} className={`text-slate-600 group-hover:text-${color}-400 group-hover:translate-x-1 transition-all`} />
        </div>
        <div className="relative z-10 transition-all duration-300">{children}</div>
    </motion.div>
);

// ── Detail Page Wrapper ──────────────────────────────────────────
const DetailPage = ({ title, icon: Icon, color, onBack, children }: any) => (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors mb-2">
            <ArrowLeft size={14} /> Retour au dossier
        </button>
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-400`}><Icon size={22} /></div>
            <h3 className="text-lg font-black text-white">{title}</h3>
        </div>
        {children}
    </motion.div>
);

// ── Components ───────────────────────────────────────────────────

const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${active
            ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20'
            : 'text-slate-500 border-transparent hover:bg-white/5 hover:text-white'
            }`}
    >
        <Icon size={14} />
        {label}
    </button>
);

// ── Main Component ───────────────────────────────────────────────
const PatientDetail: React.FC<Props> = ({ patient: p, onBack }) => {
    const [view, setView] = useState<'dashboard' | 'rcp'>('dashboard');
    const [activeDetail, setActiveDetail] = useState<Tab | null>(null);
    const [showQR, setShowQR] = useState(false);

    // Socio-demographic mock (synced with models.py extensions)
    const extraInfo = {
        education: "Niveau Universitaire",
        income: "Moyen (CSP+)",
        emergency_contact: "Mme. Bouzid (Épouse) - 0661 22 33 44",
        email: "p.ahmed@example.dz",
        nationality: "Algérienne",
        ssn: "176 16 31 012 345",
        passport: "ALG-098234-X",
        ethnie: "Nord-Africaine",
        matrimonial: "Marié",
        profession: "Enseignant (Retraité)"
    };

    const renderDetailView = () => {
        if (!activeDetail) return null;

        switch (activeDetail) {
            case 'identity':
                return (
                    <DetailPage title="Identité Complète" icon={User} color="sky" onBack={() => setActiveDetail(null)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card p-6 border-white/5 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Informations Civiles</h4>
                                <Row label="Nom Complet" value={p.name} />
                                <Row label="Date de Naissance" value={p.birth_date || '15/05/1976'} />
                                <Row label="Sexe" value={p.gender === 'M' ? 'Masculin' : 'Féminin'} />
                                <Row label="Statut Matrimonial" value={extraInfo.matrimonial} />
                                <Row label="Groupe Ethnique" value={extraInfo.ethnie} />
                            </div>
                            <div className="space-y-4">
                                <div className="glass-card p-6 border-white/5 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Identifiants Officiels</h4>
                                    <Row label="N° Identifiant National" value={p.nid} mono />
                                    <Row label="N° Sécurité Sociale" value={extraInfo.ssn} mono />
                                    <Row label="N° Passeport" value={extraInfo.passport} mono />
                                </div>
                                <div className="glass-card p-6 border-white/5 space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Contact & Localisation</h4>
                                    <Row label="Wilaya de Résidence" value={p.city} />
                                    <Row label="Email Privé" value={extraInfo.email} />
                                    <Row label="Profession" value={extraInfo.profession} />
                                </div>
                            </div>
                        </div>
                    </DetailPage>
                );
            case 'vital':
                return (
                    <DetailPage title="État Civil & Vitalité" icon={Heart} color="rose" onBack={() => setActiveDetail(null)}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col items-center justify-center text-center">
                                <Activity size={32} className="text-emerald-400 mb-3" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut Actuel</p>
                                <p className="text-2xl font-black text-emerald-400 tracking-tight">VIVANT</p>
                            </div>
                            <div className="glass-card p-6 border-sky-500/20 bg-sky-500/[0.02] flex flex-col items-center justify-center text-center">
                                <MapPin size={32} className="text-sky-400 mb-3" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernier Contact</p>
                                <p className="text-xl font-bold text-white tracking-tight">12/02/2025</p>
                            </div>
                            <div className="glass-card p-6 border-rose-500/20 bg-rose-500/[0.02] flex flex-col items-center justify-center text-center">
                                <Heart size={32} className="text-rose-400 mb-3" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date d'Incidence</p>
                                <p className="text-xl font-bold text-white tracking-tight">{TUMOR.incidence_date}</p>
                            </div>
                        </div>
                        <div className="glass-card p-6 border-white/5 space-y-2">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Détails Post-Mortem</h4>
                            <Row label="Autopsie réalisée" value="Non Applicable" />
                            <Row label="Cause de décès (CIM-10)" value="—" />
                        </div>
                    </DetailPage>
                );
            case 'tumor':
                return (
                    <DetailPage title="Diagnostique & Tumeur" icon={Activity} color="emerald" onBack={() => setActiveDetail(null)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card p-6 border-sky-500/20 bg-sky-500/[0.02] space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg"><MapPin size={18} /></div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Topographie</h4>
                                </div>
                                <div className="p-4 bg-black/20 rounded-xl border border-sky-500/10">
                                    <p className="text-[10px] text-sky-400 font-black uppercase mb-1">Code CIM-O-3</p>
                                    <p className="text-2xl font-mono font-black text-white">{TUMOR.topo_code}</p>
                                </div>
                                <Row label="Localisation Précise" value={TUMOR.topo_label} />
                                <Row label="Latéralité" value={TUMOR.laterality} />
                            </div>

                            <div className="glass-card p-6 border-rose-500/20 bg-rose-500/[0.02] space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><Activity size={18} /></div>
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Morphologie</h4>
                                </div>
                                <div className="p-4 bg-black/20 rounded-xl border border-rose-500/10 mb-2">
                                    <p className="text-[10px] text-rose-400 font-black uppercase mb-1">Code CIM-O-3</p>
                                    <p className="text-2xl font-mono font-black text-white">{TUMOR.morpho_code}</p>
                                </div>
                                <Row label="Type Histologique" value={TUMOR.morpho_label} />
                                <div className="flex gap-2 pt-2 top-2">
                                    <div className="flex-1 p-3 bg-white/5 rounded-xl text-center border border-white/5">
                                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Comportement</p>
                                        <p className="text-lg font-black text-rose-400">/{TUMOR.behaviour}</p>
                                    </div>
                                    <div className="flex-1 p-3 bg-white/5 rounded-xl text-center border border-white/5">
                                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Grade</p>
                                        <p className="text-lg font-black text-rose-400">G{TUMOR.grade}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-6 border-white/5 mt-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Base Raisonnée du Diagnostic</p>
                                <p className="text-sm font-bold text-white">{TUMOR.basis_label}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-mono font-black text-slate-400">
                                {TUMOR.basis}
                            </div>
                        </div>
                    </DetailPage>
                );
            case 'staging':
                return (
                    <DetailPage title="Staging & Extension" icon={Shield} color="violet" onBack={() => setActiveDetail(null)}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-white/[0.02] rounded-2xl border border-sky-500/20 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 text-sky-500/5 rotate-12"><Shield size={120} /></div>
                                    <p className="text-xs text-sky-400 font-black uppercase tracking-widest mb-6 relative z-10">cTNM (Clinique)</p>

                                    <div className="flex gap-3 mb-6 relative z-10">
                                        <div className="flex-1 p-4 bg-sky-500/10 rounded-xl border border-sky-500/20 text-center">
                                            <p className="text-[10px] text-sky-300 font-black mb-1">Tumeur (T)</p>
                                            <p className="text-xl font-black text-white">{TUMOR.cT}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-sky-500/10 rounded-xl border border-sky-500/20 text-center">
                                            <p className="text-[10px] text-sky-300 font-black mb-1">Nœud (N)</p>
                                            <p className="text-xl font-black text-white">{TUMOR.cN}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-sky-500/10 rounded-xl border border-sky-500/20 text-center">
                                            <p className="text-[10px] text-sky-300 font-black mb-1">Métastase (M)</p>
                                            <p className="text-xl font-black text-white">{TUMOR.cM}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-sky-500/20 pt-4 relative z-10">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Stade AJCC Clinique</span>
                                        <span className="text-2xl font-black text-sky-400">{TUMOR.cStage}</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-white/[0.02] rounded-2xl border border-emerald-500/20 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 text-emerald-500/5 rotate-12"><Shield size={120} /></div>
                                    <p className="text-xs text-emerald-400 font-black uppercase tracking-widest mb-6 relative z-10">pTNM (Pathologique)</p>

                                    <div className="flex gap-3 mb-6 relative z-10">
                                        <div className="flex-1 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                                            <p className="text-[10px] text-emerald-300 font-black mb-1">Tumeur (T)</p>
                                            <p className="text-xl font-black text-white">{TUMOR.pT}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                                            <p className="text-[10px] text-emerald-300 font-black mb-1">Nœud (N)</p>
                                            <p className="text-xl font-black text-white">{TUMOR.pN}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                                            <p className="text-[10px] text-emerald-300 font-black mb-1">Métastase (M)</p>
                                            <p className="text-xl font-black text-white">{TUMOR.pM}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-emerald-500/20 pt-4 relative z-10">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Stade AJCC Path.</span>
                                        <span className="text-2xl font-black text-emerald-400">{TUMOR.pStage}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-card p-5 border-white/5 flex items-center justify-between">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Taille Tumorale Massive</span>
                                    <span className="text-lg font-bold text-white">{TUMOR.size} <span className="text-xs text-slate-500">mm</span></span>
                                </div>
                                <div className="glass-card p-5 border-white/5 flex items-center justify-between">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Édition de Référence</span>
                                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white">AJCC {TUMOR.tnm_ed}ème</span>
                                </div>
                            </div>
                        </div>
                    </DetailPage>
                );
            case 'treatment':
                return (
                    <DetailPage title="Parcours Thérapeutique" icon={Pill} color="sky" onBack={() => setActiveDetail(null)}>
                        <div className="glass-card p-8 border-sky-500/20 bg-sky-500/[0.02] relative overflow-hidden">
                            <div className="absolute right-0 top-0 text-sky-500/5 -translate-y-1/4 translate-x-1/4"><Pill size={200} /></div>

                            <div className="relative z-10 space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-4">Traitement Principal Initie</h4>
                                    <div className="flex items-end gap-4">
                                        <p className="text-3xl font-black text-white tracking-tight">{TUMOR.tx1}</p>
                                        <p className="text-sm font-bold text-slate-400 pb-1">le {TUMOR.tx_date}</p>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-gradient-to-r from-sky-500/20 to-transparent"></div>

                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Cure Adjuvante / Secondaire</h4>
                                    <p className="text-xl font-bold text-slate-300">{TUMOR.tx2}</p>
                                </div>

                                <div className="p-4 bg-black/20 rounded-xl border border-sky-500/10 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Pharmacovigilance Toxique</p>
                                        <p className="text-sm font-bold text-emerald-400">Mineure, réversible sans séquelles</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                                        G1
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DetailPage>
                );
            case 'sources':
                return (
                    <DetailPage title="Sources & Documentation" icon={Building2} color="slate" onBack={() => setActiveDetail(null)}>
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                            {SOURCES.map((s, i) => (
                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    {/* Timeline dot */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0f111a] bg-slate-800 group-hover:bg-sky-500 group-hover:border-sky-500/30 transition-colors text-slate-400 group-hover:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                                        <Building2 size={16} />
                                    </div>

                                    {/* Content card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white/5 border border-white/5 group-hover:border-sky-500/30 transition-all shadow-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest px-2 py-1 bg-sky-500/10 rounded-md">{s.label}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{s.date}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white mb-2">{s.hospital} - {s.dept}</h4>
                                        <p className="text-xs text-slate-400 font-mono italic leading-relaxed line-clamp-3 mb-4">"{s.text}"</p>
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <span className="text-[9px] text-slate-500 font-black uppercase">Réf: {s.report}</span>
                                            <span className="text-[10px] font-bold text-slate-300">{s.doctor}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </DetailPage>
                );
            case 'admin':
                return (
                    <DetailPage title="Administration & Qualité" icon={Activity} color="slate" onBack={() => setActiveDetail(null)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-card p-6 border-white/5 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-4">Métadonnées d'Enregistrement</h4>
                                <Row label="N° Dossier Archive" value="A-2024-5541" />
                                <Row label="Mois de Déclaration" value="Mars 2024" />
                                <Row label="Séquence Tumeur (Multiple)" value={String(TUMOR.seq)} />
                                <Row label="Code Multiples Primaires" value={TUMOR.mp} mono />
                            </div>
                            <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/[0.02] flex flex-col justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-1">CONFORME IARC</h3>
                                <p className="text-xs text-slate-400">Toutes les règles de cohérence internationales sont validées par le moteur M.I.A.</p>
                                <div className="mt-6 pt-4 border-t border-emerald-500/20 text-[10px] font-black tracking-widest text-emerald-500 uppercase">
                                    Agent de Validation : M.I.A. v2.0
                                </div>
                            </div>
                        </div>
                    </DetailPage>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-10">
            {/* 1. Header Navigation & Context */}
            <div className="flex items-center gap-5 mb-8">
                <button onClick={onBack} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-slate-400 hover:text-white border border-white/5 group active:scale-95">
                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-white tracking-tighter truncate">{p.name}</h2>
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[9px] font-black text-sky-400 uppercase">VIVANT</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>{p.nid}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        <span className="text-slate-600">RC-24-1054</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                        <span>Dossier Mis à jour: 12/02/2025</span>
                    </div>
                </div>
                <div className="flex gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                    <TabButton active={view === 'dashboard'} label="Dossier Patient" icon={Activity} onClick={() => setView('dashboard')} />
                    <TabButton active={view === 'rcp'} label="RCP Discussion" icon={MessageSquare} onClick={() => setView('rcp')} />
                    
                    <button 
                        onClick={() => setShowQR(true)} 
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:text-white hover:bg-emerald-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-emerald-500/20"
                    >
                        <QrCode size={14} />
                        Habitudes QR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ═══ PERSISTENT SIDEBAR: Socio-Demographics ═══════════ */}
                <aside className="lg:col-span-3 space-y-6 sticky top-6">
                    <div className="glass-card p-5 border-sky-500/20 bg-sky-500/[0.02] cursor-pointer hover:bg-sky-500/[0.04] transition-colors" onClick={() => { setView('dashboard'); setActiveDetail('identity'); }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400"><User size={18} /></div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest font-inter">Identité & Socio-Dém</h4>
                        </div>
                        <div className="space-y-1">
                            <SidebarItem icon={User} label="Sexe & Age" value={`${p.gender === 'M' ? 'Masculin' : 'Féminin'} • ${p.age} ans`} color="sky" />
                            <SidebarItem icon={Activity} label="Nationalité" value={extraInfo.nationality} color="sky" />
                            <SidebarItem icon={Shield} label="Email" value={extraInfo.email} color="sky" />
                            <SidebarItem icon={Activity} label="Contact" value={extraInfo.emergency_contact} color="rose" />
                        </div>
                    </div>

                    <div className="glass-card p-5 border-white/5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400"><Heart size={18} /></div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Antécédents</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-[8px] text-slate-500 uppercase font-black mb-1.5">Médicaux/Chirurgicaux</p>
                                <div className="space-y-1">
                                    <span className="block text-[10px] text-white font-bold tracking-tight">HTA (Sous traitement)</span>
                                    <span className="block text-[10px] text-white font-bold tracking-tight">Diabète de type 2</span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10">
                                <p className="text-[8px] text-rose-400 uppercase font-black mb-1.5">Allergies</p>
                                <span className="text-[10px] text-rose-300 font-bold">Pénicilline (Grave)</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ═══ MAIN DYNAMIC CONTENT AREA ═══════════════════════ */}
                <main className="lg:col-span-9">
                    <AnimatePresence mode="wait">

                        {/* A. DASHBOARD VIEW (Interactive Grid) */}
                        {view === 'dashboard' && !activeDetail && (
                            <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} className="space-y-6">
                                <section>
                                    <SectionHeader icon={Stethoscope} title="Dossier Oncologie" subtitle="Résumé diagnostique prioritaire" color="rose" isPriority />
                                    <DetailCard isPriority noPadding>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-white/5">
                                            <div onClick={() => setActiveDetail('tumor')} className="p-4 border-r border-white/5 hover:bg-rose-500/[0.03] transition-colors cursor-pointer group">
                                                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Topographie</p>
                                                <p className="text-xl font-mono font-black text-rose-400 group-hover:text-white transition-colors">{TUMOR.topo_code}</p>
                                            </div>
                                            <div onClick={() => setActiveDetail('tumor')} className="p-4 border-r border-white/5 hover:bg-rose-500/[0.03] transition-colors cursor-pointer group">
                                                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Morphologie</p>
                                                <p className="text-xl font-mono font-black text-rose-400 group-hover:text-white transition-colors">{TUMOR.morpho_code}</p>
                                            </div>
                                            <div onClick={() => setActiveDetail('staging')} className="p-4 border-r border-white/5 hover:bg-rose-500/[0.03] transition-colors cursor-pointer group">
                                                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">Stade TNM</p>
                                                <p className="text-xl font-black text-rose-400 group-hover:text-white transition-colors">{TUMOR.cStage}</p>
                                            </div>
                                            <div onClick={() => setActiveDetail('admin')} className="p-4 hover:bg-rose-500/[0.03] transition-colors cursor-pointer group">
                                                <p className="text-[9px] text-slate-500 font-black uppercase mb-1">IARC Quality</p>
                                                <p className="text-xl font-black text-emerald-400 group-hover:text-white transition-colors">CONFORME</p>
                                            </div>
                                        </div>
                                        <div onClick={() => setActiveDetail('tumor')} className="p-6 cursor-pointer hover:bg-rose-500/[0.02] transition-colors group">
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-xs font-black text-white group-hover:text-rose-400 transition-colors uppercase tracking-tight">{TUMOR.morpho_label}</p>
                                                <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                                            </div>
                                            <p className="text-xs text-slate-400 italic font-mono leading-relaxed truncate">"{TUMOR.notes}"</p>
                                        </div>
                                    </DetailCard>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SummaryCard icon={Activity} title="État Vital & Incidence" subtitle="Dernière mise à jour : 12/02/2025" color="rose" onClick={() => setActiveDetail('vital')}>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs font-bold text-emerald-400">VIVANT</span>
                                            <span className="text-[10px] text-slate-500 font-mono">INC: {TUMOR.incidence_date}</span>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard icon={Shield} title="Staging Clinique (cTNM)" subtitle="AJCC TNM 8ème Édition" color="violet" onClick={() => setActiveDetail('staging')}>
                                        <div className="flex gap-2 mt-2">
                                            <div className="px-2 py-1 rounded bg-violet-500/10 text-[10px] font-black text-violet-400 uppercase">{TUMOR.cT}</div>
                                            <div className="px-2 py-1 rounded bg-violet-500/10 text-[10px] font-black text-violet-400 uppercase">{TUMOR.cN}</div>
                                            <div className="px-2 py-1 rounded bg-violet-500/10 text-[10px] font-black text-violet-400 uppercase">{TUMOR.cM}</div>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard icon={Pill} title="Traitement Actuel" subtitle="Pharmacovigilance active" color="sky" onClick={() => setActiveDetail('treatment')}>
                                        <div className="mt-2">
                                            <p className="text-[10px] font-bold text-white truncate">{TUMOR.tx2} • G1</p>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard icon={Building2} title="Sources & Rapports" subtitle={`${SOURCES.length} documents archivés`} color="slate" onClick={() => setActiveDetail('sources')}>
                                        <div className="mt-2 flex gap-1.5 overflow-hidden">
                                            {SOURCES.map((s, i) => (
                                                <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-bold text-slate-500 border border-white/5">{s.type}</span>
                                            ))}
                                        </div>
                                    </SummaryCard>
                                </div>
                            </motion.div>
                        )}

                        {/* B. DETAIL THEMES (Animated Drill-down) */}
                        {view === 'dashboard' && activeDetail && (
                            <motion.div key="detail-view">
                                {renderDetailView()}
                            </motion.div>
                        )}

                        {/* C. RCP FORUM TABBED */}
                        {view === 'rcp' && (
                            <motion.div key="rcp" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="glass-card h-[700px] border-white/5 overflow-hidden">
                                <RCPForum patientName={p.name} />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </main>
            </div>

            {showQR && (
                <QuestionnaireQR 
                    patientId={p.id || p.patient_id}
                    patientName={p.name || `${p.last_name || ''} ${p.first_name || ''}`.trim() || 'Patient Actuel'}
                    onClose={() => setShowQR(false)}
                />
            )}
        </div>
    );
};

export default PatientDetail;
