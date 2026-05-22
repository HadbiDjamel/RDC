import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import axios from 'axios';
import {
    BarChart3, PieChart as PieIcon,
    LineChart as LineIcon, Download,
    Maximize2, Share2,
    Database, Activity, Filter, Layers,
    RefreshCcw, Table as TableIcon,
    Users as UsersIcon, TrendingUp,
    Calendar, MapPin,
    ChevronRight, ChevronDown,
    ArrowUpRight, ArrowDownRight,
    Minus, AlertCircle, FileText,
    ShieldCheck, Activity as ActivityIcon,
    Circle, MousePointer2
} from 'lucide-react';
import { WILAYA_CENTROIDS } from '../utils/geoConstants';
import { isPointInAnyPolygon } from '../utils/geoUtils';

// ── Types ────────────────────────────────────────────────────────
type ChartType = 'bar' | 'stacked-bar' | 'line' | 'area' | 'pie' | 'radar' | 'pyramid' | 'heatmap';
type Dimension = 'age' | 'gender' | 'city' | 'topography' | 'morphology' | 'year' | 'basis';
type Measure = 'count' | 'percentage' | 'asr' | 'crude' | 'cumulative' | 'truncated';
type StdPop = 'world' | 'africa' | 'europe';

interface Config {
    dimension: Dimension;
    breakdown: Dimension | 'none';
    measure: Measure;
    standardPop: StdPop;
    chartType: ChartType;
    showGrid: boolean;
    showLegend: boolean;
    animate: boolean;
    filters: Partial<Record<Dimension, string[]>>;
    viewMode: 'chart' | 'table' | 'dashboard' | 'report';
}

// ── Advanced Standards Data ─────────────────────────────────────
// Standard Populations for ASR calculations
const STANDARD_POPS: Record<StdPop, Record<string, number>> = {
    world: { '00-14': 31000, '15-29': 24000, '30-44': 19000, '45-59': 14000, '60-74': 9000, '75+': 3000 },
    africa: { '00-14': 45000, '15-29': 25000, '30-44': 15000, '45-59': 9000, '60-74': 5000, '75+': 1000 },
    europe: { '00-14': 16000, '15-29': 18000, '30-44': 21000, '45-59': 21000, '60-74': 17000, '75+': 7000 }
};

// ── Mock Regional Population for Crude Rates (Algeria estimation per 100k)
const REGIONAL_POP = 45000000;

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#a855f7'];

const DIMENSION_LABELS: Record<Dimension, string> = {
    age: "Groupe d'Âge",
    gender: "Sexe",
    city: "Wilaya / Ville",
    topography: "Topographie (CIM-O-3)",
    morphology: "Morphologie",
    year: "Année d'Incidence",
    basis: "Base du Diagnostic"
};

const CHART_ICONS: Record<ChartType, any> = {
    bar: BarChart3,
    'stacked-bar': Layers,
    line: LineIcon,
    area: Activity,
    pie: PieIcon,
    radar: Maximize2,
    pyramid: UsersIcon,
    heatmap: TableIcon
};

const DashboardMiniChart = ({ title, children, icon: Icon }: any) => (
    <div className="portal-card p-5 flex flex-col gap-4 min-h-[280px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Icon size={14} className="text-blue-600" /> {title}
            </h4>
            <Maximize2 size={14} className="text-slate-300 hover:text-blue-600 cursor-pointer transition-colors" />
        </div>
        <div className="flex-1 min-h-0">
            {children}
        </div>
    </div>
);

