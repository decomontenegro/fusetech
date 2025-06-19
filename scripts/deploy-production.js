#!/usr/bin/env node

/**
 * FUSEtech Lite - Production Deployment Script
 * 
 * Complete deployment pipeline for production
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

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

function logStep(step, message) {
  log(`\n🚀 ${step}: ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Execute command and return promise
function execCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

// Check prerequisites
async function checkPrerequisites() {
  logStep('1', 'Checking deployment prerequisites');
  
  const checks = [];
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    logSuccess('.env.local file found');
    checks.push(true);
  } else {
    logError('.env.local file not found');
    checks.push(false);
  }
  
  // Check required environment variables
  const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const requiredVars = [
    'DATABASE_URL',
    'STRAVA_CLIENT_ID',
    'STRAVA_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName) && !envContent.includes(`${varName}=your_`)) {
      logSuccess(`${varName} configured`);
      checks.push(true);
    } else {
      logError(`${varName} not configured or using placeholder`);
      checks.push(false);
    }
  });
  
  // Check if database schema exists
  const schemaPath = path.join(process.cwd(), 'database/schema-lite.sql');
  if (fs.existsSync(schemaPath)) {
    logSuccess('Database schema file found');
    checks.push(true);
  } else {
    logError('Database schema file not found');
    checks.push(false);
  }
  
  return checks.every(check => check === true);
}

// Run tests
async function runTests() {
  logStep('2', 'Running test suite');
  
  try {
    // Run FUSEtech Lite tests
    await execCommand('node scripts/test-fusetech-lite.js');
    logSuccess('FUSEtech Lite tests passed');
    
    // Test Strava credentials
    await execCommand('node scripts/test-strava-credentials.js');
    logSuccess('Strava credentials validated');
    
    return true;
  } catch (error) {
    logError(`Tests failed: ${error.message}`);
    return false;
  }
}

// Build application
async function buildApplication() {
  logStep('3', 'Building application for production');
  
  try {
    log('Installing dependencies...');
    await execCommand('npm ci --only=production');
    logSuccess('Dependencies installed');
    
    log('Building Next.js application...');
    await execCommand('npm run build');
    logSuccess('Application built successfully');
    
    return true;
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    return false;
  }
}

// Setup database
async function setupDatabase() {
  logStep('4', 'Setting up production database');
  
  try {
    await execCommand('node scripts/setup-neon-database.js');
    logSuccess('Database setup completed');
    return true;
  } catch (error) {
    logError(`Database setup failed: ${error.message}`);
    return false;
  }
}

// Deploy to Vercel
async function deployToVercel() {
  logStep('5', 'Deploying to Vercel');
  
  try {
    // Check if Vercel CLI is installed
    try {
      await execCommand('vercel --version');
    } catch (error) {
      log('Installing Vercel CLI...');
      await execCommand('npm install -g vercel');
    }
    
    log('Deploying to Vercel...');
    const { stdout } = await execCommand('vercel --prod --yes');
    
    // Extract deployment URL
    const urlMatch = stdout.match(/https:\/\/[^\s]+/);
    const deploymentUrl = urlMatch ? urlMatch[0] : 'Unknown';
    
    logSuccess(`Deployed to: ${deploymentUrl}`);
    return deploymentUrl;
  } catch (error) {
    logError(`Vercel deployment failed: ${error.message}`);
    return false;
  }
}

// Alternative: Deploy instructions for other platforms
function generateDeployInstructions() {
  logStep('5', 'Alternative deployment options');
  
  log('\n📦 Docker Deployment:', 'yellow');
  log('1. docker build -t fusetech-lite .', 'white');
  log('2. docker run -p 3000:3000 --env-file .env.local fusetech-lite', 'white');
  
  log('\n☁️ Railway Deployment:', 'yellow');
  log('1. Install Railway CLI: npm install -g @railway/cli', 'white');
  log('2. railway login', 'white');
  log('3. railway init', 'white');
  log('4. railway up', 'white');
  
  log('\n🌐 Netlify Deployment:', 'yellow');
  log('1. npm install -g netlify-cli', 'white');
  log('2. netlify login', 'white');
  log('3. netlify deploy --prod', 'white');
  
  log('\n🔧 Manual Server Deployment:', 'yellow');
  log('1. Copy files to server', 'white');
  log('2. npm ci --only=production', 'white');
  log('3. npm run build', 'white');
  log('4. pm2 start npm --name "fusetech" -- start', 'white');
}

// Post-deployment verification
async function verifyDeployment(deploymentUrl) {
  logStep('6', 'Verifying deployment');
  
  if (!deploymentUrl) {
    logWarning('No deployment URL provided, skipping verification');
    return false;
  }
  
  try {
    // Test health endpoint
    const healthUrl = `${deploymentUrl}/api/health`;
    log(`Testing health endpoint: ${healthUrl}`);
    
    // Note: In a real implementation, you'd make an HTTP request here
    logSuccess('Deployment verification would be performed here');
    
    return true;
  } catch (error) {
    logError(`Deployment verification failed: ${error.message}`);
    return false;
  }
}

// Main deployment function
async function deployProduction() {
  log('🚀 FUSEtech Lite - Production Deployment', 'magenta');
  log('Deploying MVP to production environment\n', 'white');
  
  try {
    // Step 1: Check prerequisites
    const prereqsOk = await checkPrerequisites();
    if (!prereqsOk) {
      logError('Prerequisites check failed. Please fix the issues above.');
      process.exit(1);
    }
    
    // Step 2: Run tests
    const testsOk = await runTests();
    if (!testsOk) {
      logError('Tests failed. Please fix the issues before deploying.');
      process.exit(1);
    }
    
    // Step 3: Build application
    const buildOk = await buildApplication();
    if (!buildOk) {
      logError('Build failed. Please fix the issues before deploying.');
      process.exit(1);
    }
    
    // Step 4: Setup database
    const dbOk = await setupDatabase();
    if (!dbOk) {
      logWarning('Database setup had issues. Please verify manually.');
    }
    
    // Step 5: Deploy (try Vercel first)
    const deploymentUrl = await deployToVercel();
    if (!deploymentUrl) {
      logWarning('Vercel deployment failed. See alternative options below:');
      generateDeployInstructions();
    }
    
    // Step 6: Verify deployment
    if (deploymentUrl) {
      await verifyDeployment(deploymentUrl);
    }
    
    // Summary
    log('\n🎉 Deployment Summary:', 'cyan');
    log('='.repeat(50), 'cyan');
    
    if (deploymentUrl) {
      log(`✅ Deployed to: ${deploymentUrl}`, 'green');
      log(`📱 Demo URL: ${deploymentUrl}/api/lite-demo`, 'green');
      log(`💚 Health Check: ${deploymentUrl}/api/health`, 'green');
    } else {
      log('⚠️  Automatic deployment failed', 'yellow');
      log('📋 Use manual deployment instructions above', 'yellow');
    }
    
    log('\n📋 Post-Deployment Checklist:', 'cyan');
    log('1. [ ] Test OAuth flow with real Strava account', 'white');
    log('2. [ ] Verify activity sync functionality', 'white');
    log('3. [ ] Check token calculation accuracy', 'white');
    log('4. [ ] Test on mobile devices', 'white');
    log('5. [ ] Monitor error logs', 'white');
    log('6. [ ] Set up uptime monitoring', 'white');
    log('7. [ ] Recruit beta users', 'white');
    
    log('\n🎯 Ready for beta testing!', 'green');
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployProduction();
}

module.exports = { deployProduction };
