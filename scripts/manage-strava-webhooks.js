#!/usr/bin/env node

/**
 * Strava Webhook Management Script
 * 
 * Usage:
 *   npm run webhooks:list     - List current webhook subscriptions
 *   npm run webhooks:create   - Create a new webhook subscription
 *   npm run webhooks:delete  - Delete webhook subscription
 *   npm run webhooks:test    - Test webhook endpoint
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Import after env vars are loaded
const { stravaWebhookManager } = require('../src/lib/webhooks/strava-webhook-manager');

const command = process.argv[2];

async function main() {
  console.log('🏃 Strava Webhook Manager\n');

  // Validate configuration first
  const validation = stravaWebhookManager.validateConfiguration();
  if (!validation.valid) {
    console.error('❌ Configuration errors:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
    console.log('\n💡 Make sure all required environment variables are set in .env.local');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'list':
        await listSubscriptions();
        break;
      
      case 'create':
        await createSubscription();
        break;
      
      case 'delete':
        await deleteSubscription();
        break;
      
      case 'test':
        await testWebhook();
        break;
      
      default:
        console.log('Usage:');
        console.log('  npm run webhooks:list     - List current webhook subscriptions');
        console.log('  npm run webhooks:create   - Create a new webhook subscription');
        console.log('  npm run webhooks:delete  - Delete webhook subscription');
        console.log('  npm run webhooks:test    - Test webhook endpoint');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

async function listSubscriptions() {
  console.log('📋 Fetching webhook subscriptions...\n');
  
  const subscriptions = await stravaWebhookManager.viewSubscriptions();
  
  if (subscriptions.length === 0) {
    console.log('No webhook subscriptions found.');
  } else {
    subscriptions.forEach(sub => {
      console.log(`ID: ${sub.id}`);
      console.log(`Application ID: ${sub.application_id}`);
      console.log(`Callback URL: ${sub.callback_url}`);
      console.log(`Created: ${sub.created_at}`);
      console.log(`Updated: ${sub.updated_at}`);
      console.log('---');
    });
  }
}

async function createSubscription() {
  console.log('🔨 Creating webhook subscription...\n');
  
  const subscription = await stravaWebhookManager.createSubscription();
  
  console.log('✅ Webhook subscription created successfully!');
  console.log(`ID: ${subscription.id}`);
  console.log(`Callback URL: ${subscription.callback_url}`);
}

async function deleteSubscription() {
  // First list subscriptions
  const subscriptions = await stravaWebhookManager.viewSubscriptions();
  
  if (subscriptions.length === 0) {
    console.log('No webhook subscriptions to delete.');
    return;
  }

  console.log('Current subscriptions:');
  subscriptions.forEach((sub, index) => {
    console.log(`${index + 1}. ID: ${sub.id} - ${sub.callback_url}`);
  });

  // In a real CLI, you'd prompt for selection
  // For now, we'll delete the first one
  const subToDelete = subscriptions[0];
  
  console.log(`\n🗑️  Deleting subscription ID: ${subToDelete.id}...`);
  
  await stravaWebhookManager.deleteSubscription(subToDelete.id);
  
  console.log('✅ Webhook subscription deleted successfully!');
}

async function testWebhook() {
  console.log('🧪 Testing webhook endpoint...\n');
  
  const { event, signature } = stravaWebhookManager.createTestEvent('activity');
  
  console.log('Test Event:', JSON.stringify(event, null, 2));
  console.log(`\nSignature: ${signature}`);
  console.log(`\nTo test your webhook endpoint, send a POST request to:`);
  console.log(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/strava`);
  console.log(`\nWith headers:`);
  console.log(`x-hub-signature: ${signature}`);
  console.log(`Content-Type: application/json`);
  console.log(`\nAnd body:`);
  console.log(JSON.stringify(event, null, 2));
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});