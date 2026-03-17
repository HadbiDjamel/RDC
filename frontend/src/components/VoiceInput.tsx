import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Loader2, AlertCircle, Check } from 'lucide-react';

interface VoiceInputProps {
    onTranscriptionComplete: (text: string) => void;
    onCancel: () => void;
    label?: string;
    description?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptionComplete, onCancel, label = "Saisie Vocale Interactive", description = "Parlez naturellement, M.I.A. se charge du reste." }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<any>(null);
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Votre navigateur ne supporte pas la reconnaissance vocale.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'fr-FR'; // Assuming French for this app

        recognition.onstart = () => {
            setIsRecording(true);
            setError(null);
            setTranscript('');
            finalTranscriptRef.current = '';
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = finalTranscriptRef.current;

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            finalTranscriptRef.current = finalTranscript;
            setTranscript(finalTranscript + interimTranscript);
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed') {
                setError("Accès au microphone refusé. Veuillez l'autoriser dans votre navigateur.");
            } else if (event.error !== 'no-speech') {
                setError(`Erreur de reconnaissance vocale: ${event.error} `);
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
        } else {
            try {
                recognitionRef.current?.start();
            } catch (e) {
                // Ignore start if already started
            }
        }
    };

    const handleProcess = () => {
        if (!transcript.trim()) return;
        setIsProcessing(true);
        // Add a slight delay for better UX before firing callback
        setTimeout(() => {
            onTranscriptionComplete(transcript.trim());
        }, 500);
    };

    return (
        <div className="glass-card p-6 border-sky-500/20 max-w-2xl mx-auto overflow-hidden relative">
            {/* Background glowing effect when recording */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-sky-500/5 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`w - 12 h - 12 rounded - 2xl flex items - center justify - center transition - colors ${isRecording ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-sky-500/10 text-sky-400'} `}>
                    <Mic size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white">{label}</h3>
                    <p className="text-sm font-medium text-slate-400">{description}</p>
                </div>
            </div>

            {error ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 mb-6 relative z-10">
                    <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={16} />
                    <p className="text-sm font-medium text-rose-300">{error}</p>
                </div>
            ) : (
                <div className="mb-6 relative z-10">
                    <div className={`min - h - [120px] max - h - [300px] overflow - y - auto w - full p - 4 rounded - xl border transition - colors ${isRecording ? 'bg-black/40 border-sky-500/30 ring-2 ring-sky-500/20' : 'bg-black/20 border-white/10'} text - slate - 300 font - medium text - sm leading - relaxed whitespace - pre - wrap`}>
                        {transcript ? (
                            <span>{transcript}</span>
                        ) : (
                            <span className="text-slate-500 italic flex items-center gap-2">
                                <p className={`text - sm font - medium ${isRecording ? 'text-rose-400' : 'text-slate-500'} `}>
                                    {isRecording ? "M.I.A. vous écoute..." : "Appuyez sur le micro et commencez à parler..."}
                                </p></span>
                        )}

                        {/* Recording status indicator */}
                        <AnimatePresence>
                            {isRecording && (
                                <motion.span
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="inline-block w-2 h-4 bg-sky-400 ml-1 translate-y-1 animate-pulse"
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between relative z-10">
                <button
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    disabled={isProcessing}
                >
                    Annuler
                </button>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleRecording}
                        className={`flex items - center gap - 2 px - 5 py - 2.5 rounded - xl text - xs font - black transition - all ${isRecording ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'} `}
                        disabled={!!error || isProcessing}
                    >
                        {isRecording ? <><Square size={14} className="fill-current" /> Stop</> : <><Mic size={14} /> Dicter</>}
                    </button>

                    <button
                        onClick={handleProcess}
                        disabled={!transcript.trim() || isRecording || isProcessing}
                        className={`flex items - center gap - 2 px - 6 py - 2.5 rounded - xl text - sm font - black transition - all ${!transcript.trim() || isRecording || isProcessing ? 'bg-sky-500/20 text-sky-400/50 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20'} `}
                    >
                        {isProcessing ? (
                            <><Loader2 size={16} className="animate-spin" /> Analyse M.I.A...</>
                        ) : (
                            <><Check size={16} /> Analyser et Remplir</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoiceInput;
