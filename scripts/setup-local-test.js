#!/usr/bin/env node

/**
 * FUSEtech Lite - Local Testing Setup Script
 * 
 * Sets up local environment for testing:
 * 1. Creates SQLite database
 * 2. Runs schema setup
 * 3. Configures environment
 * 4. Starts mock services
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const sqlite3 = require('sqlite3').verbose();

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
  log(`\n🔧 ${step}: ${message}`, 'cyan');
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

// Check if SQLite3 is available
function checkSQLite() {
  try {
    require('sqlite3');
    return true;
  } catch (error) {
    return false;
  }
}

// Setup SQLite database
async function setupDatabase() {
  logStep('1', 'Setting up SQLite database');
  
  const dbPath = path.join(process.cwd(), 'dev.db');
  const schemaPath = path.join(process.cwd(), 'database/schema-lite-sqlite.sql');
  
  // Remove existing database
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    log('Removed existing database');
  }
  
  // Check if schema file exists
  if (!fs.existsSync(schemaPath)) {
    logError('SQLite schema file not found: database/schema-lite-sqlite.sql');
    return false;
  }
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logError(`Failed to create database: ${err.message}`);
        reject(err);
        return;
      }
      
      log('Created SQLite database: dev.db');
      
      // Read and execute schema
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      db.exec(schema, (err) => {
        if (err) {
          logError(`Failed to execute schema: ${err.message}`);
          reject(err);
          return;
        }
        
        logSuccess('Database schema created successfully');
        
        // Verify tables were created
        db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
          if (err) {
            logError(`Failed to verify tables: ${err.message}`);
            reject(err);
            return;
          }
          
          log(`Created tables: ${tables.map(t => t.name).join(', ')}`);
          
          // Verify sample data
          db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
            if (err) {
              logWarning(`Could not verify sample data: ${err.message}`);
            } else {
              log(`Sample data: ${result.count} test users`);
            }
            
            db.close();
            logSuccess('Database setup complete');
            resolve(true);
          });
        });
      });
    });
  });
}

// Setup environment file
function setupEnvironment() {
  logStep('2', 'Setting up environment configuration');
  
  const envTestPath = path.join(process.cwd(), '.env.local.test');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envTestPath)) {
    logError('.env.local.test file not found');
    return false;
  }
  
  // Copy test env to local env
  const envContent = fs.readFileSync(envTestPath, 'utf8');
  fs.writeFileSync(envLocalPath, envContent);
  
  logSuccess('Environment file created: .env.local');
  log('Configure STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET for real Strava integration');
  
  return true;
}

// Install dependencies if needed
async function checkDependencies() {
  logStep('3', 'Checking dependencies');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json not found');
    return false;
  }
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('Installing dependencies...');
    
    return new Promise((resolve, reject) => {
      const npm = spawn('npm', ['install'], { stdio: 'inherit' });
      
      npm.on('close', (code) => {
        if (code === 0) {
          logSuccess('Dependencies installed');
          resolve(true);
        } else {
          logError('Failed to install dependencies');
          reject(false);
        }
      });
    });
  } else {
    logSuccess('Dependencies already installed');
    return true;
  }
}

// Start mock Strava server
function startMockServer() {
  logStep('4', 'Starting Mock Strava API server');
  
  const mockServerPath = path.join(process.cwd(), 'scripts/mock-strava-server.js');
  
  if (!fs.existsSync(mockServerPath)) {
    logError('Mock server script not found');
    return null;
  }
  
  const mockServer = spawn('node', [mockServerPath], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });
  
  mockServer.stdout.on('data', (data) => {
    process.stdout.write(data);
  });
  
  mockServer.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  mockServer.on('close', (code) => {
    if (code !== 0) {
      logError(`Mock server exited with code ${code}`);
    }
  });
  
  // Give server time to start
  setTimeout(() => {
    logSuccess('Mock Strava API server started on port 8003');
  }, 1000);
  
  return mockServer;
}

// Start Next.js development server
function startNextServer() {
  logStep('5', 'Starting Next.js development server');
  
  const nextServer = spawn('npm', ['run', 'dev', '--', '--port', '8001'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: '8001' }
  });
  
  nextServer.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready')) {
      logSuccess('Next.js server ready on http://localhost:8001');
      log('\n🎯 FUSEtech Lite is ready for testing!');
      log('📱 Open: http://localhost:8001/lite');
      log('🎭 Mock API: http://localhost:8003/health');
    }
    process.stdout.write(data);
  });
  
  nextServer.stderr.on('data', (data) => {
    process.stderr.write(data);
  });
  
  nextServer.on('close', (code) => {
    if (code !== 0) {
      logError(`Next.js server exited with code ${code}`);
    }
  });
  
  return nextServer;
}

// Main setup function
async function setupLocalTesting() {
  log('🚀 FUSEtech Lite - Local Testing Setup', 'magenta');
  log('=====================================\n');
  
  try {
    // Check SQLite availability
    if (!checkSQLite()) {
      logError('SQLite3 not available. Install with: npm install sqlite3');
      process.exit(1);
    }
    
    // Setup database
    await setupDatabase();
    
    // Setup environment
    setupEnvironment();
    
    // Check dependencies
    await checkDependencies();
    
    log('\n🎉 Setup complete! Starting servers...\n');
    
    // Start mock server
    const mockServer = startMockServer();
    
    // Wait a bit for mock server to start
    setTimeout(() => {
      // Start Next.js server
      const nextServer = startNextServer();
      
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        log('\n\n🛑 Shutting down servers...');
        
        if (mockServer) {
          mockServer.kill();
        }
        
        if (nextServer) {
          nextServer.kill();
        }
        
        setTimeout(() => {
          log('✅ Servers stopped');
          process.exit(0);
        }, 1000);
      });
      
    }, 2000);
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupLocalTesting();
}

module.exports = { setupLocalTesting };
