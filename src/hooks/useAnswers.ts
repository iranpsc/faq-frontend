import { useState } from 'react';
import { apiService } from '@/services/api';

export function useAnswers() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const addAnswer = async (questionId: string, content: string) => {
    setIsSubmitting(true);
    try {
      const result = await apiService.addAnswer(questionId, content);
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ایجاد پاسخ' 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAnswer = async (answerId: string, content: string) => {
    setIsUpdating(true);
    try {
      const result = await apiService.updateAnswer(answerId, content);
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در ویرایش پاسخ' 
      };
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAnswer = async (answerId: string) => {
    setIsDeleting(answerId);
    try {
      const result = await apiService.deleteAnswer(answerId);
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در حذف پاسخ' 
      };
    } finally {
      setIsDeleting(null);
    }
  };

  const publishAnswer = async (answerId: string) => {
    try {
      const result = await apiService.publishAnswer(answerId);
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در انتشار پاسخ' 
      };
    }
  };

  const toggleAnswerCorrectness = async (answerId: string) => {
    try {
      const result = await apiService.toggleAnswerCorrectness(answerId);
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در تغییر وضعیت صحیح بودن پاسخ' 
      };
    }
  };

  const fetchAnswers = async (questionId: string, page: number = 1, filter?: string) => {
    try {
      const response = await apiService.getQuestionAnswers(questionId, page);
      return { success: true, data: response.data, meta: response.meta };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'خطا در بارگذاری پاسخ‌ها' 
      };
    }
  };

  return {
    isSubmitting,
    isUpdating,
    isDeleting,
    addAnswer,
    updateAnswer,
    deleteAnswer,
    publishAnswer,
    toggleAnswerCorrectness,
    fetchAnswers
  };
}
