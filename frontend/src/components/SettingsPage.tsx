import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Settings, Wifi, QrCode, Check, Copy, AlertCircle,
  RefreshCw, Info, Globe, Save, Trash2, CheckCircle2
} from 'lucide-react';
import axios from 'axios';

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
const isValidIP = (ip: string) =>
  /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
  ip.split('.').every(n => parseInt(n) <= 255);

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────
const SettingsPage: React.FC = () => {
  const [serverIp, setServerIp] = useState(localStorage.getItem('dzcancer_server_ip') || '');
  const [inputIp, setInputIp]   = useState(localStorage.getItem('dzcancer_server_ip') || '');
  const [saved, setSaved]       = useState(false);
  const [cleared, setCleared]   = useState(false);
  const [copied, setCopied]     = useState(false);

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const previewUrl = serverIp
    ? `http://${serverIp}:5050/habit/<token>`
    : isLocalhost
    ? `http://localhost:5050/habit/<token>`
    : `${window.location.origin}/habit/<token>`;

  const handleSave = () => {
    const cleaned = inputIp.trim();
    if (cleaned) {
      localStorage.setItem('dzcancer_server_ip', cleaned);
    } else {
      localStorage.removeItem('dzcancer_server_ip');
    }
    // The IP is stored only for QR code URL generation (what the phone scans).
    // The doctor's own API calls always use relative /api/ in browser mode (Docker nginx).
    // Only redirect to IP:8000 when running as the Tauri desktop app.
    const isTauri = window.location.protocol === 'tauri:' || window.location.href.startsWith('tauri:');
    if (isTauri) {
      axios.defaults.baseURL = cleaned
        ? `http://${cleaned}:8000/api/`
        : 'http://localhost:8000/api/';
    } else {
      const isVercel = window.location.hostname.endsWith('.vercel.app');
      axios.defaults.baseURL = isVercel
        ? 'https://registre-cancer-backend.onrender.com/api/'
        : '/api/';
    }
    setServerIp(cleaned);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    setInputIp('');
    setServerIp('');
    localStorage.removeItem('dzcancer_server_ip');
    // Same rule: only Tauri uses localhost:8000 directly.
    const isTauri = window.location.protocol === 'tauri:' || window.location.href.startsWith('tauri:');
    if (isTauri) {
      axios.defaults.baseURL = 'http://localhost:8000/api/';
    } else {
      const isVercel = window.location.hostname.endsWith('.vercel.app');
      axios.defaults.baseURL = isVercel
        ? 'https://registre-cancer-backend.onrender.com/api/'
        : '/api/';
    }
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ipValid   = inputIp.trim() === '' || isValidIP(inputIp.trim());
  const hasChange = inputIp.trim() !== serverIp;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
          <Settings size={24} className="text-slate-200" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Paramètres</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Configuration du système et du réseau</p>
        </div>
      </div>

      {/* ── Network Configuration Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Card header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
            <Wifi size={18} className="text-sky-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base tracking-tight">Configuration Réseau Local</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Adresse IP utilisée pour les liens QR Code patients
            </p>
          </div>
          {serverIp && isValidIP(serverIp) && (
            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 size={12} /> Configuré
            </span>
          )}
        </div>

        <div className="px-7 py-6 space-y-6">

          {/* Localhost warning */}
          {isLocalhost && !serverIp && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">Accès via localhost détecté</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Les smartphones ne peuvent pas résoudre <code className="font-mono bg-amber-100 px-1 rounded">localhost</code>.
                  Saisissez l'adresse IP locale de ce PC pour que les codes QR soient scannables depuis un téléphone.
                </p>
              </div>
            </div>
          )}

          {/* IP Input Row */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-widest">
              Adresse IPv4 du serveur
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={inputIp}
                  onChange={e => setInputIp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && ipValid && handleSave()}
                  placeholder="ex: 192.168.1.15"
                  className={`w-full pl-9 pr-4 py-2.5 text-sm font-mono rounded-xl border transition-all outline-none
                    ${!ipValid
                      ? 'border-rose-300 bg-rose-50 text-rose-800 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
                      : inputIp && isValidIP(inputIp.trim())
                      ? 'border-emerald-300 bg-emerald-50/50 text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                      : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
                    }`}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!ipValid || !hasChange}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm
                  ${saved
                    ? 'bg-emerald-500 text-white'
                    : !ipValid || !hasChange
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-700 text-white active:scale-95'
                  }`}
              >
                {saved ? <><Check size={15} /> Sauvegardé</> : <><Save size={15} /> Enregistrer</>}
              </button>

              {serverIp && (
                <button
                  onClick={handleClear}
                  title="Effacer l'IP"
                  className="px-3.5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 text-slate-500 active:scale-95"
                >
                  {cleared ? <Check size={15} /> : <Trash2 size={15} />}
                </button>
              )}
            </div>

            {!ipValid && (
              <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                <AlertCircle size={12} /> Format d'adresse IP invalide (ex: 192.168.1.15)
              </p>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed flex items-start gap-1.5 pt-1">
              <Info size={12} className="mt-0.5 shrink-0 text-slate-400" />
              Exécutez <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">ipconfig</code> dans PowerShell pour trouver votre adresse IPv4 locale.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* QR Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <QrCode size={14} className="text-slate-500" />
              <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Aperçu du lien QR Code</span>
            </div>
            <div className="flex items-stretch gap-4">
              {/* QR code mini preview */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex-shrink-0">
                <QRCodeSVG value={previewUrl} size={100} />
              </div>
              {/* URL info */}
              <div className="flex-1 space-y-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <p className="text-[11px] font-mono text-slate-600 flex-1 break-all leading-relaxed">{previewUrl}</p>
                  <button onClick={copyUrl} className="text-sky-500 hover:text-sky-700 transition-colors shrink-0">
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
                <div className={`text-[10px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5
                  ${serverIp && isValidIP(serverIp)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                  {serverIp && isValidIP(serverIp) ? (
                    <><CheckCircle2 size={11} /> Les QR Codes utiliseront l'IP <strong>{serverIp}</strong> — scannables depuis mobile ✓</>
                  ) : (
                    <><AlertCircle size={11} /> Sans IP configurée, les QR Codes pointent vers localhost (non scannable sur mobile)</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── How to find your IP ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Info size={18} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base tracking-tight">Comment trouver mon adresse IP ?</h3>
            <p className="text-[11px] text-slate-500 font-medium">Guide rapide pour Windows</p>
          </div>
        </div>
        <div className="px-7 py-6 space-y-4">
          {[
            { step: '1', text: 'Ouvrez PowerShell ou l\'Invite de Commandes (Win + R → tapez cmd)', code: null },
            { step: '2', text: 'Exécutez la commande suivante :', code: 'ipconfig' },
            { step: '3', text: 'Repérez votre "Adresse IPv4" — elle ressemble à :', code: '192.168.X.X' },
            { step: '4', text: 'Copiez cette adresse et collez-la dans le champ ci-dessus, puis cliquez sur Enregistrer.', code: null },
          ].map(({ step, text, code }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shrink-0 mt-0.5">
                {step}
              </div>
              <div className="text-sm text-slate-600 leading-relaxed">
                {text}
                {code && (
                  <code className="ml-2 font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200 text-xs">
                    {code}
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default SettingsPage;
