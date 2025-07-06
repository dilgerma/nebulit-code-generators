"use client";

import { useState } from 'react';
import { supabase } from "@/app/supabase/supabaseClient";

export default function App() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage('Check your email for a magic link to complete registration.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Register with Email</h1>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {errorMsg && <div style={{ color: 'red' }}>{errorMsg}</div>}
        {message && <div style={{ color: 'green' }}>{message}</div>}
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
          />
        </label>
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }} disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>
    </div>
  );
} 