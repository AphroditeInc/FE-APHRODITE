/**
 * User Types
 */
export type UserType = 'client' | 'rider' | 'diva' | 'hunk';

/**
 * User Interface
 */
export interface User {
  id: string;
  userType?: UserType;
  number?: string;
  countryCode?: string;
  isVerified?: boolean;
  username?: string;
  gender?: string;
  dob?: string;
  country?: string;
  state?: string;
  city?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/**
 * Authentication Tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Registration Payload
 */
export interface AuthPayload {
  userType: UserType;
  countryCode: string;
  phoneNumber: string;
}

/**
 * Basic Details Payload
 */
export interface BasicDetailsPayload {
  is18: boolean;
  dob: string;
  username: string;
  gender: string;
  country: string;
  state: string;
  city: string;
  password: string;
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  phoneNumber: string;
  countryCode?: string;
}

/**
 * OTP Verification Payload
 */
export interface OTPVerificationPayload {
  phoneNumber: string;
  otp: string;
}

/**
 * Email Registration Payload
 */
export interface EmailRegistrationPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  countryCode: string;
  number: string;
}

/**
 * Complete User Creation Payload
 */
export interface CompleteUserPayload {
  name: string;
  number: string;
  userName: string;
  above18: boolean;
  gender: string;
  country: string;
  password: string;
  state: string;
  city: string;
  userType: UserType;
  email: string;
}

/**
 * Send OTP Payload
 */
export interface SendOTPPayload {
  number: string;
}

/**
 * Verify OTP Payload
 */
export interface VerifyOTPPayload {
  number: string;
  otp: string;
}

/**
 * Profile Creation Payload
 */
export interface ProfilePayload {
  userId: string;
  bio?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
}

/**
 * Profile Update Payload
 */
export interface ProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
}

/**
 * Chat Types
 */
export type MessageType = 'text' | 'image' | 'file' | 'video' | 'audio';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type RoomType = 'direct' | 'group';

/**
 * Chat Message Interface
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId?: string;
  roomId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
  attachments?: string[];
  readAt?: string;
  deliveredAt?: string;
  replyTo?: string;
  tempId?: string;
}

/**
 * Chat Room Interface
 */
export interface ChatRoom {
  id: string;
  name?: string;
  description?: string;
  type: RoomType;
  participants: string[];
  settings?: {
    notifications: boolean;
    autoDelete: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

/**
 * Send Message Payload
 */
export interface SendMessagePayload {
  receiverId?: string;
  content: string;
  type: MessageType;
  metadata?: Record<string, unknown>;
  attachments?: string[];
  replyTo?: string;
  tempId?: string;
}

/**
 * Create Room Payload
 */
export interface CreateRoomPayload {
  name?: string;
  description?: string;
  type: RoomType;
  participants: string[];
  settings?: {
    notifications: boolean;
    autoDelete: boolean;
  };
}

/**
 * Get Messages Query Parameters
 */
export interface GetMessagesQuery {
  limit?: number;
  offset?: number;
  before?: string;
  after?: string;
}

/**
 * Update Message Status Payload
 */
export interface UpdateMessageStatusPayload {
  status: MessageStatus;
}

/**
 * Room Statistics Interface
 */
export interface RoomStats {
  totalMessages: number;
  unreadCount: number;
  lastActivity: string;
  participants: number;
}

/**
 * Authenticated User Profile Response
 */
export interface AuthProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}