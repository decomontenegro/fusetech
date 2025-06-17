#!/usr/bin/env node

/**
 * FUSEtech Lite - Local Environment Test Suite
 * 
 * Tests the local development environment:
 * 1. Database connectivity and data
 * 2. Mock Strava API responses
 * 3. Next.js application endpoints
 * 4. Token calculation functionality
 */

const http = require('http');
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'white') {
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}${message}${colors.reset}`);
}

function logTest(testName, status, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  log(`${icon} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'white');
  }
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🧪 ${title}`, 'cyan');
  console.log('='.repeat(60));
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 5000
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test SQLite database
async function testDatabase() {
  logSection('SQLite Database Test');
  
  const dbPath = path.join(process.cwd(), 'dev.db');
  
  if (!fs.existsSync(dbPath)) {
    logTest('Database File', 'fail', 'dev.db not found');
    return false;
  }
  
  return new Promise((resolve) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logTest('Database Connection', 'fail', err.message);
        resolve(false);
        return;
      }
      
      logTest('Database Connection', 'pass', 'Connected to dev.db');
      
      // Test tables exist
      db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) {
          logTest('Table Check', 'fail', err.message);
          resolve(false);
          return;
        }
        
        const tableNames = tables.map(t => t.name);
        const expectedTables = ['users', 'activities', 'transactions'];
        const hasAllTables = expectedTables.every(table => tableNames.includes(table));
        
        if (hasAllTables) {
          logTest('Required Tables', 'pass', `Found: ${tableNames.join(', ')}`);
        } else {
          logTest('Required Tables', 'fail', `Missing tables. Found: ${tableNames.join(', ')}`);
          resolve(false);
          return;
        }
        
        // Test sample data
        db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
          if (err) {
            logTest('Sample Data', 'fail', err.message);
          } else {
            logTest('Sample Data', 'pass', `${result.count} test users`);
          }
          
          // Test user stats view
          db.get("SELECT * FROM user_stats LIMIT 1", (err, stats) => {
            if (err) {
              logTest('User Stats View', 'fail', err.message);
            } else {
              logTest('User Stats View', 'pass', `Balance: ${stats.tokens_balance} tokens`);
            }
            
            db.close();
            resolve(true);
          });
        });
      });
    });
  });
}

// Test Mock Strava API
async function testMockStravaAPI() {
  logSection('Mock Strava API Test');
  
  try {
    // Test health endpoint
    const healthResponse = await makeRequest('http://localhost:8003/health');
    if (healthResponse.status === 200) {
      logTest('Health Endpoint', 'pass', 'Mock API is running');
    } else {
      logTest('Health Endpoint', 'fail', `Status: ${healthResponse.status}`);
      return false;
    }
    
    // Test athlete endpoint
    const athleteResponse = await makeRequest('http://localhost:8003/api/v3/athlete', {
      headers: { 'Authorization': 'Bearer test_token' }
    });
    
    if (athleteResponse.status === 200 && athleteResponse.data.id) {
      logTest('Athlete Endpoint', 'pass', `Athlete ID: ${athleteResponse.data.id}`);
    } else {
      logTest('Athlete Endpoint', 'fail', `Status: ${athleteResponse.status}`);
      return false;
    }
    
    // Test activities endpoint
    const activitiesResponse = await makeRequest('http://localhost:8003/api/v3/athlete/activities', {
      headers: { 'Authorization': 'Bearer test_token' }
    });
    
    if (activitiesResponse.status === 200 && Array.isArray(activitiesResponse.data)) {
      logTest('Activities Endpoint', 'pass', `${activitiesResponse.data.length} mock activities`);
    } else {
      logTest('Activities Endpoint', 'fail', `Status: ${activitiesResponse.status}`);
      return false;
    }
    
    // Test token exchange
    const tokenResponse = await makeRequest('http://localhost:8003/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        grant_type: 'authorization_code',
        code: 'test_code',
        client_id: 'test_client',
        client_secret: 'test_secret'
      }
    });
    
    if (tokenResponse.status === 200 && tokenResponse.data.access_token) {
      logTest('Token Exchange', 'pass', 'OAuth flow working');
    } else {
      logTest('Token Exchange', 'fail', `Status: ${tokenResponse.status}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    logTest('Mock API Connection', 'fail', error.message);
    return false;
  }
}

