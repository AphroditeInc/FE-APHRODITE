/**
 * Configuration utilities
 * Access runtime configuration from environment variables or window object
 */

interface AppConfig {
  VITE_USER_BASE_URL?: string;
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
   
  };
};

// Export individual config values for convenience
export const VITE_USER_BASE_URL = () => getConfig().VITE_USER_BASE_URL;


