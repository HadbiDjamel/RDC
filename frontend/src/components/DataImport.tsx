import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, ArrowRight, CheckCircle2, AlertCircle, Database, ChevronRight, Play } from 'lucide-react';
import axios from 'axios';

const DB_FIELDS = [
    {
        group: "Général",
        options: [
            { value: 'ignore', label: '-- Ignorer cette colonne --' }
        ]
    },
    {
        group: "Patient - Identité",
        options: [
            { value: 'registration_number', label: 'Numéro d\'enregistrement' },
            { value: 'first_name', label: 'Prénom' },
            { value: 'last_name', label: 'Nom de famille' },
            { value: 'maiden_name', label: 'Nom de jeune fille' },
            { value: 'gender', label: 'Sexe (1=M, 2=F, 9=Inc)' },
            { value: 'birth_date', label: 'Date de naissance (DD/MM/YYYY)' },
        ]
    },
    {
        group: "Patient - Identifiants",
        options: [
            { value: 'nid', label: 'Identifiant National (NID)' },
            { value: 'passport_number', label: 'Numéro de passeport' },
            { value: 'social_security_number', label: 'N° Sécurité Sociale' },
        ]
    },
    {
        group: "Patient - Démographie & Contact",
        options: [
            { value: 'phone', label: 'Téléphone' },
            { value: 'email', label: 'Email' },
            { value: 'nationality', label: 'Nationalité' },
            { value: 'ethnicity', label: 'Ethnie/Groupe' },
            { value: 'marital_status', label: 'Statut matrimonial (S,M,D,W,U)' },
            { value: 'occupation', label: 'Profession' },
            { value: 'education_level', label: 'Niveau d\'éducation' },
            { value: 'income_bracket', label: 'Revenu/CSP' },
            { value: 'emergency_contact', label: 'Contact d\'urgence' },
            { value: 'address_1', label: 'Adresse ligne 1' },
            { value: 'address_2', label: 'Adresse ligne 2' },
            { value: 'wilaya_id', label: 'Code Wilaya (Ex: 16)' },
            { value: 'commune_id', label: 'Code Commune (Ex: 1601)' },
        ]
    },
    {
        group: "Patient - Suivi & Statut",
        options: [
            { value: 'vital_status', label: 'Statut vital (A, D, U)' },
            { value: 'date_of_death', label: 'Date de décès (DD/MM/YYYY)' },
            { value: 'cause_of_death_icd10', label: 'Cause de décès (CIM-10)' },
            { value: 'autopsy', label: 'Autopsie (Y, N, U)' },
            { value: 'last_contact_date', label: 'Date dernier contact' },
            { value: 'record_status', label: 'Statut du dossier (0, 1, 2)' },
            { value: 'check_status', label: 'Statut de vérification' },
            { value: 'workflow', label: 'Statut Workflow' },
        ]
    },
    {
        group: "Tumeur - Core",
        options: [
            { value: 'tumor_incidence_date', label: 'Date d\'incidence (DD/MM/YYYY)' },
            { value: 'tumor_topo_code', label: 'Topographie (CIM-O-3)' },
            { value: 'tumor_morpho_code', label: 'Morphologie (CIM-O-3)' },
            { value: 'tumor_behaviour', label: 'Comportement (/0-/3)' },
            { value: 'tumor_grade', label: 'Grade (1-9)' },
            { value: 'tumor_icd10_code', label: 'Code CIM-10' },
            { value: 'tumor_basis_of_diagnosis', label: 'Base du diagnostic (0-9)' },
            { value: 'tumor_laterality', label: 'Latéralité (0-9)' },
        ]
    },
    {
        group: "Tumeur - TNM",
        options: [
            { value: 'tumor_clinical_t', label: 'cT' },
            { value: 'tumor_clinical_n', label: 'cN' },
            { value: 'tumor_clinical_m', label: 'cM' },
            { value: 'tumor_clinical_stage_group', label: 'Stade clinique (I-IV)' },
            { value: 'tumor_pathological_t', label: 'pT' },
            { value: 'tumor_pathological_n', label: 'pN' },
            { value: 'tumor_pathological_m', label: 'pM' },
            { value: 'tumor_pathological_stage_group', label: 'Stade pathologique (I-IV)' },
            { value: 'tumor_tnm_edition', label: 'Édition TNM (7 ou 8)' },
            { value: 'tumor_tumor_size', label: 'Taille tumeur (mm)' },
        ]
    }
];

const DataImport: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<{ success: number, errors: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setError(null);
            setLoading(true);

            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const res = await axios.post('import/preview/', formData);
                setHeaders(res.data.headers);
                
                // Auto-map based on exact matches or simple heuristics
                const initialMapping: Record<string, string> = {};
                res.data.headers.forEach((h: string) => {
                    const l = h.toLowerCase();
                    if (l.includes('nom') && !l.includes('prenom')) initialMapping[h] = 'last_name';
                    else if (l.includes('prenom') || l.includes('prénom')) initialMapping[h] = 'first_name';
                    else if (l.includes('date') && l.includes('naiss')) initialMapping[h] = 'birth_date';
                    else if (l.includes('sexe') || l.includes('genre')) initialMapping[h] = 'gender';
                    else if (l.includes('nid') || l.includes('national')) initialMapping[h] = 'nid';
                    else if (l.includes('tel') || l.includes('phone')) initialMapping[h] = 'phone';
                    else initialMapping[h] = 'ignore';
                });
                setMapping(initialMapping);
                setStep(2);
            } catch (err: any) {
                setError(err.response?.data?.error || "Erreur lors de la lecture du fichier.");
                setFile(null);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleProcess = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        // Filter out ignored columns
        const finalMapping: Record<string, string> = {};
        Object.entries(mapping).forEach(([fileCol, dbCol]) => {
            if (dbCol !== 'ignore') {
                finalMapping[fileCol] = dbCol;
            }
        });

        if (Object.keys(finalMapping).length === 0) {
            setError("Vous devez mapper au moins une colonne.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mapping', JSON.stringify(finalMapping));

        try {
            const res = await axios.post('import/process/', formData);
            setResults({
                success: res.data.success_count,
                errors: res.data.errors
            });
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.error || "Erreur lors de l'importation.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setHeaders([]);
        setMapping({});
        setResults(null);
        setStep(1);
        setError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Database size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Importation de Données</h1>
                    <p className="text-sm text-slate-500 font-medium">Synchronisez vos fichiers Excel et CSV avec le registre central.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
                    <AlertCircle size={20} />
                    <span className="font-medium text-sm">{error}</span>
                </div>
            )}

            {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div 
                        className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                            <Upload size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">Cliquez pour importer un fichier</h3>
                        <p className="text-sm text-slate-500">Formats supportés: .xlsx, .xls, .csv</p>
                        <input 
                            type="file" 
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                    </div>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <FileSpreadsheet size={18} className="text-blue-500"/>
                                Mappage des colonnes ({file?.name})
                            </h3>
                            <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">{headers.length} colonnes trouvées</span>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                            {headers.map((header, idx) => (
                                <div key={idx} className="flex items-center p-4 hover:bg-slate-50 transition-colors">
                                    <div className="w-1/2 flex items-center gap-3 pr-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium text-slate-700 truncate" title={header}>{header}</span>
                                    </div>
                                    <div className="text-slate-300 px-4">
                                        <ArrowRight size={16} />
                                    </div>
                                    <div className="w-1/2 pl-4">
                                        <select 
                                            className={`w-full p-2.5 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors ${mapping[header] !== 'ignore' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                            value={mapping[header]}
                                            onChange={(e) => setMapping({...mapping, [header]: e.target.value})}
                                        >
                                            {DB_FIELDS.map(group => (
                                                <optgroup key={group.group} label={group.group}>
                                                    {group.options.map(f => (
                                                        <option key={f.value} value={f.value}>{f.label}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        <button onClick={reset} className="px-6 py-3 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-colors">
                            Annuler
                        </button>
                        <button 
                            onClick={handleProcess}
                            disabled={loading}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Traitement en cours...' : 'Lancer l\'importation'} 
                            {!loading && <Play size={16} fill="currentColor" />}
                        </button>
                    </div>
                </motion.div>
            )}

            {step === 3 && results && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Importation Terminée</h2>
                    <p className="text-slate-500 mb-8 font-medium">
                        <strong className="text-emerald-600 text-lg">{results.success}</strong> patients ont été importés et ajoutés au registre avec succès.
                    </p>

                    {results.errors.length > 0 && (
                        <div className="text-left bg-rose-50 border border-rose-100 rounded-xl p-4 mb-8 max-h-60 overflow-y-auto custom-scrollbar">
                            <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
                                <AlertCircle size={16} /> 
                                {results.errors.length} lignes n'ont pas pu être importées
                            </h4>
                            <ul className="space-y-1">
                                {results.errors.map((err, i) => (
                                    <li key={i} className="text-xs text-rose-600 font-mono">{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button onClick={reset} className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg transition-all">
                        Faire une autre importation
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default DataImport;
