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
 * Check Availability Payload
 */
export interface CheckAvailabilityPayload {
  username?: string;
  email?: string;
  phoneNumber?: string;
  countryCode?: string;
}

/**
 * Check Availability Response
 */
export interface CheckAvailabilityResponse {
  username?: { available: boolean; message?: string };
  email?: { available: boolean; message?: string };
  phoneNumber?: { available: boolean; message?: string };
}

/**
 * Introspect Token Payload
 */
export interface IntrospectTokenPayload {
  token: string;
}

/**
 * Introspect Token Response
 */
export interface IntrospectTokenResponse {
  active: boolean;
  payload: {
    sub: string;
    email?: string;
    iat: number;
    exp: number;
  };
  user?: User;
  expiresAt: number;
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

/**
 * Service Interface
 */
export interface Service {
  id?: string;
  profileId?: string;
  name?: string;
  description?: string;
  durationMinutes?: number;
  pricingId?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  price?: number;
  duration?: number;
  [key: string]: unknown;
}

/**
 * Pricing Interface
 */
export interface Pricing {
  shortTime?: {
    incall?: string | number;
    outcall?: string | number;
  };
  overnight?: {
    incall?: string | number;
    outcall?: string | number;
  };
  weekend?: {
    incall?: string | number;
    outcall?: string | number;
  };
  customCategories?: Array<{
    categoryName: string;
    duration: string;
    incall: string | number;
    outcall: string | number;
    currency?: string;
  }>;
  custom?: {
    price?: string | number;
  };
  [key: string]: unknown;
}

/**
 * Review Item Interface
 */
export interface ReviewItem {
  id?: string;
  userId?: string;
  rating?: number;
  comment?: string;
  createdAt?: string;
  [key: string]: unknown;
}

/**
 * Enriched Profile Data
 */
export interface EnrichedProfile {
  id: string;
  userId: string;
  user: {
    id: string;
    userName: string;
    userType: string;
    firstName: string;
    lastName: string;
  };
  bio?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  gender?: string;
  sexualOrientation?: string;
  bodyBuild?: string;
  bustSize?: string;
  nationality?: string;
  ethnicity?: string;
  state?: string;
  city?: string;
  smoker?: boolean;
  looks?: string;
  hasVideoProof?: boolean;
  issuedIdVerified?: boolean;
  media?: string[];
  services?: Service[] | string[];
  followersCount?: number;
  createdAt?: string;
  updatedAt?: string;
  pricing?: Pricing | null;
  servicesExpanded?: Service[];
  reviews?: {
    items: ReviewItem[];
    limit: number;
    hasMore: boolean;
    stats: {
      averageRating: number;
      totalReviews: number;
      ratingDistribution: Record<string, number>;
    };
  };
}

/**
 * Enriched Profile API Response
 */
export interface EnrichedProfileResponse {
  success: boolean;
  data: EnrichedProfile;
}
