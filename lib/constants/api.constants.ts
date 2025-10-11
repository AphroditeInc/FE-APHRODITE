/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  BASE_URL: "https://be-aphrodite-8wrp.onrender.com",
  TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/users",
    VERIFY_OTP: "/auth/verify-otp",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/password",
  },
  USERS: {
    PROFILE: (userId: string) => `/auth/users/${userId}`,
    BASIC_DETAILS: (userId: string) => `/auth/users/${userId}/basic-details`,
    UPDATE_PROFILE: (userId: string) => `/auth/users/${userId}`,
  },

  PROFILE: {
    PRICING: (userId: string) => `/profiles/${userId}/pricing`,
    SERVICES: (userId: string) => `/profiles/${userId}/services`,
    VIDEO: (userId: string) => `/profiles/${userId}/video-proof`,
    MEDIA: (userId: string) => `/profiles/${userId}/media`,
    REVIEWS: (userId: string) => `/profiles/${userId}/reviews`,
    FOLLOW: (userId: string) => `/profiles/${userId}/follow`,
    GET_REVIEWS: (userId: string) => `/profiles/${userId}/reviews`,
  },
} as const;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKENS: "auth_tokens",
  USER: "user",
  REFRESH_TOKEN: "refresh_token",
} as const;
