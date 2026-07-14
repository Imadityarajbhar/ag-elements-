export interface ShippingAddress {
  country: string;
  state: string;
  city: string;
  pincode: string;
}

export interface ShippingMethod {
  id: string; // e.g. "flat_rate:1"
  title: string; // e.g. "Standard Delivery", "Express Delivery"
  price: number;
  methodId: string; // e.g. "flat_rate", "free_shipping"
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
}

export interface DeliveryEstimate {
  methodId: string;
  estimatedDateRange: string; // e.g. "18-20 July"
}
