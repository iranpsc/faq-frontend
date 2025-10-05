import { useState, useEffect, useCallback } from 'react';
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

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getActiveUsers(limit);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری کاربران');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchUsers();
    }
  }, [limit, fetchUsers, fetchOnMount]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
