"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";

type QuizState = {
  step: number;
  gender?: string;     // mapped to gender term id (e.g. 571 for Women, 557 for Men)
  occasion?: string;   // mapped to occasion term id (e.g. 574 for Wedding, 564 for Everyday)
  budget?: string;     // mapped to min_price/max_price (e.g. "0-2000", "2000-5000", "5000-99999")
};

export default function GiftFinderPage() {
  const router = useRouter();
  const [state, setState] = useState<QuizState>({ step: 1 });

  const handleNext = (updates: Partial<QuizState>) => {
    const newState = { ...state, ...updates };
    
    if (newState.step > 3) {
      // Submit the quiz
      const params = new URLSearchParams();

      // Map selections to their own WooCommerce attribute taxonomy params —
      // /shop reads pa_gender/pa_occasion individually and AND-combines them
      // (a single generic attribute_term can't carry two different taxonomies).
      if (newState.gender) params.set("pa_gender", newState.gender);
      if (newState.occasion) params.set("pa_occasion", newState.occasion);

      if (newState.budget) {
        const [min, max] = newState.budget.split("-");
        if (min !== "0") params.set("min_price", min);
        if (max !== "99999") params.set("max_price", max);
      }

      router.push(`/shop?${params.toString()}`);
    } else {
      setState(newState);
    }
  };

  const handleBack = () => {
    setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  return (
    <div className="flex flex-col w-full bg-surface-container-lowest min-h-[80vh]">
      <div className="max-w-3xl mx-auto w-full px-margin-mobile tablet:px-margin-desktop py-16 tablet:py-24">
        
        {/* Header & Progress */}
        <div className="mb-12">
          {state.step > 1 && (
            <button onClick={handleBack} className="flex items-center gap-2 text-on-surface-variant hover:text-charcoal-navy transition-colors mb-6 font-label-md text-[13px] uppercase tracking-widest font-bold">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= state.step ? 'bg-charcoal-navy' : 'bg-outline-variant/30'}`} />
            ))}
          </div>
          <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-2 block">Gift Finder</span>
        </div>

        {/* Step 1: Who */}
        {state.step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="font-headline-lg text-[40px] leading-tight font-medium text-charcoal-navy mb-10">Who are you shopping for?</h1>
            <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6">
              {[
                { label: "For Her", value: "571", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgYShAiK_WIPmW8XzCj504v1jLWuG1cfWTnZsg933i2ucADqVunBR1qG5SLt6vnry3FMYd5IjpuhbkkvpxbiBxVKdw1xPl-_cypjd1BUkgfnLWl5Z2bOp_Ch46lWO9hlVuedtU4st5dLRYuHi67StD9Fie2aQXNqIQLW4Bo1gwfo8_dl16zt-SlIi0eD1QdfaWRkmCg9NsIJWLg6avXY2r9HuoLEivcUOSNR8r0dkjK-reWSX-Jr0odA" },
                { label: "For Him", value: "557", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVPG_NxUQQz2Jcu8HJfHRV12nWworIMPWOwMwvagcRprZYeT3xBcfW_m56h-jz47MSacfFos8eF5cUqojKD_4Ui0IXROEqeX_jdhGR2gWp899esWEZFiQiiHoYxF8Pxxfl5sjr2empr26C_Vav7rZEOb0atBAwUYdbrdxBr-jkdrLpGWtw8OwxHGYAcXHrUnDrOJd0bUINio6hgZvL8Cl5P1RP0njtEvhdkqjpAXHKOnMCoeIrxSGYSQ" },
                { label: "For Anyone", value: "587", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbgh3H-hSJ9jP5dEIraPESMpSZe-khIlIE0aMQergyEF_Vev3TfKeu5thuhX3uwFaN0ziIjCLqKnPBPXPAzgPR-_HNHFvr3_yClZzJo15pFfUi8xGPbGVhaYygARQWZTotpUb9YWtyTYNCvHRjdY1Gq982TfcByBgjXd7y8fRqxBW8-N18l9NuCqJGNvmOWFz8d3LnYJHFKBG3Ft3u0F4V-Iwz-V60HolpHJ35jN5iDeVy7la55ZtugQ" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleNext({ gender: option.value, step: 2 })}
                  className="group relative flex flex-col items-center text-center overflow-hidden rounded-2xl border border-outline-variant/30 hover:border-charcoal-navy transition-all"
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-surface-variant">
                    <Image src={option.img} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" alt={option.label} />
                  </div>
                  <div className="p-6 w-full bg-pearl-white">
                    <span className="font-label-md text-[14px] uppercase tracking-widest font-bold text-charcoal-navy">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Occasion */}
        {state.step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="font-headline-lg text-[40px] leading-tight font-medium text-charcoal-navy mb-10">What's the occasion?</h1>
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
              {[
                { label: "Wedding & Bridal", value: "574", icon: "favorite" },
                { label: "Festive & Party", value: "563", icon: "celebration" },
                { label: "Everyday & Casual", value: "564", icon: "sunny" },
                { label: "Just Because", value: "", icon: "redeem" } // Empty means no filter
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleNext({ occasion: option.value, step: 3 })}
                  className="flex items-center p-6 rounded-2xl border border-outline-variant/30 hover:border-charcoal-navy hover:bg-surface-container-low transition-all bg-pearl-white group text-left"
                >
                  <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-charcoal-navy mr-6 group-hover:bg-charcoal-navy group-hover:text-pearl-white transition-colors">
                    <span className="material-symbols-outlined font-light">{option.icon}</span>
                  </div>
                  <span className="font-headline-sm text-[24px] font-medium text-charcoal-navy">{option.label}</span>
                  <ChevronRight className="w-6 h-6 ml-auto text-outline-variant group-hover:text-charcoal-navy" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Budget */}
        {state.step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="font-headline-lg text-[40px] leading-tight font-medium text-charcoal-navy mb-10">What's your budget?</h1>
            <div className="flex flex-col gap-4">
              {[
                { label: "Under ₹2,000", value: "0-2000" },
                { label: "₹2,000 - ₹5,000", value: "2000-5000" },
                { label: "₹5,000 - ₹10,000", value: "5000-10000" },
                { label: "Over ₹10,000", value: "10000-99999" },
                { label: "Any Budget", value: "" }
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleNext({ budget: option.value, step: 4 })}
                  className="w-full text-left p-6 rounded-2xl border border-outline-variant/30 hover:border-charcoal-navy hover:bg-charcoal-navy hover:text-pearl-white transition-all bg-pearl-white font-headline-sm text-[24px] font-medium text-charcoal-navy flex items-center justify-between group"
                >
                  {option.label}
                  <ChevronRight className="w-6 h-6 text-outline-variant group-hover:text-pearl-white" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
