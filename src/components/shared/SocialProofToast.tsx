"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

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
  timeAgo: string;
}

export function SocialProofToast() {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let active = true;

    const startToasts = async () => {
      try {
        const res = await fetch('/api/products?per_page=15');
        const products = await res.json();
        const productNames = products.items?.map((p: any) => p.name) || [
          "925 Silver Minimal Ring", "Classic Silver Chain", "Silver Stud Earrings"
        ];

        if (!active) return;

        const scheduleNextToast = () => {
          const delay = Math.floor(Math.random() * 15000) + 30000; // 30s to 45s
          
          setTimeout(() => {
            if (!active) return;
            const newToast = {
              name: NAMES[Math.floor(Math.random() * NAMES.length)],
              city: CITIES[Math.floor(Math.random() * CITIES.length)],
              product: productNames[Math.floor(Math.random() * productNames.length)],
              timeAgo: `${Math.floor(Math.random() * 59) + 1} mins ago`
            };
            
            setToast(newToast);
            setIsVisible(true);

            setTimeout(() => {
              if (!active) return;
              setIsVisible(false);
              scheduleNextToast();
            }, 6000);
          }, delay);
        };

        const initialTimer = setTimeout(() => {
          if (!active) return;
          scheduleNextToast();
        }, 15000); // 15 seconds after initial load
      } catch (err) {
        console.error("Failed to load products for social proof");
      }
    };

    startToasts();

    return () => { active = false; };
  }, []);

  if (!toast) return null;

  return (
    <div 
      className={`fixed bottom-24 left-6 z-50 bg-pearl-white border border-outline-variant/30 shadow-[0px_4px_20px_rgba(35,33,58,0.1)] rounded-lg p-4 flex gap-4 max-w-sm transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-12 h-12 bg-surface-lavender rounded-md flex items-center justify-center flex-shrink-0 text-ag-purple">
        <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
      </div>
      <div className="flex flex-col pr-6">
        <p className="font-body-sm text-[13px] text-on-surface-variant leading-tight mb-1">
          <span className="font-semibold text-charcoal-navy">{toast.name}</span> from {toast.city} just purchased
        </p>
        <p className="font-body-sm font-bold text-ag-purple leading-tight line-clamp-1">{toast.product}</p>
        <p className="font-label-sm text-[10px] text-outline uppercase tracking-widest mt-1">{toast.timeAgo}</p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-outline hover:text-charcoal-navy transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
