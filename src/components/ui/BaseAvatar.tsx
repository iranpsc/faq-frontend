'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BaseAvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'secondary';
  status?: 'online' | 'offline' | 'away';
}

export const BaseAvatar = forwardRef<HTMLDivElement, BaseAvatarProps>(
  ({ 
    src, 
    name = 'User', 
    size = 'md', 
    variant = 'default', 
    status, 
    className, 
    ...props 
  }, ref) => {
    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl',
    };

    const variantClasses = {
      default: 'bg-blue-500 text-white',
      secondary: 'bg-gray-500 text-white',
    };

    const statusClasses = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'relative inline-flex items-center justify-center rounded-full font-medium',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
        
        {status && (
          <span
            className={clsx(
              'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-800',
              statusClasses[status],
              {
                'w-2 h-2': size === 'xs' || size === 'sm',
                'w-3 h-3': size === 'md',
                'w-4 h-4': size === 'lg' || size === 'xl',
                'w-5 h-5': size === '2xl',
              }
            )}
          />
        )}
      </div>
    );
  }
);

BaseAvatar.displayName = 'BaseAvatar';
