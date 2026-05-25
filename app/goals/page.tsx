// Savings Goals Tracker Page
// Location: /app/goals/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Shared/Navigation';
import { 
  Target, 
  Plus, 
  Calendar, 
  Coins, 
  Trash2, 
  ArrowUpRight, 
  ArrowRight,
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import { Goal } from '@/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Contribution Modal States
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmt, setContributionAmt] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goals');
      const json = await res.json();
      setGoals(json.data || []);
    } catch (e) {
      console.error('Error fetching goals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Calculate Months Remaining helper
  const calculateMonthsRemaining = (targetDateStr: string): number => {
    const today = new Date();
    const target = new Date(targetDateStr);
    
    const yearsDiff = target.getFullYear() - today.getFullYear();
    const monthsDiff = target.getMonth() - today.getMonth();
    
    const total = yearsDiff * 12 + monthsDiff;
    return total <= 0 ? 1 : total;
  };

  // Submit New Goal
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const target = parseFloat(targetAmount);
    const current = currentAmount !== '' ? parseFloat(currentAmount) : 0;

    if (!name.trim() || isNaN(target) || target <= 0 || isNaN(current) || current < 0) {
      setModalError('Please fill out all fields with valid numbers.');
      return;
    }

    if (current > target) {
      setModalError('Current savings cannot exceed the target goal!');
      return;
    }

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          target_amount: target,
          current_amount: current,
          target_date: targetDate
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save goal');

      setGoals([json.data, ...goals]);
      setShowAddModal(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('');
      setTargetDate('');
      triggerToast('Savings goal created successfully');
    } catch (err: any) {
      setModalError(err.message || 'Error occurred');
    }
  };

  // Submit Goal Contribution
  const handleContributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId) return;

    const amt = parseFloat(contributionAmt);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const targetGoal = goals.find(g => g.id === contributeGoalId);
    if (!targetGoal) return;

    const newCurrent = Number(targetGoal.current_amount) + amt;
    if (newCurrent > targetGoal.target_amount) {
      alert('Congratulations! Contributing this amount will exceed the goal. Adjusting to hit 100%.');
    }

    try {
      const res = await fetch(`/api/goals/${contributeGoalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_amount: Math.min(newCurrent, targetGoal.target_amount) })
      });

      if (res.ok) {
        setGoals(goals.map(g => {
          if (g.id === contributeGoalId) {
            return { ...g, current_amount: Math.min(newCurrent, targetGoal.target_amount) };
          }
          return g;
        }));
        setContributeGoalId(null);
        setContributionAmt('');
        triggerToast('Contribution logged! Keep building your wealth.');
      } else {
        alert('Failed to update progress');
      }
    } catch (err) {
      console.error('Contribution error:', err);
    }
  };

  // Handle Delete Goal
  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saving goal?')) return;

    try {
      const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGoals(goals.filter(g => g.id !== id));
        triggerToast('Goal removed successfully');
      } else {
        alert('Failed to delete goal');
      }
    } catch (e) {
      console.error('Delete goal error:', e);
    }
  };

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh' }}>
      <Navigation />
      
      <div className="app-container">

        {/* TOAST SYSTEM */}
        {toastMessage && (
          <div style={{
            position: 'fixed', top: '5.5rem', right: '2rem',
            background: '#e0f2fe', color: '#0284c7', padding: '0.75rem 1.5rem',
            borderRadius: '9999px', boxShadow: 'var(--shadow-outset-sm)',
            display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1000,
            fontWeight: 700, fontSize: '0.9rem', border: '1px solid rgba(2, 132, 199, 0.2)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            <Check style={{ width: '1.1rem', height: '1.1rem', color: '#10b981' }} />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="page-header">
          <div>
            <h2 className="page-title">Savings Goals</h2>
            <p className="page-subtitle">Establish target milestones and compute required monthly contributions.</p>
          </div>

          <button 
            onClick={() => setShowAddModal(true)}
            className="clay-subcard"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#7c3aed',
              padding: '0.65rem 1.5rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.9rem', color: '#ffffff',
              border: 'none', cursor: 'pointer'
            }}
          >
            <Plus style={{ width: '1.1rem', height: '1.1rem' }} />
            <span>Create New Saving Goal</span>
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', color: '#64748b' }}>
            <p style={{ fontWeight: 700 }}>Calculating interest schedules and savings deadlines...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="clay-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
            <Target style={{ width: '3rem', height: '3rem', color: '#cbd5e1', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>No Saving Goals Set</h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
              Create a goal (e.g. "Laptop fund - ₹50,000") to track compounding milestones.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="clay-btn clay-btn-purple"
              style={{ width: 'auto', padding: '0.75rem 2rem', borderRadius: '9999px' }}
            >
              <span>Add First Goal</span>
            </button>
          </div>
        ) : (
          <div className="animate-fade-in" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2.5rem'
          }}>
            {goals.map((g) => {
              const monthsLeft = calculateMonthsRemaining(g.target_date);
              const remainingAmt = g.target_amount - g.current_amount;
              const monthlyRequired = remainingAmt > 0 ? Math.round(remainingAmt / monthsLeft) : 0;
              const progress = Math.round((g.current_amount / g.target_amount) * 100);

              return (
                <div key={g.id} className="clay-card" style={{ padding: '2rem' }}>
                  
                  {/* Delete icon */}
                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    style={{
                      position: 'absolute', top: '1.5rem', right: '1.5rem',
                      border: 'none', background: 'transparent', cursor: 'pointer',
                      color: '#94a3b8', transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    title="Delete goal"
                  >
                    <Trash2 style={{ width: '1.1rem', height: '1.1rem' }} />
                  </button>

                  <div className="clay-icon-container" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                    <Target style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>{g.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar style={{ width: '0.85rem', height: '0.85rem' }} />
                    <span>Target: {new Date(g.target_date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} ({monthsLeft} months left)</span>
                  </span>

                  {/* Financial stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.5rem 0' }}>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.15rem' }}>Saved Balance</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#10b981' }}>₹{Number(g.current_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '12px', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.15rem' }}>Target Goal</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>₹{Number(g.target_amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Monthly savings engine recommendation */}
                  {remainingAmt > 0 ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: '#ede9fe', padding: '0.85rem 1rem', borderRadius: '16px',
                      fontSize: '0.85rem', color: '#7c3aed', fontWeight: 600, marginBottom: '1.5rem'
                    }}>
                      <Coins style={{ width: '1.2rem', height: '1.2rem' }} />
                      <span>Save <strong>₹{monthlyRequired.toLocaleString('en-IN')}/month</strong> to hit on time.</span>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      background: '#d1fae5', padding: '0.85rem 1rem', borderRadius: '16px',
                      fontSize: '0.85rem', color: '#065f46', fontWeight: 700, marginBottom: '1.5rem'
                    }}>
                      <Check style={{ width: '1.2rem', height: '1.2rem', color: '#10b981' }} />
                      <span><strong>100% Achieved!</strong> Goal fully funded.</span>
                    </div>
                  )}

                  {/* Progress meters */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem' }}>
                      <span>Savings compilation progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '10px', background: '#cbd5e1', borderRadius: '9999px', overflow: 'hidden', boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(135deg, #0284c7, #10b981)', borderRadius: '9999px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>

                  {/* Add saving contributions inline! */}
                  {remainingAmt > 0 && (
                    <button
                      onClick={() => setContributeGoalId(g.id)}
                      className="clay-subcard"
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        border: 'none', background: '#ffffff', padding: '0.65rem', borderRadius: '16px',
                        cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: '#0284c7'
                      }}
                    >
                      <ArrowUpRight style={{ width: '1.1rem', height: '1.1rem' }} />
                      <span>Log Savings Contribution</span>
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* NEW GOAL DIALOGUE MODAL */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="clay-card animate-fade-in" style={{ maxWidth: '450px', width: '90%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>Create Savings Goal</h3>
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

            <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Goal Label Name</label>
                <input 
                  type="text" required placeholder="e.g. Laptop Fund or Emergency Buffer" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Target Savings Amount (₹)</label>
                <input 
                  type="number" required placeholder="e.g. 50000" value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Starting Saved Balance (₹)</label>
                <input 
                  type="number" placeholder="e.g. 10000 (defaults to 0)" value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Target Timeline Deadline</label>
                <input 
                  type="date" required value={targetDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                />
              </div>

              <button type="submit" className="clay-btn clay-btn-black" style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                <span>Create Saving Goal</span>
                <Plus className="clay-btn-arrow" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LOG CONTRIBUTION MODAL */}
      {contributeGoalId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="clay-card animate-fade-in" style={{ maxWidth: '400px', width: '90%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', letterSpacing: '-0.01em' }}>Log Savings Deposit</h3>
              <button 
                onClick={() => setContributeGoalId(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>
            </div>

            <form onSubmit={handleContributeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>
                  Contribution Amount (₹)
                </label>
                <input 
                  type="number" required placeholder="e.g. 5000" value={contributionAmt}
                  onChange={(e) => setContributionAmt(e.target.value)}
                  className="clay-inset" style={{ width: '100%', fontSize: '0.95rem' }}
                  autoFocus
                />
              </div>

              <button type="submit" className="clay-btn clay-btn-purple">
                <span>Confirm Contribution</span>
                <ArrowRight className="clay-btn-arrow" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
