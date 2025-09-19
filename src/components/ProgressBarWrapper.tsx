'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgress } from '@/contexts/ProgressContext';
import { useRouterProgress } from '@/hooks/useRouterProgress';

export function ProgressBarWrapper() {
  const { isVisible, progress } = useProgress();
  
  // This hook will automatically handle router events
  useRouterProgress();

  return <ProgressBar isVisible={isVisible} progress={progress} />;
}
