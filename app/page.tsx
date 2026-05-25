// Guest Landing Page
// Location: /app/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  UploadCloud, 
  TrendingUp, 
  PieChart, 
  Calculator 
} from 'lucide-react';
import { calculateSIP, calculateFD } from '@/lib/calculators';

export default function LandingPage() {
  const [sipAmt, setSipAmt] = useState(10000);
  const [sipYears, setSipYears] = useState(5);
  const [sipReturn, setSipReturn] = useState(12);

  const [fdAmt, setFdAmt] = useState(100000);
  const [fdRate, setFdRate] = useState(7);
  const [fdYears, setFdYears] = useState(3);

  // Calculations
  const sipRes = calculateSIP(sipAmt, sipReturn, sipYears);
  const fdRes = calculateFD(fdAmt, fdRate, fdYears, 'maturity', false);

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER NAVBAR */}
      <nav style={{
        padding: '1.5rem 3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.3)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#000000', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <span>SMART MONEY</span>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>by</span>
            <img src="/logo.png" alt="Futurelab Studios" style={{ height: '0.75rem', width: 'auto', display: 'block', transform: 'translateY(-0.5px)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/calculators" style={{ color: '#475569', fontWeight: 600, fontSize: '0.95rem' }}>Calculators Suite</Link>
          <Link href="/auth/login" style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.95rem' }}>Login</Link>
          <Link href="/auth/signup" className="clay-subcard" style={{
            background: '#7c3aed',
            color: '#ffffff',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.95rem',
            fontWeight: 700,
            boxShadow: 'none',
            border: 'none'
          }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main style={{ flex: 1, padding: '4rem 2rem max(6rem, 8vh) 2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ede9fe', color: '#7c3aed', padding: '0.35rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <Sparkles style={{ width: '1rem', height: '1rem' }} />
            <span>CONFIDENTIAL FINANCIAL MIRROR — MATH IS NOT ADVICE</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#111827', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Understand Where Your <br/>
            <span style={{ background: 'linear-gradient(135deg, #7c3aed, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Money Goes.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: 1.5 }}>
            Track spending, set category budgets, and calculate compound growth. Smart Money is a secure sub-website under the company domain — no banking logins required.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href="/auth/signup" className="clay-btn clay-btn-purple" style={{ width: 'auto', padding: '1rem 2.5rem', borderRadius: '9999px', gap: '1rem' }}>
              <span>Onboard & Start Uploading</span>
              <ArrowRight className="clay-btn-arrow" />
            </Link>
          </div>
        </div>

        {/* FEATURES CARDS GRID */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem',
          marginBottom: '6rem'
        }}>
          {/* Card 1 */}
          <div className="clay-card">
            <div className="clay-icon-container" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <UploadCloud style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#111827' }}>Bank Upload Parsing</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Upload your raw PDF or CSV statement. Our built-in bank templates extract transactions, dates, and debit/credit columns instantly.
            </p>
            <div className="pill-badge pill-badge-purple">SECURE & PRIVATE</div>
          </div>

          {/* Card 2 */}
          <div className="clay-card">
            <div className="clay-icon-container" style={{ background: '#ffedd5', color: '#ea580c' }}>
              <PieChart style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#111827' }}>Smart Payee Dictionary</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Ambiguous UPI hashes and merchant strings are flagged for a one-tap review. Once you categorize a payee, the dictionary remembers it forever.
            </p>
            <div className="pill-badge pill-badge-orange">AUTO-LEARNING ENGINE</div>
          </div>

          {/* Card 3 */}
          <div className="clay-card">
            <div className="clay-icon-container" style={{ background: '#f3f4f6', color: '#111827' }}>
              <ShieldCheck style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#111827' }}>Legally Compliant Math</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              No investment suggestions, recommendations, or stock tickers. It is a financial mirror showing your assets, calculations, and mathematical projections.
            </p>
            <div className="pill-badge pill-badge-black">NO SEBI LICENSE NEEDED</div>
          </div>
        </section>

        {/* DEMO PREVIEW CALCULATORS IN SHAPES */}
        <section className="clay-card" style={{ marginBottom: '4rem', padding: '3rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>Try Our Returns Calculators</h2>
            <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Instantly project compound returns from mutual funds or bank deposits.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
            {/* 1. SIP Guest Calculator */}
            <div className="clay-subcard" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#7c3aed', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Mutual Fund SIP Projections</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Monthly SIP (₹)</label>
                  <input 
                    type="range" min="1000" max="100000" step="1000" value={sipAmt}
                    onChange={(e) => setSipAmt(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#7c3aed' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '0.25rem' }}>
                    <span>₹1,000</span>
                    <span style={{ color: '#7c3aed' }}>₹{sipAmt.toLocaleString('en-IN')}</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Expected Return (%)</label>
                  <input 
                    type="range" min="5" max="30" step="1" value={sipReturn}
                    onChange={(e) => setSipReturn(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#7c3aed' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '0.25rem' }}>
                    <span>5%</span>
                    <span style={{ color: '#7c3aed' }}>{sipReturn}%</span>
                    <span>30%</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Duration (Years)</label>
                  <input 
                    type="range" min="1" max="30" step="1" value={sipYears}
                    onChange={(e) => setSipYears(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#7c3aed' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '0.25rem' }}>
                    <span>1 Yr</span>
                    <span style={{ color: '#7c3aed' }}>{sipYears} Yrs</span>
                    <span>30 Yrs</span>
                  </div>
                </div>
              </div>

              {/* SIP Outputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f5f7fa', padding: '1rem', borderRadius: '12px', boxShadow: 'inset 2px 2px 5px #cbd5e1' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Total Invested</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>₹{sipRes.totalInvested.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Estimated Corpus</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#7c3aed' }}>₹{sipRes.estimatedCorpus.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 2. FD Guest Calculator */}
            <div className="clay-subcard" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ea580c', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Fixed Deposit (FD) Yields</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Deposit Amount (₹)</label>
                  <input 
                    type="range" min="10000" max="1000000" step="10000" value={fdAmt}
                    onChange={(e) => setFdAmt(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#ea580c' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '0.25rem' }}>
                    <span>₹10,000</span>
                    <span style={{ color: '#ea580c' }}>₹{fdAmt.toLocaleString('en-IN')}</span>
                    <span>₹10,00,000</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Interest Rate (%)</label>
                  <input 
                    type="range" min="3" max="12" step="0.1" value={fdRate}
                    onChange={(e) => setFdRate(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#ea580c' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '0.25rem' }}>
                    <span>3%</span>
                    <span style={{ color: '#ea580c' }}>{fdRate}%</span>
                    <span>12%</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Tenure (Years)</label>
                  <input 
                    type="range" min="1" max="10" step="1" value={fdYears}
                    onChange={(e) => setFdYears(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#ea580c' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginTop: '0.25rem' }}>
                    <span>1 Yr</span>
                    <span style={{ color: '#ea580c' }}>{fdYears} Yrs</span>
                    <span>10 Yrs</span>
                  </div>
                </div>
              </div>

              {/* FD Outputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f5f7fa', padding: '1rem', borderRadius: '12px', boxShadow: 'inset 2px 2px 5px #cbd5e1' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Interest Earned</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>₹{fdRes.interestEarned.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block' }}>Maturity Amount</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ea580c' }}>₹{fdRes.maturityAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8' }}>
            Disclaimer: These math projections compile standard quarterly and monthly compound interest formulas. Mutual fund returns are estimated; actual returns depend on market performances.
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{
        background: '#111827',
        color: '#94a3b8',
        padding: '3rem 2rem',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span>SMART MONEY</span>
          </p>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            by Futurelab Studios
          </p>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto', fontSize: '0.8rem' }}>
            This application is hosted strictly as a passive mirroring system under the company domain. Smart Money performs mathematical returns projections and statement parsing categorization. No advisory, brokerage, banking APIs, or investment selections are offered.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>
            © 2026 Smart Money. All rights reserved. Confidentially built with Next.js, Supabase, and Vercel.
          </p>
        </div>
      </footer>
    </div>
  );
}
