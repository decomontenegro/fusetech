export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  phase: 'phase1' | 'phase2' | 'beta' | 'production';
  rolloutPercentage?: number;
  userGroups?: string[];
  enabledFor?: string[]; // Specific user IDs
  disabledFor?: string[]; // Specific user IDs to exclude
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureFlagContext {
  userId?: string;
  userGroups?: string[];
  environment?: 'development' | 'staging' | 'production';
  deviceType?: 'mobile' | 'desktop';
  customAttributes?: Record<string, any>;
}

export interface FeatureFlagConfig {
  flags: Record<string, FeatureFlag>;
  defaultPhase?: 'phase1' | 'phase2';
  enableDevTools?: boolean;
}

// Predefined feature flags for Phase 1 and Phase 2
export const FEATURE_FLAGS = {
  // Phase 1 Features (Core Functionality)
  BASIC_ACTIVITY_TRACKING: 'basic_activity_tracking',
  USER_PROFILE: 'user_profile',
  SOCIAL_FEED: 'social_feed',
  BASIC_GAMIFICATION: 'basic_gamification',
  DEVICE_INTEGRATION: 'device_integration',
  
  // Phase 2 Features (Advanced)
  AI_INSIGHTS: 'ai_insights',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  MARKETPLACE: 'marketplace',
  TOKEN_REWARDS: 'token_rewards',
  TEAM_COMPETITIONS: 'team_competitions',
  PREMIUM_FEATURES: 'premium_features',
  BEHAVIORAL_PSYCHOLOGY: 'behavioral_psychology',
  
  // Beta Features
  VOICE_COMMANDS: 'voice_commands',
  AR_ROUTES: 'ar_routes',
  SOCIAL_CHALLENGES: 'social_challenges',
  NFT_ACHIEVEMENTS: 'nft_achievements',
} as const;

export type FeatureFlagKey = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];