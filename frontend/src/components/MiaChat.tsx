import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Brain, TrendingUp } from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'bot';
    content?: string;
    text?: string;
    timestamp: Date;
    data?: any;
}

interface MiaChatProps {
    isDrawer?: boolean;
}

const MiaChat: React.FC<MiaChatProps> = ({ isDrawer = false }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: "Bonjour ! Je suis M.I.A. (Medical Intelligence Assistant), l'intelligence artificielle du Registre du Cancer. Comment puis-je vous aider aujourd'hui ?", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/registry/mia/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Une erreur de connexion au serveur d'IA s'est produite.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`mx-auto flex flex-col portal-card overflow-hidden bg-white shadow-xl ${isDrawer ? 'h-full w-full rounded-none border-none' : 'max-w-4xl h-[calc(100vh-140px)] rounded-2xl'}`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Assistant M.I.A.</h3>
                        <p className="text-xs text-blue-600 font-medium">Agent IA Local (Ollama) Actif</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                    <Sparkles size={14} className="text-amber-500" /> Sécurisé & Souverain
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white">
                <AnimatePresence>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 border border-slate-200 text-slate-600'}`}>
                                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className="space-y-3">
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                                        {m.role === 'assistant' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">M.I.A.</span>
                                                <span className="text-[9px] text-slate-400 font-mono">{m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        )}
                                        {m.content}
                                    </div>

                                    {m.data && m.data.type === 'chart' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-sm w-full ${isDrawer ? 'min-w-[280px]' : 'min-w-[320px] max-w-[500px]'}`}
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                                    {m.data.category === 'incidence' ? <TrendingUp size={16} /> : <Brain size={16} />}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                    {m.data.label || (m.data.category === 'top_sites' ? 'Top Localisations' : 'Distribution Géographique')}
                                                </span>
                                            </div>

                                            <div className="h-[200px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    {m.data.category === 'incidence' ? (
                                                        <AreaChart data={m.data.points}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                                            <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} />
                                                            <YAxis stroke="#94a3b8" fontSize={10} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            />
                                                            <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.1} />
                                                        </AreaChart>
                                                    ) : (
                                                        <BarChart data={m.data.points}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                                            <YAxis stroke="#94a3b8" fontSize={10} />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            />
                                                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                                                                {m.data.points.map((_: any, index: number) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    )}
                                                </ResponsiveContainer>
                                            </div>
                                        </motion.div>
                                    )}

                                    {m.data && m.data.type === 'card' && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-5 shadow-sm"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                                <Brain size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-slate-800">{m.data.val}</span>
                                                    <span className="text-xs text-slate-500 font-medium">{m.data.unit}</span>
                                                </div>
                                                <span className="text-[10px] text-emerald-600 font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-100">
                                                    {m.data.trend}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {loading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
                            <Bot size={16} />
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 rounded-tl-none shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/30">
                <div className="relative flex items-center">
                    <input
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-6 pr-16 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all font-medium shadow-sm"
                        placeholder="Posez une question technique à M.I.A..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="absolute right-3 p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="mt-3 text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                    IA Souveraine • Pas de transfert de données hors intranet
                </p>
            </div>
        </div>
    );
};

export default MiaChat;
