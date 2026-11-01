'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-title">Campus Lost &amp; Found<br />Intelligence System</div>
          <p className="hero-sub">
            Report lost or found items, get AI-powered match scores with explanations,
            and track claims — all in one place.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/items" className="btn btn-primary btn-lg">Browse Reports</Link>
            <Link href="/report" className="btn btn-secondary btn-lg">Report an Item</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>How it works</h2>
            <p className="text-muted">From report to recovery in a few steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '1.5rem' }}>
            {[
              { icon: '📋', title: 'Report an Item', desc: 'Submit a lost or found report with description, category, and location.', color: 'var(--accent-blue)' },
              { icon: '🔍', title: 'Intelligent Matching', desc: 'Our engine scores possible matches by category, brand, color, location, and keywords.', color: 'var(--accent-purple)' },
              { icon: '📊', title: 'Explainable Scores', desc: 'See exactly why two items were matched — every factor is broken down and explained.', color: 'var(--accent-teal)' },
              { icon: '✅', title: 'Claim & Recover', desc: 'Submit a claim, get admin approval, and get your item back.', color: 'var(--accent-green)' },
            ].map(f => (
              <div className="card" key={f.title} style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                <div style={{ fontSize: '2rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '3rem 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Lost something on campus?</h2>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Register and submit a report to start finding possible matches instantly.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link href="/register" className="btn btn-primary">Create Account</Link>
            <Link href="/login" className="btn btn-secondary">Sign In</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
