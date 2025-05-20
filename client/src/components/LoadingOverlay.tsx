import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50" style={{top: 0, left: 0, right: 0, bottom: 0, position: 'fixed'}}>
      <div className="text-center p-6 max-w-md mx-auto">
        <div className="w-24 h-24 border-8 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold mb-2 text-blue-600">Creating Your Website</h2>
        <p className="text-gray-700 mb-4">Please wait, this typically takes 30-60 seconds...</p>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{width: '100%'}}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;