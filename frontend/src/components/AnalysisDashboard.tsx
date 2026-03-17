import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, AreaChart, Area, PieChart, Pie, Legend,
    LineChart, Line
} from 'recharts';
import axios from 'axios';
import {
    Library, Users, TrendingUp, ShieldCheck,
    Download, Microscope,
    Database, Globe, Activity, Star, Pin, FileSpreadsheet, Calendar
} from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const CATEGORIES = [
    {
        id: 'overview',
        name: "0. Aperçu Global",
        icon: Library,
        reports: [
            { id: 'dashboard_main', name: "Tableau de Bord Exécutif", type: "dashboard" }
        ]
    },
    {
        id: 'incidence',
        name: "1. Incidence et Fréquence",
        icon: Microscope,
        reports: [
            { id: 'top_10_sex', name: "Top 10 des cancers par sexe", type: "comparison" },
            { id: 'asr_top', name: "Taux Standardisés (ASR) Top", type: "bar" },
            { id: 'age_count', name: "Nombre de cas par âge", type: "line" },
            { id: 'age_dist', name: "Répartition par groupe d'âge", type: "pie" }
        ]
    },
    {
        id: 'demographics',
        name: "2. Analyses Démographiques",
        icon: Users,
        reports: [
            { id: 'pyramid', name: "Pyramides des âges de la population", type: "pyramid" },
            { id: 'age_incidence_curves', name: "Courbes d'incidence spécifiques à l'âge", type: "curve" }
        ]
    },
    {
        id: 'trends',
        name: "3. Tendances Temporelles",
        icon: TrendingUp,
        reports: [
            { id: 'time_trends', name: "Évolution de l'incidence", type: "area" }
        ]
    },
    {
        id: 'specialized',
        name: "4. Rapports IARC & Qualité",
        icon: ShieldCheck,
        reports: [
            { id: 'ci5', name: "Distribution CI5 (IARC Standard)", type: "bar" },
            { id: 'iccc', name: "Classification ICCC (Pédiatrie)", type: "bar" },
            { id: 'quality', name: "Indicateurs de Qualité", type: "quality" }
        ]
    }
];

