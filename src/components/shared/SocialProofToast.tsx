"use client";
import { ShoppingBag } from 'lucide-react';

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from 'next/link';

const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Surat", "Jaipur"];
const NAMES = ["Priya", "Rahul", "Anjali", "Vikram", "Sneha", "Rohan", "Neha", "Amit", "Kavita", "Suresh"];
const PRODUCTS = [
  "Minimal Silver Box Chain Necklace",
  "Luxury Gold Cuban Link Chain Necklace",
  "Classic Silver Cable Chain Necklace",
  "Classic Silver Ball Chain Necklace",
  "Modern Silver Link Chain Necklace",
  "Elegant Textured Silver Chain Necklace",
  "Classic Silver Figaro Chain Necklace",
  "Minimal Silver Oval Link Chain Necklace",
  "Bold Silver Double Link Chain Necklace",
  "Classic Gold Rope Chain Necklace"
];

interface ToastData {
  name: string;
  city: string;
  product: string;
  slug: string;
  timeAgo: string;
}

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SocialProofToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let active = true;

    const startToasts = async () => {
      try {
        const res = await fetch('/api/products?per_page=100');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const products = await res.json();
        const validProducts = Array.isArray(products) && products.length > 0
          ? products.map((p: any) => ({ name: p.name, slug: p.slug }))
          : [];

        if (validProducts.length === 0) {
          // If no products were returned from the API, silently fail
          // Do not show fake toasts.
          return;
        }

        const shuffledProducts = shuffleArray(validProducts);
        let currentIndex = 0;

        if (!active) return;

        const scheduleNextToast = () => {
          const delay = Math.floor(Math.random() * 4000) + 2000; // 2s to 6s delay between toasts
          
          setTimeout(() => {
            if (!active) return;
            const currentProduct = shuffledProducts[currentIndex];
            currentIndex = (currentIndex + 1) % shuffledProducts.length;

            const newToast = {
              name: NAMES[Math.floor(Math.random() * NAMES.length)],
              city: CITIES[Math.floor(Math.random() * CITIES.length)],
              product: currentProduct.name,
              slug: currentProduct.slug,
              timeAgo: `${Math.floor(Math.random() * 59) + 1} mins ago`
            };
            
            setToast(newToast);
            setIsVisible(true);

            setTimeout(() => {
              if (!active) return;
              setIsVisible(false);
              scheduleNextToast();
            }, 5000); // Visible for 5 seconds
          }, delay);
        };

        const initialTimer = setTimeout(() => {
          if (!active) return;
          scheduleNextToast();
        }, 3000); // 3 seconds after initial load
      } catch (err) {
        console.error("Failed to load products for social proof:", err);
      }
    };

    startToasts();

    return () => { active = false; };
  }, []);

  return (
    <div 
      className={`fixed bottom-24 left-6 z-50 bg-pearl-white border border-outline-variant/30 shadow-[0px_4px_20px_rgba(35,33,58,0.1)] rounded-lg p-4 max-w-sm transition-all duration-500 ease-in-out hover:shadow-[0px_8px_30px_rgba(35,33,58,0.15)] group ${
        isVisible && toast ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      {toast && (
        <>
          <Link href={`/product/${toast.slug}`} className="flex gap-4 cursor-pointer" onClick={() => setIsVisible(false)}>
            <div className="w-12 h-12 bg-surface-lavender rounded-md flex items-center justify-center flex-shrink-0 text-ag-purple group-hover:scale-105 transition-transform">
              <ShoppingBag className="text-[24px]" />
            </div>
            <div className="flex flex-col pr-6">
              <p className="font-body-sm text-[13px] text-on-surface-variant leading-tight mb-1">
                <span className="font-semibold text-charcoal-navy">{toast.name}</span> from {toast.city} just purchased
              </p>
              <p className="font-body-sm font-bold text-ag-purple leading-tight line-clamp-1 group-hover:underline">{toast.product}</p>
              <p className="font-label-sm text-[10px] text-outline uppercase tracking-widest mt-1">{toast.timeAgo}</p>
            </div>
          </Link>
          <button 
            onClick={(e) => { e.preventDefault(); setIsVisible(false); }}
            className="absolute top-2 right-2 text-outline hover:text-charcoal-navy transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
