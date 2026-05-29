import React, { useState, useEffect, type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserPlus, Settings, Terminal,
  Brain, Activity, Microscope,
  FlaskConical, ClipboardCheck, ListChecks,
  BarChart3, Copy, Book, X, QrCode, Map as LucideMap, Database, type LucideIcon
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
import MapManager from './components/MapManager';
import LoginPage from './components/LoginPage';
import HabitQuestionnairePage from './components/HabitQuestionnairePage';
import QuestionnaireQR from './components/QuestionnaireQR';
import DataImport from './components/DataImport';
import UserManagement from './components/UserManagement';
import SettingsPage from './components/SettingsPage';
import axios from 'axios';
import './index.css';

// IMPORTANT: dzcancer_server_ip is only used for QR code URL generation (what the phone scans).
// The doctor's browser API calls must ALWAYS go through the Docker nginx reverse proxy (/api/)
// so they hit the Docker backend (PostgreSQL). Never point the doctor's own browser at the
// host IP:8000 (that would hit the host SQLite Django, creating a split-brain where tokens
// created by the doctor don't exist in the Docker database the phone queries).
const isTauri = window.location.protocol === 'tauri:' || window.location.href.startsWith('tauri:');
if (isTauri) {
    const configuredIp = localStorage.getItem('dzcancer_server_ip');
    axios.defaults.baseURL = configuredIp
        ? `http://${configuredIp}:8000/api/`
        : 'http://localhost:8000/api/';
} else {
    // Browser
    const isVercel = window.location.hostname.endsWith('.vercel.app');
    axios.defaults.baseURL = isVercel
        ? 'https://registre-cancer-backend.onrender.com/api/'
        : '/api/';
}

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
  admin: { name: 'Registraire', initials: 'RG', fullName: 'Mme. Bouzid', color: 'slate', accent: 'bg-slate-700' },
  medecin: { name: 'Médecin', initials: 'DA', fullName: 'Dr. Ahmed', color: 'blue', accent: 'bg-blue-600' },
  anapate: { name: 'Anapath', initials: 'PB', fullName: 'Pr. Belkacem', color: 'emerald', accent: 'bg-emerald-600' },
  labo: { name: 'Laboratoire', initials: 'LM', fullName: 'Dr. Mansouri', color: 'amber', accent: 'bg-amber-600' },
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
        { id: 'duplicates', icon: Copy, label: 'Vue Consolidation' },
        { id: 'import', icon: Database, label: 'Importation de Données' }
      ]
    },
    {
      category: '⚙️ Administration',
      items: [
        { id: 'studio', icon: Settings, label: 'System Studio' },
        { id: 'maps', icon: LucideMap, label: 'Gestion des Territoires' },
        { id: 'users', icon: UserPlus, label: 'Gestion des Comptes' },
        { id: 'settings', icon: Settings, label: 'Paramètres' }
      ]
    }
  ],
};



