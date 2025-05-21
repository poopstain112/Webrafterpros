import React, { useState, ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useLocation } from 'wouter';

interface SwipeableLayoutProps {
  children: ReactNode;
}

// Define the screens in order - simplified navigation flow
const screens = [
  '/',                   // Home/Chat
  '/generating-website', // Website Generation
  '/website-preview'     // Website Preview
];

const SwipeableLayout: React.FC<SwipeableLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const [transitioning, setTransitioning] = useState(false);
  
  // Find current screen index
  const currentIndex = screens.indexOf(location);
  
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Special case: Don't allow swiping from chat directly to website preview
      // unless website generation screen has been visited
      if (currentIndex === 0) {
        // Only navigate if we're not going to skip generation
        const websiteGenerated = localStorage.getItem('generatedWebsiteHTML');
        if (websiteGenerated) {
          // If website already exists, allow direct navigation to preview
          navigateTo('/website-preview');
        } else {
          // Otherwise, go to generation screen
          navigateTo('/generating-website');
        }
      }
      // Normal case: Go to next screen if not the last one
      else if (currentIndex < screens.length - 1) {
        navigateTo(screens[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      // Special case: From website preview go back to chat, skipping loading screen
      if (currentIndex === screens.length - 1) {
        navigateTo('/');
      }
      // Normal case: Go to previous screen if not the first one
      else if (currentIndex > 0) {
        navigateTo(screens[currentIndex - 1]);
      }
    },
    trackMouse: false,
    delta: 10, // Minimum swipe distance for better mobile experience
    swipeDuration: 500, // Maximum time for swipe gesture
    // Simple configuration for swipe without extra options
  });
  
  const navigateTo = (path: string) => {
    if (transitioning) return;
    
    setTransitioning(true);
    setLocation(path);
    
    // Reset transitioning state after navigation animation
    setTimeout(() => {
      setTransitioning(false);
    }, 300);
  };
  
  return (
    <div 
      {...handlers} 
      className="swipeable-container h-full flex flex-col"
    >
      {/* Enhanced navigation indicator at top */}
      <div className="flex justify-center py-2 bg-gradient-to-r from-blue-600 to-blue-400 border-b border-blue-700 shadow-md">
        <div className="flex space-x-3">
          {screens.map((_, index) => (
            <div 
              key={index}
              className={`h-2.5 w-10 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-110 shadow-lg' 
                  : index < currentIndex 
                    ? 'bg-blue-100 opacity-80' 
                    : 'bg-blue-300 opacity-60'
              }`}
              onClick={() => navigateTo(screens[index])}
            />
          ))}
        </div>
        
        {/* Swipe hint - shows briefly and fades out */}
        {location === '/' && (
          <div className="absolute right-4 animate-pulse flex items-center text-white text-xs opacity-70">
            <span className="mr-1">Swipe</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce-x">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        )}
      </div>
      
      {/* Screen content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SwipeableLayout;