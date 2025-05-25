import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Endpoint para receber o callback do Strava após autorização
 */
export async function GET(request: NextRequest) {
  // Obter o código de autorização da URL
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Se houver erro, redirecionar para página de erro
  if (error) {
    return NextResponse.redirect(new URL('/perfil/conectar/strava?error=denied', request.url));
  }

  // Se não houver código, redirecionar para página de erro
  if (!code) {
    return NextResponse.redirect(new URL('/perfil/conectar/strava?error=no_code', request.url));
  }

  try {
    // Obter o token de acesso do Strava
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
      throw new Error(`Erro ao obter token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();

    // Obter o token de autenticação do usuário atual
    const authToken = cookies().get('supabase-auth-token')?.value;

    if (!authToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Enviar os tokens para o serviço de Strava
    const connectResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/strava/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        athlete: tokenData.athlete,
      }),
    });

    if (!connectResponse.ok) {
      throw new Error(`Erro ao conectar conta: ${connectResponse.statusText}`);
    }

    // Redirecionar para página de sucesso
    return NextResponse.redirect(new URL('/perfil?connected=strava', request.url));
  } catch (error) {
    console.error('Erro no callback do Strava:', error);
    return NextResponse.redirect(new URL('/perfil/conectar/strava?error=server_error', request.url));
  }
}
