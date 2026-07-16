import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';
import { wcClient } from '@/services/woocommerce/client';
import { PAYMENT_METHODS } from '@/config/payment-methods';

const WC_STORE_URL = process.env.NEXT_PUBLIC_WP_URL + 'wp-json/wc/store/v1';
const CART_TOKEN_COOKIE = 'wc_cart_token';

// Ensure keys exist
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

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

export async function POST(request: Request) {
  try {
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const body = await request.json();
    
    // 1. Validate payment method against centralized configuration
    const requestedMethod = body.payment_method;
    const isValidMethod = PAYMENT_METHODS.some(m => m.id === requestedMethod && m.enabled);
    
    if (!isValidMethod) {
      return NextResponse.json({ error: `Payment method '${requestedMethod}' is not enabled or invalid.` }, { status: 400 });
    }
    
    // 2. Submit to WooCommerce Store API to create the Pending Order
    const wcResponse = await storeApiRequest('/checkout', 'POST', body);
    
    if (!wcResponse.ok) {
      return NextResponse.json(wcResponse.data, { status: wcResponse.status });
    }
    
    const wcOrder = wcResponse.data;
    const wcOrderId = wcOrder.order_id;
    
    if (!wcOrderId) {
      return NextResponse.json({ error: 'Failed to create WooCommerce order' }, { status: 500 });
    }

    let totalInPaise = 0;
    const orderData = await wcClient.fetch<any>(`/orders/${wcOrderId}`);
    if (orderData && orderData.total) {
       totalInPaise = Math.round(parseFloat(orderData.total) * 100);
    } else {
       return NextResponse.json({ error: 'Failed to fetch order total' }, { status: 500 });
    }

    // 3. Payment Gateway specific logic
    let razorpayOrderId = null;
    let paymentKeyId = null;

    if (requestedMethod === 'razorpay') {
      const rzpOrder = await razorpay.orders.create({
        amount: totalInPaise,
        currency: 'INR',
        receipt: `order_rcptid_${wcOrderId}`,
        notes: {
          wc_order_id: wcOrderId.toString(),
          source: 'headless_nextjs'
        }
      });
      razorpayOrderId = rzpOrder.id;
      paymentKeyId = key_id;

      try {
        await wcClient.fetch(`/orders/${wcOrderId}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            note: `Payment Initiated. Razorpay Order Created: ${rzpOrder.id}`,
            customer_note: false
          })
        });

        await wcClient.fetch(`/orders/${wcOrderId}`, {
          method: 'PUT',
          body: JSON.stringify({
            meta_data: [
              { key: '_razorpay_order_id', value: rzpOrder.id }
            ]
          })
        });
      } catch (e) {
        console.warn("Failed to add order notes or metadata", e);
      }
    } else if (requestedMethod === 'cod') {
       try {
        await wcClient.fetch(`/orders/${wcOrderId}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            note: `Order placed with Cash on Delivery.`,
            customer_note: false
          })
        });
      } catch (e) {
        console.warn("Failed to add order notes", e);
      }
    }

    // 4. Return success payload
    return NextResponse.json({
      success: true,
      wc_order_id: wcOrderId,
      razorpay_order_id: razorpayOrderId,
      amount: totalInPaise,
      currency: 'INR',
      key_id: paymentKeyId
    });
    
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: 'Failed to initialize payment' }, { status: 500 });
  }
}
