'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import Button from './button';

/**
 * Demo component showing token refresh functionality
 * This component can be used to test and demonstrate the token refresh system
 */
export default function TokenRefreshDemo() {
  const { 
    isAuthenticated, 
    isTokenExpired, 
    hasValidToken, 
    refreshTokens, 
    isLoading,
    user 
  } = useAuth();

  const handleRefreshTokens = async () => {
    try {
      await refreshTokens();
      console.log('Tokens refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-white">Please login to see token information</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-4">
      <h3 className="text-white text-lg font-semibold">Token Status</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-300">User:</span>
          <span className="text-white">{user?.email || user?.username || 'Unknown'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Has Valid Token:</span>
          <span className={`font-medium ${hasValidToken ? 'text-green-400' : 'text-red-400'}`}>
            {hasValidToken ? 'Yes' : 'No'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Token Expired:</span>
          <span className={`font-medium ${isTokenExpired ? 'text-red-400' : 'text-green-400'}`}>
            {isTokenExpired ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      <Button 
        onClick={handleRefreshTokens}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Refreshing...' : 'Refresh Tokens'}
      </Button>

      <div className="text-xs text-gray-400">
        <p>This component demonstrates the token refresh functionality.</p>
        <p>Tokens are automatically refreshed when they expire or are about to expire.</p>
      </div>
    </div>
  );
}

