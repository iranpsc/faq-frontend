'use client';

import { HTMLAttributes } from 'react';

interface AvatarSvgProps extends HTMLAttributes<SVGElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function AvatarSvg({ size = 'md', className, ...props }: AvatarSvgProps) {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className || ''}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="12"
        fill="currentColor"
        className="text-blue-500 dark:text-blue-400"
      />
      <path
        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
        fill="white"
        className="dark:fill-gray-800"
      />
      <path
        d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
        fill="white"
        className="dark:fill-gray-800"
      />
    </svg>
  );
}
