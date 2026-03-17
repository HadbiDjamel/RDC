import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Plus, Trash2, FileCode, CheckCircle2 } from 'lucide-react';
import AdminDynamicFields from './AdminDynamicFields';

const SystemStudio: React.FC = () => {
    const [variables] = useState([
        { id: 1, name: 'TNM_EDITION', type: 'Integer', value: '7', description: 'Version du système TNM utilisée' },
        { id: 2, name: 'SITE_DCO_DEFAULT', type: 'Boolean', value: 'False', description: 'Autoriser DCO par défaut' },
        { id: 3, name: 'AUTO_CODE_MORPHO', type: 'Boolean', value: 'True', description: 'Codage automatique de la morphologie via IA' },
        { id: 4, name: 'NID_VALIDATION', type: 'String', value: '^1[0-9]{17}$', description: 'Regex de validation NID Algérien' }
    ]);
    const [showSaved, setShowSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'xml' | 'fields'>('xml');

    const handleSave = () => {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 3000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">System Studio</h2>
                    <p className="text-slate-500 text-sm">Gestion des fichiers .xml de définition (DzCancer Core)</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold border border-white/5 transition-all">
                        <FileCode size={18} />
                        Voir XML
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-500/20 transition-all"
                    >
                        <Save size={18} />
                        Sauvegarder
                    </button>
                </div>
            </div>

            <div className="flex gap-4 border-b border-white/5 pb-4">
                <button 
                    onClick={() => setActiveTab('xml')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'xml' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Variables XML
                </button>
                <button 
                    onClick={() => setActiveTab('fields')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'fields' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                    Champs Dynamiques
                </button>
            </div>

            {showSaved && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm"
                >
                    <CheckCircle2 size={18} />
                    Configuration mise à jour avec succès dans system_config.xml
                </motion.div>
            )}

            {activeTab === 'xml' ? (
                <>
                    <div className="glass-card overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Variable</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Valeur</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Description</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {variables.map((v) => (
                                    <tr key={v.id} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-sky-400">{v.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 uppercase">{v.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                defaultValue={v.value}
                                                className="bg-slate-900/50 border border-white/5 rounded px-2 py-1 text-xs text-white focus:border-sky-500/50 outline-none w-full"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{v.description}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-600 hover:text-rose-400 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 bg-white/[0.02] border-t border-white/5">
                            <button className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors">
                                <Plus size={16} />
                                Ajouter une variable locale
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Dictionnaires CIM</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs font-bold">CIM-O-3 (Topographie)</span>
                                    <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded uppercase">Actif</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 opacity-50">
                                    <span className="text-xs font-bold">CIM-O-3 (Morphologie)</span>
                                    <span className="text-[10px] bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded uppercase">Vérification</span>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Unités de Santé</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400 text-xs font-bold font-mono">CH</div>
                                        <span className="text-xs font-bold">CHU Mustapha Bacha</span>
                                    </div>
                                    <Settings size={14} className="text-slate-500" />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">CP</div>
                                        <span className="text-xs font-bold">CPM Alger Centre</span>
                                    </div>
                                    <Settings size={14} className="text-slate-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <AdminDynamicFields />
            )}
        </div>
    );
};

export default SystemStudio;
