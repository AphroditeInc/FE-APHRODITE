import { useState, useEffect } from 'react';
import { apiService } from '../services/api.service';
import type { AuthProfileResponse } from '../types';

interface AuthProfileState {
  user: AuthProfileResponse['data']['user'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing authenticated user profile
 */
export const useAuthProfile = (): AuthProfileState => {
  const [user, setUser] = useState<AuthProfileResponse['data']['user'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getAuthenticatedProfile();
      
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        setError(response.message || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    user,
    loading,
    error,
    refetch: fetchProfile,
  };
};
