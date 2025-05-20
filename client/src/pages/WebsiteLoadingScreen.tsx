import React from 'react';

interface WebsiteLoadingScreenProps {
  onCancel?: () => void;
}

const WebsiteLoadingScreen: React.FC<WebsiteLoadingScreenProps> = ({ onCancel }) => {
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const steps = [
    "Analyzing your business information...",
    "Creating responsive layout structure...",
    "Optimizing colors and typography for your brand...",
    "Generating professional content...",
    "Adding images and enhancing visual elements...",
    "Finalizing your custom website..."
  ];
  
  // Simulate loading progress
  React.useEffect(() => {
    const totalDuration = 50000; // 50 seconds total for the animation
    const stepDuration = totalDuration / steps.length;
    const interval = 100; // Update every 100ms
    const totalSteps = totalDuration / interval;
    const incrementPerStep = 100 / totalSteps;
    
    let timer = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = Math.min(prev + incrementPerStep, 100);
        
        // Update current step based on progress
        const stepIndex = Math.min(
          Math.floor((newProgress / 100) * steps.length),
          steps.length - 1
        );
        setCurrentStep(stepIndex);
        
        return newProgress;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [steps.length]);
  
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 p-4">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Logo or icon */}
        <div className="mb-8">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-6 border-blue-400 border-b-transparent rounded-full animate-spin" 
                 style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <span className="text-blue-500 text-xl font-bold">AI</span>
            </div>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Creating Your Professional Website
        </h1>
        
        {/* Description */}
        <p className="text-gray-700 mb-8">
          We're hard at work building your custom website. This typically takes 45-60 seconds.
        </p>
        
        {/* Current step */}
        <div className="mb-6">
          <p className="text-lg font-medium text-blue-800 mb-2">
            {steps[currentStep]}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-gray-500 mt-1">
            {Math.round(loadingProgress)}%
          </p>
        </div>
        
        {/* Steps progress */}
        <div className="w-full grid grid-cols-6 gap-2 mb-8">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`h-1 rounded-full ${index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>
        
        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg text-left mb-6">
          <h3 className="font-medium text-blue-800 mb-2">While you wait:</h3>
          <p className="text-sm text-gray-700 mb-1">• Your website will be fully responsive and mobile-friendly</p>
          <p className="text-sm text-gray-700 mb-1">• All content is generated based on your business details</p>
          <p className="text-sm text-gray-700">• You can make changes to your website after it's generated</p>
        </div>
        
        {/* Cancel button */}
        {onCancel && (
          <button 
            onClick={onCancel}
            className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Cancel and return to chat
          </button>
        )}
      </div>
    </div>
  );
};

export default WebsiteLoadingScreen;