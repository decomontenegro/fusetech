import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { calculateVIPTier, getNextTierProgress, vipTiers } from '@/data/vip-program';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Buscar estatísticas do usuário
    const userStats = await getUserVIPStats(userData);
    
    // Calcular tier atual
    const currentTier = calculateVIPTier(userStats);
    
    // Calcular progresso para próximo tier
    const nextTierProgress = getNextTierProgress(userStats, currentTier);
    
    // Buscar votos do usuário
    const userVotes = getUserVotes(userData.id);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar
      },
      currentTier,
      nextTierProgress,
      userStats,
      userVotes,
      allTiers: vipTiers
    });

  } catch (error) {
    console.error('Erro ao buscar dados VIP:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

async function getUserVIPStats(userData: any) {
  try {
    // Buscar tokens
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
    
    let totalActivities = 0;
    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      totalActivities = activitiesData.activities?.length || 0;
    }

    // Calcular dias ativos (desde o registro)
    const joinedAt = new Date(userData.joinedAt || Date.now());
    const now = new Date();
    const daysActive = Math.floor((now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalTokens,
      totalActivities,
      totalPurchases: userData.totalPurchases || 0,
      totalReferrals: userData.totalReferrals || 0,
      totalFeedback: userData.totalFeedback || 0,
      daysActive: Math.max(1, daysActive) // Mínimo 1 dia
    };

  } catch (error) {
    console.error('Erro ao calcular stats VIP:', error);
    return {
      totalTokens: 0,
      totalActivities: 0,
      totalPurchases: 0,
      totalReferrals: 0,
      totalFeedback: 0,
      daysActive: 1
    };
  }
}

// Simular sistema de votos (em produção seria banco de dados)
const userVotesStore = new Map<string, { [projectId: string]: string }>();

function getUserVotes(userId: string): { [projectId: string]: string } {
  return userVotesStore.get(userId) || {};
}
