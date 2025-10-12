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
    EMAIL_REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/password",
  },
  OTP: {
    SEND: "/otp/send",
  },
  USERS: {
    CREATE: "/user",
    PROFILE: (userId: string) => `/auth/users/${userId}`,
    BASIC_DETAILS: (userId: string) => `/auth/users/${userId}/basic-details`,
    UPDATE_PROFILE: (userId: string) => `/auth/users/${userId}`,
  },

  PROFILE: {
    CREATE: "/profiles",
    PRICING: (userId: string) => `/profiles/${userId}/pricing`,
    SERVICES: (userId: string) => `/profiles/${userId}/services`,
    VIDEO: (userId: string) => `/profiles/${userId}/video-proof`,
    MEDIA: (userId: string) => `/profiles/${userId}/media`,
    REVIEWS: (userId: string) => `/profiles/${userId}/reviews`,
    FOLLOW: (userId: string) => `/profiles/${userId}/follow`,
    GET_REVIEWS: (userId: string) => `/profiles/${userId}/reviews`,
  },
  CHAT: {
    MESSAGES: "/chat/messages",
    ROOMS: "/chat/rooms",
    CONVERSATIONS: "/chat/conversations",
    ROOM_MESSAGES: (roomId: string) => `/chat/rooms/${roomId}/messages`,
    MESSAGE_STATUS: (messageId: string) => `/chat/messages/${messageId}/status`,
    MESSAGE_EDIT: (messageId: string) => `/chat/messages/${messageId}`,
    MESSAGE_DELETE: (messageId: string) => `/chat/messages/${messageId}`,
    ROOM_READ: (roomId: string) => `/chat/rooms/${roomId}/read`,
    ROOM_UNREAD_COUNT: (roomId: string) => `/chat/rooms/${roomId}/unread-count`,
    ROOM_STATS: (roomId: string) => `/chat/rooms/${roomId}/stats`,
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
