// PATCH / DELETE /api/goals/[id]
// Location: /app/api/goals/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { dbUpdateGoalProgress, dbDeleteGoal } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { current_amount } = body;

    if (current_amount === undefined) {
      return NextResponse.json(
        { data: null, error: 'current_amount is required' },
        { status: 400 }
      );
    }

    const amount = Number(current_amount);
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        { data: null, error: 'Invalid current amount value' },
        { status: 400 }
      );
    }

    const updated = await dbUpdateGoalProgress(user.id, id, amount);
    if (!updated) {
      return NextResponse.json(
        { data: null, error: 'Goal not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updated,
      error: null
    });
  } catch (err: any) {
    console.error('PATCH goal error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred updating goal progress' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const success = await dbDeleteGoal(user.id, id);

    if (!success) {
      return NextResponse.json(
        { data: null, error: 'Goal not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: { success: true },
      error: null
    });
  } catch (err: any) {
    console.error('DELETE goal error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred deleting goal' },
      { status: 500 }
    );
  }
}
