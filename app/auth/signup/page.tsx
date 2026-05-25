// Signup & Onboarding Flow Page
// Location: /app/auth/signup/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, AlertCircle, ShieldCheck, Check } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  
  // Step 1: Account setup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = setup, 2 = onboarding questions

  // Step 2: Onboarding meta
  const [incomeRange, setIncomeRange] = useState('₹50,000 - ₹1,00,000');
  const [accountType, setAccountType] = useState<'salary' | 'business' | 'mixed'>('salary');
  const [primaryBank, setPrimaryBank] = useState('HDFC');
  const [primaryGoal, setPrimaryGoal] = useState('Save more');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setStep(2);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          income_range: incomeRange,
          account_type: accountType,
          primary_bank: primaryBank,
          primary_goal: primaryGoal
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Registration failed');
      }

      // Save user session in localStorage for immediate frontend access
      localStorage.setItem('smartmoney_user', JSON.stringify(json.data.profile));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div className="clay-card animate-fade-in" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem' }}>
        
        {/* Progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '1.75rem', height: '1.75rem', borderRadius: '50%',
              background: '#7c3aed', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>1</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: step === 1 ? '#111827' : '#94a3b8' }}>Account setup</span>
          </div>
          <div style={{ flex: 1, height: '2px', background: step === 2 ? '#7c3aed' : '#cbd5e1', margin: '0 1rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '1.75rem', height: '1.75rem', borderRadius: '50%',
              background: step === 2 ? '#ea580c' : '#cbd5e1', 
              color: step === 2 ? '#ffffff' : '#64748b', 
              fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>2</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: step === 2 ? '#111827' : '#94a3b8' }}>Smart Tuning</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#ede9fe', color: '#7c3aed', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            <Sparkles style={{ width: '0.8rem', height: '0.8rem' }} />
            <span>MEMBER REGISTRATION</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>
            {step === 1 ? 'Start Your Mirror Account' : 'Pre-Tune Category Rules'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {step === 1 ? 'Setup secure password access to your mirror.' : 'Four onboarding inputs let our parser customize maps from day one.'}
          </p>
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

        {/* STEP 1: ACCOUNT CREDENTIALS */}
        {step === 1 && (
          <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
              <input 
                type="email" required placeholder="e.g. user@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Password (min 6 chars)</label>
              <input 
                type="password" required placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Confirm Password</label>
              <input 
                type="password" required placeholder="••••••••"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
              />
            </div>

            <button type="submit" className="clay-btn clay-btn-black" style={{ marginTop: '0.5rem' }}>
              <span>Continue to Smart Onboarding</span>
              <ArrowRight className="clay-btn-arrow" />
            </button>
          </form>
        )}

        {/* STEP 2: ONBOARDING SURVEY */}
        {step === 2 && (
          <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Q1: Income bracket */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Monthly Income Range</label>
              <select 
                value={incomeRange} onChange={(e) => setIncomeRange(e.target.value)}
                className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', background: '#eef2f6', border: 'none', appearance: 'none', WebkitAppearance: 'none' }}
              >
                <option value="Under ₹50,000">Under ₹50,000</option>
                <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                <option value="Above ₹2,50,000">Above ₹2,50,000</option>
              </select>
            </div>

            {/* Q2: Account type */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Account Category Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                {['salary', 'business', 'mixed'].map((type) => (
                  <button
                    key={type} type="button"
                    onClick={() => setAccountType(type as any)}
                    className="clay-subcard"
                    style={{
                      border: accountType === type ? '2px solid #ea580c' : 'none',
                      boxShadow: accountType === type ? 'var(--shadow-inset-sm)' : 'var(--shadow-outset-sm)',
                      background: '#ffffff',
                      padding: '0.75rem 0.25rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: accountType === type ? '#ea580c' : '#475569',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Primary Bank */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Primary Institutional Bank</label>
              <select 
                value={primaryBank} onChange={(e) => setPrimaryBank(e.target.value)}
                className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', background: '#eef2f6', border: 'none', appearance: 'none', WebkitAppearance: 'none' }}
              >
                <option value="HDFC">HDFC Bank</option>
                <option value="SBI">State Bank of India (SBI)</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="Axis">Axis Bank</option>
                <option value="Kotak">Kotak Mahindra Bank</option>
                <option value="Yes">Yes Bank</option>
                <option value="PNB">Punjab National Bank (PNB)</option>
                <option value="BOB">Bank of Baroda (BOB)</option>
                <option value="Other">Other Bank</option>
              </select>
            </div>

            {/* Q4: Primary goal */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Primary Goal Focus</label>
              <select 
                value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)}
                className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', background: '#eef2f6', border: 'none', appearance: 'none', WebkitAppearance: 'none' }}
              >
                <option value="Save more">Maximize Savings Compounding</option>
                <option value="Get out of debt">Reduce & Eliminate Liabilities</option>
                <option value="Just track">Understand Basic Cash Flow</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" onClick={() => setStep(1)}
                className="clay-subcard"
                style={{
                  flex: 1, border: 'none', padding: '0.75rem', borderRadius: '16px',
                  fontWeight: 700, fontSize: '0.95rem', color: '#64748b', cursor: 'pointer'
                }}
              >
                Back
              </button>

              <button 
                type="submit" disabled={loading}
                className="clay-btn clay-btn-orange" 
                style={{ flex: 2, padding: '0.75rem 1.5rem', opacity: loading ? 0.7 : 1 }}
              >
                <span>{loading ? 'Creating Mirror...' : 'Save & Onboard'}</span>
                <Check className="clay-btn-arrow" />
              </button>
            </div>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
          <ShieldCheck style={{ width: '1rem', height: '1rem', color: '#10b981' }} />
          <span>Local Mirroring Sandbox — Under Company Policies</span>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
          Already have an account? <Link href="/auth/login" style={{ color: '#7c3aed', fontWeight: 700 }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}
