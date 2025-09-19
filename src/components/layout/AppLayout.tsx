'use client';

import { useState, useEffect } from 'react';
import { Header, Sidebar, Footer } from './index';
import { QuestionModal } from '@/components/QuestionModal';
import { AuthDialog } from '@/components/AuthDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQuestions } from '@/hooks/useQuestions';
import { Question } from '@/services/api';
import { clsx } from 'clsx';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('light');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { refetch } = useQuestions();

  // Initialize theme and handle responsive behavior
  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);
    
    // Set initial sidebar state based on screen size
    const isLargeScreen = window.innerWidth >= 1024;
    setSidebarOpen(isLargeScreen);

    // Initialize theme
    const savedThemeMode = localStorage.getItem('themeMode') as 'light' | 'dark' | 'auto' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialThemeMode = savedThemeMode || 'light';
    setThemeMode(initialThemeMode);
    
    // Determine actual theme based on mode
    let actualTheme: 'light' | 'dark';
    if (initialThemeMode === 'auto') {
      actualTheme = prefersDark ? 'dark' : 'light';
    } else {
      actualTheme = initialThemeMode;
    }
    setTheme(actualTheme);
    
    // Apply theme to document
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Handle resize
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      setSidebarOpen(isLargeScreen);
    };

    // Handle keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleMobileSearch = () => {
    setMobileSearchOpen(!mobileSearchOpen);
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
    
    // Determine actual theme based on mode
    let actualTheme: 'light' | 'dark';
    if (mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = prefersDark ? 'dark' : 'light';
    } else {
      actualTheme = mode;
    }
    setTheme(actualTheme);
    
    if (actualTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleMainAction = () => {
    if (isAuthenticated) {
      setQuestionToEdit(null);
      setShowQuestionModal(true);
    } else {
      setShowAuthDialog(true);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionToEdit(question);
    setShowQuestionModal(true);
  };

  const handleQuestionCreated = async (newQuestion: Question) => {
    setShowQuestionModal(false);
    // Refresh questions list
    refetch();
  };

  const handleQuestionUpdated = async (updatedQuestion: Question) => {
    setShowQuestionModal(false);
    setQuestionToEdit(null);
    // Refresh questions list
    refetch();
  };

  return (
    <div className="app-container bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div 
        className={clsx(
          'flex flex-col flex-grow transition-colors duration-300 mr-0',
          {
            'lg:mr-80': !mounted || sidebarOpen,
            'lg:mr-16': mounted && !sidebarOpen
          }
        )}
        style={{ width: '-webkit-fill-available' }}
      >
        <Header 
          sidebarOpen={mounted ? sidebarOpen : false} 
          onToggleSidebar={toggleSidebar} 
          onMainAction={handleMainAction}
          mobileSearchOpen={mobileSearchOpen}
          onToggleMobileSearch={toggleMobileSearch}
        />
        <main className="flex-1">
          {children}
        </main>
        <Footer onAskQuestion={handleMainAction} />
      </div>
      
      <Sidebar 
        isOpen={mounted ? sidebarOpen : false} 
        mounted={mounted}
        theme={theme} 
        themeMode={themeMode}
        onToggle={toggleSidebar} 
        onThemeChange={handleThemeChange} 
      />


      {/* Overlay for mobile/tablet/medium screens */}
      {mounted && sidebarOpen && (
        <div 
          onClick={closeSidebar} 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}

      {/* Question Modal */}
      <QuestionModal
        visible={showQuestionModal}
        questionToEdit={questionToEdit}
        onClose={() => setShowQuestionModal(false)}
        onQuestionCreated={handleQuestionCreated}
        onQuestionUpdated={handleQuestionUpdated}
      />

      {/* Auth Dialog */}
      <AuthDialog
        visible={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </div>
  );
}
