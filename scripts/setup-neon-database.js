#!/usr/bin/env node

/**
 * FUSEtech Lite - Neon Database Setup Script
 * 
 * Sets up PostgreSQL database on Neon for production
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

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

// Check if pg is available
function checkPostgreSQL() {
  try {
    require('pg');
    return true;
  } catch (error) {
    return false;
  }
}

// Setup Neon database
async function setupNeonDatabase() {
  logStep('1', 'Setting up Neon PostgreSQL database');
  
  // Check for DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logError('DATABASE_URL not found in environment variables');
    log('Please set DATABASE_URL with your Neon connection string:', 'yellow');
    log('export DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"', 'white');
    return false;
  }
  
  if (databaseUrl.includes('file:')) {
    logWarning('DATABASE_URL points to SQLite. Please use Neon PostgreSQL URL.');
    return false;
  }
  
  const schemaPath = path.join(process.cwd(), 'database/schema-lite.sql');
  
  if (!fs.existsSync(schemaPath)) {
    logError('PostgreSQL schema file not found: database/schema-lite.sql');
    return false;
  }
  
  try {
    log('Connecting to Neon database...');
    const client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    await client.connect();
    logSuccess('Connected to Neon database');
    
    // Read and execute schema
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    log('Executing database schema...');
    await client.query(schema);
    logSuccess('Database schema created successfully');
    
    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    log(`Created tables: ${tables.join(', ')}`);
    
    // Verify sample data
    const userCountResult = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult.rows[0].count;
    log(`Sample data: ${userCount} test users`);
    
    await client.end();
    logSuccess('Database setup complete');
    
    return true;
    
  } catch (error) {
    logError(`Database setup failed: ${error.message}`);
    
    if (error.message.includes('does not exist')) {
      log('💡 Make sure your Neon database is created and accessible', 'yellow');
    }
    
    if (error.message.includes('authentication')) {
      log('💡 Check your DATABASE_URL credentials', 'yellow');
    }
    
    return false;
  }
}

// Test database connection
async function testDatabaseConnection() {
  logStep('2', 'Testing database connection and queries');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logError('DATABASE_URL not found');
    return false;
  }
  
  try {
    const client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    await client.connect();
    
    // Test basic queries
    const versionResult = await client.query('SELECT version()');
    log(`PostgreSQL version: ${versionResult.rows[0].version.split(' ')[0]} ${versionResult.rows[0].version.split(' ')[1]}`);
    
    // Test user stats function
    const statsResult = await client.query('SELECT * FROM get_user_stats_lite($1)', ['00000000-0000-0000-0000-000000000000']);
    logSuccess('User stats function working');
    
    // Test token calculation function
    const tokenResult = await client.query('SELECT calculate_simple_tokens($1, $2)', ['Run', 5000]);
    const tokens = tokenResult.rows[0].calculate_simple_tokens;
    log(`Token calculation test: 5km run = ${tokens} tokens`);
    
    await client.end();
    logSuccess('Database connection and queries working');
    
    return true;
    
  } catch (error) {
    logError(`Database test failed: ${error.message}`);
    return false;
  }
}

// Create production environment file
function createProductionEnv() {
  logStep('3', 'Creating production environment configuration');
  
  const envProdPath = path.join(process.cwd(), '.env.production');
  
  const envContent = `# FUSEtech Lite - Production Environment
# Copy this to .env.local for production deployment

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# Strava OAuth (REAL credentials)
STRAVA_CLIENT_ID=your_real_strava_client_id
STRAVA_CLIENT_SECRET=your_real_strava_client_secret

# Session Secret (generate a secure random string)
NEXTAUTH_SECRET=your_secure_session_secret_here

# Production flags
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_USE_MOCK_STRAVA=false
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false

# Optional: Analytics and monitoring
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=true

# Optional: Feature flags for gradual rollout
NEXT_PUBLIC_ENABLE_LITE_MODE=true
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=false
NEXT_PUBLIC_ENABLE_MARKETPLACE=false
`;

  fs.writeFileSync(envProdPath, envContent);
  logSuccess('Production environment template created: .env.production');
  
  log('📝 Next steps:', 'yellow');
  log('1. Get Neon database URL from https://neon.tech', 'white');
  log('2. Get Strava credentials from https://www.strava.com/settings/api', 'white');
  log('3. Generate secure NEXTAUTH_SECRET', 'white');
  log('4. Update .env.production with real values', 'white');
  log('5. Copy .env.production to .env.local for deployment', 'white');
  
  return true;
}

// Install production dependencies
async function installProductionDeps() {
  logStep('4', 'Checking production dependencies');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    logError('package.json not found');
    return false;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  const requiredDeps = ['pg', 'next', 'react', 'react-dom'];
  const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
  
  if (missingDeps.length > 0) {
    logWarning(`Missing dependencies: ${missingDeps.join(', ')}`);
    log('Install with: npm install pg', 'white');
  } else {
    logSuccess('All required dependencies present');
  }
  
  return true;
}

// Main setup function
async function setupProduction() {
  log('🚀 FUSEtech Lite - Production Database Setup', 'magenta');
  log('Setting up Neon PostgreSQL for production deployment\n', 'white');
  
  try {
    // Check PostgreSQL client
    if (!checkPostgreSQL()) {
      logError('PostgreSQL client not available. Install with: npm install pg');
      process.exit(1);
    }
    
    // Setup database
    const dbSetup = await setupNeonDatabase();
    
    // Test connection
    const dbTest = await testDatabaseConnection();
    
    // Create production env
    const envSetup = createProductionEnv();
    
    // Check dependencies
    const depsCheck = await installProductionDeps();
    
    log('\n🎉 Production setup summary:', 'cyan');
    log(`Database setup: ${dbSetup ? '✅' : '❌'}`, dbSetup ? 'green' : 'red');
    log(`Database test: ${dbTest ? '✅' : '❌'}`, dbTest ? 'green' : 'red');
    log(`Environment config: ${envSetup ? '✅' : '❌'}`, envSetup ? 'green' : 'red');
    log(`Dependencies: ${depsCheck ? '✅' : '❌'}`, depsCheck ? 'green' : 'red');
    
    if (dbSetup && dbTest) {
      log('\n🎯 Ready for production deployment!', 'green');
      log('Next: Configure Strava credentials and deploy', 'white');
    } else {
      log('\n⚠️  Some setup steps failed. Check the errors above.', 'yellow');
    }
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupProduction();
}

module.exports = { setupProduction };
