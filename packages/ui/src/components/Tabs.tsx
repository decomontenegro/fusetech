import React from "react";
import { cn } from "../lib/utils";

// Interface para Tabs
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(defaultValue);
    
    const currentValue = value !== undefined ? value : localValue;
    
    const handleValueChange = (newValue: string) => {
      setLocalValue(newValue);
      onValueChange?.(newValue);
    };
    
    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        data-state={currentValue ? "active" : "inactive"}
        data-value={currentValue}
        {...props}
      />
    );
  }
);
Tabs.displayName = "Tabs";

// Interface para TabsList
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = "TabsList";

// Interface para TabsTrigger
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const tabsElement = React.useContext(TabsContext);
    
    const isActive = tabsElement?.value === value;
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50 hover:text-foreground",
          className
        )}
        onClick={() => tabsElement?.onValueChange?.(value)}
        data-state={isActive ? "active" : "inactive"}
        data-value={value}
        {...props}
      />
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

// Interface para TabsContent
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const tabsElement = React.useContext(TabsContext);
    
    const isActive = tabsElement?.value === value;
    
    if (!isActive) return null;
    
    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        data-state={isActive ? "active" : "inactive"}
        data-value={value}
        {...props}
      />
    );
  }
);
TabsContent.displayName = "TabsContent";

// Contexto para compartilhar estado entre componentes de tabs
interface TabsContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

export { Tabs, TabsList, TabsTrigger, TabsContent }; 