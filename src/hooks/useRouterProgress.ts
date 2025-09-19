'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useProgress } from '@/contexts/ProgressContext';

export function useRouterProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startProgress, setProgress, completeProgress, progress } = useProgress();
  const isNavigating = useRef(false);

  useEffect(() => {
    // Prevent multiple simultaneous progress bars
    if (isNavigating.current) return;
    
    isNavigating.current = true;
    
    // Start progress when route changes
    startProgress();

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (progress >= 90) {
        clearInterval(progressInterval);
        setProgress(90);
      } else {
        setProgress(progress + Math.random() * 15);
      }
    }, 100);

    // Complete progress after a short delay
    const completeTimeout = setTimeout(() => {
      completeProgress();
      isNavigating.current = false;
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
      isNavigating.current = false;
    };
  }, [pathname, searchParams, completeProgress, progress, setProgress, startProgress]); // Include all dependencies
}
