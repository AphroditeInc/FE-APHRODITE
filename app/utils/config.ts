/**
 * Configuration utilities
 * Access runtime configuration from environment variables or window object
 */

// For Next.js, we'll use environment variables
export const getConfig = () => {
  if (typeof window !== 'undefined' && (window as any).__APP_CONFIG__) {
    return (window as any).__APP_CONFIG__;
  }
  
  // Fallback to environment variables
  return {
    VITE_USER_BASE_URL: process.env.NEXT_PUBLIC_USER_BASE_URL || 'https://be-aphrodite-8wrp.onrender.com',
    VITE_JOB_BASE_URL: process.env.NEXT_PUBLIC_JOB_BASE_URL || '',
    VITE_TRAINING_BASE_URL: process.env.NEXT_PUBLIC_TRAINING_BASE_URL || '',
    VITE_PAYMENT_BASE_URL: process.env.NEXT_PUBLIC_PAYMENT_BASE_URL || '',
    VITE_CONTACT_BASE_URL: process.env.NEXT_PUBLIC_CONTACT_BASE_URL || '',
  };
};

// Export individual config values for convenience
export const VITE_USER_BASE_URL = () => getConfig().VITE_USER_BASE_URL;
export const VITE_JOB_BASE_URL = () => getConfig().VITE_JOB_BASE_URL;
export const VITE_TRAINING_BASE_URL = () => getConfig().VITE_TRAINING_BASE_URL;
export const VITE_PAYMENT_BASE_URL = () => getConfig().VITE_PAYMENT_BASE_URL;
export const VITE_CONTACT_BASE_URL = () => getConfig().VITE_CONTACT_BASE_URL;

