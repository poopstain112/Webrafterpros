import React, { useState, useEffect, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}

const SimplePullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  const pullThreshold = 80; // Minimum distance to pull before triggering refresh
  
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull to refresh at the top of the page
    if (window.scrollY <= 0) {
      setStartY(e.touches[0].clientY);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null || refreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    // Only allow pulling down
    if (diff > 0) {
      setPulling(true);
      // Apply resistance to make pull feel natural
      const newDistance = Math.min(diff * 0.4, 120);
      setPullDistance(newDistance);
      
      // Prevent default scrolling when pulling down
      if (window.scrollY <= 0) {
        e.preventDefault();
      }
    }
  };
  
  const handleTouchEnd = async () => {
    if (!pulling) return;
    
    if (pullDistance > pullThreshold && !refreshing) {
      setRefreshing(true);
      setPulling(false);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error during refresh:', error);
      } finally {
        // Ensure a minimum visual feedback for refreshing
        setTimeout(() => {
          setRefreshing(false);
          setPullDistance(0);
          setStartY(null);
        }, 1000);
      }
    } else {
      // Reset if not pulled far enough
      setPulling(false);
      setPullDistance(0);
      setStartY(null);
    }
  };
  
  return (
    <div 
      className="h-full overflow-auto relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className="absolute left-0 right-0 flex justify-center items-center transition-transform z-10 pointer-events-none"
        style={{ 
          height: '60px',
          transform: `translateY(${(pulling || refreshing) ? pullDistance - 60 : -60}px)`,
        }}
      >
        {refreshing ? (
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin border-blue-500" />
        ) : (
          <div className="flex flex-col items-center">
            <div 
              className="w-6 h-6 border-2 border-t-transparent rounded-full border-blue-500"
              style={{ 
                opacity: Math.min(pullDistance / pullThreshold, 1),
                transform: `rotate(${(pullDistance / pullThreshold) * 360}deg)`
              }} 
            />
            <span 
              className="text-xs mt-1 text-gray-600"
              style={{ opacity: Math.min(pullDistance / pullThreshold, 1) }}
            >
              {pullDistance > pullThreshold ? 'Release to refresh' : 'Pull down to refresh'}
            </span>
          </div>
        )}
      </div>
      
      {/* Main content */}
      <div className="min-h-full">{children}</div>
    </div>
  );
};

export default SimplePullToRefresh;