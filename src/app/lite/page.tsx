/**
 * FUSEtech Lite - Simplified MVP Dashboard
 * 
 * Minimal dashboard focusing on core value proposition:
 * 1. Connect Strava
 * 2. See token balance
 * 3. View recent activities
 * 4. Simple leaderboard
 */

'use client';

import { useState, useEffect } from 'react';
import { SimpleActivity, SimpleTokenCalculator } from '@/lib/tokens/simple-calculator';
import { StravaUser } from '@/lib/auth/strava-auth';

// Mock data for development (replace with real API calls)
const mockUser: StravaUser = {
  id: 'user_123',
  stravaAthleteId: 12345,
  name: 'Test Runner',
  email: 'test@fusetech.app',
  avatarUrl: 'https://via.placeholder.com/100',
  tokensBalance: 47.50,
  totalTokensEarned: 127.25,
  createdAt: new Date('2024-01-01'),
  lastSyncAt: new Date()
};

const mockActivities: SimpleActivity[] = [
  {
    id: 'activity_1',
    stravaId: 1001,
    type: 'Run',
    name: 'Morning Run',
    distanceMeters: 5000,
    movingTimeSeconds: 1800,
    startDate: new Date('2024-01-12T07:00:00Z')
  },
  {
    id: 'activity_2',
    stravaId: 1002,
    type: 'Ride',
    name: 'Bike Commute',
    distanceMeters: 8000,
    movingTimeSeconds: 1200,
    startDate: new Date('2024-01-11T08:30:00Z')
  },
  {
    id: 'activity_3',
    stravaId: 1003,
    type: 'Run',
    name: 'Evening Jog',
    distanceMeters: 3200,
    movingTimeSeconds: 1080,
    startDate: new Date('2024-01-10T18:00:00Z')
  }
];

export default function FUSETechLitePage() {
  const [user, setUser] = useState<StravaUser | null>(null);
  const [activities, setActivities] = useState<SimpleActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check if we're in development mode with mock data
    const useMockData = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true';

    if (useMockData) {
      // Simulate loading user data
      setTimeout(() => {
        setUser(mockUser);
        setActivities(mockActivities);
        setIsLoading(false);
      }, 1000);
    } else {
      // In production, load real user data
      loadUserData();
    }
  }, []);

  const loadUserData = async () => {
    try {
      // TODO: Implement real API calls
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);

        const activitiesResponse = await fetch('/api/user/activities');
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json();
          setActivities(activitiesData);
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Fallback to mock data
      setUser(mockUser);
      setActivities(mockActivities);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStrava = () => {
    // Check if using mock Strava
    const useMockStrava = process.env.NEXT_PUBLIC_USE_MOCK_STRAVA === 'true';

    if (useMockStrava) {
      // Simulate successful Strava connection
      alert('Mock Strava connection successful! (Development mode)');
      setUser(mockUser);
      setActivities(mockActivities);
    } else {
      // Real Strava OAuth redirect
      window.location.href = '/api/auth/strava-lite/callback';
    }
  };

  const handleSyncActivities = async () => {
    setIsSyncing(true);
    
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
      // Show success message
      alert('Activities synced successfully!');
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FUSEtech Lite...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <ConnectStravaScreen onConnect={handleConnectStrava} />;
  }

  const tokenSummary = SimpleTokenCalculator.getSummary(activities);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">FUSEtech Lite</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSyncActivities}
              disabled={isSyncing}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSyncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Sync Activities</span>
                </>
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <img
                src={user.avatarUrl || 'https://via.placeholder.com/32'}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Token Balance Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your FUSE Tokens</h2>
            <div className="text-5xl font-bold text-orange-500 mb-4">
              {user.tokensBalance.toFixed(2)}
            </div>
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <div>
                <div className="font-semibold">Total Earned</div>
                <div>{user.totalTokensEarned.toFixed(2)} FUSE</div>
              </div>
              <div>
                <div className="font-semibold">This Week</div>
                <div>{tokenSummary.thisWeekTokens.toFixed(2)} FUSE</div>
              </div>
              <div>
                <div className="font-semibold">Activities</div>
                <div>{tokenSummary.totalActivities}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Distance"
            value={`${tokenSummary.totalDistance} km`}
            icon="🏃"
            color="blue"
          />
          <StatCard
            title="Avg Tokens/Activity"
            value={tokenSummary.averageTokensPerActivity.toFixed(1)}
            icon="💰"
            color="green"
          />
          <StatCard
            title="Favorite Activity"
            value={tokenSummary.topActivityType}
            icon="⭐"
            color="purple"
          />
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h3>
          
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No activities yet. Connect your Strava account to start earning tokens!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const calculation = SimpleTokenCalculator.calculate(activity);
                return (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    tokensEarned={calculation.finalTokens}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Connect Strava Screen Component
function ConnectStravaScreen({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">F</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FUSEtech Lite</h1>
        <p className="text-gray-600 mb-8">
          Connect your Strava account to start earning FUSE tokens for your fitness activities!
        </p>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 text-left">
            <span className="text-2xl">🏃</span>
            <div>
              <div className="font-semibold">Track Activities</div>
              <div className="text-sm text-gray-600">Automatic sync from Strava</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <span className="text-2xl">💰</span>
            <div>
              <div className="font-semibold">Earn Tokens</div>
              <div className="text-sm text-gray-600">1 token per km running</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-left">
            <span className="text-2xl">📊</span>
            <div>
              <div className="font-semibold">Track Progress</div>
              <div className="text-sm text-gray-600">Simple dashboard</div>
            </div>
          </div>
        </div>
        
        <button
          onClick={onConnect}
          className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
        >
          <span>🔗</span>
          <span>Connect Strava Account</span>
        </button>
        
        <p className="text-xs text-gray-500 mt-4">
          We only read your activity data. No posting or modifications.
        </p>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string; 
  icon: string; 
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Activity Card Component
function ActivityCard({ 
  activity, 
  tokensEarned 
}: { 
  activity: SimpleActivity; 
  tokensEarned: number;
}) {
  const distanceKm = (activity.distanceMeters / 1000).toFixed(1);
  const durationMin = Math.round(activity.movingTimeSeconds / 60);
  const date = activity.startDate.toLocaleDateString();

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <span className="text-orange-600 font-semibold">
            {activity.type === 'Run' ? '🏃' : activity.type === 'Ride' ? '🚴' : '🚶'}
          </span>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-900">{activity.name}</h4>
          <p className="text-sm text-gray-600">
            {distanceKm} km • {durationMin} min • {date}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-orange-500">+{tokensEarned.toFixed(2)}</div>
        <div className="text-xs text-gray-500">FUSE</div>
      </div>
    </div>
  );
}
