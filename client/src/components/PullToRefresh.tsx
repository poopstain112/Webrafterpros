import React, { useState, useEffect, ReactNode } from 'react';
import { useSwipeable, SwipeEventData } from 'react-swipeable';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  pullDownThreshold?: number;
  backgroundColor?: string;
  loadingColor?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDownThreshold = 100,
  backgroundColor = '#f3f4f6',
  loadingColor = '#3b82f6'
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Reset pull distance when refreshing changes
  useEffect(() => {
    if (!isRefreshing) {
      setPullDistance(0);
    }
  }, [isRefreshing]);

  const handleRefresh = async () => {
    if (pullDistance > pullDownThreshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      setIsPulling(false);
      
      // Invoke the refresh callback
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error during refresh:', error);
      } finally {
        // Allow a minimum refresh animation time
        setTimeout(() => {
          setIsRefreshing(false);
        }, 1000);
      }
    }
  };

  const handlers = useSwipeable({
    onSwiping: (event) => {
      // Only handle downward swipes when at the top of the page
      if (event.dir === 'Down' && window.scrollY <= 0) {
        setIsPulling(true);
        // Calculate pull distance with resistance to prevent excessive pulling
        const newPullDistance = Math.min(event.deltaY * 0.4, pullDownThreshold * 1.5);
        setPullDistance(newPullDistance > 0 ? newPullDistance : 0);
      }
    },
    onSwiped: () => {
      handleRefresh();
      setIsPulling(false);
    },
    trackMouse: false
  });

  // Calculate progress for the spinner animation
  const progress = Math.min(pullDistance / pullDownThreshold, 1);
  
  return (
    <div className="flex flex-col relative h-full overflow-auto" {...handlers}>
      {/* Pull-to-refresh indicator */}
      <div 
        className="absolute left-0 right-0 flex justify-center items-center transition-transform duration-300 z-10 pointer-events-none"
        style={{ 
          height: '60px',
          transform: `translateY(${isPulling || isRefreshing ? pullDistance - 60 : -60}px)`,
          backgroundColor: 'transparent'
        }}
      >
        {isRefreshing ? (
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" 
               style={{ borderColor: `${loadingColor} transparent transparent transparent` }} />
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full" 
                 style={{ 
                   borderColor: `${loadingColor} transparent transparent transparent`,
                   opacity: progress,
                   transform: `rotate(${progress * 360}deg)`
                 }} />
            <span className="text-xs mt-1 text-gray-600" style={{ opacity: progress }}>
              {progress >= 1 ? 'Release to refresh' : 'Pull down to refresh'}
            </span>
          </div>
        )}
      </div>
      
      {/* Main content with padding to accommodate the pull indicator */}
      <div className="flex-1 relative">
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;