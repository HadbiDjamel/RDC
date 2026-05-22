import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, Plus, Users, Hash, Send, ChevronLeft,
    Share2, Lock, User, Clock, Check
} from 'lucide-react';

interface Message {
    id: string;
    sender: string;
    role: string;
    text: string;
    time: string;
    isMe?: boolean;
}

interface Discussion {
    id: string;
    title: string;
    code: string;
    created_by: string;
    date: string;
    messages: Message[];
    locked?: boolean;
}

const RCPForum: React.FC<{ patientName: string }> = ({ patientName }) => {
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [discussions, setDiscussions] = useState<Discussion[]>([
        {
            id: '1',
            title: 'Évaluation pré-opératoire - Dossier Complexe',
            code: 'X9K2-M7Q4-L1P8',
            created_by: 'Dr. Ahmed',
            date: '02/03/2024',
            messages: [
                { id: 'm1', sender: 'Dr. Ahmed', role: 'Médecin', text: "Bonjour à tous, j'aimerais avoir votre avis sur l'opérabilité de ce patient au vu de la taille de la tumeur.", time: '10:00' },
                { id: 'm2', sender: 'Pr. Belkacem', role: 'Anapath', text: "L'histologie confirme un carcinome épidermoïde. Les marges semblent accessibles.", time: '10:15' },
                { id: 'm3', sender: 'Dr. Mansouri', role: 'Labo', text: "Les paramètres biologiques sont stables. Pas de contre-indication labo.", time: '10:45' }
            ]
        }
    ]);
    const [activeDiscussion, setActiveDiscussion] = useState<Discussion | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    const [copySuccess, setCopySuccess] = useState(false);

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, I, 0, 1 for readability
        const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `${segment()}-${segment()}-${segment()}`;
    };

    const handleCreate = () => {
        if (!newTitle.trim()) return;
        const newDisc: Discussion = {
            id: Date.now().toString(),
            title: newTitle,
            code: generateCode(),
            created_by: 'Pr. Belkacem', // Mock current user
            date: new Date().toLocaleDateString('fr-FR'),
            messages: []
        };
        setDiscussions([newDisc, ...discussions]);
        setNewTitle('');
        setIsCreating(false);
        setActiveDiscussion(newDisc);
        setView('chat');
    };

    const handleJoin = () => {
        const disc = discussions.find(d => d.code === joinCode.toUpperCase());
        if (disc) {
            setActiveDiscussion(disc);
            setView('chat');
            setJoinCode('');
        } else if (joinCode) {
            alert("Code RCP invalide ou inexistant.");
        }
    };

    const handleShare = () => {
        if (!activeDiscussion) return;
        navigator.clipboard.writeText(activeDiscussion.code);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const handleToggleLock = () => {
        if (!activeDiscussion) return;
        const updatedDiscussions = discussions.map(d =>
            d.id === activeDiscussion.id ? { ...d, locked: !d.locked } : d
        );
        setDiscussions(updatedDiscussions);
        setActiveDiscussion({ ...activeDiscussion, locked: !activeDiscussion.locked });
    };

    const sendMessage = () => {
        if (!messageInput.trim() || !activeDiscussion || activeDiscussion.locked) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            sender: 'Pr. Belkacem',
            role: 'Anapath',
            text: messageInput,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        const updatedDiscussions = discussions.map(d =>
            d.id === activeDiscussion.id
                ? { ...d, messages: [...d.messages, newMessage] }
                : d
        );
        setDiscussions(updatedDiscussions);
        setActiveDiscussion({ ...activeDiscussion, messages: [...activeDiscussion.messages, newMessage] });
        setMessageInput('');
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 bg-white">
            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Salons RCP</h3>
                                <p className="text-sm text-slate-500 font-medium">Discussions pluridisciplinaires pour {patientName}</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <input
                                        type="text"
                                        placeholder="XXXX-XXXX-XXXX"
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value)}
                                        className="bg-transparent px-4 py-2 text-xs text-slate-800 outline-none w-40 border-r border-slate-200 placeholder:text-slate-400"
                                    />
                                    <button
                                        onClick={handleJoin}
                                        className="px-4 py-2 text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-widest"
                                    >
                                        Rejoindre
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95 uppercase tracking-widest"
                                >
                                    <Plus size={16} /> Nouvelle RCP
                                </button>
                            </div>
                        </div>

                        {/* Creation Modal Mock */}
                        <AnimatePresence>
                            {isCreating && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="portal-card p-6 bg-blue-50/30 border-blue-200 space-y-4">
                                        <div>
                                            <label className="text-[10px] uppercase font-black text-blue-600 mb-2 block tracking-widest">Objet de la Discussion</label>
                                            <input
                                                type="text"
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                placeholder="Ex: Validation de la stratégie thérapeutique..."
                                                className="portal-input w-full"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Annuler</button>
                                            <button onClick={handleCreate} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-xs shadow-md shadow-blue-500/10 uppercase tracking-widest">Démarrer</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {discussions.map(disc => (
                                <motion.div
                                    key={disc.id}
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    onClick={() => { setActiveDiscussion(disc); setView('chat'); }}
                                    className="portal-card p-5 cursor-pointer group hover:border-blue-400 transition-all bg-white shadow-sm border border-slate-200"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                                                <MessageSquare size={16} />
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-blue-600 transition-colors">#{disc.code}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {disc.locked && <Lock size={12} className="text-amber-500" />}
                                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-tight">{disc.date}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{disc.title}</h4>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] text-blue-600 font-black">
                                                {disc.created_by.split(' ')[1][0]}
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-bold">{disc.created_by}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                            <Users size={12} />
                                            <span>{disc.messages.length} MSGS</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="chat"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="flex flex-col h-[600px] portal-card overflow-hidden border border-slate-200 bg-white"
                    >
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setView('list')} className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-200">
                                    <ChevronLeft size={20} />
                                </button>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                        {activeDiscussion?.title}
                                        {activeDiscussion?.locked && <Lock size={14} className="text-amber-500" />}
                                    </h4>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-bold">
                                        <Hash size={10} /> {activeDiscussion?.code}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleShare}
                                    className={`p-2 transition-all relative rounded-lg border border-transparent ${copySuccess ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-400 hover:text-blue-600 hover:bg-white hover:border-slate-200'}`}
                                    title="Copier le code"
                                >
                                    <Share2 size={16} />
                                    {copySuccess && (
                                        <motion.span
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] bg-emerald-600 text-white px-2 py-1 rounded font-black whitespace-nowrap shadow-sm"
                                        >
                                            COPIÉ !
                                        </motion.span>
                                    )}
                                </button>
                                <button
                                    onClick={handleToggleLock}
                                    className={`p-2 transition-all rounded-lg border border-transparent ${activeDiscussion?.locked ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-400 hover:text-slate-800 hover:bg-white hover:border-slate-200'}`}
                                    title={activeDiscussion?.locked ? "Déverrouiller" : "Verrouiller"}
                                >
                                    <Lock size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-white">
                            {activeDiscussion?.messages.map((msg, i) => (
                                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`flex items-center gap-2 mb-1.5 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{msg.sender}</span>
                                        <span className="text-[9px] text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">{msg.role}</span>
                                        <span className="text-[9px] text-slate-400 font-mono font-bold">{msg.time}</span>
                                    </div>
                                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm border ${msg.isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none border-blue-500'
                                        : 'bg-slate-50 text-slate-700 rounded-tl-none border-slate-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                    {msg.isMe && i === activeDiscussion.messages.length - 1 && (
                                        <div className="flex items-center gap-1 mt-1.5 text-[8px] text-blue-600 font-black uppercase tracking-widest">
                                            <Check size={8} /> Distribué
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                            {activeDiscussion?.locked ? (
                                <div className="flex items-center justify-center py-3 text-[10px] text-amber-700 font-black uppercase tracking-widest bg-amber-50 rounded-xl border border-amber-200">
                                    <Lock size={12} className="mr-2" /> Discussion Archivée (Lecture Seule)
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                            placeholder="Votre message pluridisciplinaire..."
                                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-400 shadow-sm"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            <button
                                                onClick={() => setMessageInput(p => p + ' @Pr. Belkacem ')}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-md hover:bg-slate-50"
                                                title="Mentionner moi"
                                            >
                                                <User size={14} />
                                            </button>
                                            <button
                                                onClick={() => setMessageInput(p => p + ` [${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}] `)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-md hover:bg-slate-50"
                                                title="Insérer l'heure"
                                            >
                                                <Clock size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={sendMessage}
                                        className="p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RCPForum;
