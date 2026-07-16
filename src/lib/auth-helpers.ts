// src/lib/auth-helpers.ts

/**
 * Validates the JWT token against the WordPress API and returns the WP User ID.
 * Throws an error if the token is invalid or expired.
 */
export async function getWpUserIdFromToken(token: string, baseUrl: string): Promise<number> {
  const wpRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
    cache: 'no-store'
  });

  if (!wpRes.ok) {
    throw new Error('Session expired');
  }

  const wpUser = await wpRes.json();
  return wpUser.id;
}

/**
 * Maps a WooCommerce raw address object (snake_case) to our application's camelCase AddressData format.
 */
export function mapWooCommerceAddress(address: any) {
  if (!address) return null;
  return {
    firstName: address.first_name || '',
    lastName: address.last_name || '',
    company: address.company || '',
    address1: address.address_1 || '',
    address2: address.address_2 || '',
    city: address.city || '',
    state: address.state || '',
    postcode: address.postcode || '',
    country: address.country || '',
    email: address.email || '',
    phone: address.phone || '',
  };
}

/**
 * Maps a WooCommerce raw customer object to our application's User format.
 */
export function mapWooCommerceCustomer(customer: any) {
  if (!customer) return null;
  return {
    id: customer.id.toString(),
    email: customer.email,
    firstName: customer.first_name,
    lastName: customer.last_name,
    phone: customer.billing?.phone || '',
  };
}
