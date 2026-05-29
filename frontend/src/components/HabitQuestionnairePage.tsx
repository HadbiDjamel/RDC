import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Activity, Cigarette, Wine, Apple, Heart, 
    Save, CheckCircle2, AlertCircle, Loader2,
    Shield, ShieldCheck, MapPin, User, Scale, Ruler, Coffee
} from 'lucide-react';
import axios from 'axios';

// Fallback base URL for when this page is loaded directly (e.g. phone scanning QR code).
// The phone has no localStorage, so we always use relative /api/ which Docker nginx
// proxies to the Docker backend (PostgreSQL) — the same database the doctor uses.
// Only use the IP:8000 shortcut when running as the Tauri desktop app.
if (!axios.defaults.baseURL) {
  const isTauri = window.location.protocol === 'tauri:' || window.location.href.startsWith('tauri:');
  if (isTauri) {
      const configuredIp = localStorage.getItem('dzcancer_server_ip');
      axios.defaults.baseURL = configuredIp
          ? `http://${configuredIp}:8000/api/`
          : 'http://localhost:8000/api/';
  } else {
      const isVercel = window.location.hostname.endsWith('.vercel.app');
      axios.defaults.baseURL = isVercel
          ? 'https://registre-cancer-backend.onrender.com/api/'
          : '/api/';
  }
}

const HabitQuestionnairePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [habits, setHabits] = useState<any>(null);

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await axios.get(`habits/${token}/`);
        setHabits(res.data);
      } catch (err) {
        setError("Le lien d'accès a expiré ou est invalide. Veuillez contacter votre médecin.");
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`habits/${token}/`, habits);
      setSuccess(true);
    } catch (err) {
      setError("Erreur lors de la transmission des données. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f1f4f8] text-slate-600 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <span className="text-sm font-bold uppercase tracking-wider text-slate-500 animate-pulse">Chargement du questionnaire...</span>
    </div>
  );

  if (error && !habits) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f1f4f8] p-6 text-center">
      <div className="w-20 h-20 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-500 mb-6 shadow-sm">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Accès Non Autorisé</h2>
      <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-6">{error}</p>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        Ministère de la Santé — DzCancer Portal
      </div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f1f4f8] p-6 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-24 h-24 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center justify-center text-emerald-500 mb-6 shadow-sm mx-auto"
      >
        <CheckCircle2 size={48} />
      </motion.div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Questionnaire Envoyé !</h2>
      <p className="text-slate-500 text-sm max-w-md leading-relaxed mb-8">
        Vos informations sur vos habitudes de vie ont été transmises en toute sécurité. Elles seront analysées confidentiellement par votre équipe médicale pour votre suivi de santé.
      </p>
      <div className="text-[10px] text-[#22c55e] font-black uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 inline-block">
        ✔ Transmission Chiffrée & Sécurisée
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f1f4f8] text-slate-800 font-sans selection:bg-blue-500/20">
      
      {/* Sleek Algerian Banner Header */}
      <div className="w-full h-2 flex">
        <div className="flex-1 bg-emerald-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-red-600" />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Ministry of Health Emblem Header */}
        <header className="mb-12 text-center space-y-4">
          <div className="flex justify-center">
             <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-[#1d6fb5] shadow-sm">
                <ShieldCheck size={32} />
             </div>
          </div>
          <div className="space-y-1">
             <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Habitudes de Vie</h1>
             <p className="text-[9px] font-black text-[#2e7d32] uppercase tracking-[0.18em]">
               République Algérienne Démocratique et Populaire
             </p>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">
               Ministère de la Santé — Registre du Cancer
             </p>
          </div>
          <div className="h-px bg-slate-200 w-32 mx-auto mt-4" />
        </header>

        {error && (
          <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-xs font-semibold">
            <AlertCircle className="shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          
          {/* Section 1: Tabac & Habitudes de Fumeur */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600 border border-orange-100">
                  <Cigarette size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Consommation de Tabac</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Section 1</p>
                </div>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Statut de fumeur</label>
                <select 
                    value={habits.smoking_status || 'Never'} 
                    onChange={e => setHabits({...habits, smoking_status: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all"
                >
                    <option value="Never">Jamais fumé</option>
                    <option value="Former">Ancien fumeur (Arrêté)</option>
                    <option value="Current">Fumeur actif</option>
                </select>
              </div>

              {(habits.smoking_status === 'Former' || habits.smoking_status === 'Current') && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Cigarettes / Jour</label>
                    <input 
                      type="number" 
                      value={habits.cigarettes_per_day || 0} 
                      onChange={e => setHabits({...habits, cigarettes_per_day: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all" 
                      min="0" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Années de tabagisme</label>
                    <input 
                      type="number" 
                      value={habits.years_smoking || 0} 
                      onChange={e => setHabits({...habits, years_smoking: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all" 
                      min="0" 
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex-1 flex items-center gap-3 cursor-pointer p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-all select-none">
                  <input 
                    type="checkbox" 
                    checked={habits.hookah_use || false} 
                    onChange={e => setHabits({...habits, hookah_use: e.target.checked})} 
                    className="w-4 h-4 rounded border-slate-300 text-[#1d6fb5] focus:ring-blue-500/10 focus:ring-offset-0" 
                  />
                  <span className="text-xs font-semibold text-slate-600">Usage occasionnel de Chicha</span>
                </label>
                <label className="flex-1 flex items-center gap-3 cursor-pointer p-3 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100/50 transition-all select-none">
                  <input 
                    type="checkbox" 
                    checked={habits.cigar_use || false} 
                    onChange={e => setHabits({...habits, cigar_use: e.target.checked})} 
                    className="w-4 h-4 rounded border-slate-300 text-[#1d6fb5] focus:ring-blue-500/10 focus:ring-offset-0" 
                  />
                  <span className="text-xs font-semibold text-slate-600">Usage de Cigare / Pipe</span>
                </label>
              </div>
            </div>
          </section>

          {/* Section 2: Consommation d'Alcool */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
                  <Wine size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Consommation d'Alcool</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Section 2</p>
                </div>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Fréquence de consommation</label>
                <select 
                    value={habits.alcohol_consumption || 'None'} 
                    onChange={e => setHabits({...habits, alcohol_consumption: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all"
                >
                    <option value="None">Aucune consommation d'alcool</option>
                    <option value="Occasional">Occasionnelle</option>
                    <option value="Frequent">Régulière / Hebdomadaire</option>
                </select>
              </div>

              {habits.alcohol_consumption !== 'None' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1.5"
                >
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Type d'alcool habituellement consommé</label>
                  <input 
                    type="text" 
                    value={habits.alcohol_type || ''} 
                    onChange={e => setHabits({...habits, alcohol_type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all" 
                    placeholder="Ex: Bière, Vin rouge, Alcools forts..." 
                  />
                </motion.div>
              )}
            </div>
          </section>

          {/* Section 3: Régime Alimentaire & Corpulence */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                  <Apple size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Alimentation & Profil Corporel</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Section 3</p>
                </div>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <Scale size={12} /> Poids actuel (Kg)
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={habits.weight_kg || ''} 
                      onChange={e => setHabits({...habits, weight_kg: parseFloat(e.target.value) || null})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all" 
                      placeholder="ex: 74.5" 
                      min="0" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      <Ruler size={12} /> Taille (cm)
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      value={habits.height_cm || ''} 
                      onChange={e => setHabits({...habits, height_cm: parseFloat(e.target.value) || null})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all" 
                      placeholder="ex: 172" 
                      min="0" 
                    />
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Fruits & Légumes (Portions/Jour)</label>
                  <input 
                    type="number" 
                    value={habits.fruit_veg_daily || 0} 
                    onChange={e => setHabits({...habits, fruit_veg_daily: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all" 
                    min="0" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Charcuteries & Viandes Rouges</label>
                  <select 
                      value={habits.processed_meat_freq || 'Never'} 
                      onChange={e => setHabits({...habits, processed_meat_freq: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all"
                  >
                      <option value="Never">Jamais / Régime végétarien</option>
                      <option value="Rarely">Rarement (Occasionnel)</option>
                      <option value="Weekly">Plusieurs fois par semaine</option>
                      <option value="Daily">Quotidiennement</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Spécificités ou remarques nutritionnelles</label>
                <textarea 
                  value={habits.dietary_habits || ''}
                  onChange={e => setHabits({...habits, dietary_habits: e.target.value})}
                  placeholder="Alimentation salée, grasse, régime sans gluten, diabétique, etc."
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all resize-none"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Activité & Sommeil */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Activité Physique & Sommeil</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Section 4</p>
                </div>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Activité Physique Hebdomadaire</label>
                  <select 
                      value={habits.physical_activity || 'Sedentary'} 
                      onChange={e => setHabits({...habits, physical_activity: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all"
                  >
                      <option value="Sedentary">Sédentaire (Pas ou peu d'activité)</option>
                      <option value="Moderate">Modérée (Sport 1-2x/semaine)</option>
                      <option value="Active">Intense (Sportif très régulier)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Moyenne de sommeil (Heures/Nuit)</label>
                  <input 
                    type="number" 
                    value={habits.sleep_hours || 7} 
                    onChange={e => setHabits({...habits, sleep_hours: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all" 
                    min="0" 
                    max="24" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Niveau de stress quotidien perçu</label>
                <div className="flex gap-3">
                   {['Low', 'Moderate', 'High'].map((level) => (
                      <label 
                        key={level} 
                        className={`flex-1 p-3.5 rounded-xl border cursor-pointer text-center transition-all select-none ${
                          habits.stress_level === level 
                            ? 'bg-blue-50 border-[#1d6fb5] text-[#1d6fb5] font-bold shadow-sm shadow-blue-500/5' 
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                         <input 
                           type="radio" 
                           name="stress" 
                           value={level} 
                           checked={habits.stress_level === level} 
                           onChange={() => setHabits({...habits, stress_level: level})} 
                           className="sr-only" 
                         />
                         <span className="text-xs uppercase tracking-wider block">
                           {level === 'Low' ? 'Faible (Calme)' : level === 'Moderate' ? 'Modéré' : 'Élevé (Stressant)'}
                         </span>
                      </label>
                   ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Expositions & Antécédents */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 bg-violet-50 rounded-xl text-violet-600 border border-violet-100">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Expositions & Santé</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Section 5</p>
                </div>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Expositions environnementales ou professionnelles</label>
                  <textarea 
                    value={habits.occupational_exposure || ''}
                    onChange={e => setHabits({...habits, occupational_exposure: e.target.value})}
                    placeholder="Poussières nocives, amiante, produits chimiques industriels, solvants..."
                    className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all resize-none"
                  />
              </div>

              <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Antécédents oncologiques familiaux (Cancers héréditaires)</label>
                  <textarea 
                    value={habits.family_cancer_history || ''}
                    onChange={e => setHabits({...habits, family_cancer_history: e.target.value})}
                    placeholder="Précisez le cancer et le lien de parenté (ex: Mère - Cancer du sein, Oncle paternel - Poumon)..."
                    className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all resize-none"
                  />
              </div>

               <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Autres pathologies chroniques connues</label>
                  <textarea 
                    value={habits.other_chronic_diseases || ''}
                    onChange={e => setHabits({...habits, other_chronic_diseases: e.target.value})}
                    placeholder="Hypertension artérielle, Diabète, Asthme, Maladies cardiovasculaires, etc."
                    className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-[#1d6fb5] outline-none transition-all resize-none"
                  />
              </div>
            </div>
          </section>

          {/* Action button */}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 mt-8 bg-[#1e3a5f] hover:bg-[#2a5a8f] disabled:bg-slate-300 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-lg shadow-blue-900/10 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Finaliser & Transmettre le Questionnaire
          </button>
        </div>

        {/* Footer info representing state safety */}
        <footer className="mt-12 pt-8 border-t border-slate-200 text-center space-y-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
               Vos données de santé sont protégées par le secret médical conformément aux dispositions législatives en vigueur.<br/>
               Ministère de la Santé — DzCancer Portal — 2026
            </p>
        </footer>
      </div>
    </div>
  );
};

export default HabitQuestionnairePage;
