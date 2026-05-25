// GET / POST /api/goals
// Location: /app/api/goals/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { dbGetGoals, dbSaveGoal } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const goals = await dbGetGoals(user.id);

    return NextResponse.json({
      data: goals,
      error: null
    });
  } catch (err: any) {
    console.error('GET goals error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred fetching goals' },
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
    const { name, target_amount, current_amount, target_date, id } = body;

    if (!name || !target_amount || !target_date) {
      return NextResponse.json(
        { data: null, error: 'Name, target_amount, and target_date are required' },
        { status: 400 }
      );
    }

    const target = Number(target_amount);
    const current = Number(current_amount || 0);

    if (isNaN(target) || target <= 0 || isNaN(current) || current < 0) {
      return NextResponse.json(
        { data: null, error: 'Invalid financial amount values' },
        { status: 400 }
      );
    }

    const goal = await dbSaveGoal(
      user.id,
      name,
      target,
      current,
      target_date,
      id || undefined
    );

    return NextResponse.json({
      data: goal,
      error: null
    });
  } catch (err: any) {
    console.error('POST goals error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred saving savings goal' },
      { status: 500 }
    );
  }
}
