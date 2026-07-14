import { NextResponse } from 'next/server';
import { createOrder } from '@/services/orders';
import { WooCommerceOrderPayload } from '@/types/woocommerce';

export async function POST(request: Request) {
  try {
    const payload: WooCommerceOrderPayload = await request.json();
    const order = await createOrder(payload);
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
