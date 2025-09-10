import { useState, useEffect } from 'react';
import { apiService, User } from '@/services/api';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUsers(limit?: number): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, [limit]);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
  };
}
