export interface PaymentMethodConfig {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "razorpay",
    title: "UPI / Credit Card / Debit Card / Net Banking",
    description: "Secure payment via Razorpay",
    enabled: true,
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay with cash upon delivery.",
    enabled: false,
  }
];
