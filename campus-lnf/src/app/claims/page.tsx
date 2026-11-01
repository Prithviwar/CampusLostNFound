'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Claim {
  claim_id: number; item_id: number; item_title: string; category: string;
  report_type: string; claim_description: string; status: string;
  reviewer_name: string | null; reviewed_at: string | null; created_at: string;
}

function statusBadge(s: string) {
  const m: Record<string, string> = { PENDING: 'badge-orange', APPROVED: 'badge-green', REJECTED: 'badge-red' };
  return `badge ${m[s] || 'badge-gray'}`;
}

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    fetch('/api/claims')
      .then(r => r.json())
      .then(d => { setClaims(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) return <div className="loading-center"><span className="spinner spinner-lg" /></div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1 className="page-title">My Claims</h1>
        <p className="page-sub">Track the status of your submitted claims</p>
      </div>

      {claims.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p>You haven&apos;t submitted any claims yet.</p>
          <Link href="/items" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Items</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {claims.map(c => (
            <div key={c.claim_id} className="card animate-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <Link href={`/items/${c.item_id}`} style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.98rem' }}>
                    {c.item_title}
                  </Link>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <span className="badge badge-gray">{c.category}</span>
                    <span className={`badge ${c.report_type === 'LOST' ? 'badge-red' : 'badge-green'}`}>{c.report_type}</span>
                  </div>
                </div>
                <span className={statusBadge(c.status)}>{c.status}</span>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                {c.claim_description}
              </p>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span>Submitted: {new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                {c.reviewer_name && <span>Reviewed by: {c.reviewer_name}</span>}
                {c.reviewed_at && <span>Reviewed: {new Date(c.reviewed_at).toLocaleDateString('en-IN')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
