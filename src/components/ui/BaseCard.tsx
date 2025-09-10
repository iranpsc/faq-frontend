'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shadow' | 'outline';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(
  ({ 
    variant = 'default', 
    rounded = 'md', 
    padding = 'md', 
    className, 
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'bg-white dark:bg-gray-800 transition-colors duration-300';
    
    const variantClasses = {
      default: 'border border-gray-200 dark:border-gray-700',
      shadow: 'shadow-sm border border-gray-200 dark:border-gray-700',
      outline: 'border-2 border-gray-300 dark:border-gray-600',
    };

    const roundedClasses = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    };

    const paddingClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          roundedClasses[rounded],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BaseCard.displayName = 'BaseCard';
