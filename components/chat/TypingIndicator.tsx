"use client";

import React from 'react';

interface TypingIndicatorProps {
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName,
  size = 'md',
  className = '',
}) => {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {userName && (
        <span className={`${textSizes[size]} text-gray-600 dark:text-gray-400 font-medium`}>
          {userName} is typing
        </span>
      )}
      <div className="flex items-center gap-1">
        <div
          className={`${dotSizes[size]} bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce`}
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        ></div>
        <div
          className={`${dotSizes[size]} bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce`}
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        ></div>
        <div
          className={`${dotSizes[size]} bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce`}
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        ></div>
      </div>
    </div>
  );
};

/**
 * Message bubble style typing indicator (appears as a chat bubble)
 */
export const TypingBubble: React.FC = () => {
  return (
    <div className="flex items-start gap-2">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
