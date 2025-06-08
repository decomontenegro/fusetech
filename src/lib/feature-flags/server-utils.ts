import { cookies } from 'next/headers';
import { featureFlagService } from './feature-flag-service';
import { FeatureFlagContext } from './types';

/**
 * Server-side utility to evaluate feature flags
 * Use this in Server Components and API routes
 */
export async function evaluateFeatureFlags(context?: FeatureFlagContext) {
  // Get user context from cookies or session
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value;
  const userGroups = cookieStore.get('userGroups')?.value?.split(',') || [];

  const fullContext: FeatureFlagContext = {
    userId,
    userGroups,
    environment: process.env.NODE_ENV as 'development' | 'staging' | 'production',
    ...context,
  };

  // Load server flags (in production, this would fetch from database/cache)
  await featureFlagService.loadServerFlags();
  
  // Evaluate all flags for the given context
  return featureFlagService.evaluateFlags(fullContext);
}

/**
 * Check if a specific feature is enabled on the server
 */
export async function isFeatureEnabled(
  flagId: string,
  context?: FeatureFlagContext
): Promise<boolean> {
  const flags = await evaluateFeatureFlags(context);
  return flags[flagId] || false;
}

/**
 * Get feature flags for a specific phase
 */
export async function getPhaseFeatures(
  phase: 'phase1' | 'phase2' | 'beta' | 'production',
  context?: FeatureFlagContext
): Promise<Record<string, boolean>> {
  const allFlags = await evaluateFeatureFlags(context);
  const phaseFlags = featureFlagService.getFlagsByPhase(phase);
  
  const result: Record<string, boolean> = {};
  phaseFlags.forEach(flag => {
    result[flag.id] = allFlags[flag.id] || false;
  });
  
  return result;
}