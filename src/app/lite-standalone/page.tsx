/**
 * FUSEtech Lite - Standalone MVP Page
 * 
 * Completely independent page without any complex dependencies
 * Perfect for local testing and MVP validation
 */

'use client';

import { useState, useEffect } from 'react';

// Standalone interfaces (no external dependencies)
interface SimpleUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  tokensBalance: number;
  totalTokensEarned: number;
}

interface SimpleActivity {
  id: string;
  name: string;
  type: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  startDate: Date;
  tokensEarned: number;
}

// Mock data for testing
const mockUser: SimpleUser = {
  id: 'user_123',
  name: 'Test Runner',
  email: 'test@fusetech.app',
  avatarUrl: 'https://via.placeholder.com/100',
  tokensBalance: 47.50,
  totalTokensEarned: 127.25
};

const mockActivities: SimpleActivity[] = [
  {
    id: 'activity_1',
    name: 'Morning Run',
    type: 'Run',
    distanceMeters: 5000,
    movingTimeSeconds: 1800,
    startDate: new Date('2024-01-12T07:00:00Z'),
    tokensEarned: 5.0
  },
  {
    id: 'activity_2',
    name: 'Bike Commute',
    type: 'Ride',
    distanceMeters: 8000,
    movingTimeSeconds: 1200,
    startDate: new Date('2024-01-11T08:30:00Z'),
    tokensEarned: 4.0
  },
  {
    id: 'activity_3',
    name: 'Evening Jog',
    type: 'Run',
    distanceMeters: 3200,
    movingTimeSeconds: 1080,
    startDate: new Date('2024-01-10T18:00:00Z'),
    tokensEarned: 3.2
  }
];

// Simple token calculation
function calculateTokens(type: string, distanceMeters: number): number {
  const distanceKm = distanceMeters / 1000;
  let rate = 0.3; // default
  
  switch (type.toLowerCase()) {
    case 'run': rate = 1.0; break;
    case 'ride': rate = 0.5; break;
    case 'walk': rate = 0.7; break;
  }
  
  return Math.max(1.0, Math.round(distanceKm * rate * 100) / 100);
}

export default function FUSETechLiteStandalone() {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [activities, setActivities] = useState<SimpleActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setUser(mockUser);
      setActivities(mockActivities);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleConnectStrava = () => {
    alert('Mock Strava connection successful! (Development mode)');
    setUser(mockUser);
    setActivities(mockActivities);
  };

  const handleSyncActivities = async () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Activities synced successfully!');
    }, 2000);
  };

  if (isLoading) {
    return (
      <html lang="en">
        <head>
          <title>FUSEtech Lite - Loading</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading FUSEtech Lite...</p>
          </div>
        </body>
      </html>
    );
  }

  if (!user) {
    return (
      <html lang="en">
        <head>
          <title>FUSEtech Lite - Connect Strava</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
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
              onClick={handleConnectStrava}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🔗</span>
              <span>Connect Strava Account</span>
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              We only read your activity data. No posting or modifications.
            </p>
          </div>
        </body>
      </html>
    );
  }

  // Calculate stats
  const totalActivities = activities.length;
  const totalDistance = activities.reduce((sum, a) => sum + a.distanceMeters, 0) / 1000;
  const thisWeekTokens = activities
    .filter(a => a.startDate >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    .reduce((sum, a) => sum + a.tokensEarned, 0);

  return (
    <html lang="en">
      <head>
        <title>FUSEtech Lite - Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
                  <div>{thisWeekTokens.toFixed(2)} FUSE</div>
                </div>
                <div>
                  <div className="font-semibold">Activities</div>
                  <div>{totalActivities}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Distance</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDistance.toFixed(1)} km</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  🏃
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Tokens/Activity</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalActivities > 0 ? (user.totalTokensEarned / totalActivities).toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-xl">
                  💰
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorite Activity</p>
                  <p className="text-2xl font-bold text-gray-900">Run</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                  ⭐
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h3>
            
            <div className="space-y-4">
              {activities.map((activity) => {
                const distanceKm = (activity.distanceMeters / 1000).toFixed(1);
                const durationMin = Math.round(activity.movingTimeSeconds / 60);
                const date = activity.startDate.toLocaleDateString();

                return (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
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
                      <div className="font-bold text-orange-500">+{activity.tokensEarned.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">FUSE</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Development indicator */}
        <div className="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-50">
          MVP Mode
        </div>
      </body>
    </html>
  );
}
