import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'auth_token';
const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface SessionPayload {
  token?: string;
}

export async function POST(request: Request) {
  let payload: SessionPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request payload' },
      { status: 400 }
    );
  }

  if (!payload.token || typeof payload.token !== 'string') {
    return NextResponse.json(
      { success: false, message: 'Token is required' },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: payload.token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: Number(process.env.AUTH_COOKIE_MAX_AGE ?? DEFAULT_MAX_AGE_SECONDS),
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

