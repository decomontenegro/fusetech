'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { featureFlagService } from './feature-flag-service';
import { FeatureFlag, FeatureFlagContext, FeatureFlagKey } from './types';
import { useAuth } from '../auth/useAuth';

interface FeatureFlagProviderProps {
  children: React.ReactNode;
  serverFlags?: Record<string, boolean>;
  context?: FeatureFlagContext;
}

interface FeatureFlagContextValue {
  isEnabled: (flagId: string) => boolean;
  toggleFlag: (flagId: string, enabled?: boolean) => void;
  getFlag: (flagId: string) => FeatureFlag | undefined;
  getAllFlags: () => FeatureFlag[];
  getFlagsByPhase: (phase: 'phase1' | 'phase2' | 'beta' | 'production') => FeatureFlag[];
  refreshFlags: () => Promise<void>;
}

const FeatureFlagReactContext = createContext<FeatureFlagContextValue | null>(null);

export function FeatureFlagProvider({ 
  children, 
  serverFlags,
  context: initialContext 
}: FeatureFlagProviderProps) {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Map<string, boolean>>(new Map());
  const [context, setContext] = useState<FeatureFlagContext>(initialContext || {});

  // Update context when user changes
  useEffect(() => {
    setContext(prev => ({
      ...prev,
      userId: user?.id,
      userGroups: user?.groups || [],
    }));
  }, [user]);

  // Load server flags on mount
  useEffect(() => {
    featureFlagService.loadServerFlags().then(() => {
      updateFlags();
    });
  }, []);

  // Apply server-side flags if provided (for SSR)
  useEffect(() => {
    if (serverFlags) {
      Object.entries(serverFlags).forEach(([key, value]) => {
        const flag = featureFlagService.getFlag(key);
        if (flag && !featureFlagService.isEnabled(key, context)) {
          featureFlagService.toggleFlag(key, value);
        }
      });
      updateFlags();
    }
  }, [serverFlags, context]);

  const updateFlags = useCallback(() => {
    const newFlags = new Map<string, boolean>();
    featureFlagService.getAllFlags().forEach(flag => {
      newFlags.set(flag.id, featureFlagService.isEnabled(flag.id, context));
    });
    setFlags(newFlags);
  }, [context]);

  const isEnabled = useCallback((flagId: string): boolean => {
    return featureFlagService.isEnabled(flagId, context);
  }, [context]);

  const toggleFlag = useCallback((flagId: string, enabled?: boolean) => {
    featureFlagService.toggleFlag(flagId, enabled);
    updateFlags();
  }, [updateFlags]);

  const getFlag = useCallback((flagId: string): FeatureFlag | undefined => {
    return featureFlagService.getFlag(flagId);
  }, []);

  const getAllFlags = useCallback((): FeatureFlag[] => {
    return featureFlagService.getAllFlags();
  }, []);

  const getFlagsByPhase = useCallback((phase: 'phase1' | 'phase2' | 'beta' | 'production'): FeatureFlag[] => {
    return featureFlagService.getFlagsByPhase(phase);
  }, []);

  const refreshFlags = useCallback(async (): Promise<void> => {
    await featureFlagService.loadServerFlags();
    updateFlags();
  }, [updateFlags]);

  const value: FeatureFlagContextValue = {
    isEnabled,
    toggleFlag,
    getFlag,
    getAllFlags,
    getFlagsByPhase,
    refreshFlags,
  };

  return (
    <FeatureFlagReactContext.Provider value={value}>
      {children}
    </FeatureFlagReactContext.Provider>
  );
}

export function useFeatureFlag(flagId: FeatureFlagKey): boolean {
  const context = useContext(FeatureFlagReactContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within FeatureFlagProvider');
  }
  
  const [enabled, setEnabled] = useState(() => context.isEnabled(flagId));

  useEffect(() => {
    // Subscribe to flag changes
    const unsubscribe = featureFlagService.onFlagChange(flagId, setEnabled);
    
    // Check current state
    setEnabled(context.isEnabled(flagId));
    
    return unsubscribe;
  }, [flagId, context]);

  return enabled;
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagReactContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within FeatureFlagProvider');
  }
  return context;
}

// HOC for feature flagging components
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flagId: FeatureFlagKey,
  FallbackComponent?: React.ComponentType<P>
): React.ComponentType<P> {
  return function FeatureFlaggedComponent(props: P) {
    const enabled = useFeatureFlag(flagId);
    
    if (!enabled && FallbackComponent) {
      return <FallbackComponent {...props} />;
    }
    
    return enabled ? <Component {...props} /> : null;
  };
}