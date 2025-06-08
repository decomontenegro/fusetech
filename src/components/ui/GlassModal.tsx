'use client';

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]'
};

export function GlassModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true
}: GlassModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              damping: 25,
              stiffness: 300
            }}
            className={`
              fixed left-1/2 top-1/2 z-50 w-full
              -translate-x-1/2 -translate-y-1/2
              ${modalSizes[size]} p-4
            `}
          >
            <div className="glass-strong rounded-2xl p-6 relative">
              {/* Glass gradient overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between mb-4 relative z-10">
                  {title && (
                    <h2 className="text-xl font-semibold text-primary">
                      {title}
                    </h2>
                  )}
                  
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="
                        ml-auto p-2 rounded-lg
                        glass-subtle glass-hover
                        hover:bg-red-500/10 hover:border-red-500/20
                        transition-all duration-200
                      "
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="relative z-10">
                {children}
              </div>
              
              {/* Decorative blur circles */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Specialized modal variants
export function GlassAlert({ 
  isOpen, 
  onClose, 
  title, 
  message,
  type = 'info' 
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}) {
  const typeColors = {
    info: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error'
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <h3 className={`text-lg font-semibold mb-2 ${typeColors[type]}`}>
          {title}
        </h3>
        <p className="text-secondary mb-4">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 glass-subtle rounded-lg glass-hover"
        >
          OK
        </button>
      </div>
    </GlassModal>
  );
}