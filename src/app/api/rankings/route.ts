import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mockRankingUsers, calculateOverallScore, RankingUser } from '@/data/rankings';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Buscar dados reais dos usuários (simulado)
    const realUsers = await generateRealRankings();
    
    // Adicionar usuário atual se não estiver na lista
    const currentUserStats = await getCurrentUserStats(userData);
    const userInList = realUsers.find(u => u.id === userData.id);
    
    if (!userInList && currentUserStats) {
      realUsers.push(currentUserStats);
    }

    // Gerar rankings por categoria
    const leaderboards = {
      overall_weekly: generateCategoryRanking(realUsers, 'overall'),
      tokens_weekly: generateCategoryRanking(realUsers, 'tokens'),
      activities_weekly: generateCategoryRanking(realUsers, 'activities'),
      distance_weekly: generateCategoryRanking(realUsers, 'distance'),
      streak_current: generateCategoryRanking(realUsers, 'streak'),
      achievements_all: generateCategoryRanking(realUsers, 'achievements'),
      missions_weekly: generateCategoryRanking(realUsers, 'missions')
    };

    // Encontrar posição do usuário no ranking geral
    const userPosition = leaderboards.overall_weekly.findIndex(u => u.id === userData.id) + 1;

    return NextResponse.json({
      leaderboards,
      userPosition: userPosition > 0 ? userPosition : null,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar rankings:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

async function generateRealRankings(): Promise<RankingUser[]> {
  // Em produção, isso buscaria dados reais do banco
  // Por enquanto, usar dados mock com algumas variações
  return mockRankingUsers.map(user => ({
    ...user,
    // Adicionar pequenas variações para simular mudanças
    stats: {
      ...user.stats,
      totalTokens: user.stats.totalTokens + Math.floor(Math.random() * 500),
      totalActivities: user.stats.totalActivities + Math.floor(Math.random() * 3),
      currentStreak: Math.max(0, user.stats.currentStreak + Math.floor(Math.random() * 3) - 1)
    }
  }));
}

async function getCurrentUserStats(userData: any): Promise<RankingUser | null> {
  try {
    // Buscar tokens do usuário
    const tokensResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/tokens`, {
      headers: {
        'Cookie': `fusetech_user=${JSON.stringify(userData)}`
      }
    });
    
    let totalTokens = 0;
    if (tokensResponse.ok) {
      const tokensData = await tokensResponse.json();
      totalTokens = tokensData.totalTokens || 0;
    }

    // Buscar atividades
    const activitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/activities`, {
      headers: {
        'Cookie': `fusetech_user=${JSON.stringify(userData)}`
      }
    });
    
    let activities = [];
    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      activities = activitiesData.activities || [];
    }

    // Buscar conquistas
    const achievementsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/achievements`, {
      headers: {
        'Cookie': `fusetech_user=${JSON.stringify(userData)}`
      }
    });
    
    let achievements = 0;
    if (achievementsResponse.ok) {
      const achievementsData = await achievementsResponse.json();
      achievements = achievementsData.unlockedAchievements?.length || 0;
    }

    // Calcular estatísticas
    const totalActivities = activities.length;
    const totalDistance = activities.reduce((sum: number, activity: any) => sum + (activity.distance || 0), 0);
    const currentStreak = calculateCurrentStreak(activities);
    const missionsCompleted = userData.completedMissions?.length || 0;

    const stats = {
      totalActivities,
      totalDistance,
      totalTokens,
      currentStreak,
      achievements,
      missionsCompleted
    };

    const overallScore = calculateOverallScore(stats);

    return {
      id: userData.id,
      name: userData.name,
      avatar: userData.avatar,
      position: 0, // Será calculado depois
      score: overallScore,
      change: 0,
      vipTier: userData.vipTier,
      stats
    };

  } catch (error) {
    console.error('Erro ao calcular stats do usuário:', error);
    return null;
  }
}

function calculateCurrentStreak(activities: any[]): number {
  if (activities.length === 0) return 0;

  // Ordenar atividades por data (mais recente primeiro)
  const sortedActivities = activities
    .map(activity => new Date(activity.start_date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedActivities.length; i++) {
    const activityDate = new Date(sortedActivities[i]);
    activityDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

function generateCategoryRanking(users: RankingUser[], category: string): RankingUser[] {
  let sortedUsers = [...users];

  switch (category) {
    case 'overall':
      sortedUsers.sort((a, b) => b.score - a.score);
      break;
    case 'tokens':
      sortedUsers.sort((a, b) => b.stats.totalTokens - a.stats.totalTokens);
      break;
    case 'activities':
      sortedUsers.sort((a, b) => b.stats.totalActivities - a.stats.totalActivities);
      break;
    case 'distance':
      sortedUsers.sort((a, b) => b.stats.totalDistance - a.stats.totalDistance);
      break;
    case 'streak':
      sortedUsers.sort((a, b) => b.stats.currentStreak - a.stats.currentStreak);
      break;
    case 'achievements':
      sortedUsers.sort((a, b) => b.stats.achievements - a.stats.achievements);
      break;
    case 'missions':
      sortedUsers.sort((a, b) => b.stats.missionsCompleted - a.stats.missionsCompleted);
      break;
  }

  // Atualizar posições
  return sortedUsers.map((user, index) => ({
    ...user,
    position: index + 1
  }));
}
