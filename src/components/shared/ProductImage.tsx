"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

// Local, always-available placeholder — deliberately not an external host (the
// previous fallback was an lh3.googleusercontent.com URL, which just traded one
// network dependency for another; SearchOverlay.tsx separately pointed at
// "/placeholder.png", a file that was never committed to public/).
const FALLBACK_SRC = "/brand/image-unavailable.svg";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
};

/**
 * Drop-in replacement for next/image wherever the src comes from WooCommerce
 * (product photos, cart/wishlist thumbnails, variation images). Falls back to
 * a local placeholder — instead of a native broken-image glyph — when src is
 * missing, or when the browser fails to load it (404/403/timeout/etc).
 */
export function ProductImage({ src, alt, ...rest }: ProductImageProps) {
  // Scoped to the src it was recorded against — not a bare boolean — so that
  // swapping to a *different* src (e.g. clicking a gallery thumbnail) always
  // gets a fresh attempt instead of permanently inheriting an earlier src's
  // failure on this same mounted instance.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const usingFallback = !src || failedSrc === src;

  return (
    <Image
      {...rest}
      src={usingFallback ? FALLBACK_SRC : src}
      alt={alt}
      unoptimized={usingFallback}
      onError={() => setFailedSrc(src ?? null)}
    />
  );
}
