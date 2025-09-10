import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Category } from '@/services/types';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchCategoriesPaginated: (page: number, search?: string) => Promise<{ success: boolean; data?: Category[]; error?: string }>;
}

export function useCategories(limit?: number): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getPopularCategories(limit);
      setCategories(data);
    } catch (err) {
      console.error('useCategories: Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری دسته‌بندی‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoriesPaginated = async (page: number, search?: string): Promise<{ success: boolean; data?: Category[]; error?: string }> => {
    try {
      const response = await apiService.getCategoriesPaginated(page);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری دسته‌بندی‌ها';
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [limit]);

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    fetchCategoriesPaginated,
  };
}
