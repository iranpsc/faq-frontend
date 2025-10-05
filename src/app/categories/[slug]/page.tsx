import CategoryContent from '@/components/CategoryContent';
import { apiService } from '@/services/api';
import { Question, PaginatedResponse } from '@/services/types';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  try {
    // First, fetch the category information
    const category = await apiService.getCategoryServer(slug);
    
    // Then, try to fetch questions for the category
    let questions: Question[] = [];
    let pagination: PaginatedResponse<Question>['meta'] | null = null;
    
    try {
      const categoryData = await apiService.getCategoryQuestionsServer(slug, 1);
      questions = categoryData.data || [];
      pagination = categoryData.meta || null;
    } catch {
      // If questions fetch fails, it might be because there are no questions
      // This is not a critical error, we can still show the category
      console.log('No questions found for category:', slug);
    }

    return (
      <CategoryContent 
        slug={slug}
        initialCategory={category}
        initialQuestions={questions}
        initialPagination={pagination}
      />
    );
  } catch {
    // Return error state to client component - it will handle the error display
    return (
      <CategoryContent 
        slug={slug}
        initialCategory={null}
        initialQuestions={[]}
        initialPagination={null}
      />
    );
  }
}
