'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, Variants } from 'framer-motion';

const glassCardVariants = cva(
  `relative overflow-hidden rounded-2xl transition-all duration-300`,
  {
    variants: {
      variant: {
        default: `
          glass border 
          hover:shadow-xl dark:hover:bg-white/10
        `,
        elevated: `
          glass border shadow-glass
          hover:shadow-2xl hover:translate-y-[-2px]
          dark:shadow-lg dark:hover:shadow-xl
        `,
        interactive: `
          glass border cursor-pointer
          hover:bg-white/10 dark:hover:bg-white/15
          active:scale-[0.98] transition-transform
        `,
        gradient: `
          bg-gradient-to-br from-white/10 to-white/5
          dark:from-white/5 dark:to-white/[0.02]
          backdrop-blur-md border
          hover:from-white/15 hover:to-white/10
          dark:hover:from-white/10 dark:hover:to-white/5
        `,
        subtle: `
          glass-subtle border-0
          hover:bg-white/10 dark:hover:bg-white/5
        `,
        strong: `
          glass-strong border shadow-md
          hover:shadow-lg dark:hover:shadow-xl
        `,
      },
      blur: {
        none: 'backdrop-blur-none',
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      blur: 'md',
      padding: 'md',
    },
  }
);

// Animation variants for different effects
const animationVariants: Record<string, Variants> = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
};

export interface GlassCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  animation?: keyof typeof animationVariants;
  animationDelay?: number;
  glowColor?: string;
  enableGlow?: boolean;
  children: React.ReactNode;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      variant,
      blur,
      padding,
      animation = 'fadeIn',
      animationDelay = 0,
      glowColor = 'var(--color-primary)',
      enableGlow = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={glassCardVariants({ variant, blur, padding, className })}
        variants={animationVariants[animation]}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          duration: 0.5,
          delay: animationDelay,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {/* Glow effect */}
        {enableGlow && (
          <div
            className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at center, ${glowColor}40 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
        )}

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">{children}</div>

        {/* Noise texture for glass effect */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

// Specialized glass components
export const GlassPanel = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, ...props }, ref) => (
    <GlassCard
      ref={ref}
      variant="elevated"
      className={`w-full ${className}`}
      {...props}
    />
  )
);

GlassPanel.displayName = 'GlassPanel';

export const GlassButton = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, ...props }, ref) => (
    <GlassCard
      ref={ref}
      variant="interactive"
      padding="sm"
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    />
  )
);

GlassButton.displayName = 'GlassButton';

export { GlassCard, glassCardVariants };