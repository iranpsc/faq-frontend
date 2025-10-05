import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    domains: ['api.faqhub.ir', 'localhost', 'irpsc.com', 'ui-avatars.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // API proxy to avoid CORS issues
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    return [
      {
        source: '/api/:path*',
        destination: isProd
          ? 'https://api.faqhub.ir/api/:path*'
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Webpack configuration (also used when not using --turbopack)
  // Note: Turbopack will ignore this config when using --turbopack flag
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  
  // Environment variables with sensible defaults per environment
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://api.faqhub.ir/api'
        : 'http://localhost:8000/api'),
  },
};

export default nextConfig;
