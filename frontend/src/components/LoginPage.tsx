import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, User, Lock, AlertCircle, Loader2, Settings } from 'lucide-react';
import axios from 'axios';

interface LoginPageProps {
  onLoginSuccess: (token: string, userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [serverIp, setServerIp] = useState(localStorage.getItem('dzcancer_server_ip') || '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('auth/login/', {
        username,
        password
      });

      const { access, refresh } = response.data;

      // Decrypt/Decode JWT payload to get roles (simplification: fetch user info after login)
      const userResponse = await axios.get('auth/me/', {
        headers: { Authorization: `Bearer ${access}` }
      });

      onLoginSuccess(access, userResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Identifiants invalides ou erreur serveur.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveServerIp = () => {
    const cleanedIp = serverIp.trim();
    if (cleanedIp === '') {
      localStorage.removeItem('dzcancer_server_ip');
    } else {
      localStorage.setItem('dzcancer_server_ip', cleanedIp);
    }
    
    // Update Axios baseURL: only use IP when running as Tauri desktop app.
    // In browser (Docker nginx), always use relative /api/ to hit Docker backend.
    const isTauri = window.location.protocol === 'tauri:' || window.location.href.startsWith('tauri:');
    if (isTauri) {
      axios.defaults.baseURL = cleanedIp
        ? `http://${cleanedIp}:8000/api/`
        : 'http://localhost:8000/api/';
    } else {
      const isVercel = window.location.hostname.endsWith('.vercel.app');
      axios.defaults.baseURL = isVercel
        ? 'https://registre-cancer-backend.onrender.com/api/'
        : '/api/';
    }
    setShowSettings(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: '2rem',
    }}>
      {/* Subtle pattern overlay */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 50px -12px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Top accent bar */}
        <div style={{
          height: 4,
          background: 'linear-gradient(to right, #2563eb, #10b981, #2563eb)',
        }} />

        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#9aa8b8',
            cursor: 'pointer',
            padding: 6,
            borderRadius: 6,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#1e3a5f';
            (e.currentTarget as HTMLElement).style.background = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#9aa8b8';
            (e.currentTarget as HTMLElement).style.background = 'none';
          }}
        >
          <Settings size={18} />
        </button>

        <div style={{ padding: '2.5rem 2rem 2rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 56, height: 56,
              background: '#334155',
              borderRadius: 8,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: 16,
              boxShadow: '0 4px 12px rgba(51,65,85,0.2)',
            }}>
              <ShieldCheck size={28} strokeWidth={2} />
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#1e293b',
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}>
              Registre National du Cancer
            </h1>
            <p style={{
              fontSize: '0.75rem',
              color: '#7c8a9a',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase' as const,
            }}>
              Portail d'Authentification Sécurisé
            </p>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{
                  overflow: 'hidden',
                  background: '#f8fafc',
                  borderRadius: 8,
                  padding: '1rem',
                  border: '1px solid #e2e8f0',
                  marginBottom: '1.5rem',
                }}
              >
                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Configuration Réseau
                </h3>
                <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 12 }}>
                  Saisissez l'adresse IP du serveur central pour vous y connecter depuis ce PC. (Ex: 192.168.1.100)
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={serverIp}
                    onChange={(e) => setServerIp(e.target.value)}
                    placeholder="localhost ou IP (ex: 192.168.1.5)"
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: 6,
                      fontSize: '0.8125rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={saveServerIp}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                    }}
                  >
                    OK
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#4a5568',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                marginBottom: 6,
              }}>
                Identifiant
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: '#9aa8b8', pointerEvents: 'none',
                }}>
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Nom d'utilisateur"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    border: '1px solid #d5dce6',
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    color: '#1a2332',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    background: '#f8fafc',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1d6fb5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(29,111,181,0.1)';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d5dce6';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: '#4a5568',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                marginBottom: 6,
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: '#9aa8b8', pointerEvents: 'none',
                }}>
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    border: '1px solid #d5dce6',
                    borderRadius: 6,
                    fontSize: '0.875rem',
                    color: '#1a2332',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                    background: '#f8fafc',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1d6fb5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(29,111,181,0.1)';
                    e.target.style.background = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d5dce6';
                    e.target.style.boxShadow = 'none';
                    e.target.style.background = '#f8fafc';
                  }}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '0.625rem 0.875rem',
                  background: '#fdecea',
                  border: '1px solid #f5c6c0',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#c0392b',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}
              >
                <AlertCircle size={15} />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isLoading ? '#9aa8b8' : '#1e3a5f',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 4,
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) (e.target as HTMLElement).style.background = '#2a5a8f';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) (e.target as HTMLElement).style.background = '#1e3a5f';
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authentification en cours...
                </>
              ) : (
                'Se Connecter'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 2rem',
          borderTop: '1px solid #e8ecf2',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <Activity size={14} style={{ color: '#9aa8b8' }} />
          <p style={{ fontSize: '0.6875rem', color: '#9aa8b8', fontWeight: 500 }}>
            République Algérienne — Ministère de la Santé © 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
