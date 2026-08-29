import { NextResponse } from 'next/server';
import { wcClient } from '@/services/woocommerce/client';
import { WooCommerceOrder } from '@/types/woocommerce';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const orderData = await wcClient.fetch<WooCommerceOrder>(`/orders/${orderId}`);
    if (!orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const metaData = orderData.meta_data || [];
    const findMeta = (key: string) => metaData.find((m) => m.key === key)?.value;

    const isCodShippingPrepay = findMeta('_cod_shipping_prepay') === 'yes' || findMeta('_cod_shipping_prepay') === 'not_required';
    const codDetails = isCodShippingPrepay ? {
      shippingRequired: findMeta('_cod_shipping_prepay') === 'yes',
      shippingDuePaise: findMeta('_cod_shipping_due_paise') ? parseInt(findMeta('_cod_shipping_due_paise'), 10) : 0,
      shippingPaid: findMeta('_cod_shipping_paid') === 'yes',
      cashDuePaise: findMeta('_cod_cash_due_paise') ? parseInt(findMeta('_cod_cash_due_paise'), 10) : 0,
    } : null;

    return NextResponse.json({
      status: orderData.status,
      payment_method: orderData.payment_method,
      paymentMethodTitle: orderData.payment_method_title || '',
      total: orderData.total,
      codDetails
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json({ error: 'Failed to check order status' }, { status: 500 });
  }
}
