import { apiService } from '@/services/api';
import HomeContent from '@/components/HomeContent';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [questionsResponse, activeUsers] = await Promise.all([
    apiService.getQuestions({}),
    apiService.getActiveUsers(5)
  ]);

  const initialQuestions = questionsResponse.data;
  const initialPaginationMeta = questionsResponse.meta;

  return (
    <HomeContent 
      initialQuestions={initialQuestions}
      initialPaginationMeta={initialPaginationMeta}
      initialActiveUsers={activeUsers}
    />
  );
}

