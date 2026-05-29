/* Updated handleSubmit to normalize payload and include role */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const role = formData.role;
  const roleMap: Record<string, string> = {
    admin: 'ADMIN',
    medecin: 'DOCTOR',
    anapate: 'ANAPATH',
    labo: 'LAB',
  };
  // Prepare payload with normalized fields
  const payload = {
    ...formData,
    // Nest role and wilaya under profile as expected by backend serializer
    profile: {
      role: roleMap[role] || undefined,
      wilaya: formData.wilaya ? formData.wilaya.padStart(2, '0') : undefined,
    },
  };
  try {
    const res = await fetch('/api/patients/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed');
    setSuccess(true);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};
