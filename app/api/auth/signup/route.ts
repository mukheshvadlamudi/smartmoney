// POST /api/auth/signup
// Location: /app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { dbMockSignUp, dbSaveUserProfile } from '@/lib/db';
import { setSessionResponse } from '@/lib/session';
import { isSupabaseConfigured, supabaseServer } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, income_range, account_type, primary_bank, primary_goal } = body;

    if (!email || !password) {
      return NextResponse.json(
        { data: null, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let userId: string;
    let userEmail: string;

    // 1. Create User
    if (isSupabaseConfigured && supabaseServer) {
      // Create user in Supabase Auth
      const { data, error } = await supabaseServer.auth.signUp({
        email,
        password
      });

      if (error) {
        return NextResponse.json(
          { data: null, error: error.message },
          { status: 400 }
        );
      }

      if (!data.user) {
        return NextResponse.json(
          { data: null, error: 'Failed to create user in authentication provider' },
          { status: 400 }
        );
      }

      userId = data.user.id;
      userEmail = data.user.email || email;
    } else {
      // For MVP/offline mode, we run our robust local mock auth
      const mockUser = await dbMockSignUp(email, password);
      userId = mockUser.id;
      userEmail = mockUser.email;
    }

    // 2. Save Onboarding Meta
    const profile = await dbSaveUserProfile(userId, {
      email: userEmail,
      income_range: income_range || '₹50,000 - ₹1,00,000',
      account_type: account_type || 'salary',
      primary_bank: primary_bank || 'HDFC',
      primary_goal: primary_goal || 'Save more'
    });

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
    console.error('Signup error:', err);
    return NextResponse.json(
      { data: null, error: err.message || 'An error occurred during registration' },
      { status: 500 }
    );
  }
}

