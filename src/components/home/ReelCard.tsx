"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { fadeUp } from "@/lib/motion/variants";
import type { InstagramReel } from "@/services/instagram";

// Meta's media_url/thumbnail_url are signed, time-limited CDN links (see
// src/services/instagram.ts) — even with a short cache window, a link can
// still expire mid-window. One retry (a forced <video> reload) absorbs a
// transient network hiccup; a link that's genuinely expired fails again
// immediately, at which point we stop and fall back to a static tile rather
// than show a permanently broken player.
const MAX_VIDEO_RETRIES = 1;

export function ReelCard({ reel }: { reel: InstagramReel }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoRetries, setVideoRetries] = useState(0);

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
    if (!video || videoFailed) return;
    if (isVisible) {
      video.play().catch(() => {
        // Browser autoplay policies can still reject the first attempt;
        // the next intersection/visibility change will retry.
      });
    } else {
      video.pause();
    }
  }, [isVisible, isLoaded, videoFailed]);

  const handleVideoError = () => {
    if (videoRetries < MAX_VIDEO_RETRIES && videoRef.current) {
      setVideoRetries((r) => r + 1);
      videoRef.current.load();
    } else {
      setVideoFailed(true);
    }
  };

  const showStaticFallback = videoFailed;

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
        {!isLoaded && <div className="absolute inset-0 animate-pulse bg-surface-container" />}

        {isLoaded && showStaticFallback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-ag-purple/15 to-surface-variant text-charcoal-navy/70 px-4 text-center">
            <Play className="text-3xl" />
            <span className="font-label-sm uppercase tracking-widest text-[11px] font-semibold">View on Instagram</span>
          </div>
        )}

        {isLoaded && !showStaticFallback && (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={posterFailed ? undefined : reel.thumbnailUrl}
            onError={handleVideoError}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        {/* Invisible probe — <video poster> failures don't emit an error event
            on the video element itself, so a real <img> is used purely to
            detect a dead thumbnail URL and stop pointing the poster at it. */}
        {isLoaded && !posterFailed && !showStaticFallback && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reel.thumbnailUrl}
            alt=""
            aria-hidden="true"
            className="hidden"
            onError={() => setPosterFailed(true)}
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
