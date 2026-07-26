import { NextResponse } from 'next/server';
import { storeApiRequest, persistCartSession } from '@/services/woocommerce/storeApiClient';

export async function GET() {
  try {
    const response = await storeApiRequest('/checkout', 'GET');
    await persistCartSession(response);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch checkout' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await storeApiRequest('/checkout', 'POST', body);
    await persistCartSession(response);

    // Once checkout succeeds, cart is empty. We could clear the token, or keep it.
    // The Store API clears the cart internally.

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
