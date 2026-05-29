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
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 gap-4">
        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">{label}</span>
        <span className={`text-xs font-bold text-right ${mono ? 'font-mono text-blue-600' : hl ? 'text-emerald-600' : 'text-slate-800'}`}>{value || '—'}</span>
    </div>
);


const SectionHeader = ({ icon: Icon, title, subtitle, color, isPriority }: any) => (
    <div className={`p-4 rounded-t-2xl border-x border-t flex items-center gap-3 ${isPriority ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200 shadow-sm'
        }`}>
        <div className={`p-2 rounded-xl ${isPriority ? 'bg-white text-rose-600 shadow-sm' : `bg-white text-${color}-600 shadow-sm`}`}>
            <Icon size={20} />
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <h3 className={`text-sm font-black uppercase tracking-tight ${isPriority ? 'text-rose-900' : 'text-slate-800'}`}>{title}</h3>
                {isPriority && <span className="px-1.5 py-0.5 rounded bg-rose-600 text-[8px] font-black text-white">TOP PRIORITÉ</span>}
            </div>
            <p className={`text-[10px] font-medium ${isPriority ? 'text-rose-700/70' : 'text-slate-500'}`}>{subtitle}</p>
        </div>
    </div>
);

const DetailCard = ({ children, isPriority, noPadding }: any) => (
    <div className={`portal-card rounded-t-none ${noPadding ? 'p-0' : 'p-6'} mb-6 border-x border-b ${isPriority ? 'border-rose-200 bg-white' : 'border-slate-200 bg-white shadow-sm'
        }`}>
        {children}
    </div>
);

const SidebarItem = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0 group">
        <div className={`mt-0.5 text-slate-400 group-hover:text-${color}-600 transition-colors`}><Icon size={14} /></div>
        <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-xs font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{value || 'Non renseigné'}</p>
        </div>
    </div>
);

type Tab = 'overview' | 'identity' | 'address' | 'vital' | 'tumor' | 'staging' | 'treatment' | 'sources' | 'admin' | 'rcp';

// ── Mock Data ────────────────────────────────────────────────────
const TUMOR = {
    incidence_date: '15/03/2026', topo_code: 'C34.1', topo_label: 'Lobe supérieur, Poumon',
    morpho_code: '8070/3', morpho_label: 'Carcinome épidermoïde SAI',
    icd10: 'C34.1', behaviour: '3', grade: '2', laterality: 'Droite',
    basis: '7', basis_label: 'Histologie tumeur primitive',
    cT: 'cT2a', cN: 'cN1', cM: 'cM0', cStage: 'IIB',
    pT: 'pT2a', pN: 'pN1', pM: 'pM0', pStage: 'IIB',
    tnm_ed: '8', size: 32, mp: '01', seq: 1,
    tx1: 'Chirurgie', tx2: 'Chimiothérapie', tx_date: '01/04/2026',
    check: 'OK', notes: 'Résection lobaire supérieure droite. Marges saines.',
};
const SOURCES = [
    {
        type: 'HP', label: 'Histopathologie', hospital: 'CHU Mustapha Bacha', dept: 'Anatomie Pathologique',
        report: 'AP-24/1054', date: '12/03/2026', doctor: 'Dr. Belkacem', reader: 'REG-01',
        text: 'Pièce de lobectomie supérieure droite. Tumeur 32mm, blanchâtre. Carcinome épidermoïde modérément différencié. Invasion pleurale viscérale. 3/12 ganglions envahis.'
    },
    {
        type: 'IM', label: 'Imagerie (TDM)', hospital: 'CHU Mustapha Bacha', dept: 'Radiologie',
        report: 'TDM-24/890', date: '01/03/2026', doctor: 'Dr. Mansouri', reader: 'REG-01',
        text: 'TDM thorax : Masse hilaire droite 35mm. Adénopathies médiastinales. Pas de métastase à distance.'
    },
];

