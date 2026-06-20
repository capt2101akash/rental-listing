"use client";
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', borderBottom: '4px solid #111111', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link href="/" style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          CSUN<span style={{ fontWeight: 300 }}>Housing</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <Link href="/properties" style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', transition: 'background-color 0.2s', backgroundColor: 'rgba(255,255,255,0.1)' }}>
            Properties
          </Link>
          
          {session ? (
            <>
              {(session.user as any)?.role === "ADMIN" ? (
                <Link href="/admin" style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: '#111111', color: 'white' }}>Admin Console</Link>
              ) : (
                <Link href="/dashboard" style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: '#111111', color: 'white' }}>Dashboard</Link>
              )}
              <Link href="/settings" style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', transition: 'background-color 0.2s', backgroundColor: 'rgba(255,255,255,0.1)' }}>Settings</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} style={{ fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: 'white', color: 'var(--primary)' }}>Logout</button>
            </>
          ) : (
            <Link href="/auth/login" style={{ fontWeight: 600, padding: '0.5rem 1.5rem', borderRadius: '999px', backgroundColor: 'white', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
