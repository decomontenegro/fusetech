'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  defaultSnapPoint?: number;
  enableOverlay?: boolean;
  enableSwipeToClose?: boolean;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9], // 50% and 90% of viewport height
  defaultSnapPoint = 0,
  enableOverlay = true,
  enableSwipeToClose = true,
  className = '',
}: BottomSheetProps) {
  const [currentSnapPoint, setCurrentSnapPoint] = useState(defaultSnapPoint);
  const [viewportHeight, setViewportHeight] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  const sheetHeight = viewportHeight * snapPoints[currentSnapPoint];

  const handleDragEnd = (event: any, info: PanInfo) => {
    const shouldClose = enableSwipeToClose && info.offset.y > 100 && info.velocity.y > 0;
    
    if (shouldClose) {
      onClose();
      return;
    }

    // Find closest snap point
    const currentY = sheetHeight - info.offset.y;
    const distances = snapPoints.map((point, index) => ({
      index,
      distance: Math.abs(viewportHeight * point - currentY),
    }));
    
    distances.sort((a, b) => a.distance - b.distance);
    setCurrentSnapPoint(distances[0].index);
  };

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {enableOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-[998] backdrop-blur-sm"
              role="button"
              tabIndex={0}
              aria-label="Fechar bottom sheet"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClose();
                }
              }}
            />
          )}

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: `calc(100% - ${sheetHeight}px)` }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{
              top: 0,
              bottom: 0,
            }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={`
              fixed bottom-0 left-0 right-0 z-[999]
              bg-card rounded-t-3xl shadow-2xl
              touch-none overflow-hidden
              ${className}
            `}
            style={{
              maxHeight: '90vh',
              height: `${sheetHeight}px`,
            }}
            role="dialog"
            aria-modal="true"
            aria-label={title || "Bottom sheet"}
            tabIndex={-1}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-2 pb-4" role="button" tabIndex={0} aria-label="Arraste para redimensionar">
              <div className="w-12 h-1 bg-border-secondary rounded-full" aria-hidden="true" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 pb-4 border-b border-border-primary">
                <h3 className="text-lg font-semibold text-primary">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-hover transition-colors"
                  aria-label="Fechar bottom sheet"
                  type="button"
                >
                  <X className="w-5 h-5 text-secondary" aria-hidden="true" />
                </button>
              </div>
            )}

            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto overscroll-contain px-6 py-4"
              style={{
                maxHeight: `calc(${sheetHeight}px - ${title ? '120px' : '60px'})`,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}