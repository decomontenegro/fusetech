/**
 * FUSEtech Lite - Simplified Strava OAuth Callback Handler
 * 
 * Handles the callback from Strava OAuth flow for MVP
 * GET /api/auth/strava-lite/callback?code=xxx&state=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
    profile: string;
    email?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Strava OAuth error:', error);
      return NextResponse.redirect(
        new URL('/lite?error=oauth_denied', request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('Missing authorization code');
      return NextResponse.redirect(
        new URL('/lite?error=missing_code', request.url)
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData: StravaTokenResponse = await tokenResponse.json();

    // Create simplified user session for MVP
    const sessionData = {
      userId: `user_${tokenData.athlete.id}`,
      stravaAthleteId: tokenData.athlete.id,
      name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
      email: tokenData.athlete.email,
      avatarUrl: tokenData.athlete.profile,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_at,
      tokensBalance: 0,
      totalTokensEarned: 0,
      createdAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
    };

    // Set secure session cookie
    cookies().set('fusetech-lite-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    // TODO: In real implementation, save user to database
    // await saveUserToDatabase(sessionData);
    
    // TODO: Trigger initial activity sync
    // await triggerInitialSync(sessionData.userId, sessionData.accessToken);

    console.log('FUSEtech Lite: User authenticated successfully', {
      athleteId: tokenData.athlete.id,
      name: sessionData.name
    });

    // Redirect to lite dashboard with success
    return NextResponse.redirect(new URL('/lite?connected=true', request.url));
    
  } catch (error) {
    console.error('Strava callback error:', error);
    
    return NextResponse.redirect(
      new URL('/lite?error=auth_failed', request.url)
    );
  }
}
