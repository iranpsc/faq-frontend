import TagContent from '@/components/TagContent';
import { apiService } from '@/services/api';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  
  try {
    // Use API service for server-side calls
    const tagData = await apiService.getTagQuestionsServer(slug, 1);
    const questions = tagData.data || [];
    const tag = tagData.tag || null;
    const pagination = tagData.meta || null;

    return (
      <TagContent 
        slug={slug}
        initialQuestions={questions}
        initialTag={tag}
        initialPagination={pagination}
      />
    );
  } catch (error) {
    // Return error state to client component - it will handle the error display
    return (
      <TagContent 
        slug={slug}
        initialQuestions={[]}
        initialTag={null}
        initialPagination={null}
      />
    );
  }
}
