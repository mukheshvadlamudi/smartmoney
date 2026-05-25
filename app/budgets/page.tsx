// Category Budgets Page
// Location: /app/budgets/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Shared/Navigation';
import { 
  Calendar, 
  PiggyBank, 
  Check, 
  AlertCircle, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';
import { Budget, Transaction, PRESET_CATEGORIES } from '@/types';

export default function BudgetsPage() {
  const [month, setMonth] = useState('2026-05');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Buffer fields for category limit inputs
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadBudgetData = async () => {
    setLoading(true);
    try {
      const bRes = await fetch(`/api/budgets?month=${month}`);
      const bJson = await bRes.json();
      
      const txRes = await fetch(`/api/transactions?month=${month}`);
      const txJson = await txRes.json();

      const loadedBudgets = bJson.data || [];
      setBudgets(loadedBudgets);
      setTransactions(txJson.data || []);

      // Seed input buffer fields
      const seededLimits: Record<string, string> = {};
      PRESET_CATEGORIES.forEach(cat => {
        const existing = loadedBudgets.find((b: Budget) => b.category === cat);
        seededLimits[cat] = existing ? String(existing.limit_amount) : '';
      });
      setLimits(seededLimits);

    } catch (e) {
      console.error('Error loading budget data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, [month]);

  // Handle Input Changes
  const handleLimitChange = (category: string, value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setLimits({ ...limits, [category]: value });
    }
  };

  // Submit and Save Budgets
  const handleSaveBudgets = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Loop over categories and save non-empty limits
      for (const cat of PRESET_CATEGORIES) {
        const amtStr = limits[cat];
        const limitAmt = amtStr !== '' ? parseFloat(amtStr) : 0;
        
        await fetch('/api/budgets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            month,
            category: cat,
            limit_amount: limitAmt
          })
        });
      }

      // Reload
      const bRes = await fetch(`/api/budgets?month=${month}`);
      const bJson = await bRes.json();
      setBudgets(bJson.data || []);
      
      triggerToast('Category budget limits synchronized');
    } catch (err) {
      console.error('Error saving budgets:', err);
      alert('Failed to save budget settings');
    } finally {
      setLoading(false);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Calculate actual spending sums per category
  const categorySpentMap: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type === 'debit') {
      categorySpentMap[tx.category] = (categorySpentMap[tx.category] || 0) + Number(tx.amount);
    }
  }

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh' }}>
      <Navigation />
      
      <div className="app-container">

        {/* TOAST SYSTEM */}
        {toastMessage && (
          <div style={{
            position: 'fixed', top: '5.5rem', right: '2rem',
            background: '#ffedd5', color: '#ea580c', padding: '0.75rem 1.5rem',
            borderRadius: '9999px', boxShadow: 'var(--shadow-outset-sm)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000,
            fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(234, 88, 12, 0.2)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Check style={{ width: '1.1rem', height: '1.1rem', color: '#10b981' }} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="page-header">
          <div>
            <h2 className="page-title">Category Budgets</h2>
            <p className="page-subtitle">Set maximum monthly limits per expense bucket. Informational alerts only.</p>
          </div>

          {/* Month picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '9999px', boxShadow: 'var(--shadow-outset-sm)' }}>
            <Calendar style={{ width: '1rem', height: '1rem', color: '#ea580c' }} />
            <select 
              value={month} onChange={(e) => setMonth(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', outline: 'none', cursor: 'pointer' }}
            >
              <option value="2026-04">April 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#64748b' }}>
            <p style={{ fontWeight: 700 }}>Recalculating monthly budget limit balances...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveBudgets} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* 1. MAIN GRID OF CATEGORIES */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {PRESET_CATEGORIES.map(cat => {
                // Ignore Income as a budget category
                if (cat === 'Income') return null;

                const spent = categorySpentMap[cat] || 0;
                const limitStr = limits[cat] || '';
                const limit = limitStr !== '' ? parseFloat(limitStr) : 0;

                const isOverBudget = limit > 0 && spent >= limit;
                const isWarning = limit > 0 && spent >= limit * 0.8 && spent < limit;
                const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

                // Color tokens for dynamic meters
                let barColor = '#7c3aed'; // normal purple
                let bgBadge = '#ede9fe';
                let fgBadge = '#7c3aed';
                
                let cardBg = 'rgba(255, 255, 255, 0.85)';
                let cardBorder = '1px solid rgba(255, 255, 255, 0.6)';

                if (limit > 0) {
                  if (isOverBudget) {
                    barColor = '#ef4444';
                    bgBadge = '#fee2e2';
                    fgBadge = '#ef4444';
                    cardBg = '#ffeecf'; // soft warm peach/rose
                    cardBg = '#fff5f5'; // soft rose
                    cardBorder = '1px solid rgba(239, 68, 68, 0.25)';
                  } else if (isWarning) {
                    barColor = '#f59e0b';
                    bgBadge = '#ffedd5';
                    fgBadge = '#ea580c';
                    cardBg = '#fffbeb'; // soft amber/yellow
                    cardBorder = '1px solid rgba(245, 158, 11, 0.25)';
                  } else {
                    // budgeted state (healthy)
                    barColor = '#10b981';
                    bgBadge = '#d1fae5';
                    fgBadge = '#10b981';
                    cardBg = '#f0fdf4'; // soft green
                    cardBorder = '1px solid rgba(16, 185, 129, 0.25)';
                  }
                }

                return (
                  <div key={cat} className="clay-card" style={{ padding: '1.75rem', position: 'relative', background: cardBg, border: cardBorder }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{cat}</h4>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                          Spent: ₹{Math.round(spent).toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      {limit > 0 && (
                        <span style={{
                          background: bgBadge,
                          color: fgBadge,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          {isOverBudget ? (
                            <>
                              <AlertCircle style={{ width: '0.8rem', height: '0.8rem' }} />
                              <span>OVER LIMIT</span>
                            </>
                          ) : isWarning ? (
                            <>
                              <AlertTriangle style={{ width: '0.8rem', height: '0.8rem' }} />
                              <span>WARNING 80%</span>
                            </>
                          ) : (
                            <>
                              <PiggyBank style={{ width: '0.8rem', height: '0.8rem' }} />
                              <span>BUDGETED</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Limit Input Block */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>
                          Set Spending Limit (₹)
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. No limit"
                          value={limitStr}
                          onChange={(e) => handleLimitChange(cat, e.target.value)}
                          className="clay-inset"
                          style={{ width: '100%', padding: '0.5rem 0.85rem', fontSize: '0.9rem', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {limit > 0 && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                          <span>Maturity progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: barColor, borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SAVE BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="clay-btn clay-btn-purple"
                style={{ width: 'auto', padding: '1rem 4rem', borderRadius: '9999px', gap: '1.5rem' }}
              >
                <span>Synchronize Category Limits</span>
                <Check className="clay-btn-arrow" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
