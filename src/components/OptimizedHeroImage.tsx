'use client';

import React from 'react';
import Image from 'next/image';

interface OptimizedHeroImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const OptimizedHeroImage: React.FC<OptimizedHeroImageProps> = ({
  src,
  alt,
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden rounded-lg shadow-sm ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={1200}
        height={480}
        className="w-full h-auto object-cover"
        loading="eager"
        priority
        sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        style={{ 
          aspectRatio: '1200/480', 
          contentVisibility: 'auto', 
          containIntrinsicSize: '1200px 480px', 
          objectFit: 'cover' 
        }}
        // Mobile-specific optimizations
        onLoad={() => {
          // Mark as loaded for performance tracking
          if (typeof window !== 'undefined' && 'performance' in window) {
            const perfData = performance.getEntriesByName(src, 'resource');
            if (perfData.length > 0) {
              console.log('Hero image loaded:', perfData[0]);
            }
          }
        }}
      />
    </div>
  );
};
