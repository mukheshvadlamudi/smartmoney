// Ledger Ledger Page
// Location: /app/transactions/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Shared/Navigation';
import { 
  Search, 
  Trash2, 
  Calendar, 
  Tag, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { Transaction, PRESET_CATEGORIES } from '@/types';

export default function TransactionsPage() {
  const [month, setMonth] = useState('2026-05');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Success indicator for inline changes
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `/api/transactions?month=${month}`;
      if (categoryFilter !== 'All') {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      
      let data = json.data || [];
      // Filter by type client-side if selected
      if (typeFilter !== 'all') {
        data = data.filter((t: Transaction) => t.type === typeFilter);
      }

      setTransactions(data);
    } catch (e) {
      console.error('Error fetching transactions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [month, categoryFilter, search, typeFilter]);

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction from your financial mirror?')) {
      return;
    }

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
        triggerToast('Transaction deleted successfully');
      } else {
        alert('Failed to delete transaction');
      }
    } catch (e) {
      console.error('Delete transaction error:', e);
    }
  };

  // Handle Category Change (Triggers Layer 3 Payee Mapping learning!)
  const handleCategoryChange = async (id: string, newCategory: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      });

      if (res.ok) {
        setTransactions(transactions.map(t => {
          if (t.id === id) {
            return { ...t, category: newCategory };
          }
          return t;
        }));
        setEditingId(null);
        triggerToast(`Learned rule! Mapped ${newCategory} permanently.`);
      } else {
        alert('Failed to update category');
      }
    } catch (e) {
      console.error('Category update error:', e);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh' }}>
      <Navigation />
      
      <div className="app-container">
        
        {/* TOAST SYSTEM */}
        {toastMessage && (
          <div style={{
            position: 'fixed', top: '5.5rem', right: '2rem',
            background: '#ede9fe', color: '#7c3aed', padding: '0.75rem 1.5rem',
            borderRadius: '9999px', boxShadow: 'var(--shadow-outset-sm)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000,
            fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(124, 58, 237, 0.2)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Check style={{ width: '1.1rem', height: '1.1rem', color: '#10b981' }} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="page-header">
          <div>
            <h2 className="page-title">Financial Ledger</h2>
            <p className="page-subtitle">Standard list layout of all manual and bank-uploaded transactions.</p>
          </div>

          {/* Month carousel */}
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
        </div>

        {/* 1. FILTER CONTROLS CARD */}
        <div className="clay-card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Search Input */}
            <div style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', width: '1.1rem', height: '1.1rem' }} />
              <input 
                type="text" 
                placeholder="Search payees, descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="clay-inset"
                style={{ width: '100%', paddingLeft: '2.75rem', fontSize: '0.95rem' }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag style={{ width: '1rem', height: '1rem', color: '#ea580c' }} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="clay-inset"
                style={{ width: '100%', background: '#eef2f6', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}
              >
                <option value="All">All Categories</option>
                {PRESET_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Type selector (Credit/Debit) */}
            <div style={{ flex: 1, minWidth: '150px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter style={{ width: '1rem', height: '1rem', color: '#64748b' }} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="clay-inset"
                style={{ width: '100%', background: '#eef2f6', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}
              >
                <option value="all">Debit & Credit</option>
                <option value="debit">Expenses (Debit)</option>
                <option value="credit">Incomes (Credit)</option>
              </select>
            </div>

          </div>
        </div>

        {/* 2. LEDGER LEDGER DATA TABLE */}
        <div className="clay-card" style={{ padding: '2rem' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#64748b' }}>
              <p style={{ fontWeight: 700 }}>Reading statement database ledger...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#64748b' }}>
              <AlertCircle style={{ width: '3rem', height: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>No Transactions Found</h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Try relaxing your filter parameters, or upload a statement for this month.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                    <th style={{ padding: '0.75rem 1rem' }}>DATE</th>
                    <th style={{ padding: '0.75rem 1rem' }}>DESCRIPTION / PAYEE</th>
                    <th style={{ padding: '0.75rem 1rem' }}>CATEGORY</th>
                    <th style={{ padding: '0.75rem 1rem' }}>SOURCE</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>AMOUNT</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#475569' }}>
                      
                      {/* Date */}
                      <td style={{ padding: '1.25rem 1rem' }}>
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Payee Description */}
                      <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: '#111827' }}>
                        {tx.description}
                      </td>

                      {/* Interactive Category Dropdown inline! */}
                      <td style={{ padding: '1.25rem 1rem' }}>
                        {editingId === tx.id ? (
                          <select
                            defaultValue={tx.category}
                            onChange={(e) => handleCategoryChange(tx.id, e.target.value)}
                            onBlur={() => setEditingId(null)}
                            className="clay-inset"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: '#ffffff',
                              border: '1px solid #cbd5e1'
                            }}
                            autoFocus
                          >
                            {PRESET_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          <button
                            onClick={() => setEditingId(tx.id)}
                            className="pill-badge pill-badge-purple"
                            style={{
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.35rem 0.85rem',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              transition: 'all 0.2s ease'
                            }}
                            title="Click to edit category inline"
                          >
                            <span>{tx.category}</span>
                          </button>
                        )}
                      </td>

                      {/* Source */}
                      <td style={{ padding: '1.25rem 1rem', textTransform: 'capitalize' }}>
                        {tx.source === 'uploaded' ? (
                          <span style={{ color: '#ea580c', fontWeight: 600 }}>Statement</span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontWeight: 600 }}>Manual</span>
                        )}
                      </td>

                      {/* Amount credit/debit */}
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: 800, color: tx.type === 'credit' ? '#10b981' : '#ef4444', fontSize: '1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                          {tx.type === 'credit' ? (
                            <ArrowUpRight style={{ width: '0.9rem', height: '0.9rem', color: '#10b981' }} />
                          ) : (
                            <ArrowDownRight style={{ width: '0.9rem', height: '0.9rem', color: '#ef4444' }} />
                          )}
                          ₹{Number(tx.amount).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: '#ef4444',
                            opacity: 0.6,
                            transition: 'opacity 0.2s ease',
                            padding: '0.25rem'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                          title="Delete transaction permanently"
                        >
                          <Trash2 style={{ width: '1.1rem', height: '1.1rem' }} />
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem', background: '#ffffff', borderRadius: '16px', padding: '1rem 1.5rem', border: '1px solid rgba(255,255,255,0.7)', boxShadow: 'var(--shadow-outset-sm)', fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ background: '#ede9fe', color: '#7c3aed', width: '1.5rem', height: '1.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>i</span>
          <span><strong>Smart Dictionary Learning:</strong> Changing a category on any transaction automatically teaches the parser that this payee maps to this category. All future statement uploads with this payee will match it.</span>
        </div>

      </div>
    </div>
  );
}
