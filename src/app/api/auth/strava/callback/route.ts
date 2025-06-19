import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=access_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=no_code`);
  }

  try {
    // Trocar código por access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Strava token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        clientId: STRAVA_CLIENT_ID,
        code: code
      });
      throw new Error(`Failed to exchange code for token: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    
    // Buscar dados do atleta
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!athleteResponse.ok) {
      throw new Error('Failed to fetch athlete data');
    }

    const athleteData = await athleteResponse.json();

    // Salvar dados do usuário (por enquanto em cookies, depois em DB)
    const userData = {
      id: athleteData.id,
      name: `${athleteData.firstname} ${athleteData.lastname}`,
      avatar: athleteData.profile,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      welcomeBonus: 1000, // Bônus de boas-vindas
      stravaConnected: true,
      joinedAt: new Date().toISOString(),
      tokensSpent: 0
    };

    // Criar cookie de sessão
    const cookieStore = cookies();
    cookieStore.set('fusetech_user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    // Redirecionar para dashboard
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?connected=true`);

  } catch (error) {
    console.error('Strava OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=oauth_failed`);
  }
}
