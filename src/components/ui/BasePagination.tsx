'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BasePaginationProps extends HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export const BasePagination = forwardRef<HTMLDivElement, BasePaginationProps>(
  ({ currentPage, totalPages, total, perPage, onPageChange, className, ...props }, ref) => {
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(currentPage * perPage, total);

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div
        ref={ref}
        className={clsx('flex flex-col sm:flex-row items-center justify-between gap-4', className)}
        {...props}
      >
        {/* Results info */}
        <div className="text-sm text-gray-700 dark:text-gray-300">
          نمایش {startItem} تا {endItem} از {total} نتیجه
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={clsx(
              'flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors',
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <ChevronRight className="w-4 h-4" />
            قبلی
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={clsx(
                  'px-3 py-2 text-sm rounded-lg transition-colors',
                  page === '...'
                    ? 'text-gray-400 cursor-default'
                    : page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={clsx(
              'flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors',
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            بعدی
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
);

BasePagination.displayName = 'BasePagination';
