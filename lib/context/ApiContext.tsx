'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { apiService } from '../services';
import { saveAuthTokens, saveUser, getAuthTokens, getUser, clearAuthData, isAccessTokenExpired } from '../utils';
import type {
  ApiResponse,
  AuthPayload,
  User,
  BasicDetailsPayload,
  AuthResponse,
  AuthTokens,
  EmailRegistrationPayload,
  CompleteUserPayload,
  SendOTPPayload,
  ProfilePayload,
  ProfileUpdatePayload,
  EnrichedProfile,
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
  registerWithEmail: (payload: EmailRegistrationPayload) => Promise<ApiResponse<AuthResponse>>;
  createCompleteUser: (payload: CompleteUserPayload) => Promise<ApiResponse<User>>;
  sendOTP: (payload: SendOTPPayload) => Promise<ApiResponse<{ message: string }>>;
  loginUser: (phoneNumber: string) => Promise<ApiResponse<User>>;
  loginWithEmail: (email: string, password: string) => Promise<ApiResponse<AuthResponse>>;
  refreshTokens: () => Promise<ApiResponse<AuthResponse>>;
  getUserProfile: (userId: string) => Promise<ApiResponse<User>>;
  getEnrichedProfile: (userId: string) => Promise<ApiResponse<EnrichedProfile>>;
  completeBasicDetails: (userId: string, payload: BasicDetailsPayload) => Promise<ApiResponse<AuthResponse>>;
  updateUser: (userId: string, payload: Partial<User>) => Promise<ApiResponse<User>>;
  createProfile: (payload: ProfilePayload) => Promise<ApiResponse<unknown>>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<ApiResponse<User>>;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

export const ApiContext = createContext<ApiContextType | undefined>(undefined);

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
      // Set the auth token in the API service for authenticated requests
      apiService.setAuthToken(storedTokens.accessToken);
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
      // Set both access and refresh tokens in the API service
      apiService.setTokens(tokens.accessToken, tokens.refreshToken);
    } else {
      // Clear all tokens from the API service
      apiService.clearTokens();
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
    console.log('[ApiContext] Logging out user');
    setState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
    clearAuthData();
    // Reset API service authentication state
    apiService.resetAuth();
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

  const createCompleteUser = useCallback(async (payload: CompleteUserPayload): Promise<ApiResponse<User>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.createCompleteUser(payload);

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'User creation failed');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'User creation failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setError]);

  const registerWithEmail = useCallback(async (payload: EmailRegistrationPayload): Promise<ApiResponse<AuthResponse>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.registerWithEmail(payload);

      if (response.success && response.data) {
        setUser(response.data.user);
        setTokens(response.data.tokens);
      } else {
        setError(response.error || 'Email registration failed');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setTokens, setError]);

  const sendOTP = useCallback(async (payload: SendOTPPayload): Promise<ApiResponse<{ message: string }>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.sendOTP(payload);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);


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

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.loginWithEmail(email, password);

      if (response.success && response.data) {
        setUser(response.data.user);
        setTokens(response.data.tokens);
      } else {
        setError(response.error || 'Email login failed');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setTokens, setError]);

  const refreshTokens = useCallback(async (): Promise<ApiResponse<AuthResponse>> => {
    setLoading(true);
    clearError();

    try {
      if (!state.tokens?.refreshToken) {
        const errorMessage = 'No refresh token available';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const response = await apiService.refreshAccessToken(state.tokens.refreshToken);

      if (response.success && response.data) {
        setUser(response.data.user);
        setTokens(response.data.tokens);
        console.log('[ApiContext] Tokens refreshed successfully');
      } else {
        setError(response.error || 'Token refresh failed');
        // If refresh fails, logout the user
        logout();
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      setError(errorMessage);
      // If refresh fails, logout the user
      logout();
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setTokens, setError, state.tokens?.refreshToken, logout]);

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

  const getEnrichedProfile = useCallback(async (userId: string): Promise<ApiResponse<EnrichedProfile>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.getEnrichedProfile(userId);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch enriched profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

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


  const updateUser = useCallback(async (userId: string, payload: Partial<User>): Promise<ApiResponse<User>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.updateUser(userId, payload);
      
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        setError(response.error || 'Failed to update user');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setError]);

  const createProfile = useCallback(async (payload: ProfilePayload): Promise<ApiResponse<unknown>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.createProfile(payload);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload): Promise<ApiResponse<User>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.updateProfile(payload);

      if (response.success && response.data) {
        setUser(response.data); // Update user in context
      } else {
        setError(response.error || 'Failed to update profile');
      }

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setUser, setError]);

  const value: ApiContextType = {
    ...state,
    registerUser,
    registerWithEmail,
    createCompleteUser,
    sendOTP,
    loginUser,
    loginWithEmail,
    refreshTokens,
    getUserProfile,
    getEnrichedProfile,
    completeBasicDetails,
    updateUser,
    createProfile,
    updateProfile,
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