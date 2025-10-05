'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthorCard } from '@/components/AuthorCard';
import { QuestionCard } from '@/components/QuestionCard';
import { BasePagination } from '@/components/ui/BasePagination';
import { BaseAlert } from '@/components/ui/BaseAlert';
import { apiService } from '@/services/api';
import { User, Question, PaginatedResponse } from '@/services/types';

interface AuthorDetailsContentProps {
  id: string;
  initialAuthor: User | null;
  initialQuestions: Question[];
  initialPagination: PaginatedResponse<Question>['meta'] | null;
}

export default function AuthorDetailsContent({
  id,
  initialAuthor,
  initialQuestions,
  initialPagination
}: AuthorDetailsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [author] = useState<User | null>(initialAuthor);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [pagination, setPagination] = useState<PaginatedResponse<Question>['meta'] | null>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorQuestions = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAuthorQuestions(id, page);
      setQuestions(response.data);
      setPagination(response.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری سوالات نویسنده');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const handlePageChange = useCallback(async (page: number) => {
    if (pagination && page === pagination.current_page) return;
    
    const target = Math.max(1, page);
    await fetchAuthorQuestions(target);
    
    // Update URL
    const urlParams = new URLSearchParams(searchParams);
    if (target > 1) {
      urlParams.set('page', target.toString());
    } else {
      urlParams.delete('page');
    }
    
    const newUrl = `/authors/${id}?${urlParams.toString()}`;
    router.push(newUrl);
  }, [pagination, fetchAuthorQuestions, searchParams, router, id]);

  const navigateToQuestion = useCallback((question: Question) => {
    router.push(`/questions/${question.slug}`);
  }, [router]);

  // Handle URL changes for pagination
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const target = parseInt(pageParam || '1');
    if (pagination && target !== pagination.current_page) {
      fetchAuthorQuestions(target);
    }
  }, [searchParams, pagination, fetchAuthorQuestions]);

  // Show error if no author data
  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              نویسنده یافت نشد
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              نویسنده مورد نظر وجود ندارد یا حذف شده است.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="sr-only">پروفایل {author.name}</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            سوالات پرسیده شده توسط {author.name}
          </h2>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6">
            <BaseAlert variant="error" message={error} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">در حال بارگذاری سوالات...</p>
              </div>
            ) : questions.length > 0 ? (
              <>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onClick={() => navigateToQuestion(question)}
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
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">این نویسنده هنوز سوالی نپرسیده است.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AuthorCard author={author} />
          </div>
        </div>
      </div>
    </div>
  );
}
