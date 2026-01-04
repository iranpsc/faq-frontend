'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useProgress } from '@/contexts/ProgressContext';

export function useRouterProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startProgress, setProgress, completeProgress } = useProgress();
  const isNavigating = useRef(false);
  const progressRef = useRef(0);

  useEffect(() => {
    // Prevent multiple simultaneous progress bars
    if (isNavigating.current) return;
    
    isNavigating.current = true;
    progressRef.current = 0;
    
    // Start progress when route changes
    startProgress();

    // Simulate progress updates using ref to avoid dependency issues
    const progressInterval = setInterval(() => {
      progressRef.current += Math.random() * 15;
      if (progressRef.current >= 90) {
        clearInterval(progressInterval);
        setProgress(90);
      } else {
        setProgress(progressRef.current);
      }
    }, 100);

    // Complete progress after a short delay
    const completeTimeout = setTimeout(() => {
      completeProgress();
      isNavigating.current = false;
      progressRef.current = 0;
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
      isNavigating.current = false;
      progressRef.current = 0;
    };
  }, [pathname, searchParams, startProgress, setProgress, completeProgress]); // Only route-related deps
}
