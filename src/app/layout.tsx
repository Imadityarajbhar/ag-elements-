import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('@/components/shared/CartDrawer').then(m => m.CartDrawer));
const MobileMenu = dynamic(() => import('@/components/layout/MobileMenu').then(m => m.MobileMenu));
const SearchOverlay = dynamic(() => import('@/components/shared/SearchOverlay').then(m => m.SearchOverlay));
const WhatsAppButton = dynamic(() => import('@/components/shared/WhatsAppButton').then(m => m.WhatsAppButton));
const SocialProofToast = dynamic(() => import('@/components/shared/SocialProofToast').then(m => m.SocialProofToast));

import { AnalyticsProvider } from "@/components/shared/AnalyticsProvider";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

import { generateMetadata as getSeoMetadata } from "@/lib/seo/generateMetadata";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/seo/schema";

export const metadata: Metadata = getSeoMetadata({
  title: "AG Elements | Luxury Jewelry",
  description: "A premium headless storefront for handcrafted 925 sterling silver jewelry, bridging the heritage of Wardha and modern elegance.",
  path: "/",
});

// Add Google Site Verification dynamically or override other settings
metadata.verification = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-id",
};

import { AuthProvider } from "@/components/shared/AuthProvider";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = buildOrganizationSchema();
  const websiteSchema = buildWebsiteSchema();

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${hanken.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans text-foreground bg-background selection:bg-primary-fixed selection:text-on-primary-fixed">
        <AuthProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <MobileMenu />
        <CartDrawer />
        <SearchOverlay />
        <WhatsAppButton />
        <SocialProofToast />
        <AnalyticsProvider />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
