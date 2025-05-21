import React, { useState, useEffect, ReactNode, useRef } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  pullDownThreshold?: number;
  backgroundColor?: string;
}

const MobilePullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDownThreshold = 80,
  backgroundColor = '#f9fafb',
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  
  // Handle touch start
  const handleTouchStart = (e: TouchEvent) => {
    // Only trigger if we're at the top of the page
    if (window.scrollY <= 5) {
      startYRef.current = e.touches[0].clientY;
    }
  };

  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    if (!startYRef.current || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;
    
    // Only handle downward pull
    if (deltaY > 0 && window.scrollY <= 5) {
      setIsPulling(true);
      const newDistance = Math.min(deltaY * 0.5, pullDownThreshold * 1.5);
      setPullDistance(newDistance);
      
      // Prevent default scroll behavior when pulling down
      if (deltaY > 10) {
        e.preventDefault();
      }
    }
  };

  // Handle touch end
  const handleTouchEnd = async () => {
    if (!isPulling || !startYRef.current) return;
    
    if (pullDistance > pullDownThreshold && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error during refresh:', error);
      } finally {
        // Add a slight delay for UX
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
          startYRef.current = null;
        }, 800);
      }
    } else {
      // Reset if not pulled far enough
      setIsPulling(false);
      setPullDistance(0);
      startYRef.current = null;
    }
  };

  // Add and remove event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isRefreshing, isPulling, pullDistance]);

  // Calculate progress percentage for indicator
  const progress = Math.min(1, pullDistance / pullDownThreshold);
  
  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-auto relative"
      style={{ touchAction: isPulling ? 'none' : 'auto' }}
    >
      {/* Pull indicator */}
      <div 
        className="absolute left-0 right-0 top-0 flex justify-center items-center transition-transform z-50 pointer-events-none"
        style={{ 
          height: '80px',
          transform: `translateY(${(isPulling || isRefreshing) ? pullDistance - 80 : -80}px)`
        }}
      >
        <div className="bg-white shadow-md rounded-full p-3 flex items-center justify-center">
          {isRefreshing ? (
            <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
          ) : (
            <div 
              className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full transition-all duration-200"
              style={{ 
                opacity: progress,
                transform: `rotate(${progress * 360}deg)`
              }}
            />
          )}
        </div>
      </div>
      
      {/* Content container */}
      <div 
        className="min-h-full"
        style={{ 
          transform: isPulling ? `translateY(${pullDistance}px)` : 'none',
          transition: !isPulling ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobilePullToRefresh;