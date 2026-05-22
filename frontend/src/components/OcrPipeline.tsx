import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUp, FileText, Brain, Search, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const OcrPipeline: React.FC = () => {
    const [_file, _setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
    const [extractedData, setExtractedData] = useState<any>(null);

    const handleUpload = () => {
        setStatus('uploading');
        setTimeout(() => setStatus('processing'), 1000);
        setTimeout(() => {
            setStatus('done');
            setExtractedData({
                patient: "MOHAMMED Youssouf",
                birth: "20/02/1975",
                site: "Poumon (C34.9)",
                morpho: "Carcinome épidermoïde (8070/3)",
                date: "12/11/2023",
                confidence: "94%"
            });
        }, 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <FileUp size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Pipeline OCR Intelligent</h3>
                    <p className="text-slate-500 font-medium">Extraction automatique des diagnostics depuis les comptes-rendus PDF</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className={`portal-card p-10 border-dashed border-2 flex flex-col items-center justify-center text-center transition-all bg-white ${status === 'idle' ? 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/50' : 'border-blue-400 bg-blue-50/30'}`}>
                    {status === 'idle' ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200 shadow-sm">
                                <FileText size={32} />
                            </div>
                            <p className="text-lg font-bold text-slate-800">Glissez-déposez le compte-rendu</p>
                            <p className="text-sm text-slate-500 mt-2 mb-8 font-medium">Format PDF, JPG ou PNG (Max 10MB)</p>
                            <button
                                onClick={handleUpload}
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Sélectionner un Fichier
                            </button>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                            <p className="text-lg font-bold text-blue-600">
                                {status === 'uploading' ? 'Téléversement...' : 'Analyse par M.I.A...'}
                            </p>
                            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden mx-auto border border-slate-200">
                                <motion.div
                                    className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                                    animate={{ width: status === 'uploading' ? '40%' : '100%' }}
                                    transition={{ duration: 2 }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Area */}
                <div className="portal-card p-8 bg-white relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-50 pb-3">
                        <Brain size={16} className="text-blue-600" /> Résultats de l'Extraction
                    </div>

                    {status === 'done' ? (
                        <div className="space-y-4">
                            <ResultRow label="Patient" value={extractedData.patient} />
                            <ResultRow label="Né le" value={extractedData.birth} />
                            <ResultRow label="Siège Topo" value={extractedData.site} />
                            <ResultRow label="Morphologie" value={extractedData.morpho} />
                            <ResultRow label="Date Incidence" value={extractedData.date} />

                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex gap-2 items-center text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                    <CheckCircle size={16} /> Confiance {extractedData.confidence}
                                </div>
                                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                                    Valider et Importer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Search size={48} className="mb-4 opacity-10" />
                            <p className="text-sm italic font-medium">Les données extraites apparaîtront ici</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="portal-card p-5 bg-amber-50 border-amber-200 flex gap-4 items-start shadow-sm">
                <div className="p-2 bg-white rounded-lg border border-amber-200 shadow-sm">
                    <AlertCircle className="text-amber-600" size={20} />
                </div>
                <p className="text-xs text-amber-900/70 leading-relaxed font-medium">
                    <strong className="text-amber-900">Note de sécurité :</strong> Le traitement OCR est effectué en local par l'instance Ollama de l'hôpital.
                    Aucune donnée patient ne quitte le réseau intranet algérien (Souveraineté des données de santé).
                </p>
            </div>
        </div>
    );
};

const ResultRow = ({ label, value }: any) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</span>
        <span className="text-sm text-slate-800 font-bold">{value}</span>
    </div>
);

export default OcrPipeline;
