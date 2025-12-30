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
const AUTH_CHECK_AVAILABILITY = "/auth/check-availability";
const AUTH_INTROSPECT = "/auth/introspect";
const AUTH_BASIC_DETAILS = (userId: string) => `/auth/users/${userId}/basic-details`;

// OTP
const OTP_SEND = "/otp/send";

// Users
const USER_CREATE = "/user";
const USER_PROFILE = (userId: string) => `/auth/users/${userId}`;
const USER_UPDATE_PROFILE = (userId: string) => `/auth/users/${userId}`;
const USER_CREATE_ADMIN = "/user/admin";
const USER_VERIFY_RIDER = (riderId: string) => `/user/admin/riders/${riderId}/verify`;
const USER_PENDING_VERIFICATIONS = "/user/admin/riders/pending";

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

// Wallet
const WALLET_BALANCE = "/wallet/balance";
const WALLET_FUND = "/wallet/fund";
const WALLET_VERIFY_PAYMENT = "/wallet/verify-payment";
const WALLET_TRANSACTIONS = "/wallet/transactions";
const WALLET_WITHDRAWAL_ACCOUNTS = "/wallet/withdrawal-accounts";
const WALLET_SET_DEFAULT_ACCOUNT = "/wallet/withdrawal-accounts/set-default";
const WALLET_DELETE_ACCOUNT = (accountId: string) => `/wallet/withdrawal-accounts/${accountId}`;
const WALLET_BANKS = "/wallet/banks";
const WALLET_VERIFY_ACCOUNT = "/wallet/verify-account";
const WALLET_PAYOUT = "/wallet/payout";
const WALLET_PAYOUTS = "/wallet/payouts";
const WALLET_PAYOUT_BY_ID = (payoutId: string) => `/wallet/payouts/${payoutId}`;
const WALLET_CANCEL_PAYOUT = (payoutId: string) => `/wallet/payouts/${payoutId}/cancel`;

// Rider
const RIDER_PROFILE = "/rider/profile";
const RIDER_VERIFICATION_DOCUMENTS = "/rider/verification/documents";
const RIDER_LOCATION = "/rider/location";
const RIDER_AVAILABILITY = "/rider/availability";
const RIDER_NEARBY_ORDERS = "/rider/orders/nearby";
const RIDER_ACCEPT_ORDER = (orderId: string) => `/rider/orders/${orderId}/accept`;
const RIDER_REJECT_ORDER = (orderId: string) => `/rider/orders/${orderId}/reject`;

// Orders
const ORDER_CREATE = "/orders";
const ORDER_LIST = "/orders";
const ORDER_BY_ID = (id: string) => `/orders/${id}`;
const ORDER_ACCEPT = (id: string) => `/orders/${id}/accept`;
const ORDER_REJECT = (id: string) => `/orders/${id}/reject`;
const ORDER_READY = (id: string) => `/orders/${id}/ready`;
const ORDER_START = (id: string) => `/orders/${id}/start`;
const ORDER_COMPLETE = (id: string) => `/orders/${id}/complete`;
const ORDER_CANCEL = (id: string) => `/orders/${id}/cancel`;
const ORDER_ASSIGN_RIDER = (id: string) => `/orders/${id}/assign-rider`;
const ORDER_RIDER_CHAT_ROOM = (id: string) => `/orders/${id}/rider-chat-room`;
const ORDER_RIDER_PICKED_UP = (id: string) => `/orders/${id}/rider-picked-up`;
const ORDER_UPDATE_LOCATION = (id: string) => `/orders/${id}/location`;

const endpoints = {
  // Auth
  AUTH_REGISTER,
  AUTH_EMAIL_REGISTER,
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_REFRESH,
  AUTH_PROFILE,
  AUTH_CHANGE_PASSWORD,
  AUTH_CHECK_AVAILABILITY,
  AUTH_INTROSPECT,
  AUTH_BASIC_DETAILS,
  
  // OTP
  OTP_SEND,
  
  // Users
  USER_CREATE,
  USER_PROFILE,
  USER_UPDATE_PROFILE,
  USER_CREATE_ADMIN,
  USER_VERIFY_RIDER,
  USER_PENDING_VERIFICATIONS,
  
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
  
  // Wallet
  WALLET_BALANCE,
  WALLET_FUND,
  WALLET_VERIFY_PAYMENT,
  WALLET_TRANSACTIONS,
  WALLET_WITHDRAWAL_ACCOUNTS,
  WALLET_SET_DEFAULT_ACCOUNT,
  WALLET_DELETE_ACCOUNT,
  WALLET_BANKS,
  WALLET_VERIFY_ACCOUNT,
  WALLET_PAYOUT,
  WALLET_PAYOUTS,
  WALLET_PAYOUT_BY_ID,
  WALLET_CANCEL_PAYOUT,
  
  // Rider
  RIDER_PROFILE,
  RIDER_VERIFICATION_DOCUMENTS,
  RIDER_LOCATION,
  RIDER_AVAILABILITY,
  RIDER_NEARBY_ORDERS,
  RIDER_ACCEPT_ORDER,
  RIDER_REJECT_ORDER,
  
  // Orders
  ORDER_CREATE,
  ORDER_LIST,
  ORDER_BY_ID,
  ORDER_ACCEPT,
  ORDER_REJECT,
  ORDER_READY,
  ORDER_START,
  ORDER_COMPLETE,
  ORDER_CANCEL,
  ORDER_ASSIGN_RIDER,
  ORDER_RIDER_CHAT_ROOM,
  ORDER_RIDER_PICKED_UP,
  ORDER_UPDATE_LOCATION,
};

export default endpoints;
