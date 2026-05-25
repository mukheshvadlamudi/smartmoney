// Minimalist Guest Landing Page
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
    <div style={{ background: '#fcfcfc', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
      {/* HEADER NAVBAR */}
      <nav style={{
        padding: '1.25rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #f1f5f9'
      }}>
        {/* Unified Smart Money by Futurelab Studios Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#000000', letterSpacing: '-0.02em', margin: 0 }}>
            SMART MONEY
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
            <span style={{ fontSize: '0.55rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1 }}>by</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>Futurelab Studios</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/calculators" style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>Calculators Suite</Link>
          <Link href="/auth/login" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>Login</Link>
          <Link href="/auth/signup" className="clay-subcard" style={{
            background: '#000000',
            color: '#ffffff',
            padding: '0.45rem 1.15rem',
            borderRadius: '9999px',
            fontSize: '0.9rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: 'none',
            border: 'none'
          }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main style={{ flex: 1, padding: '3.5rem 2rem max(5rem, 7vh) 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: '#f1f5f9', 
            color: '#475569', 
            padding: '0.35rem 0.9rem', 
            borderRadius: '9999px', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem' 
          }}>
            <Sparkles style={{ width: '0.85rem', height: '0.85rem' }} />
            <span>CONFIDENTIAL FINANCIAL MIRROR — MATH IS NOT ADVICE</span>
          </div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: '1.25rem' }}>
            Understand Where Your <br/>
            <span style={{ color: '#000000' }}>Money Goes.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '560px', margin: '0 auto 2.25rem auto', lineHeight: 1.5 }}>
            Track spending, set category budgets, and calculate compound growth. Smart Money is a secure sub-website under the company domain — no banking logins required.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <Link href="/auth/signup" style={{ 
              background: '#0f172a',
              color: '#ffffff',
              padding: '0.85rem 2.25rem',
              borderRadius: '9999px',
              fontSize: '0.95rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)'
            }}>
              <span>Onboard & Start Uploading</span>
              <ArrowRight style={{ width: '1.1rem', height: '1.1rem' }} />
            </Link>
          </div>
        </div>

        {/* FEATURES CARDS GRID */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '5rem'
        }}>
          {/* Card 1 */}
          <div className="clay-card" style={{ padding: '2rem', borderRadius: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="clay-icon-container" style={{ background: '#f1f5f9', color: '#0f172a', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <UploadCloud style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Bank Upload Parsing</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Upload your raw PDF or CSV statement. Our built-in bank templates extract transactions, dates, and debit/credit columns instantly.
            </p>
            <div style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: '#f1f5f9',
              color: '#475569',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              letterSpacing: '0.06em'
            }}>SECURE & PRIVATE</div>
          </div>

          {/* Card 2 */}
          <div className="clay-card" style={{ padding: '2rem', borderRadius: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="clay-icon-container" style={{ background: '#f1f5f9', color: '#0f172a', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <PieChart style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Smart Payee Dictionary</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Ambiguous UPI hashes and merchant strings are flagged for a one-tap review. Once you categorize a payee, the dictionary remembers it forever.
            </p>
            <div style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: '#f1f5f9',
              color: '#475569',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              letterSpacing: '0.06em'
            }}>AUTO-LEARNING ENGINE</div>
          </div>

          {/* Card 3 */}
          <div className="clay-card" style={{ padding: '2rem', borderRadius: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
            <div className="clay-icon-container" style={{ background: '#f1f5f9', color: '#0f172a', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>Legally Compliant Math</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              No investment suggestions, recommendations, or stock tickers. It is a financial mirror showing your assets, calculations, and mathematical projections.
            </p>
            <div style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: 700,
              background: '#0f172a',
              color: '#ffffff',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              letterSpacing: '0.06em'
            }}>NO SEBI LICENSE NEEDED</div>
          </div>
        </section>

        {/* DEMO PREVIEW CALCULATORS IN SHAPES */}
        <section className="clay-card" style={{ marginBottom: '3.5rem', padding: '2.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Try Our Returns Calculators</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Instantly project compound returns from mutual funds or bank deposits.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
            {/* 1. SIP Guest Calculator */}
            <div className="clay-subcard" style={{ padding: '1.75rem', background: '#f8fafc', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator style={{ width: '1.1rem', height: '1.1rem', color: '#64748b' }} />
                <span>Mutual Fund SIP Projections</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Monthly SIP (₹)</label>
                  <input 
                    type="range" min="1000" max="100000" step="1000" value={sipAmt}
                    onChange={(e) => setSipAmt(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0f172a' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginTop: '0.15rem' }}>
                    <span>₹1,000</span>
                    <span style={{ color: '#0f172a' }}>₹{sipAmt.toLocaleString('en-IN')}</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Expected Return (%)</label>
                  <input 
                    type="range" min="5" max="30" step="1" value={sipReturn}
                    onChange={(e) => setSipReturn(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0f172a' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginTop: '0.15rem' }}>
                    <span>5%</span>
                    <span style={{ color: '#0f172a' }}>{sipReturn}%</span>
                    <span>30%</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Duration (Years)</label>
                  <input 
                    type="range" min="1" max="30" step="1" value={sipYears}
                    onChange={(e) => setSipYears(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0f172a' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginTop: '0.15rem' }}>
                    <span>1 Yr</span>
                    <span style={{ color: '#0f172a' }}>{sipYears} Yrs</span>
                    <span>30 Yrs</span>
                  </div>
                </div>
              </div>

              {/* SIP Outputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Invested</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>₹{sipRes.totalInvested.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Corpus</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000000' }}>₹{sipRes.estimatedCorpus.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* 2. FD Guest Calculator */}
            <div className="clay-subcard" style={{ padding: '1.75rem', background: '#f8fafc', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp style={{ width: '1.1rem', height: '1.1rem', color: '#64748b' }} />
                <span>Fixed Deposit (FD) Yields</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Deposit Amount (₹)</label>
                  <input 
                    type="range" min="10000" max="1000000" step="10000" value={fdAmt}
                    onChange={(e) => setFdAmt(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0f172a' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginTop: '0.15rem' }}>
                    <span>₹10,000</span>
                    <span style={{ color: '#0f172a' }}>₹{fdAmt.toLocaleString('en-IN')}</span>
                    <span>₹10,00,000</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Interest Rate (%)</label>
                  <input 
                    type="range" min="3" max="12" step="0.1" value={fdRate}
                    onChange={(e) => setFdRate(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0f172a' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginTop: '0.15rem' }}>
                    <span>3%</span>
                    <span style={{ color: '#0f172a' }}>{fdRate}%</span>
                    <span>12%</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Tenure (Years)</label>
                  <input 
                    type="range" min="1" max="10" step="1" value={fdYears}
                    onChange={(e) => setFdYears(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#0f172a' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginTop: '0.15rem' }}>
                    <span>1 Yr</span>
                    <span style={{ color: '#0f172a' }}>{fdYears} Yrs</span>
                    <span>10 Yrs</span>
                  </div>
                </div>
              </div>

              {/* FD Outputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#ffffff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interest Earned</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#475569' }}>₹{fdRes.interestEarned.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Maturity Amount</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000000' }}>₹{fdRes.maturityAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            Disclaimer: These math projections compile standard quarterly and monthly compound interest formulas. Mutual fund returns are estimated; actual returns depend on market performances.
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        fontSize: '0.85rem'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', letterSpacing: '0.05em' }}>
            <span>SMART MONEY</span>
          </p>
          <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            by Futurelab Studios
          </p>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.25rem auto', fontSize: '0.75rem', lineHeight: 1.5, color: '#64748b' }}>
            This application is hosted strictly as a passive mirroring system under the company domain. Smart Money performs mathematical returns projections and statement parsing categorization. No advisory, brokerage, banking APIs, or investment selections are offered.
          </p>
          <p style={{ fontSize: '0.7rem', color: '#475569' }}>
            © 2026 Smart Money. All rights reserved. Confidentially built with Next.js, Supabase, and Vercel.
          </p>
        </div>
      </footer>
    </div>
  );
}
