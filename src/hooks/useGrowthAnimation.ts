import { useState, useEffect, useRef, useCallback } from "react";

export interface GrowthAnimationState {
  progress: number; // 0.0 (just bindu) to 1.0 (fully constructed)
  isPlaying: boolean;
  speed: number; // 0.25, 0.5, 1, 2, 4
  prefersReducedMotion: boolean;
}

export function useGrowthAnimation(seedTrigger: string | number) {
  const [progress, setProgress] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const rafId = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);
  const duration = 2800; // base duration in ms for 1x speed

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Animation Loop
  const animate = useCallback((timestamp: number) => {
    if (lastTime.current === null) {
      lastTime.current = timestamp;
    }

    const delta = timestamp - lastTime.current;
    lastTime.current = timestamp;

    setProgress((prev) => {
      const step = (delta / (duration / speed));
      const nextVal = prev + step;
      if (nextVal >= 1.0) {
        setIsPlaying(false);
        return 1.0;
      }
      return nextVal;
    });

    rafId.current = requestAnimationFrame(animate);
  }, [speed]);

  useEffect(() => {
    if (isPlaying && !prefersReducedMotion) {
      lastTime.current = null;
      rafId.current = requestAnimationFrame(animate);
    } else {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    }

    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [isPlaying, prefersReducedMotion, animate]);

  const play = useCallback(() => {
    if (prefersReducedMotion) {
      setProgress(1.0);
      return;
    }
    if (progress >= 1.0) {
      setProgress(0.0);
    }
    setIsPlaying(true);
  }, [progress, prefersReducedMotion]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const replay = useCallback(() => {
    if (prefersReducedMotion) {
      setProgress(1.0);
      return;
    }
    setProgress(0.0);
    setIsPlaying(true);
  }, [prefersReducedMotion]);

  const skipToEnd = useCallback(() => {
    setIsPlaying(false);
    setProgress(1.0);
  }, []);

  const scrub = useCallback((val: number) => {
    setIsPlaying(false);
    setProgress(Math.max(0, Math.min(1, val)));
  }, []);

  // On seed change, trigger a subtle reveal if wanted or let user trigger
  const prevSeed = useRef(seedTrigger);
  useEffect(() => {
    if (prevSeed.current !== seedTrigger) {
      prevSeed.current = seedTrigger;
      // You can replay or keep at 1.0 based on user choice
    }
  }, [seedTrigger]);

  return {
    progress,
    isPlaying,
    speed,
    setSpeed,
    prefersReducedMotion,
    play,
    pause,
    replay,
    skipToEnd,
    scrub,
  };
}
