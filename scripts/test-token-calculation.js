#!/usr/bin/env node

/**
 * FUSEtech Token Calculation Test
 * 
 * Simulates the PostgreSQL calculate_activity_tokens function
 * to validate token calculations before database deployment
 */

// Token calculation function (JavaScript implementation of the SQL function)
function calculateActivityTokens(activityType, distanceMeters, movingTimeSeconds, bonusMultiplier = 1.0) {
  // Convert distance to kilometers
  const distanceKm = distanceMeters / 1000.0;
  
  // Set base multipliers per activity type (tokens per km)
  let baseMultiplier;
  switch (activityType.toLowerCase()) {
    case 'run':
      baseMultiplier = 5.0;
      break;
    case 'ride':
      baseMultiplier = 2.0;
      break;
    case 'walk':
      baseMultiplier = 3.0;
      break;
    case 'swim':
      baseMultiplier = 8.0;
      break;
    case 'hike':
      baseMultiplier = 4.0;
      break;
    case 'virtualrun':
      baseMultiplier = 4.0;
      break;
    case 'virtualride':
      baseMultiplier = 1.5;
      break;
    case 'workout':
      baseMultiplier = 3.0;
      break;
    case 'weighttraining':
      baseMultiplier = 2.0;
      break;
    case 'yoga':
      baseMultiplier = 2.0;
      break;
    default:
      baseMultiplier = 1.0;
  }
  
  // Calculate base tokens
  const baseTokens = distanceKm * baseMultiplier;
  
  // Performance bonus for running (sub 6-minute pace)
  let performanceBonus = 0;
  if (activityType.toLowerCase() === 'run' && movingTimeSeconds > 0 && distanceKm > 0) {
    const paceMinPerKm = (movingTimeSeconds / 60.0) / distanceKm;
    if (paceMinPerKm < 6.0) {
      performanceBonus = baseTokens * 0.2;
    }
  }
  
  // Apply bonus multiplier and ensure minimum 1 token
  const finalTokens = (baseTokens + performanceBonus) * bonusMultiplier;
  
  // Minimum 1 token for any activity, maximum 1000 tokens per activity
  return Math.max(1.0, Math.min(1000.0, Math.round(finalTokens * 10000) / 10000));
}

