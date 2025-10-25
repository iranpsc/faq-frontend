'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatsCard } from './StatsCard';
import { QuestionListCard } from './QuestionListCard';
import { Question, apiService } from '@/services/api';

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
      const dashboardStats = await apiService.getDashboardStats();
      setStats({
        totalQuestions: dashboardStats.totalQuestions,
        totalAnswers: dashboardStats.totalAnswers,
        totalUsers: dashboardStats.totalUsers,
        solvedQuestions: dashboardStats.solvedQuestions
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Keep default values on error
      setStats({
        totalQuestions: 0,
        totalAnswers: 0,
        totalUsers: 0,
        solvedQuestions: 0
      });
    } finally {
      setIsDashboardLoading(false);
    }
  };

  const loadRecommendedQuestions = async () => {
    setIsRecommendedLoading(true);
    try {
      const questions = await apiService.getRecommendedQuestions(15);
      setRecommendedQuestions(questions);
    } catch (error) {
      console.error('Failed to fetch recommended questions:', error);
      setRecommendedQuestions([]);
    } finally {
      setIsRecommendedLoading(false);
    }
  };

  const loadPopularQuestions = async () => {
    setIsPopularLoading(true);
    try {
      const questions = await apiService.getPopularQuestions(15, 'all');
      setPopularQuestions(questions);
    } catch (error) {
      console.error('Failed to fetch popular questions:', error);
      setPopularQuestions([]);
    } finally {
      setIsPopularLoading(false);
    }
  };

  useEffect(() => {
    // Load all sidebar data
    Promise.all([
      fetchStats(),
      loadRecommendedQuestions(),
      loadPopularQuestions()
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
          title="سوالات پربازدید"
          questions={popularQuestions}
          isLoading={isPopularLoading}
          onQuestionClick={handleQuestionClick}
        />
      </div>
    </aside>
  );
}
