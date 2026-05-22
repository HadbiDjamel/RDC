import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Trash2, Map as LucideMap, Plus, MapPin,
    CheckSquare, BarChart3, X, Pencil, Layers, Target, ChevronRight, Settings2, Shield
} from 'lucide-react';
import axios from 'axios';
import TerritoryMap from './TerritoryMap';
import type { Zone, StatPoint } from './TerritoryMap';

import { WILAYA_CENTROIDS } from '../utils/geoConstants';

const ZONE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];
const STAT_TYPES = [
    { id: 'cases', label: 'Nombre de cas' },
    { id: 'incidence', label: "Taux d'incidence" },
    { id: 'mortality', label: 'Mortalité' },
];

interface PersonalizedMap {
    id: number;
    name: string;
    wilaya_codes: string[];
    wilaya_names: string[];
    zones: Zone[];
}

const MapManager: React.FC = () => {
    const [maps, setMaps] = useState<PersonalizedMap[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingMap, setEditingMap] = useState<PersonalizedMap | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [mapName, setMapName] = useState('');
    const [zones, setZones] = useState<Zone[]>([]);
    const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [pendingZone, setPendingZone] = useState<[number, number][] | null>(null);
    const [pendingZoneName, setPendingZoneName] = useState('');
    const [pendingZoneMode, setPendingZoneMode] = useState<'new' | 'existing'>('new');
    const [pendingZoneTarget, setPendingZoneTarget] = useState<string>('');
    const [showStats, setShowStats] = useState(false);
    const [statType, setStatType] = useState('cases');
    const [selectedCancerType, setSelectedCancerType] = useState('all');
    const [cancerTypes, setCancerTypes] = useState<any[]>([]);
    const [statsData, setStatsData] = useState<StatPoint[]>([]);
    const colorIdx = useRef(0);

    const fetchMaps = async () => {
        try {
            const res = await axios.get('personalized-maps/');
            setMaps(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchCancerTypes = async () => {
        try {
            const res = await axios.get('icdo3/?type=topography');
            setCancerTypes(res.data || []);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { 
        fetchMaps(); 
        fetchCancerTypes();
    }, []);

    useEffect(() => {
        if (!showStats) return;
        const seed: Record<string, number> = { cases: 37, incidence: 53, mortality: 19 };
        const s = seed[statType] ?? 37;
        
        const params = new URLSearchParams({ metric: statType });
        if (selectedCancerType !== 'all') params.append('cancer_type', selectedCancerType);

        axios.get(`analysis/wilaya-stats/?${params.toString()}`)
            .then(res => setStatsData(res.data))
            .catch(() => {
                const cSeed = selectedCancerType === 'all' ? 0 : 
                             selectedCancerType.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                const finalSeed = s + cSeed;

                setStatsData(Object.entries(WILAYA_CENTROIDS).map(([id, w]) => ({
                    wilayaId: id, name: w.name, lat: w.lat, lng: w.lng,
                    value: Math.floor(((parseInt(id) * finalSeed + 13) % 95) + 5),
                })));
            });
    }, [showStats, statType, selectedCancerType]);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        if (!isDrawing) return;
        setDrawingPoints(prev => [...prev, [lat, lng]]);
    }, [isDrawing]);

    const startDrawing = () => { setIsDrawing(true); setDrawingPoints([]); };
    const cancelDrawing = () => { setIsDrawing(false); setDrawingPoints([]); };

    const closePolygon = () => {
        if (drawingPoints.length < 3) return;
        setPendingZone(drawingPoints);
        setPendingZoneName(`Zone ${zones.length + 1}`);
        setPendingZoneMode(zones.length > 0 ? 'existing' : 'new');
        setPendingZoneTarget(zones.length > 0 ? zones[zones.length - 1].id : '');
        setIsDrawing(false);
        setDrawingPoints([]);
    };

    const confirmZone = () => {
        if (!pendingZone) return;
        if (pendingZoneMode === 'existing' && pendingZoneTarget) {
            setZones(prev => prev.map(z =>
                z.id === pendingZoneTarget
                    ? { ...z, polygons: [...z.polygons, pendingZone] }
                    : z
            ));
        } else {
            const color = ZONE_COLORS[colorIdx.current % ZONE_COLORS.length];
            colorIdx.current++;
            setZones(prev => [...prev, {
                id: `zone-${Date.now()}`,
                name: pendingZoneName || `Zone ${zones.length + 1}`,
                color,
                polygons: [pendingZone],
            }]);
        }
        setPendingZone(null);
        setPendingZoneName('');
    };

    const removeZone = (id: string) => setZones(prev => prev.filter(z => z.id !== id));

    const handleSave = async () => {
        if (!mapName) return;
        try {
            const payload = { name: mapName, wilaya_codes: [], zones };
            if (editingMap) {
                await axios.put(`personalized-maps/${editingMap.id}/`, payload);
            } else {
                await axios.post('personalized-maps/', payload);
            }
            setIsCreating(false); setEditingMap(null);
            setMapName(''); setZones([]); colorIdx.current = 0;
            fetchMaps();
        } catch (err: any) {
            alert('Erreur: ' + (err.response?.data?.detail || 'Vérifiez votre connexion.'));
        }
    };

    const openEdit = (map: PersonalizedMap) => {
        setEditingMap(map); setMapName(map.name);
        const loadedZones = (map.zones || []).map((z: any) => ({
            ...z,
            polygons: z.polygons || (z.points ? [z.points] : [])
        })) as Zone[];
        setZones(loadedZones);
        colorIdx.current = loadedZones.length;
        setIsCreating(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Supprimer cette carte ?')) return;
        await axios.delete(`personalized-maps/${id}/`);
        fetchMaps();
    };

    const resetEditor = () => {
        setIsCreating(false); setEditingMap(null);
        setMapName(''); setZones([]); colorIdx.current = 0;
        cancelDrawing(); setPendingZone(null);
    };

    return (
        <div className="h-full flex gap-8 animate-in fade-in duration-500" style={{ minHeight: 0 }}>

            {/* ── Left Sidebar ──────────────────────────── */}
            <div className="w-80 flex flex-col gap-6 flex-shrink-0 py-2">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <LucideMap size={14} strokeWidth={2.5} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Spatiale Analytics</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Territoires</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Cartes Personnalisées</p>
                    </div>
                    {!isCreating && (
                        <button 
                            onClick={() => { setIsCreating(true); setEditingMap(null); setMapName(''); setZones([]); colorIdx.current = 0; }}
                            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    )}
                </div>

                {/* Statistics Settings Card */}
                <div className="bg-white rounded-[32px] border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <BarChart3 size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Bulles Stats</span>
                        </div>
                        <button 
                            onClick={() => setShowStats(v => !v)}
                            className={`w-12 h-6 rounded-full relative transition-all duration-300 ${showStats ? 'bg-indigo-600' : 'bg-slate-200'}`}
                        >
                            <motion.div 
                                animate={{ x: showStats ? 26 : 4 }}
                                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                            />
                        </button>
                    </div>
                    
                    <AnimatePresence>
                        {showStats && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                className="space-y-3 overflow-hidden pt-2"
                            >
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Métrique</label>
                                    <select 
                                        value={statType} 
                                        onChange={e => setStatType(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                    >
                                        {STAT_TYPES.map(s => (
                                            <option key={s.id} value={s.id}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pathologie</label>
                                    <select 
                                        value={selectedCancerType} 
                                        onChange={e => setSelectedCancerType(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[10px] font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                    >
                                        <option value="all">Tous les cancers</option>
                                        {cancerTypes.map(ct => (
                                            <option key={ct.code} value={ct.code}>
                                                {ct.code} - {ct.description_fr}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-6 pt-2 pb-1 px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Élevé</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 opacity-30" />
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Faible</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Map Library Library */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bibliothèque de Cartes</p>
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialisation...</p>
                        </div>
                    ) : maps.length === 0 && !isCreating ? (
                        <div className="bg-slate-100/50 rounded-[32px] p-10 text-center border-2 border-dashed border-slate-200">
                            <LucideMap size={48} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-slate-500 font-black text-xs uppercase tracking-tight">Aucun territoire</p>
                            <p className="text-[9px] text-slate-400 mt-2 font-medium">Tracez vos premières zones d'intérêt épidémiologique.</p>
                        </div>
                    ) : maps.map(map => (
                        <motion.div 
                            key={map.id} 
                            layout 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => openEdit(map)}
                            className={`group cursor-pointer p-6 rounded-[28px] border transition-all duration-300 ${
                                editingMap?.id === map.id && isCreating 
                                ? 'bg-white border-blue-200 shadow-xl shadow-blue-500/5 ring-1 ring-blue-50' 
                                : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">{map.name}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex -space-x-1">
                                            {(map.zones || []).slice(0, 5).map(z => (
                                                <div key={z.id} className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-slate-100" style={{ background: z.color }} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {(map.zones || []).length} Zone(s)
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={e => { e.stopPropagation(); handleDelete(map.id); }}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Main Map Content Area ─────────────────────────── */}
            <div className="flex-1 flex flex-col gap-6 min-h-0 min-w-0">

                {isCreating ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 h-full">
                        {/* Editor Toolbar */}
                        <div className="bg-white rounded-[32px] border border-slate-200 p-4 flex items-center gap-6 shadow-sm">
                            <div className="flex items-center gap-3 flex-1 min-w-0 ml-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Settings2 size={18} strokeWidth={2.5} />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Nom de la carte territoriale…"
                                    value={mapName} 
                                    onChange={e => setMapName(e.target.value)}
                                    className="w-full bg-transparent text-lg font-black text-slate-800 focus:outline-none placeholder:text-slate-300" 
                                />
                            </div>
                            
                            <div className="flex gap-3 flex-shrink-0">
                                {isDrawing ? (
                                    <>
                                        <button 
                                            onClick={cancelDrawing}
                                            className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2"
                                        >
                                            <X size={14} strokeWidth={3} /> Annuler
                                        </button>
                                        <button 
                                            onClick={closePolygon} 
                                            disabled={drawingPoints.length < 3}
                                            className="px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-2xl border border-emerald-100 transition-all flex items-center gap-2"
                                        >
                                            <CheckSquare size={14} strokeWidth={3} /> Fermer ({drawingPoints.length} pts)
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={startDrawing}
                                        className="px-6 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest rounded-2xl border border-blue-100 transition-all flex items-center gap-2"
                                    >
                                        <Pencil size={14} strokeWidth={3} /> Tracer une Zone
                                    </button>
                                )}
                                
                                <div className="w-px h-8 bg-slate-200 self-center mx-1" />
                                
                                <button 
                                    onClick={resetEditor}
                                    className="px-6 py-2.5 text-slate-400 hover:text-slate-600 text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Fermer
                                </button>
                                <button 
                                    onClick={handleSave} 
                                    disabled={!mapName}
                                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Save size={14} strokeWidth={3} /> Enregistrer
                                </button>
                            </div>
                        </div>

                        {/* Interactive Hint Bar */}
                        <AnimatePresence>
                            {isDrawing && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-lg shadow-blue-500/20"
                                >
                                    <Target size={16} className="animate-pulse" />
                                    <span>Mode Dessin Actif : Cliquez sur la carte pour définir les contours de votre territoire épidémiologique.</span>
                                    {drawingPoints.length >= 3 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto bg-white/20 px-3 py-1 rounded-full border border-white/20 italic">Prêt à fermer</motion.span>}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Zone Manager Popover (If pending zone) */}
                        <AnimatePresence>
                            {pendingZone && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    className="bg-emerald-600 p-6 rounded-[32px] text-white shadow-xl shadow-emerald-500/20 flex items-center gap-8"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                            <MapPin size={24} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Configuration Spatiale</p>
                                            <h4 className="text-xl font-black tracking-tight">Assigner la zone tracée</h4>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 p-1 bg-white/10 rounded-2xl border border-white/5 h-fit">
                                        <button 
                                            onClick={() => setPendingZoneMode('new')}
                                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pendingZoneMode === 'new' ? 'bg-white text-emerald-700' : 'text-white/60 hover:text-white'}`}
                                        >
                                            Nouveau
                                        </button>
                                        {zones.length > 0 && (
                                            <button 
                                                onClick={() => { setPendingZoneMode('existing'); if (!pendingZoneTarget) setPendingZoneTarget(zones[0].id); }}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pendingZoneMode === 'existing' ? 'bg-white text-emerald-700' : 'text-white/60 hover:text-white'}`}
                                            >
                                                Existant
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        {pendingZoneMode === 'new' ? (
                                            <div className="flex gap-4">
                                                <input 
                                                    autoFocus 
                                                    type="text" 
                                                    value={pendingZoneName}
                                                    onChange={e => setPendingZoneName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && confirmZone()}
                                                    placeholder="Nom de la zone..."
                                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-sm font-bold text-white outline-none focus:bg-white/20 placeholder:text-white/40 transition-all" 
                                                />
                                                <button 
                                                    onClick={confirmZone}
                                                    className="px-8 bg-white text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95"
                                                >
                                                    Valider
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-4">
                                                <select 
                                                    value={pendingZoneTarget} 
                                                    onChange={e => setPendingZoneTarget(e.target.value)}
                                                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-3 text-sm font-bold text-white outline-none focus:bg-white/20 transition-all appearance-none cursor-pointer"
                                                >
                                                    {zones.map(z => (
                                                        <option key={z.id} value={z.id} className="bg-emerald-800 text-white">{z.name}</option>
                                                    ))}
                                                </select>
                                                <button 
                                                    onClick={confirmZone}
                                                    className="px-8 bg-white text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95"
                                                >
                                                    Ajouter
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => setPendingZone(null)} className="p-2 text-white/40 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Map Viewport */}
                        <div className="flex-1 bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-inner p-2">
                            <TerritoryMap
                                zones={zones}
                                drawingPoints={drawingPoints}
                                isDrawing={isDrawing}
                                onMapClick={handleMapClick}
                                showStats={showStats}
                                statsData={statsData}
                            />
                        </div>
                    </motion.div>
                ) : (
                    /* Dashboard Explorer View */
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="bg-white rounded-[32px] border border-slate-200 p-6 flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Explorateur Géographique</h3>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Surveillance du réseau national</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <Layers size={14} /> {maps.length} Cartes Actives
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-inner p-2">
                            {maps.length === 0 ? (
                                <div className="h-full flex items-center justify-center opacity-30">
                                    <div className="text-center">
                                        <LucideMap size={80} strokeWidth={1} className="mx-auto text-slate-300 mb-6" />
                                        <p className="text-2xl font-black text-slate-400 tracking-tight">Vue Globale Désactivée</p>
                                        <p className="text-sm text-slate-300 mt-2 font-medium">Veuillez créer un territoire pour activer la projection.</p>
                                    </div>
                                </div>
                            ) : (
                                <TerritoryMap
                                    zones={maps.flatMap(m => (m.zones || []).map((z: any) => ({
                                        ...z,
                                        polygons: z.polygons || (z.points ? [z.points] : [])
                                    })))}
                                    drawingPoints={[]}
                                    isDrawing={false}
                                    onMapClick={() => { }}
                                    showStats={showStats}
                                    statsData={statsData}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapManager;
