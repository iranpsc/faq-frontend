'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { apiService } from '@/services/api';
import { VoteData } from '@/services/types';

interface VoteButtonsProps {
  resourceType: 'question' | 'answer' | 'comment';
  resourceId: string;
  questionId?: string;
  initialUpvotes: number | number[];
  initialDownvotes: number | number[];
  initialUserVote: string | null;
  size?: 'small' | 'medium';
  onVoteChanged?: (voteData: VoteData) => void;
}

export function VoteButtons({
  resourceType,
  resourceId,
  questionId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
  size = 'medium',
  onVoteChanged
}: VoteButtonsProps) {
  const { isAuthenticated, login } = useAuth();
  const { showAuthenticationDialog, fire } = useSweetAlert();
  const [isVoting, setIsVoting] = useState(false);
  const [activeVoteType, setActiveVoteType] = useState<'up' | 'down' | null>(null);
  const [hasVoted, setHasVoted] = useState(!!initialUserVote);

  // Handle different data types from API (count or array)
  const getVoteCount = (votes: number | number[]) => {
    if (Array.isArray(votes)) {
      return votes.length;
    }
    return typeof votes === 'number' ? votes : 0;
  };

  const [upvotes, setUpvotes] = useState(getVoteCount(initialUpvotes));
  const [downvotes, setDownvotes] = useState(getVoteCount(initialDownvotes));
  const [userVote, setUserVote] = useState(initialUserVote);

  // Keep internal state in sync with prop changes
  useEffect(() => { 
    setUpvotes(getVoteCount(initialUpvotes)); 
  }, [initialUpvotes]);
  
  useEffect(() => { 
    setDownvotes(getVoteCount(initialDownvotes)); 
  }, [initialDownvotes]);
  
  useEffect(() => { 
    setUserVote(initialUserVote);
    setHasVoted(!!initialUserVote);
  }, [initialUserVote]);

  // Get the actual resource ID to use
  const getResourceId = () => {
    // For legacy support, use questionId if provided and resourceType is question
    if (questionId && resourceType === 'question') {
      return questionId;
    }
    return resourceId;
  };

  const showLoginAlert = async () => {
    const handleLogin = async () => {
      try {
        await login();
      } catch (error) {
        console.error('Login error:', error);
        throw error; // Re-throw to let SweetAlert handle the error
      }
    };

    await showAuthenticationDialog(handleLogin);
  };

  const showErrorAlert = async (message: string) => {
    const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
    await fire({
      title: 'خطا',
      text: message,
      icon: 'error',
      confirmButtonText: 'باشه',
      background: isDark ? '#1f2937' : '#ffffff',
      color: isDark ? '#f9fafb' : '#171717',
      confirmButtonColor: isDark ? '#60a5fa' : '#3b82f6',
    });
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (isVoting) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      await showLoginAlert();
      return;
    }

    setIsVoting(true);
    setActiveVoteType(voteType);

    try {
      const actualResourceId = getResourceId();
      
      // Backend only supports adding votes, not removing them
      // If user already voted, show error message
      if (userVote) {
        await showErrorAlert('شما قبلا به این مورد رای داده‌اید');
        setIsVoting(false);
        setActiveVoteType(null);
        return;
      }

      const result = await apiService.vote(resourceType, actualResourceId, voteType);

      if (result.success) {
        // Update state from server response
        if (result.data) {
          setUpvotes(result.data.upvotes || 0);
          setDownvotes(result.data.downvotes || 0);
          setUserVote(result.data.user_vote);
          setHasVoted(!!result.data.user_vote);
        } else {
          // Fallback to local calculation
          setUserVote(voteType);
          setHasVoted(true);
          if (voteType === 'up') {
            setUpvotes(upvotes + 1);
          } else {
            setDownvotes(downvotes + 1);
          }
        }

        // Emit event to parent component
        onVoteChanged?.({
          upvotes: result.data?.upvotes || upvotes,
          downvotes: result.data?.downvotes || downvotes,
          userVote: result.data?.user_vote || voteType,
          user_vote: result.data?.user_vote || voteType, // Keep both for compatibility
          message: result.message || 'رای شما ثبت شد'
        });
      } else {
        // Handle error
        if (result.error === 'authentication') {
          await showLoginAlert();
        } else if (result.status === 409) {
          await showErrorAlert(result.message || 'شما قبلا به این مورد رای داده‌اید');
        } else if (result.error === 'rate_limit') {
          await showErrorAlert(result.message || 'شما خیلی سریع رای می‌دهید. لطفا کمی صبر کنید.');
        } else {
          await showErrorAlert(result.message || 'خطا در ثبت رای. لطفا دوباره تلاش کنید.');
        }
      }
    } catch (error: unknown) {
      console.error('Vote error:', error);

      // Check if it's a 401 authentication error
      const errorObj = error as Record<string, unknown>;
      const response = errorObj.response as Record<string, unknown>;
      if (response && response.status === 401) {
        await showLoginAlert();
      } else if (response && response.status === 429) {
        await showErrorAlert('شما خیلی سریع رای می‌دهید. لطفا کمی صبر کنید.');
      } else {
        await showErrorAlert('خطا در ثبت رای. لطفا دوباره تلاش کنید.');
      }
    } finally {
      setIsVoting(false);
      setActiveVoteType(null);
    }
  };

  return (
    <div className="vote-buttons flex items-center space-x-4 space-x-reverse">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting || hasVoted}
        className={`
          vote-btn upvote-btn
          flex items-center space-x-1 space-x-reverse
          ${size === 'small' ? 'px-2 py-1' : 'px-3 py-1.5'}
          rounded-lg transition-all duration-200
          hover:scale-105 active:scale-95
          ${userVote === 'up' 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }
          ${isVoting || hasVoted ? 'opacity-50 cursor-not-allowed' : ''}
          ${!isAuthenticated ? 'opacity-60' : ''}
          ${isVoting && activeVoteType === 'up' ? 'is-loading' : ''}
        `}
        title={userVote === 'up' ? 'حذف رای مثبت' : 'رای مثبت'}
      >
        {/* Upvote Icon (Thumbs Up) */}
        <svg className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
        <span className={size === 'small' ? 'text-xs font-medium' : 'text-sm font-medium'}>
          {upvotes}
        </span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('down')}
        disabled={isVoting || hasVoted}
        className={`
          vote-btn downvote-btn
          flex items-center space-x-1 space-x-reverse
          ${size === 'small' ? 'px-2 py-1' : 'px-3 py-1.5'}
          rounded-lg transition-all duration-200
          hover:scale-105 active:scale-95
          ${userVote === 'down' 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }
          ${isVoting || hasVoted ? 'opacity-50 cursor-not-allowed' : ''}
          ${!isAuthenticated ? 'opacity-60' : ''}
          ${isVoting && activeVoteType === 'down' ? 'is-loading' : ''}
        `}
        title={userVote === 'down' ? 'حذف رای منفی' : 'رای منفی'}
      >
        {/* Downvote Icon (Thumbs Down) */}
        <svg className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} fill="currentColor" viewBox="0 0 20 20">
          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
        </svg>
        <span className={size === 'small' ? 'text-xs font-medium' : 'text-sm font-medium'}>
          {downvotes}
        </span>
      </button>

      <style jsx>{`
        .vote-buttons {
          user-select: none;
        }

        .vote-btn {
          transition: all 0.2s ease-in-out;
          position: relative;
        }

        .vote-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .vote-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .vote-btn:disabled {
          transform: none;
          box-shadow: none;
        }

        /* Loading spinner only when explicitly loading */
        .vote-btn.is-loading::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          opacity: 0.6;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Hide the original icon only when loading */
        .vote-btn.is-loading svg {
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
