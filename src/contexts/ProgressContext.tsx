'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ProgressContextType {
  isVisible: boolean;
  progress: number;
  startProgress: () => void;
  setProgress: (progress: number) => void;
  completeProgress: () => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: ReactNode;
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const startProgress = useCallback(() => {
    setIsVisible(true);
    setProgress(10);
  }, []);

  const completeProgress = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 200);
  }, []);

  const resetProgress = useCallback(() => {
    setIsVisible(false);
    setProgress(0);
  }, []);

  const value: ProgressContextType = {
    isVisible,
    progress,
    startProgress,
    setProgress,
    completeProgress,
    resetProgress,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
