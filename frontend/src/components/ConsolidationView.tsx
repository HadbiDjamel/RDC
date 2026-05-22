import React, { useState, useEffect } from 'react';
import { Copy, ShieldAlert, ArrowRight, History, UserCircle2, Clock, GitMerge, Users } from 'lucide-react';
import ConsolidationDuplicates from './ConsolidationDuplicates';

interface MergeRecord {
    id: number;
    surviving_patient: any;
    document_a_snapshot: any;
    document_b_snapshot: any;
    match_confidence: string;
    merged_at: string;
    merged_by: string;
    is_active: boolean;
}

const ConsolidationView: React.FC = () => {
    const [merges, setMerges] = useState<MergeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMerge, setSelectedMerge] = useState<MergeRecord | null>(null);
    const [activeTab, setActiveTab] = useState<'audit' | 'duplicates'>('duplicates');

    useEffect(() => {
        fetch('/api/merges/')
            .then(res => res.json())
            .then(data => {
                setMerges(data);
                setIsLoading(false);
            })
            .catch(err => console.error("Error fetching merges:", err));
    }, []);

    const renderPatientSnapshot = (title: string, snapshot: any) => {
        if (!snapshot || !snapshot.snapshot_data) return <div className="p-4 text-slate-500">Pas de données</div>;
        const data = snapshot.snapshot_data;
        return (
            <div className="glass-card p-6 h-full border-t-4 border-slate-700/50">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                    <UserCircle2 size={24} className="text-slate-400" />
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                        <span className="text-slate-500 uppercase text-[10px] font-black tracking-wider">NID / Identifiant</span>
                        <span className="font-mono text-sky-400">{data.nid}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <span className="text-slate-500 uppercase text-[10px] font-black tracking-wider">Nom complet</span>
                        <span className="font-bold text-white">{data.last_name} {data.first_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <span className="text-slate-500 uppercase text-[10px] font-black tracking-wider">Date Naissance</span>
                        <span className="text-slate-300">{data.birth_date || 'N/A'}</span>
                    </div>
                    {data.tumors && data.tumors.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-white/5">
                            <h4 className="text-xs font-black uppercase text-amber-500 mb-3 tracking-widest">Tumeurs ({data.tumors.length})</h4>
                            {data.tumors.map((t: any, i: number) => (
                                <div key={i} className="mb-2 p-2 rounded bg-white/5 font-mono text-[10px] text-amber-400/80">
                                    {t.topo_code} - {t.morpho_code}
                                    <br /><span className="text-slate-500">Diag: {t.incidence_date}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="p-8 min-h-screen flex flex-col max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <GitMerge className="text-amber-500" />
                        Vue Consolidation (Audit Doublons)
                    </h2>
                    <p className="text-slate-400 mt-2">
                        Historique des fusions automatiques réalisées par le moteur de résolution IARC.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('audit')}
                        className={`px-4 py-2 rounded-xl flex items-center gap-3 transition-all border ${activeTab === 'audit' ? 'bg-sky-500 border-sky-400 text-white shadow-lg shadow-sky-500/20' : 'glass-card border-white/5 text-slate-400 hover:text-white'}`}
                    >
                        <History size={16} />
                        <span className="text-sm font-bold uppercase tracking-tight">Audit Trail</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('duplicates')}
                        className={`px-4 py-2 rounded-xl flex items-center gap-3 transition-all border ${activeTab === 'duplicates' ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20' : 'glass-card border-white/5 text-slate-400 hover:text-white'}`}
                    >
                        <Users size={16} />
                        <span className="text-sm font-bold uppercase tracking-tight">Résolution Doublons</span>
                    </button>
                </div>
            </div>

            {activeTab === 'audit' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                    {/* Audit Trail List */}
                    <div className="lg:col-span-1 glass-card overflow-y-auto overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="font-bold text-white text-sm uppercase tracking-widest flex items-center gap-2">
                                <Clock size={14} className="text-slate-400" /> Journal d'Activité
                            </h3>
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto space-y-3">
                            {isLoading ? (
                                <div className="text-center p-8 text-slate-500 animate-pulse">Chargement de l'audit...</div>
                            ) : merges.length === 0 ? (
                                <div className="text-center p-8 text-slate-500">Aucune fusion enregistrée.</div>
                            ) : (
                                merges.map(merge => (
                                    <div
                                        key={merge.id}
                                        onClick={() => setSelectedMerge(merge)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedMerge?.id === merge.id ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-xs font-mono text-sky-400">{merge.document_a_snapshot?.snapshot_data?.nid || 'Inconnu'}</div>
                                            <div className="text-[9px] text-slate-500">{new Date(merge.merged_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-sm font-bold text-white mb-2">
                                            {merge.document_a_snapshot?.snapshot_data?.last_name} {merge.document_a_snapshot?.snapshot_data?.first_name}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                                                {merge.match_confidence}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Split Screen Viewer */}
                    <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col bg-slate-900/50">
                        {selectedMerge ? (
                            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Détails de Fusion : NID {selectedMerge.document_a_snapshot?.snapshot_data?.nid}</h3>
                                        <p className="text-sm text-slate-400 mt-1">Opérée automatiquement par: {selectedMerge.merged_by}</p>
                                    </div>
                                    <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                                        <ShieldAlert size={14} /> Annuler la fusion (Séparer)
                                    </button>
                                </div>

                                <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                                    <div>
                                        <div className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Document Conservé (A)</div>
                                        {renderPatientSnapshot("Profil Principal", selectedMerge.document_a_snapshot)}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                                            <ArrowRight size={12} />
                                        </div>
                                        <div className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Document Fusionné &amp; Supprimé (B)</div>
                                        {renderPatientSnapshot("Profil Doublon", selectedMerge.document_b_snapshot)}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                <Copy size={48} className="text-slate-700 mb-6" />
                                <h3 className="text-xl font-bold text-slate-400">Sélectionnez une fusion</h3>
                                <p className="text-sm text-slate-500 max-w-sm mt-2">Cliquez sur un événement dans le journal d'activité pour comparer les documents A et B ayant conduit au dossier final consolidé.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <ConsolidationDuplicates />
            )}
        </div>
    );
};

export default ConsolidationView;
