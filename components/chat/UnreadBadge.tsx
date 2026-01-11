"use client";

import React from 'react';

interface UnreadBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({
  count,
  maxCount = 99,
  size = 'md',
  className = '',
}) => {
  if (count <= 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'min-w-[16px] h-4 text-[10px] px-1',
    md: 'min-w-[20px] h-5 text-xs px-1.5',
    lg: 'min-w-[24px] h-6 text-sm px-2',
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        bg-pink-600 text-white font-semibold rounded-full
        shadow-sm
        ${className}
      `}
      title={count > maxCount ? `${count} unread messages` : undefined}
    >
      {displayCount}
    </div>
  );
};

/**
 * Unread badge for notification/alert style (pulsing red dot)
 */
export const UnreadDot: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
      <div className="absolute inset-0 w-2 h-2 bg-pink-600 rounded-full animate-ping opacity-75"></div>
    </div>
  );
};

export default UnreadBadge;
