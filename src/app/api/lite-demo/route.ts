/**
 * FUSEtech Lite - Demo API Route
 * 
 * Returns a complete HTML page for MVP testing
 * Bypasses all Next.js complexity and dependencies
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FUSEtech Lite - MVP Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
    <div id="app">
        <!-- Loading State -->
        <div id="loading" class="min-h-screen flex items-center justify-center">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p class="text-gray-600">Loading FUSEtech Lite...</p>
            </div>
        </div>

        <!-- Connect Strava Screen -->
        <div id="connect-screen" class="min-h-screen flex items-center justify-center" style="display: none;">
            <div class="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
                <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span class="text-white font-bold text-2xl">F</span>
                </div>
                
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome to FUSEtech Lite</h1>
                <p class="text-gray-600 mb-8">
                    Connect your Strava account to start earning FUSE tokens for your fitness activities!
                </p>
                
                <div class="space-y-4 mb-6">
                    <div class="flex items-center space-x-3 text-left">
                        <span class="text-2xl">🏃</span>
                        <div>
                            <div class="font-semibold">Track Activities</div>
                            <div class="text-sm text-gray-600">Automatic sync from Strava</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-3 text-left">
                        <span class="text-2xl">💰</span>
                        <div>
                            <div class="font-semibold">Earn Tokens</div>
                            <div class="text-sm text-gray-600">1 token per km running</div>
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-3 text-left">
                        <span class="text-2xl">📊</span>
                        <div>
                            <div class="font-semibold">Track Progress</div>
                            <div class="text-sm text-gray-600">Simple dashboard</div>
                        </div>
                    </div>
                </div>
                
                <button
                    onclick="connectStrava()"
                    class="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
                >
                    <span>🔗</span>
                    <span>Connect Strava Account</span>
                </button>
                
                <p class="text-xs text-gray-500 mt-4">
                    We only read your activity data. No posting or modifications.
                </p>
            </div>
        </div>

        <!-- Dashboard -->
        <div id="dashboard" class="min-h-screen" style="display: none;">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b">
                <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-sm">F</span>
                        </div>
                        <h1 class="text-xl font-bold text-gray-900">FUSEtech Lite</h1>
                    </div>
                    
                    <div class="flex items-center space-x-4">
                        <button
                            onclick="syncActivities()"
                            id="sync-btn"
                            class="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
                        >
                            <span>🔄</span>
                            <span>Sync Activities</span>
                        </button>
                        
                        <div class="flex items-center space-x-2">
                            <img
                                src="https://via.placeholder.com/32"
                                alt="Test Runner"
                                class="w-8 h-8 rounded-full"
                            />
                            <span class="text-sm font-medium text-gray-700">Test Runner</span>
                        </div>
                    </div>
                </div>
            </header>

            <main class="max-w-4xl mx-auto px-4 py-8">
                <!-- Token Balance Card -->
                <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div class="text-center">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Your FUSE Tokens</h2>
                        <div class="text-5xl font-bold text-orange-500 mb-4">
                            47.50
                        </div>
                        <div class="flex justify-center space-x-8 text-sm text-gray-600">
                            <div>
                                <div class="font-semibold">Total Earned</div>
                                <div>127.25 FUSE</div>
                            </div>
                            <div>
                                <div class="font-semibold">This Week</div>
                                <div>12.20 FUSE</div>
                            </div>
                            <div>
                                <div class="font-semibold">Activities</div>
                                <div>3</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Total Distance</p>
                                <p class="text-2xl font-bold text-gray-900">16.2 km</p>
                            </div>
                            <div class="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                                🏃
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Avg Tokens/Activity</p>
                                <p class="text-2xl font-bold text-gray-900">4.1</p>
                            </div>
                            <div class="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-xl">
                                💰
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow p-6">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-600">Favorite Activity</p>
                                <p class="text-2xl font-bold text-gray-900">Run</p>
                            </div>
                            <div class="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                                ⭐
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activities -->
                <div class="bg-white rounded-xl shadow-lg p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Recent Activities</h3>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <span class="text-orange-600 font-semibold">🏃</span>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Morning Run</h4>
                                    <p class="text-sm text-gray-600">5.0 km • 30 min • Today</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-orange-500">+5.00</div>
                                <div class="text-xs text-gray-500">FUSE</div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <span class="text-orange-600 font-semibold">🚴</span>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Bike Commute</h4>
                                    <p class="text-sm text-gray-600">8.0 km • 20 min • Yesterday</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-orange-500">+4.00</div>
                                <div class="text-xs text-gray-500">FUSE</div>
                            </div>
                        </div>

                        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <div class="flex items-center space-x-4">
                                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <span class="text-orange-600 font-semibold">🏃</span>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Evening Jog</h4>
                                    <p class="text-sm text-gray-600">3.2 km • 18 min • 2 days ago</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-orange-500">+3.20</div>
                                <div class="text-xs text-gray-500">FUSE</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <!-- Development indicator -->
    <div class="fixed bottom-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-50">
        MVP Mode
    </div>

    <script>
        // Simple state management
        let currentScreen = 'loading';
        let isSyncing = false;

        function showScreen(screen) {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('connect-screen').style.display = 'none';
            document.getElementById('dashboard').style.display = 'none';
            
            document.getElementById(screen).style.display = 'block';
            currentScreen = screen;
        }

        function connectStrava() {
            alert('Mock Strava connection successful! (Development mode)');
            showScreen('dashboard');
        }

        function syncActivities() {
            if (isSyncing) return;
            
            isSyncing = true;
            const btn = document.getElementById('sync-btn');
            btn.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div><span>Syncing...</span>';
            btn.disabled = true;
            
            setTimeout(() => {
                isSyncing = false;
                btn.innerHTML = '<span>🔄</span><span>Sync Activities</span>';
                btn.disabled = false;
                alert('Activities synced successfully!');
            }, 2000);
        }

        // Initialize app
        setTimeout(() => {
            showScreen('connect-screen');
        }, 1000);

        // Log for debugging
        console.log('🚀 FUSEtech Lite MVP Demo loaded');
        console.log('📊 Mock data: 3 activities, 47.50 FUSE tokens');
        console.log('🎭 Using mock Strava API on port 8003');
    </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
