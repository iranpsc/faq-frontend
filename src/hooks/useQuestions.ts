import { useState, useEffect, useCallback } from 'react';
import { apiService, Question, PaginatedResponse } from '@/services/api';

interface UseQuestionsParams {
  page?: number;
  category_id?: string;
  search?: string;
  sort?: string;
  order?: string;
  tags?: string;
  filter?: string;
}

interface UseQuestionsReturn {
  questions: Question[];
  pagination: {
    meta: {
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
    };
  } | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  refetch: (params?: UseQuestionsParams) => Promise<void>;
  createQuestion: (questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: string[];
  }) => Promise<{ success: boolean; data?: Question; error?: string }>;
  updateQuestion: (id: string, questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: string[];
  }) => Promise<{ success: boolean; data?: Question; error?: string }>;
}

// Use a stable default object to avoid creating a new reference on every render
const DEFAULT_PARAMS: UseQuestionsParams = {};

type InitialQuestionsState = {
  questions?: Question[];
  pagination?: {
    meta: {
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
    };
  } | null;
};

export function useQuestions(
  initialParams: UseQuestionsParams = DEFAULT_PARAMS,
  fetchOnMount: boolean = true,
  initialState?: InitialQuestionsState
): UseQuestionsReturn {
  const [questions, setQuestions] = useState<Question[]>(initialState?.questions ?? []);
  const [pagination, setPagination] = useState<{
    meta: {
      current_page: number;
      last_page: number;
      total: number;
      per_page: number;
    };
  } | null>(initialState?.pagination ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(fetchOnMount && !initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (params: UseQuestionsParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response: PaginatedResponse<Question> = await apiService.getQuestions({
        ...initialParams,
        ...params,
      });
      setQuestions(response.data);
      setPagination({
        meta: response.meta,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری سوالات');
    } finally {
      setIsLoading(false);
    }
  }, [initialParams]);

  const createQuestion = async (questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: string[];
  }): Promise<{ success: boolean; data?: Question; error?: string }> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert string array to API expected format
      const apiData = {
        ...questionData,
        tags: questionData.tags?.map(tag => ({ name: tag }))
      };
      
      const result = await apiService.createQuestion(apiData);
      
      if (result.success && result.data) {
        // Add the new question to the beginning of the list
        setQuestions(prev => [result.data!, ...prev]);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در ایجاد سوال';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateQuestion = async (id: string, questionData: {
    title: string;
    content: string;
    category_id: string;
    tags?: string[];
  }): Promise<{ success: boolean; data?: Question; error?: string }> => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Convert string array to API expected format
      const apiData = {
        ...questionData,
        tags: questionData.tags?.map(tag => ({ name: tag }))
      };
      
      const result = await apiService.updateQuestion(id, apiData);
      
      if (result.success && result.data) {
        // Update the question in the list
        setQuestions(prev => 
          prev.map(q => q.id === id ? result.data! : q)
        );
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در ویرایش سوال';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (fetchOnMount) {
      fetchQuestions();
    }
  }, [fetchQuestions, fetchOnMount]);

  return {
    questions,
    pagination,
    isLoading,
    isSubmitting,
    error,
    refetch: fetchQuestions,
    createQuestion,
    updateQuestion,
  };
}
