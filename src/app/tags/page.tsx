'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ContentArea } from '@/components/ContentArea';
import { HomeSidebar } from '@/components/HomeSidebar';
import { BasePagination } from '@/components/ui/BasePagination';
import { BaseAlert } from '@/components/ui/BaseAlert';
import { apiService } from '@/services/api';
import { Tag } from '@/services/types';

function TagsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [tags, setTags] = useState<Tag[]>([]);
  const [pagination, setPagination] = useState<{ meta: Record<string, unknown> | null; links: Record<string, unknown> | null }>({ meta: null, links: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update current page when URL changes
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [searchParams, currentPage]);

  // Fetch tags data function
  const fetchTagsData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiService.getTagsPaginated({
        page,
        per_page: 12
      });

      if (result.success) {
        // Handle different response structures (same as Vue.js version)
        if (result.data.data) {
          // Laravel paginated response
          setTags(result.data.data);
          setPagination({
            meta: result.data.meta,
            links: result.data.links
          });
        } else if (Array.isArray(result.data)) {
          // Simple array response
          setTags(result.data);
          setPagination({
            meta: {
              current_page: page,
              last_page: 1,
              total: result.data.length,
              per_page: 12
            },
            links: null
          });
        } else {
          // Single object response - this shouldn't happen with tags API, but handle it
          setTags([]);
          setPagination({
            meta: {
              current_page: page,
              last_page: 1,
              total: 0,
              per_page: 12
            },
            links: null
          });
        }
      } else {
        setError(result.error || 'Failed to load tags');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tags');
      console.error('Failed to fetch tags:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tags when page changes
  useEffect(() => {
    fetchTagsData(currentPage);
  }, [currentPage]);

  const handlePageChange = async (page: number) => {
    if (pagination.meta && page === pagination.meta.current_page) return;

    // Update URL with page parameter
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/tags${newUrl}`);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    await fetchTagsData(page);
  };

  return (
    <ContentArea 
      layout="with-sidebar" 
      showSidebar={true} 
      mainWidth="3/4" 
      sidebarWidth="1/4"
      main={
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">برچسب ها</h1>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600 dark:text-gray-400">
              {pagination.meta && !loading && (
                <>مجموع {pagination.meta.total} برچسب</>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, n) => (
                <div key={n} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <BaseAlert variant="error" message={error} />
          )}

          {/* Tags Grid */}
          {!loading && !error && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="block bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-100 dark:border-gray-700 group"
                  >
                    <div className="p-6 flex flex-col h-full">
                      <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-2 group-hover:text-blue-700 transition-colors duration-200">
                        {tag.name}
                      </h2>
                      <div className="flex-1"></div>
                      <div className="flex flex-col gap-2 mt-4">
                        {tag.questions_count > 0 && (
                          <div className="flex items-center text-sm text-blue-600 dark:text-blue-300">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {tag.questions_count} سوال
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.meta && (pagination.meta.last_page as number) > 1 && (
                <div className="mt-8">
                  <BasePagination
                    currentPage={pagination.meta.current_page as number}
                    totalPages={pagination.meta.last_page as number}
                    total={pagination.meta.total as number}
                    perPage={pagination.meta.per_page as number}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Empty State */}
              {tags.length === 0 && !loading && !error && (
                <div className="text-center py-16">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h2 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">برچسبی یافت نشد</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">هنوز برچسبی ایجاد نشده است.</p>
                </div>
              )}
            </div>
          )}
        </div>
      }
      sidebar={<HomeSidebar />}
    />
  );
}

export default function TagsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    }>
      <TagsContent />
    </Suspense>
  );
}
