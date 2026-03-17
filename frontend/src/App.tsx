import React, { useState, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserPlus, Settings, Terminal,
  Brain, Activity, Microscope,
  FlaskConical, ClipboardCheck, ListChecks,
  BarChart3, Copy, Book, X, QrCode, type LucideIcon
} from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PatientList from './components/PatientList';
import AnalysisDashboard from './components/AnalysisDashboard';
import DynamicStats from './components/DynamicStats';
import AnapathTerminal from './components/AnapathTerminal';
import MiaChat from './components/MiaChat';
import OcrPipeline from './components/OcrPipeline';
import SystemStudio from './components/SystemStudio';
import SmartEntry from './components/SmartEntry';
import ConsolidationView from './components/ConsolidationView';
import MedicalReference from './components/MedicalReference';
import HomeMap from './components/HomeMap';
import LoginPage from './components/LoginPage';
import HabitQuestionnairePage from './components/HabitQuestionnairePage';
import QuestionnaireQR from './components/QuestionnaireQR';
import axios from 'axios';
import './index.css';

axios.defaults.baseURL = 'http://localhost:8000/api/';

// Configurer axios pour inclure le token s'il existe
const token = localStorage.getItem('dzcancer_token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ── Types ────────────────────────────────────────────────────────
type Role = 'admin' | 'medecin' | 'anapate' | 'labo';

interface NavItem {
  id: string; icon: LucideIcon; label: string;
}

interface NavSection {
  category: string;
  items: NavItem[];
}

// ── Role Configs ─────────────────────────────────────────────────
const ROLE_META: Record<Role, { name: string; initials: string; fullName: string; color: string; accent: string }> = {
  admin: { name: 'Registraire', initials: 'RG', fullName: 'Mme. Bouzid', color: 'violet', accent: 'bg-violet-500' },
  medecin: { name: 'Médecin', initials: 'DA', fullName: 'Dr. Ahmed', color: 'sky', accent: 'bg-sky-500' },
  anapate: { name: 'Anapath', initials: 'PB', fullName: 'Pr. Belkacem', color: 'emerald', accent: 'bg-emerald-500' },
  labo: { name: 'Laboratoire', initials: 'LM', fullName: 'Dr. Mansouri', color: 'amber', accent: 'bg-amber-500' },
};

const ROLE_NAV: Record<Role, NavSection[]> = {
  medecin: [
    {
      category: '📊 Analytiques',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' }
      ]
    },
    {
      category: '🏥 Dossiers Patients',
      items: [
        { id: 'my-patients', icon: Users, label: 'Mes Patients' },
        { id: 'new-patient', icon: UserPlus, label: 'Nouveau Patient' }
      ]
    }
  ],
  anapate: [
    {
      category: '🔬 Pathologie',
      items: [
        { id: 'queue-anapath', icon: ListChecks, label: 'File d\'Attente' },
        { id: 'coding', icon: Terminal, label: 'Codage CIM-O-3' },
        { id: 'anapath-form', icon: Microscope, label: 'Saisie Pathologie' }
      ]
    }
  ],
  labo: [
    {
      category: '🧪 Laboratoire',
      items: [
        { id: 'queue-labo', icon: ListChecks, label: 'Examens en Attente' },
        { id: 'labo-form', icon: FlaskConical, label: 'Saisie Résultats' }
      ]
    }
  ],
  admin: [
    {
      category: '📊 Analytiques',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
        { id: 'dynamic-stats', icon: BarChart3, label: 'Statistiques Avancées' }
      ]
    },
    {
      category: '🏥 Dossiers Patients',
      items: [
        { id: 'all-patients', icon: Users, label: 'Annuaire Patients' },
        { id: 'duplicates', icon: Copy, label: 'Vue Consolidation' }
      ]
    },
    {
      category: '⚙️ Administration',
      items: [
        { id: 'studio', icon: Settings, label: 'System Studio' }
      ]
    }
  ],
};