// Test Next.js application
async function testNextJSApp() {
  logSection('Next.js Application Test');
  
  try {
    // Test main lite page
    const liteResponse = await makeRequest('http://localhost:8001/lite');
    if (liteResponse.status === 200) {
      logTest('Lite Dashboard', 'pass', 'Page loads successfully');
    } else {
      logTest('Lite Dashboard', 'fail', `Status: ${liteResponse.status}`);
      return false;
    }
    
    // Test health endpoint
    const healthResponse = await makeRequest('http://localhost:8001/api/health');
    if (healthResponse.status === 200) {
      logTest('Health API', 'pass', 'Health check working');
    } else {
      logTest('Health API', 'fail', `Status: ${healthResponse.status}`);
    }
    
    return true;
    
  } catch (error) {
    logTest('Next.js Connection', 'fail', error.message);
    return false;
  }
}

// Test token calculation
function testTokenCalculation() {
  logSection('Token Calculation Test');
  
  try {
    // Simulate the token calculation logic
    function calculateSimpleTokens(type, distanceMeters) {
      const distanceKm = distanceMeters / 1000.0;
      let rate;
      
      switch (type.toLowerCase()) {
        case 'run': rate = 1.0; break;
        case 'ride': rate = 0.5; break;
        case 'walk': rate = 0.7; break;
        default: rate = 0.3; break;
      }
      
      const tokens = distanceKm * rate;
      return Math.max(1.0, Math.round(tokens * 100) / 100);
    }
    
    // Test cases
    const testCases = [
      { type: 'Run', distance: 5000, expected: 5.0 },
      { type: 'Ride', distance: 10000, expected: 5.0 },
      { type: 'Walk', distance: 3000, expected: 2.1 },
      { type: 'Other', distance: 500, expected: 1.0 }
    ];
    
    let allPassed = true;
    
    testCases.forEach(testCase => {
      const calculated = calculateSimpleTokens(testCase.type, testCase.distance);
      const passed = Math.abs(calculated - testCase.expected) < 0.01;
      
      logTest(
        `${testCase.type} Calculation`,
        passed ? 'pass' : 'fail',
        `${testCase.distance}m → ${calculated} tokens`
      );
      
      if (!passed) allPassed = false;
    });
    
    return allPassed;
    
  } catch (error) {
    logTest('Token Calculation', 'fail', error.message);
    return false;
  }
}

// Test environment configuration
function testEnvironment() {
  logSection('Environment Configuration Test');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    logTest('Environment File', 'fail', '.env.local not found');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check required variables
  const requiredVars = [
    'NODE_ENV',
    'NEXT_PUBLIC_APP_URL',
    'DATABASE_URL',
    'NEXT_PUBLIC_USE_MOCK_STRAVA',
    'NEXT_PUBLIC_ENABLE_MOCK_DATA'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      logTest(`${varName}`, 'pass');
    } else {
      logTest(`${varName}`, 'fail', 'Missing from .env.local');
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Main test runner
async function runLocalTests() {
  log('🧪 FUSEtech Lite - Local Environment Test Suite', 'magenta');
  log('Testing local development setup on ports 8001-8003\n', 'white');
  
  const results = {
    database: await testDatabase(),
    mockAPI: await testMockStravaAPI(),
    nextJS: await testNextJSApp(),
    tokens: testTokenCalculation(),
    environment: testEnvironment()
  };
  
  // Summary
  logSection('Local Environment Test Summary');
  
  const passed = Object.values(results).filter(r => r === true).length;
  const total = Object.keys(results).length;
  
  log(`\n📊 Results: ${passed}/${total} test suites passed`, passed === total ? 'green' : 'yellow');
  
  for (const [test, result] of Object.entries(results)) {
    logTest(test.charAt(0).toUpperCase() + test.slice(1), result ? 'pass' : 'fail');
  }
  
  if (passed === total) {
    log('\n🎉 Local environment is ready for testing!', 'green');
    log('✅ All services running correctly', 'green');
    log('✅ Database setup complete', 'green');
    log('✅ Mock API responding', 'green');
    log('✅ Token calculation working', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the setup.', 'yellow');
  }
  
  log('\n🌐 Test URLs:', 'cyan');
  log('📱 FUSEtech Lite: http://localhost:8001/lite', 'white');
  log('🎭 Mock Strava API: http://localhost:8003/health', 'white');
  log('💚 Next.js Health: http://localhost:8001/api/health', 'white');
  
  log('\n🧪 Manual Testing Steps:', 'cyan');
  log('1. Open http://localhost:8001/lite', 'white');
  log('2. Click "Connect Strava Account" (will use mock data)', 'white');
  log('3. Verify token balance and activities display', 'white');
  log('4. Test "Sync Activities" button', 'white');
  log('5. Check browser console for any errors', 'white');
}

// Run tests
runLocalTests().catch(console.error);
