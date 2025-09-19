'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { ContentArea } from '@/components/ContentArea';
import { PopularCategories } from '@/components/PopularCategories';
import { FilterQuestion } from '@/components/FilterQuestion';
import { QuestionCard } from '@/components/QuestionCard';
import { UserCard } from '@/components/UserCard';
import { HomeSidebar } from '@/components/HomeSidebar';
import { BaseAlert } from '@/components/ui/BaseAlert';
import { BasePagination } from '@/components/ui/BasePagination';
import { BaseButton } from '@/components/ui/BaseButton';
import { useQuestions } from '@/hooks/useQuestions';
import { useUsers } from '@/hooks/useUsers';
import { Question, User, Category } from '@/services/api';

function HomeContent() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentFilters, setCurrentFilters] = useState({});

  // Use custom hooks for data fetching
  const {
    questions,
    pagination,
    isLoading,
    error,
    refetch: refetchQuestions
  } = useQuestions();

  const {
    users: activeUsers,
    isLoading: isLoadingUsers,
    error: userError
  } = useUsers(5);

  const handleFiltersChanged = (filters: any) => {
    setCurrentFilters(filters);
    refetchQuestions(filters);
  };

  const handleCategoryClick = (category: Category) => {
    if (selectedCategory && selectedCategory.id === category.id) {
      setSelectedCategory(null);
      handleFiltersChanged({ ...currentFilters, category_id: undefined });
    } else {
      setSelectedCategory(category);
      handleFiltersChanged({ ...currentFilters, category_id: category.id });
    }
  };


  const handleQuestionClick = (question: Question) => {
    // Navigation is handled by the Link component in QuestionCard
    console.log('Question clicked:', question);
  };

  const handlePageChange = (page: number) => {
    refetchQuestions({ ...currentFilters, page });
  };

  const landingImageUrl = '/assets/images/landing.png';

  return (
    <ContentArea 
      layout="with-sidebar" 
      showSidebar={true} 
      mainWidth="3/4" 
      sidebarWidth="1/4"
      hero={
        <div>
          <h1 className="text-center">
            انجمن حم بزرگترین انجمن پرسش و پاسخ ایران
          </h1>
          <div className="relative overflow-hidden rounded-lg shadow-sm">
            <Image
              src={landingImageUrl}
              alt="خوش آمدید به سیستم پرسش و پاسخ"
              width={1200}
              height={480}
              className="w-full h-auto object-cover"
              loading="eager"
              priority
              style={{ 
                aspectRatio: '1200/480', 
                contentVisibility: 'auto', 
                containIntrinsicSize: '1200px 480px', 
                objectFit: 'cover' 
              }}
            />
          </div>
        </div>
      }
      filters1={
        <PopularCategories 
          limit={15} 
          onCategoryClick={handleCategoryClick} 
          selectedCategory={selectedCategory}
          className="mb-6" 
        />
      }
      filters={<FilterQuestion onFiltersChanged={handleFiltersChanged} />}
      main={
        <div>
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 10 }).map((_, n) => (
                <div key={n} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                  <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <BaseAlert variant="error" message={error} />
          )}

          {/* Question List */}
          {!isLoading && !error && questions.length > 0 && (
            <div>
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onClick={handleQuestionClick}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination?.meta && (
                <div className="mt-8">
                  <BasePagination
                    currentPage={pagination.meta.current_page}
                    totalPages={pagination.meta.last_page}
                    total={pagination.meta.total}
                    perPage={pagination.meta.per_page}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && questions.length === 0 && (
            <div className="text-center py-16">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              <h2 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">سوالی یافت نشد</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">با پرسیدن اولین سوال شروع کنید.</p>
            </div>
          )}
        </div>
      }
      sidebar={<HomeSidebar />}
      footer={
        <div>
          {/* Most Active Users Section */}
          {!isLoading && questions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  فعالان انجمن
                </h2>
                <button 
                  className="border-2 border-blue-600 dark:border-blue-500 dark:text-blue-500 text-blue-600 md:text-xl rounded-xl px-4 py-2 rounded flex items-center"
                  onClick={() => {
                    router.push('/authors');
                  }}
                >
                  مشاهده بیشتر
                </button>
              </div>

              {/* Loading State for Active Users */}
              {isLoadingUsers && (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {Array.from({ length: 5 }).map((_, n) => (
                    <div key={n} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State for Active Users */}
              {!isLoadingUsers && userError && (
                <BaseAlert variant="error" message={userError} />
              )}

              {/* Active Users Grid */}
              {!isLoadingUsers && !userError && activeUsers.length > 0 && (
                <div className="grid gap-2 items-stretch" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                  {activeUsers.map((user) => (
                    <UserCard key={user.id} user={user} className="h-full flex flex-col" />
                  ))}
                </div>
              )}

              {/* Empty State for Active Users */}
              {!isLoadingUsers && !userError && activeUsers.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">هنوز کاربر فعالی یافت نشد</p>
                </div>
              )}
            </div>
          )}
        </div>
      }
    />
  );
}

export default function Home() {
  return <HomeContent />;
}

