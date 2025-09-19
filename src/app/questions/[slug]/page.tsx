"use client";

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { ContentArea } from '@/components/ContentArea';
import { HomeSidebar } from '@/components/HomeSidebar';
import { QuestionContent } from '@/components/question/QuestionContent';
// Lazy-load heavy sections to reduce initial bundle and speed up TTI
const DynamicCommentsSection = dynamic(
  () => import('../../../components/question/CommentsSection').then(m => m.CommentsSection),
  {
    // Keep it client-side and show lightweight placeholder
    ssr: false,
    loading: () => (
      <div className="mt-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-3" />
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    )
  }
);

const DynamicAnswersSection = dynamic(
  () => import('../../../components/question/AnswersSection').then(m => m.AnswersSection),
  {
    ssr: false,
    loading: () => (
      <div className="mt-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    )
  }
);
import { BaseAlert } from '@/components/ui/BaseAlert';
import { useQuestionDetails } from '../../../hooks/useQuestionDetails';
import { useSweetAlert } from '@/hooks/useSweetAlert';
// Lazy-load modal only when needed
const DynamicQuestionModal = dynamic(
  () => import('@/components/QuestionModal').then(m => m.QuestionModal),
  { ssr: false }
);
import { apiService, Question } from '@/services/api';

export default function QuestionDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { fire: swalFire, showLoading, close } = useSweetAlert();
  
  const {
    question,
    answers,
    isLoading,
    error,
    refetchQuestion,
    refetchAnswers
  } = useQuestionDetails(slug);

  const [isUpdating, setIsUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [componentKey, setComponentKey] = useState<number>(0);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update document title with question title
  useEffect(() => {
    if (question?.title) {
      document.title = question.title;
    }
  }, [question?.title]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showEditModal) {
        setShowEditModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEditModal]);

  const handleQuestionUpdated = async (updatedQuestion: Question) => {
    setIsUpdating(true);
    try {
      // slight delay similar to Vue to allow backend processing
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowEditModal(false);
      // Clear and refetch fresh data
      await refetchQuestion();
      await refetchAnswers();
      // Force child components to re-render
      setComponentKey(Date.now());
    } catch (err) {
      console.error('Error refreshing question after update:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAnswerAdded = async () => {
    await refetchAnswers();
  };

  const handleVoteChanged = (voteData: any) => {
    // Update question vote data in real-time
    if (question && question.votes) {
      (question as any).votes.upvotes = voteData.upvotes;
      (question as any).votes.downvotes = voteData.downvotes;
      (question as any).votes.score = voteData.upvotes - voteData.downvotes;
      (question as any).votes.user_vote = voteData.userVote;
    }
  };

  const handleAnswerVoteChanged = (voteData: any) => {
    // Update answer vote data in real-time
    if (voteData.type === 'answer') {
      const answerIndex = answers.findIndex((a: any) => a.id === voteData.id);
      if (answerIndex !== -1) {
        const existingAnswer = answers[answerIndex];
        const updatedAnswer = {
          ...existingAnswer,
          votes: voteData.votes
        };
        const newAnswers = [...answers];
        newAnswers[answerIndex] = updatedAnswer;
        // Note: We can't directly mutate the answers array from the hook
        // The hook should handle this update
      }
    }
  };

  const handleAnswerCorrectnessChanged = (data: any) => {
    console.log('Answer correctness changed:', data);
    
    // Update question solved status
    if (question) {
      const hasCorrectAnswer = answers.some((answer: any) => answer.is_correct);
      question.is_solved = hasCorrectAnswer;
    }
  };

  const handleAnswerCommentAdded = (commentData: any) => {
    console.log('Comment added to answer:', commentData);
  };

  const handleEdit = () => setShowEditModal(true);

  const handleDelete = useCallback(async () => {
    if (!question) return;
    
    // Check if question can be deleted (only unpublished questions)
    if (question.published) {
      await swalFire({
        title: 'خطا!',
        text: 'شما نمی‌توانید سوالات منتشر شده را حذف کنید. فقط سوالات منتشر نشده قابل حذف هستند.',
        icon: 'error',
        confirmButtonText: 'باشه'
      });
      return;
    }

    // Show confirmation dialog first
    const confirmResult = await swalFire({
      title: 'آیا مطمئن هستید؟',
      text: 'این عمل قابل بازگشت نیست! سوال و تمام پاسخ‌های آن حذف خواهد شد.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'بله، حذف کن!',
      cancelButtonText: 'لغو',
      reverseButtons: true
    });

    if (!confirmResult.isConfirmed) {
      return; // User cancelled
    }

    try {
      // Show loading state
      swalFire({
        title: 'در حال حذف...',
        text: 'لطفاً صبر کنید',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
      });
      showLoading();

      const result = await apiService.deleteQuestion(String(question.id));
      
      if (result.success) {
        // Show success message
        await swalFire({
          title: 'موفق!',
          text: 'سوال با موفقیت حذف شد.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true
        });
        
        // Redirect to home page
        router.push('/');
      } else {
        // Check if it's an authorization error
        const errorMessage = result.error || 'خطایی در حذف سوال رخ داد.';
        const isAuthError = errorMessage.includes('Unauthorized') || errorMessage.includes('Forbidden');
        
        await swalFire({
          title: 'خطا!',
          text: isAuthError 
            ? 'شما نمی‌توانید این سوال را حذف کنید. فقط سوالات منتشر نشده قابل حذف هستند.'
            : errorMessage,
          icon: 'error',
          confirmButtonText: 'باشه'
        });
      }
    } catch (e: any) {
      await swalFire({
        title: 'خطا!',
        text: e?.message || 'خطایی در حذف سوال رخ داد.',
        icon: 'error',
        confirmButtonText: 'باشه'
      });
    } finally {
      // Always close loading dialog
      close();
    }
  }, [question, router, swalFire, showLoading, close]);

  return (
    <ContentArea layout="with-sidebar" showSidebar={true} mainWidth="3/4" sidebarWidth="1/4" sidebar={<HomeSidebar />}>
      {/* Main Content */}
      <div className="w-full">
        {/* Loading State */}
        {isLoading && (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-16">
            <BaseAlert variant="error" message={error} />
          </div>
        )}

        {/* Question Content */}
        {!isLoading && !error && question && (
          <>
            {/* Updating Indicator */}
            {isUpdating && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 dark:text-blue-300">در حال بروزرسانی سوال...</span>
              </div>
            )}

            {/* Question Content */}
            <QuestionContent 
              key={`question-${question.id}-${componentKey}`}
              question={question} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onVote={handleVoteChanged}
              onVoteChanged={handleVoteChanged}
            />

            {/* Comments Section (lazy) */}
            <DynamicCommentsSection 
              key={`comments-${question.id}-${componentKey}`}
              questionId={question.id} 
              parentType="question"
              // Avoid heavy refetches; child manages its own state
              onCommentAdded={() => {}}
            />

            {/* Answers Section (lazy) */}
            <DynamicAnswersSection 
              key={`answers-${question.id}-${componentKey}`}
              questionId={question.id} 
              answers={answers}
              onAnswerAdded={handleAnswerAdded}
              onVoteChanged={handleAnswerVoteChanged}
              onAnswerCorrectnessChanged={handleAnswerCorrectnessChanged}
              onCommentAdded={handleAnswerCommentAdded}
            />
          </>
        )}
      </div>

      {/* Question Modal */}
      {showEditModal && question && (
        <DynamicQuestionModal 
          visible={showEditModal}
          questionToEdit={question as any}
          onClose={() => setShowEditModal(false)}
          onQuestionUpdated={handleQuestionUpdated}
        />
      )}
    </ContentArea>
  );
}
