"use client";

import React from 'react';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
  showOffline?: boolean;
  className?: string;
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline,
  size = 'md',
  showOffline = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  if (!isOnline && !showOffline) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        } border-2 border-white dark:border-gray-800`}
      >
        {isOnline && (
          <div className={`absolute inset-0 ${sizeClasses[size]} bg-green-500 rounded-full animate-ping opacity-75`} />
        )}
      </div>
    </div>
  );
};

/**
 * Avatar with online indicator overlay
 */
interface AvatarWithStatusProps {
  src?: string;
  alt: string;
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

export const AvatarWithStatus: React.FC<AvatarWithStatusProps> = ({
  src,
  alt,
  isOnline,
  size = 'md',
  fallback,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const indicatorPositions = {
    sm: 'bottom-0 right-0',
    md: 'bottom-0 right-0',
    lg: 'bottom-1 right-1',
    xl: 'bottom-1 right-1',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold`}
        >
          {fallback || getInitials(alt)}
        </div>
      )}
      <div className={`absolute ${indicatorPositions[size]}`}>
        <OnlineIndicator isOnline={isOnline} size={size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm'} />
      </div>
    </div>
  );
};

export default OnlineIndicator;
