/**
 * Cloudinary Configuration
 * 
 * This file contains configuration for Cloudinary media uploads.
 * Set the following environment variables:
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: Your upload preset (unsigned recommended for client-side)
 * - NEXT_PUBLIC_CLOUDINARY_API_KEY: Your Cloudinary API key (optional, if using signed uploads)
 */

export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiKey?: string;
}

export const getCloudinaryConfig = (): CloudinaryConfig => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  if (!cloudName || !uploadPreset) {
    console.warn(
      'Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.'
    );
  }

  return {
    cloudName,
    uploadPreset,
    apiKey,
  };
};

export const getCloudinaryUploadUrl = (resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'): string => {
  const config = getCloudinaryConfig();
  return `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;
};

