import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95">
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 border-t-8 border-blue-500 border-opacity-75 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-r-8 border-blue-400 border-opacity-75 rounded-full animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          <div className="absolute inset-8 border-b-8 border-blue-300 border-opacity-75 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
        </div>
        
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Creating Your Website
        </h2>
        
        <p className="text-gray-700 mb-6 text-lg">
          This typically takes 30-60 seconds. Please wait...
        </p>
        
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse" 
               style={{width: '100%', animationDuration: '2s'}}></div>
        </div>
        
        <div className="text-sm text-gray-500 space-y-2 text-left">
          <p className="animate-pulse">Creating responsive layout...</p>
          <p className="animate-pulse" style={{animationDelay: '0.5s'}}>Optimizing colors and typography...</p>
          <p className="animate-pulse" style={{animationDelay: '1s'}}>Generating professional content...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;