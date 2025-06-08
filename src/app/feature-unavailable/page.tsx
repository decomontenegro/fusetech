'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { FEATURE_FLAGS } from '@/lib/feature-flags';

const featureInfo: Record<string, { title: string; description: string; phase: string }> = {
  [FEATURE_FLAGS.MARKETPLACE]: {
    title: 'Marketplace',
    description: 'Trade equipment and digital goods with FUSE tokens',
    phase: 'Phase 2'
  },
  [FEATURE_FLAGS.AI_INSIGHTS]: {
    title: 'AI Insights',
    description: 'Get personalized recommendations based on your activity patterns',
    phase: 'Phase 2'
  },
  [FEATURE_FLAGS.ADVANCED_ANALYTICS]: {
    title: 'Advanced Analytics',
    description: 'Detailed performance analytics and trends',
    phase: 'Phase 2'
  },
  [FEATURE_FLAGS.TEAM_COMPETITIONS]: {
    title: 'Team Competitions',
    description: 'Join or create teams to compete in challenges',
    phase: 'Phase 2'
  },
  [FEATURE_FLAGS.TOKEN_REWARDS]: {
    title: 'Token Rewards',
    description: 'Earn FUSE tokens for your activities',
    phase: 'Phase 2'
  },
  [FEATURE_FLAGS.PREMIUM_FEATURES]: {
    title: 'Premium Features',
    description: 'Access exclusive premium content and features',
    phase: 'Phase 2'
  },
};

export default function FeatureUnavailablePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const feature = searchParams.get('feature') || '';
  const from = searchParams.get('from') || '/dashboard';
  
  const info = featureInfo[feature] || {
    title: 'Feature',
    description: 'This feature is not yet available',
    phase: 'Coming Soon'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {info.title} Unavailable
          </h1>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {info.phase}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {info.description}
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This feature is currently in development and will be available soon. 
              Stay tuned for updates!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              fullWidth
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.push(from)}
              ariaLabel="Go back"
            >
              Go Back
            </Button>
            
            <Button
              variant="primary"
              fullWidth
              onClick={() => router.push('/dashboard')}
              ariaLabel="Go to dashboard"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}