'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  userId: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link href="/" className="navbar-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{stroke:'url(#grad)'}}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f9cf9"/>
                <stop offset="100%" stopColor="#a78bfa"/>
              </linearGradient>
            </defs>
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          Campus L&amp;F
        </Link>

        {/* Nav Links */}
        <div className="navbar-links">
          <Link href="/items" className={`nav-link ${isActive('/items') ? 'active' : ''}`}>Browse</Link>
          {user && (
            <Link href="/report" className={`nav-link ${isActive('/report') ? 'active' : ''}`}>Report Item</Link>
          )}
          {user && (
            <Link href="/claims" className={`nav-link ${isActive('/claims') ? 'active' : ''}`}>My Claims</Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} style={{color:'var(--accent-purple)'}}>Admin</Link>
          )}
        </div>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {user.name.split(' ')[0]}
                {user.role === 'ADMIN' && (
                  <span className="badge badge-purple" style={{ marginLeft: '0.4rem' }}>Admin</span>
                )}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
