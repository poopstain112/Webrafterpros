import React from 'react';

const EnhancedLoadingIndicator: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-95 z-50">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Large spinner animation */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-t-8 border-r-8 border-b-8 border-l-transparent border-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-t-8 border-r-transparent border-b-8 border-l-8 border-blue-300 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          <div className="absolute inset-8 border-t-transparent border-r-8 border-b-8 border-l-8 border-blue-100 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
        </div>
        
        {/* Loading text with gradient */}
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
          Creating Your Website
        </h2>
        
        <p className="text-gray-600 mb-8 text-lg">
          We're building your professional website.<br/>
          This typically takes 30-60 seconds.
        </p>
        
        {/* Progress indicator */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse rounded-full" style={{animationDuration: '2s'}}></div>
        </div>
        
        {/* Status messages */}
        <div className="text-sm text-gray-500">
          <p className="animate-pulse">Building responsive layout...</p>
          <p className="animate-pulse" style={{animationDelay: '0.7s'}}>Generating professional content...</p>
          <p className="animate-pulse" style={{animationDelay: '1.4s'}}>Optimizing for all devices...</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoadingIndicator;