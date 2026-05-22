import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, User, Stethoscope, Microscope, ClipboardCheck, X, Shield, BookOpen, ChevronRight, BrainCircuit } from 'lucide-react';
import VoiceInput from './VoiceInput';
import PatientForm from './PatientForm';
import MedicalReference from './MedicalReference';

interface SmartEntryProps {
    role: 'admin' | 'medecin' | 'anapate' | 'labo';
    initialData?: any;
}

const MODULES = {
    medecin: [
        { id: 'full', label: 'Dossier Complet', icon: User, desc: 'Identité et Bilan Clinique' },
        { id: 'identity', label: 'Identité Uniquement', icon: User, desc: 'État civil et localisation' },
        { id: 'clinical', label: 'Bilan Clinique', icon: Stethoscope, desc: 'TNM, Topographie, Stade' }
    ],
    anapate: [
        { id: 'full', label: 'Rapport Anapath Complet', icon: Microscope, desc: 'Tumeur et Staging' },
        { id: 'morpho', label: 'Morphologie', icon: Microscope, desc: 'Code CIM-O-3 et Grade' },
        { id: 'ptnm', label: 'Staging pTNM', icon: ClipboardCheck, desc: 'Extension pathologique' }
    ],
    labo: [
        { id: 'full', label: 'Bilan Biologique', icon: ClipboardCheck, desc: 'Marqueurs et Hématologie' }
    ],
    admin: [
        { id: 'full', label: 'Validation IARC', icon: Shield, desc: 'Vérification et Finalisation' }
    ]
};

const SmartEntry: React.FC<SmartEntryProps> = ({ role, initialData }) => {
    const [view, setView] = useState<'hub' | 'voice' | 'form'>('hub');
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [prefillData, setPrefillData] = useState<any>(null);
    const [showReference, setShowReference] = useState(false);

    const modules = MODULES[role] || MODULES.admin;

    const handleVoiceComplete = async (transcript: string) => {
        try {
            const res = await fetch('/api/mia/extract-voice/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: transcript, role, module: selectedModule })
            });

            if (res.ok) {
                const data = await res.json();
                setPrefillData(data.extracted_fields);
                setView('form');
            } else {
                console.error("Transcription failed");
                setView('form');
            }
        } catch (e) {
            console.error("API Error", e);
            setView('form');
        }
    };

    const startManual = (modId: string) => {
        setSelectedModule(modId);
        setPrefillData(null);
        setView('form');
    };

    const startVoice = (modId: string) => {
        setSelectedModule(modId);
        setView('voice');
    };

    if (view === 'form') {
        return (
            <div className="flex h-[85vh] overflow-y-auto custom-scrollbar gap-6 pr-2">
                <div className={`flex-1 transition-all duration-300 ${showReference ? 'mr-[450px]' : ''}`}>
                    <div className="relative pb-20">
                        <div className="absolute -top-12 left-0 flex items-center gap-4 z-40">
                            <button
                                onClick={() => setView('hub')}
                                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-xs font-bold"
                            >
                                <X size={14} /> Annuler
                            </button>
                            <button
                                onClick={() => setShowReference(!showReference)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all text-xs font-bold ${showReference
                                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
                                    }`}
                            >
                                <BookOpen size={14} />
                                {showReference ? 'Fermer le Lexique' : 'Ouvrir le Lexique'}
                            </button>
                        </div>
                        <PatientForm role={role} prefillData={prefillData} initialData={initialData} activeModule={selectedModule} />
                    </div>
                </div>

                <AnimatePresence>
                    {showReference && (
                        <motion.div
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                             className="fixed top-0 right-0 w-[450px] h-screen bg-white/95 backdrop-blur-xl shadow-2xl z-50 border-l border-slate-200 overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-slate-100 bg-white/50 flex justify-between items-center backdrop-blur-md">
                                <h3 className="font-black text-slate-800 flex items-center gap-2">
                                    <BookOpen size={16} className="text-blue-600" />
                                    Référentiel Médical
                                </h3>
                                <button onClick={() => setShowReference(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden p-4">
                                <MedicalReference />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    if (view === 'voice') {
        return (
            <div className="pt-20">
                <VoiceInput
                    onTranscriptionComplete={handleVoiceComplete}
                    onCancel={() => setView('hub')}
                    label={`Saisie Vocale : ${modules.find(m => m.id === selectedModule)?.label}`}
                />
            </div>
        );
    }

    return (
        <div className="relative h-full w-full max-w-6xl mx-auto flex flex-col items-center py-10">
            {/* Institutional Header */}
            <div className="text-center mb-16">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                        <Mic size={40} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                            <Shield size={14} strokeWidth={2.5} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Medical Intelligence Assistant</span>
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Saisie Intelligente</h2>
                        <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed font-bold italic">
                            Environnement de saisie assistée pour le Registre National du Cancer.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Professional Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full px-6">
                {modules.map((mod, i) => (
                    <motion.div 
                        key={mod.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-500 flex flex-col items-center text-center relative overflow-hidden"
                    >
                        {/* Static Subtle Accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                        
                        <div className="relative z-10 flex flex-col items-center h-full">
                            <div className="w-20 h-20 bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center mb-8 shadow-inner transition-all duration-500">
                                <mod.icon size={32} strokeWidth={1.5} />
                            </div>
                            
                            <div className="flex-1 space-y-3 mb-10">
                                <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-900 transition-colors">{mod.label}</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-blue-600/70 transition-colors">{mod.desc}</p>
                            </div>

                            <div className="w-full flex flex-col gap-3">
                                <button 
                                    onClick={() => startVoice(mod.id)}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    <Mic size={16} /> Lancer le Vocal
                                </button>
                                <button 
                                    onClick={() => startManual(mod.id)}
                                    className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                                >
                                    Saisie Manuelle <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Info Footer */}
            <div className="mt-20 flex items-center gap-6 px-10 py-6 bg-slate-50 rounded-full border border-slate-100">
                <div className="flex items-center gap-2 text-slate-400">
                    <Shield size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Sécurisé</span>
                </div>
                <div className="w-px h-4 bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-400">
                    <BrainCircuit size={16} className="text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">M.I.A. Core Active</span>
                </div>
            </div>
        </div>
    );
};

export default SmartEntry;
