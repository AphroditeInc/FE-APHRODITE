import { useGetAuthProfileQuery } from '@/feature/authentication/authApiSlice';
import type { AuthProfileResponse } from '../types';

interface AuthProfileState {
  user: AuthProfileResponse['data']['user'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for managing authenticated user profile
 * Uses RTK Query for automatic caching and refetching
 */
export const useAuthProfile = (): AuthProfileState => {
  const { data, isLoading, error, refetch } = useGetAuthProfileQuery(undefined, {
    skip: false, // Always fetch when hook is used
  });

  const user = data?.data?.user || (data as any)?.user || null;
  const errorMessage = error ? ((error as any)?.data?.message || (error as any)?.message || 'Failed to fetch profile') : null;

  return {
    user,
    loading: isLoading,
    error: errorMessage,
    refetch: () => refetch(),
  };
};
