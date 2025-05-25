import { useEffect, useState } from 'react';

interface VariantLoadingScreenProps {
  onComplete: () => void;
}

export function VariantLoadingScreen({ onComplete }: VariantLoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Analyzing your boat images...",
    "Creating Bold & Dramatic design...", 
    "Generating Premium Luxury variant...",
    "Building Vibrant Energy layout...",
    "Finalizing your websites..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 2;
        
        // Update step based on progress
        if (newProgress >= 20 && currentStep < 1) setCurrentStep(1);
        if (newProgress >= 40 && currentStep < 2) setCurrentStep(2);
        if (newProgress >= 60 && currentStep < 3) setCurrentStep(3);
        if (newProgress >= 80 && currentStep < 4) setCurrentStep(4);
        
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 flex items-center justify-center z-50">
      <div className="text-center text-white max-w-md mx-auto px-6">
        <div className="mb-8">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-3xl font-bold mb-2">Creating Your Websites</h1>
          <p className="text-blue-100">Generating 3 unique designs for Poseidon's Boat Rentals</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-lg font-medium">
            {steps[currentStep]}
          </div>
          
          <div className="text-sm text-blue-200">
            {Math.round(progress)}% Complete
          </div>
        </div>
        
        <div className="mt-8 text-xs text-blue-300">
          Each design will showcase all your boat images with unique styling
        </div>
      </div>
    </div>
  );
}