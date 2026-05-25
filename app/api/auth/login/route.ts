// POST /api/auth/login
// Location: /app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { dbMockLogIn, dbGetUserProfile } from '@/lib/db';
import { setSessionResponse } from '@/lib/session';
import { isSupabaseConfigured, supabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { data: null, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let userId: string;
    let userEmail: string;

    // 1. Authenticate user
    if (isSupabaseConfigured && supabaseServer) {
      const { data, error } = await supabaseServer.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return NextResponse.json(
          { data: null, error: error.message },
          { status: 401 }
        );
      }

      if (!data.user) {
        return NextResponse.json(
          { data: null, error: 'User session could not be established' },
          { status: 401 }
        );
      }

      userId = data.user.id;
      userEmail = data.user.email || email;
    } else {
      const mockUser = await dbMockLogIn(email, password);
      if (!mockUser) {
        return NextResponse.json(
          { data: null, error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      userId = mockUser.id;
      userEmail = mockUser.email;
    }

    // 2. Fetch profile
    const profile = await dbGetUserProfile(userId);

    const res = NextResponse.json({
      data: {
        user: { id: userId, email: userEmail },
        profile
      },
      error: null
    });

    // 3. Set Session Cookie
    setSessionResponse(res, { id: userId, email: userEmail });

    return res;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred during authentication' },
      { status: 500 }
    );
  }
}

