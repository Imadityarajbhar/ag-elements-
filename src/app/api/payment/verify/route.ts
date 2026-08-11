import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { wcClient } from '@/services/woocommerce/client';

const key_secret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    if (!key_secret) {
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      wc_order_id
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !wc_order_id) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    const expectedBuf = Buffer.from(generated_signature, 'hex');
    const actualBuf = Buffer.from(razorpay_signature, 'hex');
    const signatureValid =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!signatureValid) {
      // Log failure note to WC
      try {
        await wcClient.fetch(`/orders/${wc_order_id}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            note: `Payment Verification Failed: Invalid Signature for Payment ID ${razorpay_payment_id}`,
            customer_note: false
          })
        });
      } catch (e) {}

      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Acknowledge payment on WooCommerce (but do NOT change status to processing yet - Webhook does that)
    // The note and the meta-data update are independent writes — no need to
    // serialize them.
    try {
      await Promise.all([
        wcClient.fetch(`/orders/${wc_order_id}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            note: `Frontend Signature Verified for Payment ID: ${razorpay_payment_id}. Waiting for Webhook to update status.`,
            customer_note: false
          })
        }),
        wcClient.fetch(`/orders/${wc_order_id}`, {
          method: 'PUT',
          body: JSON.stringify({
            meta_data: [
              { key: '_razorpay_payment_id', value: razorpay_payment_id },
              { key: '_razorpay_order_id', value: razorpay_order_id }
            ]
          })
        }),
      ]);
    } catch (e) {
      console.error("Failed to update WC order notes during verification", e);
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
