'use client';

import { useState, useEffect, useCallback } from 'react';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { BaseButton } from '@/components/ui/BaseButton';
import { BaseAlert } from '@/components/ui/BaseAlert';
import { apiService, DailyActivity } from '@/services/api';
import Link from 'next/link';
import { Eye, Clock, Tag as TagIcon, Calendar } from 'lucide-react';

interface ActivityWithMonth extends DailyActivity {
  month?: string;
}

interface GroupedActivities {
  [month: string]: ActivityWithMonth[];
}

interface ActivityPageContentProps {
  initialActivities: ActivityWithMonth[];
  initialGroupedActivities: GroupedActivities;
}

export function ActivityPageContent({
  initialActivities,
  initialGroupedActivities
}: ActivityPageContentProps) {
  const [activities, setActivities] = useState<ActivityWithMonth[]>(initialActivities);
  const [groupedActivities, setGroupedActivities] = useState<GroupedActivities>(initialGroupedActivities);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchActivities = useCallback(async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setActivities([]);
        setGroupedActivities({});
        setCurrentOffset(0);
      }

      setError(null);

      const response = await apiService.getActivity({
        months: 3,
        offset: append ? currentOffset + 3 : 0,
        questions_limit: 10,
        answers_limit: 8,
        comments_limit: 5
      });

      if (response.success) {
        const newActivities = response.data as ActivityWithMonth[];

        if (append) {
          setActivities(prev => [...prev, ...newActivities]);
          setGroupedActivities(prev => {
            const newGrouped = { ...prev };
            newActivities.forEach(activity => {
              if (activity.month) {
                if (!newGrouped[activity.month]) {
                  newGrouped[activity.month] = [];
                }
                newGrouped[activity.month].push(activity);
              }
            });
            return newGrouped;
          });
          setCurrentOffset(prev => prev + 3);
        } else {
          setActivities(newActivities);
          const newGrouped: GroupedActivities = {};
          newActivities.forEach(activity => {
            if (activity.month) {
              if (!newGrouped[activity.month]) {
                newGrouped[activity.month] = [];
              }
              newGrouped[activity.month].push(activity);
            }
          });
          setGroupedActivities(newGrouped);
          setCurrentOffset(0);
        }

        // Check if there are more activities to load
        // Each month should have around 23 activities (10 questions + 8 answers + 5 comments)
        const expectedActivitiesPerMonth = 23;
        setHasMore(newActivities.length >= expectedActivitiesPerMonth);
      } else {
        throw new Error(response.error || 'خطا در دریافت فعالیت‌ها');
      }
    } catch (err: unknown) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'خطا در دریافت فعالیت‌ها');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [currentOffset]);

  const loadMore = () => {
    fetchActivities(true);
  };

  // Load initial data if not provided
  useEffect(() => {
    if (initialActivities.length === 0 && Object.keys(initialGroupedActivities).length === 0) {
      fetchActivities();
    }
  }, [fetchActivities, initialActivities.length, initialGroupedActivities]);

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      question: 'سوال',
      answer: 'پاسخ',
      comment: 'نظر'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getActivityBadgeVariant = (type: string) => {
    const variants = {
      question: 'primary' as const,
      answer: 'success' as const,
      comment: 'warning' as const
    };
    return variants[type as keyof typeof variants] || 'secondary' as const;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'همین الان' : `${diffInMinutes} دقیقه پیش`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ساعت پیش`;
    } else {
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">فعالیت ها</h1>
          {activities.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{activities.length} فعالیت بارگذاری شده</span>
              {hasMore && (
                <span className="text-blue-600 dark:text-blue-400">• بیشتر موجود است</span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Activities List */}
        {!loading && Object.keys(groupedActivities).length > 0 && (
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([month, monthActivities]) => (
              <div key={month} className="space-y-4">
                {/* Month Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      {month}
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                </div>

                {/* Activities for this month */}
                <div className="space-y-4">
                  {monthActivities.map((activity, index) => (
                    <div
                      key={`${activity.id}_${activity.type}_${index}`}
                      className="bg-white flex dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 hover:transform hover:-translate-y-1"
                    >
                      <div className="flex  items-start gap-4">
                        {/* User Avatar */}
                        <BaseAvatar
                          src={activity.user_image}
                          name={activity.user_name}
                          size="md"
                        />

                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          {/* Activity Description */}
                          <p className="text-gray-900 dark:text-gray-100 mb-2">
                            {activity.description}
                          </p>


                        </div>
                      </div>
                      {/* Activity Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {/* Activity Type Badge */}
                        <BaseBadge
                          variant={getActivityBadgeVariant(activity.type)}
                          size="xs"
                        >
                          {getActivityTypeLabel(activity.type)}
                        </BaseBadge>

                        {/* Correct Answer Badge */}
                        {activity.type === 'answer' && activity.is_correct && (
                          <BaseBadge
                            variant="success"
                            size="xs"
                          >
                            پاسخ صحیح
                          </BaseBadge>
                        )}

                        {/* Category */}
                        {activity.category_name && (
                          <span className="flex items-center gap-1">
                            <TagIcon className="w-4 h-4" />
                            sdfgsdfgsdfgsdfg
                          </span>
                        )}

                        {/* Time */}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          gsdfgsdfg sdfg sdfg sdfg sd
                        </span>
                      </div>

                      {/* View Link */}
                      {activity.url && (
                        <div className="mt-3">
                          <Link
                            href={activity.url}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                          >
                            مشاهده
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && Object.keys(groupedActivities).length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Clock className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">فعالیتی یافت نشد</h2>
            </div>
          </div>
        )}

        {/* Load More Button - Page Bottom */}
        {activities.length > 0 && hasMore && (
          <div className="mt-12 mb-8">
            <div className="flex justify-center">
              <BaseButton
                onClick={loadMore}
                variant="ghost"
                size="lg"
                disabled={loadingMore}
                className="min-w-[200px] h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    <span className="text-sm">در حال بارگذاری...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="text-sm font-bold">بارگذاری بیشتر</span>
                  </div>
                )}
              </BaseButton>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <BaseAlert
            variant="error"
            className="mt-4"
          >
            {error}
          </BaseAlert>
        )}
      </div>
    </div>
  );
}
