import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Users, Trash2, Shield, Building, MapPin, 
  Mail, Phone, Lock, User, Search, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';

interface Wilaya {
  code: string;
  name: string;
}

interface UserProfile {
  role: string;
  wilaya: number | null;
  wilaya_name: string;
  institution: string;
  phone: string;
}

interface UserAccount {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
  is_staff: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Registraire (Admin)',
  doctor: 'Médecin',
  anapath: 'Pathologiste (Anapath)',
  lab: 'Laboratoire',
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  admin: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', accent: 'bg-slate-500' },
  doctor: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', accent: 'bg-blue-600' },
  anapath: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', accent: 'bg-emerald-600' },
  lab: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', accent: 'bg-amber-600' },
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('DOCTOR');
  const [wilayaId, setWilayaId] = useState<string>('');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, wilayasRes] = await Promise.all([
        axios.get('users/'),
        axios.get('wilayas/')
      ]);
      setUsers(usersRes.data);
      // Sort wilayas alphabetically or by ID
      setWilayas(wilayasRes.data.sort((a: Wilaya, b: Wilaya) => a.name.localeCompare(b.name)));
    } catch (err: any) {
      console.error(err);
      setError("Impossible de charger les données. Veuillez vérifier que vous êtes connecté en tant qu'administrateur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      username: username.trim(),
      password,
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      profile: {
        role,
        wilaya: wilayaId || null,   // send the code string directly (e.g. "02")
        institution: institution.trim(),
        phone: phone.trim()
      }
    };

    try {
      const res = await axios.post('users/', payload);
      setSuccessMsg(`Compte de ${firstName} ${lastName} (${username}) créé avec succès !`);
      
      // Reset form
      setUsername('');
      setPassword('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setRole('DOCTOR');
      setWilayaId('');
      setInstitution('');
      setPhone('');
      setShowAddForm(false);
      
      // Reload users list
      fetchData();
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : JSON.stringify(v)}`)
            .join(' | ')
        : "Erreur lors de la création du compte.";
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (userId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce compte ? Cette action est irréversible.")) {
      return;
    }
    
    setDeletingId(userId);
    try {
      await axios.delete(`users/${userId}/`);
      setSuccessMsg("Compte supprimé avec succès.");
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la suppression du compte.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const inst = (user.profile?.institution || '').toLowerCase();
    const r = (ROLE_LABELS[user.profile?.role] || '').toLowerCase();
    return (
      user.username.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      fullName.includes(q) ||
      inst.includes(q) ||
      r.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Shield className="text-slate-700" size={24} />
            Gestion des Comptes Utilisateurs
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Gérez les autorisations, créez et supervisez les comptes des médecins, biologistes et administrateurs.
          </p>
        </div>
        
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError(null);
            setSuccessMsg(null);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 text-xs uppercase tracking-wider active:scale-95"
        >
          <UserPlus size={16} />
          {showAddForm ? "Fermer le formulaire" : "Nouveau Compte"}
        </button>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-3 text-xs font-semibold"
          >
            <AlertCircle className="shrink-0 mt-0.5" size={16} />
            <div>
              <p className="font-bold text-rose-800">Une erreur est survenue</p>
              <p className="mt-1 font-mono text-[10px] break-all">{error}</p>
            </div>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 text-xs font-semibold"
          >
            <CheckCircle2 className="shrink-0" size={16} />
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsible New Account Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">Formulaire de création de compte</h3>
                <p className="text-xs text-slate-400">Tous les champs sont requis pour assurer l'habilitation et le traçage géographique.</p>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Identifiants */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nom d'utilisateur</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                        placeholder="Ex: dr_hadbi"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe robuste"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Adresse Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: hadbi.djamel@sante.gov.dz"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Profil Civil */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Nom</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ex: HADBI"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-bold uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Prénom</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ex: Djamel"
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: 0550123456"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {/* Profil Rôle & Affiliation */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Rôle Système</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
                    >
                      <option value="DOCTOR">Médecin (Saisie Clinique)</option>
                      <option value="ANAPATH">Pathologiste (Codage CIM-O-3)</option>
                      <option value="LAB">Laboratoire (Marqueurs/Biomarqueurs)</option>
                      <option value="ADMIN">Administrateur (Registraire)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Wilaya d'Affectation</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select
                        required
                        value={wilayaId}
                        onChange={(e) => setWilayaId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
                      >
                        <option value="">Sélectionnez la Wilaya</option>
                        {wilayas.map(w => (
                          <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Établissement / Institution</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        required
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Ex: CHU Mustapha Bacha"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-xs uppercase tracking-wider"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/10 text-xs uppercase tracking-wider disabled:bg-slate-300"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        Création...
                      </>
                    ) : (
                      "Confirmer & Créer"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accounts List & Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table header with search */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Liste des Utilisateurs</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                {filteredUsers.length} Comptes Enregistrés
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, rôle, hôpital..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-xs transition-all font-semibold"
            />
          </div>
        </div>

        {/* Table content */}
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="animate-spin text-blue-500" size={24} />
            <span className="text-xs font-semibold">Chargement des comptes...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-semibold">Aucun compte utilisateur ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[9px] uppercase tracking-widest font-black text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Habilitation / Rôle</th>
                  <th className="px-6 py-4">Wilaya</th>
                  <th className="px-6 py-4">Établissement</th>
                  <th className="px-6 py-4">Contacts</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => {
                  const rMeta = ROLE_COLORS[u.profile?.role] || ROLE_COLORS.admin;
                  const initials = `${u.first_name[0] || ''}${u.last_name[0] || ''}`.toUpperCase();
                  
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Civil Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${rMeta.accent} text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white`}>
                            {initials || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase">
                              {u.first_name} {u.last_name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono font-bold">@{u.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${rMeta.bg} ${rMeta.text} ${rMeta.border}`}>
                          {ROLE_LABELS[u.profile?.role] || u.profile?.role || "Inconnu"}
                        </span>
                      </td>

                      {/* Wilaya */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        {u.profile?.wilaya_name ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="text-slate-400 shrink-0" size={13} />
                            <span>{u.profile.wilaya_name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Non spécifiée</span>
                        )}
                      </td>

                      {/* Institution */}
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                        {u.profile?.institution ? (
                          <div className="flex items-center gap-1.5">
                            <Building className="text-slate-400 shrink-0" size={13} />
                            <span>{u.profile.institution}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Non spécifiée</span>
                        )}
                      </td>

                      {/* Email/Phone */}
                      <td className="px-6 py-4 text-[10px] space-y-1 font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Mail className="text-slate-400 shrink-0" size={12} />
                          <span>{u.email}</span>
                        </div>
                        {u.profile?.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="text-slate-400 shrink-0" size={12} />
                            <span>{u.profile.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteAccount(u.id)}
                          disabled={deletingId === u.id}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Supprimer définitivement"
                        >
                          {deletingId === u.id ? (
                            <RefreshCw className="animate-spin" size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
