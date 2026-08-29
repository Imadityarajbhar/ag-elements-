import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';
import { wcClient } from '@/services/woocommerce/client';
import { storeApiRequest, persistCartSession } from '@/services/woocommerce/storeApiClient';
import { PAYMENT_METHODS } from '@/config/payment-methods';
import { getWpUserIdFromToken } from '@/lib/auth-helpers';
import { WooCommerceOrder } from '@/types/woocommerce';

// Ensure keys exist
const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

const CHECKOUT_REQUEST_ID_META = '_checkout_request_id';
const COD_SHIPPING_PREPAY_META = '_cod_shipping_prepay';
const COD_SHIPPING_DUE_META = '_cod_shipping_due_paise';
const COD_CASH_DUE_META = '_cod_cash_due_paise';
const RAZORPAY_ORDER_ID_META = '_razorpay_order_id';

/**
 * Fire-and-forget order note. Never throws — a note failing to post must
 * never block or fail the checkout itself, only the caller's own decision to
 * proceed or not (which is made independently of this).
 */
async function postNote(wcOrderId: number, note: string): Promise<void> {
  try {
    await wcClient.fetch(`/orders/${wcOrderId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note, customer_note: false })
    });
  } catch (e) {
    console.warn(`[Checkout] Failed to add note to order ${wcOrderId}:`, e);
  }
}

/**
 * Tags an order with the client's checkout_request_id so a retried/duplicate
 * submission (or a resumed partial failure) can find it later via
 * findOrderByCheckoutRequestId. Best-effort: if this write fails, the worst
 * outcome is that a genuine retry won't find this order and will start a
 * fresh one instead — a self-healing duplicate, not a money-safety issue —
 * so it must not abort the checkout.
 */
async function tagWithCheckoutRequestId(wcOrderId: number, checkoutRequestId: string): Promise<void> {
  try {
    await wcClient.fetch(`/orders/${wcOrderId}`, {
      method: 'PUT',
      body: JSON.stringify({ meta_data: [{ key: CHECKOUT_REQUEST_ID_META, value: checkoutRequestId }] })
    });
  } catch (e) {
    console.warn(`[Checkout] Failed to tag order ${wcOrderId} with checkout_request_id:`, e);
  }
}

/**
 * Rewrites an order to its real Cash-on-Delivery identity (payment_method,
 * payment_method_title, and the shipping/cash split) and verifies — from the
 * PUT's own response body, not just its HTTP status — that the values
 * actually landed before the caller is allowed to proceed. A 2xx response
 * from WooCommerce does not by itself prove the specific fields we asked for
 * were applied; this checks the fields themselves.
 *
 * Throws if verification fails. Callers must not create or expose a
 * Razorpay order until this has resolved successfully — that ordering is
 * what guarantees a browser is never handed a Razorpay order for a
 * WooCommerce order that isn't correctly prepared as COD yet.
 */
async function applyCodIdentity(wcOrderId: number, shippingPaise: number, cashDuePaise: number): Promise<void> {
  const codGatewayTitle = PAYMENT_METHODS.find(m => m.id === 'cod')?.title || 'Cash on Delivery';

  const updated = await wcClient.fetch<WooCommerceOrder>(`/orders/${wcOrderId}`, {
    method: 'PUT',
    body: JSON.stringify({
      payment_method: 'cod',
      payment_method_title: codGatewayTitle,
      meta_data: [
        { key: COD_SHIPPING_PREPAY_META, value: shippingPaise > 0 ? 'yes' : 'not_required' },
        { key: COD_SHIPPING_DUE_META, value: shippingPaise },
        { key: COD_CASH_DUE_META, value: cashDuePaise },
      ]
    })
  });

  const shippingMetaOk = updated.meta_data?.some(m => m.key === COD_SHIPPING_DUE_META && String(m.value) === String(shippingPaise));
  if (updated.payment_method !== 'cod' || !shippingMetaOk) {
    throw new Error(`COD identity rewrite for order ${wcOrderId} did not verify (payment_method=${updated.payment_method})`);
  }
}

/**
 * Sets an order's status and verifies — from the PUT's own response, not
 * just its HTTP status — that the new status actually applied.
 */
async function setOrderStatus(wcOrderId: number, status: string): Promise<void> {
  const updated = await wcClient.fetch<WooCommerceOrder>(`/orders/${wcOrderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });

  if (updated.status !== status) {
    throw new Error(`Order ${wcOrderId} status did not verify as '${status}' (got '${updated.status}')`);
  }
}

function readCodMeta(order: WooCommerceOrder) {
  const shippingDue = order.meta_data?.find(m => m.key === COD_SHIPPING_DUE_META);
  const razorpayOrderId = order.meta_data?.find(m => m.key === RAZORPAY_ORDER_ID_META);
  const hasCodIdentity = order.payment_method === 'cod' && !!shippingDue;
  return {
    hasCodIdentity,
    shippingDuePaise: shippingDue ? parseInt(String(shippingDue.value), 10) : null,
    razorpayOrderId: razorpayOrderId?.value ? String(razorpayOrderId.value) : null,
  };
}

/**
 * Finds a recent order tagged with this exact checkout_request_id. Unlike
 * the email+recency heuristic this replaces, a match here means "the
 * customer's browser sent the literal same checkout attempt" (the id is
 * regenerated client-side whenever the cart contents or chosen payment
 * method change — see checkout/page.tsx) — never "probably the same
 * customer, probably around the same time." A genuinely different order
 * from the same customer always carries a different id and can never match.
 *
 * Bounded to a recent window purely to keep the underlying query cheap
 * (WooCommerce's REST API has no meta_key/meta_value filter, so this has to
 * scan a page of recent orders and filter client-side) — correctness comes
 * from the exact id match, not from the window.
 */
async function findOrderByCheckoutRequestId(checkoutRequestId: string | undefined): Promise<WooCommerceOrder | null> {
  if (!checkoutRequestId || typeof checkoutRequestId !== 'string' || checkoutRequestId.length > 100) return null;

  try {
    const after = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const recentOrders = await wcClient.fetch<WooCommerceOrder[]>(`/orders?after=${encodeURIComponent(after)}&per_page=50&orderby=date&order=desc`);

    const match = (recentOrders || []).find(o => o.meta_data?.some(m => m.key === CHECKOUT_REQUEST_ID_META && m.value === checkoutRequestId));
    if (!match) return null;

    // A definitively failed/cancelled attempt is not something create-order
    // should silently resume — a fresh checkout should proceed normally.
    // /api/payment/retry remains the explicit tool for resurrecting those.
    if (match.status === 'failed' || match.status === 'cancelled') return null;

    return match;
  } catch (err) {
    console.warn('[Checkout] Failed to look up existing order by checkout_request_id, proceeding to create a new one:', err);
    return null;
  }
}

/**
 * Handles a request whose checkout_request_id matches an order that already
 * exists (in-flight, or left partially prepared by an earlier failure).
 * Never creates a second WooCommerce order for the same attempt. Recovers
 * from a prior partial failure using only values already fixed on the order
 * itself (its own total/shipping_total, or already-written COD meta) — never
 * by re-deriving anything from the live cart, which may have since changed
 * or been emptied.
 */
async function resumeExistingOrder(order: WooCommerceOrder, requestedMethod: string, razorpay: Razorpay): Promise<NextResponse> {
  const totalInPaise = Math.round(parseFloat(order.total) * 100);

  if (requestedMethod === 'razorpay') {
    const existingRzpId = order.meta_data?.find(m => m.key === RAZORPAY_ORDER_ID_META)?.value;

    if (order.status === 'processing' || order.status === 'completed') {
      return NextResponse.json({ success: true, wc_order_id: order.id, razorpay_order_id: null, amount: 0, currency: 'INR', key_id: null });
    }

    if (existingRzpId) {
      const existingRzpOrder = await razorpay.orders.fetch(String(existingRzpId));
      return NextResponse.json({
        success: true, wc_order_id: order.id, razorpay_order_id: String(existingRzpId),
        amount: existingRzpOrder.amount, currency: existingRzpOrder.currency, key_id
      });
    }

    // Order exists (pending, still labeled razorpay) but no Razorpay order
    // was ever successfully linked to it — a prior attempt failed before
    // that step. Recover by creating one now for this order's own fixed
    // total (never re-derived from the live cart).
    const rzpOrder = await razorpay.orders.create({
      amount: totalInPaise, currency: 'INR', receipt: `order_rcptid_${order.id}`,
      notes: { wc_order_id: order.id.toString(), source: 'headless_nextjs_resume' }
    });
    await postNote(order.id, `Payment resumed. Razorpay Order Created: ${rzpOrder.id}`);
    await wcClient.fetch(`/orders/${order.id}`, { method: 'PUT', body: JSON.stringify({ meta_data: [{ key: RAZORPAY_ORDER_ID_META, value: rzpOrder.id }] }) }).catch(e => console.warn('[Checkout] Failed to record resumed razorpay order id:', e));

    return NextResponse.json({ success: true, wc_order_id: order.id, razorpay_order_id: rzpOrder.id, amount: totalInPaise, currency: 'INR', key_id });
  }

  // requestedMethod === 'cod'
  if (order.status === 'processing' || order.status === 'completed') {
    // Already finalized (shipping payment already captured by the webhook,
    // or was a free-shipping order finalized immediately) — nothing left to
    // pay. Must not re-expose its Razorpay order id, which would let the
    // frontend re-open a checkout modal for a charge that already succeeded.
    return NextResponse.json({ success: true, wc_order_id: order.id, razorpay_order_id: null, amount: 0, currency: 'INR', key_id: null });
  }

  const codMeta = readCodMeta(order);
  const hasCodIdentity = codMeta.hasCodIdentity;
  let shippingDuePaise = codMeta.shippingDuePaise;
  let razorpayOrderId = codMeta.razorpayOrderId;

  if (!hasCodIdentity) {
    // The identity rewrite itself never completed last time. Recompute from
    // the order's own authoritative, immutable fields and retry it now.
    const shippingPaise = Math.round(parseFloat(order.shipping_total || '0') * 100);
    const cashDuePaise = totalInPaise - shippingPaise;
    try {
      await applyCodIdentity(order.id, shippingPaise, cashDuePaise);
    } catch (err) {
      await postNote(order.id, `COD setup failed again on resume — needs manual review. ${(err as Error).message}`);
      console.error(`[Checkout] Resume: COD identity rewrite failed for order ${order.id}:`, err);
      return NextResponse.json({ error: 'Could not prepare Cash on Delivery order. Please try again.' }, { status: 500 });
    }
    shippingDuePaise = shippingPaise;
    razorpayOrderId = null;
  }

  if (shippingDuePaise === null) {
    // Should be unreachable once hasCodIdentity is true, but fail closed
    // rather than guess an amount.
    return NextResponse.json({ error: 'Could not determine Cash on Delivery amount. Please try again.' }, { status: 500 });
  }

  if (shippingDuePaise <= 0) {
    if (order.status !== 'processing' && order.status !== 'completed') {
      try {
        await setOrderStatus(order.id, 'processing');
      } catch (err) {
        await postNote(order.id, `Failed to finalize free-shipping COD order on resume. ${(err as Error).message}`);
        console.error(`[Checkout] Resume: status finalize failed for order ${order.id}:`, err);
        return NextResponse.json({ error: 'Could not finalize order. Please try again.' }, { status: 500 });
      }
    }
    return NextResponse.json({ success: true, wc_order_id: order.id, razorpay_order_id: null, amount: 0, currency: 'INR', key_id: null });
  }

  if (razorpayOrderId) {
    const existingRzpOrder = await razorpay.orders.fetch(razorpayOrderId);
    return NextResponse.json({
      success: true, wc_order_id: order.id, razorpay_order_id: razorpayOrderId,
      amount: existingRzpOrder.amount, currency: existingRzpOrder.currency, key_id
    });
  }

  // COD identity is confirmed and durable, but no shipping-charge Razorpay
  // order was ever linked — a prior attempt failed between preparing the
  // order and creating/recording that charge. Recover using the
  // already-fixed shipping-due amount from the order itself, never
  // recomputed from a possibly-changed live cart.
  const rzpOrder = await razorpay.orders.create({
    amount: shippingDuePaise, currency: 'INR', receipt: `order_rcptid_${order.id}_codship`,
    notes: { wc_order_id: order.id.toString(), source: 'headless_nextjs_resume', purpose: 'cod_shipping_prepay' }
  });
  await postNote(order.id, `Cash on Delivery shipping charge resumed. Razorpay Order Created: ${rzpOrder.id}`);
  await wcClient.fetch(`/orders/${order.id}`, { method: 'PUT', body: JSON.stringify({ meta_data: [{ key: RAZORPAY_ORDER_ID_META, value: rzpOrder.id }] }) }).catch(e => console.warn('[Checkout] Failed to record resumed razorpay order id:', e));

  return NextResponse.json({ success: true, wc_order_id: order.id, razorpay_order_id: rzpOrder.id, amount: shippingDuePaise, currency: 'INR', key_id });
}

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

    const checkoutRequestId: string | undefined = typeof body.checkout_request_id === 'string' ? body.checkout_request_id : undefined;

    // 1.5 Resume/idempotency check. Replaces the previous email+recency
    // duplicate guard, which could incorrectly conflate two different orders
    // placed by the same customer close together. checkout_request_id is a
    // client-generated id regenerated whenever the cart contents or chosen
    // payment method change (see checkout/page.tsx), so a match here can
    // only mean "the literal same checkout attempt was submitted again" —
    // never "probably the same order." This does not, and cannot, provide
    // true atomic exactly-once guarantees for two genuinely concurrent
    // requests racing this same check (WooCommerce's REST API has no
    // compare-and-swap primitive) — see the audit report for that residual
    // risk. What it does guarantee is that it can never falsely discard a
    // real, different order.
    const existingOrder = await findOrderByCheckoutRequestId(checkoutRequestId);
    if (existingOrder) {
      return await resumeExistingOrder(existingOrder, requestedMethod, razorpay);
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
    //
    // For 'cod' we deliberately submit as 'razorpay' here, not 'cod'. Store
    // API's checkout endpoint invokes whichever gateway's process_payment()
    // synchronously, and WooCommerce's native COD gateway finalizes the
    // order to Processing (and fires the customer "Processing" email) in
    // that same call — before we've collected the shipping prepayment.
    // 'razorpay' is the only enabled gateway on this store whose Store-API
    // process_payment() leaves the order at Pending without finalizing
    // (confirmed against the live install), which is exactly the behavior
    // the existing plain-Razorpay flow already relies on below. Once the
    // order exists we rewrite payment_method/payment_method_title back to
    // the real 'cod' values via applyCodIdentity() — a plain, verified
    // metadata update that never invokes any gateway, since gateways only
    // run during this checkout call, which has already completed.
    const storeApiBody = requestedMethod === 'cod' ? { ...body, payment_method: 'razorpay' } : body;
    let wcResponse = await storeApiRequest('/checkout', 'POST', storeApiBody);

    // 2.5 Seamless Fallback for Existing Accounts
    // If the user requested account creation but the email already exists,
    // the Store API rejects the entire checkout. We catch this and retry as a guest.
    if (!wcResponse.ok && (
      (wcResponse.data as any)?.code === 'registration-error-email-exists' ||
      ((wcResponse.data as any)?.message && typeof (wcResponse.data as any).message === 'string' && (wcResponse.data as any).message.toLowerCase().includes('already registered'))
    )) {
      if (storeApiBody.create_account) {
        console.warn(`[Checkout] Email exists. Retrying order for ${body.billing_address?.email} without account creation.`);
        storeApiBody.create_account = false;
        wcResponse = await storeApiRequest('/checkout', 'POST', storeApiBody);
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

    const orderData = await wcClient.fetch<WooCommerceOrder>(`/orders/${wcOrderId}`);
    if (!orderData || !orderData.total) {
      return NextResponse.json({ error: 'Failed to fetch order total' }, { status: 500 });
    }
    const totalInPaise = Math.round(parseFloat(orderData.total) * 100);

    // Tag the order with the checkout_request_id immediately, before any
    // COD-specific or Razorpay-specific logic runs, so that even if
    // something below fails partway through, this exact attempt remains
    // findable and recoverable via resumeExistingOrder on the next request.
    // Best-effort: see tagWithCheckoutRequestId's doc comment.
    if (checkoutRequestId) {
      await tagWithCheckoutRequestId(wcOrderId, checkoutRequestId);
    }

    // Customer attachment is a best-effort side effect with no bearing on the
    // payment response — run it concurrently with payment-gateway order
    // creation below instead of blocking on it first.
    const attachCustomerPromise = attachCustomerToOrder(userIdPromise, wcOrderId, orderData);

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

      try {
        await Promise.all([
          postNote(wcOrderId, `Payment Initiated. Razorpay Order Created: ${rzpOrder.id}`),
          wcClient.fetch(`/orders/${wcOrderId}`, {
            method: 'PUT',
            body: JSON.stringify({
              meta_data: [
                { key: RAZORPAY_ORDER_ID_META, value: rzpOrder.id }
              ]
            })
          }),
        ]);
      } catch (e) {
        console.warn("Failed to add order notes or metadata", e);
      }

      return NextResponse.json({
        success: true,
        wc_order_id: wcOrderId,
        razorpay_order_id: rzpOrder.id,
        amount: totalInPaise,
        currency: 'INR',
        key_id
      });
    }

    // requestedMethod === 'cod'
    const shippingPaise = Math.round(parseFloat(orderData.shipping_total || '0') * 100);
    const cashDuePaise = totalInPaise - shippingPaise;

    // Prepare the order's real COD identity FIRST, and verify it landed,
    // before anything Razorpay-related is created or exposed to the
    // browser. If this fails, no Razorpay order ever exists for this
    // attempt — there is nothing to orphan, and nothing the customer could
    // be shown that would let them pay against a not-yet-correct order.
    try {
      await applyCodIdentity(wcOrderId, shippingPaise, cashDuePaise);
    } catch (err) {
      await postNote(wcOrderId, `COD setup failed — payment_method rewrite did not verify. Safe to retry; will resume automatically via checkout_request_id. ${(err as Error).message}`);
      console.error(`[Checkout] COD identity rewrite failed for order ${wcOrderId}:`, err);
      await attachCustomerPromise;
      return NextResponse.json({ error: 'Could not prepare Cash on Delivery order. Please try again.' }, { status: 500 });
    }

    if (shippingPaise <= 0) {
      // Free shipping: nothing to collect online. Sequential, verified
      // finalize — no concurrent write to this order's status alongside the
      // identity write above.
      try {
        await setOrderStatus(wcOrderId, 'processing');
      } catch (err) {
        await postNote(wcOrderId, `COD order prepared but failed to finalize status. Safe to retry. ${(err as Error).message}`);
        console.error(`[Checkout] Free-shipping COD status finalize failed for order ${wcOrderId}:`, err);
        await attachCustomerPromise;
        return NextResponse.json({ error: 'Could not finalize order. Please try again.' }, { status: 500 });
      }

      await Promise.all([
        postNote(wcOrderId, `Cash on Delivery (free shipping) — full amount of ₹${orderData.total} to be collected as cash on delivery.`),
        attachCustomerPromise,
      ]);

      return NextResponse.json({
        success: true,
        wc_order_id: wcOrderId,
        razorpay_order_id: null,
        amount: 0,
        currency: 'INR',
        key_id: null
      });
    }

    // Ship > 0: identity is confirmed durable — now, and only now, create
    // the shipping-only Razorpay charge and expose it to the browser.
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: shippingPaise,
        currency: 'INR',
        receipt: `order_rcptid_${wcOrderId}_codship`,
        notes: {
          wc_order_id: wcOrderId.toString(),
          source: 'headless_nextjs',
          purpose: 'cod_shipping_prepay'
        }
      });
    } catch (err) {
      await postNote(wcOrderId, `COD order prepared correctly, but the shipping charge could not be created on Razorpay. Safe to retry. ${(err as Error).message}`);
      console.error(`[Checkout] Razorpay shipping-order creation failed for order ${wcOrderId}:`, err);
      await attachCustomerPromise;
      return NextResponse.json({ error: 'Could not initialize the shipping payment. Please try again.' }, { status: 500 });
    }

    await Promise.all([
      postNote(wcOrderId, `Cash on Delivery selected. Shipping charge of ₹${(shippingPaise / 100).toFixed(2)} to be paid online now (Razorpay order ${rzpOrder.id}). Remaining ₹${(cashDuePaise / 100).toFixed(2)} to be collected as cash on delivery.`),
      wcClient.fetch(`/orders/${wcOrderId}`, {
        method: 'PUT',
        body: JSON.stringify({ meta_data: [{ key: RAZORPAY_ORDER_ID_META, value: rzpOrder.id }] })
      }).catch(e => console.warn(`[Checkout] Failed to record razorpay order id for order ${wcOrderId} (non-fatal — resume will recover):`, e)),
      attachCustomerPromise,
    ]);

    return NextResponse.json({
      success: true,
      wc_order_id: wcOrderId,
      razorpay_order_id: rzpOrder.id,
      amount: shippingPaise,
      currency: 'INR',
      key_id
    });

  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: `Failed to initialize payment: ${error.message || JSON.stringify(error)}` }, { status: 500 });
  }
}
