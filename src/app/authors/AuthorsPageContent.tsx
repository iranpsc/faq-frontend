'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthorCard } from '@/components/AuthorCard';
import { BasePagination } from '@/components/ui/BasePagination';
import { ContentArea } from '@/components/ContentArea';
import { HomeSidebar } from '@/components/HomeSidebar';
import { apiService } from '@/services/api';
import { User, PaginatedResponse } from '@/services/types';

interface AuthorsPageContentProps {
  initialAuthors: User[];
  initialPagination: PaginatedResponse<User>['meta'];
  initialSearchQuery?: string;
  initialSortBy?: string;
  initialSortOrder?: string;
  initialPage?: number;
}

export function AuthorsPageContent({
  initialAuthors,
  initialPagination,
  initialSearchQuery = '',
  initialSortBy = 'score',
  initialSortOrder = 'desc',
  initialPage = 1
}: AuthorsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [authors, setAuthors] = useState<User[]>(initialAuthors);
  const [pagination, setPagination] = useState<PaginatedResponse<User>['meta'] | null>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadAuthors = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: Record<string, string | number> = {
        page,
        per_page: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await apiService.getAuthors(params);
      setAuthors(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری نویسندگان');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, sortBy, sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    const target = Math.max(1, page);
    setCurrentPage(target);
    
    // Update URL
    const params = new URLSearchParams(searchParams);
    if (target > 1) {
      params.set('page', target.toString());
    } else {
      params.delete('page');
    }
    router.push(`/authors?${params.toString()}`);
    
    loadAuthors(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, router, loadAuthors]);

  const handleSearchInput = useCallback(() => {
    // Debounce search with shorter timeout for better UX
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      loadAuthors(1);
    }, 300);
    
    setSearchTimeout(timeout);
  }, [loadAuthors, searchTimeout]);

  const handleSortChange = useCallback(() => {
    setCurrentPage(1);
    loadAuthors(1);
  }, [loadAuthors]);

  const handleAuthorClick = useCallback((author: User) => {
    router.push(`/authors/${author.username ?? author.id}`);
  }, [router]);

  // Handle URL changes
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const target = parseInt(pageParam || '1');
    if (target !== currentPage) {
      setCurrentPage(target);
      loadAuthors(target);
    }
  }, [searchParams, currentPage, loadAuthors]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <ContentArea 
      layout="with-sidebar" 
      showSidebar={true} 
      mainWidth="3/4" 
      sidebarWidth="1/4"
      filters={
        <>
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  فعالان انجمن
                </h1>
              </div>

              {/* Stats Summary */}
              <div className="flex gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                  <span className="text-gray-600 dark:text-gray-400">کل اعضای انجمن:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1">
                    {pagination?.total || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearchInput();
                    }}
                    placeholder="جستجو در نام یا ایمیل نویسندگان..."
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex gap-3">
                <div className="relative inline-block w-full">
                  <select
                    value={sortBy}
                    aria-label='sort'
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      handleSortChange();
                    }}
                    className="px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 appearance-none w-full text-xs md:text-base"
                  >
                    <option value="score">مرتب‌سازی بر اساس امتیاز</option>
                    <option value="questions_count">بر اساس تعداد سوالات</option>
                    <option value="answers_count">بر اساس تعداد پاسخ‌ها</option>
                    <option value="name">بر اساس نام</option>
                    <option value="created_at">بر اساس تاریخ عضویت</option>
                  </select>

                  {/* Arrow SVG سمت چپ */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative inline-block w-full">
                  <select
                    value={sortOrder}
                    aria-label='sortOrder'
                    onChange={(e) => {
                      setSortOrder(e.target.value);
                      handleSortChange();
                    }}
                    className="px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 appearance-none w-full text-xs md:text-base"
                  >
                    <option value="desc">نزولی</option>
                    <option value="asc">صعودی</option>
                  </select>

                  {/* Arrow SVG سمت چپ */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      }
      main={
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, n) => (
                <div key={n} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm animate-pulse">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                    </div>
                    <div className="text-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                    </div>
                    <div className="text-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-8 mx-auto mb-1"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Authors Grid */}
          {!isLoading && !error && authors.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authors.map((author) => (
                  <AuthorCard
                    key={author.id}
                    author={author}
                    onClick={handleAuthorClick}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <div className="mt-8">
                  <BasePagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    total={pagination.total}
                    perPage={pagination.per_page}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!isLoading && !error && authors.length === 0 && (
            <div className="text-center py-12">
              <svg className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                نویسنده‌ای یافت نشد
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'هیچ نویسنده‌ای با این جستجو پیدا نشد.' : 'هنوز نویسنده‌ای در سیستم ثبت نشده است.'}
              </p>
            </div>
          )}
        </div>
      }
      sidebar={<HomeSidebar />}
    />
  );
}
