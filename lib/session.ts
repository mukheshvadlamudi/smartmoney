// HTTP Session & Cookie Helpers
// Location: /lib/session.ts

import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'smartmoney_session';

export interface SessionUser {
  id: string;
  email: string;
}

/**
 * Returns the currently authenticated user from Request cookies
 */
export function getSessionUser(req: NextRequest): SessionUser | null {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie || !cookie.value) {
    return null;
  }
  
  try {
    // Basic session decode (JSON string encoded)
    const user = JSON.parse(decodeURIComponent(cookie.value));
    if (user && user.id && user.email) {
      return user;
    }
  } catch (e) {
    console.error('Session decode error:', e);
  }
  return null;
}

/**
 * Sets the session cookie on a Response
 */
export function setSessionResponse(res: NextResponse, user: SessionUser): void {
  const value = encodeURIComponent(JSON.stringify(user));
  
  res.cookies.set({
    name: COOKIE_NAME,
    value: value,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days session
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Clears the session cookie on a Response
 */
export function clearSessionResponse(res: NextResponse): void {
  res.cookies.delete(COOKIE_NAME);
}
