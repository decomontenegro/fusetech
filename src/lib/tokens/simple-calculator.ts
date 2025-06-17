/**
 * FUSEtech Lite - Simplified Token Calculator
 * 
 * Removes complex multipliers and bonuses for MVP
 * Simple rule: Distance-based rewards only
 * - Running: 1 token per km
 * - Cycling: 0.5 tokens per km  
 * - Walking: 0.7 tokens per km
 * - Other: 0.3 tokens per km
 * - Minimum: 1 token per activity
 */

// Simplified activity interface
export interface SimpleActivity {
  id: string;
  stravaId: number;
  type: string;
  name: string;
  distanceMeters: number;
  movingTimeSeconds: number;
  startDate: Date;
}

// Token calculation result
export interface TokenCalculation {
  baseTokens: number;
  finalTokens: number;
  calculation: {
    distanceKm: number;
    activityType: string;
    rate: number;
    formula: string;
  };
}

// Activity type rates (tokens per km)
const ACTIVITY_RATES: Record<string, number> = {
  'run': 1.0,
  'ride': 0.5,
  'walk': 0.7,
  'hike': 0.7,
  'swim': 2.0, // Higher rate for swimming (per km is rare but valuable)
  'virtualrun': 0.8,
  'virtualride': 0.4,
  'workout': 0.5,
  'default': 0.3
};

/**
 * Calculate FUSE tokens for an activity (simplified version)
 */
export function calculateTokens(activity: SimpleActivity): TokenCalculation {
  const distanceKm = activity.distanceMeters / 1000;
  const activityType = activity.type.toLowerCase();
  
  // Get rate for activity type
  const rate = ACTIVITY_RATES[activityType] || ACTIVITY_RATES.default;
  
  // Calculate base tokens
  const baseTokens = distanceKm * rate;
  
  // Apply minimum of 1 token per activity
  const finalTokens = Math.max(1, Math.round(baseTokens * 100) / 100);
  
  return {
    baseTokens: Math.round(baseTokens * 100) / 100,
    finalTokens,
    calculation: {
      distanceKm: Math.round(distanceKm * 100) / 100,
      activityType: activityType,
      rate,
      formula: `${distanceKm.toFixed(2)} km × ${rate} tokens/km = ${baseTokens.toFixed(2)} tokens (min 1.0)`
    }
  };
}

/**
 * Calculate tokens for multiple activities
 */
export function calculateBatchTokens(activities: SimpleActivity[]): {
  totalTokens: number;
  calculations: (TokenCalculation & { activityId: string })[];
} {
  const calculations = activities.map(activity => ({
    activityId: activity.id,
    ...calculateTokens(activity)
  }));
  
  const totalTokens = calculations.reduce((sum, calc) => sum + calc.finalTokens, 0);
  
  return {
    totalTokens: Math.round(totalTokens * 100) / 100,
    calculations
  };
}

/**
 * Get activity rate information
 */
export function getActivityRate(activityType: string): {
  rate: number;
  description: string;
} {
  const type = activityType.toLowerCase();
  const rate = ACTIVITY_RATES[type] || ACTIVITY_RATES.default;
  
  const descriptions: Record<string, string> = {
    'run': 'Running rewards the most tokens for cardiovascular effort',
    'ride': 'Cycling rewards moderate tokens for endurance activity',
    'walk': 'Walking rewards good tokens for consistent movement',
    'hike': 'Hiking rewards good tokens for outdoor adventure',
    'swim': 'Swimming rewards high tokens for full-body workout',
    'virtualrun': 'Virtual running rewards slightly less than outdoor running',
    'virtualride': 'Virtual cycling rewards slightly less than outdoor cycling',
    'workout': 'General workouts reward moderate tokens',
    'default': 'Other activities reward basic tokens for any movement'
  };
  
  return {
    rate,
    description: descriptions[type] || descriptions.default
  };
}

/**
 * Estimate tokens for planned activity
 */
export function estimateTokens(activityType: string, plannedDistanceKm: number): {
  estimatedTokens: number;
  rate: number;
  breakdown: string;
} {
  const rate = ACTIVITY_RATES[activityType.toLowerCase()] || ACTIVITY_RATES.default;
  const estimatedTokens = Math.max(1, Math.round(plannedDistanceKm * rate * 100) / 100);
  
  return {
    estimatedTokens,
    rate,
    breakdown: `${plannedDistanceKm} km × ${rate} tokens/km = ${estimatedTokens} FUSE tokens`
  };
}

