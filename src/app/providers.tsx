'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { FeatureFlagProvider } from '@/lib/feature-flags';

interface ProvidersProps {
  children: React.ReactNode;
  serverFlags?: Record<string, boolean>;
}

export function Providers({ children, serverFlags }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FeatureFlagProvider serverFlags={serverFlags}>
        {children}
      </FeatureFlagProvider>
    </ThemeProvider>
  );
}
