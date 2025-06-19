import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { mockUser } = await request.json();
    
    if (!mockUser) {
      return NextResponse.json({ error: 'Mock user flag required' }, { status: 400 });
    }

    // Verificar se está em modo de teste
    const skipAuth = process.env.NEXT_PUBLIC_SKIP_AUTH_FOR_TESTING === 'true';
    
    if (!skipAuth) {
      return NextResponse.json({ error: 'Mock login not enabled' }, { status: 403 });
    }

    // Criar usuário mock com dados realistas
    const mockUserData = {
      id: 'mock_user_123456',
      name: 'André Montenegro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      access_token: 'mock_access_token_12345',
      refresh_token: 'mock_refresh_token_12345',
      expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
      welcomeBonus: 1000,
      stravaConnected: true,
      joinedAt: new Date().toISOString(),
      tokensSpent: 250,
      // Dados extras para demonstração
      achievementTokens: 500,
      missionTokens: 750,
      voteTokens: 300,
      rankingTokens: 200,
      eventTokens: 400,
      notificationTokens: 150,
      // Configurações de notificação
      notificationsRead: [],
      eventsParticipating: ['summer_challenge_2024', 'beta_feedback_campaign'],
      vipTier: 'explorer',
      totalEventsJoined: 2,
      totalMissionsCompleted: 15,
      totalVipVotes: 8,
      currentStreak: 7,
      longestStreak: 12,
      totalActivities: 45,
      totalDistance: 287.5, // km
      totalTime: 18420, // segundos
      // Dados de ranking
      rankingPosition: 3,
      weeklyRankingPosition: 2,
      monthlyRankingPosition: 5
    };

    // Criar cookie de sessão
    const cookieStore = cookies();
    cookieStore.set('fusetech_user', JSON.stringify(mockUserData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return NextResponse.json({
      success: true,
      message: 'Mock login successful',
      user: {
        id: mockUserData.id,
        name: mockUserData.name,
        avatar: mockUserData.avatar
      }
    });

  } catch (error) {
    console.error('Mock login error:', error);
    return NextResponse.json({ error: 'Mock login failed' }, { status: 500 });
  }
}