/**
 * Get user's token earning potential
 */
export function getEarningPotential(weeklyDistanceKm: number, primaryActivity: string): {
  weeklyTokens: number;
  monthlyTokens: number;
  yearlyTokens: number;
  breakdown: {
    rate: number;
    weeklyDistance: number;
    activityType: string;
  };
} {
  const rate = ACTIVITY_RATES[primaryActivity.toLowerCase()] || ACTIVITY_RATES.default;
  const weeklyTokens = Math.round(weeklyDistanceKm * rate * 100) / 100;
  const monthlyTokens = Math.round(weeklyTokens * 4.33 * 100) / 100; // 4.33 weeks per month
  const yearlyTokens = Math.round(weeklyTokens * 52 * 100) / 100;
  
  return {
    weeklyTokens,
    monthlyTokens,
    yearlyTokens,
    breakdown: {
      rate,
      weeklyDistance: weeklyDistanceKm,
      activityType: primaryActivity.toLowerCase()
    }
  };
}

/**
 * Validate activity for token calculation
 */
export function validateActivity(activity: SimpleActivity): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  if (activity.distanceMeters < 0) {
    errors.push('Distance cannot be negative');
  }
  
  if (activity.movingTimeSeconds <= 0) {
    errors.push('Moving time must be greater than 0');
  }
  
  if (!activity.type || activity.type.trim() === '') {
    errors.push('Activity type is required');
  }
  
  // Warnings for unusual activities
  if (activity.distanceMeters > 200000) { // > 200km
    warnings.push('Very long distance activity - please verify');
  }
  
  if (activity.movingTimeSeconds > 43200) { // > 12 hours
    warnings.push('Very long duration activity - please verify');
  }
  
  if (activity.distanceMeters === 0) {
    warnings.push('Zero distance activity will receive minimum 1 token');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format token amount for display
 */
export function formatTokens(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  
  return amount.toFixed(2);
}

/**
 * Get token calculation summary for user dashboard
 */
export function getTokenSummary(activities: SimpleActivity[]): {
  totalActivities: number;
  totalDistance: number;
  totalTokens: number;
  averageTokensPerActivity: number;
  averageTokensPerKm: number;
  topActivityType: string;
  thisWeekTokens: number;
} {
  if (activities.length === 0) {
    return {
      totalActivities: 0,
      totalDistance: 0,
      totalTokens: 0,
      averageTokensPerActivity: 0,
      averageTokensPerKm: 0,
      topActivityType: 'none',
      thisWeekTokens: 0
    };
  }
  
  const calculations = activities.map(activity => calculateTokens(activity));
  const totalTokens = calculations.reduce((sum, calc) => sum + calc.finalTokens, 0);
  const totalDistance = activities.reduce((sum, activity) => sum + activity.distanceMeters, 0) / 1000;
  
  // Find most common activity type
  const activityCounts: Record<string, number> = {};
  activities.forEach(activity => {
    const type = activity.type.toLowerCase();
    activityCounts[type] = (activityCounts[type] || 0) + 1;
  });
  
  const topActivityType = Object.entries(activityCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
  
  // Calculate this week's tokens
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const thisWeekActivities = activities.filter(activity => 
    activity.startDate >= oneWeekAgo
  );
  
  const thisWeekTokens = thisWeekActivities
    .map(activity => calculateTokens(activity).finalTokens)
    .reduce((sum, tokens) => sum + tokens, 0);
  
  return {
    totalActivities: activities.length,
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTokens: Math.round(totalTokens * 100) / 100,
    averageTokensPerActivity: Math.round((totalTokens / activities.length) * 100) / 100,
    averageTokensPerKm: totalDistance > 0 ? Math.round((totalTokens / totalDistance) * 100) / 100 : 0,
    topActivityType,
    thisWeekTokens: Math.round(thisWeekTokens * 100) / 100
  };
}

// Export all utilities
export const SimpleTokenCalculator = {
  calculate: calculateTokens,
  calculateBatch: calculateBatchTokens,
  getRate: getActivityRate,
  estimate: estimateTokens,
  getEarningPotential,
  validate: validateActivity,
  format: formatTokens,
  getSummary: getTokenSummary,
  
  // Constants
  RATES: ACTIVITY_RATES,
  MIN_TOKENS: 1
};
