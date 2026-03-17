import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Filter, ChevronLeft, Activity, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface DictionaryItem {
    id: number;
    section: string;
    code: string;
    label: string;
    description: string;
}

interface ToxicityItem {
    id: number;
    category: string;
    term: string;
    grade_1: string;
    grade_2: string;
    grade_3: string;
    grade_4: string;
    grade_5: string;
    [key: string]: any;
}

type SelectedItem = ({ type: 'dict' } & DictionaryItem) | ({ type: 'tox' } & ToxicityItem);

const MedicalReference = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('ALL');
    const [dictionary, setDictionary] = useState<DictionaryItem[]>([]);
    const [toxicity, setToxicity] = useState<ToxicityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dictRes, toxRes] = await Promise.all([
                axios.get('dictionary/'),
                axios.get('toxicity/')
            ]);
            setDictionary(dictRes.data);
            setToxicity(toxRes.data);
        } catch (error) {
            console.error("Error fetching medical reference:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDictionary = dictionary.filter(item =>
        (category === 'ALL' || item.section === category) &&
        (item.label.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredToxicity = toxicity.filter(item =>
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sections = [
        { id: 'ALL', label: 'Tout' },
        { id: 'TOPO', label: 'Localisations' },
        { id: 'BASIS', label: 'Diagnostic' },
        { id: 'TOX', label: 'Toxicités' },
        { id: 'ETAT', label: 'Statut' },
    ];

    // Details View
    if (selectedItem) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full overflow-hidden text-slate-300"
            >
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => setSelectedItem(null)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div>
                        <h2 className="text-xl font-black text-white leading-tight">
                            {selectedItem.type === 'dict' ? selectedItem.label : selectedItem.term}
                        </h2>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 inline-block ${selectedItem.type === 'tox' ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'
                            }`}>
                            {selectedItem.type === 'dict' ? selectedItem.section : `TOXICITÉ: ${selectedItem.category}`}
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide pb-20">
                    {selectedItem.type === 'dict' ? (
                        <div className="glass-card p-5 border-white/5">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Info size={14} className="text-sky-400" /> Définition / Note
                                </h4>
                                <span className="font-mono text-sm font-bold text-sky-400 bg-sky-500/10 px-2 py-1 rounded-md">
                                    CODE: {selectedItem.code}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {selectedItem.description || "Aucune description détaillée disponible pour ce code dans le dictionnaire standard du registre."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Critères de cotation CTCAE</h4>
                            {[1, 2, 3, 4, 5].map(grade => {
                                const desc = selectedItem[`grade_${grade}`];
                                if (!desc || desc === 'N/A') return null;

                                const isSevere = grade >= 3;
                                return (
                                    <div key={grade} className={`glass-card p-4 border-l-4 ${grade === 5 ? 'border-l-purple-500 bg-purple-500/5' :
                                        grade === 4 ? 'border-l-red-500 bg-red-500/5' :
                                            grade === 3 ? 'border-l-orange-500 bg-orange-500/5' :
                                                grade === 2 ? 'border-l-amber-500 bg-amber-500/5' :
                                                    'border-l-emerald-500 bg-emerald-500/5'
                                        }`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${grade === 5 ? 'bg-purple-500/20 text-purple-400' :
                                                grade === 4 ? 'bg-red-500/20 text-red-400' :
                                                    grade === 3 ? 'bg-orange-500/20 text-orange-400' :
                                                        grade === 2 ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                Grade {grade}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300">{desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    // List View
    return (
        <div className="flex flex-col h-full">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Rechercher un terme, code, toxicité..."
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 glass-input text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500/30 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setCategory(s.id)}
                            className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-bold transition-all border ${category === s.id
                                ? 'bg-sky-500/20 border-sky-500/30 text-sky-400'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide pb-20">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="mb-4">
                            <Filter className="w-6 h-6 text-sky-500/50" />
                        </motion.div>
                        <p className="text-xs font-medium uppercase tracking-widest">Chargement...</p>
                    </div>
                ) : (
                    <>
                        {category !== 'TOX' && filteredDictionary.map(item => (
                            <motion.div
                                layout
                                key={`dict-${item.id}`}
                                onClick={() => setSelectedItem({ type: 'dict', ...item })}
                                className="group p-3 glass-card hover:bg-white/5 border-white/5 cursor-pointer transition-all flex items-start justify-between"
                            >
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">
                                            {item.section}
                                        </span>
                                        <span className="font-mono text-xs text-slate-500">{item.code}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                                        {item.label}
                                    </h3>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors mt-1" />
                            </motion.div>
                        ))}

                        {(category === 'ALL' || category === 'TOX') && filteredToxicity.map(tox => (
                            <motion.div
                                layout
                                key={`tox-${tox.id}`}
                                onClick={() => setSelectedItem({ type: 'tox', ...tox })}
                                className="group p-3 glass-card hover:bg-white/5 border-rose-500/10 cursor-pointer transition-all flex items-start justify-between"
                            >
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                                            <Activity size={10} /> TOXICITÉS
                                        </span>
                                        <span className="text-[9px] text-slate-500 uppercase truncate">{tox.category}</span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white leading-snug">
                                        {tox.term}
                                    </h3>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 transition-colors mt-1" />
                            </motion.div>
                        ))}

                        {(filteredDictionary.length === 0 && filteredToxicity.length === 0) && (
                            <div className="text-center py-10">
                                <Search className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">Aucun résultat trouvé pour "{searchTerm}"</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MedicalReference;
