'use client';

import { HTMLAttributes, forwardRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { AvatarSvg } from './AvatarSvg';

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
    // Validate and normalize the image URL
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    const getValidImageSrc = (imageSrc?: string): string | null => {
      if (!imageSrc || imageSrc.trim() === '') {
        return null;
      }

      // If it's already a valid absolute URL, return it
      if (isValidUrl(imageSrc)) {
        return imageSrc;
      }

      // If it's a relative URL, try to make it absolute
      if (imageSrc.startsWith('/')) {
        // For relative URLs, we need to determine the base URL
        // This could be the API base URL or the current domain
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        if (baseUrl && baseUrl !== '/api') {
          return `${baseUrl.replace('/api', '')}${imageSrc}`;
        }
        return imageSrc; // Return as-is for local development
      }

      // If it's not a valid URL, return null to fall back to avatar
      return null;
    };

    const validSrc = getValidImageSrc(src);
    const sizeClasses = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl',
    };

    const sizeMap = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      '2xl': 80,
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
        {validSrc ? (
          <Image
            src={validSrc}
            alt={name || ''}
            width={sizeMap[size]}
            height={sizeMap[size]}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <AvatarSvg size={size} className="w-full h-full" />
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
