import { NextRequest, NextResponse } from 'next/server';

// Configurações do Strava
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/strava/callback`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'login') {
    // Redirecionar para autorização do Strava
    const scope = 'read,activity:read_all';
    const state = generateState();
    
    const authUrl = `https://www.strava.com/oauth/authorize?` +
      `client_id=${STRAVA_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `state=${state}&` +
      `approval_prompt=force`;

    return NextResponse.redirect(authUrl);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
