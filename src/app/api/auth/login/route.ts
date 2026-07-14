import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_WC_API_URL || '';
    const res = await fetch(`${baseUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Invalid credentials' }, { status: res.status });
    }

    // Success response contains token, user_email, user_nicename, user_display_name
    const token = data.token;
    const user = {
      id: data.user_id?.toString() || data.id?.toString() || '0',
      email: data.user_email || email,
      firstName: data.user_nicename || data.user_display_name || email.split('@')[0],
      lastName: '', // We might need to fetch full profile later in /me
    };

    const response = NextResponse.json({ token, user });

    // Set httpOnly cookie
    response.cookies.set({
      name: 'ag_auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
