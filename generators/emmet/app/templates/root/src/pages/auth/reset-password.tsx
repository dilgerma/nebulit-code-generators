import { useState } from 'react';
import {createClient} from "@/supabase/component";

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMsg(null);
    setLoading(true);
    const client = createClient()
    const { error } = await client.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage('Password reset email sent! Check your inbox.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Reset Password</h1>
      <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          {loading ? 'Sending…' : 'Send Password Reset Email'}
        </button>
      </form>
    </div>
  );
} 