// ── Queue Component (shared for Anapath + Labo + Admin) ──────────
const QueueView: FC<{ role: Role; onAction: (patient: any) => void }> = ({ role, onAction }) => {
  const items = [
    { id: 1, name: 'BOUDIAF Mohammed', nid: '175312009231456789', topo: 'C34.1', status: 'urgent', date: '15/03/2024' },
    { id: 2, name: 'BELAIDI Fatma', nid: '282415001234567890', topo: 'C50.9', status: 'normal', date: '18/03/2024' },
    { id: 3, name: 'KACEMI Yacine', nid: '194216008765432109', topo: 'C18.9', status: 'normal', date: '20/03/2024' },
  ];
  const title = role === 'anapate' ? 'Patients en Attente de Codage Pathologique' :
    role === 'labo' ? 'Examens de Laboratoire en Attente' :
      'Dossiers en Attente de Validation IARC';
  const subtitle = role === 'anapate' ? 'Ces patients ont été enregistrés par un médecin et nécessitent un codage CIM-O-3' :
    role === 'labo' ? 'Résultats de marqueurs tumoraux et analyses à saisir' :
      'Dossiers complétés par le médecin et l\'anapath, en attente de validation finale';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><ListChecks size={18} /></div>
          <div><p className="text-xl font-black text-white">{items.length}</p><p className="text-[9px] text-slate-500 uppercase font-bold">En attente</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400"><Activity size={18} /></div>
          <div><p className="text-xl font-black text-white">1</p><p className="text-[9px] text-slate-500 uppercase font-bold">Urgent</p></div>
        </div>
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><ClipboardCheck size={18} /></div>
          <div><p className="text-xl font-black text-white">12</p><p className="text-[9px] text-slate-500 uppercase font-bold">Traités aujourd'hui</p></div>
        </div>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[9px] uppercase tracking-widest font-black text-slate-500">
              <th className="px-5 py-3">Patient</th><th className="px-5 py-3">NID</th>
              <th className="px-5 py-3">Topographie</th><th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Priorité</th><th className="px-5 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map(it => (
              <tr key={it.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="px-5 py-3.5 text-sm font-bold text-white">{it.name}</td>
                <td className="px-5 py-3.5 text-[10px] font-mono text-slate-400">{it.nid}</td>
                <td className="px-5 py-3.5 text-xs font-mono text-sky-400">{it.topo}</td>
                <td className="px-5 py-3.5 text-[10px] text-slate-400">{it.date}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${it.status === 'urgent' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-sky-500/10 text-sky-400 border border-sky-500/20'}`}>{it.status === 'urgent' ? 'Urgent' : 'Normal'}</span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <button onClick={() => onAction(it)} className="px-4 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[10px] font-bold rounded-lg transition-all">
                    {role === 'anapate' ? 'Coder' : role === 'labo' ? 'Saisir' : 'Valider'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main App ─────────────────────────────────────────────────────
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [role, setRole] = useState<Role>('admin');
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('dzcancer_token'));
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);

  // Global Drawers State
  const [showMiaDrawer, setShowMiaDrawer] = useState(false);
  const [showLexiqueDrawer, setShowLexiqueDrawer] = useState(false);

  const meta = ROLE_META[role];
  const nav = ROLE_NAV[role];

  // Reset tab when role changes
  useEffect(() => {
    setActiveTab('home');
    setEditingPatient(null);
  }, [role]);

  // Load user info on mount if authenticated
  useEffect(() => {
    const loadUser = async () => {
        if (isAuthenticated) {
            try {
                const res = await axios.get('auth/me/');
                setUser(res.data);
                const roleMap: Record<string, Role> = { 'admin': 'admin', 'doctor': 'medecin', 'anapath': 'anapate', 'lab': 'labo' };
                const rawRole = res.data.profile?.role?.toLowerCase() || 'admin';
                const backendRole = roleMap[rawRole] || 'admin';
                setRole(backendRole);
            } catch (err) {
                console.error("Session expired or invalid");
                handleLogout();
            }
        }
    };
    loadUser();
  }, [isAuthenticated]);

  const handleLoginSuccess = (token: string, userData: any) => {
    localStorage.setItem('dzcancer_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
    const roleMap: Record<string, Role> = { 'admin': 'admin', 'doctor': 'medecin', 'anapath': 'anapate', 'lab': 'labo' };
    const rawRole = userData.profile?.role?.toLowerCase() || 'admin';
    const backendRole = roleMap[rawRole] || 'admin';
    setRole(backendRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('dzcancer_token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleQueueAction = (patient: any) => {
    // Mock loading full patient data for the form
    const loadedPatient = {
      nid: patient.nid,
      last_name: patient.name.split(' ')[0],
      first_name: patient.name.split(' ')[1] || '',
      topo_code: patient.topo,
      gender: '1',
      clinical_stage: 'IIB',
      clinical_t: 'cT2', clinical_n: 'cN1', clinical_m: 'cM0',
      psa: '4.5', labo_date: '10/03/2024'
    };
    setEditingPatient(loadedPatient);

    if (role === 'anapate') setActiveTab('anapath-form');
    else if (role === 'labo') setActiveTab('labo-form');
    else if (role === 'admin') setActiveTab('admin-form');
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      // Shared
      case 'dashboard': return <AnalysisDashboard />;
      case 'dynamic-stats': return <DynamicStats />;
      case 'mia': return <MiaChat />;
      case 'studio': return <SystemStudio />;
      case 'ocr': return <OcrPipeline />;

      // Médecin
      case 'my-patients': return <PatientList />;
      case 'new-patient': return <SmartEntry role="medecin" />;

      // Anapath
      case 'queue-anapath': return <QueueView role="anapate" onAction={handleQueueAction} />;
      case 'coding': return <AnapathTerminal />;
      case 'anapath-form':
        return editingPatient ? <SmartEntry role="anapate" initialData={editingPatient} /> : <QueueView role="anapate" onAction={handleQueueAction} />;

      // Labo
      case 'queue-labo': return <QueueView role="labo" onAction={handleQueueAction} />;
      case 'labo-form':
        return editingPatient ? <SmartEntry role="labo" initialData={editingPatient} /> : <QueueView role="labo" onAction={handleQueueAction} />;

      // Admin Exclusives
      case 'all-patients': return <PatientList />;
      case 'admin-form':
        return editingPatient ? <SmartEntry role="admin" initialData={editingPatient} /> : <PatientList />;
      case 'duplicates': return <ConsolidationView />;
      default: return <AnalysisDashboard />;
    }
  };

  const handleNavigate = (id: string, isFormTab: boolean) => {
    if (isFormTab && !editingPatient) {
      const queueMap: Record<string, string> = {
        'anapath-form': 'queue-anapath',
        'labo-form': 'queue-labo',
        'admin-form': 'all-patients'
      };
      setActiveTab(queueMap[id] || id);
    } else {
      setActiveTab(id);
    }
  };

  return (
    <div className="relative h-screen w-full bg-[#020617] text-slate-200 overflow-hidden font-sans">

      {/* Global Spatial Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen pointer-events-none z-0" style={{ backgroundImage: 'url("/spatial_medical_bg.png")' }} />
      <div className="absolute inset-0 bg-gradient-to-radial from-transparent via-slate-950/80 to-[#020617] pointer-events-none z-0" />

      {/* Floating Top Navigation Bar */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-40">
        {/* Left side: Back to Home */}
        <div className="pointer-events-auto flex items-center gap-4">
          {activeTab !== 'home' ? (
            <button onClick={() => { setActiveTab('home'); setEditingPatient(null); }}
              className="flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-2xl border border-white/10 rounded-2xl text-white font-bold transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Activity size={20} className="text-sky-400" />
              <span className="tracking-wide">Retour à la Base</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-6 py-3 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-2xl shadow-xl">
              <Activity size={20} className={`text-${meta.color}-400`} />
              <div>
                <p className="text-xs font-black text-white">{meta.name}</p>
                <p className="text-[9px] uppercase tracking-widest text-slate-400">Station Active</p>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Utilities & Profil */}
        <div className="flex gap-4 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-2 rounded-2xl shadow-xl">
            <button onClick={() => { setShowLexiqueDrawer(!showLexiqueDrawer); setShowMiaDrawer(false); }}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${showLexiqueDrawer ? 'bg-sky-500/20 text-sky-400' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Book size={18} /> Lexique
            </button>
            <button onClick={() => { setShowMiaDrawer(!showMiaDrawer); setShowLexiqueDrawer(false); }}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 text-sm font-bold ${showMiaDrawer ? 'bg-violet-500/20 text-violet-400' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Brain size={18} /> M.I.A.
            </button>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-2 pr-6 rounded-2xl shadow-xl">
            <div className={`w-10 h-10 rounded-xl bg-${meta.color}-500/20 text-${meta.color}-400 flex items-center justify-center font-black text-sm`}>
              {meta.initials}
            </div>
            <div>
              <p className="bg-transparent text-sm font-bold text-white outline-none">
                {user?.is_staff ? 'Registraire (Admin)' : meta.name}
              </p>
              <p className="text-[10px] text-slate-400">{user ? `${user.first_name} ${user.last_name}` : meta.fullName}</p>
            </div>

            {editingPatient && (
               <button 
                onClick={() => setShowQR(true)}
                title="Générer QR Questionnaire"
                className="ml-4 p-2 text-sky-400/50 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-all"
               >
                 <QrCode size={16} strokeWidth={3} />
               </button>
            )}

            <button onClick={handleLogout} title="Déconnexion" className="ml-4 p-2 text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'home' ? (
          <motion.div key="home-map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4 }} className="absolute inset-0 z-10">
            <HomeMap nav={nav} onNavigate={handleNavigate} />
          </motion.div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            className="absolute inset-0 pt-28 pb-10 px-10 overflow-y-auto custom-scrollbar z-10">
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Floating Drawers */}
      <AnimatePresence>
        {showLexiqueDrawer && (
          <motion.div
            initial={{ x: 450, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 450, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-[450px] h-screen bg-slate-900/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 border-l border-white/10 flex flex-col"
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
              <h3 className="font-black text-white flex items-center gap-2"><Book size={18} className="text-sky-400" /> Référentiel Médical</h3>
              <button onClick={() => setShowLexiqueDrawer(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <MedicalReference />
            </div>
          </motion.div>
        )}

        {showMiaDrawer && (
          <motion.div
            initial={{ x: 500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 500, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-[500px] h-screen bg-slate-900/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 border-l border-white/10 flex flex-col"
          >
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
              <h3 className="font-black text-white flex items-center gap-2"><Brain size={18} className="text-violet-400" /> Intelligence Assistant</h3>
              <button onClick={() => setShowMiaDrawer(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MiaChat isDrawer={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showQR && editingPatient && (
        <QuestionnaireQR 
          patientId={editingPatient.id} 
          patientName={`${editingPatient.last_name} ${editingPatient.first_name}`}
          onClose={() => setShowQR(false)} 
        />
      )}
    </div>
  );
};

const Root: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/habit/:token" element={<HabitQuestionnairePage />} />
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
