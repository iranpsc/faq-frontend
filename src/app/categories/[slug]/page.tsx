'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ContentArea } from '@/components/ContentArea';
import { HomeSidebar } from '@/components/HomeSidebar';
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
    router.push(`/questions/${question.slug}`);
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
      <ContentArea layout="with-sidebar" showSidebar={true} mainWidth="3/4" sidebarWidth="1/4" sidebar={<HomeSidebar />}>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </ContentArea>
    );
  }

  if (error) {
    return (
      <ContentArea layout="with-sidebar" showSidebar={true} mainWidth="3/4" sidebarWidth="1/4" sidebar={<HomeSidebar />}>
        <p className="text-red-500">Error loading data.</p>
      </ContentArea>
    );
  }

  if (!category) {
    return (
      <ContentArea layout="with-sidebar" showSidebar={true} mainWidth="3/4" sidebarWidth="1/4" sidebar={<HomeSidebar />}>
        <p className="text-gray-500">Category not found.</p>
      </ContentArea>
    );
  }

  return (
    <ContentArea layout="with-sidebar" showSidebar={true} mainWidth="3/4" sidebarWidth="1/4" sidebar={<HomeSidebar />}>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">
        {category.name}
      </h1>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">زیردسته ها</h2>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600 dark:text-gray-400">
              {category.children.length} زیردسته
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="block bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-blue-100 dark:border-gray-700 group"
              >
                <div className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2 group-hover:text-blue-700 transition-colors duration-200">
                    {child.name}
                  </h3>
                  <div className="flex-1"></div>
                  <div className="flex flex-col gap-2 mt-4">
                    {child.questions_count && (
                      <div className="flex items-center text-sm text-green-600 dark:text-green-300">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2z"/>
                        </svg>
                        {child.questions_count} سوال
                      </div>
                    )}
                    {child.children_count && child.children_count > 0 && (
                      <div className="flex items-center text-sm text-purple-600 dark:text-purple-300">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                        {child.children_count} زیردسته
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">سوالات این دسته‌بندی</h2>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600 dark:text-gray-400">
              {pagination.meta && `مجموع ${pagination.meta.total} سوال`}
            </div>
          </div>
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
      {questions.length === 0 && (
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
