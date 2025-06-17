/**
 * FUSEtech Lite - Simplified Strava OAuth Route
 * 
 * Handles Strava authentication flow for MVP
 * GET /api/auth/strava - Redirect to Strava OAuth
 */

import { NextRequest, NextResponse } from 'next/server';
import { StravaAuth } from '@/lib/auth/strava-auth';

export async function GET(request: NextRequest) {
  try {
    // Generate Strava OAuth URL and redirect
    const authUrl = StravaAuth.getAuthUrl();
    
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('Strava auth error:', error);
    
    return NextResponse.json(
      { error: 'Failed to initiate Strava authentication' },
      { status: 500 }
    );
  }
}
