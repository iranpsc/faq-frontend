import { Suspense } from 'react';
import { apiService } from '@/services/api';
import { AuthorsPageContent } from './AuthorsPageContent';

interface AuthorsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }>;
}

export default async function AuthorsPage({ searchParams }: AuthorsPageProps) {
  const params = await searchParams;
  
  // Extract query parameters
  const page = parseInt(params.page || '1');
  const search = params.search || '';
  const sortBy = params.sort_by || 'score';
  const sortOrder = params.sort_order || 'desc';

  try {
    // Fetch authors data on the server
    const authorsParams: Record<string, string | number> = {
      page,
      per_page: 20,
      sort_by: sortBy,
      sort_order: sortOrder,
    };

    if (search.trim()) {
      authorsParams.search = search.trim();
    }

    const response = await apiService.getAuthorsServer(authorsParams);
    
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
          </div>
        </div>
      }>
        <AuthorsPageContent
          initialAuthors={response.data}
          initialPagination={response.meta}
          initialSearchQuery={search}
          initialSortBy={sortBy}
          initialSortOrder={sortOrder}
          initialPage={page}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error fetching authors:', error);
    
    // Return error state with fallback data
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
          </div>
        </div>
      }>
        <AuthorsPageContent
          initialAuthors={[]}
          initialPagination={{
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 0
          }}
          initialSearchQuery={search}
          initialSortBy={sortBy}
          initialSortOrder={sortOrder}
          initialPage={page}
        />
      </Suspense>
    );
  }
}
