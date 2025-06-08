'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme/theme-provider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
    );
  }

  const toggleTheme = () => {
    const themeOrder: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      case 'system':
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getTooltip = () => {
    switch (theme) {
      case 'light':
        return 'Modo claro';
      case 'dark':
        return 'Modo escuro';
      case 'system':
        return 'Seguir sistema';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="group relative p-2 rounded-lg glass hover:bg-white/10 dark:hover:bg-white/5 
                 transition-all duration-200 transform hover:scale-105"
      aria-label={`Alternar tema. Tema atual: ${getTooltip()}`}
      aria-pressed={false}
      role="button"
      title={getTooltip()}
    >
      <div className="relative">
        {/* Animated background glow */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400 to-pink-400 
                        opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300" />
        
        {/* Icon with smooth transition */}
        <div className="relative text-gray-700 dark:text-gray-200 transition-colors" aria-hidden="true">
          {getIcon()}
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 
                      bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 
                      text-xs rounded-md opacity-0 group-hover:opacity-100 
                      pointer-events-none transition-opacity duration-200 whitespace-nowrap"
           role="tooltip"
           aria-hidden="true">
        {getTooltip()}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 
                        w-0 h-0 border-4 border-transparent border-t-gray-900 
                        dark:border-t-gray-100" />
      </div>
    </button>
  );
}