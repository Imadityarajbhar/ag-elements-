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

export const metadata: Metadata = getSeoMetadata({
  title: "AG Elements | Luxury Jewelry",
  description: "A premium headless WooCommerce storefront bridging the heritage of Wardha and modern elegance.",
});

// Add Google Site Verification dynamically or override other settings
metadata.verification = {
  google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-id",
};

import { AuthProvider } from "@/components/shared/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AG Elements",
    "url": "https://agelements.example.com",
    "logo": "https://agelements.example.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9876543210",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": "English"
    },
    "sameAs": [
      "https://instagram.com/agelements",
      "https://facebook.com/agelements"
    ]
  };

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${hanken.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
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
      </body>
    </html>
  );
}