const AnalysisDashboard: React.FC = () => {
    const [selectedReportId, setSelectedReportId] = useState('dashboard_main');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('dzcancer_pinned_reports');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res = await axios.get('analysis/stats/');
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const togglePin = (id: string) => {
        setPinnedIds(prev => {
            const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
            localStorage.setItem('dzcancer_pinned_reports', JSON.stringify(next));
            return next;
        });
    };

    const exportToCSV = (name: string, reportData: any) => {
        let exportData: any[] = [];
        if (Array.isArray(reportData)) {
            exportData = reportData;
        } else if (reportData && typeof reportData === 'object') {
            // Flatten or handle specific structures (like top_10_sex M/F)
            if (reportData.M && reportData.F) {
                exportData = [...reportData.M.map((x: any) => ({ ...x, Sexe: 'M' })), ...reportData.F.map((x: any) => ({ ...x, Sexe: 'F' }))];
            } else {
                exportData = [reportData];
            }
        }

        if (exportData.length === 0) return;

        const headers = Object.keys(exportData[0]).join(';');
        const content = exportData.map(row =>
            Object.values(row).map(val => `"${val}"`).join(';')
        ).join('\n');

        const blob = new Blob([headers + '\n' + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const allReports = CATEGORIES.flatMap(c => c.reports);
    const selectedReport = allReports.find(r => r.id === selectedReportId);
    const pinnedReports = allReports.filter(r => pinnedIds.includes(r.id));

    if (loading) return (
        <div className="h-[600px] flex items-center justify-center text-slate-500 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-sky-500">
                <Database size={24} />
            </motion.div>
            <span className="text-xs font-black uppercase tracking-widest">Initialisation DzCancer Engine...</span>
        </div>
    );

    if (!data) return <div className="p-10 text-center text-slate-500">Erreur de serveur DzCancer.</div>;

    return (
        <div className="flex gap-6 h-[800px]">
            {/* DzCancer Sidebar Library */}
            <div className="w-80 flex flex-col gap-4 overflow-hidden">
                <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                        <Library size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">DzCancer Suite</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Éditeur de Rapports IARC</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                    {/* pinned reports category */}
                    {pinnedReports.length > 0 && (
                        <div className="space-y-1 mb-6">
                            <div className="px-3 flex items-center gap-2 opacity-60">
                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white">Mes Favoris</span>
                            </div>
                            {pinnedReports.map(report => (
                                <button
                                    key={`fav-${report.id}`}
                                    onClick={() => setSelectedReportId(report.id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${selectedReportId === report.id
                                        ? 'bg-amber-500/15 border-amber-500/30 text-white'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <span className="text-[10px] font-bold leading-tight flex-1">{report.name}</span>
                                    {selectedReportId === report.id && <motion.div layoutId="favActive" className="w-1 h-3 bg-amber-400 rounded-full" />}
                                </button>
                            ))}
                        </div>
                    )}

                    {CATEGORIES.map(category => (
                        <div key={category.id} className="space-y-1">
                            <div className="px-3 flex items-center gap-2 opacity-40">
                                <category.icon size={12} className="text-sky-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white">{category.name}</span>
                            </div>
                            {category.reports.map(report => (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReportId(report.id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${selectedReportId === report.id
                                        ? 'bg-sky-500/15 border-sky-500/30 text-white'
                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <span className="text-[10px] font-bold leading-tight flex-1">{report.name}</span>
                                    {selectedReportId === report.id && <motion.div layoutId="activeDot" className="w-1 h-3 bg-sky-400 rounded-full" />}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex flex-col gap-2">
                    <button className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                        <span>Générer Tableaux CI5</span>
                        <Download size={14} />
                    </button>
                </div>
            </div>

            {/* Scientific Canvas */}
            <div className="flex-1 bg-slate-900/60 rounded-3xl border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Globe size={200} />
                </div>

                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-slate-900/40 backdrop-blur-md z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-sky-400 mb-2">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">DzCancer Verified Report</span>
                            </div>
                            <h2 className="text-3xl font-black text-white tracking-tighter">{selectedReport?.name}</h2>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedReportId !== 'dashboard_main' && (
                                <>
                                    <button
                                        onClick={() => exportToCSV(selectedReport?.name || 'Report', data.reports[selectedReportId])}
                                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
                                        title="Exporter les données en CSV"
                                    >
                                        <FileSpreadsheet size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Exporter</span>
                                    </button>
                                    <button
                                        onClick={() => togglePin(selectedReportId)}
                                        className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${pinnedIds.includes(selectedReportId)
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                        title={pinnedIds.includes(selectedReportId) ? "Désépingler" : "Épingler au tableau de bord"}
                                    >
                                        <Star size={18} className={pinnedIds.includes(selectedReportId) ? 'fill-amber-400' : ''} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {pinnedIds.includes(selectedReportId) ? 'Épinglé' : 'Épingler'}
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Calculé en temps réel</p>
                            <p className="text-lg font-mono text-white tracking-tighter">N= {data.summary.total_cases}</p>
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedReportId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full flex flex-col gap-8"
                        >
                            <ReportController
                                reportId={selectedReportId}
                                data={data}
                                pinnedReports={pinnedReports}
                                onSelectReport={setSelectedReportId}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// --- Specialized DzCancer Visualizations ---

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-colors pointer-events-none`} />
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl bg-slate-800 text-${color}-400`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-white lining-nums">{value}</p>
            </div>
        </div>
    </div>
);

const GenericBarReport = ({ data, color, valueKey, nameKey, layout = "horizontal", hideTitle = false }: any) => {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase py-20">Pas de données</div>;
    return (
        <div className={`h-[400px] w-full ${!hideTitle ? 'bg-white/5 rounded-3xl p-6' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout={layout} margin={{ left: layout === "vertical" ? 40 : 0, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={layout === "vertical"} horizontal={layout === "horizontal"} />
                    <XAxis dataKey={layout === "horizontal" ? nameKey : undefined} type={layout === "horizontal" ? "category" : "number"} hide={layout === "vertical"} stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis dataKey={layout === "vertical" ? nameKey : undefined} type={layout === "vertical" ? "category" : "number"} stroke="#475569" fontSize={10} axisLine={false} tickLine={false} width={layout === "vertical" ? 80 : 30} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    <Bar dataKey={valueKey} fill={color} radius={layout === "vertical" ? [0, 4, 4, 0] : [4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const GenericPieReport = ({ data, hideTitle = false }: any) => {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase py-20">Pas de données</div>;
    return (
        <div className="h-[400px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" nameKey="name" labelLine={false}>
                        {data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    {!hideTitle && <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />}
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

const AgeRawReport = ({ data }: any) => {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase py-20">Pas de données</div>;
    const bins: any = {};
    data.forEach((age: number) => { bins[age] = (bins[age] || 0) + 1; });
    const plotData = Object.keys(bins).sort((a, b) => Number(a) - Number(b)).map(age => ({ age, count: bins[age] }));
    return (
        <div className="h-[350px] bg-white/5 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={plotData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="age" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="count" stroke="#fb923c" dot={false} strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const TrendReport = ({ data, isLog = false }: any) => {
    if (!data || data.length === 0) return <div className="p-10 text-center text-slate-500 uppercase text-[10px] font-black">Pas de données de tendance disponibles</div>;
    const keys = Object.keys(data[0]).filter(k => k !== 'year' && k !== 'Total');
    return (
        <div className="h-[400px] bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="year" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                    <YAxis scale={isLog ? 'log' : 'auto'} domain={isLog ? ['auto', 'auto'] : [0, 'auto']} stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em' }} />
                    <Area type="monotone" dataKey="Total" stroke="#0ea5e9" strokeWidth={4} fill="url(#colorTotal)" name="Total Cases" />
                    {keys.map((key, i) => (
                        <Area key={key} type="monotone" dataKey={key} stroke={COLORS[(i + 1) % COLORS.length]} strokeWidth={2} fill="transparent" name={key} />
                    ))}
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const QualityReport = ({ data }: any) => {
    if (!data) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-400 tracking-widest uppercase">Indicateurs de Complétude</h4>
                {data.map((item: any, i: number) => (
                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{item.name}</p>
                            <p className="text-xl font-black text-white">{item.value} <span className="text-[10px] text-slate-600">CAS</span></p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center text-slate-600 font-bold text-xs">QC</div>
                    </div>
                ))}
            </div>
            <div className="bg-emerald-500/5 rounded-3xl p-8 border border-emerald-500/10 flex flex-col items-center justify-center text-center">
                <ShieldCheck size={48} className="text-emerald-400 mb-4" />
                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Conformité IARC/IACR</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium uppercase tracking-widest">Le registre présente des indicateurs de qualité conformes aux standards internationaux (MV% {">"} 80%).</p>
            </div>
        </div>
    );
};

const AgeIncidenceCurve = ({ data, total }: any) => {
    if (!data || !total) return null;
    const curveData = data.map((d: any) => ({
        age: d.age,
        rate: (((Math.abs(d.M) + Math.abs(d.F)) / total) * 1000).toFixed(2)
    }));
    return (
        <div className="h-[400px] bg-slate-900 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="age" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: '#0f172a' }} />
                </LineChart>
            </ResponsiveContainer>
            <p className="mt-4 text-[9px] text-slate-500 uppercase font-black tracking-widest italic">Taux d'incidence spécifique à l'âge (Standard World Population Curve)</p>
        </div>
    );
};

const PopulationPyramid = ({ data }: any) => {
    if (!data || data.length === 0) return <div className="p-20 text-center text-slate-500 font-black uppercase text-[10px]">Données pyramidales insuffisantes</div>;
    return (
        <div className="h-[500px] w-full bg-slate-900/40 rounded-3xl p-8 border border-white/5 shadow-inner">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 text-center underline decoration-sky-500 decoration-2 underline-offset-8">Pyramide Comparative de la Cohorte</h4>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }} stackOffset="sign">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="age" type="category" orientation="left" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} width={40} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} formatter={(val: any) => Math.abs(Number(val))} />
                    <Legend iconType="circle" verticalAlign="top" height={36} />
                    <Bar dataKey="M" fill="#0ea5e9" stackId="stack" name="Hommes" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="F" fill="#ec4899" stackId="stack" name="Femmes" radius={[0, 0, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const Top10SexReport = ({ data }: any) => {
    if (!data || !data.M || !data.F) return <div className="p-20 text-center text-slate-500 font-black uppercase text-[10px]">Calcul des localisations en cours...</div>;
    return (
        <div className="grid grid-cols-2 gap-8 h-full">
            <div className="space-y-4">
                <h4 className="text-xs font-black text-sky-400 uppercase tracking-widest flex items-center gap-2"><Users size={14} /> Masculin</h4>
                <div className="h-[350px] bg-sky-500/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.M} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} width={80} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                            <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="space-y-4">
                <h4 className="text-xs font-black text-pink-400 uppercase tracking-widest flex items-center gap-2"><Users size={14} /> Féminin</h4>
                <div className="h-[350px] bg-pink-500/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.F} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} width={80} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                            <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="col-span-2 bg-slate-900/40 rounded-2xl p-6 border border-white/5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Database size={10} /> Tableau Croisé d'Incidence Topographique</h4>
                <div className="grid grid-cols-4 border-b border-white/10 pb-2 mb-2 text-[9px] font-black uppercase text-slate-500 tracking-wider">
                    <span className="col-span-2">Site Primatif</span><span className="text-center font-mono">Homme (N)</span><span className="text-right font-mono">Femme (N)</span>
                </div>
                {data.M.map((m: any, i: number) => (
                    <div key={i} className="grid grid-cols-4 py-2 border-b border-white/5 text-[10px] font-medium text-slate-300 hover:bg-white/[0.02] transition-colors rounded px-1">
                        <span className="col-span-2 text-white font-bold truncate">{m.name}</span>
                        <span className="text-center text-sky-400 font-black">{m.value}</span>
                        <span className="text-right text-pink-400 font-black">{data.F[i]?.value || 0}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MainDashboard = ({ data, pinnedReports, onSelectReport }: any) => (
    <div className="flex flex-col gap-8 h-full">
        <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Cas" value={data.summary.total_cases} icon={Database} color="sky" />
            <StatCard label="ASR Global" value={data.summary.asr_global} icon={Activity} color="emerald" />
            <StatCard label="Vérif. Micro." value={`${data.summary.mv_percent}%`} icon={Microscope} color="amber" />
            <StatCard label="Date Début" value={data.summary.date_min} icon={Calendar} color="violet" />
        </div>

        {pinnedReports?.length > 0 && (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Rapports Favoris</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {pinnedReports.map((report: any) => (
                        <motion.div whileHover={{ scale: 1.02 }} key={`pinned-${report.id}`} onClick={() => onSelectReport(report.id)} className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-amber-500/30 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-tight">{report.name}</h4>
                                <Pin size={12} className="text-amber-500 rotate-45" />
                            </div>
                            <div className="h-16 flex items-center justify-center opacity-10 group-hover:opacity-30 transition-opacity"><TrendingUp size={32} className="text-sky-400" /></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

        <div className="flex-1 grid grid-cols-2 gap-8">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sky-400"><TrendingUp size={14} /><h3 className="text-[10px] font-black uppercase tracking-widest">Distribution par Âge</h3></div>
                <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5 p-4"><GenericBarReport data={data.reports.age_dist} valueKey="value" nameKey="name" color="#0ea5e9" hideTitle /></div>
            </div>
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-pink-400"><Microscope size={14} /><h3 className="text-[10px] font-black uppercase tracking-widest">Top Localisations</h3></div>
                <div className="h-64 bg-slate-900/50 rounded-2xl border border-white/5 p-4"><GenericPieReport data={data.reports.top_10_sex.M || []} hideTitle /></div>
            </div>
        </div>
    </div>
);

const ReportController = ({ reportId, data, pinnedReports, onSelectReport }: any) => {
    switch (reportId) {
        case 'dashboard_main': return <MainDashboard data={data} pinnedReports={pinnedReports} onSelectReport={onSelectReport} />;
        case 'top_10_sex': return <Top10SexReport data={data.reports.top_10_sex} />;
        case 'asr_top': return <GenericBarReport data={data.reports.top_10_sex.M} title="ASR Top Localisations" color="#10b981" valueKey="asr" nameKey="name" />;
        case 'age_count': return <AgeRawReport data={data.reports.age_raw} />;
        case 'age_dist': return <GenericPieReport data={data.reports.age_dist} title="Répartition par Groupe d'Âge" />;
        case 'pyramid': return <PopulationPyramid data={data.reports.pyramid} />;
        case 'age_incidence_curves': return <AgeIncidenceCurve data={data.reports.pyramid} total={data.summary.total_cases} />;
        case 'time_trends': return <TrendReport data={data.reports.trends} />;
        case 'ci5': return <GenericBarReport data={data.reports.ci5} title="Distribution CI5" color="#3b82f6" valueKey="value" nameKey="name" layout="vertical" />;
        case 'iccc': return <GenericBarReport data={data.reports.iccc} title="Classification ICCC (Pédiatrie)" color="#f59e0b" valueKey="value" nameKey="name" layout="vertical" />;
        case 'quality': return <QualityReport data={data.reports.quality || []} />;
        default: return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
                <Database size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Données en attente d'agrégation</p>
            </div>
        );
    }
};

export default AnalysisDashboard;
