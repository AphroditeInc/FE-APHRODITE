import { useCallback, useMemo, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { isAccessTokenExpired } from '../utils';
import type { User, AuthTokens } from '../types';

/**
 * Authentication Hook Return Type
 */
interface UseAuthReturn {
  // User state
  user: User | null;
  tokens: AuthTokens | null;

  // Authentication status
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggedIn: boolean;

  // User role checks
  isClient: boolean;
  isRider: boolean;
  isDiva: boolean;
  isHunk: boolean;

  // Methods
  logout: () => void;
  refreshTokens: () => Promise<void>;

  // User info helpers
  userId: string | null;
  username: string | null;
  userType: string | null;
  phoneNumber: string | null;

  // Token helpers
  accessToken: string | null;
  refreshToken: string | null;
  hasValidToken: boolean;
  isTokenExpired: boolean;
}

/**
 * Custom Authentication Hook
 *
 * Provides easy access to authentication state and methods.
 * Includes helper functions for user role checks and token management.
 *
 * @example
 * ```tsx
 * const { isAuthenticated, user, logout, isClient } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <LoginPage />;
 * }
 *
 * return (
 *   <div>
 *     <p>Welcome, {user?.username}</p>
 *     {isClient && <ClientDashboard />}
 *     <button onClick={logout}>Logout</button>
 *   </div>
 * );
 * ```
 */
export const useAuth = (): UseAuthReturn => {
  const { user, tokens, isAuthenticated, isLoading, logout: logoutFn, refreshTokens: refreshTokensFn } = useApi();

  /**
   * Memoized logout function
   */
  const logout = useCallback(() => {
    logoutFn();
  }, [logoutFn]);

  /**
   * Memoized refresh tokens function
   */
  const refreshTokens = useCallback(async () => {
    try {
      await refreshTokensFn();
    } catch (error) {
      console.error('[useAuth] Token refresh failed:', error);
    }
  }, [refreshTokensFn]);

  /**
   * Memoized user role checks
   */
  const isClient = useMemo(() => user?.userType === 'client', [user?.userType]);
  const isRider = useMemo(() => user?.userType === 'rider', [user?.userType]);
  const isDiva = useMemo(() => user?.userType === 'diva', [user?.userType]);
  const isHunk = useMemo(() => user?.userType === 'hunk', [user?.userType]);

  /**
   * Memoized user info helpers
   */
  const userId = useMemo(() => user?.id || null, [user?.id]);
  const username = useMemo(() => user?.username || null, [user?.username]);
  const userType = useMemo(() => user?.userType || null, [user?.userType]);
  const phoneNumber = useMemo(() => user?.number || null, [user?.number]);

  /**
   * Memoized token helpers
   */
  const accessToken = useMemo(() => tokens?.accessToken || null, [tokens?.accessToken]);
  const refreshToken = useMemo(() => tokens?.refreshToken || null, [tokens?.refreshToken]);
  const hasValidToken = useMemo(() => !!tokens?.accessToken, [tokens?.accessToken]);
  const isTokenExpired = useMemo(() => isAccessTokenExpired(tokens), [tokens]);

  /**
   * Auto-refresh token when it's about to expire
   * Note: Disabled to prevent infinite loops - token refresh is handled by API service
   */
  // useEffect(() => {
  //   if (isAuthenticated && tokens && isTokenExpired) {
  //     console.log('[useAuth] Token is expired, attempting refresh...');
  //     refreshTokens();
  //   }
  // }, [isAuthenticated, tokens, isTokenExpired, refreshTokens]);

  return {
    // User state
    user,
    tokens,

    // Authentication status
    isAuthenticated,
    isLoading,
    isLoggedIn: isAuthenticated,

    // User role checks
    isClient,
    isRider,
    isDiva,
    isHunk,

    // Methods
    logout,
    refreshTokens,

    // User info helpers
    userId,
    username,
    userType,
    phoneNumber,

    // Token helpers
    accessToken,
    refreshToken,
    hasValidToken,
    isTokenExpired,
  };
};

/**
 * Hook to require authentication
 * Throws an error if user is not authenticated
 *
 * @example
 * ```tsx
 * const Dashboard = () => {
 *   const { user } = useRequireAuth();
 *   // user is guaranteed to exist here
 *   return <div>Welcome {user.username}</div>;
 * };
 * ```
 */
export const useRequireAuth = (): UseAuthReturn & { user: User } => {
  const auth = useAuth();

  if (!auth.isAuthenticated || !auth.user) {
    throw new Error('Authentication required. User must be logged in to access this resource.');
  }

  return auth as UseAuthReturn & { user: User };
};

/**
 * Hook to check if user has specific role
 *
 * @param requiredRole - The role to check for
 * @returns boolean indicating if user has the required role
 *
 * @example
 * ```tsx
 * const ClientDashboard = () => {
 *   const hasAccess = useHasRole('client');
 *
 *   if (!hasAccess) {
 *     return <AccessDenied />;
 *   }
 *
 *   return <Dashboard />;
 * };
 * ```
 */
export const useHasRole = (requiredRole: 'client' | 'rider' | 'diva' | 'hunk'): boolean => {
  const { user } = useAuth();
  return useMemo(() => user?.userType === requiredRole, [user?.userType, requiredRole]);
};