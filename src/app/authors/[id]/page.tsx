'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthorCard } from '@/components/AuthorCard';
import { QuestionCard } from '@/components/QuestionCard';
import { BasePagination } from '@/components/ui/BasePagination';
import { apiService } from '@/services/api';
import { User, Question, PaginatedResponse } from '@/services/types';

interface AuthorDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AuthorDetailPage({ params }: AuthorDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [author, setAuthor] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Question>['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorQuestions = useCallback(async (page = 1) => {
    try {
      const response = await apiService.getAuthorQuestions(resolvedParams.id, page);
      setQuestions(response.data);
      setPagination(response.meta);
    } catch (err) {
      console.error('Error fetching author questions:', err);
    }
  }, [resolvedParams.id]);

  const loadAuthor = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authorData = await apiService.getAuthor(resolvedParams.id);
      setAuthor(authorData);
      
      const initialPage = parseInt(searchParams.get('page') || '1');
      await fetchAuthorQuestions(initialPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات نویسنده');
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id, searchParams, fetchAuthorQuestions]);

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
    
    const newUrl = `/authors/${resolvedParams.id}?${urlParams.toString()}`;
    router.push(newUrl);
  }, [pagination, fetchAuthorQuestions, searchParams, router, resolvedParams.id]);

  const navigateToQuestion = useCallback((question: Question) => {
    router.push(`/questions/${question.slug}`);
  }, [router]);

  // Initialize page
  useEffect(() => {
    loadAuthor();
  }, [loadAuthor]);

  // Handle URL changes for pagination
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const target = parseInt(pageParam || '1');
    if (pagination && target !== pagination.current_page) {
      fetchAuthorQuestions(target);
    }
  }, [searchParams, pagination, fetchAuthorQuestions]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">در حال بارگذاری اطلاعات نویسنده...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Added h1 for main page heading accessibility (previously missing) */}
          <h1 className="sr-only">پروفایل {author.name}</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            سوالات پرسیده شده توسط {author.name}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {questions.length > 0 ? (
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
