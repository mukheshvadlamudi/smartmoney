// Floating Chat Assistant Drawer Widget (Option B)
// Location: /components/Shared/AssistantDrawer.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Activity } from 'lucide-react';
import { queryAssistant, FinancialData } from '@/lib/assistant';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export default function AssistantDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [finData, setFinData] = useState<FinancialData>({
    transactions: [],
    budgets: [],
    goals: [],
    netWorth: [],
    currentMonth: '2026-05'
  });
  const [loadingContext, setLoadingContext] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize first greeting once context or mount occurs
  useEffect(() => {
    setMessages([
      {
        sender: 'assistant',
        text: '### Hello!\nI am your sandboxed **Finance Co-Pilot**. I am equipped with 100% private, guardrailed RAG logic. I have direct access to your local ledger, budget caps, and savings goals.\n\nClick any **Helper Inquiry** below or type a query to begin auditing your financial mirror!',
        timestamp: new Date()
      }
    ]);
  }, []);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isSending]);

  // Load sandbox context data when drawer is mounted
  useEffect(() => {
    async function loadContext() {
      setLoadingContext(true);
      try {
        const [txRes, bRes, gRes, nwRes] = await Promise.all([
          fetch('/api/transactions?month=2026-05'),
          fetch('/api/budgets'),
          fetch('/api/goals'),
          fetch('/api/net-worth')
        ]);

        const [txJson, bJson, gJson, nwJson] = await Promise.all([
          txRes.json(),
          bRes.json(),
          gRes.json(),
          nwRes.json()
        ]);

        setFinData({
          transactions: txJson.data || [],
          budgets: bJson.data || [],
          goals: gJson.data || [],
          netWorth: nwJson.data || [],
          currentMonth: '2026-05'
        });
      } catch (e) {
        console.error('Failed to load co-pilot financial data context:', e);
      } finally {
        setLoadingContext(false);
      }
    }
    loadContext();
  }, []);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      // 2. Call server-side co-pilot API route
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          month: finData.currentMonth
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const resJson = await response.json();
      if (resJson.error || !resJson.data?.text) {
        throw new Error(resJson.error || 'Invalid API response structure');
      }

      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: resJson.data.text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('AI co-pilot API failed, executing local RAG matching fallback:', err);
      // Client-side local pattern-matching fallback
      const replyText = queryAssistant(textToSend, finData);
      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: replyText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  // Convert custom simple markdown bullet points to raw formatted html inside drawer
  const formatMsgHtml = (text: string) => {
    const lines = text.split('\n');
    let inList = false;
    let html = '';

    lines.forEach(line => {
      // Heading 3
      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h4 style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-top: 0.85rem; margin-bottom: 0.4rem; letter-spacing: -0.01em;">${line.substring(4)}</h4>`;
      } 
      // Bullet items
      else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        if (!inList) { html += '<ul style="margin-left: 1.15rem; margin-bottom: 0.75rem; list-style-type: disc;">'; inList = true; }
        // Bold inside bullets
        let content = line.substring(line.indexOf(' ')).trim();
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #0f172a;">$1</strong>');
        content = content.replace(/\`(.*?)\`/g, '<code style="background: #f1f5f9; padding: 0.1rem 0.25rem; border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #334155;">$1</code>');
        html += `<li style="font-size: 0.82rem; color: #475569; margin-bottom: 0.25rem;">${content}</li>`;
      } 
      // Standalone Tip blocks or text
      else if (line.trim()) {
        if (inList) { html += '</ul>'; inList = false; }
        let content = line.trim();
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #0f172a;">$1</strong>');
        content = content.replace(/\`(.*?)\`/g, '<code style="background: #f1f5f9; padding: 0.1rem 0.25rem; border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: #334155;">$1</code>');
        
        if (content.startsWith('Tip:') || content.startsWith('Note:') || content.startsWith('Warning:')) {
          html += `<p style="font-size: 0.8rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.65rem 0.85rem; border-radius: 12px; margin-top: 0.65rem; color: #334155; line-height: 1.4;">${content}</p>`;
        } else {
          html += `<p style="font-size: 0.82rem; color: #475569; margin-bottom: 0.65rem; line-height: 1.4;">${content}</p>`;
        }
      }
    });

    if (inList) { html += '</ul>'; }
    return html;
  };

  const suggestions = [
    { label: 'Cash Flow', query: 'Summarize my cash flows' },
    { label: 'Food spent', query: 'How much did I spend on Food?' },
    { label: 'Budget limits', query: 'Check my budget limits' },
    { label: 'Subscription leaks', query: 'Show my subscription leaks' },
    { label: 'Saving goals', query: 'Am I on track for my goals?' }
  ];

  return (
    <>
      {/* CLOSED FLOATING CAPSULE BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="co-pilot-capsule"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            padding: '0.65rem 1.25rem',
            height: '3rem',
            borderRadius: '9999px',
            background: 'var(--accent-purple)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            boxShadow: '0 10px 30px rgba(124, 58, 237, 0.35)',
            zIndex: 1000,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Sparkles className="bubble-icon" style={{ width: '1.25rem', height: '1.25rem' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            AI Assistant
          </span>
          <style>{`
            .co-pilot-capsule:hover {
              transform: scale(1.08) translateY(-4px);
              box-shadow: 0 14px 40px rgba(124, 58, 237, 0.45);
              background: var(--accent-purple-hover);
            }
            .co-pilot-capsule:active {
              transform: scale(0.96);
            }
          `}</style>
        </button>
      )}

      {/* OPENED GLASSMORPHIC DRAWER PANEL */}
      {isOpen && (
        <div
          className="co-pilot-drawer"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '380px',
            height: '520px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '2rem',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12), 0 1px 3px rgba(15, 23, 42, 0.02)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'drawerSlideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <style>{`
            @keyframes drawerSlideUp {
              from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            @media (max-width: 480px) {
              .co-pilot-drawer {
                width: calc(100vw - 2rem) !important;
                right: 1rem !important;
                left: 1rem !important;
                bottom: 1rem !important;
                height: 480px !important;
              }
            }
          `}</style>

          {/* Drawer Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  background: 'var(--accent-purple)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles style={{ width: '1.05rem', height: '1.05rem' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', margin: 0 }}>SmartAssistant</h3>
                <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.05rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <Activity style={{ width: '0.65rem', height: '0.65rem' }} />
                  <span>Sandbox RAG Co-Pilot</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#64748b',
                padding: '0.25rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>

          {/* Messages Chain */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              background: '#ffffff'
            }}
          >
            {messages.map((msg, i) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: isUser ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                      background: isUser ? '#1e293b' : '#ede9fe',
                      color: isUser ? '#ffffff' : '#1e293b',
                      fontSize: '0.85rem',
                      border: isUser ? 'none' : '1px solid rgba(139, 92, 246, 0.15)',
                      boxShadow: isUser ? '0 4px 10px rgba(30, 41, 59, 0.1)' : 'none'
                    }}
                    dangerouslySetInnerHTML={{ __html: isUser ? msg.text : formatMsgHtml(msg.text) }}
                  />
                  <span
                    style={{
                      fontSize: '0.62rem',
                      color: '#94a3b8',
                      marginTop: '0.25rem',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      padding: '0 0.25rem'
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })}

            {/* Spinner indicator when loading */}
            {isSending && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  maxWidth: '85%',
                  alignSelf: 'flex-start'
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem',
                    background: '#ede9fe',
                    color: '#64748b',
                    fontSize: '0.85rem',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Activity className="animate-spin" style={{ width: '0.85rem', height: '0.85rem', color: '#7c3aed' }} />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions helpers */}
          <div
            style={{
              padding: '0.65rem 1rem',
              background: '#f8fafc',
              borderTop: '1px solid rgba(226, 232, 240, 0.6)',
              overflowX: 'auto',
              display: 'flex',
              gap: '0.5rem',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}
          >
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestClick(s.query)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '9999px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-purple)';
                  e.currentTarget.style.color = 'var(--accent-purple)';
                  e.currentTarget.style.background = 'var(--accent-purple-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.background = '#ffffff';
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            style={{
              padding: '1rem 1.25rem',
              background: '#f8fafc',
              borderTop: '1px solid rgba(226, 232, 240, 0.8)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              placeholder="Ask co-pilot (e.g. food bills, budgets)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isSending}
              className="clay-inset"
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                borderRadius: '9999px',
                background: '#ffffff',
                boxShadow: 'none',
                opacity: isSending ? 0.7 : 1
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: (input.trim() && !isSending) ? 'var(--accent-purple)' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                cursor: (input.trim() && !isSending) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (input.trim() && !isSending) ? '0 4px 10px rgba(124, 58, 237, 0.25)' : 'none',
                transition: 'all 0.2s',
                flexShrink: 0
              }}
            >
              <Send style={{ width: '1rem', height: '1rem' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
