#!/usr/bin/env node

/**
 * FUSEtech Staging Environment Validation Script
 * Validates that staging environment is properly configured
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`)
};

// Configuration
const STAGING_URL = 'https://staging.fusetech.app';
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_ENVIRONMENT',
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL',
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'STRAVA_CLIENT_ID',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

const CRITICAL_ENDPOINTS = [
  '/',
  '/api/health',
  '/login',
  '/marketplace',
  '/dashboard'
];

const EXPECTED_HEADERS = {
  'x-environment': 'staging',
  'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY'
};

// Validation functions
async function checkURL(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function validateEndpoints() {
  console.log('\n🔍 Validating Staging Endpoints...\n');
  
  for (const endpoint of CRITICAL_ENDPOINTS) {
    const url = `${STAGING_URL}${endpoint}`;
    const result = await checkURL(url);
    
    if (result.error) {
      log.error(`${endpoint} - Error: ${result.error}`);
    } else if (result.statusCode >= 200 && result.statusCode < 400) {
      log.success(`${endpoint} - Status: ${result.statusCode}`);
    } else {
      log.error(`${endpoint} - Status: ${result.statusCode}`);
    }
  }
}

async function validateHeaders() {
  console.log('\n🔍 Validating Security Headers...\n');
  
  const result = await checkURL(STAGING_URL);
  
  if (result.error) {
    log.error(`Failed to fetch headers: ${result.error}`);
    return;
  }
  
  for (const [header, expectedValue] of Object.entries(EXPECTED_HEADERS)) {
    const actualValue = result.headers[header];
    
    if (actualValue === expectedValue) {
      log.success(`${header}: ${actualValue}`);
    } else if (actualValue) {
      log.warning(`${header}: ${actualValue} (expected: ${expectedValue})`);
    } else {
      log.error(`${header}: Missing`);
    }
  }
}

function validateLocalEnv() {
  console.log('\n🔍 Validating Local Environment...\n');
  
  const envPath = path.join(process.cwd(), '.env.staging.local');
  
  if (!fs.existsSync(envPath)) {
    log.error('.env.staging.local not found');
    log.info('Run: npm run staging:env');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) envVars[key.trim()] = true;
    }
  });
  
  for (const varName of REQUIRED_ENV_VARS) {
    if (envVars[varName]) {
      log.success(`${varName} is set`);
    } else {
      log.error(`${varName} is missing`);
    }
  }
}

function validateGitBranch() {
  console.log('\n🔍 Validating Git Configuration...\n');
  
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    
    if (currentBranch === 'staging') {
      log.success(`Current branch: ${currentBranch}`);
    } else {
      log.warning(`Current branch: ${currentBranch} (not staging)`);
    }
    
    // Check if staging branch exists
    const branches = execSync('git branch -a', { encoding: 'utf8' });
    if (branches.includes('remotes/origin/staging')) {
      log.success('Remote staging branch exists');
    } else {
      log.error('Remote staging branch not found');
    }
    
  } catch (error) {
    log.error(`Git error: ${error.message}`);
  }
}

function validateVercelCLI() {
  console.log('\n🔍 Validating Vercel CLI...\n');
  
  try {
    const vercelVersion = execSync('vercel --version', { encoding: 'utf8' }).trim();
    log.success(`Vercel CLI installed: ${vercelVersion}`);
    
    // Check if logged in
    try {
      execSync('vercel whoami', { encoding: 'utf8' });
      log.success('Vercel CLI authenticated');
    } catch {
      log.error('Vercel CLI not authenticated');
      log.info('Run: vercel login');
    }
  } catch {
    log.error('Vercel CLI not installed');
    log.info('Run: npm install -g vercel');
  }
}

async function validateSSL() {
  console.log('\n🔍 Validating SSL Certificate...\n');
  
  const url = new URL(STAGING_URL);
  
  const options = {
    hostname: url.hostname,
    port: 443,
    path: '/',
    method: 'GET'
  };
  
  const req = https.request(options, (res) => {
    const cert = res.socket.getPeerCertificate();
    
    if (cert.subject) {
      log.success(`SSL Certificate: ${cert.subject.CN}`);
      log.info(`Issuer: ${cert.issuer.O}`);
      log.info(`Valid until: ${cert.valid_to}`);
      
      // Check if certificate is valid for more than 30 days
      const validTo = new Date(cert.valid_to);
      const daysRemaining = Math.floor((validTo - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 30) {
        log.success(`Certificate valid for ${daysRemaining} days`);
      } else if (daysRemaining > 0) {
        log.warning(`Certificate expires in ${daysRemaining} days`);
      } else {
        log.error('Certificate has expired!');
      }
    }
  });
  
  req.on('error', (e) => {
    log.error(`SSL Error: ${e.message}`);
  });
  
  req.end();
}

// Main validation
async function main() {
  console.log('🚀 FUSEtech Staging Environment Validation\n');
  console.log(`Target: ${STAGING_URL}`);
  console.log('═'.repeat(50));
  
  // Local checks
  validateLocalEnv();
  validateGitBranch();
  validateVercelCLI();
  
  // Remote checks
  await validateEndpoints();
  await validateHeaders();
  await validateSSL();
  
  console.log('\n═'.repeat(50));
  console.log('\n✅ Validation complete!\n');
  
  console.log('📋 Next steps:');
  console.log('   1. Fix any errors shown above');
  console.log('   2. Run: npm run deploy:staging');
  console.log('   3. Monitor deployment at: https://vercel.com/dashboard');
}

// Run validation
main().catch(console.error);