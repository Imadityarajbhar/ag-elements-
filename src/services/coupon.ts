import { WooCommerceCoupon } from "@/types/coupon";
import { CartItem } from "@/types/cart";

export interface CouponValidationResult {
  isValid: boolean;
  coupon?: WooCommerceCoupon;
  error?: string;
}

export async function validateCoupon(code: string, cartSubtotal: number, cartItems: CartItem[]): Promise<CouponValidationResult> {
  try {
    if (!code || code.trim() === '') {
      return { isValid: false, error: "Please enter a coupon code." };
    }

    const response = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`);
    const data = await response.json();

    if (!response.ok) {
      return { isValid: false, error: data.error || "Invalid coupon code." };
    }

    const coupon: WooCommerceCoupon = data;

    // Validate Expiry
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      return { isValid: false, error: "This coupon has expired." };
    }

    // Validate Minimum Amount
    if (coupon.minimum_amount && parseFloat(coupon.minimum_amount) > 0) {
      const minAmount = parseFloat(coupon.minimum_amount);
      if (cartSubtotal < minAmount) {
        return { isValid: false, error: `Minimum spend of ₹${minAmount.toLocaleString('en-IN')} is required for this coupon.` };
      }
    }

    // Validate Maximum Amount
    if (coupon.maximum_amount && parseFloat(coupon.maximum_amount) > 0) {
      const maxAmount = parseFloat(coupon.maximum_amount);
      if (cartSubtotal > maxAmount) {
        return { isValid: false, error: `This coupon is only valid for orders up to ₹${maxAmount.toLocaleString('en-IN')}.` };
      }
    }

    // Product Exclusions / Inclusions logic could go here
    // e.g. checking if cartItems.some(item => coupon.excluded_product_ids.includes(item.productId))

    return { isValid: true, coupon };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return { isValid: false, error: "An error occurred while validating the coupon. Please try again." };
  }
}
