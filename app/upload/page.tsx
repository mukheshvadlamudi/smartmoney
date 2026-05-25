// Statement Uploader & Review Page
// Location: /app/upload/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Shared/Navigation';
import { 
  UploadCloud, 
  Check, 
  HelpCircle, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  X,
  FileText
} from 'lucide-react';
import { ParsedTransaction } from '@/lib/parser';
import { PRESET_CATEGORIES } from '@/types';

export default function UploadPage() {
  const router = useRouter();
  
  // Selection states
  const [bank, setBank] = useState('HDFC');
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [password, setPassword] = useState('');
  const [fileContent, setFileContent] = useState('');
  
  // Progress states
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Result states
  const [parsedTxs, setParsedTxs] = useState<ParsedTransaction[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger parsing
  const handleParse = async (textToParse: string, pass?: string) => {
    setUploading(true);
    setProgress(10);
    setError(null);

    // Simulate progress ticks
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    try {
      const res = await fetch('/api/parse-statement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToParse, bank, password: pass, fileName: file?.name })
      });

      clearInterval(interval);
      setProgress(100);
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to parse');

      setTimeout(() => {
        setParsedTxs(json.data || []);
        setShowReview(true);
        setUploading(false);
        setProgress(0);
      }, 300);

    } catch (e: any) {
      clearInterval(interval);
      setError(e.message || 'An error occurred during parsing');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setFileContent(text);
      };
      reader.readAsText(selected);
    }
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) {
      // Trigger simulation data if nothing was pasted
      handleParse('');
    } else {
      handleParse(pasteText);
    }
  };

  // Change category of a parsed item during review
  const handleReviewCategoryChange = (index: number, newCat: string) => {
    setParsedTxs(parsedTxs.map((tx, idx) => {
      if (idx === index) {
        return { ...tx, category: newCat, isAmbiguous: false };
      }
      return tx;
    }));
  };

  // Batch commit to database
  const handleConfirmImport = async () => {
    setError(null);
    setUploading(true);

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedTxs.map(t => ({
          ...t,
          source: 'uploaded'
        })))
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to import transactions');

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to commit transactions');
      setUploading(false);
    }
  };

  // Split into flagged and clean rows
  const ambiguousTxs = parsedTxs.filter(t => t.isAmbiguous);
  const cleanTxs = parsedTxs.filter(t => !t.isAmbiguous);

  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh' }}>
      <Navigation />
      
      <div className="app-container">
        
        <div className="page-header">
          <div>
            <h2 className="page-title">Statement Uploader</h2>
            <p className="page-subtitle">Upload CSV/PDF files or paste transaction text. No bank logins needed.</p>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffedd5', color: '#ea580c',
            padding: '1rem', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '2rem'
          }}>
            <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* LOADING PROGRESS SCREEN */}
        {uploading && (
          <div className="clay-card animate-fade-in" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
            <UploadCloud className="animate-bounce" style={{ width: '3rem', height: '3rem', color: '#7c3aed', margin: '0 auto 1.5rem auto' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Parsing Financial Records...</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Executing regex rules & compiling payee category dictionaries.
            </p>
            <div style={{ width: '100%', height: '10px', background: '#cbd5e1', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(135deg, #7c3aed, #ea580c)', borderRadius: '9999px', transition: 'width 0.2s ease' }} />
            </div>
          </div>
        )}

        {!uploading && !showReview && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }} className="animate-fade-in">
            
            {/* Left: Drag & Drop selector */}
            <div className="clay-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Select Bank Statement File</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Select Bank Template</label>
                  <select 
                    value={bank} onChange={(e) => setBank(e.target.value)}
                    className="clay-inset" style={{ width: '100%', fontSize: '0.95rem', background: '#eef2f6', border: 'none' }}
                  >
                    <option value="HDFC">HDFC Bank</option>
                    <option value="SBI">State Bank of India (SBI)</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="Axis">Axis Bank</option>
                    <option value="Kotak">Kotak Mahindra</option>
                    <option value="Yes">Yes Bank</option>
                    <option value="PNB">Punjab National Bank</option>
                    <option value="BOB">Bank of Baroda</option>
                    <option value="Other">Generic CSV Template</option>
                  </select>
                </div>

                {/* Simulated file drop */}
                <div style={{
                  border: '3px dashed #cbd5e1',
                  borderRadius: '24px',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input 
                    type="file" accept=".csv,.txt,.pdf,.xlsx,.xls" onChange={handleFileUpload}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  />
                  <UploadCloud style={{ width: '3rem', height: '3rem', color: '#94a3b8', margin: '0 auto 1rem auto' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                    {file ? file.name : 'Select or Drag Bank Statement (Excel / CSV / PDF / TXT)'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Accepts standard bank Excel, PDF, or CSV formats</p>
                </div>

                {file && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: '#ffffff', borderRadius: '20px', boxShadow: 'var(--shadow-outset-sm)' }}>
                    <div style={{ textAlign: 'left' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                        Decryption Password (if statement is password-encrypted)
                      </label>
                      <input 
                        type="password" 
                        placeholder="Enter statement password (e.g. customer ID, DOB, or PAN)..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="clay-inset"
                        style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', fontWeight: 400 }}
                      />
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        Smart Money decrypts statements inside sandboxed memory. Passwords are never stored.
                      </p>
                    </div>

                    <button 
                      onClick={() => handleParse(fileContent, password)}
                      className="clay-btn clay-btn-purple"
                      style={{ width: '100%', padding: '0.75rem 1.5rem', borderRadius: '16px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <span>Analyze & Decrypt Statement</span>
                      <ArrowRight className="clay-btn-arrow" />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', background: '#ede9fe', padding: '1rem', borderRadius: '16px', fontSize: '0.8rem', color: '#7c3aed', fontWeight: 600 }}>
                <FileText style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                <span>Supports columns: Date, Payee/Description, Amount, and CR/DR indicators. Encryption passwords will not be sent to servers.</span>
              </div>
            </div>

            {/* Right: Raw paste text area */}
            <div className="clay-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Or Paste Statement Text</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Copy your transaction lines directly from your bank spreadsheet or netbanking statement list, paste below, and parse!
              </p>

              <form onSubmit={handlePasteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <textarea 
                  rows={8}
                  placeholder="25-05-2026, SWIGGY ORDER 419A, 420.00, DR&#10;24-05-2026, ZOMATO FOOD OUT, 350.00, DR&#10;23-05-2026, SALARY CREDIT DISBURSE, 95000.00, CR"
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="clay-inset"
                  style={{ width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
                />

                <button type="submit" className="clay-btn clay-btn-black">
                  {pasteText.trim() === '' ? (
                    <>
                      <span>Simulate Standard Bank Upload</span>
                      <TrendingUp className="clay-btn-arrow" />
                    </>
                  ) : (
                    <>
                      <span>Parse Pasted Statements</span>
                      <ArrowRight className="clay-btn-arrow" />
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* 3. PARSED TRANSACTION REVIEW TABLE */}
        {!uploading && showReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Review Extracted Cash Flows</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Parsed {parsedTxs.length} transactions successfully. Verify category maps before importing.
                </p>
              </div>
              <button 
                onClick={() => { setShowReview(false); setParsedTxs([]); }}
                className="clay-subcard"
                style={{ border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', borderRadius: '9999px' }}
              >
                <X style={{ width: '1rem', height: '1rem' }} />
                <span>Reset Uploader</span>
              </button>
            </div>

            {/* A. AMBIGUOUS UPI REVIEW PILE */}
            {ambiguousTxs.length > 0 && (
              <div className="clay-card animate-fade-in" style={{ border: '2px solid #ea580c', background: 'rgba(255, 237, 213, 0.25)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <AlertTriangle style={{ color: '#ea580c', width: '1.5rem', height: '1.5rem' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                    Flagged Payees Review Pile ({ambiguousTxs.length})
                  </h4>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  These transactions contain cryptic UPI reference codes or random payee keys. Categorize them once below, and our smart dictionary remembers the mappings forever.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                  {parsedTxs.map((tx, idx) => {
                    if (!tx.isAmbiguous) return null;
                    return (
                      <div key={idx} className="clay-subcard" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
                            {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', wordBreak: 'break-all', marginTop: '0.15rem' }}>
                            {tx.description}
                          </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ef4444' }}>
                            - ₹{tx.amount}
                          </span>
                          
                          <select
                            value={tx.category}
                            onChange={(e) => handleReviewCategoryChange(idx, e.target.value)}
                            className="clay-inset"
                            style={{
                              padding: '0.35rem 0.5rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: '#ede9fe',
                              color: '#7c3aed',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          >
                            {PRESET_CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* B. MAIN VERIFIED TRANSACTIONS LIST */}
            <div className="clay-card" style={{ padding: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem' }}>
                Auto-Mapped Ledger Rows ({cleanTxs.length})
              </h4>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
                      <th style={{ padding: '0.5rem 1rem' }}>DATE</th>
                      <th style={{ padding: '0.5rem 1rem' }}>DESCRIPTION</th>
                      <th style={{ padding: '0.5rem 1rem' }}>AUTO CATEGORY</th>
                      <th style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedTxs.map((tx, idx) => {
                      if (tx.isAmbiguous) return null; // shown in pile above
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569' }}>
                          <td style={{ padding: '1rem' }}>
                            {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 600, color: '#111827' }}>
                            {tx.description}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <select
                              value={tx.category}
                              onChange={(e) => handleReviewCategoryChange(idx, e.target.value)}
                              className="clay-inset"
                              style={{
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: '#f1f5f9',
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              {PRESET_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                            {tx.type === 'credit' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IMPORT ACTION BUTTON */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                onClick={handleConfirmImport}
                className="clay-btn clay-btn-purple"
                style={{ width: 'auto', padding: '1rem 3rem', borderRadius: '9999px', gap: '1.5rem' }}
              >
                <span>Commit & Import Approved Ledger Rows</span>
                <Check className="clay-btn-arrow" />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
