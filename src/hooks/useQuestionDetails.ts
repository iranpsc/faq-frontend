import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import { Question, Answer } from '@/services/types';

type InitialQuestionDetails = {
  question?: Question | null;
  answers?: Answer[];
};

export function useQuestionDetails(
  slug: string,
  fetchOnMount: boolean = true,
  initialState?: InitialQuestionDetails
) {
  const [question, setQuestion] = useState<Question | null>(initialState?.question ?? null);
  const [answers, setAnswers] = useState<Answer[]>(initialState?.answers ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = useCallback(async () => {
    if (!slug) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First fetch the question to get the ID
      const questionData = await apiService.getQuestionBySlug(slug);
      setQuestion(questionData);
      
      // Then fetch answers (sequential is necessary since we need question.id)
      // This is acceptable as we need the question ID first
      const answersData = await apiService.getQuestionAnswers(questionData.id);
      setAnswers(answersData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری سوال');
      console.error('Error fetching question:', err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const refetchQuestion = useCallback(async () => {
    await fetchQuestion();
  }, [fetchQuestion]);

  const refetchAnswers = useCallback(async () => {
    if (!question?.id) return;
    
    try {
      const answersData = await apiService.getQuestionAnswers(question.id);
      setAnswers(answersData.data || []);
    } catch (err) {
      console.error('Error fetching answers:', err);
    }
  }, [question?.id]);

  // Only fetch on mount if we don't have initial data and fetchOnMount is true
  useEffect(() => {
    if (fetchOnMount && !initialState) {
      fetchQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to avoid infinite loop

  return {
    question,
    answers,
    isLoading,
    error,
    refetchQuestion,
    refetchAnswers
  };
}
