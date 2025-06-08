'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, Trophy, Gift, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'Atividades', path: '/dashboard/activities', icon: Activity },
  { name: 'Desafios', path: '/dashboard/challenges', icon: Trophy },
  { name: 'Resgates', path: '/dashboard/rewards', icon: Gift },
  { name: 'Perfil', path: '/profile', icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  // Don't show on non-dashboard pages
  if (!pathname.startsWith('/dashboard') && pathname !== '/profile') {
    return null;
  }

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-primary/20 safe-area-inset-bottom bg-primary/95 backdrop-blur-xl"
      role="navigation" 
      aria-label="Navegação principal móvel"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full group touch-target"
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary to-secondary rounded-b-full"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    exit={{ scaleX: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
              
              {/* Icon with animation */}
              <motion.div
                className={`
                  relative p-1.5 rounded-xl transition-all duration-200
                  ${isActive ? 'text-primary' : 'text-secondary'}
                `}
                whileTap={{ scale: 0.9 }}
                animate={isActive ? { y: -2 } : { y: 0 }}
              >
                <Icon 
                  className={`
                    w-5 h-5 transition-all duration-200
                    ${isActive ? 'scale-110' : 'group-active:scale-95'}
                  `}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Ripple effect on tap */}
                <motion.span
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ display: 'none' }}
                />
              </motion.div>
              
              {/* Label */}
              <span 
                className={`
                  text-xs mt-0.5 transition-all duration-200
                  ${isActive ? 'text-primary font-medium' : 'text-secondary'}
                `}
              >
                {item.name}
              </span>
              
              {/* Touch feedback */}
              <span 
                className="absolute inset-0 rounded-lg"
                onClick={(e) => {
                  // Haptic feedback
                  if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                  }
                }}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Hook to adjust main content padding when bottom nav is present
export function useBottomNavigation() {
  const pathname = usePathname();
  const hasBottomNav = pathname.startsWith('/dashboard') || pathname === '/profile';
  
  return {
    hasBottomNav,
    paddingClass: hasBottomNav ? 'pb-20 lg:pb-0' : '',
  };
}