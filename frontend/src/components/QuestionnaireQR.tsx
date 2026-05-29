import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { QrCode, X, Copy, Check, AlertCircle, Settings } from 'lucide-react';
import axios from 'axios';

interface QuestionnaireQRProps {
  patientId: number | string;
  patientName: string;
  onClose: () => void;
}

const QuestionnaireQR: React.FC<QuestionnaireQRProps> = ({ patientId, patientName, onClose }) => {
  const [token, setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);

  const serverIp  = localStorage.getItem('dzcancer_server_ip') || '';
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const noIpWarning = isLocalhost && !serverIp;

  const generateLink = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`patients/${patientId}/habits_token/`);
      setToken(res.data.access_token);
    } catch (err) {
      console.error('Token generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const getFullUrl = () => {
    if (!token) return '';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isTauri = window.location.protocol === 'tauri:' || window.location.href.startsWith('tauri:');
    if (!isLocal && !isTauri) {
      return `${window.location.origin}/habit/${token}`;
    }
    if (serverIp) return `http://${serverIp}:5050/habit/${token}`;
    if (isTauri) return `http://localhost:5050/habit/${token}`;
    return `${window.location.origin}/habit/${token}`;
  };

  const fullUrl = getFullUrl();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-card w-full max-w-sm p-8 bg-slate-900 border-white/10 text-center relative overflow-hidden"
      >
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-4">
          {/* Icon + Title */}
          <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400">
            <QrCode size={32} />
          </div>
          <div className="mb-2">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Questionnaire Patient</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{patientName}</p>
          </div>

          {!token ? (
            <>
              {/* Warning if no IP set and on localhost */}
              {noIpWarning && (
                <div className="w-full bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold text-amber-300 leading-tight">IP réseau non configurée</p>
                      <p className="text-[9px] text-slate-400 leading-normal mt-0.5">
                        Les QR Codes pointeront vers <span className="font-mono text-amber-400">localhost</span> (non scannable sur mobile).
                        Configurez votre IP dans{' '}
                        <span className="inline-flex items-center gap-0.5 text-sky-400 font-semibold">
                          <Settings size={9} /> Paramètres
                        </span>{' '}
                        avant de générer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={generateLink}
                disabled={loading}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/20"
              >
                {loading ? 'Génération...' : 'Générer Lien Sécurisé'}
              </button>
            </>
          ) : (
            <>
              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl shadow-xl shadow-sky-500/10 mb-2 transform transition-all hover:scale-105">
                <QRCodeSVG value={fullUrl} size={180} />
              </div>

              {/* IP badge */}
              {serverIp ? (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                  <Check size={10} /> IP: {serverIp} — scannable sur mobile
                </div>
              ) : isLocalhost && (
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                  <AlertCircle size={10} /> localhost — non scannable depuis mobile
                </div>
              )}

              {/* URL copy bar */}
              <div className="w-full space-y-2 mt-1">
                <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                  <p className="text-[9px] font-mono text-slate-400 truncate flex-1">{fullUrl}</p>
                  <button onClick={copyToClipboard} className="text-sky-400 hover:text-sky-300 transition-colors">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 font-medium italic">
                  Le patient peut scanner ce code ou utiliser le lien pour remplir son questionnaire de vie en toute autonomie.
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionnaireQR;
