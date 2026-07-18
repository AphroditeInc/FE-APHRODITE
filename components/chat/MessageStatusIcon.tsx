"use client";

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface MessageStatusIconProps {
  status: 'sent' | 'delivered' | 'read' | 'pending' | 'failed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({
  status,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (status === 'pending') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={`${sizeClasses[size]} text-red-500 ${className}`}>
        <svg
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-full h-full"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <Check
        className={`${sizeClasses[size]} text-gray-400 dark:text-gray-500 ${className}`}
      />
    );
  }

  if (status === 'delivered') {
    return (
      <CheckCheck
        className={`${sizeClasses[size]} text-gray-400 dark:text-gray-500 ${className}`}
      />
    );
  }

  if (status === 'read') {
    return (
      <CheckCheck
        className={`${sizeClasses[size]} text-blue-500 ${className}`}
      />
    );
  }

  return null;
};

/**
 * Message status text (for detailed status display)
 */
export const MessageStatusText: React.FC<{
  status: string;
  timestamp?: string;
  className?: string;
}> = ({ status, timestamp, className = '' }) => {
  const getStatusText = () => {
    switch (status) {
      case 'sent':
        return 'Sent';
      case 'delivered':
        return 'Delivered';
      case 'read':
        return 'Read';
      case 'pending':
        return 'Sending...';
      case 'failed':
        return 'Failed to send';
      default:
        return '';
    }
  };

  return (
    <span className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      {getStatusText()}
      {timestamp && ` • ${timestamp}`}
    </span>
  );
};

export default MessageStatusIcon;
