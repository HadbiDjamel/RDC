import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Layout, Eye, EyeOff, Asterisk, Save, 
    RefreshCcw, Search, ChevronRight, Lock, Plus, X
} from 'lucide-react';
import axios from 'axios';

interface FieldConfig {
    id?: number;
    form_name: string;
    field_id: string;
    label: string;
    is_required: boolean;
    is_visible: boolean;
}

const AdminDynamicFields: React.FC = () => {
    const [configs, setConfigs] = useState<FieldConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newField, setNewField] = useState({ field_id: '', label: '' });


    const forms = ['PatientForm', 'TumorForm', 'LabForm'];
    const [selectedForm, setSelectedForm] = useState('PatientForm');

    useEffect(() => {
        fetchConfigs();
    }, [selectedForm]);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`dynamic-form-config/?form_name=${selectedForm}`);
            setConfigs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleField = (fieldId: string, property: 'is_required' | 'is_visible') => {
        setConfigs(prev => prev.map(c => 
            c.field_id === fieldId ? { ...c, [property]: !c[property] } : c
        ));
    };

    const handleAddField = () => {
        if (!newField.field_id || !newField.label) return alert("Veuillez remplir le code et le libellé.");
        const cleanId = newField.field_id.toLowerCase().replace(/[^a-z0-9_]/g, '');
        
        if (configs.find(c => c.field_id === cleanId)) return alert("Ce code champ existe déjà.");

        setConfigs(prev => [{
            form_name: selectedForm,
            field_id: cleanId,
            label: newField.label,
            is_visible: true,
            is_required: false
        }, ...prev]);

        setNewField({ field_id: '', label: '' });
        setIsAdding(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // In a real scenario, we'd batch update or update one by one
            for (const config of configs) {
                if (config.id) {
                    await axios.patch(`dynamic-form-config/${config.id}/`, config);
                } else {
                    await axios.post('dynamic-form-config/', config);
                }
            }
            alert('Configurations sauvegardées !');
        } catch (err) {
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tight">Studio Formulaires</h2>
                   <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Configuration dynamique des champs (Région Algérie)</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-sky-500/20 disabled:opacity-50"
                >
                    {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                    Enregistrer les Changements
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Form Selector Side */}
                <div className="md:col-span-1 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Modules</p>
                    {forms.map(f => (
                        <button
                            key={f}
                            onClick={() => setSelectedForm(f)}
                            className={`w-full p-4 rounded-xl flex items-center justify-between group transition-all border ${selectedForm === f ? 'bg-white/10 border-white/10 text-white' : 'hover:bg-white/5 border-transparent text-slate-500'}`}
                        >
                            <div className="flex items-center gap-3">
                                <Layout size={18} className={selectedForm === f ? 'text-sky-400' : 'text-slate-600'} />
                                <span className="text-sm font-bold">{f}</span>
                            </div>
                            <ChevronRight size={14} className={`transition-transform ${selectedForm === f ? 'rotate-90 text-sky-400' : 'opacity-0 group-hover:opacity-100'}`} />
                        </button>
                    ))}
                </div>

                {/* Main Config Area */}
                <div className="md:col-span-3 glass-card overflow-hidden flex flex-col border-white/5">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4 flex-1 mr-4">
                            <Search className="text-slate-600" size={18} />
                            <input 
                                type="text" 
                                placeholder="Filtrer les champs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-slate-600 font-bold"
                            />
                        </div>
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className={`p-2 rounded-lg transition-colors ${isAdding ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                            title="Ajouter un champ dynamique"
                        >
                            {isAdding ? <X size={18} /> : <Plus size={18} />}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[600px]">
                        {loading ? (
                            <div className="p-20 text-center text-slate-500 animate-pulse">Chargement de la structure...</div>
                        ) : configs.length === 0 ? (
                            <div className="p-20 text-center text-slate-600 space-y-4">
                                <Lock size={40} className="mx-auto opacity-20" />
                                <p className="text-xs font-black uppercase tracking-widest">Aucune configuration trouvée pour {selectedForm}</p>
                                <button className="text-sky-400 text-[10px] font-black uppercase">Initialiser les champs par défaut</button>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-white/[0.01] sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase">Champ / Label</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center w-32">Visible</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center w-32">Requis</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase text-center w-20"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isAdding && (
                                        <tr className="bg-emerald-500/5">
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="text" 
                                                    placeholder="Libellé (ex: Groupe Sanguin)"
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded px-3 py-1.5 text-sm text-white mb-2 outline-none focus:border-emerald-500/50 transition-colors"
                                                    value={newField.label}
                                                    onChange={e => setNewField({...newField, label: e.target.value})}
                                                    autoFocus
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Code (ex: blood_type)"
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded px-3 py-1.5 text-[10px] text-sky-400 font-mono outline-none focus:border-emerald-500/50 transition-colors"
                                                    value={newField.field_id}
                                                    onChange={e => setNewField({...newField, field_id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                                                />
                                            </td>
                                            <td colSpan={2} className="px-6 py-4 text-center">
                                                <span className="text-[10px] text-emerald-500/50 uppercase font-bold tracking-widest">Nouveau Champ</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={handleAddField}
                                                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded text-[10px] font-black uppercase tracking-wider"
                                                >
                                                    Ajouter
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                    {configs.filter(c => c.label.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                                        <tr key={c.field_id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-white mb-0.5">{c.label}</p>
                                                <code className="text-[10px] text-sky-400 font-mono">{c.field_id}</code>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => toggleField(c.field_id, 'is_visible')}
                                                    className={`p-2 rounded-xl transition-all ${c.is_visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}
                                                >
                                                    {c.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => toggleField(c.field_id, 'is_required')}
                                                    className={`p-2 rounded-xl transition-all ${c.is_required ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-600'}`}
                                                >
                                                    <Asterisk size={16} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* Meta actions */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDynamicFields;
