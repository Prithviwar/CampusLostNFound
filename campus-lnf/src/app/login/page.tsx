'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'ADMIN') router.push('/admin');
      else router.push('/items');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="card animate-in" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome back</h1>
          <p className="text-muted" style={{ fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@campus.edu" required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="Your password" required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><span className="spinner" style={{width:16,height:16,borderWidth:2}} /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="card-elevated" style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Demo credentials</p>
          <p>🎓 Student: <code>priya@campus.edu</code></p>
          <p>🛡 Admin: &nbsp;<code>admin@campus.edu</code></p>
          <p style={{ marginTop: '0.3rem' }}>Password for all: <code>Password@123</code></p>
        </div>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
