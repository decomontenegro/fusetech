#!/usr/bin/env node

/**
 * FUSEtech Lite - Strava Credentials Test
 * 
 * Tests real Strava API credentials and OAuth flow
 */

const https = require('https');
const http = require('http');
const url = require('url');
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

// Load environment variables
function loadEnvVars() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

// HTTPS request helper
function makeHttpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Test Strava credentials
async function testStravaCredentials() {
  log('🔑 FUSEtech Lite - Strava Credentials Test', 'magenta');
  log('Testing real Strava API integration\n', 'white');
  
  // Load environment variables
  loadEnvVars();
  
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_STRAVA;
  
  // Test 1: Check environment variables
  log('🧪 Testing Environment Configuration...', 'cyan');
  
  if (!clientId) {
    logTest('STRAVA_CLIENT_ID', 'fail', 'Not found in .env.local');
    return false;
  } else {
    logTest('STRAVA_CLIENT_ID', 'pass', `Found: ${clientId}`);
  }
  
  if (!clientSecret) {
    logTest('STRAVA_CLIENT_SECRET', 'fail', 'Not found in .env.local');
    return false;
  } else {
    logTest('STRAVA_CLIENT_SECRET', 'pass', 'Found (hidden for security)');
  }
  
  if (useMock === 'true') {
    logTest('Mock Mode', 'warn', 'NEXT_PUBLIC_USE_MOCK_STRAVA=true (set to false for real Strava)');
  } else {
    logTest('Mock Mode', 'pass', 'Disabled - will use real Strava API');
  }
  
  // Test 2: Validate Client ID format
  log('\n🔍 Testing Credential Format...', 'cyan');
  
  if (!/^\d+$/.test(clientId)) {
    logTest('Client ID Format', 'fail', 'Should be numeric');
    return false;
  } else {
    logTest('Client ID Format', 'pass', 'Valid numeric format');
  }
  
  if (clientSecret.length < 20) {
    logTest('Client Secret Format', 'fail', 'Seems too short');
    return false;
  } else {
    logTest('Client Secret Format', 'pass', 'Appropriate length');
  }
  
  // Test 3: Test OAuth authorization URL
  log('\n🌐 Testing OAuth Configuration...', 'cyan');
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=http://localhost:8001/api/auth/strava/callback&response_type=code&scope=read,activity:read_all&state=test`;
  
  try {
    const authResponse = await makeHttpsRequest({
      hostname: 'www.strava.com',
      path: `/oauth/authorize?client_id=${clientId}&redirect_uri=http://localhost:8001/api/auth/strava/callback&response_type=code&scope=read,activity:read_all&state=test`,
      method: 'GET'
    });
    
    if (authResponse.status === 200 || authResponse.status === 302) {
      logTest('OAuth Authorization URL', 'pass', 'Strava accepts the client ID');
    } else {
      logTest('OAuth Authorization URL', 'fail', `Status: ${authResponse.status}`);
      return false;
    }
  } catch (error) {
    logTest('OAuth Authorization URL', 'fail', error.message);
    return false;
  }
  
  // Test 4: Test token exchange (will fail without code, but validates endpoint)
  log('\n🔐 Testing Token Exchange Endpoint...', 'cyan');
  
  const tokenData = JSON.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    code: 'test_code',
    grant_type: 'authorization_code'
  });
  
  try {
    const tokenResponse = await makeHttpsRequest({
      hostname: 'www.strava.com',
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(tokenData)
      }
    }, tokenData);
    
    if (tokenResponse.status === 400 && tokenResponse.data.message && tokenResponse.data.message.includes('Bad Request')) {
      logTest('Token Exchange Endpoint', 'pass', 'Endpoint accessible (expected 400 with test code)');
    } else if (tokenResponse.status === 400 && tokenResponse.data.errors) {
      logTest('Token Exchange Endpoint', 'pass', 'Endpoint accessible (validation errors expected)');
    } else {
      logTest('Token Exchange Endpoint', 'warn', `Unexpected response: ${tokenResponse.status}`);
    }
  } catch (error) {
    logTest('Token Exchange Endpoint', 'fail', error.message);
    return false;
  }
  
  // Test 5: Generate OAuth URL for manual testing
  log('\n🔗 OAuth URL for Manual Testing...', 'cyan');
  
  const manualTestUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=http://localhost:8001/api/auth/strava/callback&response_type=code&scope=read,activity:read_all&state=manual_test`;
  
  logTest('Manual Test URL', 'pass', 'Generated successfully');
  log(`   ${manualTestUrl}`, 'blue');
  
  return true;
}

// Generate setup instructions
function generateSetupInstructions() {
  log('\n📋 Setup Instructions', 'cyan');
  log('='.repeat(50), 'cyan');
  
  log('\n1. Get Strava Credentials:', 'yellow');
  log('   • Go to: https://www.strava.com/settings/api', 'white');
  log('   • Create new application', 'white');
  log('   • Copy Client ID and Client Secret', 'white');
  
  log('\n2. Update .env.local:', 'yellow');
  log('   STRAVA_CLIENT_ID=your_client_id', 'white');
  log('   STRAVA_CLIENT_SECRET=your_client_secret', 'white');
  log('   NEXT_PUBLIC_USE_MOCK_STRAVA=false', 'white');
  
  log('\n3. Configure Callback URL in Strava:', 'yellow');
  log('   Authorization Callback Domain: localhost', 'white');
  log('   Full URL: http://localhost:8001/api/auth/strava/callback', 'white');
  
  log('\n4. Test OAuth Flow:', 'yellow');
  log('   • Start servers: node scripts/setup-local-test.js', 'white');
  log('   • Open: http://localhost:8001/api/lite-demo', 'white');
  log('   • Click "Connect Strava Account"', 'white');
  log('   • Authorize on Strava', 'white');
  log('   • Should return with real data', 'white');
  
  log('\n5. Verify Integration:', 'yellow');
  log('   • Check real activities appear', 'white');
  log('   • Verify token calculations', 'white');
  log('   • Test sync functionality', 'white');
}

// Main test function
async function runStravaTest() {
  const success = await testStravaCredentials();
  
  log('\n' + '='.repeat(60), 'cyan');
  log('🎯 Strava Integration Test Results', 'cyan');
  log('='.repeat(60), 'cyan');
  
  if (success) {
    log('\n🎉 Strava credentials are configured correctly!', 'green');
    log('✅ Ready to test real OAuth flow', 'green');
    log('✅ Can proceed with production setup', 'green');
  } else {
    log('\n⚠️  Strava credentials need attention', 'yellow');
    generateSetupInstructions();
  }
  
  log('\n🔗 Next Steps:', 'cyan');
  log('1. Test OAuth flow manually', 'white');
  log('2. Verify real activity data sync', 'white');
  log('3. Configure production database', 'white');
  log('4. Deploy to staging environment', 'white');
}

// Run test
runStravaTest().catch(console.error);
