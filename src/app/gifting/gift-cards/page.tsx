"use client";
import { Clock, Infinity } from 'lucide-react';

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { Check } from "lucide-react";

const GIFT_CARD_AMOUNTS = [1000, 2000, 5000, 10000];

export default function GiftCardPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(2000);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  
  const addItem = useCartStore(state => state.addItem);
  const setIsOpen = useCartStore(state => state.setIsOpen);

  const handleAddToCart = async () => {
    // Add mock gift card item to cart
    await addItem(99999, 1);
    
    toast.success("Gift Card added to cart");
  };

  return (
    <div className="flex flex-col w-full bg-pearl-white min-h-screen">
      
      <div className="max-w-[1440px] mx-auto w-full px-margin-mobile tablet:px-margin-desktop py-12 tablet:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 tablet:gap-24 items-start">
          
          {/* Left: Gift Card Visuals */}
          <div className="sticky top-24 space-y-6">
            <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden relative shadow-2xl bg-surface-variant">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPmdoIQY2dETKqp7gluGbmwPtyZS53-eQzFIoxDSeP1q85Dvcad4wjxKdr-gx6ECF2EKloDg3EF5RCnLD_iuqGIZFp6BbCDmKUy8Wh2cqeJ_qpFZGTS6M7uePf76pYT2HzIfM3srVgganSFtYqBn2EI4eafaR2bMfmLWIZlz_QJoK9DNtfgyll3TzG6jztpTXiGbIt92nmH0F4UQHG1L0cs3KRYhMcGWcnX8tGjcjLErESEEWo6qeHQ"
                alt="AG Elements Digital Gift Card"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-charcoal-navy/20"></div>
              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <span className="font-display-md text-[32px] text-pearl-white drop-shadow-md">AG Elements</span>
                <span className="font-headline-md text-[24px] text-pearl-white drop-shadow-md">₹{selectedAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-outline-variant/30">
              <div className="flex flex-col gap-2">
                <Clock className="text-[24px] text-ag-purple" />
                <span className="font-label-md text-[13px] font-bold text-charcoal-navy uppercase tracking-widest">Instant Delivery</span>
                <span className="font-body-sm text-[14px] text-on-surface-variant">Sent straight to their inbox or yours.</span>
              </div>
              <div className="flex flex-col gap-2">
                <Infinity className="text-[24px] text-ag-purple" />
                <span className="font-label-md text-[13px] font-bold text-charcoal-navy uppercase tracking-widest">Never Expires</span>
                <span className="font-body-sm text-[14px] text-on-surface-variant">They can take their time finding the perfect piece.</span>
              </div>
            </div>
          </div>

          {/* Right: Configuration Form */}
          <div className="flex flex-col">
            <span className="text-ag-purple font-label-md text-[13px] font-bold uppercase tracking-[0.2em] mb-4">Gifting</span>
            <h1 className="font-headline-lg text-[40px] tablet:text-[56px] leading-[1.1] font-medium text-charcoal-navy mb-4">Digital E-Gift Card</h1>
            <p className="font-body-lg text-[18px] leading-[1.8] text-on-surface-variant font-light mb-10">
              Give the gift of choice. Our digital gift cards are delivered instantly via email with instructions to redeem them at checkout.
            </p>

            <div className="flex flex-col gap-10">
              
              {/* Select Amount */}
              <div className="flex flex-col gap-4">
                <label className="font-label-md text-[14px] font-bold text-charcoal-navy uppercase tracking-widest">1. Select Amount</label>
                <div className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
                  {GIFT_CARD_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`py-4 rounded-xl border ${selectedAmount === amount ? 'border-charcoal-navy bg-charcoal-navy text-pearl-white' : 'border-outline-variant/50 hover:border-charcoal-navy text-charcoal-navy'} transition-colors font-headline-sm text-[18px]`}
                    >
                      ₹{amount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personalization */}
              <div className="flex flex-col gap-4">
                <label className="font-label-md text-[14px] font-bold text-charcoal-navy uppercase tracking-widest">2. Personalize (Optional)</label>
                
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Recipient's Name" 
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-[16px] focus:outline-none focus:border-charcoal-navy transition-colors placeholder:text-on-surface-variant/50"
                    />
                    <input 
                      type="email" 
                      placeholder="Recipient's Email" 
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-[16px] focus:outline-none focus:border-charcoal-navy transition-colors placeholder:text-on-surface-variant/50"
                    />
                  </div>
                  <textarea 
                    placeholder="Add a personalized message..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-[16px] focus:outline-none focus:border-charcoal-navy transition-colors placeholder:text-on-surface-variant/50 resize-none"
                  />
                  <p className="font-body-sm text-[13px] text-on-surface-variant">
                    If you leave the email blank, the gift card will be sent to your email address so you can print it or forward it later.
                  </p>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="pt-6 border-t border-outline-variant/30">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-charcoal-navy text-pearl-white py-6 rounded-full font-label-md text-[14px] uppercase tracking-[0.15em] hover:bg-charcoal-navy/90"
                >
                  Add to Cart — ₹{selectedAmount.toLocaleString()}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
