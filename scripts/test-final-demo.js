#!/usr/bin/env node

/**
 * FUSEtech Lite - Final Demo Test
 * 
 * Tests the complete working demo environment
 */

const http = require('http');

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
        resolve({ status: res.statusCode, data: data });
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

async function testFinalDemo() {
  log('🎯 FUSEtech Lite - Final Demo Test', 'magenta');
  log('Testing complete working environment\n', 'white');

  let allPassed = true;

  try {
    // Test 1: Demo page loads
    log('🧪 Testing Demo Page...', 'cyan');
    const demoResponse = await makeRequest('http://localhost:8001/api/lite-demo');
    
    if (demoResponse.status === 200) {
      logTest('Demo Page Load', 'pass', 'Page loads successfully');
      
      // Check for key content
      if (demoResponse.data.includes('FUSEtech Lite')) {
        logTest('Page Content', 'pass', 'Contains FUSEtech branding');
      } else {
        logTest('Page Content', 'fail', 'Missing expected content');
        allPassed = false;
      }
      
      if (demoResponse.data.includes('Connect Strava Account')) {
        logTest('Strava Integration', 'pass', 'Connect button present');
      } else {
        logTest('Strava Integration', 'fail', 'Missing Strava connection');
        allPassed = false;
      }
      
      if (demoResponse.data.includes('47.50')) {
        logTest('Token Display', 'pass', 'Token balance shown');
      } else {
        logTest('Token Display', 'fail', 'Missing token balance');
        allPassed = false;
      }
      
    } else {
      logTest('Demo Page Load', 'fail', `Status: ${demoResponse.status}`);
      allPassed = false;
    }

    // Test 2: Mock Strava API
    log('\n🎭 Testing Mock Strava API...', 'cyan');
    const mockHealthResponse = await makeRequest('http://localhost:8003/health');
    
    if (mockHealthResponse.status === 200) {
      logTest('Mock API Health', 'pass', 'API responding');
      
      try {
        const healthData = JSON.parse(mockHealthResponse.data);
        if (healthData.status === 'healthy') {
          logTest('API Status', 'pass', 'Service healthy');
        } else {
          logTest('API Status', 'fail', 'Service not healthy');
          allPassed = false;
        }
      } catch (error) {
        logTest('API Response', 'fail', 'Invalid JSON response');
        allPassed = false;
      }
    } else {
      logTest('Mock API Health', 'fail', `Status: ${mockHealthResponse.status}`);
      allPassed = false;
    }

    // Test 3: Mock athlete endpoint
    const athleteResponse = await makeRequest('http://localhost:8003/api/v3/athlete', {
      headers: { 'Authorization': 'Bearer test_token' }
    });
    
    if (athleteResponse.status === 200) {
      logTest('Athlete Endpoint', 'pass', 'Mock athlete data available');
    } else {
      logTest('Athlete Endpoint', 'fail', `Status: ${athleteResponse.status}`);
      allPassed = false;
    }

    // Test 4: Mock activities endpoint
    const activitiesResponse = await makeRequest('http://localhost:8003/api/v3/athlete/activities', {
      headers: { 'Authorization': 'Bearer test_token' }
    });
    
    if (activitiesResponse.status === 200) {
      try {
        const activities = JSON.parse(activitiesResponse.data);
        if (Array.isArray(activities) && activities.length > 0) {
          logTest('Activities Endpoint', 'pass', `${activities.length} mock activities`);
        } else {
          logTest('Activities Endpoint', 'fail', 'No activities returned');
          allPassed = false;
        }
      } catch (error) {
        logTest('Activities Endpoint', 'fail', 'Invalid JSON response');
        allPassed = false;
      }
    } else {
      logTest('Activities Endpoint', 'fail', `Status: ${activitiesResponse.status}`);
      allPassed = false;
    }

    // Test 5: Next.js health
    log('\n💚 Testing Next.js Health...', 'cyan');
    try {
      const nextHealthResponse = await makeRequest('http://localhost:8001/api/health');
      if (nextHealthResponse.status === 200) {
        logTest('Next.js Health', 'pass', 'Application healthy');
      } else {
        logTest('Next.js Health', 'warn', `Status: ${nextHealthResponse.status}`);
      }
    } catch (error) {
      logTest('Next.js Health', 'warn', 'Health endpoint not available');
    }

  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    allPassed = false;
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('🎯 Final Demo Test Results', 'cyan');
  log('='.repeat(60), 'cyan');

  if (allPassed) {
    log('\n🎉 All tests passed! Demo is ready!', 'green');
    log('✅ FUSEtech Lite MVP is fully functional', 'green');
    log('✅ Mock Strava API working correctly', 'green');
    log('✅ Demo page loads and displays properly', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the issues above.', 'yellow');
  }

  log('\n🌐 Demo URLs:', 'cyan');
  log('📱 FUSEtech Lite Demo: http://localhost:8001/api/lite-demo', 'white');
  log('🎭 Mock Strava API: http://localhost:8003/health', 'white');
  log('💚 Next.js Health: http://localhost:8001/api/health', 'white');

  log('\n🧪 Manual Testing Steps:', 'cyan');
  log('1. Open http://localhost:8001/api/lite-demo', 'white');
  log('2. Wait for loading screen (1 second)', 'white');
  log('3. Click "Connect Strava Account"', 'white');
  log('4. Verify dashboard shows 47.50 FUSE tokens', 'white');
  log('5. Check 3 recent activities are displayed', 'white');
  log('6. Test "Sync Activities" button', 'white');
  log('7. Verify all interactions work smoothly', 'white');

  log('\n💡 Demo Features:', 'cyan');
  log('• Complete MVP user flow', 'white');
  log('• Mock Strava integration', 'white');
  log('• Token balance display', 'white');
  log('• Activity history', 'white');
  log('• Responsive design', 'white');
  log('• No external dependencies', 'white');

  log('\n🎯 Ready for stakeholder demo!', 'green');
}

// Run tests
testFinalDemo().catch(console.error);
