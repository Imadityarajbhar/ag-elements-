import { wcClient } from './woocommerce/client';
import { cache } from 'react';

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  method_title: string;
  method_description: string;
}

export const getPaymentGateways = cache(async (): Promise<PaymentGateway[]> => {
  try {
    const data = await wcClient.fetch<PaymentGateway[]>('/payment_gateways');
    // Filter out disabled payment gateways
    return data.filter(gateway => gateway.enabled);
  } catch (error) {
    console.error("Failed to fetch payment gateways from WooCommerce", error);
    return [];
  }
});
