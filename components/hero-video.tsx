"use client";

import { useEffect, useRef } from "react";

/**
 * Muted, looping background video. `playbackRate` slows it down (1 = normal
 * speed); it has no HTML attribute, so it is set from the browser.
 */
export function HeroVideo({
  src,
  poster,
  playbackRate = 0.5,
}: {
  src: string;
  poster?: string;
  playbackRate?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = playbackRate;
  }, [playbackRate]);

  return (
    // Decorative, so hidden from screen readers; skipped for people who prefer reduced motion.
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      // Browsers can reset the rate when the video (re)loads its data.
      onLoadedMetadata={(e) => {
        e.currentTarget.playbackRate = playbackRate;
      }}
    />
  );
}
