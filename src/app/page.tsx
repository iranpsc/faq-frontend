import HomeContent from '@/components/HomeContent';
import { apiService } from '@/services/api';

export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    // Use API service for server-side calls
    const [questionsData, activeUsers] = await Promise.all([
      apiService.getQuestionsServer(),
      apiService.getActiveUsersServer(5)
    ]);

    const initialQuestions = questionsData.data || [];
    const initialPaginationMeta = questionsData.meta || null;

    return (
      <HomeContent 
        initialQuestions={initialQuestions}
        initialPaginationMeta={initialPaginationMeta}
        initialActiveUsers={activeUsers}
      />
    );
  } catch {
    // Return error state to client component
    return (
      <HomeContent 
        initialQuestions={[]}
        initialPaginationMeta={null}
        initialActiveUsers={[]}
      />
    );
  }
}

