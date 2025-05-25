import React, { InputHTMLAttributes, forwardRef } from 'react';
import { combineClasses } from '../styles/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          className={combineClasses(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-muted-foreground mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 