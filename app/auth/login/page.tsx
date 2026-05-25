// Login Page
// Location: /app/auth/login/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Invalid credentials');
      }

      // Save user session in localStorage for fast UI rendering
      localStorage.setItem('smartmoney_user', JSON.stringify(json.data.profile));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Premium OAuth mock link
    setError(null);
    setEmail('developer@example.com');
    setPassword('demo-developer-pass');
    setError('Demo Credentials loaded! Click "Login Securely" to continue.');
  };

  return (
    <div style={{
      background: '#eef2f6',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="clay-card animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#ede9fe', color: '#7c3aed', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Sparkles style={{ width: '0.8rem', height: '0.8rem' }} />
            <span>SMART MONEY LOGIN</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>Welcome Back</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Access your passive financial mirror dashboard.</p>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ffedd5',
            color: '#ea580c',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <AlertCircle style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="e.g. user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="clay-inset"
              style={{ width: '100%', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Password</label>
              <a href="#" style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>Forgot password?</a>
            </div>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="clay-inset"
              style={{ width: '100%', fontSize: '0.95rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="clay-btn clay-btn-black" 
            style={{ marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
          >
            <span>{loading ? 'Authenticating...' : 'Login Securely'}</span>
            <LogIn className="clay-btn-arrow" />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>OR MOCK AUTH</span>
          <div style={{ flex: 1, height: '1px', background: '#cbd5e1' }} />
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="clay-subcard"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '16px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#475569',
            cursor: 'pointer',
            background: '#ffffff'
          }}
        >
          <img src="https://www.google.com/favicon.ico" alt="Google logo" style={{ width: '1rem', height: '1rem' }} />
          <span>Load Developer Test Account</span>
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          New to Smart Money? <Link href="/auth/signup" style={{ color: '#7c3aed', fontWeight: 700 }}>Onboard Here</Link>
        </p>
      </div>
    </div>
  );
}
