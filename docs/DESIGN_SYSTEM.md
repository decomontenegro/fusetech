# 🎨 FUSEtech Design System

## Overview

This document outlines the design system used in FUSEtech, including color palettes, typography, spacing, components, and design principles.

## Design Principles

### 1. **Modern & Energetic**
- Use vibrant gradients and colors that evoke energy and movement
- Clean, contemporary layouts with plenty of white space
- Smooth animations and transitions

### 2. **Accessible & Inclusive**
- High contrast ratios for readability
- Clear visual hierarchy
- Support for different screen sizes and devices

### 3. **Consistent & Scalable**
- Reusable component patterns
- Standardized spacing and sizing
- Cohesive visual language across all pages

## Color Palette

### Primary Colors
```css
/* Blue - Trust, Reliability */
--blue-50: #eff6ff;
--blue-100: #dbeafe;
--blue-500: #3b82f6;
--blue-600: #2563eb;
--blue-700: #1d4ed8;

/* Purple - Innovation, Creativity */
--purple-50: #faf5ff;
--purple-100: #f3e8ff;
--purple-500: #8b5cf6;
--purple-600: #7c3aed;
--purple-700: #6d28d9;

/* Pink - Energy, Passion */
--pink-50: #fdf2f8;
--pink-100: #fce7f3;
--pink-500: #ec4899;
--pink-600: #db2777;
--pink-700: #be185d;
```

### Secondary Colors
```css
/* Green - Success, Achievement */
--green-50: #f0fdf4;
--green-100: #dcfce7;
--green-500: #22c55e;
--green-600: #16a34a;

/* Yellow - Warning, Attention */
--yellow-50: #fefce8;
--yellow-100: #fef3c7;
--yellow-500: #eab308;
--yellow-600: #ca8a04;

/* Red - Error, Danger */
--red-50: #fef2f2;
--red-100: #fee2e2;
--red-500: #ef4444;
--red-600: #dc2626;
```

### Neutral Colors
```css
/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

## Gradients

### Primary Gradients
```css
/* Main Brand Gradient */
.gradient-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
}

/* Background Gradients */
.gradient-bg-light {
  background: linear-gradient(135deg, #eff6ff 0%, #faf5ff 50%, #fdf2f8 100%);
}

.gradient-bg-dark {
  background: linear-gradient(135deg, #1e293b 0%, #312e81 50%, #7c2d12 100%);
}
```

## Typography

### Font Family
```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Font Sizes
```css
/* Text Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

## Spacing System

### Spacing Scale
```css
/* Spacing Values */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Component Patterns

### Cards
```css
/* Standard Card */
.card {
  @apply bg-white rounded-xl shadow-lg border border-gray-100 p-6;
}

/* Gradient Card */
.card-gradient {
  @apply bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-lg border border-white/20 p-6;
}

/* Interactive Card */
.card-interactive {
  @apply bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer;
}
```

### Buttons
```css
/* Primary Button */
.btn-primary {
  @apply bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300;
}

/* Success Button */
.btn-success {
  @apply bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg;
}
```

### Badges
```css
/* Achievement Badge */
.badge-achievement {
  @apply bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold py-1 px-3 rounded-full shadow-md;
}

/* Status Badge */
.badge-status {
  @apply bg-green-100 text-green-800 text-sm font-medium py-1 px-3 rounded-full;
}

/* Token Badge */
.badge-token {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold py-1 px-3 rounded-full shadow-md;
}
```

## Icons

### Icon System
- **Library**: Lucide React
- **Size**: 16px, 20px, 24px, 32px, 48px
- **Style**: Outline style for consistency
- **Color**: Inherit from parent or use semantic colors

### Common Icons
```typescript
// Activity Icons
import { Activity, Bike, MapPin, Clock, Zap } from 'lucide-react';

// Navigation Icons
import { Home, User, BarChart3, ShoppingBag } from 'lucide-react';

// Action Icons
import { Plus, Edit, Trash2, Share, Heart } from 'lucide-react';

// Status Icons
import { Check, X, AlertCircle, Info } from 'lucide-react';
```

## Responsive Design

### Breakpoints
```css
/* Mobile First Approach */
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Medium devices */
--screen-lg: 1024px;  /* Large devices */
--screen-xl: 1280px;  /* Extra large devices */
--screen-2xl: 1536px; /* 2X large devices */
```

### Grid System
```css
/* Container Sizes */
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
  max-width: 1280px;
}

/* Grid Layouts */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}
```

## Animation & Transitions

### Standard Transitions
```css
/* Smooth Transitions */
.transition-smooth {
  @apply transition-all duration-300 ease-in-out;
}

/* Hover Effects */
.hover-lift {
  @apply hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300;
}

/* Loading Animation */
.animate-pulse-slow {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Accessibility

### Focus States
```css
/* Focus Ring */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Skip Links */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50;
}
```

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements have clear focus indicators
- Color is not the only way to convey information

## Usage Guidelines

### Do's
- ✅ Use consistent spacing from the spacing scale
- ✅ Apply gradients for primary actions and highlights
- ✅ Maintain proper contrast ratios
- ✅ Use semantic colors for status indicators
- ✅ Follow the component patterns for consistency

### Don'ts
- ❌ Create custom spacing values outside the scale
- ❌ Use more than 3 colors in a single gradient
- ❌ Ignore accessibility guidelines
- ❌ Mix different icon styles
- ❌ Override component patterns without good reason

---

This design system ensures consistency across the FUSEtech platform while maintaining flexibility for future enhancements.
