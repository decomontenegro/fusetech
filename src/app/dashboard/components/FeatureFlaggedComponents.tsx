'use client';

import React from 'react';
import { useFeatureFlag, FEATURE_FLAGS, withFeatureFlag } from '@/lib/feature-flags';
import Link from 'next/link';

// Example of using useFeatureFlag hook
export function AIInsightsWidget() {
  const isEnabled = useFeatureFlag(FEATURE_FLAGS.AI_INSIGHTS);

  if (!isEnabled) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">AI Insights</h3>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">PHASE 2</span>
      </div>
      <p className="text-sm opacity-90 mb-4">
        Get personalized recommendations based on your activity patterns
      </p>
      <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
        View Insights
      </button>
    </div>
  );
}

// Example of using withFeatureFlag HOC
const MarketplaceCard = () => (
  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-bold">Marketplace</h3>
      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">PHASE 2</span>
    </div>
    <p className="text-sm opacity-90 mb-4">
      Trade equipment and digital goods with FUSE tokens
    </p>
    <Link 
      href="/marketplace"
      className="inline-block bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
    >
      Browse Marketplace
    </Link>
  </div>
);

// Wrapped with feature flag
export const FeatureFlaggedMarketplace = withFeatureFlag(
  MarketplaceCard,
  FEATURE_FLAGS.MARKETPLACE
);

// Component that shows different content based on phase
export function PhaseBasedContent() {
  const showBasicGamification = useFeatureFlag(FEATURE_FLAGS.BASIC_GAMIFICATION);
  const showTokenRewards = useFeatureFlag(FEATURE_FLAGS.TOKEN_REWARDS);
  const showTeamCompetitions = useFeatureFlag(FEATURE_FLAGS.TEAM_COMPETITIONS);

  return (
    <div className="space-y-4">
      {showBasicGamification && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Basic Rewards Active
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Earn points for completing activities and unlock achievements!
          </p>
        </div>
      )}

      {showTokenRewards && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            FUSE Token Rewards Active
          </h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            Your activities now earn FUSE tokens! Check your wallet for details.
          </p>
        </div>
      )}

      {showTeamCompetitions && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            Team Competitions Available
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Join or create teams to compete in challenges together!
          </p>
        </div>
      )}
    </div>
  );
}

// Beta feature example
export function BetaFeatures() {
  const showVoiceCommands = useFeatureFlag(FEATURE_FLAGS.VOICE_COMMANDS);
  const showARRoutes = useFeatureFlag(FEATURE_FLAGS.AR_ROUTES);

  if (!showVoiceCommands && !showARRoutes) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Beta Features</h3>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full animate-pulse">BETA</span>
      </div>
      
      <div className="space-y-3">
        {showVoiceCommands && (
          <div className="bg-white/10 rounded-lg p-3">
            <h4 className="font-semibold mb-1">Voice Commands</h4>
            <p className="text-sm opacity-90">Control your workout with voice</p>
          </div>
        )}
        
        {showARRoutes && (
          <div className="bg-white/10 rounded-lg p-3">
            <h4 className="font-semibold mb-1">AR Route Visualization</h4>
            <p className="text-sm opacity-90">See your route in augmented reality</p>
          </div>
        )}
      </div>
    </div>
  );
}