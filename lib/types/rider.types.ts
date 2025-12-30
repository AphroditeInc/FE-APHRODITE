/**
 * Rider Types
 */

export interface CreateRiderProfilePayload {
  carMake: string;
  plateNumber: string;
  carColor: string;
  modelYear: number;
}

export interface UpdateRiderProfilePayload {
  carMake?: string;
  plateNumber?: string;
  carColor?: string;
  modelYear?: number;
}

export interface UploadVerificationDocumentsPayload {
  carPhotos: string[];
  licensePhoto?: string;
}

export interface UpdateLocationPayload {
  locationFrom?: string;
  locationTo?: string;
  distance?: number;
  estimatedDeliveryTime?: number;
}

export interface SetAvailabilityPayload {
  isAvailable: boolean;
}

export interface RiderProfile {
  id: string;
  userId: string;
  carMake: string;
  plateNumber: string;
  carColor: string;
  modelYear: number;
  carPhotos: string[];
  licensePhoto?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationReason?: string;
  verifiedAt?: string;
  averageRating: number;
  totalCompletedRides: number;
  totalAmountEarned: number;
  isAvailable: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

