import { wcClient } from '@/services/woocommerce/client';
import { mapWooCommerceCustomer, mapWooCommerceAddress } from '@/lib/auth-helpers';

export async function getDashboardData(userId: number) {
  try {
    const customer = await wcClient.fetch(`/customers/${userId}`) as any;
    
    // Fetch recent orders (max 5)
    const orders = await wcClient.fetch(`/orders?customer=${userId}&per_page=5`) as any[];

    // Recommended products - WooCommerce related products logic
    // We can fetch featured or best sellers here, but for dashboard we can fetch featured products.
    // ?featured=true
    const recommended = await wcClient.fetch(`/products?featured=true&per_page=4`) as any[];

    return {
      user: mapWooCommerceCustomer(customer),
      billingAddress: mapWooCommerceAddress(customer.billing),
      shippingAddress: mapWooCommerceAddress(customer.shipping),
      orders: orders.map(order => ({
        id: order.id,
        number: order.number,
        status: order.status,
        date: order.date_created,
        total: order.total,
        itemCount: order.line_items.reduce((acc: number, item: any) => acc + item.quantity, 0),
        paymentMethod: order.payment_method_title || '',
      })),
      recommended: recommended.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        regularPrice: p.regular_price,
        salePrice: p.sale_price,
        images: p.images || [],
      })),
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
}
