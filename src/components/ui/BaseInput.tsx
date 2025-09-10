'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    className, 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = 'block w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      default: 'border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500',
      filled: 'border-0 rounded-md px-3 py-2 bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-blue-500',
      outlined: 'border-2 border-gray-300 rounded-md px-3 py-2 bg-transparent text-gray-900 placeholder-gray-500 focus:border-blue-500',
    };

    const errorClasses = error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : '';

    const iconClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              baseClasses,
              variantClasses[variant],
              errorClasses,
              iconClasses,
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';