// Test cases
const testCases = [
  // Running tests
  {
    name: "5K Run (30 minutes) - Recreational pace",
    type: "run",
    distance: 5000,
    time: 1800, // 30 minutes
    expected: 25.0,
    description: "Standard 5K run at 6 min/km pace"
  },
  {
    name: "5K Run (25 minutes) - Fast pace with bonus",
    type: "run", 
    distance: 5000,
    time: 1500, // 25 minutes = 5 min/km
    expected: 30.0, // 25 + 20% bonus
    description: "Fast 5K run under 6 min/km gets performance bonus"
  },
  {
    name: "10K Run (50 minutes) - Long distance",
    type: "run",
    distance: 10000,
    time: 3000, // 50 minutes = 5 min/km (gets performance bonus)
    expected: 60.0, // 50 + 20% bonus = 60
    description: "10K run at fast pace with performance bonus"
  },
  
  // Cycling tests
  {
    name: "20K Bike Ride (1 hour)",
    type: "ride",
    distance: 20000,
    time: 3600, // 1 hour
    expected: 40.0,
    description: "Standard bike ride"
  },
  {
    name: "50K Bike Ride (2 hours)",
    type: "ride",
    distance: 50000,
    time: 7200, // 2 hours
    expected: 100.0,
    description: "Long bike ride"
  },
  
  // Swimming tests
  {
    name: "1K Pool Swim (30 minutes)",
    type: "swim",
    distance: 1000,
    time: 1800, // 30 minutes
    expected: 8.0,
    description: "Pool swimming session"
  },
  {
    name: "2K Open Water Swim",
    type: "swim",
    distance: 2000,
    time: 3600, // 1 hour
    expected: 16.0,
    description: "Open water swimming"
  },
  
  // Walking tests
  {
    name: "3K Walk (30 minutes)",
    type: "walk",
    distance: 3000,
    time: 1800, // 30 minutes
    expected: 9.0,
    description: "Brisk walk"
  },
  
  // Hiking tests
  {
    name: "8K Hike (2 hours)",
    type: "hike",
    distance: 8000,
    time: 7200, // 2 hours
    expected: 32.0,
    description: "Mountain hike"
  },
  
  // Other activities
  {
    name: "Virtual Run (Treadmill)",
    type: "virtualrun",
    distance: 5000,
    time: 1800, // 30 minutes
    expected: 20.0,
    description: "Indoor treadmill run"
  },
  {
    name: "Weight Training Session",
    type: "weighttraining",
    distance: 0, // No distance
    time: 3600, // 1 hour
    expected: 1.0, // Minimum 1 token
    description: "Strength training (minimum token award)"
  },
  
  // Bonus multiplier tests
  {
    name: "5K Run with 1.5x Event Bonus",
    type: "run",
    distance: 5000,
    time: 1800, // 30 minutes
    bonusMultiplier: 1.5,
    expected: 37.5, // 25 * 1.5
    description: "Special event with bonus multiplier"
  },
  
  // Edge cases
  {
    name: "Very Short Activity",
    type: "run",
    distance: 100, // 100 meters
    time: 60, // 1 minute
    expected: 1.0, // Minimum token
    description: "Minimum token award for very short activities"
  },
  {
    name: "Ultra Marathon (100K)",
    type: "run",
    distance: 100000, // 100K
    time: 36000, // 10 hours
    expected: 500.0,
    description: "Ultra-long distance running"
  }
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

function calculatePace(distanceMeters, timeSeconds) {
  if (distanceMeters === 0) return 'N/A';
  const paceMinPerKm = (timeSeconds / 60) / (distanceMeters / 1000);
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
}

// Run tests
function runTokenCalculationTests() {
  log('🧮 FUSEtech Token Calculation Test Suite', 'magenta');
  log('Validating FUSE token calculations for various activities\n', 'white');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    const bonusMultiplier = test.bonusMultiplier || 1.0;
    const calculated = calculateActivityTokens(test.type, test.distance, test.time, bonusMultiplier);
    const expected = test.expected;
    const tolerance = 0.1; // Allow small rounding differences
    
    const isPass = Math.abs(calculated - expected) <= tolerance;
    
    if (isPass) {
      passed++;
      log(`✅ ${test.name}`, 'green');
    } else {
      failed++;
      log(`❌ ${test.name}`, 'red');
    }
    
    // Activity details
    const pace = calculatePace(test.distance, test.time);
    log(`   📊 ${formatDistance(test.distance)} in ${formatTime(test.time)} (${pace})`, 'white');
    log(`   💰 Expected: ${expected} FUSE | Calculated: ${calculated} FUSE`, 'white');
    
    if (bonusMultiplier !== 1.0) {
      log(`   🎯 Bonus Multiplier: ${bonusMultiplier}x`, 'yellow');
    }
    
    if (test.type === 'run' && test.distance > 0) {
      const paceMinPerKm = (test.time / 60) / (test.distance / 1000);
      if (paceMinPerKm < 6.0) {
        log(`   ⚡ Performance Bonus: +20% (sub-6min pace)`, 'cyan');
      }
    }
    
    log(`   📝 ${test.description}`, 'white');
    
    if (!isPass) {
      log(`   ⚠️  Difference: ${Math.abs(calculated - expected).toFixed(4)}`, 'red');
    }
    
    console.log('');
  }
  
  // Summary
  log('='.repeat(60), 'white');
  log(`📊 Test Results: ${passed}/${passed + failed} passed`, passed === passed + failed ? 'green' : 'red');
  
  if (failed === 0) {
    log('🎉 All token calculations are working correctly!', 'green');
    log('✅ Ready for database deployment', 'green');
  } else {
    log(`❌ ${failed} test(s) failed - review token calculation logic`, 'red');
  }
  
  // Token economy summary
  log('\n💰 Token Economy Summary:', 'cyan');
  log('🏃 Running: 5 tokens/km (+20% bonus for sub-6min pace)', 'white');
  log('🚴 Cycling: 2 tokens/km', 'white');
  log('🏊 Swimming: 8 tokens/km (highest reward)', 'white');
  log('🚶 Walking: 3 tokens/km', 'white');
  log('🥾 Hiking: 4 tokens/km', 'white');
  log('💪 Other activities: 1-3 tokens/km', 'white');
  log('🎯 Bonus multipliers: Events and challenges', 'white');
  log('📏 Range: 1-1000 tokens per activity', 'white');
}

// Run the tests
runTokenCalculationTests();
