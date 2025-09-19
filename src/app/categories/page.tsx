'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ContentArea } from '@/components/ContentArea';
import { HomeSidebar } from '@/components/HomeSidebar';
import { BasePagination } from '@/components/ui/BasePagination';
import { apiService } from '@/services/api';
import { Category } from '@/services/types';

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

interface Pagination {
  meta: PaginationMeta;
  links: PaginationLinks;
}

export default function CategoriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0
    },
    links: {
      first: '',
      last: '',
      prev: null,
      next: null
    }
  });

  const fetchCategories = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCategoriesPaginated(page);
      
      setCategories(response.data);
      setPagination({
        meta: response.meta,
        links: response.links
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری دسته‌بندی‌ها');
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };


  const handlePageChange = async (page: number) => {
    if (pagination.meta && page === pagination.meta.current_page) return;

    // Update URL with page parameter
    const url = new URL(window.location.href);
    if (page > 1) {
      url.searchParams.set('page', page.toString());
    } else {
      url.searchParams.delete('page');
    }
    router.push(url.pathname + url.search);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    await fetchCategories(page);
  };


  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    fetchCategories(page);
  }, [searchParams]);

  return (
    <ContentArea layout="with-sidebar" showSidebar={true} mainWidth="3/4" sidebarWidth="1/4" sidebar={<HomeSidebar />}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">دسته بندی ها</h1>
        <div className="mt-2 sm:mt-0 text-sm text-gray-600 dark:text-gray-400">
          {!loading && pagination.meta && `مجموع ${pagination.meta.total} دسته‌بندی`}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, n) => (
            <div key={n} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center text-red-500 dark:text-red-400">
          <p>Failed to load categories. Please try again later.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="block bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-100 dark:border-gray-700 group"
              >
                <div className="p-6 flex flex-col h-full">
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-2 group-hover:text-blue-700 transition-colors duration-200">
                    {category.name}
                  </h2>
                  <div className="flex-1"></div>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center text-sm text-green-600 dark:text-green-300">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2z"/>
                      </svg>
                      {category.questions_count || 0} سوال
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.meta && pagination.meta.last_page > 1 && (
            <div className="mt-8">
              <BasePagination
                currentPage={pagination.meta.current_page}
                totalPages={pagination.meta.last_page}
                total={pagination.meta.total}
                perPage={pagination.meta.per_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}

        </>
      )}
    </ContentArea>
  );
}
