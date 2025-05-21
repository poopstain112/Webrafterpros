import React, { useState, ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useLocation } from 'wouter';

interface SwipeableLayoutProps {
  children: ReactNode;
}

// Define the screens in order
const screens = [
  '/',                   // Home/Chat
  '/upload',             // Image Upload 
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
      // Go to next screen (if not the last one)
      if (currentIndex < screens.length - 1) {
        navigateTo(screens[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      // Go to previous screen (if not the first one)
      if (currentIndex > 0) {
        navigateTo(screens[currentIndex - 1]);
      }
    },
    trackMouse: false,
    delta: 10, // Minimum swipe distance
    swipeDuration: 500, // Maximum time for swipe gesture
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
      {/* Navigation indicator at top */}
      <div className="flex justify-center py-2 bg-gradient-to-r from-blue-600 to-blue-500 border-b border-blue-700">
        <div className="flex space-x-2">
          {screens.map((_, index) => (
            <div 
              key={index}
              className={`h-2 w-8 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white scale-110' : 'bg-blue-300 opacity-60'
              }`}
              onClick={() => navigateTo(screens[index])}
            />
          ))}
        </div>
      </div>
      
      {/* Screen content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SwipeableLayout;