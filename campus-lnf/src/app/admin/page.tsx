'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Claim {
  claim_id: number; item_id: number; item_title: string; category: string;
  report_type: string; claim_description: string; status: string;
  claimant_name: string; claimant_email: string;
  reviewer_name: string | null; reviewed_at: string | null; created_at: string;
}

interface Item {
  item_id: number; title: string; category: string; report_type: string;
  status: string; reported_date: string; reporter_name: string;
  building: string; area: string;
}

interface ReportData {
  summary: { total_items: number; total_lost: number; total_found: number; total_returned: number; total_active: number };
  pendingClaims: number;
  byCategory: Array<{ category: string; total_reports: number; lost_count: number; found_count: number }>;
  byLocation: Array<{ building: string; area: string; total_reports: number }>;
  recoveryRate: Array<{ category: string; total_items: number; returned_items: number; recovery_rate: number }>;
  claimApproval: Array<{ administrator: string; reviewed_claims: number; approved_claims: number; approval_pct: number }>;
  avgReturn: Array<{ category: string; avg_days_to_return: number }>;
  mongo: {
    byType: Array<{ _id: string; total: number }>;
    topKeywords: Array<{ _id: string; frequency: number }>;
    colorDist: Array<{ _id: string; count: number }>;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [tab,     setTab]     = useState<'overview' | 'claims' | 'items' | 'reports'>('overview');
  const [claims,  setClaims]  = useState<Claim[]>([]);
  const [items,   setItems]   = useState<Item[]>([]);
  const [reports, setReports] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState('');

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) { router.push('/login'); return; }
    const user = JSON.parse(u);
    if (user.role !== 'ADMIN') { router.push('/items'); return; }
    loadAll();
  }, []); // eslint-disable-line

  async function loadAll() {
    setLoading(true);
    const [cRes, iRes, rRes] = await Promise.all([
      fetch('/api/claims?scope=all'),
      fetch('/api/items'),
      fetch('/api/admin/reports'),
    ]);
    setClaims(await cRes.json());
    setItems(await iRes.json());
    setReports(await rRes.json());
    setLoading(false);
  }

  async function reviewClaim(claimId: number, status: 'APPROVED' | 'REJECTED') {
    setMsg('');
    const res = await fetch(`/api/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const d = await res.json();
    setMsg(res.ok ? `✅ ${d.message}` : `❌ ${d.error}`);
    loadAll();
  }

  async function updateItemStatus(itemId: number, status: string) {
    setMsg('');
    const res = await fetch(`/api/admin/items/${itemId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const d = await res.json();
    setMsg(res.ok ? `✅ ${d.message}` : `❌ ${d.error}`);
    loadAll();
  }

  if (loading) return <div className="loading-center"><span className="spinner spinner-lg" /></div>;

  const pendingClaims = claims.filter(c => c.status === 'PENDING');

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-sub">Manage reports, claims, and view analytics</p>
          </div>
          {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}
        </div>
      </div>

      {/* Summary Stats */}
      {reports && (
        <div className="stats-grid">
          {[
            { label: 'Total Reports',  value: reports.summary.total_items,    sub: 'All time', color: 'var(--accent-blue)' },
            { label: 'Lost Reports',   value: reports.summary.total_lost,     sub: '',         color: 'var(--accent-red)' },
            { label: 'Found Reports',  value: reports.summary.total_found,    sub: '',         color: 'var(--accent-green)' },
            { label: 'Returned',       value: reports.summary.total_returned, sub: 'Recovered',color: 'var(--accent-teal)' },
            { label: 'Active',         value: reports.summary.total_active,   sub: 'Open',     color: 'var(--accent-purple)' },
            { label: 'Pending Claims', value: reports.pendingClaims,          sub: 'Awaiting review', color: 'var(--accent-orange)' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <span className="stat-label">{s.label}</span>
              <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
              {s.sub && <span className="stat-sub">{s.sub}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        {(['overview', 'claims', 'items', 'reports'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.625rem 1.25rem', fontSize: '0.88rem', fontWeight: 600,
            color: tab === t ? 'var(--accent-blue)' : 'var(--text-secondary)',
            borderBottom: tab === t ? '2px solid var(--accent-blue)' : '2px solid transparent',
            background: 'none', cursor: 'pointer', textTransform: 'capitalize',
            transition: 'color 0.15s, border-color 0.15s',
          }}>
            {t === 'claims' && pendingClaims.length > 0 ? `Claims (${pendingClaims.length})` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW tab */}
      {tab === 'overview' && reports && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-2">
            {/* By Category */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Reports by Category</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Category</th><th>Total</th><th>Lost</th><th>Found</th></tr></thead>
                  <tbody>
                    {reports.byCategory.map(r => (
                      <tr key={r.category}>
                        <td>{r.category}</td>
                        <td style={{ fontWeight: 600 }}>{r.total_reports}</td>
                        <td style={{ color: 'var(--accent-red)' }}>{Number(r.lost_count)}</td>
                        <td style={{ color: 'var(--accent-green)' }}>{Number(r.found_count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recovery Rate */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recovery Rate by Category</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Category</th><th>Total</th><th>Returned</th><th>Rate</th></tr></thead>
                  <tbody>
                    {reports.recoveryRate.map(r => (
                      <tr key={r.category}>
                        <td>{r.category}</td>
                        <td>{r.total_items}</td>
                        <td>{Number(r.returned_items)}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: Number(r.recovery_rate) > 50 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>
                            {r.recovery_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {/* By Location */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Top Loss Locations</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Building</th><th>Area</th><th>Reports</th></tr></thead>
                  <tbody>
                    {reports.byLocation.slice(0,8).map((r, i) => (
                      <tr key={i}>
                        <td>{r.building}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.area}</td>
                        <td style={{ fontWeight: 600 }}>{r.total_reports}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Avg Return Time */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Avg Days to Return</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Category</th><th>Avg Days</th></tr></thead>
                  <tbody>
                    {reports.avgReturn.map(r => (
                      <tr key={r.category}>
                        <td>{r.category}</td>
                        <td style={{ fontWeight: 600, color: 'var(--accent-teal)' }}>{r.avg_days_to_return}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reports.avgReturn.length === 0 && <p className="text-muted text-small" style={{ padding: '1rem 0' }}>No returned items yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* CLAIMS tab */}
      {tab === 'claims' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontWeight: 700 }}>All Claims ({claims.length})</h2>
          </div>
          {claims.length === 0 ? <p className="text-muted">No claims yet.</p> : (
            claims.map(c => (
              <div key={c.claim_id} className="card animate-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <Link href={`/items/${c.item_id}`} style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                      {c.item_title}
                    </Link>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                      <span className="badge badge-gray">{c.category}</span>
                      <span className={`badge ${c.report_type === 'LOST' ? 'badge-red' : 'badge-green'}`}>{c.report_type}</span>
                    </div>
                  </div>
                  <span className={`badge ${c.status === 'PENDING' ? 'badge-orange' : c.status === 'APPROVED' ? 'badge-green' : 'badge-red'}`}>
                    {c.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {c.claim_description}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Claimant: {c.claimant_name} ({c.claimant_email}) · {new Date(c.created_at).toLocaleDateString()}
                </div>
                {c.status === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-success btn-sm" onClick={() => reviewClaim(c.claim_id, 'APPROVED')}>✓ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => reviewClaim(c.claim_id, 'REJECTED')}>✗ Reject</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ITEMS tab */}
      {tab === 'items' && (
        <div>
          <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>All Items ({items.length})</h2>
          <div className="table-wrap card">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Type</th><th>Category</th>
                  <th>Location</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.item_id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{item.item_id}</td>
                    <td>
                      <Link href={`/items/${item.item_id}`} style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {item.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`badge ${item.report_type === 'LOST' ? 'badge-red' : 'badge-green'}`}>
                        {item.report_type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{item.category}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{item.building}</td>
                    <td>
                      <span className={`badge ${
                        item.status === 'REPORTED' ? 'badge-blue' : item.status === 'MATCHED' ? 'badge-purple' :
                        item.status === 'CLAIMED' ? 'badge-orange' : item.status === 'RETURNED' ? 'badge-green' : 'badge-gray'
                      }`}>{item.status}</span>
                    </td>
                    <td>
                      <select
                        style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                        value={item.status}
                        onChange={e => updateItemStatus(item.item_id, e.target.value)}
                      >
                        {['REPORTED','MATCHED','CLAIMED','VERIFIED','RETURNED','CLOSED'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS tab - MongoDB analytics */}
      {tab === 'reports' && reports && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Claim Approval Rates */}
          {reports.claimApproval.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Claim Approval Rate by Administrator</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Administrator</th><th>Reviewed</th><th>Approved</th><th>Approval %</th></tr></thead>
                  <tbody>
                    {reports.claimApproval.map(r => (
                      <tr key={r.administrator}>
                        <td style={{ fontWeight: 600 }}>{r.administrator}</td>
                        <td>{r.reviewed_claims}</td>
                        <td>{Number(r.approved_claims)}</td>
                        <td><span style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>{r.approval_pct}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid-2">
            {/* MongoDB: Item type distribution */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>🍃 MongoDB: Items by Type</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Aggregation pipeline on <code>item_details</code> collection
              </p>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Item Type</th><th>Count</th></tr></thead>
                  <tbody>
                    {reports.mongo.byType.map(r => (
                      <tr key={r._id}>
                        <td style={{ textTransform: 'capitalize' }}>{r._id || 'Unknown'}</td>
                        <td style={{ fontWeight: 600 }}>{r.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MongoDB: Top keywords */}
            <div className="card">
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>🍃 MongoDB: Top Keywords</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Unwind + group aggregation on keyword arrays
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {reports.mongo.topKeywords.map(k => (
                  <div key={k._id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: 'var(--bg-overlay)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem', fontSize: '0.82rem',
                  }}>
                    <span>{k._id}</span>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{k.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MongoDB: Color distribution */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>🍃 MongoDB: Color Distribution</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Group by <code>visual_attributes.color</code>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {reports.mongo.colorDist.map(c => (
                <div key={c._id} className="stat-card" style={{ flex: '0 0 auto', minWidth: '100px' }}>
                  <span className="stat-label">{c._id || 'unknown'}</span>
                  <span className="stat-value" style={{ fontSize: '1.5rem' }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
