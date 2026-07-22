"use client";
import { CheckCircle2, ArrowRight } from 'lucide-react';

import { useState } from "react";

export function NewsletterForm({ variant = "desktop" }: { variant?: "mobile" | "desktop" }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    
    // Mock API call
    setTimeout(() => {
      setStatus("success");
    }, 1000);
  };

  if (status === "success") {
    return (
      <div className={`flex flex-col items-center justify-center p-4 rounded bg-surface-lavender border border-primary/20 ${variant === "desktop" ? "mt-2" : ""}`}>
        <CheckCircle2 className="text-primary mb-2" />
        <p className="font-label-md text-charcoal-navy uppercase tracking-widest text-[12px] text-center">
          Thank you for subscribing!
        </p>
      </div>
    );
  }

  if (variant === "mobile") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <input 
          required
          type="email" 
          disabled={status === "loading"}
          className="bg-pearl-white/5 border-pearl-white/20 text-pearl-white placeholder:text-pearl-white/40 rounded py-4 px-6 focus:ring-1 focus:ring-primary focus:border-primary border-0 transition-all outline-none" 
          placeholder="Your Email Address" 
        />
        <button 
          type="submit"
          disabled={status === "loading"}
          className="bg-primary text-on-primary py-4 px-8 rounded font-label-md uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {status === "loading" ? (
            <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>
    );
  }

  // Desktop variant
  return (
    <form onSubmit={handleSubmit} className="relative mt-2 flex items-center">
      <input 
        required
        type="email" 
        disabled={status === "loading"}
        className="w-full bg-transparent border-b border-charcoal-navy/20 focus:border-primary py-2 px-0 text-body-md font-body-md outline-none transition-colors placeholder:text-outline-variant pr-10" 
        placeholder="Enter your email address" 
      />
      <button
        type="submit"
        aria-label="Subscribe"
        disabled={status === "loading"}
        className="absolute right-0 text-primary hover:text-charcoal-navy transition-colors disabled:opacity-50"
      >
        {status === "loading" ? (
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block"></span>
        ) : (
          <ArrowRight  />
        )}
      </button>
    </form>
  );
}
