'use client';

import React, { useState } from 'react';
import { useFeatureFlags } from '@/lib/feature-flags/feature-flag-provider';
import { FeatureFlag } from '@/lib/feature-flags/types';

interface FeatureFlagToggleProps {
  className?: string;
}

export function FeatureFlagToggle({ className = '' }: FeatureFlagToggleProps) {
  const { getAllFlags, getFlagsByPhase, toggleFlag } = useFeatureFlags();
  const [selectedPhase, setSelectedPhase] = useState<'all' | 'phase1' | 'phase2' | 'beta'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getFlags = (): FeatureFlag[] => {
    if (selectedPhase === 'all') {
      return getAllFlags();
    }
    return getFlagsByPhase(selectedPhase as 'phase1' | 'phase2' | 'beta');
  };

  const filteredFlags = getFlags().filter(flag => 
    flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const phaseColors = {
    phase1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    phase2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    beta: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    production: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Feature Flags
      </h2>
      
      <div className="mb-4 space-y-4">
        <input
          type="text"
          placeholder="Search features..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPhase === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedPhase('phase1')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPhase === 'phase1'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Phase 1
          </button>
          <button
            onClick={() => setSelectedPhase('phase2')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPhase === 'phase2'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Phase 2
          </button>
          <button
            onClick={() => setSelectedPhase('beta')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPhase === 'beta'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Beta
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredFlags.map((flag) => (
          <div
            key={flag.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {flag.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${phaseColors[flag.phase]}`}>
                    {flag.phase.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {flag.description}
                </p>
                {flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Rollout: {flag.rolloutPercentage}%
                  </p>
                )}
                {flag.userGroups && flag.userGroups.length > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Groups: {flag.userGroups.join(', ')}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => toggleFlag(flag.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  flag.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    flag.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFlags.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No features found matching your criteria.
        </p>
      )}
    </div>
  );
}