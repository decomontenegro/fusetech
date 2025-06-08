'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlassTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function GlassTooltip({
  children,
  content,
  position = 'top',
  delay = 200,
  className = ''
}: GlassTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };
  
  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };
  
  const animationVariants = {
    top: { y: 10, opacity: 0 },
    bottom: { y: -10, opacity: 0 },
    left: { x: 10, opacity: 0 },
    right: { x: -10, opacity: 0 },
  };
  
  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={animationVariants[position]}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={animationVariants[position]}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className={`
              glass-strong rounded-lg px-3 py-2
              text-sm whitespace-nowrap
              border border-white/20
              shadow-lg
              ${className}
            `}>
              {content}
              
              {/* Arrow */}
              <div
                className={`
                  absolute w-3 h-3 glass-strong
                  border border-white/20
                  rotate-45
                  ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-t-0 border-l-0' : ''}
                  ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-b-0 border-r-0' : ''}
                  ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2 border-l-0 border-b-0' : ''}
                  ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 translate-x-1/2 border-r-0 border-t-0' : ''}
                `}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Popover variant with more content
interface GlassPopoverProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  className?: string;
}

export function GlassPopover({
  children,
  content,
  position = 'bottom',
  trigger = 'click',
  className = ''
}: GlassPopoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };
  
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };
  
  const animationVariants = {
    top: { y: 10, opacity: 0, scale: 0.95 },
    bottom: { y: -10, opacity: 0, scale: 0.95 },
    left: { x: 10, opacity: 0, scale: 0.95 },
    right: { x: -10, opacity: 0, scale: 0.95 },
  };
  
  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div onClick={handleTrigger}>
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <>
            {trigger === 'click' && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsVisible(false)}
              />
            )}
            
            <motion.div
              initial={animationVariants[position]}
              animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              exit={animationVariants[position]}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className={`absolute z-50 ${positionClasses[position]}`}
            >
              <div className={`
                glass-strong rounded-xl p-4
                border border-white/20
                shadow-xl min-w-[200px]
                ${className}
              `}>
                {content}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}