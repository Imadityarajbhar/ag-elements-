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
    description: "Shipping charges are paid online now via Razorpay; the remaining amount is collected as cash when your order is delivered.",
    enabled: true,
  },
  {
    id: "wctr-sandboxpayment",
    title: "SandBox Payment (Test Only)",
    description: "",
    enabled: false,
  }
];
