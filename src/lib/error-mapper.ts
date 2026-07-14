export function mapWooCommerceError(code: string, rawMessage: string): string {
  // Coupon errors
  if (code === 'woocommerce_rest_invalid_coupon') return "The coupon code you entered is invalid or expired.";
  if (code === 'woocommerce_rest_coupon_already_applied') return "This coupon is already applied to your cart.";
  if (code === 'woocommerce_rest_coupon_error') {
    // Some coupon errors use this generic code but have specific messages
    if (rawMessage.toLowerCase().includes('minimum spend')) return rawMessage; // Keep the original if it specifies minimum spend
    return "This coupon cannot be applied to your cart.";
  }

  // Cart / Checkout errors
  if (code === 'woocommerce_rest_cart_invalid_payment_method') return "The selected payment method is unavailable.";
  if (code === 'woocommerce_rest_checkout_missing_billing_address') return "Please fill in all required billing address fields.";
  if (code === 'woocommerce_rest_checkout_missing_shipping_address') return "Please fill in all required shipping address fields.";
  if (code === 'woocommerce_rest_missing_nonce') return "Your session has expired. Please refresh the page and try again.";
  
  // Stock errors
  if (code === 'woocommerce_rest_product_out_of_stock') return "One or more items in your cart are currently out of stock.";
  if (code.includes('stock')) return rawMessage; // Usually WC provides a good stock error like "You cannot add that amount..."

  // Fallback
  return rawMessage || "An unexpected error occurred. Please try again.";
}
