import { STORAGE_KEYS } from '../constants';
import type { AuthTokens, User } from '../types';

/**
 * Storage utility functions
 * Handles localStorage operations with type safety
 */

/**
 * Save authentication tokens to localStorage
 */
export const saveAuthTokens = (tokens: AuthTokens): void => {
  try {
    console.log('[Storage] Saving auth tokens:', tokens);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
    console.log('[Storage] Auth tokens saved successfully');
  } catch (error) {
    console.error('[Storage] Failed to save auth tokens:', error);
  }
};

/**
 * Get authentication tokens from localStorage
 */
export const getAuthTokens = (): AuthTokens | null => {
  try {
    // authSlice stores tokens with keys 'accessToken' and 'refreshToken'
    // not as a single 'auth_tokens' object
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      const tokens = { accessToken, refreshToken };
      console.log('[Storage] Retrieved auth tokens:', 'Present');
      return tokens;
    }
    
    console.log('[Storage] Retrieved auth tokens:', 'Not found');
    return null;
  } catch (error) {
    console.error('[Storage] Failed to get auth tokens:', error);
    return null;
  }
};

/**
 * Remove authentication tokens from localStorage
 */
export const removeAuthTokens = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKENS);
  } catch (error) {
    console.error('Failed to remove auth tokens:', error);
  }
};

/**
 * Save user data to localStorage
 */
export const saveUser = (user: User): void => {
  try {
    console.log('[Storage] Saving user:', { id: user.id, username: user.username });
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    console.log('[Storage] User saved successfully');
  } catch (error) {
    console.error('[Storage] Failed to save user:', error);
  }
};

/**
 * Get user data from localStorage
 */
export const getUser = (): User | null => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    const parsed = user ? JSON.parse(user) : null;
    console.log('[Storage] Retrieved user:', parsed ? { id: parsed.id, username: parsed.username } : 'Not found');
    return parsed;
  } catch (error) {
    console.error('[Storage] Failed to get user:', error);
    return null;
  }
};

/**
 * Remove user data from localStorage
 */
export const removeUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Failed to remove user:', error);
  }
};

/**
 * Clear all auth-related data from localStorage
 */
export const clearAuthData = (): void => {
  removeAuthTokens();
  removeUser();
};

/**
 * Check if a token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error('[Storage] Failed to parse token:', error);
    return true; // Consider invalid tokens as expired
  }
};

/**
 * Check if access token is expired or will expire soon (within 5 minutes)
 */
export const isAccessTokenExpired = (tokens: AuthTokens | null): boolean => {
  if (!tokens?.accessToken) return true;
  
  try {
    const payload = JSON.parse(atob(tokens.accessToken.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = 5 * 60; // 5 minutes buffer
    return payload.exp < (currentTime + bufferTime);
  } catch (error) {
    console.error('[Storage] Failed to parse access token:', error);
    return true;
  }
};

/**
 * Get token expiration time in milliseconds
 */
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('[Storage] Failed to parse token expiration:', error);
    return null;
  }
};