#!/usr/bin/env node

/**
 * Mock Strava API Server for Local Testing
 * 
 * Simulates Strava API responses for FUSEtech Lite testing
 * Runs on port 8003 by default
 */

const http = require('http');
const url = require('url');

const PORT = process.env.MOCK_STRAVA_PORT || 8003;

// Mock data
const mockAthlete = {
  id: 12345,
  firstname: "Test",
  lastname: "Runner",
  profile: "https://via.placeholder.com/100",
  email: "test@fusetech.app",
  city: "San Francisco",
  state: "California",
  country: "United States",
  sex: "M",
  premium: false,
  created_at: "2020-01-01T00:00:00Z",
  updated_at: new Date().toISOString()
};

const mockActivities = [
  {
    id: 1001,
    name: "Morning Run",
    type: "Run",
    distance: 5000,
    moving_time: 1800,
    elapsed_time: 1900,
    start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    start_date_local: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    timezone: "(GMT-08:00) America/Los_Angeles",
    achievement_count: 2,
    kudos_count: 5,
    comment_count: 1,
    athlete_count: 1,
    photo_count: 0,
    trainer: false,
    commute: false,
    manual: false,
    private: false,
    flagged: false,
    average_speed: 2.78,
    max_speed: 4.2,
    has_heartrate: true,
    elev_high: 120,
    elev_low: 80,
    total_elevation_gain: 40,
    pr_count: 0
  },
  {
    id: 1002,
    name: "Bike Commute",
    type: "Ride",
    distance: 8000,
    moving_time: 1200,
    elapsed_time: 1350,
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    start_date_local: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    timezone: "(GMT-08:00) America/Los_Angeles",
    achievement_count: 0,
    kudos_count: 2,
    comment_count: 0,
    athlete_count: 1,
    photo_count: 1,
    trainer: false,
    commute: true,
    manual: false,
    private: false,
    flagged: false,
    average_speed: 6.67,
    max_speed: 12.5,
    has_heartrate: false,
    elev_high: 150,
    elev_low: 100,
    total_elevation_gain: 50,
    pr_count: 0
  },
  {
    id: 1003,
    name: "Evening Jog",
    type: "Run",
    distance: 3200,
    moving_time: 1080,
    elapsed_time: 1200,
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    start_date_local: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    timezone: "(GMT-08:00) America/Los_Angeles",
    achievement_count: 1,
    kudos_count: 3,
    comment_count: 0,
    athlete_count: 1,
    photo_count: 0,
    trainer: false,
    commute: false,
    manual: false,
    private: false,
    flagged: false,
    average_speed: 2.96,
    max_speed: 3.8,
    has_heartrate: true,
    elev_high: 110,
    elev_low: 90,
    total_elevation_gain: 20,
    pr_count: 1
  }
];

const mockTokenResponse = {
  access_token: "mock_access_token_12345",
  refresh_token: "mock_refresh_token_12345",
  expires_at: Math.floor(Date.now() / 1000) + 6 * 60 * 60, // 6 hours from now
  athlete: mockAthlete
};

// Helper functions
function sendJSON(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res, message, statusCode = 400) {
  sendJSON(res, { error: message }, statusCode);
}

function log(message) {
  console.log(`[Mock Strava API] ${new Date().toISOString()} - ${message}`);
}

// Request handler
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;

  log(`${method} ${path}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // OAuth token exchange
  if (path === '/oauth/token' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        if (data.grant_type === 'authorization_code' && data.code) {
          log('Token exchange successful');
          sendJSON(res, mockTokenResponse);
        } else if (data.grant_type === 'refresh_token' && data.refresh_token) {
          log('Token refresh successful');
          sendJSON(res, {
            ...mockTokenResponse,
            expires_at: Math.floor(Date.now() / 1000) + 6 * 60 * 60
          });
        } else {
          sendError(res, 'Invalid grant type or missing parameters');
        }
      } catch (error) {
        sendError(res, 'Invalid JSON in request body');
      }
    });
    return;
  }

  // Get athlete info
  if (path === '/api/v3/athlete' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Missing or invalid authorization header', 401);
      return;
    }
    
    log('Athlete info requested');
    sendJSON(res, mockAthlete);
    return;
  }

  // Get athlete activities
  if (path === '/api/v3/athlete/activities' && method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Missing or invalid authorization header', 401);
      return;
    }

    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 30;
    
    log(`Activities requested - page: ${page}, per_page: ${perPage}`);
    
    // Simulate pagination
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedActivities = mockActivities.slice(startIndex, endIndex);
    
    sendJSON(res, paginatedActivities);
    return;
  }

  // Health check
  if (path === '/health' && method === 'GET') {
    sendJSON(res, {
      status: 'healthy',
      service: 'Mock Strava API',
      timestamp: new Date().toISOString(),
      endpoints: [
        'POST /oauth/token',
        'GET /api/v3/athlete',
        'GET /api/v3/athlete/activities'
      ]
    });
    return;
  }

  // 404 for unknown endpoints
  sendError(res, `Endpoint not found: ${method} ${path}`, 404);
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log('\n🎭 Mock Strava API Server Started');
  console.log('=====================================');
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('\n📋 Available Endpoints:');
  console.log('  POST /oauth/token - Token exchange/refresh');
  console.log('  GET /api/v3/athlete - Get athlete info');
  console.log('  GET /api/v3/athlete/activities - Get activities');
  console.log('\n🧪 Mock Data:');
  console.log(`  Athlete ID: ${mockAthlete.id}`);
  console.log(`  Activities: ${mockActivities.length} mock activities`);
  console.log('\n💡 Usage:');
  console.log('  Set NEXT_PUBLIC_USE_MOCK_STRAVA=true in .env.local');
  console.log('  Set MOCK_STRAVA_API_URL=http://localhost:' + PORT);
  console.log('\n🔄 Press Ctrl+C to stop');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down Mock Strava API Server...');
  server.close(() => {
    console.log('✅ Server stopped gracefully');
    process.exit(0);
  });
});

// Error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.log('💡 Try a different port or stop the existing process');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