// ── Summary Card (clickable) ─────────────────────────────────────
const SummaryCard = ({ icon: Icon, title, subtitle, color, onClick, children }: any) => (
    <motion.div whileHover={{ scale: 1.01, y: -2 }} onClick={onClick}
        className={`portal-card bg-white transition-all duration-300 p-4 cursor-pointer group hover:border-${color}-400 hover:shadow-lg shadow-sm border border-slate-200`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600 group-hover:bg-${color}-100 transition-all duration-300`}><Icon size={16} /></div>
            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{title}</h4>
                <p className="text-[9px] text-slate-500 font-medium truncate">{subtitle}</p>
            </div>
            <ChevronRight size={14} className={`text-slate-300 group-hover:text-${color}-600 group-hover:translate-x-1 transition-all`} />
        </div>
        <div className="relative z-10 transition-all duration-300">{children}</div>
    </motion.div>
);

// ── Detail Page Wrapper ──────────────────────────────────────────
const DetailPage = ({ title, icon: Icon, color, onBack, children }: any) => (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-slate-400 hover:text-blue-600 font-bold transition-colors mb-2">
            <ArrowLeft size={14} /> Retour au dossier
        </button>
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600 border border-${color}-100 shadow-sm`}><Icon size={22} /></div>
            <h3 className="text-lg font-black text-slate-800">{title}</h3>
        </div>
        {children}
    </motion.div>
);

// ── Components ───────────────────────────────────────────────────

