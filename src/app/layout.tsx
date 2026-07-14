import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('@/components/shared/CartDrawer').then(m => m.CartDrawer));
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans text-foreground bg-background selection:bg-primary-fixed selection:text-on-primary-fixed">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <SearchOverlay />
        <WhatsAppButton />
        <SocialProofToast />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
