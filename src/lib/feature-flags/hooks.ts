import { useEffect, useState } from 'react';
import { useFeatureFlag, useFeatureFlags } from './feature-flag-provider';
import { FeatureFlagKey } from './types';

/**
 * Hook to check if all specified features are enabled
 */
export function useAllFeaturesEnabled(...flagIds: FeatureFlagKey[]): boolean {
  const { isEnabled } = useFeatureFlags();
  const [allEnabled, setAllEnabled] = useState(false);

  useEffect(() => {
    const checkFlags = () => {
      const result = flagIds.every(flagId => isEnabled(flagId));
      setAllEnabled(result);
    };

    checkFlags();
  }, [flagIds, isEnabled]);

  return allEnabled;
}

/**
 * Hook to check if any of the specified features are enabled
 */
export function useAnyFeatureEnabled(...flagIds: FeatureFlagKey[]): boolean {
  const { isEnabled } = useFeatureFlags();
  const [anyEnabled, setAnyEnabled] = useState(false);

  useEffect(() => {
    const checkFlags = () => {
      const result = flagIds.some(flagId => isEnabled(flagId));
      setAnyEnabled(result);
    };

    checkFlags();
  }, [flagIds, isEnabled]);

  return anyEnabled;
}

/**
 * Hook to get the enabled state of multiple features
 */
export function useMultipleFeatureFlags(
  flagIds: FeatureFlagKey[]
): Record<FeatureFlagKey, boolean> {
  const { isEnabled } = useFeatureFlags();
  const [flags, setFlags] = useState<Record<FeatureFlagKey, boolean>>({} as Record<FeatureFlagKey, boolean>);

  useEffect(() => {
    const checkFlags = () => {
      const result: Record<FeatureFlagKey, boolean> = {} as Record<FeatureFlagKey, boolean>;
      flagIds.forEach(flagId => {
        result[flagId] = isEnabled(flagId);
      });
      setFlags(result);
    };

    checkFlags();
  }, [flagIds, isEnabled]);

  return flags;
}

/**
 * Hook to check if a specific phase is active
 */
export function usePhaseEnabled(phase: 'phase1' | 'phase2' | 'beta'): boolean {
  const { getFlagsByPhase, isEnabled } = useFeatureFlags();
  const [phaseEnabled, setPhaseEnabled] = useState(false);

  useEffect(() => {
    const checkPhase = () => {
      const phaseFlags = getFlagsByPhase(phase);
      const anyEnabled = phaseFlags.some(flag => isEnabled(flag.id));
      setPhaseEnabled(anyEnabled);
    };

    checkPhase();
  }, [phase, getFlagsByPhase, isEnabled]);

  return phaseEnabled;
}

/**
 * Hook to get feature flag variant (for A/B testing)
 */
export function useFeatureVariant<T extends string>(
  flagId: FeatureFlagKey,
  variants: T[]
): T | null {
  const enabled = useFeatureFlag(flagId);
  const { getFlag } = useFeatureFlags();
  const [variant, setVariant] = useState<T | null>(null);

  useEffect(() => {
    if (!enabled || variants.length === 0) {
      setVariant(null);
      return;
    }

    const flag = getFlag(flagId);
    if (!flag) {
      setVariant(null);
      return;
    }

    // Simple variant selection based on flag ID hash
    const hash = flagId.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    const index = Math.abs(hash) % variants.length;
    setVariant(variants[index]);
  }, [enabled, flagId, variants, getFlag]);

  return variant;
}