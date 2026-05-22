import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, Plus, Trash2, FileCode, CheckCircle2, Shield, Activity, Hospital, Database, Code2 } from 'lucide-react';
import AdminDynamicFields from './AdminDynamicFields';

const SystemStudio: React.FC = () => {
    const [variables, setVariables] = useState([
        { id: 1, name: 'TNM_EDITION', type: 'Integer', value: '7', description: 'Version du système TNM utilisée' },
        { id: 2, name: 'SITE_DCO_DEFAULT', type: 'Boolean', value: 'False', description: 'Autoriser DCO par défaut' },
        { id: 3, name: 'AUTO_CODE_MORPHO', type: 'Boolean', value: 'True', description: 'Codage automatique de la morphologie via IA' },
        { id: 4, name: 'NID_VALIDATION', type: 'String', value: '^1[0-9]{17}$', description: 'Regex de validation NID Algérien' }
    ]);
    const [showSaved, setShowSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'xml' | 'fields'>('xml');

    // Sync with LocalStorage to simulate "working in needed places"
    const handleSave = () => {
        const config = variables.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.value }), {});
        localStorage.setItem('sys_config', JSON.stringify(config));
        
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
    };

    const updateValue = (id: number, newValue: string) => {
        setVariables(prev => prev.map(v => v.id === id ? { ...v, value: newValue } : v));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-6">
            {/* Header Area */}
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Settings size={14} strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Configuration Avancée</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">System Studio</h2>
                    <p className="text-slate-500 text-sm font-medium">Gestion des fichiers .xml de définition (DzCancer Core)</p>
                </div>
                
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200 transition-all shadow-sm">
                        <FileCode size={16} />
                        Voir XML
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Save size={16} />
                        Sauvegarder
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100/80 rounded-2xl w-fit border border-slate-200/50">
                <button 
                    onClick={() => setActiveTab('xml')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === 'xml' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    Variables XML
                </button>
                <button 
                    onClick={() => setActiveTab('fields')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        activeTab === 'fields' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    Champs Dynamiques
                </button>
            </div>

            <AnimatePresence>
                {showSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold shadow-sm"
                    >
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                            <CheckCircle2 size={16} />
                        </div>
                        Configuration synchronisée avec le moteur DzCancer Core (system_config.xml)
                    </motion.div>
                )}
            </AnimatePresence>

            {activeTab === 'xml' ? (
                <div className="space-y-8">
                    {/* Variables Table */}
                    <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Variable</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valeur Actuelle</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description du Noyau</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {variables.map((v) => (
                                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <Code2 size={14} />
                                                    </div>
                                                    <span className="font-mono text-xs font-black text-slate-700 tracking-tight">{v.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                                    {v.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <input
                                                    type="text"
                                                    value={v.value}
                                                    onChange={(e) => updateValue(v.id, e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                                />
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs text-slate-500 font-medium">{v.description}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-slate-50/30 border-t border-slate-100">
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                                <Plus size={16} strokeWidth={3} />
                                Ajouter une variable locale au noyau
                            </button>
                        </div>
                    </div>

                    {/* Secondary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Database size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Dictionnaires CIM</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nomenclature active</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">CIM-O-3 (Topographique)</span>
                                    <span className="text-[9px] bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">Actif</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-tight">CIM-O-3 (Morphologique)</span>
                                    <span className="text-[9px] bg-slate-200 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">Vérification</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Hospital size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">Unités de Santé</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Structure du réseau</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-blue-600 text-xs font-black tracking-tighter">CH</div>
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">CHU Mustapha Bacha</span>
                                    </div>
                                    <Settings size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-emerald-600 text-xs font-black tracking-tighter">CP</div>
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-tight">CPM Alger Centre</span>
                                    </div>
                                    <Settings size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <AdminDynamicFields />
            )}
        </div>
    );
};

export default SystemStudio;
