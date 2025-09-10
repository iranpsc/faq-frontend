'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface BaseAlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  message?: string;
  children?: React.ReactNode;
}

export const BaseAlert = forwardRef<HTMLDivElement, BaseAlertProps>(
  ({ variant = 'info', message, className, children, ...props }, ref) => {
    const variantClasses = {
      success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
      error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
      info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
    };

    const iconMap = {
      success: CheckCircle,
      error: AlertCircle,
      warning: AlertTriangle,
      info: Info,
    };

    const Icon = iconMap[variant];

    return (
      <div
        ref={ref}
        className={clsx(
          'flex items-start gap-3 p-4 rounded-lg border',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {message && <p className="text-sm font-medium">{message}</p>}
          {children}
        </div>
      </div>
    );
  }
);

BaseAlert.displayName = 'BaseAlert';
