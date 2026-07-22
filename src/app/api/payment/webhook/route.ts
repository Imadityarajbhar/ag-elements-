import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { wcClient } from '@/services/woocommerce/client';
import { WooCommerceOrder } from '@/types/woocommerce';

const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET; // Fallback if not specifically set

export async function POST(request: Request) {
  try {
    if (!webhook_secret) {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const rawBody = await request.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Verify webhook signature using a constant-time comparison — a plain !==
    // string compare leaks timing information that can help an attacker forge
    // a valid signature byte-by-byte.
    const expectedSignature = crypto
      .createHmac('sha256', webhook_secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'hex');
    const actualBuf = Buffer.from(signature, 'hex');
    const signatureValid =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!signatureValid) {
      console.error('Invalid Webhook Signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // FRESHNESS CHECK (Ignore events older than 24 hours)
    const eventTimestamp = body.created_at;
    if (eventTimestamp) {
      const now = Math.floor(Date.now() / 1000);
      if (now - eventTimestamp > 86400) { // 24 hours
        return NextResponse.json({ success: true, message: 'Event too old, ignored' });
      }
    }

    const event = body.event;
    const payload = body.payload;
    const payment = payload.payment?.entity;
    const order = payload.order?.entity;
    
    // WooCommerce Order ID from notes/receipt
    let wcOrderId = payment?.notes?.wc_order_id || order?.notes?.wc_order_id;
    
    if (!wcOrderId) {
      // Sometimes it's embedded in the receipt (e.g., order_rcptid_1234)
      if (order?.receipt?.startsWith('order_rcptid_')) {
        wcOrderId = order.receipt.replace('order_rcptid_', '');
      }
    }

    if (!wcOrderId) {
      console.error('Webhook: Missing WooCommerce Order ID in payload');
      return NextResponse.json({ error: 'Missing WC Order ID' }, { status: 400 });
    }

    // IDEMPOTENCY CHECK
    // Fetch WC Order to see if we already processed this webhook event
    const eventId = request.headers.get('x-razorpay-event-id') || body.created_at?.toString() || 'unknown';
    const idempotencyKey = `_razorpay_webhook_${event}_${eventId}`;
    
    const wcOrderData = await wcClient.fetch<WooCommerceOrder>(`/orders/${wcOrderId}`);
    if (!wcOrderData) {
      return NextResponse.json({ error: 'WC Order not found' }, { status: 404 });
    }

    const hasProcessed = wcOrderData.meta_data?.some((meta: any) => meta.key === idempotencyKey);
    if (hasProcessed) {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }
    
    // AMOUNT VALIDATION
    if (payment && (event === 'payment.captured' || event === 'order.paid')) {
      const expectedAmount = Math.round(parseFloat(wcOrderData.total) * 100);
      const actualAmount = payment.amount;
      if (actualAmount !== expectedAmount) {
        // Log mismatch and don't process as success
        await wcClient.fetch(`/orders/${wcOrderId}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            note: `WARNING: Webhook payment amount (${actualAmount / 100}) does not match order total (${wcOrderData.total}). Status not updated to processing.`,
            customer_note: false
          })
        });
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }
    }

    // Determine Action Based on Event
    let newStatus = wcOrderData.status;
    let noteText = `Webhook Received: ${event}`;

    if (event === 'payment.captured' || event === 'order.paid') {
      if (wcOrderData.status !== 'processing' && wcOrderData.status !== 'completed') {
        newStatus = 'processing';
        noteText = `Payment Captured. Webhook updated status to Processing. Payment ID: ${payment?.id}`;
      }
    } else if (event === 'payment.failed') {
      if (wcOrderData.status === 'pending') {
        newStatus = 'failed';
        noteText = `Payment Failed. Webhook updated status to Failed. Payment ID: ${payment?.id}. Reason: ${payment?.error_description}`;
      }
    } else if (event === 'refund.processed') {
      const refund = payload.refund?.entity;
      noteText = `Refund Processed. Refund ID: ${refund?.id}. Amount: ${refund?.amount / 100} INR.`;
      // We don't automatically change order status to refunded unless full amount is refunded
      // This logic can be expanded.
    } else if (event === 'payment.authorized') {
      noteText = `Payment Authorized. Payment ID: ${payment?.id}. Awaiting capture.`;
    }

    // Update WC Order (Status + Metadata + Note)
    const metaUpdates = [
      { key: idempotencyKey, value: 'processed' }
    ];

    if (payment?.id) metaUpdates.push({ key: '_razorpay_payment_id', value: payment.id });
    if (order?.id) metaUpdates.push({ key: '_razorpay_order_id', value: order.id });
    
    if (event === 'refund.processed') {
      const refund = payload.refund?.entity;
      metaUpdates.push({ key: '_razorpay_refund_id', value: refund?.id });
      metaUpdates.push({ key: '_razorpay_refund_status', value: refund?.status });
      metaUpdates.push({ key: '_razorpay_refund_amount', value: refund?.amount });
    }

    await wcClient.fetch(`/orders/${wcOrderId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: newStatus,
        meta_data: metaUpdates
      })
    });

    await wcClient.fetch(`/orders/${wcOrderId}/notes`, {
      method: 'POST',
      body: JSON.stringify({
        note: noteText,
        customer_note: false
      })
    });

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
