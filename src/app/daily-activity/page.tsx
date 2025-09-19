'use client';

import { useState, useEffect, useCallback } from 'react';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { BaseButton } from '@/components/ui/BaseButton';
import { BaseAlert } from '@/components/ui/BaseAlert';
import { apiService, DailyActivity } from '@/services/api';
import Link from 'next/link';
import { Eye, Clock, Tag as TagIcon } from 'lucide-react';

export default function DailyActivityPage() {
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  const fetchActivities = useCallback(async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setActivities([]);
      }

      setError(null);

      const response = await apiService.getDailyActivity({
        limit: limit
      });

      if (response.success) {
        // Deduplicate activities by ID to prevent duplicate keys
        const deduplicatedData = response.data.filter((activity, index, self) => 
          index === self.findIndex(a => a.id === activity.id)
        );
        
        if (append) {
          setActivities(prev => {
            const combined = [...prev, ...deduplicatedData];
            // Also deduplicate the combined array
            return combined.filter((activity, index, self) => 
              index === self.findIndex(a => a.id === activity.id)
            );
          });
        } else {
          setActivities(deduplicatedData);
        }
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
  }, [limit]);

  const loadMore = () => {
    setLimit(prev => prev + 20);
    fetchActivities(true);
  };


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

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">فعالیت ها</h1>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Activities List */}
          {!loading && activities.length > 0 && (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={`${activity.id}_${activity.type}_${index}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200 hover:transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
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
                            {activity.category_name}
                          </span>
                        )}

                        {/* Time */}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(activity.created_at)}
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
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && activities.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Clock className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">فعالیتی یافت نشد</h2>
              </div>
            </div>
          )}

          {/* Load More Button */}
          {activities.length > 0 && activities.length >= limit && (
            <div className="text-center mt-8">
              <BaseButton
                onClick={loadMore}
                variant="ghost"
                size="lg"
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    در حال بارگذاری...
                  </div>
                ) : (
                  'بارگذاری بیشتر'
                )}
              </BaseButton>
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
