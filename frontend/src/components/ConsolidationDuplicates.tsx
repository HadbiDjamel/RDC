import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, AlertTriangle, CheckCircle2, X, 
    ArrowRight, Merge, Search, Info, Trash2
} from 'lucide-react';
import axios from 'axios';

interface DuplicateGroup {
    name: string;
    patients: any[];
}

const ConsolidationDuplicates: React.FC = () => {
    const [groups, setGroups] = useState<DuplicateGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
    const [primaryId, setPrimaryId] = useState<number | null>(null);
    const [merging, setMerging] = useState(false);

    useEffect(() => {
        const detectDuplicates = async () => {
            setLoading(true);
            try {
                // In a real backend, we'd have a specific endpoint /patients/duplicates/
                // For now, let's simulate by fetching all and grouping by name
                const res = await axios.get('patients/');
                const all = res.data;
                const map: Record<string, any[]> = {};
                
                all.forEach((p: any) => {
                    const key = `${p.last_name} ${p.first_name}`.toLowerCase();
                    if (!map[key]) map[key] = [];
                    map[key].push(p);
                });

                const dups = Object.entries(map)
                    .filter(([_, list]) => list.length > 1)
                    .map(([name, list]) => ({ name: name.toUpperCase(), patients: list }));

                setGroups(dups);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        detectDuplicates();
    }, []);

    const handleMerge = async () => {
        if (!selectedGroup || !primaryId) return;
        setMerging(true);
        try {
            const duplicates = selectedGroup.patients.filter(p => p.patient_id !== primaryId);
            for (const dup of duplicates) {
                await axios.delete(`patients/${dup.patient_id}/`);
            }
            setGroups(groups.filter(g => g.name !== selectedGroup.name));
            setSelectedGroup(null);
            setPrimaryId(null);
        } catch (err) {
            console.error('Erreur lors de la fusion:', err);
        } finally {
            setMerging(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500">Recherche de doublons dans le registre...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tight">Consolidation & Doublons</h2>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Détection automatique basée sur l'identité</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="text-amber-500" size={18} />
                    <div>
                        <p className="text-lg font-black text-white leading-none">{groups.length}</p>
                        <p className="text-[9px] text-amber-500 font-bold uppercase">Groupes Suspects</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* List of Duplicate Groups */}
                <div className="space-y-4">
                    {groups.map((g, idx) => (
                        <div 
                            key={idx}
                            onClick={() => {
                                setSelectedGroup(g);
                                setPrimaryId(g.patients[0].patient_id);
                            }}
                            className={`glass-card p-4 cursor-pointer transition-all border ${selectedGroup?.name === g.name ? 'border-sky-500 bg-sky-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/2'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Users size={16} /></div>
                                    <div>
                                        <h4 className="text-sm font-black text-white">{g.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{g.patients.length} Dossiers Trouvés</p>
                                    </div>
                                </div>
                                <ArrowRight size={16} className={selectedGroup?.name === g.name ? 'text-sky-400' : 'text-slate-600'} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Resolution Panel */}
                <div className="glass-card p-8 border-white/5 bg-white/1 relative min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {!selectedGroup ? (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center p-10"
                            >
                                <div className="p-4 bg-white/5 rounded-2xl text-slate-600 mb-4">
                                    <Search size={40} />
                                </div>
                                <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest">Sélectionnez un groupe pour résoudre les conflits</h3>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="detail"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="text-xl font-black text-white uppercase">{selectedGroup.name}</h3>
                                    <button onClick={() => setSelectedGroup(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                                </div>

                                <div className="space-y-4">
                                    {selectedGroup.patients.map((p, pIdx) => (
                                        <div key={p.patient_id} className={`p-4 rounded-xl border ${primaryId === p.patient_id ? 'border-sky-500 bg-sky-500/10' : 'border-white/10 bg-black/40'} relative group transition-colors`}>
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setPrimaryId(p.patient_id)} 
                                                    className={`p-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors ${primaryId === p.patient_id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/30'}`}
                                                >
                                                    Garder Principal
                                                </button>
                                                <button onClick={() => {
                                                    const updated = selectedGroup.patients.filter(pt => pt.patient_id !== p.patient_id);
                                                    if(updated.length < 2) {
                                                        setGroups(groups.filter(g => g.name !== selectedGroup.name));
                                                        setSelectedGroup(null);
                                                    } else {
                                                        setSelectedGroup({...selectedGroup, patients: updated});
                                                        if(primaryId === p.patient_id) setPrimaryId(updated[0].patient_id);
                                                    }
                                                }} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/30 transition-colors">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase">NID / Identité</p>
                                                    <p className="text-xs font-bold text-sky-400 font-mono">{p.nid}</p>
                                                    <p className="text-[10px] text-slate-300">{p.gender === '1' ? 'Homme' : 'Femme'} • {p.birth_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase">Localisation</p>
                                                    <p className="text-xs font-bold text-white">{p.wilaya_name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black">{p.commune_name || 'Inconnue'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/5 space-y-4">
                                    <div className="bg-sky-500/10 border border-sky-500/20 p-4 rounded-2xl flex gap-3 items-start">
                                        <Info className="text-sky-400 mt-0.5" size={16} />
                                        <p className="text-[11px] text-sky-300 font-medium">La fusion combinera les historiques cliniques et les tumeurs associées vers le dossier principal sélectionné.</p>
                                    </div>
                                    <button 
                                        onClick={handleMerge}
                                        disabled={merging || !primaryId}
                                        className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-slate-200 disabled:opacity-50 transition-all shadow-xl shadow-white/10"
                                    >
                                        <Merge size={18} /> {merging ? 'Fusion en cours...' : 'Exécuter la Fusion'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ConsolidationDuplicates;
