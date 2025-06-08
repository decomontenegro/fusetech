'use client';

import { motion } from 'framer-motion';

interface MobileLoaderProps {
  text?: string;
  fullScreen?: boolean;
}

export function MobileLoader({ text = 'Carregando...', fullScreen = false }: MobileLoaderProps) {
  const containerClass = fullScreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-primary/95 backdrop-blur-sm'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        {/* Animated dots loader */}
        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-primary rounded-full"
              animate={{
                y: [0, -12, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        {/* Loading text */}
        <motion.p
          className="text-sm text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      </div>
    </div>
  );
}

// Skeleton loader for content
export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-secondary/20 rounded-lg"
          style={{
            width: `${100 - (index % 2) * 20}%`,
          }}
        />
      ))}
    </div>
  );
}

// Card skeleton for mobile
export function CardSkeleton() {
  return (
    <div className="glass p-4 rounded-xl animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-secondary/20 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-secondary/20 rounded-lg w-3/4" />
          <div className="h-3 bg-secondary/20 rounded-lg w-1/2" />
        </div>
      </div>
    </div>
  );
}

// Grid skeleton for mobile
export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass p-4 rounded-xl animate-pulse">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-secondary/20 rounded-lg w-1/2" />
              <div className="w-8 h-8 bg-secondary/20 rounded-lg" />
            </div>
            <div className="h-6 bg-secondary/20 rounded-lg w-3/4" />
            <div className="h-3 bg-secondary/20 rounded-lg w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}