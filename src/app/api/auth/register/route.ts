import { NextResponse } from 'next/server';
import { wcClient } from '@/services/woocommerce/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      // 1. Create WooCommerce Customer
      await wcClient.fetch('/customers', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName || '',
          username: email,
        }),
      });
    } catch (wcError: any) {
      console.error('WooCommerce Registration Error:', wcError);
      return NextResponse.json({ error: wcError.message || 'Email already exists or invalid data' }, { status: 400 });
    }

    // 2. Auto-login via JWT
    const baseUrl = process.env.NEXT_PUBLIC_WC_API_URL || '';
    const loginRes = await fetch(`${baseUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      // If login fails after reg, we return success but without token (shouldn't happen)
      return NextResponse.json({ error: 'Registered successfully but auto-login failed' }, { status: 500 });
    }

    const token = loginData.token;
    const user = {
      id: loginData.user_id?.toString() || loginData.id?.toString() || '0',
      email: loginData.user_email || email,
      firstName: loginData.user_nicename || loginData.user_display_name || firstName,
      lastName: lastName || '',
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
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
