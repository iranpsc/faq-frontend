'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ContentArea } from '@/components/ContentArea';
import { QuestionCard } from '@/components/QuestionCard';
import { BasePagination } from '@/components/ui/BasePagination';
import { apiService } from '@/services/api';
import { Category, Question } from '@/services/types';

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

interface CategoryWithChildren extends Category {
  children?: Category[];
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug } = use(params);
  const [category, setCategory] = useState<CategoryWithChildren | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleQuestionClick = (question: Question) => {
    // TODO: Navigate to question detail page
    console.log('Question clicked:', question);
  };

  const fetchData = async (slug: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch category data with children
      const categoryResponse = await apiService.getCategory(slug);
      
      setCategory(categoryResponse);

      // Always fetch questions for the category (both parent and child categories)
      const questionsResponse = await apiService.getCategoryQuestions(slug, page);
      
      setQuestions(questionsResponse.data);
      setPagination({
        meta: questionsResponse.meta,
        links: questionsResponse.links
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات دسته‌بندی');
      console.error('Failed to fetch category data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (pagination.meta && page === pagination.meta.current_page) return;
    const target = Math.max(1, page);
    await fetchData(slug, target);
    
    // Update URL for consistency
    const url = new URL(window.location.href);
    if (target > 1) {
      url.searchParams.set('page', target.toString());
    } else {
      url.searchParams.delete('page');
    }
    router.push(url.pathname + url.search);
  };

  useEffect(() => {
    const initialPage = parseInt(searchParams.get('page') || '1');
    fetchData(slug, initialPage);
  }, [slug, searchParams]);

  if (loading) {
    return (
      <ContentArea layout="full-width" showSidebar={false}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ContentArea>
    );
  }

  if (error) {
    return (
      <ContentArea layout="full-width" showSidebar={false}>
        <p className="text-red-500">Error loading data.</p>
      </ContentArea>
    );
  }

  if (!category) {
    return (
      <ContentArea layout="full-width" showSidebar={false}>
        <p className="text-gray-500">Category not found.</p>
      </ContentArea>
    );
  }

  return (
    <ContentArea layout="full-width" showSidebar={false}>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        {category.name}
      </h1>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4">زیردسته ها</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {child.name}
                  </h3>
                </div>
                {child.children_count && child.children_count > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3 rounded-b-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {child.children_count} زیردسته
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4 mt-8">سوالات</h2>
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClick={handleQuestionClick}
              />
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

      {/* Empty state for questions */}
      {questions.length === 0 && (!category.children || category.children.length === 0) && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            هنوز سوالی در این دسته‌بندی وجود ندارد
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            اولین سوال را در این دسته‌بندی بپرسید.
          </p>
        </div>
      )}
    </ContentArea>
  );
}
