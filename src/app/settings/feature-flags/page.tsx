'use client';

import React from 'react';
import { FeatureFlagToggle } from '@/components/feature-flags/FeatureFlagToggle';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FeatureFlagsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
            ariaLabel="Go back"
          >
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Feature Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Control which features are enabled in your application. Changes are saved locally and persist across sessions.
          </p>
        </div>

        <FeatureFlagToggle />

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            About Feature Phases
          </h2>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-1">Phase 1 - Core Features</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Essential functionality including activity tracking, user profiles, social feeds, and basic gamification with points system.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Phase 2 - Advanced Features</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Enhanced capabilities including AI insights, advanced analytics, marketplace, token rewards, and team competitions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Beta - Experimental Features</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Cutting-edge features under development including voice commands, AR routes, and NFT achievements. May be unstable.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Keyboard shortcut: Press Ctrl+Shift+F anywhere to quickly toggle features</p>
        </div>
      </div>
    </div>
  );
}