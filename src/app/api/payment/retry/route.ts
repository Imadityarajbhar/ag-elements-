import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { wcClient } from '@/services/woocommerce/client';
import { WooCommerceOrder } from '@/types/woocommerce';

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // 1. Fetch WooCommerce Order
    const wcOrder = await wcClient.fetch<WooCommerceOrder>(`/orders/${order_id}`);
    
    if (!wcOrder) {
      return NextResponse.json({ error: 'WooCommerce Order not found' }, { status: 404 });
    }

    // 2. Validate Status
    if (wcOrder.status !== 'pending' && wcOrder.status !== 'failed') {
      return NextResponse.json({ 
        error: `Order cannot be retried. Current status is ${wcOrder.status}` 
      }, { status: 400 });
    }

    // 3. Convert total to paise
    const totalInPaise = Math.round(parseFloat(wcOrder.total) * 100);

    // 4. Initialize Razorpay and Create New Order
    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: totalInPaise,
      currency: 'INR',
      receipt: `order_rcptid_${wcOrder.id}_retry`,
      notes: {
        wc_order_id: wcOrder.id.toString(),
        source: 'headless_nextjs_retry'
      }
    });

    // 5. Add Note to WC Order
    try {
      await wcClient.fetch(`/orders/${wcOrder.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          note: `Payment Retry Initiated. New Razorpay Order Created: ${rzpOrder.id}`,
          customer_note: false
        })
      });

      // Update meta data with new Razorpay Order ID
      await wcClient.fetch(`/orders/${wcOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          meta_data: [
            { key: '_razorpay_order_id', value: rzpOrder.id }
          ]
        })
      });
    } catch (e) {
      console.warn("Failed to add order notes or metadata during retry", e);
    }

    // 6. Return payload
    return NextResponse.json({
      success: true,
      wc_order_id: wcOrder.id,
      razorpay_order_id: rzpOrder.id,
      amount: totalInPaise,
      currency: 'INR',
      key_id: key_id
    });
    
  } catch (error: any) {
    console.error("Razorpay Retry Order Error:", error);
    return NextResponse.json({ error: 'Failed to initialize payment retry' }, { status: 500 });
  }
}
