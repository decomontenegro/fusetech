'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  animationDelay?: number;
  subtitle?: string;
}

const colorClasses = {
  primary: 'text-primary bg-primary/10 dark:text-primary dark:bg-primary/15',
  secondary: 'text-secondary bg-secondary/10 dark:text-secondary dark:bg-secondary/15',
  success: 'text-success bg-success/10 dark:text-success dark:bg-success/15',
  warning: 'text-warning bg-warning/10 dark:text-warning dark:bg-warning/15',
  error: 'text-error bg-error/10 dark:text-error dark:bg-error/15',
  info: 'text-info bg-info/10 dark:text-info dark:bg-info/15',
};

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color = 'primary',
  loading = false,
  animationDelay = 0,
  subtitle,
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const changeColor = isPositive ? 'text-success' : 'text-error';

  return (
    <GlassCard
      variant="elevated"
      animation="scaleIn"
      animationDelay={animationDelay}
      enableGlow
      glowColor={`var(--color-${color})`}
      className="group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-xs sm:text-sm font-medium text-text-secondary mb-1 truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-text-tertiary mb-1 truncate">{subtitle}</p>
          )}

          {/* Value */}
          {loading ? (
            <div className="h-7 sm:h-8 w-20 sm:w-24 bg-bg-secondary rounded-lg animate-pulse" />
          ) : (
            <motion.p
              className="text-xl sm:text-2xl font-bold text-text-primary truncate"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: animationDelay + 0.2 }}
            >
              {value}
            </motion.p>
          )}

          {/* Change indicator */}
          {change !== undefined && !loading && (
            <motion.div
              className="flex items-center gap-1 mt-1 sm:mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animationDelay + 0.3 }}
            >
              <span className={`text-xs sm:text-sm font-medium ${changeColor}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-text-tertiary hidden sm:inline">{changeLabel}</span>
              )}
            </motion.div>
          )}
        </div>

        {/* Icon */}
        <motion.div
          className={`
            p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 shrink-0
            ${colorClasses[color]}
            group-hover:scale-110 group-hover:rotate-3
          `}
          whileHover={{ rotate: 6 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
      </div>

      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 80% 20%, var(--color-${color})20 0%, transparent 50%)`,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
    </GlassCard>
  );
}

// Grid component for stats - Mobile optimized
export function StatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {children}
    </div>
  );
}