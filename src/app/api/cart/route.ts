import { NextResponse } from 'next/server';
import { storeApiRequest, persistCartSession } from '@/services/woocommerce/storeApiClient';

export async function GET() {
  const response = await storeApiRequest('/cart');
  await persistCartSession(response);
  return NextResponse.json(response.data, { status: response.status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await storeApiRequest('/cart/add-item', 'POST', body);
    await persistCartSession(response);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}
