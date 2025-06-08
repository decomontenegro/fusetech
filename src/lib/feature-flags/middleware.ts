import { NextRequest, NextResponse } from 'next/server';
import { evaluateFeatureFlags } from './server-utils';
import { FEATURE_FLAGS } from './types';

/**
 * Middleware to handle feature flag-based routing and access control
 */
export async function featureFlagMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Define protected routes by feature flags
  const protectedRoutes: Record<string, string> = {
    '/marketplace': FEATURE_FLAGS.MARKETPLACE,
    '/ai-insights': FEATURE_FLAGS.AI_INSIGHTS,
    '/analytics/advanced': FEATURE_FLAGS.ADVANCED_ANALYTICS,
    '/teams': FEATURE_FLAGS.TEAM_COMPETITIONS,
    '/rewards': FEATURE_FLAGS.TOKEN_REWARDS,
    '/premium': FEATURE_FLAGS.PREMIUM_FEATURES,
  };

  // Check if the current route is protected
  const requiredFlag = protectedRoutes[pathname];
  if (!requiredFlag) {
    return NextResponse.next();
  }

  // Get user context from cookies/headers
  const userId = request.cookies.get('userId')?.value;
  const userGroups = request.cookies.get('userGroups')?.value?.split(',') || [];
  
  const context = {
    userId,
    userGroups,
    environment: process.env.NODE_ENV as 'development' | 'staging' | 'production',
  };

  // Evaluate feature flags
  const flags = await evaluateFeatureFlags(context);
  
  // Check if the required feature is enabled
  if (!flags[requiredFlag]) {
    // Redirect to a "feature not available" page or dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/feature-unavailable';
    url.searchParams.set('feature', requiredFlag);
    url.searchParams.set('from', pathname);
    
    return NextResponse.redirect(url);
  }

  // Add feature flags to headers for client-side hydration
  const response = NextResponse.next();
  response.headers.set('X-Feature-Flags', JSON.stringify(flags));
  
  return response;
}

/**
 * Helper to create feature flag headers for API responses
 */
export function createFeatureFlagHeaders(flags: Record<string, boolean>): Headers {
  const headers = new Headers();
  headers.set('X-Feature-Flags', JSON.stringify(flags));
  return headers;
}