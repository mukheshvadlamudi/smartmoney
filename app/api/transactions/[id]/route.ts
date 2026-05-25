// PATCH / DELETE /api/transactions/[id]
// Location: /app/api/transactions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { dbUpdateTransactionCategory, dbDeleteTransaction, dbSavePayeeMapping } from '@/lib/db';

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
    const { category } = body;

    if (!category) {
      return NextResponse.json(
        { data: null, error: 'Category is required' },
        { status: 400 }
      );
    }

    // 1. Update the transaction category
    const updated = await dbUpdateTransactionCategory(user.id, id, category);
    if (!updated) {
      return NextResponse.json(
        { data: null, error: 'Transaction not found or unauthorized' },
        { status: 404 }
      );
    }

    // 2. Train the Payee Dictionary (Memory Engine Layer 3)
    // Save this payee mapping so the system remembers this mapping forever!
    if (updated.description) {
      await dbSavePayeeMapping(user.id, updated.description, category);
    }

    return NextResponse.json({
      data: updated,
      error: null
    });
  } catch (err: any) {
    console.error('PATCH transaction error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred updating transaction' },
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
    const success = await dbDeleteTransaction(user.id, id);

    if (!success) {
      return NextResponse.json(
        { data: null, error: 'Transaction not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: { success: true },
      error: null
    });
  } catch (err: any) {
    console.error('DELETE transaction error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred deleting transaction' },
      { status: 500 }
    );
  }
}
