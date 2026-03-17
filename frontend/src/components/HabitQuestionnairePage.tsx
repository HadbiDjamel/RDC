import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Activity, Cigarette, Wine, Apple, Heart, 
    Save, CheckCircle2, AlertCircle, Loader2,
    Undo2
} from 'lucide-react';
import axios from 'axios';

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
        const res = await axios.get(`http://localhost:8000/api/habits/${token}/`);
        setHabits(res.data);
      } catch (err) {
        setError("Lien invalide ou expiré.");
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`http://localhost:8000/api/habits/${token}/`, habits);
      setSuccess(true);
    } catch (err) {
      setError("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-white">
      <Loader2 className="animate-spin text-sky-500" size={40} />
    </div>
  );

  if (error) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-white p-6 text-center">
      <AlertCircle className="text-rose-500 mb-4" size={60} />
      <h2 className="text-2xl font-bold mb-2">Accès Refusé</h2>
      <p className="text-slate-400">{error}</p>
    </div>
  );

  if (success) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-white p-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 mx-auto">
        <CheckCircle2 size={40} />
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">Merci !</h2>
      <p className="text-slate-400 mb-8">Vos informations ont été transmises à l'équipe médicale.</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white font-sans selection:bg-sky-500/30">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-12 text-center">
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400">
                <Heart size={32} />
             </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Habitudes de Vie</h1>
          <p className="text-slate-500 text-sm">Questionnaire Patient — DzCancer</p>
        </header>

        <div className="space-y-6">
          {/* Section 1: Tabac & Habitudes de Fumeur */}
          <section className="glass-card p-6 border-white/5 bg-white/2">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Cigarette size={20} /></div>
                <h3 className="font-bold uppercase text-xs tracking-widest text-slate-400">Section 1: Consommation de Tabac</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Statut de fumeur</label>
                <select 
                    value={habits.smoking_status || 'Never'} 
                    onChange={e => setHabits({...habits, smoking_status: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none"
                >
                    <option value="Never">Jamais fumé</option>
                    <option value="Former">Ancien fumeur</option>
                    <option value="Current">Fumeur actif</option>
                </select>
              </div>

              {(habits.smoking_status === 'Former' || habits.smoking_status === 'Current') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Cigarettes / Jour</label>
                    <input type="number" value={habits.cigarettes_per_day || 0} onChange={e => setHabits({...habits, cigarettes_per_day: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none" min="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Années de tabagisme</label>
                    <input type="number" value={habits.years_smoking || 0} onChange={e => setHabits({...habits, years_smoking: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none" min="0" />
                  </div>
                </div>
              )}

              <div className="flex gap-6 mt-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={habits.hookah_use || false} onChange={e => setHabits({...habits, hookah_use: e.target.checked})} className="rounded bg-slate-900 border-white/10 text-sky-500 focus:ring-sky-500/30" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Usage de Chicha</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={habits.cigar_use || false} onChange={e => setHabits({...habits, cigar_use: e.target.checked})} className="rounded bg-slate-900 border-white/10 text-sky-500 focus:ring-sky-500/30" />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Usage de Cigare / Pipe</span>
                </label>
              </div>
            </div>
          </section>

          {/* Section 2: Consommation d'Alcool */}
          <section className="glass-card p-6 border-white/5 bg-white/2">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400"><Wine size={20} /></div>
                <h3 className="font-bold uppercase text-xs tracking-widest text-slate-400">Section 2: Consommation d'Alcool</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Fréquence de consommation</label>
                <select 
                    value={habits.alcohol_consumption || 'None'} 
                    onChange={e => setHabits({...habits, alcohol_consumption: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none"
                >
                    <option value="None">Aucune</option>
                    <option value="Occasional">Occasionnelle</option>
                    <option value="Frequent">Fréquente / Régulière</option>
                </select>
              </div>

              {habits.alcohol_consumption !== 'None' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Type d'alcool (Vin, Bière, etc.)</label>
                  <input type="text" value={habits.alcohol_type || ''} onChange={e => setHabits({...habits, alcohol_type: e.target.value})}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none" placeholder="Précisez le type habituellement consommé..." />
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Régime Alimentaire & Corpulence */}
          <section className="glass-card p-6 border-white/5 bg-white/2">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Apple size={20} /></div>
                <h3 className="font-bold uppercase text-xs tracking-widest text-slate-400">Section 3: Alimentation & Profil Physique</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Poids (Kg)</label>
                    <input type="number" step="0.1" value={habits.weight_kg || ''} onChange={e => setHabits({...habits, weight_kg: parseFloat(e.target.value) || null})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none" placeholder="ex: 75.5" min="0" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Taille (cm)</label>
                    <input type="number" step="0.1" value={habits.height_cm || ''} onChange={e => setHabits({...habits, height_cm: parseFloat(e.target.value) || null})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none" placeholder="ex: 175" min="0" />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Fruits et Légumes / Jour</label>
                  <input type="number" value={habits.fruit_veg_daily || 0} onChange={e => setHabits({...habits, fruit_veg_daily: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none" min="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Viandes Rouges / Charcuteries</label>
                  <select 
                      value={habits.processed_meat_freq || 'Never'} 
                      onChange={e => setHabits({...habits, processed_meat_freq: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none"
                  >
                      <option value="Never">Jamais / Végétarien</option>
                      <option value="Rarely">Rarement</option>
                      <option value="Weekly">Plusieurs fois par semaine</option>
                      <option value="Daily">Quotidiennement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 mt-4">Remarques sur l'alimentation</label>
                <textarea 
                  value={habits.dietary_habits || ''}
                  onChange={e => setHabits({...habits, dietary_habits: e.target.value})}
                  placeholder="Beaucoup de sel, de sucre, régime spécifique..."
                  className="w-full h-24 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </div>
            </div>
          </section>

          {/* Section 4: Activité & Sommeil */}
          <section className="glass-card p-6 border-white/5 bg-white/2">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><Activity size={20} /></div>
                <h3 className="font-bold uppercase text-xs tracking-widest text-slate-400">Section 4: Hygiène de Vie Active</h3>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Activité Physique</label>
                  <select 
                      value={habits.physical_activity || 'Sedentary'} 
                      onChange={e => setHabits({...habits, physical_activity: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none"
                  >
                      <option value="Sedentary">Sédentaire</option>
                      <option value="Moderate">Modérée (1-2x/semaine)</option>
                      <option value="Active">Active (Sportif régulier)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Heures de Sommeil (moyenne)</label>
                  <input type="number" value={habits.sleep_hours || 7} onChange={e => setHabits({...habits, sleep_hours: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500/30 outline-none" min="0" max="24" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 mt-2">Niveau de Stress perçu</label>
                <div className="flex gap-4">
                   {['Low', 'Moderate', 'High'].map((level) => (
                      <label key={level} className={`flex-1 p-3 rounded-xl border cursor-pointer text-center transition-all ${habits.stress_level === level ? 'bg-sky-500/20 border-sky-500 text-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/30'}`}>
                         <input type="radio" name="stress" value={level} checked={habits.stress_level === level} onChange={() => setHabits({...habits, stress_level: level})} className="sr-only" />
                         <span className="text-sm font-bold uppercase">{level === 'Low' ? 'Faible' : level === 'Moderate' ? 'Moyen' : 'Élevé'}</span>
                      </label>
                   ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Expositions & Antécédents */}
          <section className="glass-card p-6 border-white/5 bg-white/2">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400"><AlertCircle size={20} /></div>
                <h3 className="font-bold uppercase text-xs tracking-widest text-slate-400">Section 5: Expositions & Santé</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Exposition Professionnelle ou Environnementale</label>
                  <textarea 
                    value={habits.occupational_exposure || ''}
                    onChange={e => setHabits({...habits, occupational_exposure: e.target.value})}
                    placeholder="Amiante, solvants chimiques, poussières, etc."
                    className="w-full h-20 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
              </div>

              <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Cancers dans l'historique familial</label>
                  <textarea 
                    value={habits.family_cancer_history || ''}
                    onChange={e => setHabits({...habits, family_cancer_history: e.target.value})}
                    placeholder="Grand-père (poumon), Tante (sein)... Précisez le degré de parenté."
                    className="w-full h-20 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
              </div>

               <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Autres Maladies Chroniques Personnelles</label>
                  <textarea 
                    value={habits.other_chronic_diseases || ''}
                    onChange={e => setHabits({...habits, other_chronic_diseases: e.target.value})}
                    placeholder="Diabète, Hypertension, Asthme, Maladie Cardiaque..."
                    className="w-full h-20 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
              </div>
            </div>
          </section>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 mt-8 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3 transition-all"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Finaliser & Transmettre le Questionnaire
          </button>
        </div>

        <footer className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
               VOS DONNÉES SONT SÉCURISÉES.<br/>
               REPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE<br/>
               MINISTÈRE DE LA SANTÉ
            </p>
        </footer>
      </div>
    </div>
  );
};

export default HabitQuestionnairePage;
