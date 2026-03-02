import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../stores/useUIStore';

export interface TouchInteractionsProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  sensitivity?: number;
  longPressDelay?: number;
}

const TouchInteractions: React.FC<TouchInteractionsProps> = ({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinchIn,
  onPinchOut,
  onLongPress,
  onDoubleTap,
  sensitivity = 50,
  longPressDelay = 500
}) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number; time: number } | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastTap, setLastTap] = useState<number>(0);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { showNotification } = useUIStore();

  // Calcular distância entre dois pontos
  const getDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Detectar direção do swipe
  const getSwipeDirection = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY && absDeltaX > sensitivity) {
      return deltaX > 0 ? 'right' : 'left';
    } else if (absDeltaY > sensitivity) {
      return deltaY > 0 ? 'down' : 'up';
    }
    return null;
  };

  // Executar ação baseada na direção do swipe
  const executeSwipeAction = (direction: string) => {
    switch (direction) {
      case 'left':
        onSwipeLeft?.();
        showNotification('Swipe para esquerda detectado', 'info');
        break;
      case 'right':
        onSwipeRight?.();
        showNotification('Swipe para direita detectado', 'info');
        break;
      case 'up':
        onSwipeUp?.();
        showNotification('Swipe para cima detectado', 'info');
        break;
      case 'down':
        onSwipeDown?.();
        showNotification('Swipe para baixo detectado', 'info');
        break;
    }
  };

  // Detectar pinch
  const handlePinch = (touches: TouchList) => {
    if (touches.length === 2) {
      const distance = getDistance(touches[0], touches[1]);
      
      if (initialDistance === null) {
        setInitialDistance(distance);
        setCurrentDistance(distance);
      } else {
        setCurrentDistance(distance);
        
        if (initialDistance && currentDistance) {
          const pinchThreshold = 20;
          const delta = currentDistance - initialDistance;
          
          if (Math.abs(delta) > pinchThreshold) {
            if (delta > 0) {
              onPinchOut?.();
              showNotification('Pinch out detectado', 'info');
            } else {
              onPinchIn?.();
              showNotification('Pinch in detectado', 'info');
            }
            setInitialDistance(null);
            setCurrentDistance(null);
          }
        }
      }
    }
  };

  // Handlers de touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: now
    });

    // Iniciar timer para long press
    const timer = setTimeout(() => {
      onLongPress?.();
      showNotification('Long press detectado', 'info');
    }, longPressDelay);
    
    setLongPressTimer(timer);

    // Detectar pinch
    if (e.touches.length === 2) {
      handlePinch(e.touches);
    }
  }, [onLongPress, longPressDelay, showNotification]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      handlePinch(e.touches);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const now = Date.now();
    
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: now
    });

    // Cancelar long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Detectar swipe
    if (touchStart && touchEnd) {
      const direction = getSwipeDirection(touchStart, touchEnd);
      if (direction) {
        executeSwipeAction(direction);
      }
    }

    // Detectar double tap
    const timeDiff = now - lastTap;
    if (timeDiff < 300 && timeDiff > 0) {
      onDoubleTap?.();
      showNotification('Double tap detectado', 'info');
    }
    setLastTap(now);

    // Resetar estados
    setTouchStart(null);
    setTouchEnd(null);
    setInitialDistance(null);
    setCurrentDistance(null);
  }, [touchStart, touchEnd, longPressTimer, lastTap, onDoubleTap, showNotification]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  // Indicadores visuais de touch
  const renderTouchIndicators = () => {
    if (!touchStart) return null;

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Indicador de touch */}
        <div
          className="absolute w-4 h-4 bg-blue-500 rounded-full opacity-50 animate-pulse"
          style={{
            left: touchStart.x - 8,
            top: touchStart.y - 8,
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Indicador de swipe */}
        {touchEnd && (
          <div
            className="absolute w-2 h-2 bg-green-500 rounded-full"
            style={{
              left: touchEnd.x - 4,
              top: touchEnd.y - 4,
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
      {renderTouchIndicators()}
    </div>
  );
};

export { TouchInteractions };
export type { TouchInteractionsProps };
