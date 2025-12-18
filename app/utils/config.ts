/**
 * Configuration utilities
 * Access runtime configuration from environment variables or window object
 */

interface AppConfig {
  VITE_USER_BASE_URL?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_UPLOAD_PRESET?: string;
  CLOUDINARY_API_KEY?: string;
  NEXT_PUBLIC_WS_URL?: string;
  NEXT_PUBLIC_WEBSOCKET_URL?: string;
  [key: string]: unknown;
}

interface WindowWithConfig extends Window {
  __APP_CONFIG__?: AppConfig;
}

// For Next.js, we'll use environment variables
export const getConfig = (): AppConfig => {
  if (typeof window !== 'undefined' && (window as WindowWithConfig).__APP_CONFIG__) {
    return (window as WindowWithConfig).__APP_CONFIG__ || {};
  }
  
  // Fallback to environment variables
  return {
    VITE_USER_BASE_URL: process.env.NEXT_PUBLIC_USER_BASE_URL || 'https://be-aphrodite-8wrp.onrender.com',
    CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  };
};

// Export individual config values for convenience
export const VITE_USER_BASE_URL = () => getConfig().VITE_USER_BASE_URL;
export const CLOUDINARY_CLOUD_NAME = () => getConfig().CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_UPLOAD_PRESET = () => getConfig().CLOUDINARY_UPLOAD_PRESET;
export const CLOUDINARY_API_KEY = () => getConfig().CLOUDINARY_API_KEY;


