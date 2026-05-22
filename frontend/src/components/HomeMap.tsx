import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ChevronRight, Shield, Users, BarChart3, type LucideIcon } from 'lucide-react';

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

const sectionColors: Record<string, { accent: string; bg: string; border: string; icon: string }> = {
    '📊 Analytiques': { accent: '#3b82f6', bg: '#eff6ff', border: '#dbeafe', icon: '#2563eb' },
    '🏥 Dossiers Patients': { accent: '#10b981', bg: '#ecfdf5', border: '#d1fae5', icon: '#059669' },
    '⚙️ Administration': { accent: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: '#475569' },
    '🔬 Pathologie': { accent: '#8b5cf6', bg: '#f5f3ff', border: '#ede9fe', icon: '#7c3aed' },
    '🧪 Laboratoire': { accent: '#f59e0b', bg: '#fffbeb', border: '#fef3c7', icon: '#d97706' },
};

const defaultColor = { accent: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: '#475569' };

const quickStats = [
    { label: 'Dossiers Enregistrés', value: '12,847', icon: Users, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Analyses ce Mois', value: '342', icon: BarChart3, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Taux de Complétude', value: '94.2%', icon: Shield, color: '#64748b', bg: '#f1f5f9' },
];

const HomeMap: React.FC<HomeMapProps> = ({ nav, onNavigate }) => {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar" style={{ backgroundColor: 'var(--bg-main)' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 2.5rem 2.5rem' }}>

                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                        borderRadius: 'var(--radius)',
                        padding: '2rem 2.5rem',
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Subtle pattern */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`,
                        backgroundSize: '24px 24px',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                            <div style={{
                                width: 44, height: 44,
                                background: 'rgba(255,255,255,0.12)',
                                borderRadius: 8,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }}>
                                <Activity size={22} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                    Tableau de Bord Principal
                                </h1>
                                <p style={{ fontSize: '0.8125rem', opacity: 0.65, fontWeight: 500, marginTop: 2 }}>
                                    Registre National du Cancer — Accès rapide aux modules
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats in Banner */}
                    <div style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
                        {quickStats.map((stat, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 6,
                                padding: '12px 20px',
                                minWidth: 150,
                                backdropFilter: 'blur(8px)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <stat.icon size={14} style={{ opacity: 0.6 }} />
                                    <span style={{ fontSize: '0.6875rem', opacity: 0.6, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>
                                        {stat.label}
                                    </span>
                                </div>
                                <p style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Navigation Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {nav.map((section, sectionIdx) => {
                        const colorSet = sectionColors[section.category] || defaultColor;

                        return (
                            <motion.div
                                key={section.category}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: 0.1 + sectionIdx * 0.06 }}
                            >
                                {/* Section Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 10,
                                    paddingBottom: 8,
                                    borderBottom: `2px solid ${colorSet.border}`,
                                }}>
                                    <span style={{ fontSize: '0.8125rem' }}>{section.category.split(' ')[0]}</span>
                                    <h2 style={{
                                        fontSize: '0.8125rem',
                                        fontWeight: 700,
                                        color: colorSet.accent,
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase' as const,
                                    }}>
                                        {section.category.split(' ').slice(1).join(' ')}
                                    </h2>
                                </div>

                                {/* Cards Grid — wider cards, 3 columns */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${Math.min(section.items.length, 3)}, 1fr)`,
                                    gap: 14,
                                }}>
                                    {section.items.map((item, idx) => {
                                        const isFormTab = ['anapath-form', 'labo-form', 'admin-form'].includes(item.id);
                                        const Icon = item.icon;

                                        return (
                                            <motion.button
                                                key={item.id}
                                                onClick={() => onNavigate(item.id, isFormTab)}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: 0.12 + sectionIdx * 0.06 + idx * 0.03 }}
                                                whileHover={{ y: -2, boxShadow: '0 6px 20px -4px rgba(0,0,0,0.12)' }}
                                                whileTap={{ scale: 0.985 }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 14,
                                                    padding: '18px 22px',
                                                    background: 'white',
                                                    border: `1px solid ${colorSet.border}`,
                                                    borderLeft: `3px solid ${colorSet.accent}`,
                                                    borderRadius: 'var(--radius)',
                                                    cursor: 'pointer',
                                                    textAlign: 'left' as const,
                                                    boxShadow: 'var(--shadow-sm)',
                                                    transition: 'all 0.15s ease',
                                                    width: '100%',
                                                }}
                                                className="group"
                                            >
                                                <div style={{
                                                    width: 44, height: 44,
                                                    borderRadius: 'var(--radius)',
                                                    background: colorSet.bg,
                                                    border: `1px solid ${colorSet.border}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: colorSet.icon,
                                                    flexShrink: 0,
                                                }}>
                                                    <Icon size={20} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{
                                                        fontSize: '0.875rem',
                                                        fontWeight: 600,
                                                        color: 'var(--text-main)',
                                                        lineHeight: 1.3,
                                                    }}>
                                                        {item.label}
                                                    </p>
                                                    <p style={{
                                                        fontSize: '0.6875rem',
                                                        color: 'var(--text-muted)',
                                                        marginTop: 2,
                                                    }}>
                                                        {section.category.split(' ').slice(1).join(' ')}
                                                    </p>
                                                </div>
                                                <ChevronRight
                                                    size={16}
                                                    style={{
                                                        color: '#c1cad6',
                                                        flexShrink: 0,
                                                        transition: 'color 0.15s ease, transform 0.15s ease',
                                                    }}
                                                    className="group-hover:translate-x-0.5"
                                                />
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: 32,
                    paddingTop: 16,
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Registre National du Cancer — République Algérienne Démocratique et Populaire
                    </p>
                    <p style={{ fontSize: '0.625rem', color: '#b0b8c4', fontWeight: 500 }}>
                        v2.0 — 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HomeMap;
