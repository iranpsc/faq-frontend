import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, User } from '@/services/api';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUsers(limit?: number, fetchOnMount: boolean = true, initialUsers?: User[]): UseUsersReturn {
  const [users, setUsers] = useState<User[]>(initialUsers ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(fetchOnMount && !initialUsers);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const currentLimitRef = useRef(limit);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getActiveUsers(currentLimitRef.current);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری کاربران');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update ref when limit changes
  useEffect(() => {
    currentLimitRef.current = limit;
  }, [limit]);

  // Fetch on mount or when limit changes
  useEffect(() => {
    if (fetchOnMount && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUsers();
    } else if (fetchOnMount && hasFetchedRef.current && currentLimitRef.current !== limit) {
      // Refetch if limit changes after initial mount
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, fetchOnMount]); // fetchUsers is stable now

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
