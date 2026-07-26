import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';
import { wcClient } from '@/services/woocommerce/client';
import { storeApiRequest, persistCartSession } from '@/services/woocommerce/storeApiClient';
import { PAYMENT_METHODS } from '@/config/payment-methods';
import { getWpUserIdFromToken } from '@/lib/auth-helpers';

// Ensure keys exist
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

/**
 * Best-effort: links the guest order to a logged-in customer's account once
 * we know the WC order and the WP user id resolved from their JWT. Never
 * throws — a failure here must not block the order or payment from
 * proceeding, so every branch is logged rather than surfaced to the caller.
 */
async function attachCustomerToOrder(userIdPromise: Promise<number | null>, wcOrderId: number, orderData: any): Promise<void> {
  try {
    const userId = await userIdPromise;
    if (!userId) return;

    if (orderData.status !== 'pending' || orderData.customer_id !== 0) {
      console.warn(`[Checkout] Order ${wcOrderId} is not eligible for customer attachment. Status: ${orderData.status}, Customer ID: ${orderData.customer_id}`);
      return;
    }

    const customerData = await wcClient.fetch<any>(`/customers/${userId}`);
    const customerEmail = customerData?.email;
    const orderEmail = orderData.billing?.email;

    if (customerEmail && orderEmail && customerEmail.toLowerCase() === orderEmail.toLowerCase()) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Checkout] Emails match (${orderEmail}). Attaching customer_id ${userId} to order ${wcOrderId}`);
      }
      // Independent writes — neither depends on the other's result.
      await Promise.all([
        wcClient.fetch(`/orders/${wcOrderId}`, {
          method: 'PUT',
          body: JSON.stringify({ customer_id: userId })
        }),
        wcClient.fetch(`/orders/${wcOrderId}/notes`, {
          method: 'POST',
          body: JSON.stringify({
            note: `Customer linked through Headless Authentication.\nCustomer ID: ${userId}\nJWT verified successfully.\nLinked by AG Elements API.`,
            customer_note: false
          })
        }),
      ]);
    } else {
      console.warn(`[Checkout] JWT user email (${customerEmail}) does not match order billing email (${orderEmail}). Rejecting attachment.`);
      await wcClient.fetch(`/orders/${wcOrderId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          note: `Failed to link customer via Headless Auth. Email mismatch between JWT user and billing address.`,
          customer_note: false
        })
      });
    }
  } catch (err: any) {
    console.error('[Checkout] Failed to attach customer to order:', err);
  }
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

    // Kick off JWT -> WP user id resolution immediately. It only depends on
    // the auth cookie, not on anything the order creation below produces, so
    // there's no reason to wait until after the order exists to start it —
    // that was adding a full extra network round-trip to the critical path
    // of every logged-in checkout.
    const cookieStore = await cookies();
    const authToken = cookieStore.get('ag_auth_token')?.value;
    const userIdPromise: Promise<number | null> = authToken
      ? getWpUserIdFromToken(authToken, (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/$/, '')).catch((err) => {
          console.error('[Checkout] Failed to resolve WP user from JWT:', err);
          return null;
        })
      : Promise.resolve(null);

    // 2. Submit to WooCommerce Store API to create the Pending Order
    let wcResponse = await storeApiRequest('/checkout', 'POST', body);

    // 2.5 Seamless Fallback for Existing Accounts
    // If the user requested account creation but the email already exists,
    // the Store API rejects the entire checkout. We catch this and retry as a guest.
    if (!wcResponse.ok && (
      (wcResponse.data as any)?.code === 'registration-error-email-exists' ||
      ((wcResponse.data as any)?.message && typeof (wcResponse.data as any).message === 'string' && (wcResponse.data as any).message.toLowerCase().includes('already registered'))
    )) {
      if (body.create_account) {
        console.warn(`[Checkout] Email exists. Retrying order for ${body.billing_address?.email} without account creation.`);
        body.create_account = false;
        wcResponse = await storeApiRequest('/checkout', 'POST', body);
      }
    }

    // Not persisted anywhere before this fix — the cart-token/nonce pair from
    // this response was silently discarded, so a customer's *next* cart
    // interaction after checkout would carry a stale nonce.
    await persistCartSession(wcResponse);

    if (!wcResponse.ok) {
      return NextResponse.json(wcResponse.data, { status: wcResponse.status });
    }

    const wcOrder = wcResponse.data as any;
    const wcOrderId = wcOrder.order_id;

    if (!wcOrderId) {
      return NextResponse.json({ error: 'Failed to create WooCommerce order' }, { status: 500 });
    }

    const orderData = await wcClient.fetch<any>(`/orders/${wcOrderId}`);
    if (!orderData || !orderData.total) {
      return NextResponse.json({ error: 'Failed to fetch order total' }, { status: 500 });
    }
    const totalInPaise = Math.round(parseFloat(orderData.total) * 100);

    // Customer attachment is a best-effort side effect with no bearing on the
    // payment response — run it concurrently with payment-gateway order
    // creation below instead of blocking on it first.
    const attachCustomerPromise = attachCustomerToOrder(userIdPromise, wcOrderId, orderData);

    // 3. Payment Gateway specific logic
    let razorpayOrderId: string | null = null;
    let paymentKeyId: string | null = null;

    if (requestedMethod === 'razorpay') {
      const [rzpOrder] = await Promise.all([
        razorpay.orders.create({
          amount: totalInPaise,
          currency: 'INR',
          receipt: `order_rcptid_${wcOrderId}`,
          notes: {
            wc_order_id: wcOrderId.toString(),
            source: 'headless_nextjs'
          }
        }),
        attachCustomerPromise,
      ]);
      razorpayOrderId = rzpOrder.id;
      paymentKeyId = key_id;

      try {
        await Promise.all([
          wcClient.fetch(`/orders/${wcOrderId}/notes`, {
            method: 'POST',
            body: JSON.stringify({
              note: `Payment Initiated. Razorpay Order Created: ${rzpOrder.id}`,
              customer_note: false
            })
          }),
          wcClient.fetch(`/orders/${wcOrderId}`, {
            method: 'PUT',
            body: JSON.stringify({
              meta_data: [
                { key: '_razorpay_order_id', value: rzpOrder.id }
              ]
            })
          }),
        ]);
      } catch (e) {
        console.warn("Failed to add order notes or metadata", e);
      }
    } else if (requestedMethod === 'cod') {
      const codNotePromise = wcClient.fetch(`/orders/${wcOrderId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          note: `Order placed with Cash on Delivery.`,
          customer_note: false
        })
      }).catch((e) => console.warn("Failed to add order notes", e));

      await Promise.all([attachCustomerPromise, codNotePromise]);
    } else {
      await attachCustomerPromise;
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
    return NextResponse.json({ error: `Failed to initialize payment: ${error.message || JSON.stringify(error)}` }, { status: 500 });
  }
}
