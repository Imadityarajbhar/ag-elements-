import { NextResponse } from 'next/server';
import { storeApiRequest, persistCartSession } from '@/services/woocommerce/storeApiClient';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 });
    }

    const response = await storeApiRequest('/cart/apply-coupon', 'POST', { code });
    await persistCartSession(response);

    if (!response.ok) {
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to apply coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) {
      return NextResponse.json({ error: 'Coupon code required' }, { status: 400 });
    }

    const response = await storeApiRequest('/cart/remove-coupon', 'POST', { code });
    await persistCartSession(response);

    if (!response.ok) {
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove coupon' }, { status: 500 });
  }
}
