/**
 * Cloudinary Upload Utilities
 * 
 * Functions for uploading media files to Cloudinary
 */

import { getCloudinaryConfig, getCloudinaryUploadUrl } from './cloudinary.config';

export interface UploadOptions {
  folder?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: string;
  tags?: string[];
  publicId?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  duration?: number; // For videos
  [key: string]: unknown;
}

export interface UploadResponse {
  success: boolean;
  data?: UploadResult;
  error?: string;
  errorCode?: string;
}

/**
 * Upload a file to Cloudinary
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Promise with upload result
 */
export const uploadToCloudinary = async (
  file: File,
  options: UploadOptions = {}
): Promise<UploadResponse> => {
  const config = getCloudinaryConfig();

  if (!config.cloudName || !config.uploadPreset) {
    return {
      success: false,
      error: 'Cloudinary configuration is missing',
      errorCode: 'CONFIG_ERROR',
    };
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);

    // Add optional parameters
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    if (options.resourceType && options.resourceType !== 'auto') {
      formData.append('resource_type', options.resourceType);
    }

    if (options.transformation) {
      formData.append('transformation', options.transformation);
    }

    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (options.onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            options.onProgress?.(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText) as UploadResult;
            resolve({
              success: true,
              data: response,
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Failed to parse response',
              errorCode: 'PARSE_ERROR',
            });
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            resolve({
              success: false,
              error: errorResponse.error?.message || 'Upload failed',
              errorCode: errorResponse.error?.http_code?.toString() || 'UPLOAD_ERROR',
            });
          } catch {
            resolve({
              success: false,
              error: `Upload failed with status ${xhr.status}`,
              errorCode: xhr.status.toString(),
            });
          }
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: 'Network error during upload',
          errorCode: 'NETWORK_ERROR',
        });
      });

      xhr.addEventListener('abort', () => {
        resolve({
          success: false,
          error: 'Upload was cancelled',
          errorCode: 'CANCELLED',
        });
      });

      xhr.open('POST', getCloudinaryUploadUrl());
      xhr.send(formData);
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      errorCode: 'UNKNOWN_ERROR',
    };
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of files to upload
 * @param options - Upload options
 * @returns Promise with array of upload results
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  options: UploadOptions = {}
): Promise<UploadResponse[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, options));
  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Cloudinary (requires backend API)
 * Note: This should be called from your backend, not directly from the client
 * @param publicId - The public ID of the file to delete
 * @param resourceType - The resource type (image, video, raw)
 * @returns Promise with deletion result
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ success: boolean; error?: string }> => {
  // Note: Deletion requires authentication and should be done via your backend
  // This is a placeholder for the structure
  console.warn(
    'deleteFromCloudinary should be called from your backend API, not directly from the client'
  );
  return {
    success: false,
    error: 'Deletion must be performed via backend API',
  };
};

/**
 * Get Cloudinary image URL with transformations
 * @param publicId - The public ID of the image
 * @param transformations - Cloudinary transformation string
 * @returns The transformed image URL
 */
export const getCloudinaryImageUrl = (
  publicId: string,
  transformations?: string
): string => {
  const config = getCloudinaryConfig();
  const baseUrl = `https://res.cloudinary.com/${config.cloudName}/image/upload`;
  
  if (transformations) {
    return `${baseUrl}/${transformations}/${publicId}`;
  }
  
  return `${baseUrl}/${publicId}`;
};

