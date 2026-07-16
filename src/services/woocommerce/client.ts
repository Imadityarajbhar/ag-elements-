export class WooCommerceClient {
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_WC_API_URL || '';
    this.consumerKey = process.env.WC_CONSUMER_KEY || '';
    this.consumerSecret = process.env.WC_CONSUMER_SECRET || '';
  }

  async fetchWithHeaders<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; headers: Headers }> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Auth for server-side fetches. Do not expose secret on client.
    const headers = new Headers(options.headers);
    if (typeof window === 'undefined') {
      const auth = btoa(`${this.consumerKey}:${this.consumerSecret}`);
      headers.set('Authorization', `Basic ${auth}`);
    }
    headers.set('Content-Type', 'application/json');

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    if (!fetchOptions.cache && !fetchOptions.next && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      fetchOptions.next = { revalidate: 60, tags: ['woocommerce'] };
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errData = await response.json();
        if (errData.message) {
          errorMessage = errData.message;
        }
      } catch (e) {
        // Fallback to status text
      }
      throw new Error(`WooCommerce API Error: ${errorMessage}`);
    }

    const data = await response.json();
    return { data, headers: response.headers };
  }

  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { data } = await this.fetchWithHeaders<T>(endpoint, options);
    return data;
  }
}

export const wcClient = new WooCommerceClient();
