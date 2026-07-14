import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const WC_STORE_URL = process.env.NEXT_PUBLIC_WP_URL + 'wp-json/wc/store/v1';
const CART_TOKEN_COOKIE = 'wc_cart_token';

async function storeApiRequest(endpoint: string, method = 'POST', body?: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get(CART_TOKEN_COOKIE)?.value;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Cart-Token'] = token;
  }

  const res = await fetch(`${WC_STORE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const cartToken = res.headers.get('Cart-Token');
  const data = await res.json();

  return { data, cartToken, status: res.status, ok: res.ok };
}

export async function PUT(request: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    const body = await request.json();
    const response = await storeApiRequest('/cart/update-item', 'POST', {
      key,
      quantity: body.quantity
    });
    
    if (response.cartToken) {
      const cookieStore = await cookies();
      cookieStore.set(CART_TOKEN_COOKIE, response.cartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    const response = await storeApiRequest('/cart/remove-item', 'POST', {
      key
    });
    
    if (response.cartToken) {
      const cookieStore = await cookies();
      cookieStore.set(CART_TOKEN_COOKIE, response.cartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
