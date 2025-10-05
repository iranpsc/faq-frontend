import QuestionDetailsContent from '@/components/QuestionDetailsContent';
import { apiService } from '@/services/api';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function QuestionDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  try {
    // Use API service for server-side calls
    const question = await apiService.getQuestionBySlugServer(slug);
    const answers: any[] = []; // Answers will be fetched client-side

    return (
      <QuestionDetailsContent 
        slug={slug}
        initialQuestion={question}
        initialAnswers={answers}
      />
    );
  } catch (error) {
    // Return error state to client component - it will handle the error display
    return (
      <QuestionDetailsContent 
        slug={slug}
        initialQuestion={null}
        initialAnswers={[]}
      />
    );
  }
}
