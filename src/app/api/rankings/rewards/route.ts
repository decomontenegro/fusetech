import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rankingRewards } from '@/data/rankings';

export async function POST(request: NextRequest) {
  try {
    const { category, position } = await request.json();
    
    if (!category || !position) {
      return NextResponse.json({ error: 'Categoria e posição são obrigatórios' }, { status: 400 });
    }

    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Verificar se há recompensas para esta categoria e posição
    const categoryRewards = rankingRewards[category];
    if (!categoryRewards) {
      return NextResponse.json({ error: 'Categoria de ranking não encontrada' }, { status: 404 });
    }

    // Encontrar recompensa para a posição
    let reward = categoryRewards.find(r => r.position === position);
    
    // Se não encontrar recompensa exata, verificar se está no top 10
    if (!reward && position <= 10) {
      reward = categoryRewards.find(r => r.position === 10);
    }

    if (!reward) {
      return NextResponse.json({ error: 'Nenhuma recompensa disponível para esta posição' }, { status: 404 });
    }

    // Verificar se já recebeu recompensa esta semana
    const weekKey = getWeekKey(new Date());
    const rewardsReceived = userData.weeklyRewards || {};
    
    if (rewardsReceived[weekKey]?.includes(category)) {
      return NextResponse.json({ error: 'Recompensa já recebida esta semana' }, { status: 400 });
    }

    // Registrar recompensa
    const updatedUserData = {
      ...userData,
      rankingTokens: (userData.rankingTokens || 0) + reward.tokenReward,
      weeklyRewards: {
        ...rewardsReceived,
        [weekKey]: [...(rewardsReceived[weekKey] || []), category]
      },
      lastRankingReward: {
        category,
        position,
        tokens: reward.tokenReward,
        badge: reward.badge,
        specialReward: reward.specialReward,
        receivedAt: new Date().toISOString()
      }
    };

    // Adicionar badge se houver
    if (reward.badge) {
      updatedUserData.badges = [...(userData.badges || []), {
        id: `ranking_${category}_${position}`,
        name: `${position}º Lugar - ${category}`,
        icon: reward.badge,
        earnedAt: new Date().toISOString()
      }];
    }

    const response = NextResponse.json({
      success: true,
      reward: {
        tokens: reward.tokenReward,
        badge: reward.badge,
        specialReward: reward.specialReward,
        position,
        category
      },
      message: `Parabéns! Você ficou em ${position}º lugar e ganhou ${reward.tokenReward} tokens!`
    });

    // Atualizar cookie
    response.cookies.set('fusetech_user', JSON.stringify(updatedUserData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 dias
    });

    return response;

  } catch (error) {
    console.error('Erro ao processar recompensa de ranking:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);
    const weekKey = getWeekKey(new Date());
    
    // Buscar posição atual do usuário em cada categoria
    const rankingsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rankings`, {
      headers: {
        'Cookie': `fusetech_user=${JSON.stringify(userData)}`
      }
    });

    if (!rankingsResponse.ok) {
      return NextResponse.json({ error: 'Erro ao buscar rankings' }, { status: 500 });
    }

    const rankingsData = await rankingsResponse.json();
    const leaderboards = rankingsData.leaderboards;

    // Calcular recompensas disponíveis
    const availableRewards = [];
    const rewardsReceived = userData.weeklyRewards?.[weekKey] || [];

    for (const [category, users] of Object.entries(leaderboards)) {
      const userPosition = users.findIndex((u: any) => u.id === userData.id) + 1;
      
      if (userPosition > 0 && !rewardsReceived.includes(category)) {
        const categoryRewards = rankingRewards[category];
        if (categoryRewards) {
          let reward = categoryRewards.find(r => r.position === userPosition);
          
          // Verificar top 10
          if (!reward && userPosition <= 10) {
            reward = categoryRewards.find(r => r.position === 10);
          }

          if (reward) {
            availableRewards.push({
              category,
              position: userPosition,
              tokens: reward.tokenReward,
              badge: reward.badge,
              specialReward: reward.specialReward
            });
          }
        }
      }
    }

    return NextResponse.json({
      availableRewards,
      rewardsReceived: rewardsReceived,
      weekKey,
      totalPendingTokens: availableRewards.reduce((sum, reward) => sum + reward.tokens, 0)
    });

  } catch (error) {
    console.error('Erro ao buscar recompensas disponíveis:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function getWeekKey(date: Date): string {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  return `${startOfWeek.getFullYear()}-W${Math.ceil(startOfWeek.getDate() / 7)}`;
}
