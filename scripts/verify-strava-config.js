#!/usr/bin/env node

/**
 * FUSEtech - Verify Strava Configuration
 * 
 * Tests the real Strava credentials and generates OAuth URL
 */

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

// Load environment variables
function loadEnvVars() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value && !key.startsWith('#')) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

function verifyStravaConfig() {
  log('🔗 FUSEtech - Strava Configuration Verification', 'magenta');
  log('='.repeat(60), 'cyan');
  
  // Load environment
  loadEnvVars();
  
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:8001';
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_STRAVA;
  
  log('\n📋 Current Configuration:', 'cyan');
  log(`Client ID: ${clientId}`, clientId ? 'green' : 'red');
  log(`Client Secret: ${clientSecret ? '***' + clientSecret.slice(-4) : 'NOT SET'}`, clientSecret ? 'green' : 'red');
  log(`Base URL: ${nextAuthUrl}`, 'white');
  log(`Mock Mode: ${useMock}`, useMock === 'false' ? 'green' : 'yellow');
  
  if (!clientId || !clientSecret) {
    log('\n❌ Missing Strava credentials!', 'red');
    return false;
  }
  
  // Generate OAuth URLs
  const callbackUrl = `${nextAuthUrl}/api/auth/strava/callback`;
  const scope = 'read,activity:read_all';
  const state = 'fusetech_auth_' + Date.now();
  
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${scope}&state=${state}`;
  
  log('\n🔗 OAuth Configuration:', 'cyan');
  log(`Callback URL: ${callbackUrl}`, 'white');
  log(`Scope: ${scope}`, 'white');
  log(`State: ${state}`, 'white');
  
  log('\n🌐 Authorization URL:', 'cyan');
  log(authUrl, 'blue');
  
  log('\n📋 Strava App Configuration Required:', 'yellow');
  log('1. Go to: https://www.strava.com/settings/api', 'white');
  log('2. Edit your application', 'white');
  log('3. Set Authorization Callback Domain to: localhost', 'white');
  log('4. Save changes', 'white');
  
  log('\n🧪 Testing Steps:', 'cyan');
  log('1. Make sure servers are running:', 'white');
  log('   node scripts/setup-local-test.js', 'blue');
  log('2. Open the authorization URL above in browser', 'white');
  log('3. Authorize FUSEtech on Strava', 'white');
  log('4. Should redirect back to localhost:8001', 'white');
  
  log('\n✅ Configuration looks good!', 'green');
  log('Ready to test real Strava integration', 'white');
  
  return true;
}

// Run verification
verifyStravaConfig();
