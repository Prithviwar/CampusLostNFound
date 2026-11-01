'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Item {
  item_id: number;
  title: string;
  category: string;
  report_type: 'LOST' | 'FOUND';
  status: string;
  reported_date: string;
  reporter_name: string;
  building: string;
  area: string;
}

const CATEGORIES = ['All','Bag','Electronics','ID Card','Wallet','Keys','Sports','Books','Clothing','Other'];
const STATUSES   = ['All','REPORTED','MATCHED','CLAIMED','VERIFIED','RETURNED','CLOSED'];

function statusBadge(s: string) {
  const map: Record<string, string> = {
    REPORTED: 'badge-blue', MATCHED: 'badge-purple', CLAIMED: 'badge-orange',
    VERIFIED: 'badge-teal', RETURNED: 'badge-green',  CLOSED:  'badge-gray',
  };
  return `badge ${map[s] || 'badge-gray'}`;
}

function typeBadge(t: string) {
  return t === 'LOST' ? 'badge badge-red' : 'badge badge-green';
}

export default function ItemsPage() {
  const [items,    setItems]    = useState<Item[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState('All');
  const [type,     setType]     = useState('All');
  const [status,   setStatus]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [error,    setError]    = useState('');

  async function fetchItems() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (type !== 'All')     params.set('report_type', type);
      if (status !== 'All')   params.set('status', status);
      const res = await fetch(`/api/items?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
      setError('Reports could not be loaded. Check the database connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, [category, type, status]); // eslint-disable-line

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Browse Reports</h1>
            <p className="page-sub">Search and filter all lost &amp; found items on campus</p>
          </div>
          <Link href="/report" className="btn btn-primary">+ Report Item</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="form-group" style={{ flex: 2, minWidth: '160px' }}>
          <label className="form-label">Search</label>
          <input type="text" placeholder="Search title, category, location…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
          <label className="form-label">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '100px' }}>
          <label className="form-label">Type</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option>All</option><option>LOST</option><option>FOUND</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: '120px' }}>
          <label className="form-label">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchItems}>Refresh</button>
      </div>

      {/* Count */}
      <p className="text-muted text-small" style={{ marginBottom: '1rem' }}>
        Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="loading-center"><span className="spinner spinner-lg" /><span>Loading items…</span></div>
      ) : error ? (
        <div className="alert alert-error" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={fetchItems}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p>No items found matching your filters.</p>
        </div>
      ) : (
        <div className="items-grid">
          {filtered.map(item => (
            <Link href={`/items/${item.item_id}`} key={item.item_id} style={{ textDecoration: 'none' }}>
              <div className="item-card animate-in">
                <div className="item-card-header">
                  <span className="item-card-title">{item.title}</span>
                  <span className={typeBadge(item.report_type)}>{item.report_type}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-gray">{item.category}</span>
                  <span className={statusBadge(item.status)}>{item.status}</span>
                </div>
                <div className="item-card-meta">
                  <span>📍 {item.building} – {item.area}</span>
                  <span>📅 {new Date(item.reported_date).toLocaleDateString()}</span>
                  <span>👤 {item.reporter_name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
