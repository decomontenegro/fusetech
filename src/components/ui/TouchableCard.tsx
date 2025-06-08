'use client';

import { useState, useRef, TouchEvent, MouseEvent, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TouchableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  className?: string;
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  swipeThreshold?: number;
  disabled?: boolean;
  role?: string;
  ariaLabel?: string;
  tabIndex?: number;
}

export function TouchableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className = '',
  hapticFeedback = 'light',
  swipeThreshold = 100,
  disabled = false,
  role = 'button',
  ariaLabel,
  tabIndex = 0,
}: TouchableCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showLeftAction, setShowLeftAction] = useState(false);
  const [showRightAction, setShowRightAction] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Haptic feedback (for mobile devices)
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    if ('vibrate' in navigator) {
      const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
  };

  const handleStart = (clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
    startX.current = clientX;
    triggerHaptic(hapticFeedback);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || disabled) return;
    const diff = clientX - startX.current;
    setDragX(diff);
    
    // Show action indicators
    if (diff > swipeThreshold / 2) {
      setShowRightAction(true);
      setShowLeftAction(false);
    } else if (diff < -swipeThreshold / 2) {
      setShowLeftAction(true);
      setShowRightAction(false);
    } else {
      setShowLeftAction(false);
      setShowRightAction(false);
    }
  };

  const handleEnd = () => {
    if (!isDragging || disabled) return;
    
    if (Math.abs(dragX) > swipeThreshold) {
      if (dragX > 0 && onSwipeRight) {
        onSwipeRight();
        triggerHaptic('medium');
      } else if (dragX < 0 && onSwipeLeft) {
        onSwipeLeft();
        triggerHaptic('medium');
      }
    } else if (Math.abs(dragX) < 10 && onTap) {
      onTap();
      triggerHaptic('light');
    }
    
    // Reset
    setIsDragging(false);
    setDragX(0);
    setShowLeftAction(false);
    setShowRightAction(false);
  };

  // Touch events
  const handleTouchStart = (e: TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events (for desktop)
  const handleMouseDown = (e: MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Keyboard support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (onTap) {
          onTap();
          triggerHaptic('light');
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (onSwipeLeft) {
          onSwipeLeft();
          triggerHaptic('medium');
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (onSwipeRight) {
          onSwipeRight();
          triggerHaptic('medium');
        }
        break;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action indicators */}
      <AnimatePresence>
        {showLeftAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center" aria-hidden="true">
              <span className="text-error text-xl">✕</span>
            </div>
          </motion.div>
        )}
        
        {showRightAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
          >
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center" aria-hidden="true">
              <span className="text-success text-xl">✓</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card content */}
      <motion.div
        ref={cardRef}
        className={`
          relative touch-pan-y select-none cursor-grab active:cursor-grabbing
          transition-shadow duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        style={{
          transform: `translateX(${isDragging ? dragX : 0}px) scale(${isDragging ? 0.98 : 1})`,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        animate={{
          boxShadow: isDragging 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }}
        role={role}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : tabIndex}
      >
        {children}
      </motion.div>
    </div>
  );
}