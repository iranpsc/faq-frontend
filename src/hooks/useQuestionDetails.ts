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
      const questionData = await apiService.getQuestionBySlug(slug);
      setQuestion(questionData);
      
      // Fetch answers for the question
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
  }, [fetchQuestion, fetchOnMount, initialState]); // Include all dependencies

  return {
    question,
    answers,
    isLoading,
    error,
    refetchQuestion,
    refetchAnswers
  };
}
