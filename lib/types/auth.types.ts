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
  [key: string]: any;
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