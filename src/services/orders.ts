import { wcClient } from './woocommerce/client';
import { WooCommerceOrderPayload } from '@/types/woocommerce';

export async function createOrder(payload: WooCommerceOrderPayload) {
  try {
    const data = await wcClient.fetch<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data;
  } catch (error) {
    console.error("Failed to create order in WooCommerce", error);
    throw error;
  }
}
