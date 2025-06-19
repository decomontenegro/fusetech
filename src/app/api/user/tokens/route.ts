import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);
    
    // Buscar atividades do usuário para calcular tokens
    const activitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/activities`, {
      headers: {
        'Cookie': `fusetech_user=${userCookie.value}`
      }
    });

    if (!activitiesResponse.ok) {
      return NextResponse.json({ error: 'Erro ao buscar atividades' }, { status: 500 });
    }

    const activitiesData = await activitiesResponse.json();
    const activities = activitiesData.activities || [];

    // Calcular tokens das atividades
    const activityTokens = activities.reduce((total: number, activity: any) => {
      return total + (activity.tokens || 0);
    }, 0);

    // Bônus de boas-vindas (primeira vez)
    const welcomeBonus = userData.welcomeBonus || 1000;

    // Bônus por conectar Strava
    const stravaBonus = userData.stravaConnected ? 500 : 0;

    // Buscar tokens de conquistas
    const achievementsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/achievements`, {
      headers: {
        'Cookie': `fusetech_user=${userCookie.value}`
      }
    });

    let achievementTokens = 0;
    if (achievementsResponse.ok) {
      const achievementsData = await achievementsResponse.json();
      achievementTokens = achievementsData.achievementTokens || 0;
    }

    // Tokens de missões
    const missionTokens = userData.missionTokens || 0;

    // Tokens de votação VIP
    const voteTokens = userData.voteTokens || 0;

    // Tokens de ranking
    const rankingTokens = userData.rankingTokens || 0;

    // Tokens de eventos
    const eventTokens = userData.eventTokens || 0;

    // Tokens de notificações (engajamento)
    const notificationTokens = userData.notificationTokens || 0;

    // Tokens gastos em compras
    const tokensSpent = userData.tokensSpent || 0;

    // Total de tokens disponíveis
    const totalTokens = activityTokens + welcomeBonus + stravaBonus + achievementTokens + missionTokens + voteTokens + rankingTokens + eventTokens + notificationTokens - tokensSpent;

    // Estatísticas detalhadas
    const tokenStats = {
      totalTokens: Math.max(0, totalTokens),
      breakdown: {
        activities: activityTokens,
        welcomeBonus: welcomeBonus,
        stravaBonus: stravaBonus,
        achievements: achievementTokens,
        missions: missionTokens,
        vipVotes: voteTokens,
        rankings: rankingTokens,
        events: eventTokens,
        notifications: notificationTokens,
        spent: tokensSpent
      },
      recentEarnings: {
        today: calculateTodayTokens(activities),
        thisWeek: calculateWeekTokens(activities),
        thisMonth: calculateMonthTokens(activities)
      }
    };

    return NextResponse.json(tokenStats);

  } catch (error) {
    console.error('Erro ao buscar tokens:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function calculateTodayTokens(activities: any[]): number {
  const today = new Date().toDateString();
  return activities
    .filter(activity => new Date(activity.start_date).toDateString() === today)
    .reduce((total, activity) => total + (activity.tokens || 0), 0);
}

function calculateWeekTokens(activities: any[]): number {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return activities
    .filter(activity => new Date(activity.start_date) >= oneWeekAgo)
    .reduce((total, activity) => total + (activity.tokens || 0), 0);
}

function calculateMonthTokens(activities: any[]): number {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return activities
    .filter(activity => new Date(activity.start_date) >= oneMonthAgo)
    .reduce((total, activity) => total + (activity.tokens || 0), 0);
}

// Adicionar tokens de conquistas
export async function addAchievementTokens(userId: string, tokens: number) {
  // Em produção, isso seria salvo no banco de dados
  console.log(`Usuário ${userId} ganhou ${tokens} tokens por conquista`);
  return tokens;
}
