'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCard } from './StatsCard';
import { QuestionListCard } from './QuestionListCard';
import { Question } from '@/services/api';

interface StatsData {
  totalQuestions: number;
  totalAnswers: number;
  totalUsers: number;
  solvedQuestions: number;
}

export function HomeSidebar() {
  const router = useRouter();
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [isPopularLoading, setIsPopularLoading] = useState(false);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  
  // Mock data - in real implementation, these would come from API calls
  const [stats, setStats] = useState<StatsData>({
    totalQuestions: 0,
    totalAnswers: 0,
    totalUsers: 0,
    solvedQuestions: 0
  });
  
  const [recommendedQuestions, setRecommendedQuestions] = useState<Question[]>([]);
  const [popularQuestions, setPopularQuestions] = useState<Question[]>([]);

  const handleQuestionClick = (question: Question) => {
    router.push(`/questions/${question.slug}`);
  };

  const fetchStats = async () => {
    setIsDashboardLoading(true);
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalQuestions: 1234,
        totalAnswers: 5678,
        totalUsers: 890,
        solvedQuestions: 456
      });
    } finally {
      setIsDashboardLoading(false);
    }
  };

  const fetchRecommendedQuestions = async () => {
    setIsRecommendedLoading(true);
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setRecommendedQuestions([
        {
          id: '1',
          title: 'چگونه در React از useState استفاده کنم؟',
          content: 'من می‌خواهم بدانم چگونه از useState در React استفاده کنم...',
          slug: 'react-usestate-guide',
          views_count: 150,
          answers_count: 5,
          votes_count: 12,
          is_solved: true,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          user: {
            id: '1',
            name: 'علی احمدی',
            image_url: undefined
          },
          tags: []
        },
        {
          id: '2',
          title: 'تفاوت بین let و const در JavaScript چیست؟',
          content: 'می‌خواهم تفاوت بین let و const را بدانم...',
          slug: 'javascript-let-const-difference',
          views_count: 200,
          answers_count: 8,
          votes_count: 15,
          is_solved: false,
          created_at: '2024-01-14T15:20:00Z',
          updated_at: '2024-01-14T15:20:00Z',
          user: {
            id: '2',
            name: 'مریم رضایی',
            image_url: undefined
          },
          tags: []
        }
      ]);
    } finally {
      setIsRecommendedLoading(false);
    }
  };

  const fetchPopularQuestions = async () => {
    setIsPopularLoading(true);
    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 600));
      setPopularQuestions([
        {
          id: '3',
          title: 'بهترین روش‌های بهینه‌سازی عملکرد React',
          content: 'چه روش‌هایی برای بهینه‌سازی عملکرد React وجود دارد؟',
          slug: 'react-performance-optimization',
          views_count: 500,
          answers_count: 12,
          votes_count: 25,
          is_solved: true,
          created_at: '2024-01-13T09:15:00Z',
          updated_at: '2024-01-13T09:15:00Z',
          user: {
            id: '3',
            name: 'حسن محمدی',
            image_url: undefined
          },
          tags: []
        },
        {
          id: '4',
          title: 'چگونه در Next.js از API Routes استفاده کنم؟',
          content: 'می‌خواهم API Routes در Next.js را یاد بگیرم...',
          slug: 'nextjs-api-routes-guide',
          views_count: 300,
          answers_count: 6,
          votes_count: 18,
          is_solved: false,
          created_at: '2024-01-12T14:45:00Z',
          updated_at: '2024-01-12T14:45:00Z',
          user: {
            id: '4',
            name: 'فاطمه کریمی',
            image_url: undefined
          },
          tags: []
        }
      ]);
    } finally {
      setIsPopularLoading(false);
    }
  };

  useEffect(() => {
    // Load all sidebar data
    Promise.all([
      fetchStats(),
      fetchRecommendedQuestions(),
      fetchPopularQuestions()
    ]);
  }, []);

  return (
    <aside className="w-full h-full overflow-y-auto sidebar-scrollbar">
      <div className="space-y-6">
        {/* Statistics Card */}
        <StatsCard
          stats={stats}
          isLoading={isDashboardLoading}
        />

        {/* Recommended Questions */}
        <QuestionListCard
          title="مطالب پیشنهادی"
          questions={recommendedQuestions}
          isLoading={isRecommendedLoading}
          onQuestionClick={handleQuestionClick}
        />

        {/* Popular Questions */}
        <QuestionListCard
          title="سوالات پربازدید هفته"
          questions={popularQuestions}
          isLoading={isPopularLoading}
          onQuestionClick={handleQuestionClick}
        />
      </div>
    </aside>
  );
}
