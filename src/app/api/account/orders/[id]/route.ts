import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { wcClient } from '@/services/woocommerce/client';
import { getWpUserIdFromToken } from '@/lib/auth-helpers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ag_auth_token')?.value;

    if (!token) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }

    const { id: orderId } = await params;

    const baseUrl = (process.env.NEXT_PUBLIC_WP_URL || '').replace(/\/$/, '');

    // 1. Get WP User ID
    const userId = await getWpUserIdFromToken(token, baseUrl);

    // 2. Fetch the order
    const order = await wcClient.fetch(`/orders/${orderId}`) as any;

    // 3. Verify this order belongs to the authenticated user
    if (order.customer_id !== userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 4. Return formatted order
    return NextResponse.json({
      id: order.id,
      number: order.number || order.id,
      status: order.status,
      dateCreated: order.date_created,
      datePaid: order.date_paid,
      total: order.total,
      subtotal: order.line_items.reduce((acc: number, item: any) => acc + parseFloat(item.subtotal), 0).toFixed(2),
      totalTax: order.total_tax,
      shippingTotal: order.shipping_total,
      discountTotal: order.discount_total,
      paymentMethodTitle: order.payment_method_title || '',
      transactionId: order.transaction_id || '',
      currency: order.currency,
      lineItems: order.line_items.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
        total: item.total,
        sku: item.sku || '',
        image: item.image?.src || '',
        variationId: item.variation_id,
        metaData: item.meta_data?.filter((m: any) => !m.key.startsWith('_')).map((m: any) => ({
          key: m.display_key || m.key,
          value: m.display_value || m.value,
        })) || [],
      })),
      shippingLines: order.shipping_lines.map((s: any) => ({
        methodTitle: s.method_title,
        total: s.total,
      })),
      couponLines: order.coupon_lines.map((c: any) => ({
        code: c.code,
        discount: c.discount,
      })),
      billing: {
        firstName: order.billing.first_name,
        lastName: order.billing.last_name,
        address1: order.billing.address_1,
        city: order.billing.city,
        state: order.billing.state,
        postcode: order.billing.postcode,
        country: order.billing.country,
        email: order.billing.email,
        phone: order.billing.phone,
      },
      shipping: {
        firstName: order.shipping.first_name,
        lastName: order.shipping.last_name,
        address1: order.shipping.address_1,
        city: order.shipping.city,
        state: order.shipping.state,
        postcode: order.shipping.postcode,
        country: order.shipping.country,
      },
      customerNote: order.customer_note || '',
    });
  } catch (error: any) {
    if (error.message === 'Session expired') {
      const response = NextResponse.json({ error: 'Session expired' }, { status: 401 });
      response.cookies.delete('ag_auth_token');
      return response;
    }
    console.error('Order detail error:', error);
    return NextResponse.json({ error: 'Failed to load order details' }, { status: 500 });
  }
}
