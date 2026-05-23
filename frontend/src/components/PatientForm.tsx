/* Updated handleSubmit to normalize payload */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  // Prepare payload with normalized fields
  const payload = {
    ...formData,
    // Ensure role is uppercase as expected by backend
    role: formData.role ? formData.role.toUpperCase() : undefined,
    // Ensure wilaya code is two digits, pad with leading zero if needed
    wilaya: formData.wilaya ? formData.wilaya.padStart(2, '0') : undefined,
  };
  try {
    const res = await fetch('/api/patients/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed');
    // success handling
    setSuccess(true);
  } catch (e) {
    console.error(e);
    // could set error state
  } finally {
    setLoading(false);
  }
};
