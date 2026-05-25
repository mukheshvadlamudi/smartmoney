// Net Worth Mirroring Page
// Location: /app/net-worth/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Shared/Navigation';
import { 
  Coins, 
  Plus, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';
import { NetWorthSnapshot } from '@/types';

export default function NetWorthPage() {
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  // Asset inputs
  const [savingsVal, setSavingsVal] = useState('150000');
  const [fdVal, setFdVal] = useState('200000');
  const [mfVal, setMfVal] = useState('350000');
  const [propVal, setPropVal] = useState('0');

  // Liability inputs
  const [ccVal, setCcVal] = useState('25000');
  const [loanVal, setLoanVal] = useState('120000');
  const [homeLoanVal, setHomeLoanVal] = useState('0');

  // Date selection
  const [snapshotDate, setSnapshotDate] = useState('2026-05-01');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSnapshots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/net-worth');
      const json = await res.json();
      setSnapshots(json.data || []);
    } catch (e) {
      console.error('Error fetching net worth:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Submit Snapshot Save
  const handleSaveSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const assets = {
      savings: parseFloat(savingsVal) || 0,
      fixed_deposits: parseFloat(fdVal) || 0,
      mutual_funds: parseFloat(mfVal) || 0,
      property: parseFloat(propVal) || 0
    };

    const liabilities = {
      credit_card: parseFloat(ccVal) || 0,
      personal_loan: parseFloat(loanVal) || 0,
      home_loan: parseFloat(homeLoanVal) || 0
    };

    try {
      const res = await fetch('/api/net-worth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot_date: snapshotDate,
          assets,
          liabilities
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');

      // Refresh snapshots
      const refreshRes = await fetch('/api/net-worth');
      const refreshJson = await refreshRes.json();
      setSnapshots(refreshJson.data || []);

      triggerToast('Net worth snapshot logged successfully');
    } catch (err: any) {
      alert(err.message || 'Error saving snapshot');
    } finally {
      setLoading(false);
    }
  };

  // Load selected snapshot values back into form inputs
  const handleLoadSnapshot = (snap: NetWorthSnapshot) => {
    setSnapshotDate(snap.snapshot_date);
    
    setSavingsVal(String(snap.assets.savings || 0));
    setFdVal(String(snap.assets.fixed_deposits || 0));
    setMfVal(String(snap.assets.mutual_funds || 0));
    setPropVal(String(snap.assets.property || 0));

    setCcVal(String(snap.liabilities.credit_card || 0));
    setLoanVal(String(snap.liabilities.personal_loan || 0));
    setHomeLoanVal(String(snap.liabilities.home_loan || 0));

    triggerToast(`Loaded snapshot data from ${snap.snapshot_date}`);
  };

  // Sum active entries
  const currentAssetsSum = (parseFloat(savingsVal) || 0) + (parseFloat(fdVal) || 0) + (parseFloat(mfVal) || 0) + (parseFloat(propVal) || 0);
  const currentLiabilitiesSum = (parseFloat(ccVal) || 0) + (parseFloat(loanVal) || 0) + (parseFloat(homeLoanVal) || 0);
  const currentNetWorth = currentAssetsSum - currentLiabilitiesSum;

  // Prepare custom responsive SVG chart coordinates
  // SVG size: width=500, height=200
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 30;

  const chartPoints = (() => {
    if (snapshots.length < 2) return '';
    
    const values = snapshots.map(s => Number(s.net_worth));
    const minVal = Math.min(...values) * 0.9; // give some margin
    const maxVal = Math.max(...values) * 1.1;
    const valRange = maxVal - minVal || 1;

    const points = snapshots.map((s, idx) => {
      const x = padding + (idx / (snapshots.length - 1)) * (chartWidth - 2 * padding);
      const y = chartHeight - padding - ((Number(s.net_worth) - minVal) / valRange) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    });

    return points.join(' ');
  })();

  const chartAreaPoints = (() => {
    if (!chartPoints) return '';
    // Append bottom right and bottom left points to close path for area filling
    const startX = padding;
    const endX = chartWidth - padding;
    const bottomY = chartHeight - padding;
    return `${startX},${bottomY} ${chartPoints} ${endX},${bottomY}`;
  })();

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh' }}>
      <Navigation />
      
      <div className="app-container">

        {/* TOAST SYSTEM */}
        {toastMessage && (
          <div style={{
            position: 'fixed', top: '5.5rem', right: '2rem',
            background: '#d1fae5', color: '#065f46', padding: '0.75rem 1.5rem',
            borderRadius: '9999px', boxShadow: 'var(--shadow-outset-sm)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000,
            fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(6, 95, 70, 0.2)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Check style={{ width: '1.1rem', height: '1.1rem', color: '#10b981' }} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="page-header">
          <div>
            <h2 className="page-title">Net Worth Tracker</h2>
            <p className="page-subtitle">Map assets and subtract liabilities to audit overall wealth trends.</p>
          </div>
        </div>

        {/* 1. VISUAL HISTORICAL AREA CHART */}
        {snapshots.length >= 2 && (
          <div className="clay-card animate-fade-in" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>Net Worth Compounding Trajectory</h3>
            
            <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="200" style={{ overflow: 'visible', minWidth: '400px' }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e2e8f0" strokeWidth="2" />

                {/* Filled Area */}
                <polygon points={chartAreaPoints} fill="url(#chartGrad)" />

                {/* Core Line */}
                <polyline points={chartPoints} fill="transparent" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />

                {/* Highlight Circle Dots */}
                {snapshots.map((s, idx) => {
                  const values = snapshots.map(v => Number(v.net_worth));
                  const minVal = Math.min(...values) * 0.9;
                  const maxVal = Math.max(...values) * 1.1;
                  const valRange = maxVal - minVal || 1;
                  const x = padding + (idx / (snapshots.length - 1)) * (chartWidth - 2 * padding);
                  const y = chartHeight - padding - ((Number(s.net_worth) - minVal) / valRange) * (chartHeight - 2 * padding);

                  return (
                    <g key={s.id} style={{ cursor: 'pointer' }} onClick={() => handleLoadSnapshot(s)}>
                      <circle cx={x} cy={y} r="5" fill="#a78bfa" stroke="#ffffff" strokeWidth="2" />
                      {/* Tooltip Label */}
                      <text x={x} y={y - 12} textAnchor="middle" style={{ fontSize: '0.65rem', fontWeight: 800, fill: '#475569' }}>
                        ₹{Math.round(s.net_worth / 1000)}k
                      </text>
                      {/* Date Axis */}
                      <text x={x} y={chartHeight - padding + 15} textAnchor="middle" style={{ fontSize: '0.6rem', fontWeight: 700, fill: '#94a3b8' }}>
                        {new Date(s.snapshot_date).toLocaleDateString('en-IN', { month: 'short' })}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
          
          {/* 2. LEDGER ASSET / LIABILITY FORM PANEL */}
          <div className="clay-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Mirror Asset & Liability Items</h3>
            
            <form onSubmit={handleSaveSnapshot} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Snapshot Date selection */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                  Snapshot Month Record Date
                </label>
                <input 
                  type="date" required value={snapshotDate}
                  onChange={(e) => setSnapshotDate(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              {/* ASSETS LIST */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', borderBottom: '2px solid #d1fae5', paddingBottom: '0.35rem', marginBottom: '1rem' }}>
                  Assets Ledger (Inward Value)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', flex: 1 }}>Savings Account</span>
                    <input 
                      type="number" value={savingsVal} onChange={(e) => setSavingsVal(e.target.value)}
                      className="clay-inset" style={{ flex: 1.5, padding: '0.45rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', flex: 1 }}>Fixed Deposits (FDs)</span>
                    <input 
                      type="number" value={fdVal} onChange={(e) => setFdVal(e.target.value)}
                      className="clay-inset" style={{ flex: 1.5, padding: '0.45rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', flex: 1 }}>Mutual Funds (MFs)</span>
                    <input 
                      type="number" value={mfVal} onChange={(e) => setMfVal(e.target.value)}
                      className="clay-inset" style={{ flex: 1.5, padding: '0.45rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', flex: 1 }}>Property/Real Estate</span>
                    <input 
                      type="number" value={propVal} onChange={(e) => setPropVal(e.target.value)}
                      className="clay-inset" style={{ flex: 1.5, padding: '0.45rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* LIABILITIES LIST */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ef4444', borderBottom: '2px solid #fee2e2', paddingBottom: '0.35rem', marginBottom: '1rem' }}>
                  Liabilities Ledger (Outward Dues)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', flex: 1 }}>Credit Card Outstandings</span>
                    <input 
                      type="number" value={ccVal} onChange={(e) => setCcVal(e.target.value)}
                      className="clay-inset" style={{ flex: 1.5, padding: '0.45rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', flex: 1 }}>Personal/Auto Loans</span>
                    <input 
                      type="number" value={loanVal} onChange={(e) => setLoanVal(e.target.value)}
                      className="clay-inset" style={{ flex: 1.5, padding: '0.45rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', flex: 1 }}>Home Mortgage Loan</span>
                    <input 
                      type="number" value={homeLoanVal} onChange={(e) => setHomeLoanVal(e.target.value)}
                      className="clay-inset" style={{ flex: 1.5, padding: '0.45rem' }}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="clay-btn clay-btn-purple" style={{ marginTop: '0.5rem' }}>
                <span>Log Snapshot Record</span>
                <Check className="clay-btn-arrow" />
              </button>

            </form>
          </div>

          {/* 3. NET WORTH SUMMARY CANVAS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Balance Card */}
            <div className="clay-card" style={{ border: '1px solid rgba(139, 92, 246, 0.25)', background: '#f5f3ff', position: 'relative' }}>
              <div className="clay-icon-container" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                <Coins style={{ width: '1.5rem', height: '1.5rem' }} />
              </div>
              
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>TOTAL CALCULATED NET WORTH</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#6b21a8', margin: '0.25rem 0 0.5rem 0' }}>
                ₹{currentNetWorth.toLocaleString('en-IN')}
              </h2>
              
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                Net Worth equals your aggregated inward Assets (₹{currentAssetsSum.toLocaleString('en-IN')}) minus your aggregated outstanding Liabilities (₹{currentLiabilitiesSum.toLocaleString('en-IN')}).
              </p>
            </div>

            {/* Past Snapshots Carousel */}
            <div className="clay-card" style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>Historical Monthly Entries</h3>
              
              {snapshots.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No monthly snapshot entries logged yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {snapshots.map((snap) => (
                    <div 
                      key={snap.id} 
                      onClick={() => handleLoadSnapshot(snap)}
                      className="clay-subcard" 
                      style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '0.75rem 1rem', background: '#ffffff', cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                      title="Click to edit values"
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>
                        {new Date(snap.snapshot_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </span>
                      <strong style={{ color: '#6b21a8', fontSize: '0.95rem' }}>
                        ₹{Number(snap.net_worth).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
