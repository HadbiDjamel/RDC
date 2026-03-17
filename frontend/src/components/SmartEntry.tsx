import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, User, Stethoscope, Microscope, ClipboardCheck, X, Shield, BookOpen } from 'lucide-react';
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

// Generate organic floating shapes properties
const blobAnimations = [
    { borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"] },
    { borderRadius: ["50% 50% 40% 60% / 40% 60% 50% 50%", "40% 60% 60% 40% / 60% 40% 40% 60%", "50% 50% 40% 60% / 40% 60% 50% 50%"] },
    { borderRadius: ["30% 70% 50% 50% / 50% 50% 70% 30%", "70% 30% 50% 50% / 50% 50% 30% 70%", "30% 70% 50% 50% / 50% 50% 70% 30%"] },
];

const colors = [
    'from-sky-500/80 to-indigo-600/80',
    'from-emerald-500/80 to-teal-600/80',
    'from-violet-500/80 to-fuchsia-600/80',
];

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
            <div className="flex h-full min-h-[80vh] gap-6">
                <div className={`flex-1 transition-all duration-300 ${showReference ? 'mr-[450px]' : ''}`}>
                    <div className="relative">
                        <div className="absolute -top-12 left-0 flex items-center gap-4 z-40">
                            <button
                                onClick={() => setView('hub')}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold"
                            >
                                <X size={14} /> Annuler
                            </button>
                            <button
                                onClick={() => setShowReference(!showReference)}
                                className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all text-xs font-bold ${showReference
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
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
                            className="fixed top-0 right-0 w-[450px] h-screen bg-slate-900/95 backdrop-blur-xl shadow-2xl z-50 border-l border-white/10 overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-white/10 bg-slate-900/50 flex justify-between items-center backdrop-blur-md">
                                <h3 className="font-black text-white flex items-center gap-2">
                                    <BookOpen size={16} className="text-sky-400" />
                                    Référentiel Médical
                                </h3>
                                <button onClick={() => setShowReference(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
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
        <div className="relative h-full w-full max-w-5xl mx-auto flex flex-col items-center">
            {/* Header Content */}
            <div className="text-center mb-12 relative z-20 pointer-events-none">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Mic size={32} />
                </motion.div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Saisie Intelligente</h2>
                <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
                    Sélectionnez un portail pour configurer votre environnement de saisie. 
                    Utilisez le <span className="text-sky-400 font-bold">Vocal</span> pour l'extraction automatique via M.I.A. 
                </p>
            </div>

            {/* Organic Portals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-10">
                {modules.map((mod, i) => {
                    const anim = blobAnimations[i % blobAnimations.length];
                    const color = colors[i % colors.length];

                    return (
                        <div key={mod.id} className="relative group flex flex-col items-center">
                            {/* The Morphing Portal */}
                            <motion.div
                                className={`w-64 h-64 bg-gradient-to-br ${color} backdrop-blur-3xl border border-white/20 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden`}
                                animate={{
                                    borderRadius: anim.borderRadius,
                                    y: [0, -10, 0],
                                    rotate: [0, 1, -1, 0]
                                }}
                                transition={{
                                    borderRadius: { duration: 10 + Math.random() * 5, repeat: Infinity, ease: "linear" },
                                    y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
                                    rotate: { duration: 6 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" }
                                }}
                            >
                                <div className="absolute inset-0 bg-black/10 transition-colors duration-500 group-hover:bg-transparent" />
                                
                                <div className="relative z-10 text-center flex flex-col items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-full shadow-inner backdrop-blur-md border border-white/10">
                                        <mod.icon size={28} className="text-white drop-shadow-md" />
                                    </div>
                                    <div className="px-6">
                                        <h3 className="text-lg font-black text-white mb-1 drop-shadow-md">{mod.label}</h3>
                                        <p className="text-[10px] text-white/70 uppercase font-black tracking-widest">{mod.desc}</p>
                                    </div>
                                </div>

                                {/* Selection Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900/60 backdrop-blur-md z-20">
                                    <div className="flex flex-col gap-3 w-40">
                                        <button 
                                            onClick={() => startManual(mod.id)}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold text-xs transition-all"
                                        >
                                            Saisie Manuelle
                                        </button>
                                        <button 
                                            onClick={() => startVoice(mod.id)}
                                            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 rounded-xl text-white font-bold text-xs shadow-lg shadow-sky-500/30 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Mic size={14} /> Saisie Vocale
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export default SmartEntry;
