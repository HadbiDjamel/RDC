import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { QrCode, X, Share2, Copy, Check } from 'lucide-react';
import axios from 'axios';

interface QuestionnaireQRProps {
  patientId: number | string;
  patientName: string;
  onClose: () => void;
}

const QuestionnaireQR: React.FC<QuestionnaireQRProps> = ({ patientId, patientName, onClose }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`patients/${patientId}/habits_token/`);
      setToken(res.data.access_token);
    } catch (err) {
      console.error("Token generation failed", err);
    } finally {
      setLoading(false);
    }
  };

  const fullUrl = token ? `${window.location.origin}/habit/${token}` : '';

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
        {/* Abstract background light */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400">
            <QrCode size={32} />
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Questionnaire Patient</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{patientName}</p>
          </div>

          {!token ? (
            <button 
              onClick={generateLink}
              disabled={loading}
              className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-sky-500/20"
            >
              {loading ? "Génération..." : "Générer Lien Sécurisé"}
            </button>
          ) : (
            <>
              <div className="bg-white p-4 rounded-2xl shadow-xl shadow-sky-500/10 mb-4 transform transition-all hover:scale-105">
                <QRCodeSVG value={fullUrl} size={180} />
              </div>

              <div className="w-full space-y-3">
                 <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] font-mono text-slate-400 truncate flex-1">{fullUrl}</p>
                    <button onClick={copyToClipboard} className="text-sky-400 hover:text-sky-300 transition-colors">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                 </div>
                 <p className="text-[9px] text-slate-500 font-medium italic">Le patient peut scanner ce code ou utiliser le lien pour remplir son questionnaire de vie en toute autonomie.</p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuestionnaireQR;
