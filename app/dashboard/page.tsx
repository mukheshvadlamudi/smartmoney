// Authenticated Dashboard Page
// Location: /app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Shared/Navigation';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  UploadCloud, 
  Wallet, 
  TrendingDown, 
  PiggyBank, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  X,
  AlertCircle
} from 'lucide-react';
import { Transaction, Budget, PRESET_CATEGORIES } from '@/types';

export default function Dashboard() {
  const [month, setMonth] = useState('2026-05'); // Default test month
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Add Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'debit' | 'credit'>('debit');
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [modalError, setModalError] = useState<string | null>(null);

  // MoM comparisons (simulated past month values for neat drifts)
  const prevMonthSpent = 28450;
  const prevMonthSaved = 66550;

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // Fetch transactions for selected month
        const txRes = await fetch(`/api/transactions?month=${month}`);
        const txJson = await txRes.json();
        
        // Fetch budgets for selected month
        const bRes = await fetch(`/api/budgets?month=${month}`);
        const bJson = await bRes.json();

        if (txJson.data) setTransactions(txJson.data);
        if (bJson.data) setBudgets(bJson.data);
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [month]);

  // Aggregate stats
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Actual Savings (debits categorized as 'Savings')
  const actualSavings = transactions
    .filter(t => t.type === 'debit' && t.category === 'Savings')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Cost of living spent (debits excluding 'Savings' category)
  const totalSpent = transactions
    .filter(t => t.type === 'debit' && t.category !== 'Savings')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const remainingSurplus = totalIncome - totalSpent - actualSavings;

  // Category aggregates
  const categorySpent: Record<string, number> = {};
  for (const t of transactions) {
    if (t.type === 'debit') {
      categorySpent[t.category] = (categorySpent[t.category] || 0) + Number(t.amount);
    }
  }

  // Combine with budget limit mapping
  const categoryBreakdown = PRESET_CATEGORIES.map(catName => {
    const spent = categorySpent[catName] || 0;
    const budget = budgets.find(b => b.category === catName);
    const limit = budget ? Number(budget.limit_amount) : 0;
    return {
      category: catName,
      spent: Math.round(spent),
      limit: Math.round(limit),
      percentage: spent > 0 && totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0
    };
  }).filter(c => c.spent > 0 || c.limit > 0)
    .sort((a, b) => b.spent - a.spent);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const parts = month.split('-');
    let yr = Number(parts[0]);
    let mo = Number(parts[1]) - 1;
    if (mo === 0) {
      mo = 12;
      yr -= 1;
    }
    setMonth(`${yr}-${mo < 10 ? '0' + mo : mo}`);
  };

  const isCurrentOrFutureMonth = () => {
    const currentMonthLimit = new Date().toLocaleDateString('en-CA').substring(0, 7);
    return month >= currentMonthLimit;
  };

  const handleNextMonth = () => {
    if (isCurrentOrFutureMonth()) return;
    const parts = month.split('-');
    let yr = Number(parts[0]);
    let mo = Number(parts[1]) + 1;
    if (mo === 13) {
      mo = 1;
      yr += 1;
    }
    setMonth(`${yr}-${mo < 10 ? '0' + mo : mo}`);
  };

  // Submit Quick Add Transaction
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setModalError('Please enter a valid amount');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-CA');
    if (date > todayStr) {
      setModalError('Future dates are not allowed for transactions.');
      return;
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          category,
          description: description || 'Cash Payment',
          type,
          date,
          source: 'manual'
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');

      // Reload
      setTransactions([json.data[0], ...transactions]);
      setShowAddModal(false);
      setAmount('');
      setDescription('');
    } catch (err: any) {
      setModalError(err.message || 'Error occurred');
    }
  };

  // SVG Donut calculation
  let cumPercent = 0;
  const donutSlices = categoryBreakdown.map((c, i) => {
    const percent = totalSpent > 0 ? (c.spent / totalSpent) * 100 : 0;
    const start = cumPercent;
    cumPercent += percent;
    
    // SVG Dasharray math: radius = 50, circumference = 2 * PI * 50 = 314.16
    const strokeLength = (percent / 100) * 314.16;
    const strokeOffset = 314.16 - ((start / 100) * 314.16);
    
    // Dynamic Harmonious Pastel Colors (Soft theme)
    const colors = [
      '#a78bfa', // soft lavender purple
      '#fdba74', // soft peach orange
      '#93c5fd', // soft sky blue
      '#86efac', // soft mint green
      '#fda4af', // soft rose pink
      '#fde047', // soft yellow gold
      '#99f6e4', // soft teal
      '#f472b6', // soft magenta pink
      '#c084fc', // soft amethyst violet
      '#cbd5e1'  // soft slate
    ];
    
    return {
      category: c.category,
      percent,
      dash: `${strokeLength} ${314.16 - strokeLength}`,
      offset: strokeOffset,
      color: colors[i % colors.length]
    };
  });

  const monthLabels: Record<string, string> = {
    '2026-04': 'April 2026',
    '2026-05': 'May 2026',
    '2026-06': 'June 2026',
    '2026-07': 'July 2026'
  };

  const currentMonthLabel = monthLabels[month] || month;

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh' }}>
      <Navigation />
      
      <div className="app-container">
        
        {/* 1. TOP CAROUSEL MONTH SELECTOR & QUICK BUTTONS */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#ffffff', padding: '0.65rem 1.25rem', borderRadius: '9999px', boxShadow: 'var(--shadow-outset-sm)', border: '1px solid rgba(255,255,255,0.7)' }}>
            <button onClick={handlePrevMonth} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', minWidth: '110px', textAlign: 'center' }}>
              {currentMonthLabel}
            </span>
            <button 
              onClick={handleNextMonth} 
              disabled={isCurrentOrFutureMonth()}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                cursor: isCurrentOrFutureMonth() ? 'not-allowed' : 'pointer', 
                color: isCurrentOrFutureMonth() ? '#cbd5e1' : '#64748b',
                opacity: isCurrentOrFutureMonth() ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/upload" className="clay-subcard" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff',
              padding: '0.65rem 1.25rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.9rem', color: '#475569', textDecoration: 'none'
            }}>
              <UploadCloud style={{ width: '1.1rem', height: '1.1rem', color: '#ea580c' }} />
              <span>Upload Statement</span>
            </Link>

            <button 
              onClick={() => setShowAddModal(true)}
              className="clay-subcard"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                background: '#ede9fe', border: '1px solid rgba(139, 92, 246, 0.25)',
                padding: '0.65rem 1.25rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.9rem', color: '#6b21a8',
                cursor: 'pointer'
              }}
            >
              <Plus style={{ width: '1.1rem', height: '1.1rem', color: '#7c3aed' }} />
              <span>Quick Add Expense</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <p style={{ fontWeight: 600, color: '#64748b' }}>Recalculating account statements...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }} className="animate-fade-in">
            
            {/* 2. THREE HEADLINE METRIC CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Card 1: Income */}
              <div className="clay-card" style={{ background: '#f5f3ff', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <div className="clay-icon-container" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                  <Wallet style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#7c3aed', letterSpacing: '0.12em', textTransform: 'uppercase' }}>INCOME THIS MONTH</span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 600, color: '#111827', margin: '0.25rem 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                  ₹{totalIncome.toLocaleString('en-IN')}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
                  <ArrowUpRight style={{ width: '1rem', height: '1rem' }} />
                  <span>Stable cash inflows</span>
                </div>
              </div>

              {/* Card 2: Spending */}
              <div className="clay-card" style={{ background: '#fff7ed', border: '1px solid rgba(249, 115, 22, 0.25)' }}>
                <div className="clay-icon-container" style={{ background: '#ffedd5', color: '#ea580c' }}>
                  <TrendingDown style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#ea580c', letterSpacing: '0.12em', textTransform: 'uppercase' }}>EXPENSES THIS MONTH</span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 600, color: '#111827', margin: '0.25rem 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                  ₹{totalSpent.toLocaleString('en-IN')}
                </h2>
                {/* MoM delta indicator */}
                {totalSpent > prevMonthSpent ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}>
                    <ArrowUpRight style={{ width: '1rem', height: '1rem' }} />
                    <span>Up {Math.round(((totalSpent - prevMonthSpent) / prevMonthSpent) * 100)}% MoM</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>
                    <ArrowDownRight style={{ width: '1rem', height: '1rem' }} />
                    <span>Down {Math.round(((prevMonthSpent - totalSpent) / prevMonthSpent) * 100)}% MoM</span>
                  </div>
                )}
              </div>

              {/* Card 3: Remaining Surplus */}
              <div className="clay-card" style={{ background: '#f0f9ff', border: '1px solid rgba(14, 165, 233, 0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="clay-icon-container" style={{ background: '#e0f2fe', color: '#0284c7', marginBottom: '0.75rem' }}>
                      <PiggyBank style={{ width: '1.5rem', height: '1.5rem' }} />
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: '#e0f2fe',
                      color: '#0284c7',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px'
                    }}>
                      SAVED: ₹{actualSavings.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#0284c7', letterSpacing: '0.12em', textTransform: 'uppercase' }}>REMAINING SURPLUS</span>
                  <h2 style={{ fontSize: '2.25rem', fontWeight: 600, color: '#111827', margin: '0.25rem 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                    ₹{remainingSurplus.toLocaleString('en-IN')}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: remainingSurplus >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                    <span>Savings rate: {totalIncome > 0 ? Math.round((actualSavings / totalIncome) * 100) : 0}%</span>
                  </div>
                </div>

                {remainingSurplus > 0 && (
                  <button 
                    onClick={() => {
                      setAmount(remainingSurplus.toString());
                      setCategory('Savings');
                      setDescription('Monthly surplus sweep');
                      setType('debit');
                      setShowAddModal(true);
                    }}
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#0284c7',
                      background: '#e0f2fe',
                      border: 'none',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      alignSelf: 'flex-start',
                      boxShadow: '0 2px 4px rgba(2, 132, 199, 0.1)'
                    }}
                  >
                    <Plus style={{ width: '0.85rem', height: '0.85rem' }} />
                    <span>Sweep to Savings</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. VISUAL DISTRIBUTION CHARTS & LEDGER MAP */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
              
              {/* Left Column: Spending SVG Donut & list */}
              <div className="clay-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Spending Distribution</h3>
                
                {totalSpent === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#64748b' }}>
                    <p>No transaction data logged for {currentMonthLabel}.</p>
                    <Link href="/upload" style={{ color: '#7c3aed', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.5rem' }}>Upload statement to begin</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {/* SVG Donut */}
                    <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                      <svg width="150" height="150" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="60" cy="60" r="50" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                        {donutSlices.map((slice, i) => (
                          <circle
                            key={slice.category}
                            cx="60"
                            cy="60"
                            r="50"
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth="12"
                            strokeDasharray={slice.dash}
                            strokeDashoffset={slice.offset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                          />
                        ))}
                      </svg>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>TOTAL OUT</span>
                        <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>₹{totalSpent.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {donutSlices.slice(0, 5).map((slice) => (
                        <div key={slice.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <span style={{ width: '0.65rem', height: '0.65rem', borderRadius: '50%', background: slice.color }} />
                            <span style={{ color: '#475569' }}>{slice.category}</span>
                          </div>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{Math.round(slice.percent)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Category budgets progress */}
              <div className="clay-card" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>Category Budget Performance</h3>
                  <Link href="/budgets" style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 600 }}>Adjust Limits</Link>
                </div>

                {categoryBreakdown.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', color: '#64748b' }}>
                    <p>No budgets set or transactions recorded.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {categoryBreakdown.slice(0, 4).map((item) => {
                      const isOverBudget = item.limit > 0 && item.spent >= item.limit;
                      const isWarning = item.limit > 0 && item.spent >= item.limit * 0.8 && item.spent < item.limit;
                      const progress = item.limit > 0 ? Math.min((item.spent / item.limit) * 100, 100) : 0;
                      
                      let barColor = '#7c3aed'; // normal purple
                      if (isOverBudget) barColor = '#ef4444'; // critical red
                      else if (isWarning) barColor = '#f59e0b'; // orange alert

                      return (
                        <div key={item.category}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                            <span style={{ color: '#475569' }}>{item.category}</span>
                            <span style={{ color: '#111827' }}>
                              ₹{item.spent.toLocaleString('en-IN')} 
                              {item.limit > 0 && <span style={{ color: '#94a3b8', fontWeight: 600 }}> / ₹{item.limit.toLocaleString('en-IN')}</span>}
                            </span>
                          </div>
                          
                          {item.limit > 0 ? (
                            <div style={{ width: '100%', height: '8px', background: '#cbd5e1', borderRadius: '9999px', overflow: 'hidden', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.1)' }}>
                              <div style={{ width: `${progress}%`, height: '100%', background: barColor, borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>No limit set</span>
                          )}

                          {isOverBudget && (
                            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, display: 'block', marginTop: '0.25rem' }}>Budget exceeded!</span>
                          )}
                          {isWarning && !isOverBudget && (
                            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, display: 'block', marginTop: '0.25rem' }}>Used over 80% of limit!</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* 4. RECENT TRANSACTIONS TABLE MINI PREVIEW */}
            <div className="clay-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>Recent Account Actions</h3>
                <Link href="/transactions" style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 600 }}>See Ledger</Link>
              </div>

              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <p>No transaction history logged for this month.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>DATE</th>
                        <th style={{ padding: '0.75rem 1rem' }}>DESCRIPTION</th>
                        <th style={{ padding: '0.75rem 1rem' }}>CATEGORY</th>
                        <th style={{ padding: '0.75rem 1rem' }}>SOURCE</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569' }}>
                          <td style={{ padding: '1rem' }}>{new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#111827' }}>{tx.description}</td>
                          <td style={{ padding: '1rem' }}>
                            <span className="pill-badge pill-badge-black" style={{ fontSize: '0.75rem' }}>{tx.category}</span>
                          </td>
                          <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{tx.source}</td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                            {tx.type === 'credit' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* QUICK ADD EXPENSE MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="clay-card animate-fade-in" style={{ maxWidth: '450px', width: '90%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>Quick-Add Transaction</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>
            </div>

            {modalError && (
              <div style={{ display: 'flex', gap: '0.5rem', background: '#ffedd5', color: '#ea580c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
                <AlertCircle style={{ width: '1rem', height: '1rem' }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleQuickAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button" onClick={() => setType('debit')}
                  className="clay-subcard"
                  style={{
                    flex: 1, border: type === 'debit' ? '2px solid #ef4444' : 'none',
                    fontWeight: 700, cursor: 'pointer', background: '#ffffff', color: type === 'debit' ? '#ef4444' : '#64748b'
                  }}
                >
                  Expense (Debit)
                </button>
                <button
                  type="button" onClick={() => setType('credit')}
                  className="clay-subcard"
                  style={{
                    flex: 1, border: type === 'credit' ? '2px solid #10b981' : 'none',
                    fontWeight: 700, cursor: 'pointer', background: '#ffffff', color: type === 'credit' ? '#10b981' : '#64748b'
                  }}
                >
                  Income (Credit)
                </button>
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Transaction Amount (₹)</label>
                <input 
                  type="number" required placeholder="e.g. 350" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Description / Payee</label>
                <input 
                  type="text" required placeholder="e.g. Swiggy Lunch" value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Budget Category</label>
                <select
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', background: '#eef2f6', border: 'none' }}
                >
                  {PRESET_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Transaction Date</label>
                <input 
                  type="date" required value={date}
                  max={new Date().toLocaleDateString('en-CA')}
                  onChange={(e) => setDate(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <button type="submit" className="clay-btn clay-btn-black" style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                <span>Save Transaction</span>
                <Plus className="clay-btn-arrow" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
