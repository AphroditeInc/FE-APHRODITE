/**
 * API Endpoints
 * Centralized endpoint definitions
 */

// Authentication
const AUTH_REGISTER = "/auth/users";
const AUTH_EMAIL_REGISTER = "/auth/register";
const AUTH_LOGIN = "/auth/login";
const AUTH_LOGOUT = "/auth/logout";
const AUTH_REFRESH = "/auth/refresh";
const AUTH_PROFILE = "/auth/profile";
const AUTH_CHANGE_PASSWORD = "/auth/password";

// OTP
const OTP_SEND = "/otp/send";

// Users
const USER_CREATE = "/user";
const USER_PROFILE = (userId: string) => `/auth/users/${userId}`;
const USER_BASIC_DETAILS = (userId: string) => `/auth/users/${userId}/basic-details`;
const USER_UPDATE_PROFILE = (userId: string) => `/auth/users/${userId}`;

// Profile
const PROFILE_CREATE = "/profiles";
const PROFILE_LIST = "/profiles"; // GET /profiles - list profiles with filters
const PROFILE_UPDATE = (id: string) => `/profiles/${id}`; // PUT /profiles/{id}
const PROFILE_GET_BY_ID = (id: string) => `/profiles/${id}`; // GET /profiles/{id}
const PROFILE_GET_USER_PROFILE = (userId: string) => `/profiles/user/${userId}`;
const PROFILE_PRICING = (userId: string) => `/profiles/${userId}/pricing`;
const PROFILE_SERVICES = (id: string) => `/profiles/${id}/services`;
const PROFILE_VIDEO = (userId: string) => `/profiles/${userId}/video-proof`;
const PROFILE_MEDIA = (id: string) => `/profiles/${id}/media`;
const PROFILE_REVIEWS = (userId: string) => `/profiles/${userId}/reviews`;
const PROFILE_FOLLOW = (userId: string) => `/profiles/${userId}/follow`;

// Chat
const CHAT_MESSAGES = "/chat/messages";
const CHAT_ROOMS = "/chat/rooms";
const CHAT_CONVERSATIONS = "/chat/conversations";
const CHAT_ROOM_MESSAGES = (roomId: string) => `/chat/rooms/${roomId}/messages`;
const CHAT_MESSAGE_STATUS = (messageId: string) => `/chat/messages/${messageId}/status`;
const CHAT_MESSAGE_EDIT = (messageId: string) => `/chat/messages/${messageId}`;
const CHAT_MESSAGE_DELETE = (messageId: string) => `/chat/messages/${messageId}`;
const CHAT_ROOM_READ = (roomId: string) => `/chat/rooms/${roomId}/read`;
const CHAT_ROOM_UNREAD_COUNT = (roomId: string) => `/chat/rooms/${roomId}/unread-count`;
const CHAT_ROOM_STATS = (roomId: string) => `/chat/rooms/${roomId}/stats`;

const endpoints = {
  // Auth
  AUTH_REGISTER,
  AUTH_EMAIL_REGISTER,
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_REFRESH,
  AUTH_PROFILE,
  AUTH_CHANGE_PASSWORD,
  
  // OTP
  OTP_SEND,
  
  // Users
  USER_CREATE,
  USER_PROFILE,
  USER_BASIC_DETAILS,
  USER_UPDATE_PROFILE,
  
  // Profile
  PROFILE_CREATE,
  PROFILE_LIST,
  PROFILE_UPDATE,
  PROFILE_GET_BY_ID,
  PROFILE_GET_USER_PROFILE,
  PROFILE_PRICING,
  PROFILE_SERVICES,
  PROFILE_VIDEO,
  PROFILE_MEDIA,
  PROFILE_REVIEWS,
  PROFILE_FOLLOW,
  
  // Chat
  CHAT_MESSAGES,
  CHAT_ROOMS,
  CHAT_CONVERSATIONS,
  CHAT_ROOM_MESSAGES,
  CHAT_MESSAGE_STATUS,
  CHAT_MESSAGE_EDIT,
  CHAT_MESSAGE_DELETE,
  CHAT_ROOM_READ,
  CHAT_ROOM_UNREAD_COUNT,
  CHAT_ROOM_STATS,
};

export default endpoints;
