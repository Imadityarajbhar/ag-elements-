import { NextResponse } from 'next/server';
import { wcClient } from '@/services/woocommerce/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const orderData = await wcClient.fetch<any>(`/orders/${orderId}`);
    if (!orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: orderData.status,
      payment_method: orderData.payment_method,
      total: orderData.total
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json({ error: 'Failed to check order status' }, { status: 500 });
  }
}
