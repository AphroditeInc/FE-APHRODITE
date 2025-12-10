/**
 * React Hook for Cloudinary Uploads
 * 
 * Provides an easy-to-use hook for uploading files to Cloudinary
 */

import { useState, useCallback } from 'react';
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  UploadOptions,
  UploadResponse,
  UploadResult,
} from '../utils/cloudinary.upload';

export interface UseCloudinaryUploadReturn {
  upload: (file: File, options?: UploadOptions) => Promise<UploadResponse>;
  uploadMultiple: (files: File[], options?: UploadOptions) => Promise<UploadResponse[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for uploading files to Cloudinary
 * @param defaultOptions - Default upload options to use for all uploads
 * @returns Upload functions and state
 */
export const useCloudinaryUpload = (
  defaultOptions?: UploadOptions
): UseCloudinaryUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, options?: UploadOptions): Promise<UploadResponse> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const mergedOptions: UploadOptions = {
          ...defaultOptions,
          ...options,
          onProgress: (prog) => {
            setProgress(prog);
            options?.onProgress?.(prog);
            defaultOptions?.onProgress?.(prog);
          },
        };

        const result = await uploadToCloudinary(file, mergedOptions);

        if (!result.success) {
          setError(result.error || 'Upload failed');
        } else {
          setProgress(100);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          errorCode: 'UNKNOWN_ERROR',
        };
      } finally {
        setIsUploading(false);
      }
    },
    [defaultOptions]
  );

  const uploadMultiple = useCallback(
    async (files: File[], options?: UploadOptions): Promise<UploadResponse[]> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const mergedOptions: UploadOptions = {
          ...defaultOptions,
          ...options,
        };

        const results = await uploadMultipleToCloudinary(files, mergedOptions);

        // Check if any uploads failed
        const failedUploads = results.filter((r) => !r.success);
        if (failedUploads.length > 0) {
          const errorMessages = failedUploads
            .map((r) => r.error)
            .filter((e): e is string => !!e);
          setError(`Some uploads failed: ${errorMessages.join(', ')}`);
        } else {
          setProgress(100);
        }

        return results;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
        return files.map(() => ({
          success: false,
          error: errorMessage,
          errorCode: 'UNKNOWN_ERROR',
        }));
      } finally {
        setIsUploading(false);
      }
    },
    [defaultOptions]
  );

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
    reset,
  };
};

