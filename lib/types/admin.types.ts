/**
 * Admin Types
 */

export interface CreateAdminPayload {
  name: string;
  email: string;
  number: string;
  countryCode: string;
  password: string;
  userName?: string;
}

export interface VerifyRiderPayload {
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface PendingVerification {
  riderId: string;
  userId: string;
  carMake: string;
  plateNumber: string;
  carPhotos: string[];
  licensePhoto?: string;
  submittedAt: string;
}

