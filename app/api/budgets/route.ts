// GET / POST /api/budgets
// Location: /app/api/budgets/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { dbGetBudgets, dbSaveBudget } from '@/lib/db';

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
    const month = searchParams.get('month'); // YYYY-MM
    
    if (!month) {
      return NextResponse.json(
        { data: null, error: 'Month parameter is required' },
        { status: 400 }
      );
    }

    const budgets = await dbGetBudgets(user.id, month);

    return NextResponse.json({
      data: budgets,
      error: null
    });
  } catch (err: any) {
    console.error('GET budgets error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred fetching budgets' },
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
    const { month, category, limit_amount } = body;

    if (!month || !category || limit_amount === undefined) {
      return NextResponse.json(
        { data: null, error: 'Month, category, and limit_amount are required' },
        { status: 400 }
      );
    }

    const limit = Number(limit_amount);
    if (isNaN(limit) || limit < 0) {
      return NextResponse.json(
        { data: null, error: 'Invalid budget limit amount' },
        { status: 400 }
      );
    }

    const budget = await dbSaveBudget(user.id, month, category, limit);

    return NextResponse.json({
      data: budget,
      error: null
    });
  } catch (err: any) {
    console.error('POST budgets error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred saving budget limit' },
      { status: 500 }
    );
  }
}
