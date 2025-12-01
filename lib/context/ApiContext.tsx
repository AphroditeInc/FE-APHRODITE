'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { apiService } from '../services';
import { saveAuthTokens, saveUser, getAuthTokens, getUser, clearAuthData, removeUser } from '../utils';
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
  SendMessagePayload,
  ChatMessage,
  ChatRoom,
  CreateRoomPayload,
  GetMessagesQuery,
  UpdateMessageStatusPayload,
  RoomStats,
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
  getUserProfile: (userId: string) => Promise<ApiResponse<User>>;
  completeBasicDetails: (userId: string, payload: BasicDetailsPayload) => Promise<ApiResponse<AuthResponse>>;
  updateUser: (userId: string, payload: Partial<User>) => Promise<ApiResponse<User>>;
  createProfile: (payload: ProfilePayload) => Promise<ApiResponse<unknown>>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<ApiResponse<User>>;
  // Chat methods
  sendMessage: (payload: SendMessagePayload) => Promise<ApiResponse<ChatMessage>>;
  getRoomMessages: (roomId: string, query?: GetMessagesQuery) => Promise<ApiResponse<ChatMessage[]>>;
  createRoom: (payload: CreateRoomPayload) => Promise<ApiResponse<ChatRoom>>;
  getUserRooms: (limit?: number, offset?: number) => Promise<ApiResponse<ChatRoom[]>>;
  getConversations: (limit?: number, offset?: number) => Promise<ApiResponse<ChatRoom[]>>;
  updateMessageStatus: (messageId: string, payload: UpdateMessageStatusPayload) => Promise<ApiResponse<ChatMessage>>;
  markRoomAsRead: (roomId: string) => Promise<ApiResponse<{ success: boolean }>>;
  getRoomUnreadCount: (roomId: string) => Promise<ApiResponse<{ count: number }>>;
  getRoomStats: (roomId: string) => Promise<ApiResponse<RoomStats>>;
  editMessage: (messageId: string, content: string) => Promise<ApiResponse<ChatMessage>>;
  deleteMessage: (messageId: string, hard?: boolean) => Promise<ApiResponse<{ success: boolean }>>;
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
    let storedUser = getUser();

    // Authentication is based on having valid tokens
    if (storedTokens) {
      console.log('[ApiContext] Found tokens, setting authenticated state');
      
      // If user exists but is invalid, clear it
      if (storedUser && !storedUser.id) {
        console.log('[ApiContext] Invalid user data found, clearing...');
        removeUser();
        storedUser = null;
      }
      
      // Check if user has valid ID, if not we'll fetch it
      const needsUserFetch = !storedUser || !storedUser.id;
      
      setState(prev => ({
        ...prev,
        tokens: storedTokens,
        user: storedUser && storedUser.id ? storedUser : null, // Only set if valid
        isAuthenticated: true,
        isLoading: needsUserFetch, // Keep loading if we need to fetch user
      }));
      // Set the auth token in the API service for authenticated requests
      apiService.setAuthToken(storedTokens.accessToken);
      console.log('[ApiContext] Authentication restored successfully');
      
      // If user is missing or doesn't have ID, fetch it
      if (needsUserFetch) {
        console.log('[ApiContext] User missing or invalid, fetching profile...');
        apiService.getAuthenticatedProfile()
          .then(response => {
            if (response.success && response.data) {
              console.log('[ApiContext] Profile fetched:', response.data);
              setState(prev => ({
                ...prev,
                user: response.data.user,
                isLoading: false,
              }));
              saveUser(response.data.user);
            } else {
              console.error('[ApiContext] Failed to fetch profile:', response.error);
              setState(prev => ({ ...prev, isLoading: false }));
            }
          })
          .catch(error => {
            console.error('[ApiContext] Error fetching profile:', error);
            setState(prev => ({ ...prev, isLoading: false }));
          });
      }
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
      // Set the auth token in the API service for authenticated requests
      apiService.setAuthToken(tokens.accessToken);
    } else {
      // Clear the auth token from the API service
      apiService.clearAuthToken();
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

  // ==================== CHAT METHODS ====================

  const sendMessage = useCallback(async (payload: SendMessagePayload): Promise<ApiResponse<ChatMessage>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.sendMessage(payload);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getRoomMessages = useCallback(async (roomId: string, query: GetMessagesQuery = {}): Promise<ApiResponse<ChatMessage[]>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.getRoomMessages(roomId, query);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const createRoom = useCallback(async (payload: CreateRoomPayload): Promise<ApiResponse<ChatRoom>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.createRoom(payload);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getUserRooms = useCallback(async (limit: number = 10, offset: number = 0): Promise<ApiResponse<ChatRoom[]>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.getUserRooms(limit, offset);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rooms';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getConversations = useCallback(async (limit: number = 10, offset: number = 0): Promise<ApiResponse<ChatRoom[]>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.getConversations(limit, offset);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversations';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const updateMessageStatus = useCallback(async (messageId: string, payload: UpdateMessageStatusPayload): Promise<ApiResponse<ChatMessage>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.updateMessageStatus(messageId, payload);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update message status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const markRoomAsRead = useCallback(async (roomId: string): Promise<ApiResponse<{ success: boolean }>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.markRoomAsRead(roomId);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark room as read';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getRoomUnreadCount = useCallback(async (roomId: string): Promise<ApiResponse<{ count: number }>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.getRoomUnreadCount(roomId);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch unread count';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const getRoomStats = useCallback(async (roomId: string): Promise<ApiResponse<RoomStats>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.getRoomStats(roomId);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch room stats';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const editMessage = useCallback(async (messageId: string, content: string): Promise<ApiResponse<ChatMessage>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.editMessage(messageId, content);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit message';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const deleteMessage = useCallback(async (messageId: string, hard: boolean = false): Promise<ApiResponse<{ success: boolean }>> => {
    setLoading(true);
    clearError();

    try {
      const response = await apiService.deleteMessage(messageId, hard);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setError]);

  const value: ApiContextType = {
    ...state,
    registerUser,
    registerWithEmail,
    createCompleteUser,
    sendOTP,
    loginUser,
    loginWithEmail,
    getUserProfile,
    completeBasicDetails,
    updateUser,
    createProfile,
    updateProfile,
    // Chat methods
    sendMessage,
    getRoomMessages,
    createRoom,
    getUserRooms,
    getConversations,
    updateMessageStatus,
    markRoomAsRead,
    getRoomUnreadCount,
    getRoomStats,
    editMessage,
    deleteMessage,
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