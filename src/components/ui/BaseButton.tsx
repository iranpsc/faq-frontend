'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  block?: boolean;
  children: React.ReactNode;
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    rounded = 'md', 
    block = false, 
    className, 
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
      outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const roundedClasses = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full',
    };

    const blockClasses = block ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          roundedClasses[rounded],
          blockClasses,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BaseButton.displayName = 'BaseButton';
