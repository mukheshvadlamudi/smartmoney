// POST /api/auth/logout
// Location: /app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { clearSessionResponse } from '@/lib/session';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({
    data: { success: true },
    error: null
  });
  
  clearSessionResponse(res);
  
  return res;
}