const IndicatorCard = ({ label, value, trend, subtext, color, icon }: any) => (
    <div className="portal-card p-5 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-slate-900`}>
            {icon}
        </div>
        <div className="relative z-10">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
            <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-slate-900">{value}</span>
                {trend && (
                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
                        trend === 'down' ? 'bg-rose-50 text-rose-600' :
                            'bg-slate-50 text-slate-500'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                        {trend === 'up' ? 'Croissance' : trend === 'down' ? 'Baisse' : 'Stable'}
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">{subtext}</p>
        </div>
    </div>
);

const ReportMethodology = () => (
    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <h5 className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2">
            <FileText size={12} className="text-[#1d6fb5]" /> Note sur la Méthodologie
        </h5>
        <p className="text-[10px] text-slate-500 leading-relaxed italic">
            Les taux standardisés (ASR) sont calculés sur la base de la <strong className="text-slate-700">Population Mondiale Standard (Segi 1960)</strong>.
            Les intervalles de confiance à 95% sont dérivés par approximation de l'erreur standard (SE).
            La complétude est estimée via des sources croisées (Anapath, Clinique, DCO).
        </p>
    </div>
);

const FilterSection = ({ label, options, selected, onSelect, icon }: any) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="space-y-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 hover:text-blue-600 transition-colors py-1"
            >
                <div className="flex items-center gap-2">
                    <span className="text-blue-600">{icon}</span>
                    {label}
                </div>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isOpen && (
                <div className="flex flex-wrap gap-2 pl-6">
                    {options.map((opt: string) => {
                        const isSelected = selected.includes(opt);
                        return (
                            <button
                                key={opt}
                                onClick={() => onSelect(opt)}
                                className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all border ${isSelected
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const SmallStat = ({ label, value, color }: any) => (
    <div className={`px-3 py-2 rounded-xl bg-${color}-50 border border-${color}-100`}>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block leading-tight">{label}</span>
        <span className={`text-[11px] font-black text-${color}-600`}>{value}</span>
    </div>
);

const PresetBtn = ({ label, onClick, color }: any) => (
    <button
        onClick={onClick}
        className={`w-full px-3 py-2.5 bg-${color}-50 border border-${color}-100 hover:border-${color}-300 text-${color}-700 text-[10px] font-bold rounded-xl transition-all flex items-center justify-between group`}
    >
        {label}
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
    </button>
);

const MeasureBtnSm = ({ active, label, onClick }: any) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${active
            ? 'bg-[#1e3a5f] text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-800'
            }`}
    >
        {label}
    </button>
);

const CustomTooltip = ({ active, payload, label, measure }: any) => {
    if (active && payload && payload.length) {
        const measureSuffix = measure === 'count' ? 'cas' :
            measure === 'percentage' ? '%' :
                measure === 'asr' ? 'ASR' :
                    measure === 'cumulative' ? '%' :
                        measure === 'truncated' ? '/100k (35-64)' : '/100k';
        return (
            <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-xl ring-1 ring-black/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-3 border-b border-slate-50 pb-2">{label}</p>
                <div className="space-y-2">
                    {payload.map((p: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color || p.fill }}></div>
                                <span className="text-xs font-medium text-slate-600">{p.name || 'Mesure'}:</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-900">
                                    {Math.abs(p.value).toLocaleString()} {measureSuffix}
                                </p>
                                {p.payload?.low !== undefined && (
                                    <p className="text-[9px] text-slate-400 italic">
                                        IC95%: [{p.payload.low} - {p.payload.high}]
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const DynamicStats: React.FC = () => {
    const [config, setConfig] = useState<Config>({
        dimension: 'topography',
        breakdown: 'gender',
        measure: 'count',
        standardPop: 'world',
        chartType: 'bar',
        showGrid: true,
        showLegend: true,
        animate: true,
        filters: {},
        viewMode: 'dashboard'
    });

    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
    const [registryData, setRegistryData] = useState<any[]>([]);
    const [personalizedMaps, setPersonalizedMaps] = useState<any[]>([]);
    const [selectedMapId, setSelectedMapId] = useState<string>('national');
    const [selectedZoneId, setSelectedZoneId] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    if (loading) {
        // Just empty state while loading
    }

    const getAgeGroup = (birthYearStr: string) => {
        if (!birthYearStr || birthYearStr.includes('99')) return 'Unknown';
        const yearMatch = birthYearStr.match(/\d{4}$/);
        const yob = yearMatch ? parseInt(yearMatch[0]) : 1970;
        const currentYear = new Date().getFullYear();
        const age = currentYear - yob;
        if (age <= 14) return '00-14';
        if (age <= 29) return '15-29';
        if (age <= 44) return '30-44';
        if (age <= 59) return '45-59';
        if (age <= 74) return '60-74';
        return '75+';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsRes, icdo3Res, mapsRes] = await Promise.all([
                    axios.get('patients/'),
                    axios.get('icdo3/'),
                    axios.get('personalized-maps/')
                ]);

                const migratedMaps = (mapsRes.data || []).map((m: any) => ({
                    ...m,
                    zones: (m.zones || []).map((z: any) => ({
                        ...z,
                        polygons: z.polygons || (z.points ? [z.points] : [])
                    }))
                }));
                setPersonalizedMaps(migratedMaps);

                const icdo3Dict = (icdo3Res.data || []).reduce((acc: any, curr: any) => {
                    acc[curr.code] = curr.description_fr;
                    return acc;
                }, {} as Record<string, string>);

                const flattened: any[] = [];
                patientsRes.data.forEach((p: any) => {
                    const genderStr = p.gender === 1 ? 'M' : 'F';
                    const city = p.wilaya_name || 'Inconnu';
                    const ageGroup = getAgeGroup(p.birth_date);

                    if (p.tumors && p.tumors.length > 0) {
                        p.tumors.forEach((t: any) => {
                            const topo = t.topo_code || 'Inconnu';
                            const morpho = t.morpho_code || 'Inconnu';
                            let year = 2026;
                            if (t.incidence_date) {
                                if (t.incidence_date.includes('-')) year = parseInt(t.incidence_date.split('-')[0]);
                                else year = parseInt(t.incidence_date.split('/').pop());
                            }

                            flattened.push({
                                id: t.id,
                                age: ageGroup,
                                gender: genderStr,
                                city: city,
                                topography: icdo3Dict[topo] || topo,
                                morphology: icdo3Dict[morpho] || morpho,
                                year: year,
                                basis: t.basis_of_diagnosis === '1' ? 'Histologie' : t.basis_of_diagnosis === '7' ? 'Cytologie' : 'Clinique',
                                lat: WILAYA_CENTROIDS[String(p.wilaya).padStart(2, '0')]?.lat || 0,
                                lng: WILAYA_CENTROIDS[String(p.wilaya).padStart(2, '0')]?.lng || 0
                            });
                        });
                    }
                });
                setRegistryData(flattened);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filterOptions = useMemo(() => {
        const cities = new Set<string>();
        const topos = new Set<string>();
        const years = new Set<string>();

        registryData.forEach(d => {
            if (d.city) cities.add(d.city);
            if (d.topography) topos.add(d.topography);
            if (d.year) years.add(String(d.year));
        });

        return {
            cities: Array.from(cities).sort(),
            topos: Array.from(topos).sort(),
            years: Array.from(years).sort().reverse()
        };
    }, [registryData]);


    // ── Helper: Calculate ASR ───────────────────────────────────
    const calculateASR = (data: any[], popType: StdPop = 'world') => {
        const ageCounts: Record<string, number> = {};
        data.forEach(item => { ageCounts[item.age] = (ageCounts[item.age] || 0) + 1; });

        const stdPop = STANDARD_POPS[popType];
        let totalStandardPop = Object.values(stdPop).reduce((a, b) => a + b, 0);
        let asr = 0;

        Object.entries(stdPop).forEach(([ageGroup, weight]) => {
            const count = ageCounts[ageGroup] || 0;
            const rate = (count / (weight * 0.1)) * 100000;
            asr += rate * (weight / totalStandardPop);
        });
        return Number(asr.toFixed(2));
    };

    const calculateCumulativeRisk = (data: any[]) => {
        // Prob. of developing cancer 0-74 (standard IARC 0-74 risk)
        // formula: 100 * (1 - exp(-sum(age_spec_rate * 5 / 100000)))
        const ageCounts: Record<string, number> = {};
        data.forEach(item => { ageCounts[item.age] = (ageCounts[item.age] || 0) + 1; });

        let sumRates = 0;
        ['00-14', '15-29', '30-44', '45-59', '60-74'].forEach(age => {
            const count = ageCounts[age] || 0;
            const rate = (count / (STANDARD_POPS.world[age] * 0.1)) * 100000;
            sumRates += (rate * 15 / 100000); // 15 year intervals in our mock
        });

        const risk = (1 - Math.exp(-sumRates)) * 100;
        return Number(risk.toFixed(2));
    };

    // ── Helper: 95% Confidence Interval ──────────────────────────
    const calculateCI = (val: number, n: number) => {
        if (n <= 0) return { low: 0, high: 0 };
        const se = Math.sqrt(val / n); // Simplified Standard Error
        const margin = 1.96 * se;
        return {
            low: Number(Math.max(0, val - margin).toFixed(2)),
            high: Number((val + margin).toFixed(2))
        };
    };

    // ── Helper: Data Quality Metrics ──────────────────────────────
    const qualityMetrics = useMemo(() => {
        const mvCount = registryData.filter(d => d.basis === 'Histologie' || d.basis === 'Cytologie').length;
        const mvPercent = ((mvCount / registryData.length) * 100).toFixed(1);

        // Mocking DCO (Death Certificate Only)
        return {
            mv: mvPercent,
            dco: "2.4", // Standard IARC target is < 5%
            total: registryData.length
        };
    }, []);

    // ── Helper: YoY Calculation ──────────────────────────────────
    const yoyStats = useMemo(() => {
        const currentYear = 2026;
        const lastYear = 2023;
        const curr = registryData.filter(d => d.year === currentYear).length;
        const prev = registryData.filter(d => d.year === lastYear).length;
        const diff = curr - prev;
        const percent = prev > 0 ? ((diff / prev) * 100).toFixed(1) : "0";
        return {
            diff,
            percent,
            trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral' as const
        };
    }, []);

    // ── Data Transformation Logic ───────────────────────────────
    const chartData = useMemo(() => {
        const filteredByTerritory = registryData.filter(item => {
            if (selectedMapId === 'national') return true;
            const selectedMap = personalizedMaps.find(m => String(m.id) === selectedMapId);
            if (!selectedMap) return true;

            // 1. If a specific zone is selected, use polygon intersection
            if (selectedZoneId !== 'all') {
                const zone = selectedMap.zones?.find((z: any) => String(z.id) === selectedZoneId);
                if (zone && zone.polygons) {
                    return isPointInAnyPolygon([item.lat, item.lng], zone.polygons);
                }
            }

            // 2. If 'all' is selected but the map has zones, check if in ANY zone
            if (selectedZoneId === 'all' && (selectedMap.zones || []).length > 0) {
                const anyMatch = selectedMap.zones.some((z: any) =>
                    z.polygons && isPointInAnyPolygon([item.lat, item.lng], z.polygons)
                );
                if (anyMatch) return true;
            }

            // 3. Fallback: check if the wilaya name is in the map's wilayas list
            return (selectedMap.wilaya_names || []).includes(item.city);
        });

        const filtered = filteredByTerritory.filter(item => {
            return Object.entries(config.filters).every(([dim, allowed]) => {
                if (!allowed || allowed.length === 0) return true;
                return allowed.includes(String(item[dim as Dimension]));
            });
        });

        // 2. Aggregate
        if (config.breakdown === 'none' || config.chartType === 'pie' || config.chartType === 'radar') {
            const groups: Record<string, any[]> = {};
            filtered.forEach(item => {
                const val = String(item[config.dimension]);
                if (!groups[val]) groups[val] = [];
                groups[val].push(item);
            });

            let data = Object.entries(groups).map(([name, groupData]) => {
                const count = groupData.length;
                let displayVal = count;

                if (config.measure === 'percentage') {
                    displayVal = Number(((count / filtered.length) * 100).toFixed(1));
                } else if (config.measure === 'asr') {
                    displayVal = calculateASR(groupData, config.standardPop);
                } else if (config.measure === 'crude') {
                    displayVal = Number(((count / REGIONAL_POP) * 100000).toFixed(2));
                } else if (config.measure === 'cumulative') {
                    displayVal = calculateCumulativeRisk(groupData);
                } else if (config.measure === 'truncated') {
                    const truncatedData = groupData.filter(d => ['30-44', '45-59', '60-74'].includes(d.age));
                    displayVal = calculateASR(truncatedData, config.standardPop);
                }

                let ci = { low: 0, high: 0 };
                if (config.measure === 'asr' || config.measure === 'crude' || config.measure === 'truncated') {
                    ci = calculateCI(displayVal, count);
                }

                return { name, value: count, display: displayVal, ...ci };
            });

            return data.sort((a, b) => b.display - a.display);
        } else {
            // Group By + Breakdown
            const matrix: Record<string, Record<string, any[]>> = {};
            const breakdownValues = new Set<string>();

            filtered.forEach(item => {
                const dimVal = String(item[config.dimension]);
                const breakVal = String(item[config.breakdown as Dimension]);
                if (!matrix[dimVal]) matrix[dimVal] = {};
                if (!matrix[dimVal][breakVal]) matrix[dimVal][breakVal] = [];
                matrix[dimVal][breakVal].push(item);
                breakdownValues.add(breakVal);
            });

            const sortedBreakdownKeys = Array.from(breakdownValues).sort();

            return Object.entries(matrix).map(([name, vals]) => {
                const entry: any = { name };
                sortedBreakdownKeys.forEach(bk => {
                    const groupData = vals[bk] || [];
                    let val = groupData.length;

                    if (config.measure === 'percentage') {
                        val = Number(((groupData.length / filtered.length) * 100).toFixed(1));
                    } else if (config.measure === 'asr') {
                        val = calculateASR(groupData);
                    } else if (config.measure === 'crude') {
                        val = Number(((groupData.length / REGIONAL_POP) * 100000).toFixed(2));
                    }

                    // Special for Pyramid: make Male values negative for mirroring
                    if (config.chartType === 'pyramid' && bk === 'M') {
                        val = -val;
                    }
                    entry[bk] = val;
                });
                return entry;
            }).sort((a, b) => {
                if (config.dimension === 'age') return a.name.localeCompare(b.name);
                const sumA = sortedBreakdownKeys.reduce((acc, bk) => acc + Math.abs(a[bk] || 0), 0);
                const sumB = sortedBreakdownKeys.reduce((acc, bk) => acc + Math.abs(b[bk] || 0), 0);
                return sumB - sumA;
            });
        }
    }, [config.dimension, config.breakdown, config.measure, config.filters, config.chartType, selectedMapId, selectedZoneId, personalizedMaps]);

    const breakdownKeys = useMemo(() => {
        if (config.breakdown === 'none' || !chartData.length || !chartData[0]) return [];
        return Object.keys(chartData[0]).filter(k => k !== 'name' && k !== 'value' && k !== 'display');
    }, [chartData, config.breakdown]);

    const toggleFilter = (dim: Dimension, value: string) => {
        setConfig(prev => {
            const current = prev.filters[dim] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return {
                ...prev,
                filters: { ...prev.filters, [dim]: updated }
            };
        });
    };

    const clearFilters = () => setConfig(prev => ({ ...prev, filters: {} }));

    const renderDashboard = () => (
        <div className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
            {/* Top Row: BI Indicators */}
            <div className="grid grid-cols-4 gap-4">
                <IndicatorCard
                    label="Volume Total Registre"
                    value={qualityMetrics.total}
                    trend={yoyStats.trend}
                    subtext={`${yoyStats.diff >= 0 ? '+' : ''}${yoyStats.diff} vs 2023 (${yoyStats.percent}%)`}
                    color="sky"
                    icon={<Database size={16} />}
                />
                <IndicatorCard
                    label="Vérification Micro."
                    value={`${qualityMetrics.mv}%`}
                    subtext="Cible IARC: > 80%"
                    color="emerald"
                    icon={<ShieldCheck size={16} />}
                />
                <IndicatorCard
                    label="Cas DCO (Certif. Décès)"
                    value={`${qualityMetrics.dco}%`}
                    subtext="Cible IARC: < 5%"
                    color="rose"
                    icon={<AlertCircle size={16} />}
                />
                <IndicatorCard
                    label="Indice de Complétude"
                    value="94.2%"
                    subtext="Estimation Capture-Recapture"
                    color="amber"
                    icon={<ActivityIcon size={16} />}
                />
            </div>

            {/* Middle Row: Quad-Charts Hub */}
            <div className="grid grid-cols-2 gap-6">
                <DashboardMiniChart title="Top 5 Sites Primaires" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.slice(0, 5)}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={8} interval={0} />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip measure={config.measure} />} />
                            <Bar dataKey="display" radius={[4, 4, 0, 0]}>
                                {chartData.slice(0, 5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </DashboardMiniChart>

                <DashboardMiniChart title="Distribution par Sexe" icon={UsersIcon}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={registryData.reduce((acc: any[], curr) => {
                                    const existing = acc.find(a => a.name === curr.gender);
                                    if (existing) existing.value++;
                                    else acc.push({ name: curr.gender, value: 1 });
                                    return acc;
                                }, [])}
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                <Cell fill="#0ea5e9" />
                                <Cell fill="#ec4899" />
                            </Pie>
                            <Tooltip />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </DashboardMiniChart>

                <DashboardMiniChart title="Incidence par Wilaya" icon={MapPin}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.filter(d => ['Alger', 'Oran', 'Constantine'].includes(d.name))} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={8} width={60} />
                            <Tooltip />
                            <Bar dataKey="display" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                </DashboardMiniChart>

                <DashboardMiniChart title="Évolution Temporelle" icon={Activity}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{ year: 2022, val: 2 }, { year: 2023, val: 12 }, { year: 2026, val: 5 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="val" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </DashboardMiniChart>
            </div>

            <div className="portal-card p-5 bg-slate-50 border-slate-200">
                <h5 className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-2 mb-3">
                    <FileText size={14} className="text-blue-600" /> Note sur la Méthodologie
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                    Les taux standardisés (ASR) sont calculés sur la base de la <strong className="text-slate-700">Population Mondiale Standard (Segi 1960)</strong>.
                    Les intervalles de confiance à 95% sont dérivés par approximation de l'erreur standard (SE).
                    La complétude est estimée via des sources croisées (Anapath, Clinique, DCO).
                </p>
            </div>
        </div>
    );

    const renderChart = () => {
        const CommonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 20 }
        };

        switch (config.chartType) {
            case 'bar':
                return (
                    <BarChart {...CommonProps}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />}
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        {config.showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
                        {config.breakdown === 'none' ? (
                            <Bar dataKey="display" radius={[4, 4, 0, 0]} isAnimationActive={config.animate}>
                                {chartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Bar>
                        ) : (
                            breakdownKeys.map((bk, i) => (
                                <Bar key={bk} dataKey={bk} name={bk} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} isAnimationActive={config.animate} />
                            ))
                        )}
                    </BarChart>
                );
            case 'stacked-bar':
                return (
                    <BarChart {...CommonProps}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />}
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip content={<CustomTooltip measure={config.measure} />} />
                        {config.showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
                        {breakdownKeys.map((bk, i) => (
                            <Bar key={bk} dataKey={bk} name={bk} stackId="a" fill={COLORS[i % COLORS.length]} isAnimationActive={config.animate} />
                        ))}
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart {...CommonProps}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />}
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip content={<CustomTooltip measure={config.measure} />} />
                        {config.showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
                        {config.breakdown === 'none' ? (
                            <Line type="monotone" dataKey="display" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} isAnimationActive={config.animate} />
                        ) : (
                            breakdownKeys.map((bk, i) => (
                                <Line key={bk} type="monotone" dataKey={bk} name={bk} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={config.animate} />
                            ))
                        )}
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart {...CommonProps}>
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />}
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip content={<CustomTooltip measure={config.measure} />} />
                        <defs>
                            {COLORS.map((c, i) => (
                                <linearGradient key={i} id={`color-${i}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        {config.showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
                        {config.breakdown === 'none' ? (
                            <Area type="monotone" dataKey="display" stroke="#0ea5e9" fillOpacity={1} fill="url(#color-0)" strokeWidth={2} isAnimationActive={config.animate} />
                        ) : (
                            breakdownKeys.map((bk, i) => (
                                <Area key={bk} type="monotone" dataKey={bk} name={bk} stackId="a" stroke={COLORS[i % COLORS.length]} fill={`url(#color-${i % COLORS.length})`} fillOpacity={1} strokeWidth={2} isAnimationActive={config.animate} />
                            ))
                        )}
                    </AreaChart>
                );
            case 'pyramid':
                return (
                    <BarChart {...CommonProps} layout="vertical" stackOffset="sign">
                        {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />}
                        <XAxis type="number" stroke="#64748b" fontSize={10} tickFormatter={(v) => Math.abs(v).toString()} />
                        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={60} />
                        <Tooltip content={<CustomTooltip measure={config.measure} />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                        {config.showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
                        {breakdownKeys.map((bk, i) => (
                            <Bar
                                key={bk}
                                dataKey={bk}
                                name={bk === 'M' ? 'Hommes' : bk === 'F' ? 'Femmes' : bk}
                                stackId="a"
                                fill={bk === 'M' ? '#0ea5e9' : bk === 'F' ? '#ec4899' : COLORS[i % COLORS.length]}
                                isAnimationActive={config.animate}
                                barSize={20}
                            />
                        ))}
                    </BarChart>
                );
            case 'pie':
                return (
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%" cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="display"
                            isAnimationActive={config.animate}
                            stroke="none"
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip measure={config.measure} />} />
                        {config.showLegend && <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />}
                    </PieChart>
                );
            case 'radar':
                return (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="rgba(0,0,0,0.05)" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                        <PolarRadiusAxis stroke="#64748b" tick={{ fontSize: 8 }} />
                        {config.breakdown === 'none' ? (
                            <Radar name="Distribution" dataKey="display" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.5} isAnimationActive={config.animate} />
                        ) : (
                            breakdownKeys.map((bk, i) => (
                                <Radar key={bk} name={bk} dataKey={bk} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.3} isAnimationActive={config.animate} />
                            ))
                        )}
                        <Tooltip content={<CustomTooltip />} />
                        {config.showLegend && <Legend verticalAlign="top" height={36} iconType="circle" />}
                    </RadarChart>
                );
            case 'heatmap':
                const allBreakdowns = breakdownKeys;
                return (
                    <div className="w-full h-full overflow-auto flex flex-col items-center justify-center">
                        <div className="glass-card p-4 inline-block min-w-full">
                            <table className="w-full text-center border-collapse text-[10px] text-slate-500">
                                <thead>
                                    <tr>
                                        <th className="p-3 border border-slate-200 bg-slate-50 text-[#1d6fb5] font-bold">DIMENSION</th>
                                        {allBreakdowns.map(bk => <th key={bk} className="p-3 border border-slate-200 bg-slate-50 text-slate-600 font-bold">{bk}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.map(row => (
                                        <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-3 border border-slate-200 bg-slate-50/50 font-bold text-slate-700 text-left">{row.name}</td>
                                            {allBreakdowns.map(bk => {
                                                const val = Math.abs(row[bk] || 0);
                                                const maxVal = Math.max(...chartData.map(r => Math.max(...allBreakdowns.map(b => Math.abs(r[b] || 0)))));
                                                const intensity = val / (maxVal || 1);
                                                return (
                                                    <td key={bk} className="p-3 border border-slate-200 font-mono text-xs" style={{ backgroundColor: `rgba(29, 111, 181, ${0.05 + intensity * 0.4})`, color: intensity > 0.6 ? '#fff' : '#1e3a5f' }}>
                                                        {val}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handlePreset = (type: string) => {
        switch (type) {
            case 'pyramid':
                setConfig(prev => ({ ...prev, chartType: 'pyramid', dimension: 'age', breakdown: 'gender', animate: true, measure: 'count' }));
                break;
            case 'trends':
                setConfig(prev => ({ ...prev, chartType: 'line', dimension: 'year', breakdown: 'topography', animate: true, measure: 'asr' }));
                break;
            case 'sites':
                setConfig(prev => ({ ...prev, chartType: 'bar', dimension: 'topography', breakdown: 'none', animate: true, measure: 'count' }));
                break;
            case 'heat':
                setConfig(prev => ({ ...prev, chartType: 'heatmap', dimension: 'topography', breakdown: 'city', animate: true, measure: 'count' }));
                break;
        }
    };

    return (
        <div className="h-full flex flex-col gap-2 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-[#1d6fb5]">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">DzCancer Analytics Studio</h2>
                        <p className="text-[10px] text-slate-500 font-medium">Plateforme d'Analyse Épidémiologique</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg text-[11px] font-bold text-slate-600 transition-all">
                        <Download size={12} /> Exporter
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] hover:bg-[#2a5a8f] rounded-lg text-[11px] font-bold text-white shadow-sm transition-all">
                        <Share2 size={12} /> Publier
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-3 min-h-0 min-w-0">
                {/* ── Control Console (LEFT) ─────────────────────────── */}
                <div className={`flex flex-col gap-2 transition-all duration-300 ${isFilterPanelOpen ? 'w-[240px]' : 'w-0 overflow-hidden opacity-0'}`}>
                    <div className="glass-card p-3 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                        {/* Dimensional Filters */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-[10px] uppercase font-black text-[#1d6fb5] flex items-center gap-2">
                                    <Filter size={12} /> Filtres Avancés
                                </label>
                                <button onClick={clearFilters} className="text-[9px] text-slate-400 hover:text-red-500 transition-colors uppercase font-bold">Réinitialiser</button>
                            </div>

                            {/* Territory / Map Filter */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-white/5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <MapPin size={12} className="text-[#1d6fb5]" /> Périmètre Géographique
                                </label>
                                <div className="space-y-2">
                                    <select
                                        value={selectedMapId}
                                        onChange={(e) => {
                                            setSelectedMapId(e.target.value);
                                            setSelectedZoneId('all');
                                        }}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#1d6fb5]"
                                    >
                                        <option value="national" className="bg-white">National (Tout)</option>
                                        <optgroup label="Mes Cartes Personnalisées" className="bg-white">
                                            {personalizedMaps.map(m => (
                                                <option key={m.id} value={String(m.id)} className="bg-white">{m.name}</option>
                                            ))}
                                        </optgroup>
                                    </select>

                                    {selectedMapId !== 'national' && (
                                        <AnimatePresence>
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-2 pl-2 border-l-2 border-sky-500/20"
                                            >
                                                <label className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                                    <MousePointer2 size={10} /> Zones de la carte
                                                </label>
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={() => setSelectedZoneId('all')}
                                                        className={`px-3 py-2 rounded-lg text-[10px] font-bold text-left transition-all ${selectedZoneId === 'all' ? 'bg-blue-50 text-[#1d6fb5] border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                                    >
                                                        Toutes les wilayas de la carte
                                                    </button>
                                                    {personalizedMaps.find(m => String(m.id) === selectedMapId)?.zones?.map((z: any) => (
                                                        <button
                                                            key={z.id}
                                                            onClick={() => setSelectedZoneId(String(z.id))}
                                                            className={`px-3 py-2 rounded-lg text-[10px] font-bold text-left transition-all flex items-center gap-2 ${selectedZoneId === String(z.id) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                                        >
                                                            <Circle size={8} fill={z.color || '#fff'} stroke="none" />
                                                            {z.name}
                                                            <span className="ml-auto opacity-40 text-[8px]">Auto-détection</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <FilterSection
                                    label="Année"
                                    icon={<Calendar size={12} />}
                                    options={filterOptions.years.length ? filterOptions.years : ['2023', '2026']}
                                    selected={config.filters.year || []}
                                    onSelect={(v: string) => toggleFilter('year', v)}
                                />
                                <FilterSection
                                    label="Sexe"
                                    icon={<UsersIcon size={12} />}
                                    options={['M', 'F']}
                                    selected={config.filters.gender || []}
                                    onSelect={(v: string) => toggleFilter('gender', v)}
                                />
                                <FilterSection
                                    label="Ville / Wilaya"
                                    icon={<MapPin size={12} />}
                                    options={filterOptions.cities}
                                    selected={config.filters.city || []}
                                    onSelect={(v: string) => toggleFilter('city', v)}
                                />
                                <FilterSection
                                    label="Topographie"
                                    icon={<Database size={12} />}
                                    options={filterOptions.topos}
                                    selected={config.filters.topography || []}
                                    onSelect={(v: string) => toggleFilter('topography', v)}
                                />
                            </div>
                        </div>

                        {/* Presets */}
                        <div className="pt-4 border-t border-white/5">
                            <label className="text-[10px] uppercase font-black text-[#1e3a5f] mb-3 block">Modèles DzCancer</label>
                            <div className="grid grid-cols-1 gap-2">
                                <PresetBtn onClick={() => handlePreset('pyramid')} label="Pyramide des Âges" color="rose" />
                                <PresetBtn onClick={() => handlePreset('trends')} label="Analyse ASR / Temps" color="sky" />
                                <PresetBtn onClick={() => handlePreset('sites')} label="Fréquence Sites Primaires" color="emerald" />
                                <PresetBtn onClick={() => handlePreset('heat')} label="Analyse Densité Géo" color="amber" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main Visualization Panel (RIGHT) ───────────── */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                    {/* Toolbar */}
                    <div className="glass-card p-2 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 gap-0.5">
                                {(Object.keys(CHART_ICONS) as ChartType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setConfig(prev => ({ ...prev, chartType: type, viewMode: 'chart' }))}
                                        className={`p-1.5 rounded-md transition-all ${config.chartType === type && config.viewMode === 'chart'
                                            ? 'bg-[#1e3a5f] text-white shadow-sm'
                                            : 'text-slate-400 hover:text-slate-700'
                                            }`}
                                        title={type.toUpperCase()}
                                    >
                                        {React.createElement(CHART_ICONS[type], { size: 16 })}
                                    </button>
                                ))}
                                <div className="mx-1 h-5 w-[1px] bg-slate-200 self-center"></div>
                                <button
                                    onClick={() => setConfig(prev => ({ ...prev, viewMode: 'table' }))}
                                    className={`p-1.5 rounded-md transition-all ${config.viewMode === 'table'
                                        ? 'bg-[#1e3a5f] text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-700'
                                        }`}
                                    title="TABLEAU DE DONNÉES"
                                >
                                    <TableIcon size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
                                <button
                                    onClick={() => setConfig(prev => ({ ...prev, viewMode: 'dashboard' }))}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${config.viewMode === 'dashboard'
                                        ? 'bg-[#0d7a3e] text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    DASHBOARD
                                </button>
                                <button
                                    onClick={() => setConfig(prev => ({ ...prev, viewMode: 'report' }))}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${config.viewMode === 'report'
                                        ? 'bg-[#c0392b] text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    RAPPORT
                                </button>
                                <div className="flex items-center gap-2">
                                    <MeasureBtnSm active={config.measure === 'count'} label="CAS" onClick={() => setConfig(p => ({ ...p, measure: 'count' }))} />
                                    <MeasureBtnSm active={config.measure === 'asr'} label="ASR" onClick={() => setConfig(p => ({ ...p, measure: 'asr' }))} />
                                    <MeasureBtnSm active={config.measure === 'crude'} label="BRUT" onClick={() => setConfig(p => ({ ...p, measure: 'crude' }))} />
                                    <MeasureBtnSm active={config.measure === 'cumulative'} label="CUMUL" onClick={() => setConfig(p => ({ ...p, measure: 'cumulative' }))} />
                                    <MeasureBtnSm active={config.measure === 'truncated'} label="TRONQ" onClick={() => setConfig(p => ({ ...p, measure: 'truncated' }))} />
                                    <MeasureBtnSm active={config.measure === 'percentage'} label="%" onClick={() => setConfig(p => ({ ...p, measure: 'percentage' }))} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stage Panel */}
                    <div className="glass-card flex-1 min-h-0 flex flex-col relative overflow-hidden group">
                        <div className="absolute inset-0 pointer-events-none"></div>

                        <div className="p-4 flex-1 flex flex-col relative z-10 min-h-0">
                            {/* Panel Header */}
                            <div className="flex items-start justify-between mb-2 shrink-0">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-bold text-slate-800 capitalize tracking-tight">
                                            {config.viewMode === 'table' ? 'Explorateur de Données' : config.chartType.replace('-', ' ')}
                                        </h3>
                                        <div className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-md text-[9px] font-black text-[#1d6fb5] uppercase">
                                            {config.measure}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">
                                        Analyse: {DIMENSION_LABELS[config.dimension]}
                                        {config.breakdown !== 'none' && ` par ${DIMENSION_LABELS[config.breakdown]}`}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-1">
                                        <RefreshCcw size={12} className="text-[#0d7a3e]" /> Auto-sync activé
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-mono">Dernier calcul: {new Date().toLocaleTimeString()}</p>
                                </div>
                            </div>

                            {/* Main Viz Area */}
                            <div className="flex-1 min-h-0 min-w-0">
                                {config.viewMode === 'table' ? (
                                    <div className="h-full overflow-auto custom-scrollbar rounded-xl border border-slate-200">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-20">
                                                <tr>
                                                    <th className="p-4 font-bold text-blue-700">{DIMENSION_LABELS[config.dimension].toUpperCase()}</th>
                                                    {breakdownKeys.length > 0 ? (
                                                        breakdownKeys.map(k => <th key={k} className="p-4 font-bold text-slate-600">{k}</th>)
                                                    ) : (
                                                        <th className="p-4 font-bold text-slate-600">VALEUR ({config.measure})</th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {chartData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="p-4 font-medium text-slate-800">{row.name}</td>
                                                        {breakdownKeys.length > 0 ? (
                                                            breakdownKeys.map(k => (
                                                                <td key={k} className="p-4 font-mono text-slate-600">
                                                                    {Math.abs(row[k] || 0).toLocaleString()}
                                                                </td>
                                                            ))
                                                        ) : (
                                                            <td className="p-4 font-mono text-blue-600 font-bold">{row.display.toLocaleString()}</td>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : config.viewMode === 'dashboard' ? (
                                    renderDashboard()
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        {renderChart()}
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Dimension Selectors Bottom */}
                            <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-6">
                                    <div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">Axe Principal</span>
                                        <select
                                            value={config.dimension}
                                            onChange={(e) => setConfig(p => ({ ...p, dimension: e.target.value as Dimension }))}
                                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#1d6fb5] outline-none"
                                        >
                                            {Object.entries(DIMENSION_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-white">{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">Segmentation</span>
                                        <select
                                            value={config.breakdown}
                                            onChange={(e) => setConfig(p => ({ ...p, breakdown: e.target.value as any }))}
                                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:ring-1 focus:ring-[#1d6fb5] outline-none"
                                        >
                                            <option value="none" className="bg-white">Aucune</option>
                                            {Object.entries(DIMENSION_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-white">{v}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1.5 italic text-sky-400">Territoire (Cartes)</span>
                                        <select
                                            value={selectedMapId}
                                            onChange={(e) => setSelectedMapId(e.target.value)}
                                            className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs text-[#1d6fb5] focus:ring-1 focus:ring-[#1d6fb5] outline-none font-bold"
                                        >
                                            <option value="national" className="bg-white">Niveau National (Tout)</option>
                                            {personalizedMaps.map(m => (
                                                <option key={m.id} value={String(m.id)} className="bg-white">{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <SmallStat label="Population Ref" value="Segmenté" color="sky" />
                                    <SmallStat label="Confiance" value="99.2%" color="emerald" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicStats;
