// Reports & Money Leaks Page
// Location: /app/reports/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Shared/Navigation';
import { 
  Calendar, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  Flame, 
  HelpCircle, 
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

interface ReportData {
  month: string;
  summary: {
    income: number;
    spending: number;
    savings: number;
  };
  categoryBreakdown: Array<{ name: string; amount: number; percentage: number }>;
  biggestExpense: { id: string; description: string; amount: number; date: string } | null;
  frequentSmall: Array<{ payee: string; frequency: number; averageAmount: number; totalSpent: number }>;
  detectedLeaks: Array<{ payee: string; averageAmount: number; frequency: string; lastDate: string; totalCostAnnualEst: number }>;
}

export default function ReportsPage() {
  const [month, setMonth] = useState('2026-05');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${month}`);
      const json = await res.json();
      setReport(json.data);
    } catch (e) {
      console.error('Error fetching report:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh' }}>
      <Navigation />
      
      <div className="app-container" id="printable-report-area">
        
        <div className="page-header" style={{ contentVisibility: 'auto' }}>
          <div>
            <h2 className="page-title">Monthly Financial Report</h2>
            <p className="page-subtitle">Aggregated cash flow analytics and active subscription detectors.</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
            {/* Month selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '9999px', boxShadow: 'var(--shadow-outset-sm)' }}>
              <Calendar style={{ width: '1rem', height: '1rem', color: '#7c3aed' }} />
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

            <button 
              onClick={handlePrint}
              className="clay-subcard"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff',
                padding: '0.65rem 1.25rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.9rem', color: '#475569',
                border: 'none', cursor: 'pointer'
              }}
            >
              <Printer style={{ width: '1.1rem', height: '1.1rem', color: '#7c3aed' }} />
              <span>Export to PDF</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#64748b' }}>
            <p style={{ fontWeight: 700 }}>Assembling monthly spending records...</p>
          </div>
        ) : !report ? (
          <div className="clay-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p>Error compiled while gathering transaction reports.</p>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* 1. THREE CARD TOTALS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="clay-card" style={{ background: '#f0fdf4', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>TOTAL INCOME RECEIVED</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d', margin: '0.25rem 0' }}>
                  ₹{report.summary.income.toLocaleString('en-IN')}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#16a34a' }}>Cash flows from all credits</span>
              </div>

              <div className="clay-card" style={{ background: '#fff5f5', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>TOTAL CASH OUTFLOW</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#be123c', margin: '0.25rem 0' }}>
                  ₹{report.summary.spending.toLocaleString('en-IN')}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#f43f5e' }}>Cash flows from all debits</span>
              </div>

              <div className="clay-card" style={{ background: '#f5f3ff', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed' }}>NET ACCUMULATED SAVINGS</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#6b21a8', margin: '0.25rem 0' }}>
                  ₹{report.summary.savings.toLocaleString('en-IN')}
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>Savings rate: {report.summary.income > 0 ? Math.round((report.summary.savings / report.summary.income) * 100) : 0}%</span>
              </div>
            </div>

            {/* 2. SPENDING BREAKDOWN & BIGGEST EXPENSE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
              
              {/* Category Breakdown Table */}
              <div className="clay-card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.25rem' }}>Category Expenditure</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {report.categoryBreakdown.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No expenses logged this month.</p>
                  ) : (
                    report.categoryBreakdown.map(cat => (
                      <div key={cat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          <span style={{ color: '#475569' }}>{cat.name}</span>
                          <span style={{ color: '#1e293b' }}>
                            ₹{cat.amount.toLocaleString('en-IN')} ({cat.percentage}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '9999px' }}>
                          <div style={{ width: `${cat.percentage}%`, height: '100%', background: '#a78bfa', borderRadius: '9999px' }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Special Insights: Biggest & Frequent */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Biggest Expense */}
                <div className="clay-card" style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>SINGLE LARGEST EXPENDITURE</span>
                  {report.biggestExpense ? (
                    <div style={{ marginTop: '0.75rem' }}>
                      <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ef4444' }}>
                        ₹{report.biggestExpense.amount.toLocaleString('en-IN')}
                      </h4>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginTop: '0.15rem' }}>
                        {report.biggestExpense.description}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>
                        Logged on: {new Date(report.biggestExpense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  ) : (
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>No expenses logged.</p>
                  )}
                </div>

                {/* Frequent Small Transactions */}
                <div className="clay-card" style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>FREQUENT PETTY TRANSACTIONS PIPELINE</span>
                  
                  {report.frequentSmall.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>No petty transaction patterns detected.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
                      {report.frequentSmall.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.35rem', fontSize: '0.85rem' }}>
                          <div>
                            <strong style={{ color: '#111827' }}>{p.payee}</strong>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem' }}>
                              {p.frequency} transactions · Avg ₹{p.averageAmount}
                            </span>
                          </div>
                          <span style={{ fontWeight: 800, color: '#ef4444' }}>₹{p.totalSpent.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* 3. MONEY LEAKS SYSTEM (SUBSCRIPTIONS SCANNER) */}
            <div className="clay-card" style={{ border: '1px solid rgba(139, 92, 246, 0.25)', background: '#f5f3ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Flame style={{ color: '#7c3aed', width: '1.5rem', height: '1.5rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>Money Leaks subscription scanner</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                Our background engine scans your complete transaction ledger history to flag recurring merchant payees with monthly sequences (e.g. SaaS, broadband, gym dues, streaming platforms).
              </p>

              {report.detectedLeaks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <p>No active recurring monthly leaks or subscriptions detected in your ledger.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {report.detectedLeaks.map((leak, idx) => (
                    <div key={idx} className="clay-subcard" style={{ background: '#fff5f5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>{leak.payee}</h4>
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Active {leak.frequency} cycle</span>
                        </div>
                        <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                          FLAGGED LEAK
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                        <div>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Monthly Cost</span>
                          <strong style={{ color: '#ef4444', fontSize: '1rem' }}>₹{leak.averageAmount.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Annual Est. Cost</span>
                          <strong style={{ color: '#111827' }}>₹{leak.totalCostAnnualEst.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* PRINT-ONLY CSS RULES */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, .no-print, .floating-dock-wrapper, .floating-dock {
            display: none !important;
          }
          .app-container {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .clay-card, .clay-subcard {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            break-inside: avoid;
          }
          #printable-report-area {
            margin-top: 1cm !important;
          }
        }
      `}</style>
    </div>
  );
}
