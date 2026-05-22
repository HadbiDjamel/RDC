import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Zap, Search, Save, BrainCircuit, CheckCircle2, Trash2, ListChecks } from 'lucide-react';

const MOCK_DB = [
    { code: '8140/3', desc: 'Adénocarcinome, SAI (Morphologie)', site: 'C18.9', keywords: ['colon', 'rectum', 'adenocarcinome', 'sigmoide', 'glande'] },
    { code: 'C18.7', desc: 'Côlon sigmoïde (Topographie)', site: 'C18.7', keywords: ['colon', 'sigmoide', 'topographie', 'intestin'] },
    { code: '8070/3', desc: 'Carcinome épidermoïde, SAI (Morphologie)', site: 'C34.9', keywords: ['poumon', 'bronche', 'epidermoide', 'thoracique'] },
    { code: 'C34.9', desc: 'Bronche ou Poumon, SAI (Topographie)', site: 'C34.9', keywords: ['poumon', 'bronche', 'topographie', 'respiratoire'] },
    { code: '8500/3', desc: 'Carcinome canalaire infiltrant, SAI (Morphologie)', site: 'C50.9', keywords: ['sein', 'mammaire', 'canalaire', 'breast'] },
    { code: 'C50.9', desc: 'Sein, SAI (Topographie)', site: 'C50.9', keywords: ['sein', 'mammaire', 'topographie'] },
    { code: '8140/3', desc: 'Adénocarcinome prostatique (Morphologie)', site: 'C61.9', keywords: ['prostate', 'adenocarcinome', 'prostatique'] },
    { code: 'C61.9', desc: 'Prostate (Topographie)', site: 'C61.9', keywords: ['prostate', 'topographie'] },
];

const MOCK_PATIENTS = [
    { name: 'BOUDIAF Mohammed', nid: '175312009231456789' },
    { name: 'BELAIDI Fatma', nid: '282415001234567890' },
    { name: 'KACEMI Yacine', nid: '194216008765432109' }
];

const AnapathTerminal: React.FC = () => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [batchList, setBatchList] = useState<any[]>([]);
    const [saved, setSaved] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(MOCK_PATIENTS[0].nid);
    const [cursor, setCursor] = useState({ line: 1, col: 1 });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = (text: string) => {
        setInput(text);
        const cleaned = text.toLowerCase().replace(/['"«»“”.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").trim();
        if (cleaned.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        const userWords = cleaned.split(/\s+/).filter(w => w.length >= 3);

        if (userWords.length === 0) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        // Find database items where ANY keyword or description matches any word in input
        const found = MOCK_DB.filter(item => {
            return userWords.some(word => 
                item.desc.toLowerCase().includes(word) || 
                item.code.toLowerCase().includes(word) ||
                item.keywords.some(kw => kw.toLowerCase().includes(word))
            );
        });

        setTimeout(() => {
            setSuggestions(found.slice(0, 5));
            setLoading(false);
        }, 150);
    };

    const addToBatch = (item: any) => {
        const patient = MOCK_PATIENTS.find(p => p.nid === selectedPatient);
        setBatchList(prev => [...prev, { 
            ...item, 
            id: Date.now(),
            patientName: patient ? patient.name : 'Patient Inconnu',
            patientNid: selectedPatient
        }]);
        setInput('');
        setSuggestions([]);

        // Auto-advance to the next patient in the queue
        const currentIndex = MOCK_PATIENTS.findIndex(p => p.nid === selectedPatient);
        if (currentIndex < MOCK_PATIENTS.length - 1) {
            setSelectedPatient(MOCK_PATIENTS[currentIndex + 1].nid);
        }
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            // Persist batch-coded items to localStorage so they link directly to patient records in the form
            const currentSavedCoded = JSON.parse(localStorage.getItem('batch_coded_patients') || '{}');
            batchList.forEach(item => {
                if (!currentSavedCoded[item.patientNid]) {
                    currentSavedCoded[item.patientNid] = {};
                }
                if (item.code.startsWith('C')) {
                    currentSavedCoded[item.patientNid].topo_code = item.code;
                } else {
                    currentSavedCoded[item.patientNid].morpho_code = item.code;
                }
            });
            localStorage.setItem('batch_coded_patients', JSON.stringify(currentSavedCoded));

            setSaved(true);
            setBatchList([]);
            setLoading(false);
            setTimeout(() => setSaved(false), 2000);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                        <Terminal size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Terminal de Codage Anapate</h3>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Patient Concerné:</span>
                            <select 
                                value={selectedPatient} 
                                onChange={(e) => setSelectedPatient(e.target.value)}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
                            >
                                {MOCK_PATIENTS.map(p => (
                                    <option key={p.nid} value={p.nid}>{p.name} ({p.nid.substring(0, 6)}...)</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex-1 p-6 relative">
                        <textarea
                            ref={textareaRef}
                            className="w-full h-full bg-transparent border-none outline-none resize-none text-slate-800 font-mono font-bold text-lg"
                            placeholder="Saisissez le diagnostic..."
                            value={input}
                            onChange={(e) => handleInput(e.target.value)}
                        />
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                        <button onClick={handleSave} disabled={batchList.length === 0}
                            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-50">
                            Enregistrer Batch ({batchList.length})
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex-1 overflow-y-auto">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Suggestions IA</p>
                        <div className="space-y-2">
                            {suggestions.map(item => (
                                <div key={item.code} onClick={() => addToBatch(item)}
                                    className="p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-blue-500 transition-all">
                                    <p className="text-sm font-black text-blue-600">{item.code}</p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 flex-1 overflow-y-auto">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Batch Actuel</p>
                        <div className="space-y-2">
                            {batchList.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.patientName}</p>
                                        <p className="text-xs font-bold text-slate-800 mt-0.5">{item.code} - {item.desc}</p>
                                    </div>
                                    <button onClick={() => setBatchList(prev => prev.filter(x => x.id !== item.id))} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {saved && <div className="fixed bottom-10 right-10 p-4 bg-emerald-500 text-white rounded-2xl shadow-xl animate-bounce">Batch Sauvegardé !</div>}
        </div>
    );
};

export default AnapathTerminal;
