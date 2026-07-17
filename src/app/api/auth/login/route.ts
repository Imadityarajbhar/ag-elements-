import { NextResponse } from 'next/server';
import { wcClient } from '@/services/woocommerce/client';
import { mapAuthError } from '@/lib/error-mapper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/$/, '');

    // 1. Authenticate via JWT
    const res = await fetch(`${baseUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const code = data.code || '';
      const message = data.message || 'Invalid credentials';
      return NextResponse.json({ error: mapAuthError(code, message) }, { status: 401 });
    }

    const token = data.token;
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Auth] JWT issued successfully for email: ${email}`);
    }

    // 2. Get WP User ID from the token
    const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    let user = {
      id: data.user_id?.toString() || '0',
      email: data.user_email || email,
      firstName: email.split('@')[0],
      lastName: '',
      phone: '',
    };

    if (wpRes.ok) {
      const wpUser = await wpRes.json();
      try {
        // 3. Fetch full WooCommerce customer for accurate name/phone
        const customer = await wcClient.fetch(`/customers/${wpUser.id}`) as any;
        user = {
          id: customer.id.toString(),
          email: customer.email,
          firstName: customer.first_name || user.firstName,
          lastName: customer.last_name || '',
          phone: customer.billing?.phone || '',
        };
      } catch {
        // If WC customer fetch fails, fall back to WP user data
        user.id = wpUser.id.toString();
      }
    }

    // 4. Merge Guest Cart (if any)
    const cookieStore = request.headers.get('cookie') || '';
    const cartCookieMatch = cookieStore.match(/wc_cart_token=([^;]+)/);
    if (cartCookieMatch) {
      const cartToken = cartCookieMatch[1];
      try {
        // Store API does not accept JWT, so we just maintain the cart-token cookie
        // The frontend will continue to use this Cart-Token as a "guest" cart
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Auth] Guest cart token found: ${cartToken}. Proceeding with guest cart for Store API.`);
        }
      } catch (err) {
        console.warn('Failed to merge guest cart during login:', err);
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

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Auth] Cookie ag_auth_token stored securely.`);
    }

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
