import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Question } from '@/services/api';

export function useQuestionDetails(slug: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
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
  };

  const refetchQuestion = async () => {
    await fetchQuestion();
  };

  const refetchAnswers = async () => {
    if (!question?.id) return;
    
    try {
      const answersData = await apiService.getQuestionAnswers(question.id);
      setAnswers(answersData.data || []);
    } catch (err) {
      console.error('Error fetching answers:', err);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [slug]);

  return {
    question,
    answers,
    isLoading,
    error,
    refetchQuestion,
    refetchAnswers
  };
}
