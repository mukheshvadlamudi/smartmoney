// POST /api/assistant/chat
// Location: /app/api/assistant/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { 
  dbGetTransactions, 
  dbGetBudgets, 
  dbGetGoals, 
  dbGetNetWorthSnapshots 
} from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { message, month = '2026-05' } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { data: null, error: 'Message payload is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { data: null, error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    // 1. Gather database aggregates for the active month sandbox
    const [transactions, budgets, goals, netWorth] = await Promise.all([
      dbGetTransactions(user.id, { month }),
      dbGetBudgets(user.id, month),
      dbGetGoals(user.id),
      dbGetNetWorthSnapshots(user.id)
    ]);

    // 2. Compute mathematical details to inject as context
    const creditTxs = transactions.filter(tx => tx.type === 'credit');
    const debitTxs = transactions.filter(tx => tx.type === 'debit');
    
    const totalIncome = creditTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const actualSavings = debitTxs
      .filter(tx => tx.category === 'Savings')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalSpent = debitTxs
      .filter(tx => tx.category !== 'Savings')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const remainingSurplus = totalIncome - totalSpent - actualSavings;

    const categoryTotals: Record<string, number> = {};
    debitTxs.forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Number(tx.amount);
    });

    let context = `Active Sandbox Month: ${month}\n`;
    context += `Total Monthly Income (Credits): ₹${totalIncome.toLocaleString('en-IN')}\n`;
    context += `Total Monthly Expenses (excluding Savings): ₹${totalSpent.toLocaleString('en-IN')}\n`;
    context += `Actual savings logged (under Savings category): ₹${actualSavings.toLocaleString('en-IN')}\n`;
    context += `Calculated Remaining Cash Surplus: ₹${remainingSurplus.toLocaleString('en-IN')}\n\n`;

    context += `Category Outflows Breakdown:\n`;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      context += `- ${cat}: ₹${amt.toLocaleString('en-IN')}\n`;
    });

    context += `\nCategory Budgets & Exceeded Thresholds:\n`;
    if (budgets.length > 0) {
      budgets.forEach(b => {
        const spent = categoryTotals[b.category] || 0;
        context += `- ${b.category}: Limit ₹${Number(b.limit_amount).toLocaleString('en-IN')}, Current Spent ₹${spent.toLocaleString('en-IN')}\n`;
      });
    } else {
      context += `- No category budget limits are configured for this month.\n`;
    }

    context += `\nActive Savings Goals:\n`;
    if (goals.length > 0) {
      goals.forEach(g => {
        context += `- Goal: ${g.name}, Target: ₹${Number(g.target_amount).toLocaleString('en-IN')}, Current Balance: ₹${Number(g.current_amount).toLocaleString('en-IN')}, Target Date: ${g.target_date}\n`;
      });
    } else {
      context += `- No savings goals are currently logged in the database.\n`;
    }

    context += `\nNet Worth Portfolio History:\n`;
    if (netWorth.length > 0) {
      netWorth.forEach(nw => {
        context += `- Snapshot ${nw.snapshot_date}: Net Worth ₹${Number(nw.net_worth).toLocaleString('en-IN')}\n`;
      });
    } else {
      context += `- No net worth portfolio history snapshots are logged.\n`;
    }

    // 3. Perform server-side call to Google Gemini
    const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `User query: "${message}"\n\nActive personal finance context:\n${context}`
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: `You are the Smart Money personal finance co-pilot, a highly guardrailed, professional personal finance advisor. 
You analyze the provided sandbox ledger transactions, budgets, goals, and net worth context.

CORE RULES:
1. Strict Emoji Ban: You must NOT output ANY emojis or emoticons under any circumstances. Keep responses 100% emoji-free.
2. Context Boundary: You must ONLY answer questions directly related to the user's personal finances, ledger transactions, budget warnings, subscription leaks, net worth, and savings goals simulations (e.g. how much to save monthly to achieve a goal in N months).
3. Hard Refusal Guardrails:
   - If the user asks about coding, programming, software engineering, writing scripts, tech topics, recipes, general trivia, weather, etc., you MUST refuse to answer. Explain that you are a sandboxed personal finance co-pilot.
   - If the user asks for stock market predictions, live stock price lookups, cryptocurrency tips/advice (e.g. should I buy Bitcoin or how to invest in crypto), or live market commodity pricing (e.g. today's gold price), you MUST refuse. Explain that you do not have access to live external market feeds and only track their personal logged database metrics.
4. Professional tone: Use professional, high-end Markdown typography. Make calculations and recommendations crisp, using INR or currency signs where appropriate.`
            }
          ]
        },
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API returned error code:', response.status, errText);
      return NextResponse.json(
        { data: null, error: `Gemini API returned status ${response.status}` },
        { status: 502 }
      );
    }

    const resJson = await response.json();
    const replyText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      console.error('Unexpected Gemini API response structure:', JSON.stringify(resJson));
      return NextResponse.json(
        { data: null, error: 'Empty or invalid response from Gemini AI' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      data: {
        text: replyText.trim()
      },
      error: null
    });
  } catch (err: any) {
    console.error('POST /api/assistant/chat error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'Internal server error during chat co-pilot routing' },
      { status: 500 }
    );
  }
}
