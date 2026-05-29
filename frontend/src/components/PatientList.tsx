import React, { useState, useEffect, useRef } from 'react';
import { Filter, Calendar, MapPin, Eye, Trash2, Stethoscope, Microscope, Shield, Search, Download, Upload } from 'lucide-react';
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
                    <div key={i} className={`w-5 h-1.5 rounded-full transition-all ${i <= c.step ? `bg-${c.color}-600` : 'bg-slate-200'}`} />
                ))}
            </div>
            <span className={`text-[9px] font-bold uppercase text-${c.color}-700`}>{c.label}</span>
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Client-side pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const exportCSV = async () => {
        try {
            const token = localStorage.getItem('dzcancer_token');
            const baseURL = axios.defaults.baseURL || '/api/';
            
            // Construit l'URL avec le token pour l'authentification native du téléchargement
            const downloadUrl = `${baseURL}patients/export_csv/?token=${encodeURIComponent(token || '')}`;
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `registre_export_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            console.error('Export failed', err);
            alert("Erreur lors de l'export. Vérifiez votre connexion.");
        }
    };

    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            setLoading(true);
            const res = await axios.post('patients/bulk_import/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.has_collisions) {
                alert(`Conflits détectés pour ${res.data.collisions.length} dossiers ! Implémenter l'écran de résolution.`);
                // TODO: Render bulk resolution modal
            } else {
                fetchPatients();
            }
        } catch (err: any) {
            console.error(err);
            alert("Erreur lors de l'import: " + (err.response?.data?.detail || ""));
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const res = await axios.get('patients/');
            setPatients(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // Reset pagination when search or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    const filteredPatients = patients.filter(p => {
        const matchWilaya = !filters.wilaya || (p.wilaya_name || '').toLowerCase().includes(filters.wilaya.toLowerCase());
        const matchYear = !filters.year || (p.birth_date || '').includes(filters.year);
        const matchWorkflow = !filters.workflow || p.workflow === filters.workflow;
        
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || 
            (p.first_name || '').toLowerCase().includes(q) || 
            (p.last_name || '').toLowerCase().includes(q) || 
            (p.nid || '').toLowerCase().includes(q);
            
        return matchWilaya && matchYear && matchWorkflow && matchSearch;
    });

    // Pagination calculations
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    if (loading) return <div className="p-20 text-center animate-pulse text-slate-500">Chargement du registre…</div>;
    if (selected) return <PatientDetail patient={selected} onBack={() => setSelected(null)} />;

    return (
        <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'En attente Anapath', count: patients.filter(p => p.workflow === 'clinique').length, icon: Stethoscope, color: 'amber' },
                    { label: 'En attente Validation', count: patients.filter(p => p.workflow === 'anapath').length, icon: Microscope, color: 'blue' },
                    { label: 'Dossiers Complets', count: patients.filter(p => p.workflow === 'valide').length, icon: Shield, color: 'emerald' },
                ].map(s => (
                    <div key={s.label} className="portal-card p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${s.color}-50 text-${s.color}-600 border border-${s.color}-100`}><s.icon size={18} /></div>
                        <div>
                            <p className="text-xl font-black text-slate-800">{s.count}</p>
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <div className="flex-1 max-w-md">
                     <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher par nom ou NID..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                        />
                     </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-xs font-medium ${showFilters ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Filter size={14} /> {showFilters ? 'Fermer Filtres' : 'Filtres Avancés'}
                    </button>
                    <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-sm"
                    >
                        <Upload size={14} /> Importer
                    </button>
                    <button 
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-all"
                    >
                        <Download size={14} /> Exporter CSV
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
                        <div className="portal-card p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Wilaya</label>
                                <input type="text" value={filters.wilaya} onChange={e => setFilters({...filters, wilaya: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800" placeholder="Alger, Oran..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Année</label>
                                <input type="text" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800" placeholder="1980, 2026..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Topographie (CIM-O)</label>
                                <input type="text" value={filters.topo} onChange={e => setFilters({...filters, topo: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800" placeholder="C50, C34..." />
                            </div>
                             <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Statut Workflow</label>
                                <select value={filters.workflow} onChange={e => setFilters({...filters, workflow: e.target.value})} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800">
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

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            <th className="px-5 py-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Patient</th>
                            <th className="px-5 py-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Profil</th>
                            <th className="px-5 py-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Wilaya</th>
                            <th className="px-5 py-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Date Inscription</th>
                            <th className="px-5 py-4 text-[10px] uppercase font-black text-slate-500 tracking-wider">Statut Workflow</th>
                            <th className="px-5 py-4 text-[10px] uppercase font-black text-slate-500 tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {currentPatients.map((p: any, index: number) => {
                            const lastName = p.last_name || '';
                            const firstName = p.first_name || '';
                            const initials = `${lastName[0] || ''}${firstName[0] || ''}`.toUpperCase();
                            const patientKey = p.patient_id || p.id || index;
                            
                            return (
                                <motion.tr 
                                    key={patientKey}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => setSelected(p)}
                                    className="group hover:bg-slate-50/80 cursor-pointer transition-colors"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 group-hover:border-blue-400 transition-colors">
                                                <span className="text-[10px] font-black text-blue-600 group-hover:text-blue-700 uppercase">{initials}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 uppercase group-hover:text-blue-600 transition-colors">{lastName} {firstName}</h4>
                                                <p className="text-[9px] text-slate-500 font-mono tracking-widest">{p.nid}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-bold text-slate-600">{String(p.gender) === '1' ? 'Homme' : 'Femme'}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <MapPin size={12} className="text-slate-400" /> {p.wilaya_name || 'Inconnu'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <Calendar size={12} className="text-slate-400" /> {p.birth_date}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <WorkflowBadge workflow={p.workflow} />
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                            <button className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-blue-600 text-slate-400 hover:text-white transition-all">
                                                <Eye size={14} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); /* delete logic */ }}
                                                className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-rose-500 text-slate-400 hover:text-white transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 px-1 font-medium">
                <p>
                    {filteredPatients.length > 0 ? `${indexOfFirstItem + 1} à ${Math.min(indexOfLastItem, filteredPatients.length)}` : '0'} sur {patients.length} patients
                </p>
                <div className="flex gap-1.5">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 disabled:cursor-not-allowed"
                    >
                        Précédent
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 text-slate-600 disabled:cursor-not-allowed"
                    >
                        Suivant
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientList;
