'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

interface ContentAreaProps {
  children?: ReactNode;
  layout?: 'with-sidebar' | 'full-width' | 'centered';
  showSidebar?: boolean;
  mainWidth?: '1/2' | '2/3' | '3/4' | 'full';
  sidebarWidth?: '1/4' | '1/3' | '1/2';
  gap?: '2' | '4' | '6' | '8' | '12';
  maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  background?: 'default' | 'white' | 'gray' | 'transparent';
  hero?: ReactNode;
  filters1?: ReactNode;
  filters?: ReactNode;
  main?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

export function ContentArea({
  children,
  layout = 'with-sidebar',
  showSidebar = true,
  mainWidth = '3/4',
  sidebarWidth = '1/4',
  gap = '6',
  maxWidth = '7xl',
  background = 'default',
  hero,
  filters1,
  filters,
  main,
  sidebar,
  footer
}: ContentAreaProps) {
  // const [isSidebarFixed, setIsSidebarFixed] = useState(true);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current || !footer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        // When footer comes into view, make sidebar follow normal flow
        // When footer goes out of view, make sidebar fixed
        // setIsSidebarFixed(!entry.isIntersecting);
      },
      {
        threshold: 0.1, // Trigger when 10% of footer is visible
        rootMargin: '0px 0px -100px 0px' // Start transition 100px before footer comes into view
      }
    );

    observer.observe(footerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [footer]);

  // Layout wrapper classes
  const layoutClasses = (() => {
    const gaps = {
      '2': 'gap-2',
      '4': 'gap-4',
      '6': 'gap-6',
      '8': 'gap-8',
      '12': 'gap-12',
    };
    if (layout === 'with-sidebar') {
      return [
        'flex',
        'flex-col-reverse lg:flex-row',
        'items-start',
        gaps[gap] || 'gap-6',
      ].join(' ');
    }
    if (layout === 'full-width') return 'w-full';
    if (layout === 'centered') return 'max-w-4xl mx-auto';
    return '';
  })();

  // Main content classes
  const mainContentClasses = (() => {
    if (layout === 'with-sidebar' && showSidebar) {
      const widthMap = {
        '1/2': 'lg:w-1/2',
        '2/3': 'lg:w-2/3',
        '3/4': 'lg:w-3/4',
        'full': 'w-full',
      };
      return [
        'flex-1',
        'w-full',
        widthMap[mainWidth] || 'lg:w-3/4',
      ].join(' ');
    }
    return 'w-full';
  })();

  // Sidebar classes
  const sidebarClasses = (() => {
    if (layout === 'with-sidebar') {
      const widthMap = {
        '1/4': 'lg:w-1/4',
        '1/3': 'lg:w-1/3',
        '1/2': 'lg:w-1/2',
      };
      return [
        'shrink-0',
        'w-full', // full width in mobile
        widthMap[sidebarWidth] || 'lg:w-1/4',
      ].join(' ');
    }
    return '';
  })();

  const backgroundClasses = {
    default: 'bg-gray-50 dark:bg-gray-900/50',
    white: 'bg-white dark:bg-gray-800',
    gray: 'bg-gray-100 dark:bg-gray-800',
    transparent: 'bg-transparent',
  };

  const maxWidthClasses = {
    none: '',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  return (
    <main className={clsx(
      ' flex-grow  p-4 sm:p-6 lg:p-8 relative main-content-container',
      backgroundClasses[background]
    )}>
      {/* Hero Section */}
      {hero && (
        <div className={clsx('w-full mx-auto mb-6 sm:mb-8 lg:mb-12', maxWidthClasses[maxWidth])}>
          {hero}
        </div>
      )}

      <div className={clsx('mx-auto', maxWidthClasses[maxWidth])}>
        {/* Filters Section */}
        {filters1 && (
          <div className="mb-6">
            {filters1}
          </div>
        )}

        {/* Question Filters Section */}
        {filters && (
          <div className="mb-6">
            {filters}
          </div>
        )}

        {/* Main Layout */}
        <div className={layoutClasses}>
          {/* Main Content */}
          <div className={mainContentClasses}>
            {main}
            {children}
          </div>

          {/* Sidebar */}
          {sidebar && showSidebar && (
            <div className={clsx(
              sidebarClasses, 
              'h-fit', 
              'block lg:sticky top-5',
             
            )}>
              {sidebar}
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div ref={footerRef} className="mt-12">
            {footer}
          </div>
        )}
      </div>
    </main>
  );
}
