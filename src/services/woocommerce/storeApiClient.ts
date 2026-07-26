import { cookies } from 'next/headers';

// Shared client for the WooCommerce Store API (cart/checkout endpoints) —
// used by every route under src/app/api/cart, src/app/api/checkout, and
// src/app/api/payment/create-order. Previously each route redefined this
// same ~25-line helper locally; four of the six copies had silently drifted
// out of sync and never forwarded the logged-in user's Authorization header
// (only /api/cart and /api/checkout did), so update-quantity, remove-item,
// coupon, and shipping calls were running without the customer's auth
// context. Centralizing it means that class of drift can't happen again.
//
// It also fixes a more severe, previously-undiagnosed bug: the Store API
// requires a `Nonce` header on every write (POST/PUT/DELETE) request, issued
// via the `Nonce` response header on a prior GET. Nothing in this app ever
// captured that header — every write request was sent with no nonce at all,
// which WooCommerce's Store API rejects outright with a 401
// "Missing the Nonce header" error. Confirmed directly against the live
// WooCommerce host: a GET to /cart returns both `Cart-Token` and `Nonce`
// response headers; only the former was ever read. Since nothing on the site
// eagerly warms up the cart before a visitor's first Add to Cart click, this
// meant a fresh session's first add attempt failed outright.

const WC_STORE_URL = process.env.NEXT_PUBLIC_WP_URL + 'wp-json/wc/store/v1';
const CART_TOKEN_COOKIE = 'wc_cart_token';
const CART_NONCE_COOKIE = 'wc_cart_nonce';

export interface StoreApiResponse<T = unknown> {
  data: T;
  cartToken: string | null;
  nonce: string | null;
  status: number;
  ok: boolean;
}

async function rawStoreApiRequest<T = unknown>(
  endpoint: string,
  method: string,
  body: unknown,
  cartToken: string | undefined,
  nonce: string | undefined,
  authToken: string | undefined
): Promise<StoreApiResponse<T>> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (cartToken) headers['Cart-Token'] = cartToken;
  if (nonce) headers['Nonce'] = nonce;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  // The WordPress host's LiteSpeed page cache caches GET requests to this
  // endpoint by URL only, ignoring the Cart-Token header and overriding the
  // origin's own `Cache-Control: no-store`. Confirmed directly against the
  // host: every GET to /cart returns an identical, timestamp-frozen
  // Cart-Token + Nonce pair (same Etag) regardless of which token is sent —
  // so every guest without their own cookie yet silently inherits one
  // shared cart identity. A unique query param defeats the URL-keyed cache
  // key so each request reaches WooCommerce live.
  const url = method === 'GET'
    ? `${WC_STORE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}_=${Date.now()}`
    : `${WC_STORE_URL}${endpoint}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store', // Cart/checkout state must never be cached.
  });

  const data = await res.json();

  return {
    data: data as T,
    cartToken: res.headers.get('Cart-Token'),
    nonce: res.headers.get('Nonce'),
    status: res.status,
    ok: res.ok,
  };
}

export async function storeApiRequest<T = unknown>(
  endpoint: string,
  method: string = 'GET',
  body?: unknown
): Promise<StoreApiResponse<T>> {
  const cookieStore = await cookies();
  let cartToken = cookieStore.get(CART_TOKEN_COOKIE)?.value;
  let nonce = cookieStore.get(CART_NONCE_COOKIE)?.value;
  const authToken = cookieStore.get('ag_auth_token')?.value;

  // Writes require a nonce the Store API can validate. If we don't have one
  // cached yet (a visitor's very first cart interaction — nothing on the
  // site pre-warms this), fetch the cart once to obtain a fresh Cart-Token +
  // Nonce pair before attempting the real write, rather than sending it
  // nonce-less and letting WooCommerce reject it.
  if (method !== 'GET' && !nonce) {
    const warmup = await rawStoreApiRequest('/cart', 'GET', undefined, cartToken, undefined, authToken);
    if (warmup.cartToken) cartToken = warmup.cartToken;
    if (warmup.nonce) nonce = warmup.nonce;
  }

  return rawStoreApiRequest<T>(endpoint, method, body, cartToken, nonce, authToken);
}

/** Persists the Cart-Token / Nonce pair returned by the Store API back onto response cookies. */
export async function persistCartSession(response: Pick<StoreApiResponse, 'cartToken' | 'nonce'>) {
  if (!response.cartToken && !response.nonce) return;
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
  if (response.cartToken) cookieStore.set(CART_TOKEN_COOKIE, response.cartToken, cookieOptions);
  if (response.nonce) cookieStore.set(CART_NONCE_COOKIE, response.nonce, cookieOptions);
}
