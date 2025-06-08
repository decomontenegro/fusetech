'use client';

import { SelectHTMLAttributes, forwardRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

const glassSelectVariants = cva(
  `
    w-full px-4 py-3 rounded-lg
    glass backdrop-blur-md
    border border-white/20
    text-primary
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary/50
    focus:border-primary/50
    appearance-none cursor-pointer
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
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface GlassSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof glassSelectVariants> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
  animated?: boolean;
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  (
    {
      className,
      size,
      variant,
      label,
      error,
      options,
      placeholder = 'Select an option',
      animated = true,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
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
          whileTap={animated ? { scale: 0.98 } : undefined}
        >
          <select
            ref={ref}
            className={glassSelectVariants({ size, variant, className })}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-tertiary" />
          </motion.div>
        </Component>
        
        {error && (
          <p className="mt-2 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';

// Custom dropdown variant with glassmorphism
interface GlassDropdownProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'minimal';
}

export function GlassDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  size = 'md',
  variant = 'default'
}: GlassDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={glassSelectVariants({ size, variant })}
        >
          <span className={selectedOption ? '' : 'text-tertiary'}>
            {selectedOption?.label || placeholder}
          </span>
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-tertiary" />
          </motion.div>
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2"
            >
              <div className="glass-strong rounded-lg border border-white/20 overflow-hidden">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => {
                      onChange?.(option.value);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left
                      hover:bg-white/10 transition-colors
                      ${option.value === value ? 'bg-primary/10 text-primary' : ''}
                      ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  );
}