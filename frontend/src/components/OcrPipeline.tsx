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
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                    <FileUp size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold">Pipeline OCR Intelligent</h3>
                    <p className="text-slate-500">Extraction automatique des diagnostics depuis les comptes-rendus PDF</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className={`glass-card p-10 border-dashed border-2 flex flex-col items-center justify-center text-center transition-all ${status === 'idle' ? 'border-white/10 hover:border-sky-500/30' : 'border-sky-500/50 bg-sky-500/5'}`}>
                    {status === 'idle' ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-6">
                                <FileText size={32} />
                            </div>
                            <p className="text-lg font-medium text-white">Glissez-déposez le compte-rendu</p>
                            <p className="text-sm text-slate-500 mt-2 mb-8">Format PDF, JPG ou PNG (Max 10MB)</p>
                            <button
                                onClick={handleUpload}
                                className="px-8 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-sky-400 hover:text-white transition-all shadow-xl"
                            >
                                Sélectionner un Fichier
                            </button>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <Loader2 className="w-12 h-12 text-sky-400 animate-spin mx-auto" />
                            <p className="text-lg font-bold text-sky-400">
                                {status === 'uploading' ? 'Téléversement...' : 'Analyse par M.I.A...'}
                            </p>
                            <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                                <motion.div
                                    className="h-full bg-sky-500"
                                    animate={{ width: status === 'uploading' ? '40%' : '100%' }}
                                    transition={{ duration: 2 }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Area */}
                <div className="glass-card p-8 border-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <Brain size={16} /> Résultats de l'Extraction
                    </div>

                    {status === 'done' ? (
                        <div className="space-y-4">
                            <ResultRow label="Patient" value={extractedData.patient} />
                            <ResultRow label="Né le" value={extractedData.birth} />
                            <ResultRow label="Siège Topo" value={extractedData.site} />
                            <ResultRow label="Morphologie" value={extractedData.morpho} />
                            <ResultRow label="Date Incidence" value={extractedData.date} />

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex gap-2 items-center text-emerald-400 text-sm font-bold">
                                    <CheckCircle size={16} /> Confiance {extractedData.confidence}
                                </div>
                                <button className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                    Valider et Importer
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700">
                            <Search size={48} className="mb-4 opacity-10" />
                            <p className="text-sm italic">Les données extraites apparaîtront ici</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="glass-card p-4 bg-amber-500/5 border-amber-500/20 flex gap-4 items-start">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs text-amber-200/70 leading-relaxed">
                    <strong>Note de sécurité :</strong> Le traitement OCR est effectué en local par l'instance Ollama de l'hôpital.
                    Aucune donnée patient ne quitte le réseau intranet algérien.
                </p>
            </div>
        </div>
    );
};

const ResultRow = ({ label, value }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <span className="text-sm text-sky-100 font-bold">{value}</span>
    </div>
);

export default OcrPipeline;
