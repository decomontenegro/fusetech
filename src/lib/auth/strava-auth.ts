/**
 * FUSEtech Lite - Simplified Strava-Only Authentication
 * 
 * Removes multi-provider complexity and focuses on Strava integration only
 * Simplified user flow: Connect Strava → Sync Activities → Earn Tokens
 */

import { cookies } from 'next/headers';

// Simplified user interface for MVP
export interface StravaUser {
  id: string;
  stravaAthleteId: number;
  name: string;
  email?: string;
  avatarUrl?: string;
  tokensBalance: number;
  totalTokensEarned: number;
  createdAt: Date;
  lastSyncAt?: Date;
}

// Simplified auth state
export interface AuthState {
  isAuthenticated: boolean;
  user: StravaUser | null;
  isLoading: boolean;
}

// Strava OAuth configuration
const STRAVA_CONFIG = {
  clientId: process.env.STRAVA_CLIENT_ID!,
  clientSecret: process.env.STRAVA_CLIENT_SECRET!,
  redirectUri: process.env.NEXTAUTH_URL + '/api/auth/strava/callback',
  scope: 'read,activity:read_all',
  authUrl: 'https://www.strava.com/oauth/authorize',
  tokenUrl: 'https://www.strava.com/oauth/token',
  apiUrl: 'https://www.strava.com/api/v3'
};

/**
 * Generate Strava OAuth authorization URL
 */
export function getStravaAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: STRAVA_CONFIG.clientId,
    redirect_uri: STRAVA_CONFIG.redirectUri,
    response_type: 'code',
    scope: STRAVA_CONFIG.scope,
    state: generateRandomState()
  });

  return `${STRAVA_CONFIG.authUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: STRAVA_CONFIG.clientId,
      client_secret: STRAVA_CONFIG.clientSecret,
      code,
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return response.json();
}

/**
 * Get athlete data from Strava API
 */
export async function getStravaAthlete(accessToken: string): Promise<StravaAthlete> {
  const response = await fetch(`${STRAVA_CONFIG.apiUrl}/athlete`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch athlete data');
  }

  return response.json();
}

/**
 * Refresh Strava access token
 */
export async function refreshStravaToken(refreshToken: string): Promise<StravaTokenResponse> {
  const response = await fetch(STRAVA_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: STRAVA_CONFIG.clientId,
      client_secret: STRAVA_CONFIG.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
}

/**
 * Create or update user in database
 */
export async function createOrUpdateUser(
  tokenResponse: StravaTokenResponse,
  athlete: StravaAthlete
): Promise<StravaUser> {
  // In a real implementation, this would interact with your database
  // For now, we'll simulate the database operation
  
  const user: StravaUser = {
    id: `user_${athlete.id}`,
    stravaAthleteId: athlete.id,
    name: `${athlete.firstname} ${athlete.lastname}`,
    email: athlete.email,
    avatarUrl: athlete.profile,
    tokensBalance: 0,
    totalTokensEarned: 0,
    createdAt: new Date(),
    lastSyncAt: new Date()
  };

  // TODO: Implement actual database operations
  // await db.users.upsert({
  //   where: { stravaAthleteId: athlete.id },
  //   update: { ... },
  //   create: { ... }
  // });

  return user;
}

/**
 * Set authentication session
 */
export async function setAuthSession(user: StravaUser): Promise<void> {
  const sessionData = {
    userId: user.id,
    stravaAthleteId: user.stravaAthleteId,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };

  // Set secure HTTP-only cookie
  cookies().set('fusetech-session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
}

/**
 * Get current authentication session
 */
export async function getAuthSession(): Promise<StravaUser | null> {
  try {
    const sessionCookie = cookies().get('fusetech-session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Check if session is expired
    if (sessionData.expiresAt < Date.now()) {
      await clearAuthSession();
      return null;
    }

    // TODO: Fetch fresh user data from database
    // const user = await db.users.findUnique({
    //   where: { id: sessionData.userId }
    // });

    // For now, return session data
    return {
      id: sessionData.userId,
      stravaAthleteId: sessionData.stravaAthleteId,
      name: sessionData.name,
      email: sessionData.email,
      avatarUrl: sessionData.avatarUrl,
      tokensBalance: 0, // TODO: Fetch from database
      totalTokensEarned: 0, // TODO: Fetch from database
      createdAt: new Date(),
      lastSyncAt: new Date()
    };

  } catch (error) {
    console.error('Error getting auth session:', error);
    return null;
  }
}

/**
 * Clear authentication session
 */
export async function clearAuthSession(): Promise<void> {
  cookies().delete('fusetech-session');
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthSession();
  return user !== null;
}

// Helper functions
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Type definitions
interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: StravaAthlete;
}

interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
  profile?: string;
  city?: string;
  state?: string;
  country?: string;
}

// Export simplified auth hook for components
export function useStravaAuth() {
  // This would be implemented as a React hook in a real application
  // For now, we'll provide the basic structure
  
  return {
    user: null as StravaUser | null,
    isLoading: false,
    isAuthenticated: false,
    login: () => {
      window.location.href = getStravaAuthUrl();
    },
    logout: async () => {
      await clearAuthSession();
      window.location.href = '/';
    }
  };
}

// Export auth utilities
export const StravaAuth = {
  getAuthUrl: getStravaAuthUrl,
  exchangeCode: exchangeCodeForToken,
  getAthlete: getStravaAthlete,
  refreshToken: refreshStravaToken,
  createUser: createOrUpdateUser,
  setSession: setAuthSession,
  getSession: getAuthSession,
  clearSession: clearAuthSession,
  isAuthenticated
};
