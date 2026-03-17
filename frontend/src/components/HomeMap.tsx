import React from 'react';
import { motion } from 'framer-motion';
import { Activity, type LucideIcon } from 'lucide-react';

interface NavItem {
    id: string; icon: LucideIcon; label: string;
}

interface NavSection {
    category: string;
    items: NavItem[];
}

interface HomeMapProps {
    nav: NavSection[];
    onNavigate: (id: string, isFormTab: boolean) => void;
}

// Generate organic floating shapes properties
const blobAnimations = [
    { borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"] },
    { borderRadius: ["50% 50% 40% 60% / 40% 60% 50% 50%", "40% 60% 60% 40% / 60% 40% 40% 60%", "50% 50% 40% 60% / 40% 60% 50% 50%"] },
    { borderRadius: ["30% 70% 50% 50% / 50% 50% 70% 30%", "70% 30% 50% 50% / 50% 50% 30% 70%", "30% 70% 50% 50% / 50% 50% 70% 30%"] },
    { borderRadius: ["60% 40% 50% 50% / 50% 50% 40% 60%", "40% 60% 50% 50% / 50% 50% 60% 40%", "60% 40% 50% 50% / 50% 50% 40% 60%"] },
];

const colors = [
    'from-sky-500/80 to-indigo-600/80',
    'from-emerald-500/80 to-teal-600/80',
    'from-violet-500/80 to-fuchsia-600/80',
    'from-rose-500/80 to-orange-600/80',
    'from-amber-500/80 to-yellow-600/80',
    'from-blue-500/80 to-cyan-600/80',
];

// Positioning clusters on the map based on total items
const getPositions = (totalItems: number) => {
    const positions = [];
    const radiusX = 30; // vw distance from center
    const radiusY = 25; // vh distance from center
    for (let i = 0; i < totalItems; i++) {
        const angle = (i / totalItems) * Math.PI * 2;
        // Adding slight offset to spread them dynamically
        const jx = (Math.sin(i * 4.5) * 5);
        const jy = (Math.cos(i * 3.2) * 5);
        positions.push({
            left: `calc(50% + ${Math.cos(angle) * (radiusX + jx)}vw - 80px)`,
            top: `calc(50% + ${Math.sin(angle) * (radiusY + jy)}vh - 80px)`
        });
    }
    return positions;
};

const HomeMap: React.FC<HomeMapProps> = ({ nav, onNavigate }) => {
    // Flatten all items
    const allItems = nav.flatMap(section => section.items.map(item => ({ ...item, category: section.category })));
    const positions = getPositions(allItems.length);

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans">
            {/* Central Core */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 backdrop-blur-xl border border-sky-400/20 flex flex-col items-center justify-center shadow-[0_0_120px_rgba(56,189,248,0.15)] z-0 pointer-events-none"
                animate={blobAnimations[0]}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
                <div className="text-center">
                    <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-sky-400">
                        <Activity size={24} />
                    </div>
                    <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">DZ Cancer</h2>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 mt-1 font-bold">Noyau Central</p>
                </div>
            </motion.div>

            {/* Orbiting Spatial Portals */}
            <div className="absolute inset-0 z-10 p-20">
                {allItems.map((item, idx) => {
                    const pos = positions[idx];
                    const anim = blobAnimations[idx % blobAnimations.length];
                    const color = colors[idx % colors.length];
                    const isFormTab = ['anapath-form', 'labo-form', 'admin-form'].includes(item.id);

                    return (
                        <motion.button
                            key={item.id}
                            className={`absolute flex flex-col items-center justify-center w-44 h-44 bg-gradient-to-br ${color} backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.4)] group overflow-hidden focus:outline-none focus:ring-4 focus:ring-white/20`}
                            style={{ left: pos.left, top: pos.top }}
                            animate={{
                                borderRadius: anim.borderRadius,
                                y: [0, -15, 0],
                                rotate: [0, 2, -2, 0]
                            }}
                            transition={{
                                borderRadius: { duration: 12 + Math.random() * 5, repeat: Infinity, ease: "linear" },
                                y: { duration: 5 + Math.random() * 3, repeat: Infinity, ease: "easeInOut" },
                                rotate: { duration: 8 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                            whileHover={{ scale: 1.15, filter: 'brightness(1.2)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onNavigate(item.id, isFormTab)}
                        >
                            {/* Inner glow effect */}
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" style={{ borderRadius: 'inherit' }} />

                            <motion.div
                                className="relative z-10 flex flex-col items-center gap-3 text-white"
                                initial={{ opacity: 0.9 }}
                                whileHover={{ opacity: 1, y: -4 }}
                            >
                                <div className="p-3 bg-white/20 rounded-full shadow-inner backdrop-blur-md border border-white/10 group-hover:bg-white/30 transition-colors">
                                    <item.icon size={32} className="drop-shadow-lg" />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/80 mb-1">{item.category}</p>
                                    <p className="text-sm font-black leading-tight drop-shadow-md tracking-wide">{item.label}</p>
                                </div>
                            </motion.div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default HomeMap;
