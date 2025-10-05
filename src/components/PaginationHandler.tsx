'use client';

import { useRouter } from 'next/navigation';
import { BasePagination } from '@/components/ui/BasePagination';
import { PaginatedResponse, Tag } from '@/services/types';

interface PaginationHandlerProps {
  pagination: PaginatedResponse<Tag>['meta'];
  currentPage?: number;
}

export function PaginationHandler({ pagination }: PaginationHandlerProps) {
  const router = useRouter();
  
  const handlePageChange = (page: number) => {
    if (pagination && page === pagination.current_page) return;
    
    const url = page > 1 ? `/tags?page=${page}` : '/tags';
    router.push(url);
  };

  if (!pagination || pagination.last_page <= 1) return null;

  return (
    <div className="mt-8">
      <BasePagination
        currentPage={pagination.current_page}
        totalPages={pagination.last_page}
        total={pagination.total}
        perPage={pagination.per_page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
