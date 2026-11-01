'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Location {
  location_id: number; building: string; area: string;
}

const CATEGORIES = ['Bag','Electronics','ID Card','Wallet','Keys','Sports','Books','Clothing','Other'];

export default function ReportPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [form, setForm] = useState({
    report_type: 'LOST',
    category: 'Bag',
    title: '',
    location_id: '',
    reported_date: '',
    description: '',
    color: '',
    brand: '',
    keywords: '',
    identifying_marks: '',
  });
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState<{ itemId: number; matchCount: number } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) {
      Promise.resolve().then(() => setAuthState('unauthenticated'));
      router.replace('/login');
      return;
    }

    fetch('/api/locations')
      .then(r => r.json())
      .then(data => {
        setLocations(Array.isArray(data) ? data : []);
        setForm(current => ({ ...current, reported_date: new Date().toISOString().split('T')[0] }));
      })
      .catch(() => {})
      .finally(() => setAuthState('authenticated'));
  }, []); // eslint-disable-line

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);

    const details = {
      description:        form.description,
      color:              form.color,
      brand:              form.brand,
      identifying_marks:  form.identifying_marks.split(',').map(s => s.trim()).filter(Boolean),
      keywords:           form.keywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
    };

    const res  = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report_type:   form.report_type,
        category:      form.category,
        title:         form.title,
        location_id:   Number(form.location_id),
        reported_date: form.reported_date,
        details,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to submit'); setLoading(false); return; }
    setSuccess({ itemId: data.itemId, matchCount: data.matches?.length || 0 });
    setLoading(false);
  }

  if (authState === 'checking') {
    return <div className="loading-center"><span className="spinner spinner-lg" /></div>;
  }

  if (authState === 'unauthenticated') return null;

  if (success) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="card animate-in" style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Report Submitted!</h2>
          {success.matchCount > 0 ? (
            <div className="alert alert-success" style={{ margin: '1rem 0' }}>
              🔍 We found <strong>{success.matchCount}</strong> possible match{success.matchCount !== 1 ? 'es' : ''}!
            </div>
          ) : (
            <p className="text-muted" style={{ margin: '1rem 0' }}>
              No matches yet. We&apos;ll automatically match when a similar item is reported.
            </p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
            <Link href={`/items/${success.itemId}`} className="btn btn-primary">View Report & Matches</Link>
            <Link href="/items" className="btn btn-secondary">Browse All</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem', maxWidth: '720px' }}>
      <div className="page-header">
        <h1 className="page-title">Report an Item</h1>
        <p className="page-sub">Fill in details to help the matching system find your item faster</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Type + Category */}
        <div className="card">
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>BASIC INFORMATION</h2>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Report Type *</label>
              <select value={form.report_type} onChange={e => setForm(p => ({ ...p, report_type: e.target.value }))}>
                <option value="LOST">LOST – I lost this item</option>
                <option value="FOUND">FOUND – I found this item</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Title / Short description *</label>
            <input type="text" placeholder="e.g. Black laptop bag with PES sticker" required
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <select required value={form.location_id} onChange={e => setForm(p => ({ ...p, location_id: e.target.value }))}>
                <option value="">Select location…</option>
                {locations.map(l => (
                  <option key={l.location_id} value={l.location_id}>
                    {l.building} – {l.area}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date {form.report_type === 'LOST' ? 'Lost' : 'Found'} *</label>
              <input type="date" required
                value={form.reported_date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(p => ({ ...p, reported_date: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Details (for matching) */}
        <div className="card">
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>ITEM DETAILS</h2>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
            More details = better match accuracy. Stored in MongoDB.
          </p>
          <div className="form-group">
            <label className="form-label">Full Description</label>
            <textarea rows={3} placeholder="Detailed description of the item…"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Color</label>
              <input type="text" placeholder="e.g. black, navy blue, silver"
                value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input type="text" placeholder="e.g. Dell, Wildcraft, Apple"
                value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Identifying Marks (comma-separated)</label>
            <input type="text" placeholder="e.g. PES sticker, small tear, initials RK"
              value={form.identifying_marks} onChange={e => setForm(p => ({ ...p, identifying_marks: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Keywords (comma-separated)</label>
            <input type="text" placeholder="e.g. laptop, dell, black, bag, wildcraft"
              value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Used by the matching algorithm to find related reports.
            </span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
          {loading ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}} /> Submitting &amp; Running Matching…</> : `Submit ${form.report_type} Report`}
        </button>
      </form>
    </div>
  );
}
