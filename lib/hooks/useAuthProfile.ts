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

  const user = data?.data?.user || (data && typeof data === 'object' && 'user' in data ? (data as { user: AuthProfileResponse['data']['user'] }).user : null) || null;
  const errorMessage = error 
    ? ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
        ? String(error.data.message)
        : 'message' in error
          ? String(error.message)
          : 'Failed to fetch profile')
    : null;

  return {
    user,
    loading: isLoading,
    error: errorMessage,
    refetch: () => refetch(),
  };
};