// ── Queue Component (shared for Anapath + Labo + Admin) ──────────
const QueueView: FC<{ role: Role; onAction: (patient: any) => void }> = ({ role, onAction }) => {
  const items = [
    { id: 1, name: 'BOUDIAF Mohammed', nid: '175312009231456789', topo: 'C34.1', status: 'urgent', date: '15/03/2026' },
    { id: 2, name: 'BELAIDI Fatma', nid: '282415001234567890', topo: 'C50.9', status: 'normal', date: '18/03/2026' },
    { id: 3, name: 'KACEMI Yacine', nid: '194216008765432109', topo: 'C18.9', status: 'normal', date: '20/03/2026' },
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
        <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="portal-card p-4 flex items-center gap-3 bg-white shadow-sm border border-slate-200">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100"><ListChecks size={18} /></div>
          <div><p className="text-xl font-black text-slate-800">{items.length}</p><p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">En attente</p></div>
        </div>
        <div className="portal-card p-4 flex items-center gap-3 bg-white shadow-sm border border-slate-200">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100"><Activity size={18} /></div>
          <div><p className="text-xl font-black text-slate-800">1</p><p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Urgent</p></div>
        </div>
        <div className="portal-card p-4 flex items-center gap-3 bg-white shadow-sm border border-slate-200">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100"><ClipboardCheck size={18} /></div>
          <div><p className="text-xl font-black text-slate-800">12</p><p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Traités aujourd'hui</p></div>
        </div>
      </div>
      <div className="portal-card overflow-hidden bg-white shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[9px] uppercase tracking-widest font-black text-slate-500 border-b border-slate-100">
              <th className="px-5 py-4">Patient</th><th className="px-5 py-4">NID</th>
              <th className="px-5 py-4">Topographie</th><th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Priorité</th><th className="px-5 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map(it => (
              <tr key={it.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-5 py-3.5 text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase">{it.name}</td>
                <td className="px-5 py-3.5 text-[10px] font-mono font-bold text-slate-400">{it.nid}</td>
                <td className="px-5 py-3.5 text-xs font-mono font-black text-blue-600">{it.topo}</td>
                <td className="px-5 py-3.5 text-[10px] text-slate-500 font-bold">{it.date}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${it.status === 'urgent' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                    'bg-blue-50 text-blue-600 border border-blue-200'}`}>{it.status === 'urgent' ? 'Urgent' : 'Normal'}</span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <button onClick={() => onAction(it)} className="px-4 py-1.5 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white text-[10px] font-black rounded-lg transition-all border border-slate-200 uppercase tracking-widest active:scale-95">
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
      psa: '4.5', labo_date: '10/03/2026'
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
      case 'maps': return <MapManager />;
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
      case 'import': return <DataImport />;
      case 'users': return <UserManagement />;
      case 'settings': return <SettingsPage />;
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
    <div className="relative h-screen w-full bg-[#f1f4f8] text-slate-900 overflow-hidden font-sans">

      {/* Professional Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 h-16 flex justify-between items-center px-8 z-40 shadow-sm">
        {/* Left side: Logo & Branding */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('home'); setEditingPatient(null); }}>
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Activity size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight tracking-tight">Registre National du Cancer</h1>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-[0.15em]">République Algérienne Démocratique et Populaire</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 ml-8">
            <button 
              onClick={() => { setActiveTab('home'); setEditingPatient(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'home' ? 'bg-[#e8f1fa] text-[#1d6fb5] font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Accueil
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#e8f1fa] text-[#1d6fb5] font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Tableau de Bord
            </button>
            {role === 'admin' && (
              <>
                <button 
                  onClick={() => { setActiveTab('users'); setEditingPatient(null); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-[#e8f1fa] text-[#1d6fb5] font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  Gestion des Comptes
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setEditingPatient(null); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#e8f1fa] text-[#1d6fb5] font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  ⚙️ Paramètres
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right side: Utilities & Profil */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button onClick={() => { setShowLexiqueDrawer(!showLexiqueDrawer); setShowMiaDrawer(false); }}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-semibold ${showLexiqueDrawer ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>
              <Book size={16} /> Lexique
            </button>
            <button onClick={() => { setShowMiaDrawer(!showMiaDrawer); setShowLexiqueDrawer(false); }}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-xs font-semibold ${showMiaDrawer ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}>
              <Brain size={16} /> Assistant I.A.
            </button>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">
                {user?.is_staff ? 'Administrateur' : meta.name}
              </p>
              <p className="text-[10px] text-slate-500">{user ? `${user.first_name} ${user.last_name}` : meta.fullName}</p>
            </div>
            
            <div className="relative group">
               <div className={`w-9 h-9 rounded-full ${meta.accent} text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white`}>
                {meta.initials}
              </div>
            </div>

            <button onClick={handleLogout} title="Déconnexion" className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="h-screen pt-16 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div 
              key="home-map" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }} 
              className="flex-1 overflow-hidden"
            >
              <HomeMap nav={nav} onNavigate={handleNavigate} />
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-4"
            >
              <div className="max-w-7xl mx-auto pb-20">
                {renderContent()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Floating Drawers */}
      <AnimatePresence>
        {showLexiqueDrawer && (
          <motion.div
            initial={{ x: 450 }} animate={{ x: 0 }} exit={{ x: 450 }} transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 w-[450px] h-screen bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Book size={20} className="text-blue-600" /> Référentiel Médical</h3>
              <button onClick={() => setShowLexiqueDrawer(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-6 bg-white">
              <MedicalReference />
            </div>
          </motion.div>
        )}

        {showMiaDrawer && (
          <motion.div
            initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 w-[500px] h-screen bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><Brain size={20} className="text-indigo-600" /> Assistant Intelligence Artificielle</h3>
              <button onClick={() => setShowMiaDrawer(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-50">
              <MiaChat isDrawer={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showQR && editingPatient && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <QuestionnaireQR 
            patientId={editingPatient.id} 
            patientName={`${editingPatient.last_name} ${editingPatient.first_name}`}
            onClose={() => setShowQR(false)} 
          />
        </div>
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
