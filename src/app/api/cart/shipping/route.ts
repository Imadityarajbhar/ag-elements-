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

// Update Shipping Address
export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const response = await storeApiRequest('/cart/update-customer', 'POST', {
      shipping_address: address,
      billing_address: address, // Usually keep them in sync for estimation
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

    if (!response.ok) {
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

// Select Shipping Rate
export async function PUT(request: Request) {
  try {
    const { packageId, rateId } = await request.json();
    if (packageId === undefined || !rateId) {
      return NextResponse.json({ error: 'Package ID and Rate ID required' }, { status: 400 });
    }

    const response = await storeApiRequest('/cart/select-shipping-rate', 'POST', {
      package_id: packageId,
      rate_id: rateId
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

    if (!response.ok) {
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to select shipping rate' }, { status: 500 });
  }
}
