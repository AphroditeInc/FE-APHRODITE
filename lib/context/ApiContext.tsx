'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { apiService } from '../services';
import { saveAuthTokens, saveUser, getAuthTokens, getUser, clearAuthData } from '../utils';
import type {
  ApiResponse,
  AuthPayload,
  User,
  BasicDetailsPayload,
  AuthResponse,
  AuthTokens,
} from '../types';

interface ApiState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ApiContextType extends ApiState {
  registerUser: (payload: AuthPayload) => Promise<ApiResponse<User>>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<ApiResponse<User>>;
  loginUser: (phoneNumber: string) => Promise<ApiResponse<User>>;
  getUserProfile: (userId: string) => Promise<ApiResponse<User>>;
  completeBasicDetails: (userId: string, payload: BasicDetailsPayload) => Promise<ApiResponse<AuthResponse>>;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [state, setState] = useState<ApiState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading true
    error: null,
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration - run only on client after mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load tokens and user from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isHydrated) return;

    console.log('[ApiContext] Loading auth state from localStorage...');
    const storedTokens = getAuthTokens();
    const storedUser = getUser();

    // Authentication is based on having valid tokens
    if (storedTokens) {
      console.log('[ApiContext] Found tokens, setting authenticated state');
      setState(prev => ({
        ...prev,
        tokens: storedTokens,
        user: storedUser, // User might be null initially, that's ok
        isAuthenticated: true,
        isLoading: false,
      }));
      console.log('[ApiContext] Authentication restored successfully');
    } else if (storedUser) {
      // If we have user but no tokens, still load the user
      console.log('[ApiContext] Found user but no tokens, not authenticated');
      setState(prev => ({
        ...prev,
        user: storedUser,
        isLoading: false,
      }));
    } else {
      console.log('[ApiContext] No stored auth data found');
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [isHydrated]);

  const setUser = useCallback((user: User | null) => {
    setState(prev => ({ ...prev, user }));
    if (user) {
      saveUser(user);
    }
  }, []);

  const setTokens = useCallback((tokens: AuthTokens | null) => {
    console.log('[ApiContext] setTokens called with:', tokens);
    setState(prev => ({
      ...prev,
      tokens,
      isAuthenticated: !!tokens
    }));
    if (tokens) {
      saveAuthTokens(tokens);
    }
    console.log('[ApiContext] isAuthenticated set to:', !!tokens);
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    clearAuthData();
  }, []);

  const registerUser = useCallback(async (payload: AuthPayload): Promise<ApiResponse<User>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.registerUser(payload);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'Registration failed');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setError]);

  const verifyOTP = useCallback(async (phoneNumber: string, otp: string): Promise<ApiResponse<User>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.verifyOTP(phoneNumber, otp);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'OTP verification failed');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OTP verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setError]);

  const loginUser = useCallback(async (phoneNumber: string): Promise<ApiResponse<User>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.loginUser(phoneNumber);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'Login failed');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setError]);

  const getUserProfile = useCallback(async (userId: string): Promise<ApiResponse<User>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.getUserProfile(userId);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'Failed to fetch user profile');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setError]);

  const completeBasicDetails = useCallback(async (userId: string, payload: BasicDetailsPayload): Promise<ApiResponse<AuthResponse>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.completeBasicDetails(userId, payload);
      console.log('[ApiContext] completeBasicDetails response:', response);

      if (response.success && response.data) {
        console.log('[ApiContext] Storing user and tokens:', {
          user: response.data.user,
          tokens: response.data.tokens
        });
        // Store both user and tokens
        setUser(response.data.user);
        setTokens(response.data.tokens);
      } else {
        setError(response.error || 'Failed to complete basic details');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete basic details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setTokens, setError]);

  const value: ApiContextType = {
    ...state,
    registerUser,
    verifyOTP,
    loginUser,
    getUserProfile,
    completeBasicDetails,
    setUser,
    setTokens,
    setLoading,
    setError,
    clearError,
    logout,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};