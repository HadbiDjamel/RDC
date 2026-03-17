import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

interface LoginPageProps {
  onLoginSuccess: (token: string, userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username,
        password
      });

      const { access, refresh } = response.data;

      // Decrypt/Decode JWT payload to get roles (simplification: fetch user info after login)
      const userResponse = await axios.get('http://localhost:8000/api/auth/me/', {
        headers: { Authorization: `Bearer ${access}` }
      });

      onLoginSuccess(access, userResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Identifiants invalides ou erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full flex items-center justify-center bg-[#020617] font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen pointer-events-none z-0" style={{ backgroundImage: 'url("/spatial_medical_bg.png")' }} />
      <div className="absolute inset-0 bg-gradient-to-radial from-transparent via-slate-950/80 to-[#020617] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card p-10 w-full max-w-md relative z-10 border border-white/10 shadow-[0_0_100px_rgba(30,58,138,0.3)]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter decoration-sky-500 decoration-4">
            DZ<span className="text-sky-400">CANCER</span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Platforme de Sécurité Épidémiologique</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-slate-500 ml-1">Utilisateur</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:bg-slate-900 transition-all text-sm"
                placeholder="Identifiant administratif"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black text-slate-500 ml-1">Mot de Passe</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-sky-400 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:bg-slate-900 transition-all text-sm"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs font-bold"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Authentification en cours...
              </>
            ) : (
              'Connecter'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-2">
          <p className="text-[9px] text-slate-600 font-medium">Algérie @ 2024 - Registre National du Cancer</p>
          <div className="flex gap-4 opacity-30 grayscale contrast-150">
            <Activity size={16} className="text-white" />
            <Activity size={16} className="text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
