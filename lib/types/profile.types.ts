/**
 * Profile Types
 */

export interface CreateProfilePayload {
  userId?: string;
  bio: string;
  education: string;
  occupation: string;
  maritalStatus: string;
}

export interface UpdateProfilePayload {
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
  bio?: string;
  education?: string;
  occupation?: string;
  maritalStatus?: string;
  media?: string[];
  services?: string[];
}

export interface CreatePricingPayload {
  profileId: string;
  shortTime: {
    incall: number;
    outcall: number;
    currency?: string;
  };
  overnight: {
    incall: number;
    outcall: number;
    currency?: string;
  };
  weekend: {
    incall: number;
    outcall: number;
    currency?: string;
  };
}

export interface CreateServicePayload {
  profileId: string;
  name: string;
  description?: string;
  durationMinutes?: number;
  pricingId?: string;
  active?: boolean;
}

export interface VideoProofPayload {
  videoUrl: string;
  fileType: 'mp4' | 'mov' | 'avi' | 'webm';
}

export interface AddMediaPayload {
  mediaUrls: string[];
}

export interface CreateReviewPayload {
  profileId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface Review {
  id: string;
  profileId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  items: Review[];
  nextCursor?: string;
  hasMore: boolean;
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<string, number>;
  };
}

export interface ListProfilesQuery {
  type: 'hunk' | 'diva' | 'client' | 'rider' | 'admin';
  cursor?: string;
  limit?: number;
  city?: string;
  state?: string;
}

export interface GetReviewsQuery {
  cursor?: string;
  limit?: number;
}

