import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { achievements } from '@/data/achievements';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);
    
    // Buscar atividades do usuário
    const activitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/activities`, {
      headers: {
        'Cookie': `fusetech_user=${userCookie.value}`
      }
    });

    const activitiesData = await activitiesResponse.json();
    const activities = activitiesData.activities || [];

    // Calcular estatísticas do usuário
    const userStats = calculateUserStats(activities, userData);
    
    // Verificar quais conquistas foram desbloqueadas
    const unlockedAchievements = checkUnlockedAchievements(userStats, userData);
    
    // Calcular tokens de conquistas
    const achievementTokens = calculateAchievementTokens(unlockedAchievements);

    return NextResponse.json({
      unlockedAchievements,
      stats: userStats,
      achievementTokens,
      totalAchievements: achievements.length,
      completionPercentage: Math.round((unlockedAchievements.length / achievements.length) * 100)
    });

  } catch (error) {
    console.error('Erro ao buscar conquistas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function calculateUserStats(activities: any[], userData: any) {
  const now = new Date();
  const totalActivities = activities.length;
  const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0);
  
  // Calcular streak atual
  const currentStreak = calculateCurrentStreak(activities);
  
  // Atividades por tipo
  const activitiesByType: { [key: string]: number } = {};
  activities.forEach(activity => {
    const type = activity.type || 'Unknown';
    activitiesByType[type] = (activitiesByType[type] || 0) + 1;
  });

  // Atividades matinais (antes das 8h)
  const earlyMorningActivities = activities.filter(activity => {
    const hour = new Date(activity.start_date).getHours();
    return hour < 8;
  }).length;

  // Atividades noturnas (após 22h)
  const nightActivities = activities.filter(activity => {
    const hour = new Date(activity.start_date).getHours();
    return hour >= 22;
  }).length;

  // Fins de semana consecutivos com atividade
  const weekendStreaks = calculateWeekendStreaks(activities);

  return {
    totalActivities,
    totalDistance,
    currentStreak,
    activitiesByType,
    earlyMorningActivities,
    nightActivities,
    weekendStreaks,
    joinedAt: userData.joinedAt,
    hasConnectedStrava: !!userData.stravaConnected,
    purchasesMade: userData.purchasesMade || 0,
    tokensSpent: userData.tokensSpent || 0
  };
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

function calculateWeekendStreaks(activities: any[]): number {
  // Implementação simplificada - contar fins de semana com atividade
  const weekends = new Set();
  activities.forEach(activity => {
    const date = new Date(activity.start_date);
    const day = date.getDay();
    if (day === 0 || day === 6) { // Domingo ou Sábado
      const weekKey = `${date.getFullYear()}-${Math.floor(date.getDate() / 7)}`;
      weekends.add(weekKey);
    }
  });
  return weekends.size;
}

function checkUnlockedAchievements(stats: any, userData: any): string[] {
  const unlocked: string[] = [];

  achievements.forEach(achievement => {
    if (isAchievementUnlocked(achievement, stats, userData)) {
      unlocked.push(achievement.id);
    }
  });

  return unlocked;
}

function isAchievementUnlocked(achievement: any, stats: any, userData: any): boolean {
  const req = achievement.requirements;

  switch (req.type) {
    case 'activities_count':
      if (req.activityType) {
        const typeCount = req.activityType.reduce((sum: number, type: string) => {
          return sum + (stats.activitiesByType[type] || 0);
        }, 0);
        return typeCount >= req.target;
      }
      return stats.totalActivities >= req.target;

    case 'distance_total':
      return stats.totalDistance >= req.target;

    case 'streak_days':
      return stats.currentStreak >= req.target;

    case 'activity_types':
      return Object.keys(stats.activitiesByType).length >= req.target;

    case 'special':
      return checkSpecialRequirement(achievement.id, stats, userData);

    default:
      return false;
  }
}

function checkSpecialRequirement(achievementId: string, stats: any, userData: any): boolean {
  switch (achievementId) {
    case 'welcome_aboard':
      return stats.hasConnectedStrava;
    
    case 'explorer':
      // Simular visita a 3 seções (seria rastreado em produção)
      return true;
    
    case 'early_bird':
      return stats.earlyMorningActivities >= 5;
    
    case 'night_owl':
      return stats.nightActivities >= 3;
    
    case 'weekend_warrior':
      return stats.weekendStreaks >= 4;
    
    case 'first_purchase':
      return stats.purchasesMade >= 1;
    
    case 'big_spender':
      return stats.tokensSpent >= 10000;
    
    case 'beta_pioneer':
      // Simular - seria baseado em timestamp de registro
      return true;
    
    default:
      return false;
  }
}

function calculateAchievementTokens(unlockedAchievements: string[]): number {
  return unlockedAchievements.reduce((total, achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    return total + (achievement?.tokenReward || 0);
  }, 0);
}
