import React, { useState, useEffect } from 'react';
import { Filter, Calendar, MapPin, Eye, Trash2, Stethoscope, Microscope, Shield, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PatientDetail from './PatientDetail';
import axios from 'axios';

type WorkflowStep = 'clinique' | 'anapath' | 'valide';

interface Patient {
    id: number; first_name: string; last_name: string; nid: string; gender: string;
    wilaya_name: string; birth_date: string; workflow: WorkflowStep;
}

const WORKFLOW_CONFIG: Record<WorkflowStep, { label: string; color: string; step: number }> = {
    clinique: { label: 'En attente Anapath', color: 'amber', step: 1 },
    anapath: { label: 'En attente Validation', color: 'sky', step: 2 },
    valide: { label: 'Dossier Complet', color: 'emerald', step: 3 },
};

const WorkflowBadge = ({ workflow }: { workflow: WorkflowStep }) => {
    const c = WORKFLOW_CONFIG[workflow];
    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`w-5 h-1.5 rounded-full transition-all ${i <= c.step ? `bg-${c.color}-500` : 'bg-white/5'}`} />
                ))}
            </div>
            <span className={`text-[9px] font-bold uppercase text-${c.color}-400`}>{c.label}</span>
        </div>
    );
};

const PatientList: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Patient | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        wilaya: '',
        year: '',
        topo: '',
        workflow: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            // In a real app, backend filtering would be handled here
            const res = await axios.get('patients/');
            setPatients(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, [searchQuery]);

    const filteredPatients = patients.filter(p => {
        const matchWilaya = !filters.wilaya || (p.wilaya_name || '').toLowerCase().includes(filters.wilaya.toLowerCase());
        const matchYear = !filters.year || (p.birth_date || '').includes(filters.year);
        const matchWorkflow = !filters.workflow || p.workflow === filters.workflow;
        
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || 
            (p.first_name || '').toLowerCase().includes(q) || 
            (p.last_name || '').toLowerCase().includes(q) || 
            (p.nid || '').toLowerCase().includes(q);
            
        // Topography is usually on Tumor, but let's assume we filter by patient search/metadata
        return matchWilaya && matchYear && matchWorkflow && matchSearch;
    });

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500">Chargement du registre…</div>;
    if (selected) return <PatientDetail patient={selected} onBack={() => setSelected(null)} />;

    return (
        <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'En attente Anapath', count: patients.filter(p => p.workflow === 'clinique').length, icon: Stethoscope, color: 'amber' },
                    { label: 'En attente Validation', count: patients.filter(p => p.workflow === 'anapath').length, icon: Microscope, color: 'sky' },
                    { label: 'Dossiers Complets', count: patients.filter(p => p.workflow === 'valide').length, icon: Shield, color: 'emerald' },
                ].map(s => (
                    <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${s.color}-500/10 text-${s.color}-400`}><s.icon size={18} /></div>
                        <div>
                            <p className="text-xl font-black text-white">{s.count}</p>
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex-1 max-w-md">
                     <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-sky-400 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom ou NID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-sky-500/50 transition-all"
                        />
                     </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-xs font-medium ${showFilters ? 'bg-sky-500 border-sky-400 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                    >
                        <Filter size={14} /> {showFilters ? 'Fermer Filtres' : 'Filtres Avancés'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all">
                        Exporter CSV
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Wilaya</label>
                                <input type="text" value={filters.wilaya} onChange={e => setFilters({...filters, wilaya: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" placeholder="Alger, Oran..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Année</label>
                                <input type="text" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" placeholder="1980, 2024..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Topographie (CIM-O)</label>
                                <input type="text" value={filters.topo} onChange={e => setFilters({...filters, topo: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" placeholder="C50, C34..." />
                            </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Statut Workflow</label>
                                <select value={filters.workflow} onChange={e => setFilters({...filters, workflow: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
                                    <option value="">Tous les dossiers</option>
                                    <option value="clinique">En attente Anapath</option>
                                    <option value="anapath">En attente Validation</option>
                                    <option value="valide">Complets</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPatients.map((p: Patient, index: number) => (
                    <motion.div key={p.id || index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="morphing-glass rounded-2xl p-5 cursor-pointer group relative overflow-hidden"
                        onClick={() => setSelected(p)}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-${WORKFLOW_CONFIG[p.workflow].color}-500/5 blur-3xl group-hover:bg-${WORKFLOW_CONFIG[p.workflow].color}-500/10 transition-colors duration-500`} />
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/20 transition-all duration-500" />

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                {/* Morphing Avatar Indicator */}
                                <div className="relative w-10 h-10 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-slate-800 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] border-2 border-white/10 group-hover:border-sky-400/50 group-hover:animate-[slow-spin_8s_linear_infinite] transition-all duration-500" />
                                    <div className="absolute inset-0 bg-slate-900/50 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] group-hover:animate-[reverse-spin_12s_linear_infinite] transition-all duration-500" />
                                    <span className="relative z-10 text-sky-400 font-black text-[11px] uppercase group-hover:text-white transition-colors duration-300">
                                        {p.last_name[0]}{p.first_name[0]}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors uppercase tracking-tight">{p.last_name} {p.first_name}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">{p.nid}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Profil</span>
                                <span className="text-slate-300 font-bold">{p.gender === '1' ? 'Homme' : 'Femme'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Base</span>
                                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                                    <MapPin size={12} className="text-sky-500/50" /> {p.wilaya_name}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-medium">Inscrit le</span>
                                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                                    <Calendar size={12} className="text-emerald-500/50" /> {p.birth_date}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                            <WorkflowBadge workflow={p.workflow} />

                            {/* Hover Action Panel */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-sky-500/20 hover:text-sky-400 text-slate-400 transition-colors">
                                    <Eye size={14} />
                                </button>
                                <button className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 px-1 font-medium">
                <p>{patients.length} sur 12,842 patients</p>
                <div className="flex gap-1.5">
                    <button className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30" disabled>Précédent</button>
                    <button className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10">Suivant</button>
                </div>
            </div>
        </div>
    );
};

export default PatientList;
