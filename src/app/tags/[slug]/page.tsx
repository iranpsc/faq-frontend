'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ContentArea } from '@/components/ContentArea';
import { HomeSidebar } from '@/components/HomeSidebar';
import { BasePagination } from '@/components/ui/BasePagination';
import { BaseAlert } from '@/components/ui/BaseAlert';
import { QuestionCard } from '@/components/QuestionCard';
import { apiService } from '@/services/api';
import { Question, Tag, PaginatedResponse } from '@/services/types';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function TagContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tag, setTag] = useState<Tag | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Question>['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update current page when URL changes
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [searchParams, currentPage]);

  // Fetch tag questions when page or slug changes
  useEffect(() => {
    const fetchTagQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getTagQuestions(slug, currentPage);
        setQuestions(response.data);
        setTag(response.tag);
        setPagination(response.meta);
      } catch (err) {
        console.error('Error fetching tag questions:', err);
        setError(err instanceof Error ? err.message : 'خطا در بارگذاری سوالات برچسب');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchTagQuestions();
    }
  }, [slug, currentPage]);

  const handlePageChange = (page: number) => {
    if (pagination && page === pagination.current_page) return;

    // Update URL with page parameter
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '';
    router.push(`/tags/${slug}${newUrl}`);

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionClick = (question: Question) => {
    // TODO: Navigate to question detail page
    console.log('Question clicked:', question);
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
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Link href="/tags" className="hover:text-blue-600 dark:hover:text-blue-400">
                  برچسب‌ها
                </Link>
                <span>/</span>
                <span className="text-gray-900 dark:text-gray-100">{tag?.name || slug}</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                سوالات برچسب "{tag?.name || slug}"
              </h1>
            </div>
            <div className="mt-2 sm:mt-0 text-sm text-gray-600 dark:text-gray-400">
              {pagination && !isLoading && (
                <>مجموع {pagination.total} سوال</>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, n) => (
                <div key={n} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                  <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <BaseAlert variant="error" message={error} />
          )}

          {/* Questions List */}
          {!isLoading && !error && (
            <div>
              {questions.length > 0 ? (
                <div>
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
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  <h2 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">سوالی یافت نشد</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    هنوز سوالی با این برچسب ایجاد نشده است.
                  </p>
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

export default function TagPage({ params }: TagPageProps) {
  const resolvedParams = use(params);
  return <TagContent slug={resolvedParams.slug} />;
}
