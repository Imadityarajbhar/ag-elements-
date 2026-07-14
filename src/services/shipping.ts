import { ShippingMethod, DeliveryEstimate } from '@/types/shipping';

export const FREE_SHIPPING_THRESHOLD = 2999; // Configurable threshold

export async function getAvailableShippingMethods(pincode: string): Promise<ShippingMethod[]> {
  try {
    const res = await fetch(`/api/shipping?pincode=${encodeURIComponent(pincode)}`);
    if (!res.ok) throw new Error("Failed to fetch shipping methods");
    
    const methods: ShippingMethod[] = await res.json();
    return methods;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function calculateDeliveryEstimate(method: ShippingMethod): DeliveryEstimate {
  const today = new Date();
  
  const minDays = method.estimatedDaysMin || 3;
  const maxDays = method.estimatedDaysMax || 5;

  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minDays);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDays);

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  
  let dateRange = '';
  
  if (minDate.getMonth() === maxDate.getMonth()) {
    dateRange = `${minDate.getDate()}–${maxDate.getDate()} ${minDate.toLocaleDateString('en-IN', { month: 'long' })}`;
  } else {
    dateRange = `${minDate.toLocaleDateString('en-IN', options)} – ${maxDate.toLocaleDateString('en-IN', options)}`;
  }

  return {
    methodId: method.methodId,
    estimatedDateRange: dateRange,
  };
}
