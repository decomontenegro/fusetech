'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

const glassInputVariants = cva(
  `
    w-full px-4 py-3 rounded-lg
    glass backdrop-blur-md
    border border-white/20
    text-primary placeholder:text-tertiary
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/50
    focus:border-primary/50
  `,
  {
    variants: {
      size: {
        sm: 'text-sm py-2 px-3',
        md: 'text-base py-3 px-4',
        lg: 'text-lg py-4 px-5',
      },
      variant: {
        default: 'glass-subtle hover:glass',
        filled: 'glass hover:glass-strong',
        minimal: 'glass-blur-sm border-transparent hover:border-white/20',
      },
      state: {
        default: '',
        error: 'border-error/50 focus:ring-error/50 focus:border-error/50',
        success: 'border-success/50 focus:ring-success/50 focus:border-success/50',
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
      state: 'default',
    },
  }
);

interface GlassInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof glassInputVariants> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  animated?: boolean;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      className,
      size,
      variant,
      state,
      label,
      error,
      success,
      icon,
      iconPosition = 'left',
      animated = true,
      ...props
    },
    ref
  ) => {
    const inputState = error ? 'error' : success ? 'success' : state;
    const Component = animated ? motion.div : 'div';
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary mb-2">
            {label}
          </label>
        )}
        
        <Component
          className="relative"
          whileFocus={animated ? { scale: 1.02 } : undefined}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={glassInputVariants({ 
              size, 
              variant, 
              state: inputState,
              className: `${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} ${className}`
            })}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary">
              {icon}
            </div>
          )}
        </Component>
        
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
        
        {success && !error && (
          <p className="mt-2 text-sm text-success">{success}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

// Textarea variant
interface GlassTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof glassInputVariants> {
  label?: string;
  error?: string;
  success?: string;
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  (
    {
      className,
      size,
      variant,
      state,
      label,
      error,
      success,
      ...props
    },
    ref
  ) => {
    const inputState = error ? 'error' : success ? 'success' : state;
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary mb-2">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={glassInputVariants({ 
            size, 
            variant, 
            state: inputState,
            className: `min-h-[100px] resize-y ${className}`
          })}
          {...props}
        />
        
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
        
        {success && !error && (
          <p className="mt-2 text-sm text-success">{success}</p>
        )}
      </div>
    );
  }
);

GlassTextarea.displayName = 'GlassTextarea';

export { GlassInput, glassInputVariants };