"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', borderBottom: '4px solid #111111', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link href="/" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          CSUN<span style={{ fontWeight: 300 }}>Housing</span>
        </Link>
        
        {/* Mobile Menu Toggle Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ display: 'none', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? 'open' : ''}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <Link href="/properties" onClick={() => setIsMenuOpen(false)} style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', transition: 'background-color 0.2s', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            Properties
          </Link>
          
          {session ? (
            <>
              {(session.user as any)?.role === "ADMIN" ? (
                <Link href="/admin" onClick={() => setIsMenuOpen(false)} style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: '#111111', color: 'white' }}>Admin Console</Link>
              ) : (
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: '#111111', color: 'white' }}>Dashboard</Link>
              )}
              <Link href="/settings" onClick={() => setIsMenuOpen(false)} style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', transition: 'background-color 0.2s', backgroundColor: 'rgba(255,255,255,0.1)' }}>Settings</Link>
              <button onClick={() => { setIsMenuOpen(false); signOut({ callbackUrl: '/' }); }} style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: 'white', color: 'var(--primary)' }}>Logout</button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setIsMenuOpen(false)} style={{ fontWeight: 600, padding: '0.5rem 1.5rem', borderRadius: '999px', backgroundColor: 'white', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
