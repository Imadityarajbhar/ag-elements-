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

export async function GET(request: Request) {
  try {
    const response = await storeApiRequest('/checkout', 'GET');
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch checkout' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await storeApiRequest('/checkout', 'POST', body);
    
    // Once checkout succeeds, cart is empty. We could clear the token, or keep it.
    // The Store API clears the cart internally.

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
