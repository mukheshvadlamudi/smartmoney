// GET /api/reports/[month]
// Location: /app/api/reports/[month]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { dbGetTransactions } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ month: string }> }
) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { month } = await params; // 'YYYY-MM'

    // 1. Fetch all transactions for this month
    const transactions = await dbGetTransactions(user.id, { month });

    // 2. Initialise counters
    let totalIncome = 0;
    let totalSpent = 0;
    
    const categoryTotals: Record<string, number> = {};
    let biggestExpense = { id: '', description: '', amount: 0, date: '' };
    
    // Frequency tracker for small recurring payees
    const payeeFreqs: Record<string, { count: number; totalAmt: number; type: string }> = {};

    for (const tx of transactions) {
      const amt = Number(tx.amount);
      if (tx.type === 'credit') {
        totalIncome += amt;
      } else {
        totalSpent += amt;
        
        // Category totals
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt;
        
        // Biggest single expense
        if (amt > biggestExpense.amount) {
          biggestExpense = {
            id: tx.id,
            description: tx.description,
            amount: amt,
            date: tx.date
          };
        }
      }

      // Track payee frequencies
      const normPayee = tx.description.toUpperCase().trim();
      if (!payeeFreqs[normPayee]) {
        payeeFreqs[normPayee] = { count: 0, totalAmt: 0, type: tx.type };
      }
      payeeFreqs[normPayee].count += 1;
      payeeFreqs[normPayee].totalAmt += amt;
    }

    // Convert category totals to array with percentages
    const categoryBreakdown = Object.entries(categoryTotals).map(([name, amount]) => {
      return {
        name,
        amount: Math.round(amount),
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    // Most frequent small transactions (usually under ₹500, like tea stalls, small groceries, UPI)
    const frequentSmall = Object.entries(payeeFreqs)
      .filter(([_, data]) => data.type === 'debit' && (data.totalAmt / data.count) < 500)
      .map(([name, data]) => ({
        payee: name,
        frequency: data.count,
        averageAmount: Math.round(data.totalAmt / data.count),
        totalSpent: Math.round(data.totalAmt)
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3); // top 3 frequent small expenses

    // 3. MONEY LEAKS DETECTOR
    // Scans for transactions with the same payee, similar amount, and multiple occurrences 
    // (either in this month or across other months, but let's scan all user transactions for subscription behavior!)
    const allUserTransactions = await dbGetTransactions(user.id);
    
    // Group all transactions by payee name to check for multi-month recurring patterns
    const payeeHistory: Record<string, { amounts: number[]; dates: string[] }> = {};
    for (const tx of allUserTransactions) {
      if (tx.type === 'credit') continue;
      const normPayee = tx.description.toUpperCase().trim();
      if (!payeeHistory[normPayee]) {
        payeeHistory[normPayee] = { amounts: [], dates: [] };
      }
      payeeHistory[normPayee].amounts.push(Number(tx.amount));
      payeeHistory[normPayee].dates.push(tx.date);
    }

    const detectedLeaks = [];
    for (const [payee, history] of Object.entries(payeeHistory)) {
      // A potential leak has at least 2 entries in total, and occurs on different dates
      if (history.dates.length >= 2) {
        // Check if amount is roughly identical (within 5% margin)
        const avgAmount = history.amounts.reduce((a, b) => a + b, 0) / history.amounts.length;
        const isSimilarAmount = history.amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.05);

        // Check if dates have roughly a monthly difference (around 25-35 days difference between dates)
        let isMonthlyInterval = false;
        if (history.dates.length >= 2) {
          const sortedDates = [...history.dates].sort().map(d => new Date(d).getTime());
          const intervals = [];
          for (let i = 1; i < sortedDates.length; i++) {
            const diffDays = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
            intervals.push(diffDays);
          }
          // If intervals average around 28-32 days, or there's at least one such monthly jump
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          isMonthlyInterval = avgInterval >= 25 && avgInterval <= 35;
        }

        // Keywords that match streaming, gyms, software subscriptions
        const knownSubscriptionKeywords = ['NETFLIX', 'PRIME', 'HOTSTAR', 'SPOTIFY', 'AIRTEL', 'JIO', 'FIBERNET', 'ADOBE', 'MICROSOFT', 'GOOGLE', 'CANVA', 'GYM', 'EMI', 'YOUTUBE'];
        const isKnownSubName = knownSubscriptionKeywords.some(keyword => payee.includes(keyword));

        // If it's a monthly recurring interval, OR a known subscription merchant appearing multiple times
        if ((isSimilarAmount && isMonthlyInterval) || (history.dates.length >= 2 && isKnownSubName)) {
          detectedLeaks.push({
            payee: payee,
            averageAmount: Math.round(avgAmount),
            frequency: 'Monthly',
            lastDate: [...history.dates].sort().pop() || '',
            totalCostAnnualEst: Math.round(avgAmount * 12)
          });
        }
      }
    }

    return NextResponse.json({
      data: {
        month,
        summary: {
          income: totalIncome,
          spending: totalSpent,
          savings: totalIncome - totalSpent
        },
        categoryBreakdown,
        biggestExpense: biggestExpense.amount > 0 ? biggestExpense : null,
        frequentSmall,
        detectedLeaks
      },
      error: null
    });
  } catch (err: any) {
    console.error('GET report error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred generating monthly report' },
      { status: 500 }
    );
  }
}
