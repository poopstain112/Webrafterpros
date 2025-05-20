import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  showSpinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function LoadingIndicator({ 
  message = 'Loading...', 
  showSpinner = true, 
  size = 'md',
  showProgress = false
}: LoadingIndicatorProps) {
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {showSpinner && (
        <div className="flex justify-center mb-3">
          <div className={`animate-spin rounded-full border-t-2 border-blue-500 border-opacity-80 ${spinnerSizes[size]}`}>
            <div className="h-full w-full rounded-full border-2 border-gray-200 border-opacity-20"></div>
          </div>
        </div>
      )}
      
      {message && (
        <p className={`${textSizes[size]} text-center font-medium text-gray-700`}>{message}</p>
      )}
      
      {showProgress && (
        <div className="w-full max-w-xs mt-3">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full animate-pulse"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}