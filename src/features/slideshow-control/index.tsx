import { useEffect, useRef, useCallback } from 'react';

interface UseSlideshowControlProps {
  enabled: boolean;
  intervalSeconds: number;
  onNext: () => void;
  isReady: boolean;
}

interface UseSlideshowControlResult {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export function useSlideshowControl({
  enabled,
  intervalSeconds,
  onNext,
  isReady,
}: UseSlideshowControlProps): UseSlideshowControlResult {
  const intervalRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);

  const stopAnimation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  }, []);

  const startAnimation = useCallback(() => {
    stopAnimation();
    if (isReady && enabled) {
      const intervalMs = intervalSeconds * 1000;
      intervalRef.current = setInterval(() => {
        animationTimeoutRef.current = window.setTimeout(() => {
          onNext();
        }, 300);
      }, intervalMs);
    }
  }, [enabled, intervalSeconds, isReady, onNext, stopAnimation]);

  useEffect(() => {
    startAnimation();
    return () => {
      stopAnimation();
    };
  }, [startAnimation, stopAnimation]);

  return {
    startAnimation,
    stopAnimation,
  };
}
