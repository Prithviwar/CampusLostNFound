'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface ItemDetail {
  item: {
    item_id: number; title: string; category: string; report_type: string;
    status: string; reported_date: string; reporter_name: string;
    reporter_email: string; building: string; area: string; location_desc: string;
    reported_by: number;
  };
  details: {
    description: string;
    visual_attributes: { color: string; brand: string; identifying_marks: string[] };
    category_attributes: Record<string, unknown>;
    keywords: string[];
  } | null;
  matches: Array<{
    match_id: number; lost_item_id: number; found_item_id: number;
    match_score: number; match_reason: string; match_status: string;
    lost_title: string; found_title: string;
  }>;
  history: Array<{
    history_id: number; old_status: string; new_status: string;
    changed_by_name: string; changed_at: string;
  }>;
}

function scoreColor(s: number) {
  if (s >= 80) return 'var(--accent-green)';
  if (s >= 60) return 'var(--accent-teal)';
  if (s >= 40) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

function statusBadge(s: string) {
  const map: Record<string, string> = {
    REPORTED: 'badge-blue', MATCHED: 'badge-purple', CLAIMED: 'badge-orange',
    VERIFIED: 'badge-teal', RETURNED: 'badge-green',  CLOSED:  'badge-gray',
  };
  return `badge ${map[s] || 'badge-gray'}`;
}

export default function ItemDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [data,   setData]    = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState<{ userId: number; role: string } | null>(null);
  const [claimDesc, setClaimDesc] = useState('');
  const [claimMsg,  setClaimMsg]  = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    fetch(`/api/items/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function submitClaim() {
    if (!claimDesc.trim()) return;
    setSubmitting(true);
    const res  = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: Number(id), claim_description: claimDesc }),
    });
    const resp = await res.json();
    if (res.ok) setClaimMsg('✅ Claim submitted! You can track it in My Claims.');
    else setClaimMsg(`❌ ${resp.error}`);
    setSubmitting(false);
  }

  if (loading) return <div className="loading-center"><span className="spinner spinner-lg" /></div>;
  if (!data || !data.item) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p>Item not found.</p>
      <Link href="/items" className="btn btn-secondary mt-4">Back to Browse</Link>
    </div>
  );

  const { item, details, matches, history } = data;
  const isOwner = user?.userId === item.reported_by;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => router.back()}>← Back</button>
      </div>

      <div className="grid-2">
        {/* Left: Item info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main card */}
          <div className="card animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className={`badge ${item.report_type === 'LOST' ? 'badge-red' : 'badge-green'}`} style={{ marginBottom: '0.5rem' }}>
                  {item.report_type}
                </span>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem' }}>{item.title}</h1>
              </div>
              <span className={statusBadge(item.status)}>{item.status}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', width: '80px' }}>Category</span>
                <span className="badge badge-gray">{item.category}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', width: '80px' }}>Location</span>
                <span>📍 {item.building} – {item.area}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', width: '80px' }}>Date</span>
                <span>📅 {new Date(item.reported_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', width: '80px' }}>Reporter</span>
                <span>👤 {item.reporter_name}</span>
              </div>
            </div>
          </div>

          {/* MongoDB details */}
          {details && (
            <div className="card animate-in">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Item Details</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.7 }}>
                {details.description}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                {details.visual_attributes?.color && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', width: '80px' }}>Color</span>
                    <span style={{ textTransform: 'capitalize' }}>{details.visual_attributes.color}</span>
                  </div>
                )}
                {details.visual_attributes?.brand && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', width: '80px' }}>Brand</span>
                    <span>{details.visual_attributes.brand}</span>
                  </div>
                )}
                {details.visual_attributes?.identifying_marks?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', width: '80px' }}>Marks</span>
                    <span>{details.visual_attributes.identifying_marks.join(', ')}</span>
                  </div>
                )}
              </div>
              {/* Keywords */}
              {details.keywords?.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {details.keywords.map(k => (
                    <span key={k} className="badge badge-gray">{k}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Claim form (only for FOUND items, not owner, logged in) */}
          {user && !isOwner && item.report_type === 'FOUND' && item.status !== 'RETURNED' && item.status !== 'CLOSED' && (
            <div className="card animate-in" style={{ borderColor: 'rgba(79,156,249,0.3)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Submit a Claim</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Describe how this is yours — include identifying details, serial numbers, or any unique marks.
              </p>
              <textarea
                rows={4}
                placeholder="e.g. This is my Dell laptop, serial number DL5P123, with a PES sticker on the back."
                value={claimDesc}
                onChange={e => setClaimDesc(e.target.value)}
              />
              {claimMsg && (
                <div className={`alert ${claimMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '0.75rem' }}>
                  {claimMsg}
                </div>
              )}
              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: '0.75rem' }}
                onClick={submitClaim}
                disabled={submitting || !claimDesc.trim()}
              >
                {submitting ? 'Submitting…' : 'Submit Claim'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Matches + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Matches */}
          {matches.length > 0 && (
            <div className="card animate-in">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                🔍 Possible Matches ({matches.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {matches.map(m => {
                  const isLost = m.lost_item_id === item.item_id;
                  const otherTitle = isLost ? m.found_title : m.lost_title;
                  const otherId    = isLost ? m.found_item_id : m.lost_item_id;
                  return (
                    <div key={m.match_id} className="card-elevated animate-in">
                      {/* Score */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <Link href={`/items/${otherId}`} style={{ fontWeight: 600, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                          {otherTitle}
                        </Link>
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: scoreColor(m.match_score) }}>
                          {m.match_score}%
                        </span>
                      </div>
                      {/* Score bar */}
                      <div className="score-bar-track" style={{ marginBottom: '0.75rem' }}>
                        <div className="score-bar-fill" style={{ width: `${m.match_score}%` }} />
                      </div>
                      {/* Reasons */}
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Why this match?</p>
                        {m.match_reason.split(' | ').map((r, i) => (
                          <span key={i}>✓ {r}</span>
                        ))}
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span className={`badge ${m.match_status === 'CONFIRMED' ? 'badge-green' : m.match_status === 'DISMISSED' ? 'badge-gray' : 'badge-orange'}`}>
                          {m.match_status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status History */}
          {history.length > 0 && (
            <div className="card animate-in">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📜 Status History</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {history.map(h => (
                  <div key={h.history_id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.5rem 0.75rem', background: 'var(--bg-overlay)',
                    borderRadius: 'var(--radius-sm)', fontSize: '0.82rem',
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(h.changed_at).toLocaleDateString()}</span>
                    <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>{h.old_status || 'NEW'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span className={`badge ${h.new_status === 'RETURNED' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.68rem' }}>
                      {h.new_status}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>by {h.changed_by_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matches.length === 0 && history.length === 0 && (
            <div className="card animate-in" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔎</div>
              <p style={{ fontSize: '0.88rem' }}>No matches or history yet.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Matches appear automatically when an opposite-type report is submitted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