const TabButton = ({ active, label, icon: Icon, onClick }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border shadow-sm ${active
            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/20'
            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
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
                    <DetailPage title="Identité Complète" icon={User} color="blue" onBack={() => setActiveDetail(null)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="portal-card p-6 border-slate-200 bg-white space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Informations Civiles</h4>
                                <Row label="Nom Complet" value={p.name || `${p.last_name || ''} ${p.first_name || ''}`.trim()} />
                                <Row label="Date de Naissance" value={p.birth_date || '15/05/1976'} />
                                <Row label="Sexe" value={String(p.gender) === '1' || p.gender === 'M' ? 'Masculin' : 'Féminin'} />
                                <Row label="Statut Matrimonial" value={extraInfo.matrimonial} />
                                <Row label="Groupe Ethnique" value={extraInfo.ethnie} />
                            </div>
                            <div className="space-y-4">
                                <div className="portal-card p-6 border-slate-200 bg-white space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Identifiants Officiels</h4>
                                    <Row label="N° Identifiant National" value={p.nid} mono />
                                    <Row label="N° Sécurité Sociale" value={extraInfo.ssn} mono />
                                    <Row label="N° Passeport" value={extraInfo.passport} mono />
                                </div>
                                <div className="portal-card p-6 border-slate-200 bg-white space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Contact & Localisation</h4>
                                    <Row label="Wilaya de Résidence" value={p.wilaya_name || p.city} />
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
                            <div className="portal-card p-6 border-emerald-200 bg-emerald-50/30 flex flex-col items-center justify-center text-center shadow-sm">
                                <Activity size={32} className="text-emerald-600 mb-3" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Statut Actuel</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tight">VIVANT</p>
                            </div>
                            <div className="portal-card p-6 border-blue-200 bg-blue-50/30 flex flex-col items-center justify-center text-center shadow-sm">
                                <MapPin size={32} className="text-blue-600 mb-3" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Dernier Contact</p>
                                <p className="text-xl font-bold text-slate-800 tracking-tight">12/02/2025</p>
                            </div>
                            <div className="portal-card p-6 border-rose-200 bg-rose-50/30 flex flex-col items-center justify-center text-center shadow-sm">
                                <Heart size={32} className="text-rose-600 mb-3" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date d'Incidence</p>
                                <p className="text-xl font-bold text-slate-800 tracking-tight">{TUMOR.incidence_date}</p>
                            </div>
                        </div>
                        <div className="portal-card p-6 border-slate-200 bg-white space-y-2 shadow-sm">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Détails Post-Mortem</h4>
                            <Row label="Autopsie réalisée" value="Non Applicable" />
                            <Row label="Cause de décès (CIM-10)" value="—" />
                        </div>
                    </DetailPage>
                );
            case 'tumor':
                return (
                    <DetailPage title="Diagnostique & Tumeur" icon={Activity} color="emerald" onBack={() => setActiveDetail(null)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="portal-card p-6 border-blue-200 bg-blue-50/10 space-y-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm"><MapPin size={18} /></div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Topographie</h4>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                                    <p className="text-[10px] text-blue-600 font-black uppercase mb-1">Code CIM-O-3</p>
                                    <p className="text-2xl font-mono font-black text-slate-800">{TUMOR.topo_code}</p>
                                </div>
                                <Row label="Localisation Précise" value={TUMOR.topo_label} />
                                <Row label="Latéralité" value={TUMOR.laterality} />
                            </div>

                            <div className="portal-card p-6 border-rose-200 bg-rose-50/10 space-y-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-rose-600 text-white rounded-lg shadow-sm"><Activity size={18} /></div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Morphologie</h4>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-rose-100 shadow-sm mb-2">
                                    <p className="text-[10px] text-rose-600 font-black uppercase mb-1">Code CIM-O-3</p>
                                    <p className="text-2xl font-mono font-black text-slate-800">{TUMOR.morpho_code}</p>
                                </div>
                                <Row label="Type Histologique" value={TUMOR.morpho_label} />
                                <div className="flex gap-2 pt-2 top-2">
                                    <div className="flex-1 p-3 bg-white rounded-xl text-center border border-slate-200 shadow-sm">
                                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Comportement</p>
                                        <p className="text-lg font-black text-rose-600">/{TUMOR.behaviour}</p>
                                    </div>
                                    <div className="flex-1 p-3 bg-white rounded-xl text-center border border-slate-200 shadow-sm">
                                        <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Grade</p>
                                        <p className="text-lg font-black text-rose-600">G{TUMOR.grade}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="portal-card p-6 border-slate-200 bg-white mt-4 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Base Raisonnée du Diagnostic</p>
                                <p className="text-sm font-bold text-slate-800">{TUMOR.basis_label}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center font-mono font-black text-slate-600 shadow-sm">
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
                                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 text-blue-500/5 rotate-12"><Shield size={120} /></div>
                                    <p className="text-xs text-blue-600 font-black uppercase tracking-widest mb-6 relative z-10">cTNM (Clinique)</p>

                                    <div className="flex gap-3 mb-6 relative z-10">
                                        <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                            <p className="text-[10px] text-slate-500 font-black mb-1">Tumeur (T)</p>
                                            <p className="text-xl font-black text-slate-800">{TUMOR.cT}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                            <p className="text-[10px] text-slate-500 font-black mb-1">Nœud (N)</p>
                                            <p className="text-xl font-black text-slate-800">{TUMOR.cN}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                            <p className="text-[10px] text-slate-500 font-black mb-1">Métastase (M)</p>
                                            <p className="text-xl font-black text-slate-800">{TUMOR.cM}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 relative z-10">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Stade AJCC Clinique</span>
                                        <span className="text-2xl font-black text-blue-600">{TUMOR.cStage}</span>
                                    </div>
                                </div>

                                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 text-emerald-500/5 rotate-12"><Shield size={120} /></div>
                                    <p className="text-xs text-emerald-600 font-black uppercase tracking-widest mb-6 relative z-10">pTNM (Pathologique)</p>

                                    <div className="flex gap-3 mb-6 relative z-10">
                                        <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                            <p className="text-[10px] text-slate-500 font-black mb-1">Tumeur (T)</p>
                                            <p className="text-xl font-black text-slate-800">{TUMOR.pT}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                            <p className="text-[10px] text-slate-500 font-black mb-1">Nœud (N)</p>
                                            <p className="text-xl font-black text-slate-800">{TUMOR.pN}</p>
                                        </div>
                                        <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                            <p className="text-[10px] text-slate-500 font-black mb-1">Métastase (M)</p>
                                            <p className="text-xl font-black text-slate-800">{TUMOR.pM}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 relative z-10">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Stade AJCC Path.</span>
                                        <span className="text-2xl font-black text-emerald-600">{TUMOR.pStage}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="portal-card p-5 bg-white border-slate-200 flex items-center justify-between shadow-sm">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Taille Tumorale Massive</span>
                                    <span className="text-lg font-bold text-slate-800">{TUMOR.size} <span className="text-xs text-slate-400 font-medium">mm</span></span>
                                </div>
                                <div className="portal-card p-5 bg-white border-slate-200 flex items-center justify-between shadow-sm">
                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Édition de Référence</span>
                                    <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-600">AJCC {TUMOR.tnm_ed}ème</span>
                                </div>
                            </div>
                        </div>
                    </DetailPage>
                );
            case 'treatment':
                return (
                    <DetailPage title="Parcours Thérapeutique" icon={Pill} color="blue" onBack={() => setActiveDetail(null)}>
                        <div className="portal-card p-8 border-blue-100 bg-blue-50/10 relative overflow-hidden shadow-sm">
                            <div className="absolute right-0 top-0 text-blue-500/5 -translate-y-1/4 translate-x-1/4"><Pill size={200} /></div>

                            <div className="relative z-10 space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Traitement Principal Initie</h4>
                                    <div className="flex items-end gap-4">
                                        <p className="text-3xl font-black text-slate-800 tracking-tight">{TUMOR.tx1}</p>
                                        <p className="text-sm font-bold text-slate-400 pb-1">le {TUMOR.tx_date}</p>
                                    </div>
                                </div>

                                <div className="h-px w-full bg-gradient-to-r from-blue-200 to-transparent"></div>

                                <div>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Cure Adjuvante / Secondaire</h4>
                                    <p className="text-xl font-bold text-slate-600">{TUMOR.tx2}</p>
                                </div>

                                <div className="p-4 bg-white rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Pharmacovigilance Toxique</p>
                                        <p className="text-sm font-bold text-emerald-600">Mineure, réversible sans séquelles</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black shadow-sm">
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
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                            {SOURCES.map((s, i) => (
                                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    {/* Timeline dot */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 group-hover:bg-blue-600 group-hover:border-blue-100 transition-colors text-slate-400 group-hover:text-white shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative">
                                        <Building2 size={16} />
                                    </div>

                                    {/* Content card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border border-slate-200 group-hover:border-blue-300 transition-all shadow-sm group-hover:shadow-md">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-1 bg-blue-50 border border-blue-100 rounded-md">{s.label}</span>
                                            <span className="text-[10px] font-bold text-slate-400">{s.date}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-2">{s.hospital} - {s.dept}</h4>
                                        <p className="text-xs text-slate-500 font-medium italic leading-relaxed line-clamp-3 mb-4">"{s.text}"</p>
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-tight">Réf: {s.report}</span>
                                            <span className="text-[10px] font-bold text-slate-600">{s.doctor}</span>
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
                            <div className="portal-card p-6 border-slate-200 bg-white space-y-4 shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Métadonnées d'Enregistrement</h4>
                                <Row label="N° Dossier Archive" value="A-2026-5541" />
                                <Row label="Mois de Déclaration" value="Mars 2026" />
                                <Row label="Séquence Tumeur (Multiple)" value={String(TUMOR.seq)} />
                                <Row label="Code Multiples Primaires" value={TUMOR.mp} mono />
                            </div>
                            <div className="portal-card p-6 border-emerald-100 bg-emerald-50/20 flex flex-col justify-center text-center shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-1">CONFORME IARC</h3>
                                <p className="text-xs text-slate-500 font-medium">Toutes les règles de cohérence internationales sont validées par le moteur M.I.A.</p>
                                <div className="mt-6 pt-4 border-t border-emerald-100 text-[10px] font-black tracking-widest text-emerald-600 uppercase">
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
                <button onClick={onBack} className="p-3 rounded-2xl bg-white hover:bg-slate-50 transition-all text-slate-400 hover:text-blue-600 border border-slate-200 shadow-sm group active:scale-95">
                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter truncate">{p.name || `${p.last_name || ''} ${p.first_name || ''}`.trim()}</h2>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[9px] font-black text-emerald-600 uppercase shadow-sm">VIVANT</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="text-slate-500">{p.nid}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span className="text-blue-600">RC-24-1054</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span>Dossier Mis à jour: 12/02/2025</span>
                    </div>
                </div>
                <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    <TabButton active={view === 'dashboard'} label="Dossier Patient" icon={Activity} onClick={() => setView('dashboard')} />
                    <TabButton active={view === 'rcp'} label="RCP Discussion" icon={MessageSquare} onClick={() => setView('rcp')} />
                    
                    <button 
                        onClick={() => setShowQR(true)} 
                        className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200 shadow-sm"
                    >
                        <QrCode size={14} />
                        Habitudes QR
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* ═══ PERSISTENT SIDEBAR: Socio-Demographics ═══════════ */}
                <aside className="lg:col-span-3 space-y-6 sticky top-6">
                    <div className="portal-card p-5 border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors shadow-sm" onClick={() => { setView('dashboard'); setActiveDetail('identity'); }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"><User size={18} /></div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-inter">Identité & Socio-Dém</h4>
                        </div>
                        <div className="space-y-1">
                            <SidebarItem icon={User} label="Sexe & Age" value={`${String(p.gender) === '1' || p.gender === 'M' ? 'Masculin' : 'Féminin'} • ${p.age || '—'} ans`} color="blue" />
                            <SidebarItem icon={Activity} label="Nationalité" value={extraInfo.nationality} color="blue" />
                            <SidebarItem icon={Shield} label="Email" value={extraInfo.email} color="blue" />
                            <SidebarItem icon={Activity} label="Contact" value={extraInfo.emergency_contact} color="rose" />
                        </div>
                    </div>

                    <div className="portal-card p-5 border-slate-200 bg-white shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 shadow-sm"><Heart size={18} /></div>
                            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Antécédents</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                <p className="text-[8px] text-slate-400 uppercase font-black mb-1.5">Médicaux/Chirurgicaux</p>
                                <div className="space-y-1">
                                    <span className="block text-[10px] text-slate-700 font-bold tracking-tight">HTA (Sous traitement)</span>
                                    <span className="block text-[10px] text-slate-700 font-bold tracking-tight">Diabète de type 2</span>
                                </div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                                <p className="text-[8px] text-rose-600 uppercase font-black mb-1.5">Allergies</p>
                                <span className="text-[10px] text-rose-800 font-bold">Pénicilline (Grave)</span>
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-slate-100 bg-white">
                                            <div onClick={() => setActiveDetail('tumor')} className="p-4 border-r border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Topographie</p>
                                                <p className="text-xl font-mono font-black text-slate-800 group-hover:text-blue-600 transition-colors">{TUMOR.topo_code}</p>
                                            </div>
                                            <div onClick={() => setActiveDetail('tumor')} className="p-4 border-r border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Morphologie</p>
                                                <p className="text-xl font-mono font-black text-slate-800 group-hover:text-blue-600 transition-colors">{TUMOR.morpho_code}</p>
                                            </div>
                                            <div onClick={() => setActiveDetail('staging')} className="p-4 border-r border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Stade TNM</p>
                                                <p className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{TUMOR.cStage}</p>
                                            </div>
                                            <div onClick={() => setActiveDetail('admin')} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">IARC Quality</p>
                                                <p className="text-xl font-black text-emerald-600 group-hover:text-emerald-700 transition-colors">CONFORME</p>
                                            </div>
                                        </div>
                                        <div onClick={() => setActiveDetail('tumor')} className="p-6 cursor-pointer bg-white hover:bg-slate-50 transition-colors group rounded-b-2xl">
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{TUMOR.morpho_label}</p>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                            </div>
                                            <p className="text-xs text-slate-500 italic font-medium leading-relaxed truncate">"{TUMOR.notes}"</p>
                                        </div>
                                    </DetailCard>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SummaryCard icon={Activity} title="État Vital & Incidence" subtitle="Dernière mise à jour : 12/02/2025" color="rose" onClick={() => setActiveDetail('vital')}>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs font-black text-emerald-600">VIVANT</span>
                                            <span className="text-[10px] text-slate-400 font-mono font-bold">INC: {TUMOR.incidence_date}</span>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard icon={Shield} title="Staging Clinique (cTNM)" subtitle="AJCC TNM 8ème Édition" color="violet" onClick={() => setActiveDetail('staging')}>
                                        <div className="flex gap-2 mt-2">
                                            <div className="px-2 py-1 rounded bg-violet-50 border border-violet-100 text-[10px] font-black text-violet-600 uppercase">{TUMOR.cT}</div>
                                            <div className="px-2 py-1 rounded bg-violet-50 border border-violet-100 text-[10px] font-black text-violet-600 uppercase">{TUMOR.cN}</div>
                                            <div className="px-2 py-1 rounded bg-violet-50 border border-violet-100 text-[10px] font-black text-violet-600 uppercase">{TUMOR.cM}</div>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard icon={Pill} title="Traitement Actuel" subtitle="Pharmacovigilance active" color="blue" onClick={() => setActiveDetail('treatment')}>
                                        <div className="mt-2">
                                            <p className="text-[10px] font-black text-slate-700 truncate">{TUMOR.tx2} • G1</p>
                                        </div>
                                    </SummaryCard>

                                    <SummaryCard icon={Building2} title="Sources & Rapports" subtitle={`${SOURCES.length} documents archivés`} color="slate" onClick={() => setActiveDetail('sources')}>
                                        <div className="mt-2 flex gap-1.5 overflow-hidden">
                                            {SOURCES.map((s, i) => (
                                                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-50 text-[8px] font-black text-slate-500 border border-slate-200">{s.type}</span>
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
                            <motion.div key="rcp" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="portal-card h-[700px] border-slate-200 overflow-hidden shadow-xl bg-white">
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
