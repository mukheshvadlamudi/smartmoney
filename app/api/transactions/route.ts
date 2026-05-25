// GET / POST /api/transactions
// Location: /app/api/transactions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { dbGetTransactions, dbSaveTransactions } from '@/lib/db';
import { categorizeTransaction } from '@/lib/categorizer';

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month') || undefined; // YYYY-MM
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const transactions = await dbGetTransactions(user.id, {
      month,
      category,
      search
    });

    return NextResponse.json({
      data: transactions,
      error: null
    });
  } catch (err: any) {
    console.error('GET transactions error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred fetching transactions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Can be a single transaction or an array of transactions
    const rawTxs = Array.isArray(body) ? body : [body];
    if (rawTxs.length === 0) {
      return NextResponse.json(
        { data: null, error: 'No transaction data provided' },
        { status: 400 }
      );
    }

    const preparedTxs = [];
    
    for (const tx of rawTxs) {
      const date = tx.date || new Date().toISOString().split('T')[0];
      const description = tx.description || 'Manual Transaction';
      const amount = Number(tx.amount);
      const type = tx.type || 'debit';
      const source = tx.source || 'manual';
      const statement_id = tx.statement_id || null;

      if (isNaN(amount) || amount < 0) {
        return NextResponse.json(
          { data: null, error: 'Invalid amount provided' },
          { status: 400 }
        );
      }

      // Auto-categorize if no category was specified or if it is "Other"
      let category = tx.category;
      if (!category || category === 'Other') {
        const catRes = await categorizeTransaction(user.id, description, amount, type);
        category = catRes.category;
      }

      preparedTxs.push({
        date,
        description,
        amount,
        type,
        category,
        source,
        statement_id
      });
    }

    const saved = await dbSaveTransactions(user.id, preparedTxs);

    return NextResponse.json({
      data: saved,
      error: null
    });
  } catch (err: any) {
    console.error('POST transactions error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred saving transactions' },
      { status: 500 }
    );
  }
}
