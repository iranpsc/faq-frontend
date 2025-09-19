import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Tag, PaginatedResponse } from '@/services/types';

interface UseTagsParams {
  page?: number;
  search?: string;
  limit?: number;
  per_page?: number;
}

interface UseTagsReturn {
  tags: Tag[];
  pagination: PaginatedResponse<Tag>['meta'] | null;
  isLoading: boolean;
  error: string | null;
  refetch: (params?: UseTagsParams) => Promise<void>;
  addTag: (name: string) => Promise<Tag | null>;
  createTag: (name: string) => Promise<{ success: boolean; data?: Tag; error?: string }>;
}

export function useTags(initialParams: UseTagsParams = {}): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Tag>['meta'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async (params: UseTagsParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use paginated API if page is specified or per_page is set
      if (params.page || params.per_page || initialParams.page || initialParams.per_page) {
        const result = await apiService.getTagsPaginated({
          ...initialParams,
          ...params,
        });
        
        if (result.success) {
          setTags(result.data.data);
          setPagination(result.data.meta);
        } else {
          setError(result.error || 'خطا در بارگذاری برچسب‌ها');
        }
      } else {
        // Use simple API for backward compatibility
        const data = await apiService.getTags({
          ...initialParams,
          ...params,
        });
        setTags(data);
        setPagination(null);
      }
    } catch (err) {
      console.error('useTags: Error fetching tags:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری برچسب‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  const createTag = async (name: string): Promise<{ success: boolean; data?: Tag; error?: string }> => {
    try {
      const result = await apiService.createTag(name);
      if (result.success && result.data) {
        // Add the new tag to the current list
        setTags(prev => [...prev, result.data!]);
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'خطا در ایجاد برچسب' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در ایجاد برچسب';
      return { success: false, error: errorMessage };
    }
  };

  const addTag = async (name: string): Promise<Tag | null> => {
    // First check if tag already exists
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingTag) {
      return existingTag;
    }

    // Try to create new tag
    const result = await createTag(name);
    return result.success ? result.data || null : null;
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    pagination,
    isLoading,
    error,
    refetch: fetchTags,
    addTag,
    createTag,
  };
}
