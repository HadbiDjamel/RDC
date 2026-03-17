import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Zap, Search, Save, BrainCircuit } from 'lucide-react';

const AnapathTerminal: React.FC = () => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleInput = async (text: string) => {
        setInput(text);
        if (text.length > 3) {
            setLoading(true);
            // Simulation SARA NLP-to-Code mapping
            setTimeout(() => {
                setSuggestions([
                    { code: '8070/3', desc: 'Carcinome épidermoïde, SAI', site: 'C34.9' },
                    { code: '8140/3', desc: 'Adénocarcinome, SAI', site: 'C34.9' },
                    { code: '8041/3', desc: 'Carcinome à petites cellules, SAI', site: 'C34.0' }
                ]);
                setLoading(false);
            }, 600);
        } else {
            setSuggestions([]);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Terminal size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">Terminal de Codage Anapate</h3>
                        <p className="text-sm text-slate-500">Saisie haute vitesse assistée par M.I.A.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="px-3 py-1 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700">
                        LN 1, COL 12
                    </div>
                    <div className="px-3 py-1 rounded bg-sky-500/10 text-[10px] text-sky-400 font-mono border border-sky-500/20">
                        M.I.A.: ACTIVE
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Editor Area */}
                <div className="lg:col-span-2 glass-card p-0 flex flex-col overflow-hidden border-sky-500/20 shadow-lg shadow-sky-500/5">
                    <div className="bg-slate-900/50 p-3 border-b border-white/5 flex items-center justify-between">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">codification_batch_01.cim</span>
                    </div>
                    <div className="flex-1 p-6 font-mono text-lg relative">
                        <textarea
                            className="w-full h-full bg-transparent border-none outline-none resize-none text-sky-100 placeholder:text-slate-700 leading-relaxed"
                            placeholder="Entrez le diagnostic textuel... (ex: Carcinome épidermoïde du lobe supérieur poumon)"
                            value={input}
                            onChange={(e) => handleInput(e.target.value)}
                            autoFocus
                        />
                        {loading && (
                            <div className="absolute top-8 right-8">
                                <Zap className="text-amber-400 animate-pulse" size={24} />
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-slate-900/30 border-t border-white/5 flex gap-4">
                        <button className="flex-1 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded-lg flex items-center justify-center gap-2 transition-all font-medium">
                            <Save size={16} /> Enregistrer Batch
                        </button>
                    </div>
                </div>

                {/* AI Assistant Sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20">
                        <div className="flex items-center gap-2 mb-4 text-amber-400 font-semibold tracking-wide text-xs uppercase">
                            <BrainCircuit size={14} /> Suggestions M.I.A. (CIM-O-3)
                        </div>
                        <div className="space-y-4">
                            <AnimatePresence>
                                {suggestions.length > 0 ? (
                                    suggestions.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-amber-500/50 cursor-pointer transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-amber-400 font-mono font-bold text-lg">{item.code}</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">{item.site}</span>
                                            </div>
                                            <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.desc}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-slate-600 italic text-sm">
                                        En attente de saisie...
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="glass-card p-6 border-white/5 flex-1 opacity-50 grayscale pointer-events-none">
                        <div className="flex items-center gap-2 mb-4 text-slate-400 font-semibold tracking-wide text-xs uppercase">
                            <Search size={14} /> Recherche Manuelle
                        </div>
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-800 rounded w-3/4" />
                            <div className="h-4 bg-slate-800 rounded w-1/2" />
                            <div className="h-4 bg-slate-800 rounded w-2/3" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnapathTerminal;
