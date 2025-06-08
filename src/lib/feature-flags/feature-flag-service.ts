import { FeatureFlag, FeatureFlagContext, FeatureFlagConfig, FEATURE_FLAGS } from './types';

class FeatureFlagService {
  private flags: Map<string, FeatureFlag> = new Map();
  private localStorage: Storage | null = null;
  private serverFlags: Map<string, FeatureFlag> = new Map();
  private listeners: Map<string, Set<(enabled: boolean) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.localStorage = window.localStorage;
      this.loadLocalOverrides();
    }
    this.initializeDefaultFlags();
  }

  private initializeDefaultFlags() {
    // Phase 1 Features (Enabled by default)
    this.setFlag({
      id: FEATURE_FLAGS.BASIC_ACTIVITY_TRACKING,
      name: 'Basic Activity Tracking',
      description: 'Core activity tracking functionality',
      enabled: true,
      phase: 'phase1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.USER_PROFILE,
      name: 'User Profile',
      description: 'Basic user profile functionality',
      enabled: true,
      phase: 'phase1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.SOCIAL_FEED,
      name: 'Social Feed',
      description: 'Activity feed and social features',
      enabled: true,
      phase: 'phase1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.BASIC_GAMIFICATION,
      name: 'Basic Gamification',
      description: 'Points and basic achievements',
      enabled: true,
      phase: 'phase1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.DEVICE_INTEGRATION,
      name: 'Device Integration',
      description: 'Connect fitness devices',
      enabled: true,
      phase: 'phase1',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Phase 2 Features (Disabled by default)
    this.setFlag({
      id: FEATURE_FLAGS.AI_INSIGHTS,
      name: 'AI Insights',
      description: 'AI-powered activity insights',
      enabled: false,
      phase: 'phase2',
      rolloutPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.ADVANCED_ANALYTICS,
      name: 'Advanced Analytics',
      description: 'Detailed performance analytics',
      enabled: false,
      phase: 'phase2',
      rolloutPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.MARKETPLACE,
      name: 'Marketplace',
      description: 'Digital goods marketplace',
      enabled: false,
      phase: 'phase2',
      rolloutPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.TOKEN_REWARDS,
      name: 'Token Rewards',
      description: 'FUSE token rewards system',
      enabled: false,
      phase: 'phase2',
      rolloutPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.TEAM_COMPETITIONS,
      name: 'Team Competitions',
      description: 'Team-based challenges',
      enabled: false,
      phase: 'phase2',
      rolloutPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.PREMIUM_FEATURES,
      name: 'Premium Features',
      description: 'Premium subscription features',
      enabled: false,
      phase: 'phase2',
      rolloutPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.BEHAVIORAL_PSYCHOLOGY,
      name: 'Behavioral Psychology',
      description: 'Psychology-based motivation',
      enabled: false,
      phase: 'phase2',
      rolloutPercentage: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Beta Features
    this.setFlag({
      id: FEATURE_FLAGS.VOICE_COMMANDS,
      name: 'Voice Commands',
      description: 'Voice control for activities',
      enabled: false,
      phase: 'beta',
      rolloutPercentage: 0,
      userGroups: ['beta_testers'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.AR_ROUTES,
      name: 'AR Routes',
      description: 'Augmented reality route visualization',
      enabled: false,
      phase: 'beta',
      rolloutPercentage: 0,
      userGroups: ['beta_testers'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.SOCIAL_CHALLENGES,
      name: 'Social Challenges',
      description: 'Create and join social challenges',
      enabled: false,
      phase: 'beta',
      rolloutPercentage: 0,
      userGroups: ['beta_testers'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.setFlag({
      id: FEATURE_FLAGS.NFT_ACHIEVEMENTS,
      name: 'NFT Achievements',
      description: 'NFT-based achievement system',
      enabled: false,
      phase: 'beta',
      rolloutPercentage: 0,
      userGroups: ['beta_testers'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private setFlag(flag: FeatureFlag) {
    this.flags.set(flag.id, flag);
  }

  private loadLocalOverrides() {
    if (!this.localStorage) return;
    
    try {
      const overrides = this.localStorage.getItem('fuseapp_feature_overrides');
      if (overrides) {
        const parsed = JSON.parse(overrides);
        Object.entries(parsed).forEach(([key, value]) => {
          const flag = this.flags.get(key);
          if (flag) {
            flag.enabled = value as boolean;
          }
        });
      }
    } catch (error) {
      console.error('Failed to load feature flag overrides:', error);
    }
  }

  private saveLocalOverrides() {
    if (!this.localStorage) return;
    
    try {
      const overrides: Record<string, boolean> = {};
      this.flags.forEach((flag, key) => {
        if (flag.enabled !== this.getServerFlag(key)?.enabled) {
          overrides[key] = flag.enabled;
        }
      });
      
      if (Object.keys(overrides).length > 0) {
        this.localStorage.setItem('fuseapp_feature_overrides', JSON.stringify(overrides));
      } else {
        this.localStorage.removeItem('fuseapp_feature_overrides');
      }
    } catch (error) {
      console.error('Failed to save feature flag overrides:', error);
    }
  }

  private getServerFlag(flagId: string): FeatureFlag | undefined {
    return this.serverFlags.get(flagId);
  }

  async loadServerFlags(): Promise<void> {
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll simulate server flags
      const response = await fetch('/api/feature-flags');
      if (response.ok) {
        const flags = await response.json();
        flags.forEach((flag: FeatureFlag) => {
          this.serverFlags.set(flag.id, flag);
          if (!this.hasLocalOverride(flag.id)) {
            this.flags.set(flag.id, flag);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load server feature flags:', error);
    }
  }

  private hasLocalOverride(flagId: string): boolean {
    if (!this.localStorage) return false;
    
    try {
      const overrides = this.localStorage.getItem('fuseapp_feature_overrides');
      if (overrides) {
        const parsed = JSON.parse(overrides);
        return flagId in parsed;
      }
    } catch {
      // Ignore errors
    }
    return false;
  }

  isEnabled(flagId: string, context?: FeatureFlagContext): boolean {
    const flag = this.flags.get(flagId);
    if (!flag) return false;

    // Check if explicitly disabled
    if (!flag.enabled) return false;

    // Check user-specific overrides
    if (context?.userId) {
      if (flag.enabledFor?.includes(context.userId)) return true;
      if (flag.disabledFor?.includes(context.userId)) return false;
    }

    // Check user groups
    if (flag.userGroups && flag.userGroups.length > 0) {
      if (!context?.userGroups || !flag.userGroups.some(group => context.userGroups?.includes(group))) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      if (!context?.userId) return false;
      
      // Use a simple hash of userId to determine if user is in rollout
      const hash = this.hashString(context.userId);
      const percentage = (hash % 100) + 1;
      return percentage <= flag.rolloutPercentage;
    }

    return true;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  toggleFlag(flagId: string, enabled?: boolean): void {
    const flag = this.flags.get(flagId);
    if (!flag) return;

    flag.enabled = enabled !== undefined ? enabled : !flag.enabled;
    flag.updatedAt = new Date();
    
    this.saveLocalOverrides();
    this.notifyListeners(flagId, flag.enabled);
  }

  getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags.get(flagId);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  getFlagsByPhase(phase: 'phase1' | 'phase2' | 'beta' | 'production'): FeatureFlag[] {
    return this.getAllFlags().filter(flag => flag.phase === phase);
  }

  onFlagChange(flagId: string, callback: (enabled: boolean) => void): () => void {
    if (!this.listeners.has(flagId)) {
      this.listeners.set(flagId, new Set());
    }
    
    this.listeners.get(flagId)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(flagId)?.delete(callback);
    };
  }

  private notifyListeners(flagId: string, enabled: boolean): void {
    this.listeners.get(flagId)?.forEach(callback => {
      try {
        callback(enabled);
      } catch (error) {
        console.error('Feature flag listener error:', error);
      }
    });
  }

  reset(): void {
    if (this.localStorage) {
      this.localStorage.removeItem('fuseapp_feature_overrides');
    }
    this.flags.clear();
    this.initializeDefaultFlags();
  }

  // Server-side evaluation for SSR
  evaluateFlags(context: FeatureFlagContext): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    
    this.flags.forEach((flag, key) => {
      result[key] = this.isEnabled(key, context);
    });
    
    return result;
  }
}

// Singleton instance
export const featureFlagService = new FeatureFlagService();