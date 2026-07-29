"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Product } from "@/types/product";
import { Share2, Copy, Check, X, MessageCircle, Send, Mail, Image as ImageIcon, Globe } from "lucide-react";
import { trackShareItem } from "@/lib/analytics";
import Image from "next/image";

interface ProductShareButtonProps {
  product: Product;
  className?: string;
}

export function ProductShareButton({ product, className = "" }: ProductShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const getShareUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/product/${product.slug}`;
    }
    return `https://agelements.in/product/${product.slug}`;
  }, [product.slug]);

  const handleShareClick = async () => {
    const shareUrl = getShareUrl();
    const shareData = {
      title: `${product.name} | AG Elements`,
      text: `Discover ${product.name} — Authentic 925 Sterling Silver Jewellery at AG Elements`,
      url: shareUrl,
    };

    // Use Web Share API if available (typically mobile devices / Safari)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        trackShareItem(product, "native_api");
        return;
      } catch (err: any) {
        // If user cancelled, don't open fallback modal
        if (err?.name === "AbortError") return;
        // Fallback to custom share modal on error
      }
    }

    setIsOpen(true);
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setToastMessage("Link copied to clipboard!");
      trackShareItem(product, "copy_link");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      // Hide toast notification after 3 seconds
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    } catch {
      setToastMessage("Failed to copy link.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleSocialClick = (method: string, shareLink: string) => {
    trackShareItem(product, method);
    window.open(shareLink, "_blank", "noopener,noreferrer");
  };

  // Close modal on Escape key press or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const shareUrl = getShareUrl();
  const shareText = `Discover ${product.name} at AG Elements`;

  const socialLinks = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      Icon: MessageCircle,
      color: "hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/40",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${product.name} - ${shareUrl}`)}`,
    },
    {
      id: "telegram",
      name: "Telegram",
      Icon: Send,
      color: "hover:bg-[#0088cc]/10 hover:text-[#0088cc] hover:border-[#0088cc]/40",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product.name)}`,
    },
    {
      id: "facebook",
      name: "Facebook",
      Icon: Globe,
      color: "hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/40",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      Icon: Globe,
      color: "hover:bg-charcoal-navy/10 hover:text-charcoal-navy hover:border-charcoal-navy/40",
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      id: "pinterest",
      name: "Pinterest",
      Icon: ImageIcon,
      color: "hover:bg-[#E60023]/10 hover:text-[#E60023] hover:border-[#E60023]/40",
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(product.name)}&media=${encodeURIComponent(product.images[0]?.src || "")}`,
    },
    {
      id: "email",
      name: "Email",
      Icon: Mail,
      color: "hover:bg-ag-purple/10 hover:text-ag-purple hover:border-ag-purple/40",
      url: `mailto:?subject=${encodeURIComponent(`${product.name} | AG Elements`)}&body=${encodeURIComponent(`Check out ${product.name} at AG Elements: ${shareUrl}`)}`,
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={handleShareClick}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant/40 bg-pearl-white text-charcoal-navy font-label-md text-[13px] uppercase tracking-widest hover:border-ag-purple hover:text-ag-purple transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
        aria-label={`Share ${product.name}`}
      >
        <Share2 className="w-4 h-4 text-ag-purple" />
        <span>Share</span>
      </button>

      {/* Luxury Share Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-navy/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            className="relative w-full max-w-md bg-pearl-white rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-in zoom-in-95 duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/30 bg-surface-container-lowest">
              <h3 id="share-dialog-title" className="font-headline-sm text-[20px] font-medium text-charcoal-navy">
                Share This Piece
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-on-surface-variant hover:text-charcoal-navy rounded-full hover:bg-surface-variant/50 transition-colors"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Preview Card */}
            <div className="p-6 flex items-center gap-4 bg-surface-lavender/30 border-b border-outline-variant/20">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-outline-variant/30">
                {product.images[0]?.src ? (
                  <Image
                    src={product.images[0].src}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-variant" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="font-headline-sm text-[16px] text-charcoal-navy font-medium truncate">
                  {product.name}
                </h4>
                <p className="font-label-md text-[14px] text-ag-purple font-semibold mt-0.5">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Copy Link Section with Micro-interaction */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="font-label-sm uppercase tracking-widest text-[11px] text-on-surface-variant font-semibold">
                  Product Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-3.5 py-2.5 font-body-sm text-[13px] text-charcoal-navy focus:outline-none select-all"
                  />
                  <button
                    ref={copyButtonRef}
                    type="button"
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-label-md text-[12px] uppercase tracking-wider font-bold transition-all duration-300 shrink-0 ${
                      isCopied
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : "bg-ag-purple text-pearl-white hover:bg-ag-purple/90 shadow-sm"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 animate-in zoom-in duration-200" />
                        <span>Copied ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Channels Grid */}
              <div className="space-y-3">
                <span className="font-label-sm uppercase tracking-widest text-[11px] text-on-surface-variant font-semibold block">
                  Share Via
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {socialLinks.map((social) => {
                    const IconComp = social.Icon;
                    return (
                      <button
                        key={social.id}
                        type="button"
                        onClick={() => handleSocialClick(social.id, social.url)}
                        className={`flex flex-col items-center justify-center p-3.5 rounded-xl border border-outline-variant/30 bg-pearl-white text-charcoal-navy transition-all duration-200 group ${social.color}`}
                      >
                        <IconComp className="w-5 h-5 mb-1.5 transition-transform duration-200 group-hover:scale-110" />
                        <span className="font-label-sm text-[11px] font-medium tracking-wide">
                          {social.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Toast Notification Alert */}
            {toastMessage && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-charcoal-navy text-pearl-white px-5 py-2.5 rounded-full text-xs font-label-md shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
