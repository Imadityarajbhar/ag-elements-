
# AG Elements - Headless E-commerce Storefront

A premium, headless WooCommerce storefront built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion. The design is strictly aligned with the Stitch design system.

## Architecture

This project uses a layered headless architecture:
- **UI Components**: Built with React, Tailwind CSS, and headless Radix/Base UI components for accessibility.
- **State Management**: Zustand handles global client state (e.g., Shopping Cart, UI toggles).
- **Service Layer**: An abstraction over data fetching (`src/services`). The UI components consume the service layer directly, without needing to know if the data is coming from a mock source or a live WooCommerce backend.

## Getting Started

1. Install dependencies using **pnpm**:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Connecting to WooCommerce (Phase 3)

By default, the application runs using rich mock data located in `src/services/mock`. To connect the application to your live or staging WooCommerce WordPress backend, follow these steps:

1. Create a `.env.local` file in the root of the `frontend-v2` directory.
2. Add the following environment variables:

```env
# Disable mock data to trigger real API calls
NEXT_PUBLIC_USE_MOCK_DATA=false

# Your WooCommerce / WordPress site URL
WOOCOMMERCE_URL=https://your-wordpress-site.com

# REST API credentials (generated in WooCommerce > Settings > Advanced > REST API)
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here
```

3. Restart the development server. The `ProductService` will automatically switch from serving mock data to fetching real products from your WooCommerce REST API.

## Project Structure

- `src/app`: Next.js App Router pages (Homepage, Shop, PDP, Cart).
- `src/components`: UI components organized by `layout`, `shared`, and `ui` (base primitives).
- `src/services`: Data fetching methods (`products.ts`) and WooCommerce API client (`woocommerce/client.ts`).
- `src/store`: Zustand stores (`cart.ts`).
- `src/config`: Design system configuration (`design-system.ts`) mirrored from Stitch.

## Commands

- `pnpm run dev`: Starts the development server.
- `pnpm run build`: Creates an optimized production build.
- `pnpm run start`: Starts a production server from the built files.
- `pnpm run lint`: Runs ESLint for code quality checks.
- `pnpm run lint`: Runs ESLint for code quality checks.
