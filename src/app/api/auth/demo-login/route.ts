import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Perfis de usuários demo realistas
const DEMO_USERS = [
  {
    id: 'demo_user_001',
    name: 'André Montenegro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    email: 'andre@fusetech.com',
    location: 'São Paulo, Brasil',
    totalActivities: 45,
    totalDistance: 287.5,
    totalTime: 18420,
    currentStreak: 7,
    longestStreak: 12,
    level: 'advanced'
  },
  {
    id: 'demo_user_002', 
    name: 'Maria Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    email: 'maria@fusetech.com',
    location: 'Rio de Janeiro, Brasil',
    totalActivities: 32,
    totalDistance: 198.3,
    totalTime: 12650,
    currentStreak: 4,
    longestStreak: 8,
    level: 'intermediate'
  },
  {
    id: 'demo_user_003',
    name: 'João Santos',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    email: 'joao@fusetech.com',
    location: 'Belo Horizonte, Brasil',
    totalActivities: 67,
    totalDistance: 423.7,
    totalTime: 28940,
    currentStreak: 12,
    longestStreak: 18,
    level: 'expert'
  },
  {
    id: 'demo_user_004',
    name: 'Ana Costa',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    email: 'ana@fusetech.com',
    location: 'Porto Alegre, Brasil',
    totalActivities: 23,
    totalDistance: 145.2,
    totalTime: 9320,
    currentStreak: 2,
    longestStreak: 5,
    level: 'beginner'
  },
  {
    id: 'demo_user_005',
    name: 'Carlos Oliveira',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    email: 'carlos@fusetech.com',
    location: 'Brasília, Brasil',
    totalActivities: 89,
    totalDistance: 567.8,
    totalTime: 35670,
    currentStreak: 15,
    longestStreak: 22,
    level: 'pro'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { userIndex } = await request.json();
    
    // Selecionar usuário (padrão: primeiro usuário)
    const selectedUser = DEMO_USERS[userIndex || 0] || DEMO_USERS[0];
    
    // Calcular tokens baseado no nível
    const baseTokens = {
      beginner: 1000,
      intermediate: 2500,
      advanced: 3500,
      expert: 5000,
      pro: 7500
    };

    // Criar dados completos do usuário
    const userData = {
      ...selectedUser,
      access_token: `demo_token_${selectedUser.id}`,
      refresh_token: `demo_refresh_${selectedUser.id}`,
      expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
      welcomeBonus: baseTokens[selectedUser.level],
      stravaConnected: true,
      joinedAt: new Date(Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(), // Últimos 90 dias
      tokensSpent: Math.floor(Math.random() * 500),
      // Tokens por categoria
      achievementTokens: Math.floor(baseTokens[selectedUser.level] * 0.2),
      missionTokens: Math.floor(baseTokens[selectedUser.level] * 0.3),
      voteTokens: Math.floor(baseTokens[selectedUser.level] * 0.1),
      rankingTokens: Math.floor(baseTokens[selectedUser.level] * 0.15),
      eventTokens: Math.floor(baseTokens[selectedUser.level] * 0.2),
      notificationTokens: Math.floor(baseTokens[selectedUser.level] * 0.05),
      // Configurações
      notificationsRead: [],
      eventsParticipating: ['summer_challenge_2024', 'beta_feedback_campaign'],
      vipTier: selectedUser.level === 'pro' ? 'pioneer' : selectedUser.level === 'expert' ? 'explorer' : 'starter',
      totalEventsJoined: Math.floor(Math.random() * 5) + 1,
      totalMissionsCompleted: Math.floor(selectedUser.totalActivities * 0.3),
      totalVipVotes: selectedUser.level === 'pro' ? 15 : selectedUser.level === 'expert' ? 8 : 3,
      // Rankings
      rankingPosition: Math.floor(Math.random() * 100) + 1,
      weeklyRankingPosition: Math.floor(Math.random() * 50) + 1,
      monthlyRankingPosition: Math.floor(Math.random() * 200) + 1
    };

    // Criar cookie de sessão
    const cookieStore = cookies();
    cookieStore.set('fusetech_user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return NextResponse.json({
      success: true,
      message: 'Demo login successful',
      user: {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        level: userData.level,
        totalActivities: userData.totalActivities
      }
    });

  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Demo login failed' }, { status: 500 });
  }
}
