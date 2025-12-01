import { useGetEnrichedProfileQuery } from '@/feature/profile/profileApiSlice';
import type { EnrichedProfile } from '../types';

interface UseEnrichedProfileReturn {
  profile: EnrichedProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch enriched profile data by user ID
 * Uses RTK Query for automatic caching and refetching
 * @param userId - The user ID to fetch profile for
 * @returns Profile data, loading state, error, and refetch function
 */
export const useEnrichedProfile = (userId: string | null): UseEnrichedProfileReturn => {
  const { data, isLoading, error, refetch } = useGetEnrichedProfileQuery(userId || '', {
    skip: !userId, // Skip if no userId provided
  });

  const profile = data?.data || (data as any) || null;
  const errorMessage = error ? ((error as any)?.data?.message || (error as any)?.message || 'Failed to fetch profile') : null;

  return {
    profile,
    loading: isLoading,
    error: errorMessage,
    refetch: () => refetch(),
  };
};
