import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services';
import type { EnrichedProfile } from '../types';

interface UseEnrichedProfileReturn {
  profile: EnrichedProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch enriched profile data by user ID
 * @param userId - The user ID to fetch profile for
 * @returns Profile data, loading state, error, and refetch function
 */
export const useEnrichedProfile = (userId: string | null): UseEnrichedProfileReturn => {
  const [profile, setProfile] = useState<EnrichedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      fetchedUserIdRef.current = null;
      return;
    }

    // Prevent duplicate requests for the same user
    if (fetchedUserIdRef.current === userId) {
      console.log('[useEnrichedProfile] Profile already fetched for user:', userId);
      return;
    }

    // Prevent concurrent requests
    if (isFetchingRef.current) {
      console.log('[useEnrichedProfile] Request already in progress for user:', userId);
      return;
    }

    console.log('[useEnrichedProfile] Fetching profile for user:', userId);
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getEnrichedProfile(userId);
      
      if (response.success && response.data) {
        setProfile(response.data);
        fetchedUserIdRef.current = userId;
        console.log('[useEnrichedProfile] Profile fetched successfully for user:', userId);
      } else {
        setError(response.error || 'Failed to fetch profile');
        setProfile(null);
        console.error('[useEnrichedProfile] Failed to fetch profile:', response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      setError(errorMessage);
      setProfile(null);
      console.error('[useEnrichedProfile] Error fetching profile:', errorMessage);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId]);

  useEffect(() => {
    // Only fetch if we haven't already fetched this user's profile
    if (userId && fetchedUserIdRef.current !== userId) {
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
};
