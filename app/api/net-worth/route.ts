// GET / POST /api/net-worth
// Location: /app/api/net-worth/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { dbGetNetWorthSnapshots, dbSaveNetWorthSnapshot } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const snapshots = await dbGetNetWorthSnapshots(user.id);

    return NextResponse.json({
      data: snapshots,
      error: null
    });
  } catch (err: any) {
    console.error('GET net-worth error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred fetching net worth snapshots' },
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
    const { snapshot_date, assets, liabilities } = body;

    if (!snapshot_date || !assets || !liabilities) {
      return NextResponse.json(
        { data: null, error: 'Snapshot date, assets, and liabilities are required' },
        { status: 400 }
      );
    }

    // Save snapshot (calculates net worth inside db adapter)
    const snapshot = await dbSaveNetWorthSnapshot(
      user.id,
      snapshot_date,
      assets,
      liabilities
    );

    return NextResponse.json({
      data: snapshot,
      error: null
    });
  } catch (err: any) {
    console.error('POST net-worth error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred saving net worth snapshot' },
      { status: 500 }
    );
  }
}
