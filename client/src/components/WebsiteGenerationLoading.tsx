import React from 'react';

export const WebsiteGenerationLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-95">
      <div className="text-center p-8 max-w-md mx-auto">
        {/* Prominent multi-layered spinner */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 border-8 border-blue-500 border-t-transparent rounded-full animate-spin" style={{animationDuration: '1s'}}></div>
          <div className="absolute inset-3 border-8 border-blue-300 border-b-transparent rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
          <div className="absolute inset-6 border-8 border-blue-100 border-l-transparent rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <span className="text-blue-500 text-lg font-bold animate-pulse">AI</span>
          </div>
        </div>

        {/* Prominent heading with gradient */}
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text animate-pulse" style={{animationDuration: '2s'}}>
          Creating Your Website
        </h2>
        <p className="text-gray-600 mb-6 text-lg">This typically takes 30-60 seconds. Please wait...</p>
        
        {/* Animated progress bar */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"
            style={{ 
              width: '100%', 
              animationDuration: '1.5s'
            }}
          ></div>
        </div>
        
        {/* Animated status messages */}
        <div className="text-sm text-gray-500 space-y-2">
          <p className="animate-pulse">Optimizing colors and typography...</p>
          <p className="animate-pulse" style={{animationDelay: '0.5s'}}>Creating responsive layouts...</p>
          <p className="animate-pulse" style={{animationDelay: '1s'}}>Generating professional content...</p>
        </div>
      </div>
    </div>
  );
};

export default WebsiteGenerationLoading;