'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

const glassNavVariants = cva(
  `glass backdrop-blur-md border border-white/20 transition-all duration-300`,
  {
    variants: {
      variant: {
        default: 'glass-subtle',
        elevated: 'glass shadow-glass',
        floating: 'glass-strong shadow-xl',
      },
      position: {
        top: 'fixed top-0 left-0 right-0 z-40',
        bottom: 'fixed bottom-0 left-0 right-0 z-40',
        static: 'relative',
      },
      padding: {
        none: 'p-0',
        sm: 'px-4 py-2',
        md: 'px-6 py-3',
        lg: 'px-8 py-4',
      }
    },
    defaultVariants: {
      variant: 'default',
      position: 'static',
      padding: 'md',
    },
  }
);

interface GlassNavProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof glassNavVariants> {
  animated?: boolean;
}

export const GlassNav = forwardRef<HTMLElement, GlassNavProps>(
  ({ className, variant, position, padding, animated = true, children, ...props }, ref) => {
    const Component = animated ? motion.nav : 'nav';
    
    return (
      <Component
        ref={ref}
        className={glassNavVariants({ variant, position, padding, className })}
        initial={animated ? { y: position === 'top' ? -100 : position === 'bottom' ? 100 : 0 } : undefined}
        animate={animated ? { y: 0 } : undefined}
        transition={animated ? { type: "spring", stiffness: 300, damping: 30 } : undefined}
        {...(props as any)}
      >
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      </Component>
    );
  }
);

GlassNav.displayName = 'GlassNav';

// Mobile bottom navigation variant
interface GlassBottomNavProps {
  items: {
    icon: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
  }[];
}

export function GlassBottomNav({ items }: GlassBottomNavProps) {
  return (
    <GlassNav variant="elevated" position="bottom" padding="none">
      <div className="flex items-center justify-around py-2">
        {items.map((item, index) => (
          <motion.button
            key={index}
            onClick={item.onClick}
            className={`
              flex flex-col items-center justify-center
              px-3 py-2 rounded-lg min-w-[64px]
              transition-all duration-200
              ${item.active 
                ? 'text-primary glass-subtle' 
                : 'text-tertiary hover:text-secondary'
              }
            `}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`
              p-2 rounded-lg mb-1
              ${item.active ? 'bg-primary/10' : ''}
            `}>
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </GlassNav>
  );
}

// Desktop sidebar navigation variant
interface GlassSidebarProps {
  items: {
    icon?: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    children?: {
      label: string;
      href?: string;
      onClick?: () => void;
    }[];
  }[];
  collapsed?: boolean;
}

export function GlassSidebar({ items, collapsed = false }: GlassSidebarProps) {
  return (
    <motion.aside
      className="glass-subtle backdrop-blur-md border-r border-white/20 h-full"
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <nav className="p-4 space-y-2">
        {items.map((item, index) => (
          <motion.div key={index}>
            <button
              onClick={item.onClick}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 glass-hover
                ${item.active 
                  ? 'glass text-primary border border-primary/20' 
                  : 'hover:glass-subtle text-secondary hover:text-primary'
                }
              `}
            >
              {item.icon && (
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
              )}
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
            
            {/* Sub-items */}
            {!collapsed && item.children && item.active && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-10 mt-2 space-y-1"
              >
                {item.children.map((child, childIndex) => (
                  <button
                    key={childIndex}
                    onClick={child.onClick}
                    className="
                      w-full text-left px-4 py-2 rounded-lg
                      text-sm text-tertiary hover:text-primary
                      hover:glass-subtle transition-all duration-200
                    "
                  >
                    {child.label}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        ))}
      </nav>
    </motion.aside>
  );
}