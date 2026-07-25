"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { fadeUp } from "@/lib/motion/variants";
import type { InstagramReel } from "@/services/instagram";

export function ReelCard({ reel }: { reel: InstagramReel }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) setIsLoaded(true);
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Runs after the <video> element has actually mounted (isLoaded flips it
  // into the tree), so videoRef.current is guaranteed to be set here — doing
  // this inside the IntersectionObserver callback above would race the
  // render triggered by setIsLoaded and silently no-op on first entry.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isVisible) {
      video.play().catch(() => {
        // Browser autoplay policies can still reject the first attempt;
        // the next intersection/visibility change will retry.
      });
    } else {
      video.pause();
    }
  }, [isVisible, isLoaded]);

  return (
    <motion.div
      ref={containerRef}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <Link
        href={reel.permalink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={reel.caption ? `Watch reel on Instagram: ${reel.caption}` : "Watch reel on Instagram"}
        className="group relative block w-[220px] tablet:w-[260px] aspect-[9/16] rounded-xl overflow-hidden snap-center shrink-0 shadow-sm hover:shadow-xl transition-shadow duration-500 bg-surface-variant"
      >
        {isLoaded && (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.thumbnailUrl}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-charcoal-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center gap-2 text-pearl-white">
            <Play className="text-3xl" fill="currentColor" />
            <span className="font-label-md uppercase tracking-widest text-sm font-semibold">Watch Reel</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
