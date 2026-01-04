import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '@/services/api';
import { Category } from '@/services/types';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchCategoriesPaginated: (page: number, search?: string) => Promise<{ success: boolean; data?: Category[]; error?: string }>;
}

export function useCategories(limit?: number, fetchOnMount: boolean = true): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const currentLimitRef = useRef(limit);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getPopularCategories(currentLimitRef.current);
      setCategories(data);
    } catch (err) {
      console.error('useCategories: Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری دسته‌بندی‌ها');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoriesPaginated = async (page: number): Promise<{ success: boolean; data?: Category[]; error?: string }> => {
    try {
      const response = await apiService.getCategoriesPaginated(page);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری دسته‌بندی‌ها';
      return { success: false, error: errorMessage };
    }
  };

  // Update ref when limit changes
  useEffect(() => {
    currentLimitRef.current = limit;
  }, [limit]);

  // Fetch on mount or when limit changes
  useEffect(() => {
    if (fetchOnMount && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchCategories();
    } else if (fetchOnMount && hasFetchedRef.current && currentLimitRef.current !== limit) {
      // Refetch if limit changes after initial mount
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, fetchOnMount]); // fetchCategories is stable now

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    fetchCategoriesPaginated,
  };
}
