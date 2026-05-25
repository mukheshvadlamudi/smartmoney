// Calculators Suite Page
// Location: /app/calculators/page.tsx

'use client';

import { useState } from 'react';
import Navigation from '@/components/Shared/Navigation';
import Link from 'next/link';
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Coins, 
  Percent, 
  Layers, 
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Check,
  Calendar
} from 'lucide-react';
import { 
  calculateFD, 
  calculateSIP, 
  calculateLumpSum, 
  calculatePPF, 
  calculateRD, 
  compareInstruments 
} from '@/lib/calculators';

type CalcTab = 'compare' | 'fd' | 'sip' | 'lumpsum' | 'ppf' | 'rd';

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<CalcTab>('compare');

  // Comparison inputs
  const [compAmt, setCompAmt] = useState('10000');
  const [compYears, setCompYears] = useState('5');

  // FD inputs
  const [fdAmt, setFdAmt] = useState('100000');
  const [fdRate, setFdRate] = useState('7.0');
  const [fdYears, setFdYears] = useState('5');
  const [fdPayout, setFdPayout] = useState<'monthly' | 'quarterly' | 'maturity'>('maturity');
  const [fdSenior, setFdSenior] = useState(false);

  // SIP inputs
  const [sipAmt, setSipAmt] = useState('10000');
  const [sipReturn, setSipReturn] = useState('12.0');
  const [sipYears, setSipYears] = useState('10');

  // Lump Sum inputs
  const [lumpAmt, setLumpAmt] = useState('100000');
  const [lumpReturn, setLumpReturn] = useState('12.0');
  const [lumpYears, setLumpYears] = useState('10');

  // PPF inputs
  const [ppfAmt, setPpfAmt] = useState('150000');
  const [ppfYears, setPpfYears] = useState('15');

  // RD inputs
  const [rdAmt, setRdAmt] = useState('5000');
  const [rdRate, setRdRate] = useState('7.0');
  const [rdMonths, setRdMonths] = useState('24');

  // Calculation Results
  const compRes = compareInstruments(Number(compAmt) || 10000, Number(compYears) || 5);
  const fdRes = calculateFD(Number(fdAmt) || 100000, Number(fdRate) || 7, Number(fdYears) || 5, fdPayout, fdSenior);
  const sipRes = calculateSIP(Number(sipAmt) || 10000, Number(sipReturn) || 12, Number(sipYears) || 10);
  const lumpRes = calculateLumpSum(Number(lumpAmt) || 100000, Number(lumpReturn) || 12, Number(lumpYears) || 10);
  const ppfRes = calculatePPF(Number(ppfAmt) || 150000, Number(ppfYears) || 15);
  const rdRes = calculateRD(Number(rdAmt) || 5000, Number(rdRate) || 7, Number(rdMonths) || 24);

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh' }}>
      <Navigation />
      
      <div className="app-container">
        
        <div className="page-header">
          <div>
            <h2 className="page-title">Returns Calculator Suite</h2>
            <p className="page-subtitle">Passive mathematical modeling tools for systematic or lump sum savings. Math is not advice.</p>
          </div>
        </div>

        {/* 1. HORIZONTAL CLAY TAB SELECTOR */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          background: '#ffffff',
          padding: '0.75rem',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-outset-sm)',
          border: '1px solid rgba(255,255,255,0.7)',
          marginBottom: '2.5rem'
        }}>
          {[
            { id: 'compare', name: 'Side-by-Side Comparison', icon: Layers },
            { id: 'sip', name: 'Mutual Fund SIP', icon: Calculator },
            { id: 'fd', name: 'Fixed Deposit (FD)', icon: TrendingUp },
            { id: 'lumpsum', name: 'Lump Sum Mutual Fund', icon: Percent },
            { id: 'ppf', name: 'Public Provident Fund (PPF)', icon: PiggyBank },
            { id: 'rd', name: 'Recurring Deposit (RD)', icon: Coins }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="clay-subcard"
                style={{
                  border: 'none',
                  background: isActive ? '#7c3aed' : '#ffffff',
                  boxShadow: isActive ? 'var(--shadow-inset-sm)' : 'var(--shadow-outset-sm)',
                  color: isActive ? '#ffffff' : '#475569',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon style={{ width: '1rem', height: '1rem' }} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* 2. TABBED CALCULATORS LAYOUT */}
        <div className="animate-fade-in">
          
          {/* TAB A: SIDE-BY-SIDE COMPARATIVE GRID */}
          {activeTab === 'compare' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              
              {/* Comparative inputs */}
              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Compare Instruments</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Enter a planned monthly deposit contribution to see projections across Recurring Deposits, Tax-Free PPFs, and Mutual Fund SIPs.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Monthly Savings Budget (₹)
                    </label>
                    <input 
                      type="number" value={compAmt}
                      onChange={(e) => setCompAmt(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Investment Tenure (Years)
                    </label>
                    <select
                      value={compYears}
                      onChange={(e) => setCompYears(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', background: '#eef2f6', border: 'none', fontWeight: 700 }}
                    >
                      {[1, 2, 3, 5, 10, 15, 20, 25, 30].map(y => (
                        <option key={y} value={y}>{y} Years</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Side-by-side columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
                {/* 1. RD (Secured Compounder) */}
                <div className="clay-card" style={{ background: '#f0f9ff', border: '1px solid rgba(14, 165, 233, 0.25)' }}>
                  <div className="clay-icon-container" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <Calendar className="w-5 h-5" style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0284c7', marginBottom: '0.25rem' }}>{compRes.rd.label}</h4>
                  <span style={{ fontSize: '0.65rem', color: '#0284c7', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SECURED BANK INSTRUMENT</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0 1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(14, 165, 233, 0.15)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#0284c7' }}>Total Deposited</span>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>₹{compRes.rd.invested.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(14, 165, 233, 0.15)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#0284c7' }}>Interest Yield</span>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981' }}>₹{compRes.rd.interest.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7' }}>Maturity Value</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>₹{compRes.rd.finalValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* 2. PPF (Government scheme) */}
                <div className="clay-card" style={{ background: '#fff7ed', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                  <div className="clay-icon-container" style={{ background: '#ffedd5', color: '#ea580c' }}>
                    <PiggyBank className="w-5 h-5" style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ea580c', marginBottom: '0.25rem' }}>{compRes.ppf.label}</h4>
                  <span style={{ fontSize: '0.65rem', color: '#ea580c', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SEC 80C TAX EXEMPT</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0 1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(249, 115, 22, 0.15)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#ea580c' }}>Total Contributed</span>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>₹{compRes.ppf.invested.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(249, 115, 22, 0.15)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#ea580c' }}>Tax-Free Earnings</span>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981' }}>₹{compRes.ppf.interest.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>Maturity Value</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ea580c' }}>₹{compRes.ppf.finalValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Equity Mutual Fund SIP */}
                <div className="clay-card" style={{ background: '#f5f3ff', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                  <div className="clay-icon-container" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                    <Calculator className="w-5 h-5" style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#7c3aed', marginBottom: '0.25rem' }}>{compRes.sip.label}</h4>
                  <span style={{ fontSize: '0.65rem', color: '#7c3aed', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>EQUITY WEALTH COMPOUNDER</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2rem 0 1rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(139, 92, 246, 0.15)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7c3aed' }}>Total Invested</span>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>₹{compRes.sip.invested.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(139, 92, 246, 0.15)', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', color: '#7c3aed' }}>Estimated Growth</span>
                      <span style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981' }}>₹{compRes.sip.interest.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c3aed' }}>Maturity Value</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#7c3aed' }}>₹{compRes.sip.finalValue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer footer banner */}
              <div style={{ display: 'flex', gap: '0.5rem', background: '#fffad6', padding: '1rem 1.5rem', borderRadius: '16px', fontSize: '0.85rem', color: '#854d0e', fontWeight: 600, border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                <span><strong>Pasive Mathematical Projections Note:</strong> {compRes.disclaimer}</span>
              </div>

            </div>
          )}

          {/* TAB B: MUTUAL FUND SIP DETAILS */}
          {activeTab === 'sip' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed', marginBottom: '1.5rem' }}>SIP Parameters</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Monthly Addition (₹)</label>
                    <input 
                      type="number" value={sipAmt} onChange={(e) => setSipAmt(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Expected Compound Yield (% p.a.)</label>
                    <input 
                      type="number" step="0.5" value={sipReturn} onChange={(e) => setSipReturn(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tenure duration (Years)</label>
                    <input 
                      type="number" value={sipYears} onChange={(e) => setSipYears(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Corpus Accumulations</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Capital Invested</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>₹{sipRes.totalInvested.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Estimated Wealth Gains</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>₹{sipRes.totalWealthGain.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#7c3aed' }}>Future Valuation (Est.)</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed' }}>₹{sipRes.estimatedCorpus.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>Yearly Compounding Schedule</h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)' }}>
                  {sipRes.yearlyBreakdown.map(y => (
                    <div key={y.year} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 700, color: '#475569' }}>Year {y.year}</span>
                      <span style={{ color: '#64748b' }}>Valuation: <strong style={{ color: '#1e293b' }}>₹{y.estimatedCorpus.toLocaleString('en-IN')}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB C: FIXED DEPOSIT (FD) */}
          {activeTab === 'fd' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ea580c', marginBottom: '1.5rem' }}>FD Parameters</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Principal Deposit (₹)</label>
                    <input 
                      type="number" value={fdAmt} onChange={(e) => setFdAmt(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Interest Rate (% p.a.)</label>
                      <input 
                        type="number" step="0.1" value={fdRate} onChange={(e) => setFdRate(e.target.value)}
                        className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tenure duration (Yrs)</label>
                      <input 
                        type="number" value={fdYears} onChange={(e) => setFdYears(e.target.value)}
                        className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Payout Frequency</label>
                    <select
                      value={fdPayout} onChange={(e) => setFdPayout(e.target.value as any)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', background: '#eef2f6', border: 'none' }}
                    >
                      <option value="maturity">Compounded Quarterly (At Maturity)</option>
                      <option value="quarterly">Quarterly Payouts</option>
                      <option value="monthly">Monthly Compounded Payouts</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '12px', boxShadow: 'var(--shadow-outset-sm)' }}>
                    <input 
                      type="checkbox" id="senior" checked={fdSenior} onChange={(e) => setFdSenior(e.target.checked)}
                      style={{ accentColor: '#ea580c', width: '1.1rem', height: '1.1rem' }}
                    />
                    <label htmlFor="senior" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                      Senior Citizen Rate (+0.5% rate bonus)
                    </label>
                  </div>
                </div>
              </div>

              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>FD Earnings Breakdown</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Principal Amount</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>₹{fdRes.principal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Effective Annual Yield</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed' }}>{fdRes.effectiveAnnualYield}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Interest Accumulated</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>₹{fdRes.interestEarned.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>Valuation at Maturity</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ea580c' }}>₹{fdRes.maturityAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '1rem', borderRadius: '16px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, color: '#94a3b8' }} />
                  <span><strong>Tax Note (30% Bracket):</strong> Inward interest earnings are fully taxable. Estimated tax liability: ₹{fdRes.taxImpactEst.toLocaleString('en-IN')}. This is informational only, not advice.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB D: LUMP SUM MUTUAL FUND */}
          {activeTab === 'lumpsum' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Lump Sum Parameters</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>One-time Contribution (₹)</label>
                    <input 
                      type="number" value={lumpAmt} onChange={(e) => setLumpAmt(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Expected Compound CAGR Return (%)</label>
                    <input 
                      type="number" step="0.5" value={lumpReturn} onChange={(e) => setLumpReturn(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tenure duration (Years)</label>
                    <input 
                      type="number" value={lumpYears} onChange={(e) => setLumpYears(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>
              </div>

              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Projections Output</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>One-time Principal</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>₹{lumpRes.principal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Absolute Valued Gain</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>₹{lumpRes.absoluteGain.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Model Compound CAGR</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7c3aed' }}>{lumpRes.cagr}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>Valuation on Maturity</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>₹{lumpRes.finalValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB E: PPF DETAILS */}
          {activeTab === 'ppf' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ea580c', marginBottom: '1.5rem' }}>PPF Parameters</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Public Provident Fund compounding is calculated at the fixed government interest rate of **7.1% p.a.** compounded annually.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                      Annual Contribution Amount (₹)
                    </label>
                    <input 
                      type="number" max="150000" min="500" value={ppfAmt} onChange={(e) => setPpfAmt(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>Note: Section 80C limits cap PPF at max ₹1,50,000/year.</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tenure duration (Years, min 15)</label>
                    <select
                      value={ppfYears} onChange={(e) => setPpfYears(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', background: '#eef2f6', border: 'none' }}
                    >
                      {[15, 20, 25, 30].map(y => (
                        <option key={y} value={y}>{y} Years</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Tax-Exempt Yield</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Contributed</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>₹{ppfRes.totalInvested.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Interest Gained</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>₹{ppfRes.interestEarned.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c' }}>Valuation on Maturity</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ea580c' }}>₹{ppfRes.maturityValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: '#d1fae5', padding: '1rem', borderRadius: '16px', fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>
                  <Check style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, color: '#10b981' }} />
                  <span><strong>Sec 80C EEE Status:</strong> PPF investments, compound earnings, and final maturity lump sums are fully tax-exempt in India.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB F: RD DETAILS */}
          {activeTab === 'rd' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem' }}>
              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>RD Parameters</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Monthly Installment (₹)</label>
                    <input 
                      type="number" value={rdAmt} onChange={(e) => setRdAmt(e.target.value)}
                      className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Interest Rate (% p.a.)</label>
                      <input 
                        type="number" step="0.1" value={rdRate} onChange={(e) => setRdRate(e.target.value)}
                        className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Tenure duration (Months)</label>
                      <input 
                        type="number" value={rdMonths} onChange={(e) => setRdMonths(e.target.value)}
                        className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>RD Valuation Breakdown</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Capital Deposited</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>₹{rdRes.totalDeposited.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Quarterly Compound Yield</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>₹{rdRes.interestEarned.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827' }}>Maturity Valuation</span>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827' }}>₹{rdRes.maturityAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '1rem', borderRadius: '16px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  <ShieldAlert style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, color: '#94a3b8' }} />
                  <span>Recurring Deposit yields are compounded quarterly at standard bank formulas. Interest is taxable according to individual tax bracket rates.</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
