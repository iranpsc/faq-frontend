'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-9xl font-bold text-blue-600 dark:text-blue-400 opacity-20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/assets/images/404-illustration.png"
              alt="صفحه یافت نشد"
              width={200}
              height={200}
              className="w-48 h-48 object-contain"
              onError={(e) => {
                // Fallback to SVG icon if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallbackIcon = target.nextElementSibling as HTMLElement;
                if (fallbackIcon) {
                  fallbackIcon.style.display = 'block';
                }
              }}
            />
            {/* Fallback SVG Icon */}
            <svg 
              className="w-48 h-48 text-gray-400 dark:text-gray-600 hidden" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 6.291A7.962 7.962 0 0012 5c-2.34 0-4.29 1.009-5.824 2.709" 
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            صفحه یافت نشد
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا حذف شده است.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            ممکن است آدرس اشتباه باشد یا صفحه به مکان دیگری منتقل شده باشد.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              بازگشت به صفحه اصلی
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              بازگشت به صفحه قبل
            </button>
          </div>

          {/* Quick Links */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              یا به یکی از صفحات زیر بروید:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/categories"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
              >
                دسته‌بندی‌ها
              </Link>
              <Link
                href="/authors"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
              >
                نویسندگان
              </Link>
              <Link
                href="/tags"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
              >
                برچسب‌ها
              </Link>
              <Link
                href="/profile"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
              >
                پروفایل
              </Link>
            </div>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            یا سوال خود را جستجو کنید:
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="جستجو در سوالات..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value.trim();
                  if (query) {
                    window.location.href = `/?search=${encodeURIComponent(query)}`;
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                const query = input?.value.trim();
                if (query) {
                  window.location.href = `/?search=${encodeURIComponent(query)}`;
                }
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
