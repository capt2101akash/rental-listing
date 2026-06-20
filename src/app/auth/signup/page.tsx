"use client";
import { useState } from 'react';
import Link from 'next/link';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';

export default function SignupPage() {
  const [formData, setFormData] = useState({ email: '', phone: '', address: '', password: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      setStatus('success');
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="container" style={{ padding: "6rem 0", display: "flex", justifyContent: "center" }}>
      <div className="glass-panel" style={{ padding: "3rem", width: "100%", maxWidth: "500px" }}>
        <h1 className="heading-lg" style={{ marginBottom: "0.5rem", textAlign: "center" }}>Owner Signup</h1>
        <p style={{ color: "var(--text-muted)", textAlign: "center", marginBottom: "2.5rem" }}>
          Apply to list your properties on CSUNHousing
        </p>
        
        {status === 'success' ? (
          <div style={{ textAlign: "center", padding: "2rem", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "var(--radius-md)", color: "#10B981" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Request Submitted!</h3>
            <p style={{ color: "var(--text-main)" }}>Your application is pending admin approval. You will be notified once approved.</p>
            <Link href="/" className="btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>Return Home</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {status === 'error' && (
              <div style={{ padding: "1rem", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "var(--radius-md)" }}>
                {errorMessage}
              </div>
            )}
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="owner@example.com" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)" }} />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Phone Number</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(555) 123-4567" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)" }} />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Property Address (or primary location)</label>
              <AddressAutocomplete 
                name="address" 
                required 
                placeholder="Address" 
                style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", width: "100%" }} 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                onPlaceSelected={(address) => setFormData({...formData, address})}
              />
            </div>
            
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}>Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", backgroundColor: "var(--surface)", color: "var(--text-main)" }} />
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Set a password for your account. You will use this once approved.</p>
            </div>
            
            <button type="submit" disabled={status === 'loading'} className="btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
              {status === 'loading' ? 'Submitting...' : 'Submit Request'}
            </button>
            
            <div style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Already have an account? <Link href="/auth/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Login here</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
