"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    if (res?.error) {
      setStatus('error');
    } else {
      // Refresh to get new session
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="container" style={{ padding: "6rem 0", display: "flex", justifyContent: "center" }}>
      <div className="glass-panel" style={{ padding: "3rem", width: "100%", maxWidth: "450px" }}>
        <h1 className="heading-lg" style={{ marginBottom: "0.5rem", textAlign: "center" }}>Login</h1>
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "2.5rem" }}>
          Welcome back to CSUNHousing
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {status === 'error' && (
            <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "var(--radius-md)" }}>
              Invalid email or password.
            </div>
          )}
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="owner@example.com" 
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)", fontSize: "1rem" }} 
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
              style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)", fontSize: "1rem" }} 
            />
          </div>
          
          <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
            {status === 'loading' ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Want to list your properties? <Link href="/auth/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
