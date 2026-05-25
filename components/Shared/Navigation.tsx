// Global Navigation Shell (Top Bar & Floating Bottom Dock)
// Location: /components/Shared/Navigation.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ReceiptText, 
  UploadCloud, 
  PieChart, 
  Target, 
  Calculator, 
  FileBarChart, 
  Coins, 
  Settings,
  LogOut,
  User,
  Activity,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '@/types';
import AssistantDrawer from './AssistantDrawer';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authenticate user on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/transactions?month=2026-05');
        if (res.status === 401) {
          if (pathname === '/calculators') {
            setProfile(null);
            setLoading(false);
            return;
          }
          router.push('/auth/login');
          return;
        }

        // Try getting profile metadata or mock profile
        const localUser = localStorage.getItem('smartmoney_user');
        if (localUser) {
          setProfile(JSON.parse(localUser));
        } else {
          const defaultProfile: UserProfile = {
            id: 'mock-user',
            email: 'user@company.com',
            income_range: '₹50,000 - ₹1,00,000',
            account_type: 'salary',
            primary_bank: 'HDFC',
            primary_goal: 'Save more'
          } as any;
          localStorage.setItem('smartmoney_user', JSON.stringify(defaultProfile));
          setProfile(defaultProfile);
        }
      } catch (e) {
        console.error('Auth verification error:', e);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('smartmoney_user');
      router.push('/auth/login');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Ledger', path: '/transactions', icon: ReceiptText },
    { name: 'Upload', path: '/upload', icon: UploadCloud },
    { name: 'Budgets', path: '/budgets', icon: PieChart },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Calculators', path: '/calculators', icon: Calculator },
    { name: 'Reports', path: '/reports', icon: FileBarChart },
    { name: 'Net Worth', path: '/net-worth', icon: Coins },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#eef2f6',
        color: '#64748b',
        fontSize: '1.25rem',
        fontWeight: 600
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <Activity className="animate-spin" style={{ width: '3rem', height: '3rem', color: '#7c3aed' }} />
          <span>Synchronising Financial Mirror...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 1. MOBILE TOP HEADER BAR */}
      <header className="mobile-header">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="mobile-menu-btn"
          style={{ padding: '0.25rem', display: 'flex', alignItems: 'center' }}
        >
          <Menu style={{ width: '1.5rem', height: '1.5rem' }} />
        </button>

        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          {/* Logo Brand grid */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem', flexShrink: 0 }}>
            <rect x="2" y="16" width="4" height="4" rx="1" fill="#111827" />
            <rect x="8" y="16" width="4" height="4" rx="1" fill="#111827" />
            <rect x="14" y="16" width="4" height="4" rx="1" fill="#111827" />
            <rect x="2" y="10" width="4" height="4" rx="1" fill="#111827" />
            <rect x="8" y="10" width="4" height="4" rx="1" fill="#111827" />
            <rect x="14" y="10" width="4" height="4" rx="1" fill="#111827" />
            <rect x="2" y="4" width="4" height="4" rx="1" fill="#111827" />
            <rect x="8" y="4" width="4" height="4" rx="1" fill="#111827" />
            <rect x="16" y="1" width="4" height="4" rx="1" fill="#94a3b8" />
          </svg>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>Smart Money</span>
        </Link>
      </header>

      {/* 2. MOBILE SIDEBAR OVERLAY BACKGROUND BACKDROP */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(2px)', 
            zIndex: 940 
          }} 
        />
      )}

      {/* 3. CORE APPS LEFT SIDEBAR */}
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        
        {/* Mobile Sidebar Close Button */}
        <button 
          onClick={() => setSidebarOpen(false)} 
          style={{ 
            position: 'absolute', top: '1.25rem', right: '1.25rem', 
            border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b'
          }}
          className="mobile-close-btn-override"
        >
          <X style={{ width: '1.25rem', height: '1.25rem' }} />
          <style>{`
            .mobile-close-btn-override { display: none; }
            @media (max-width: 1024px) {
              .mobile-close-btn-override { display: block; }
            }
          `}</style>
        </button>

        {/* Sidebar Header Brand */}
        <div className="sidebar-logo">
          <Link href={profile ? "/dashboard" : "/"} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.65rem', flexShrink: 0 }}>
              <rect x="2" y="16" width="4" height="4" rx="1" fill="#111827" />
              <rect x="8" y="16" width="4" height="4" rx="1" fill="#111827" />
              <rect x="14" y="16" width="4" height="4" rx="1" fill="#111827" />
              <rect x="2" y="10" width="4" height="4" rx="1" fill="#111827" />
              <rect x="8" y="10" width="4" height="4" rx="1" fill="#111827" />
              <rect x="14" y="10" width="4" height="4" rx="1" fill="#111827" />
              <rect x="2" y="4" width="4" height="4" rx="1" fill="#111827" />
              <rect x="8" y="4" width="4" height="4" rx="1" fill="#111827" />
              <rect x="16" y="1" width="4" height="4" rx="1" fill="#94a3b8" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                Smart Money
              </h1>
              <span style={{ fontSize: '0.52rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.15em', marginTop: '0.15rem', textTransform: 'uppercase', lineHeight: 1 }}>
                by futurelab studios
              </span>
            </div>
          </Link>
        </div>

        {/* Sidebar Vertical Menu list */}
        <nav className="sidebar-menu">
          {profile ? (
            navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="sidebar-icon-wrap">
                    <Icon className="sidebar-item-icon" style={{ width: '1.15rem', height: '1.15rem' }} />
                  </div>
                  <span>{item.name}</span>
                </Link>
              );
            })
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <div className="sidebar-icon-wrap">
                  <Activity className="sidebar-item-icon" style={{ width: '1.15rem', height: '1.15rem' }} />
                </div>
                <span>Landing Page</span>
              </Link>
              <Link href="/auth/login" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <div className="sidebar-icon-wrap">
                  <User className="sidebar-item-icon" style={{ width: '1.15rem', height: '1.15rem' }} />
                </div>
                <span>Sign In</span>
              </Link>
              <Link href="/auth/signup" className="sidebar-item" onClick={() => setSidebarOpen(false)}>
                <div className="sidebar-icon-wrap">
                  <Sparkles className="sidebar-item-icon" style={{ width: '1.15rem', height: '1.15rem' }} />
                </div>
                <span>Register Free</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Sidebar Footer User session profile & logout */}
        {profile && (
          <div className="sidebar-footer">
            <div className="sidebar-profile">
              <span className="sidebar-profile-email" title={profile.email}>{profile.email}</span>
              <span className="sidebar-profile-bank">{profile.primary_bank} Statement Sandbox</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="clay-subcard"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                border: 'none',
                padding: '0.65rem 1rem',
                cursor: 'pointer',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ef4444',
                background: '#fee2e2',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut style={{ width: '0.95rem', height: '0.95rem' }} />
              <span>Logout Securely</span>
            </button>
          </div>
        )}
      </aside>

      {/* 4. GUARDRAILED CONVERSATIONAL AI FINANCE CO-PILOT */}
      {profile && <AssistantDrawer />}
    </>
  );
}
