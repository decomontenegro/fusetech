'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

const buttonVariants = cva(
  // Base styles - mobile-first with 44px minimum touch target
  `inline-flex items-center justify-center font-medium transition-all duration-200
   disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
   min-h-[44px] px-6 rounded-xl relative overflow-hidden
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`,
  {
    variants: {
      variant: {
        primary: `
          bg-gradient-primary text-white shadow-sm
          hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
          focus-visible:ring-primary dark:shadow-md
        `,
        secondary: `
          glass text-text-primary border border-border-primary
          hover:bg-bg-hover hover:border-border-secondary
          active:bg-bg-active focus-visible:ring-primary
          dark:border-border-primary dark:hover:bg-bg-hover
        `,
        ghost: `
          text-text-secondary hover:text-text-primary hover:bg-bg-hover
          active:bg-bg-active focus-visible:ring-primary
          dark:hover:bg-bg-hover dark:active:bg-bg-active
        `,
        glass: `
          glass-subtle text-text-primary border border-glass-border
          hover:glass hover:border-glass-border hover:shadow-glass
          active:scale-[0.98] focus-visible:ring-primary/50
          backdrop-blur-md dark:border-glass-border
        `,
        glassColored: `
          bg-primary/10 backdrop-blur-md text-primary
          border border-primary/20 hover:bg-primary/20
          hover:border-primary/30 hover:shadow-glass
          active:scale-[0.98] focus-visible:ring-primary
          dark:bg-primary/15 dark:hover:bg-primary/25
        `,
        danger: `
          bg-error text-white hover:bg-error-hover
          hover:shadow-lg active:scale-[0.98]
          focus-visible:ring-error dark:bg-error dark:hover:bg-error-hover
        `,
        success: `
          bg-success text-white hover:bg-success-hover
          hover:shadow-lg active:scale-[0.98]
          focus-visible:ring-success dark:bg-success dark:hover:bg-success-hover
        `,
        warning: `
          bg-warning text-white hover:bg-warning-hover
          hover:shadow-lg active:scale-[0.98]
          focus-visible:ring-warning dark:bg-warning dark:hover:bg-warning-hover
        `,
        info: `
          bg-info text-white hover:bg-info-hover
          hover:shadow-lg active:scale-[0.98]
          focus-visible:ring-info dark:bg-info dark:hover:bg-info-hover
        `,
      },
      size: {
        sm: 'text-sm min-h-[36px] px-4 rounded-lg',
        md: 'text-base min-h-[44px] px-6 rounded-xl',
        lg: 'text-lg min-h-[52px] px-8 rounded-2xl',
        xl: 'text-xl min-h-[60px] px-10 rounded-2xl',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      loading: {
        true: 'cursor-wait',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  haptic?: boolean;
  ariaLabel?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      icon,
      iconPosition = 'left',
      haptic = true,
      disabled,
      children,
      onClick,
      ariaLabel,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Haptic feedback for mobile
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Ripple effect
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.classList.add('ripple');

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);

      if (onClick) {
        onClick(e);
      }
    };

    return (
      <motion.button
        ref={ref}
        className={buttonVariants({ variant, size, fullWidth, loading, className })}
        disabled={disabled || loading}
        onClick={handleClick}
        whileTap={{ scale: 0.98 }}
        type={props.type || 'button'}
        name={props.name}
        value={props.value}
        form={props.form}
        formAction={props.formAction}
        formEncType={props.formEncType}
        formMethod={props.formMethod}
        formNoValidate={props.formNoValidate}
        formTarget={props.formTarget}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        role={props.role}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
              role="img"
              aria-label="Loading"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Button content */}
        <span className={`flex items-center gap-2 ${loading ? 'opacity-0' : ''}`}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };

// Add ripple effect styles to your global CSS
const rippleStyles = `
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = rippleStyles;
  document.head.appendChild(style);
}