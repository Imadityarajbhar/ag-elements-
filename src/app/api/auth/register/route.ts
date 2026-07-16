import { NextResponse } from 'next/server';
import { wcClient } from '@/services/woocommerce/client';
import { mapAuthError } from '@/lib/error-mapper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
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
          billing: {
            first_name: firstName,
            last_name: lastName || '',
            email,
            phone: phone || '',
          },
        }),
      });
    } catch (wcError: any) {
      console.error('WooCommerce Registration Error:', wcError);
      const rawMsg = wcError.message || 'Registration failed';
      return NextResponse.json({ error: mapAuthError('registration_error', rawMsg) }, { status: 400 });
    }

    // 2. Auto-login via JWT
    const baseUrl = (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/$/, '');
    const loginRes = await fetch(`${baseUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      return NextResponse.json({ error: 'Account created successfully. Please log in.' }, { status: 201 });
    }

    const token = loginData.token;

    // 3. Get full customer data
    let user = {
      id: loginData.user_id?.toString() || '0',
      email: loginData.user_email || email,
      firstName,
      lastName: lastName || '',
      phone: phone || '',
    };

    try {
      const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (wpRes.ok) {
        const wpUser = await wpRes.json();
        user.id = wpUser.id.toString();
      }
    } catch {
      // Non-critical: ID fallback is acceptable
    }

    // 4. Merge Guest Cart (if any)
    const cookieStore = request.headers.get('cookie') || '';
    const cartCookieMatch = cookieStore.match(/wc_cart_token=([^;]+)/);
    if (cartCookieMatch) {
      const cartToken = cartCookieMatch[1];
      try {
        await fetch(`${baseUrl}/wp-json/wc/store/v1/cart`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cart-Token': cartToken,
          }
        });
        console.log('Guest cart merged successfully.');
      } catch (err) {
        console.warn('Failed to merge guest cart during registration:', err);
      }
    }

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
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
