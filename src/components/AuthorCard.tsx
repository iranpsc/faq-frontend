'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User, Question } from '@/services/types';

interface AuthorCardProps {
  author: User;
  onClick?: (author: User) => void;
}

export function AuthorCard({ author, onClick }: AuthorCardProps) {
  const [imageError, setImageError] = useState(false);

  const authorImage = imageError || !author.image_url 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&size=64&background=3b82f6&color=fff&bold=true`
    : author.image_url;

  const formatNumber = (num: number = 0) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleQuestionClick = (question: Question) => {
    // Navigate to question detail page
    console.log('Question clicked:', question);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300
                 cursor-pointer transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
      onClick={() => onClick?.(author)}
    >
      {/* Author Header */}
      <div className="p-6">
        <div className="flex flex-col items-center space-y-2">
          {/* Avatar */}
          <div className="relative">
            <Image 
              src={authorImage} 
              alt={author.name} 
              width={64} 
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              onError={handleImageError}
            />
            {/* Level Badge */}
            <div className="absolute -bottom-1 -left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full
                          font-semibold shadow-lg border-2 border-white dark:border-gray-800">
              {author.level || author.level_name || '1'}
            </div>
          </div>

          {/* Author Name */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1 text-center">
            {author.name}
          </h3>

          {/* Score */}
          <div className="flex items-center">
            امتیاز:
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {author.score || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          {/* Questions Count */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatNumber(author.questions_count)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              سوالات
            </div>
          </div>

          {/* Answers Count */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatNumber(author.answers_count)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              پاسخ‌ها
            </div>
          </div>

          {/* Comments Count */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatNumber(author.comments_count)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              نظرات
            </div>
          </div>
        </div>
      </div>

      {/* Recent Questions Preview */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          آخرین سوالات:
        </h4>
        <div className="space-y-2">
          {author.recent_questions && author.recent_questions.length > 0 ? (
            <>
              {author.recent_questions.slice(0, 2).map((question) => (
                <div 
                  key={question.id} 
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
                           transition-colors duration-200 cursor-pointer truncate"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuestionClick(question);
                  }}
                  title={question.title}
                >
                  {question.title}
                </div>
              ))}
              {author.recent_questions.length > 2 && (
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  و {author.recent_questions.length - 2} سوال دیگر...
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              این کاربر هنوز سوالی نپرسیده است.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
