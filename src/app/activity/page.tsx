import { Suspense } from 'react';
import { ActivityPageContent } from './ActivityPageContent';

export default async function ActivityPage() {
  // For build time, return empty data to avoid API calls
  // The client component will handle data fetching at runtime
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری فعالیت‌ها...</p>
        </div>
      </div>
    }>
      <ActivityPageContent
        initialActivities={[]}
        initialGroupedActivities={{}}
      />
    </Suspense>
  );
}
