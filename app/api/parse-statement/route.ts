// POST /api/parse-statement
// Location: /app/api/parse-statement/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { parseBankStatement } from '@/lib/parser';
import { categorizeTransaction } from '@/lib/categorizer';

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
    const { text, bank, password, fileName } = body;

    if (!bank) {
      return NextResponse.json(
        { data: null, error: 'Bank selection is required' },
        { status: 400 }
      );
    }

    // Simulate encrypted bank statement validation (PDF / Excel)
    // If a PDF or password-protected Excel is uploaded, we require a password to simulate stream decryption
    if (fileName && (fileName.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls'))) {
      if (!password) {
        return NextResponse.json(
          { data: null, error: `This ${bank} statement is password-protected. Please enter your decryption password below.` },
          { status: 400 }
        );
      }
    }

    // 1. Run the raw string parser
    // If text is empty/missing, parseBankStatement automatically generates gorgeous mock data for the chosen bank!
    const parsedTransactions = parseBankStatement(text || '', bank);

    // 2. Pre-categorize all extracted rows immediately
    const preCategorized = [];
    for (const tx of parsedTransactions) {
      const catRes = await categorizeTransaction(
        user.id,
        tx.description,
        tx.amount,
        tx.type
      );
      
      preCategorized.push({
        ...tx,
        category: catRes.category,
        matchedLayer: catRes.matchedLayer
      });
    }

    return NextResponse.json({
      data: preCategorized,
      error: null
    });
  } catch (err: any) {
    console.error('Statement parsing error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred during statement parsing' },
      { status: 500 }
    );
  }
}
