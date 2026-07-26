import { NextResponse } from 'next/server';
import { storeApiRequest, persistCartSession } from '@/services/woocommerce/storeApiClient';

export async function PUT(request: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    const body = await request.json();
    const response = await storeApiRequest('/cart/update-item', 'POST', {
      key,
      quantity: body.quantity
    });
    await persistCartSession(response);
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
    await persistCartSession(response);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
