#!/usr/bin/env node

/**
 * Build script to inject Firebase configuration into service worker
 * This runs during build time to replace placeholders with actual environment variables
 */

const fs = require('fs');
const path = require('path');

// Read the service worker template
const swPath = path.join(__dirname, '../public/firebase-messaging-sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace placeholders with environment variables
const replacements = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// Perform replacements
for (const [placeholder, value] of Object.entries(replacements)) {
  swContent = swContent.replace(placeholder, value);
}

// Write the updated service worker
fs.writeFileSync(swPath, swContent);

console.log('Service worker built successfully with Firebase configuration');