'use client';

import { useRouter } from 'next/navigation';
import { BaseBadge } from './ui/BaseBadge';
import { BaseAlert } from './ui/BaseAlert';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/services/types';

interface PopularCategoriesProps {
  limit?: number;
  onCategoryClick?: (category: Category) => void;
  selectedCategory?: Category | null;
  className?: string;
}

export function PopularCategories({ 
  limit = 15, 
  onCategoryClick, 
  selectedCategory,
  className 
}: PopularCategoriesProps) {
  const router = useRouter();
  const { categories: popularCategories, isLoading, error } = useCategories(limit);



  const getCategoryVariant = (category: Category) => {
    if (selectedCategory && selectedCategory.id === category.id) {
      return 'primary';
    }
    return 'default';
  };

  const handleCategoryClick = (category: Category) => {
    onCategoryClick?.(category);
  };

  const goToCategories = () => {
    router.push('/categories');
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            دسته‌بندی‌ها
          </h2>
        </div>
      </div>


      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 15 }).map((_, n) => {
            // Use consistent widths to avoid hydration mismatch
            const widths = [120, 90, 110, 130, 85, 105, 95, 125, 100, 115, 88, 135, 92, 108, 118];
            return (
              <div
                key={`loading-${n}`}
                className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-7 px-3 py-1"
                style={{ width: `${widths[n % widths.length]}px` }}
              />
            );
          })}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="text-center py-4">
          <BaseAlert variant="error" message={error} />
        </div>
      )}

      {/* Categories */}
      {!isLoading && !error && popularCategories.length > 0 && (
        <div className="flex gap-2">
          <div className="flex flex-wrap gap-2">
            {popularCategories.map((category) => (
              <BaseBadge
                key={category.id}
                variant={getCategoryVariant(category)}
                size="sm"
                className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 px-6 py-2 border-2 border-gray-400 dark:border-gray-200"
                onClick={() => handleCategoryClick(category)}
              >
                {category.name}
              </BaseBadge>
            ))}
            <button
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-green-500 text-sm font-medium transition-colors px-6 py-2 border-2 border-gray-400 dark:border-gray-200"
              onClick={goToCategories}
              type="button"
            >
              مشاهده بیشتر
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && popularCategories.length === 0 && (
        <div className="text-center py-4">
          <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            هنوز دسته‌بندی محبوبی یافت نشد
          </p>
        </div>
      )}
    </div>
  );
}
