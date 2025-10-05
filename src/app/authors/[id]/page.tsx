import { Suspense } from 'react';
import { apiService } from '@/services/api';
import { AuthorDetailPageContent } from './AuthorDetailPageContent';

interface AuthorDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AuthorDetailPage({ params, searchParams }: AuthorDetailPageProps) {
  const resolvedParams = await params;
  const searchParamsData = await searchParams;
  
  const authorId = resolvedParams.id;
  const page = parseInt(searchParamsData.page || '1');

  try {
    // Fetch author and questions data on the server
    const [authorResponse, questionsResponse] = await Promise.all([
      apiService.getAuthorServer(authorId),
      apiService.getAuthorQuestionsServer(authorId, page)
    ]);
    
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">در حال بارگذاری اطلاعات نویسنده...</p>
            </div>
          </div>
        </div>
      }>
        <AuthorDetailPageContent
          initialAuthor={authorResponse}
          initialQuestions={questionsResponse.data}
          initialPagination={questionsResponse.meta}
          authorId={authorId}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching author data:', error);
    
    // Return not found state
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
}
