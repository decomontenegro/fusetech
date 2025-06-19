import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const userData = JSON.parse(userCookie.value);
    
    // Verificar se o token ainda é válido
    const now = Math.floor(Date.now() / 1000);
    if (userData.expires_at && userData.expires_at < now) {
      // Token expirado, tentar renovar
      try {
        const refreshedData = await refreshToken(userData.refresh_token);
        
        // Atualizar cookie
        const updatedUserData = { ...userData, ...refreshedData };
        cookieStore.set('fusetech_user', JSON.stringify(updatedUserData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30,
        });
        
        return NextResponse.json({
          authenticated: true,
          user: {
            id: updatedUserData.id,
            name: updatedUserData.name,
            avatar: updatedUserData.avatar,
          },
        });
      } catch (error) {
        // Falha ao renovar token, usuário precisa fazer login novamente
        cookieStore.delete('fusetech_user');
        return NextResponse.json({ authenticated: false });
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
      },
    });

  } catch (error) {
    console.error('Error checking user status:', error);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(request: NextRequest) {
  // Logout - remover cookie
  const cookieStore = cookies();
  cookieStore.delete('fusetech_user');
  
  return NextResponse.json({ success: true });
}

async function refreshToken(refreshToken: string) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
  };
}
