import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { activeVIPProjects, calculateVIPTier } from '@/data/vip-program';

export async function POST(request: NextRequest) {
  try {
    const { projectId, optionId } = await request.json();
    
    if (!projectId || !optionId) {
      return NextResponse.json({ error: 'Project ID e Option ID são obrigatórios' }, { status: 400 });
    }

    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Verificar se o projeto existe
    const project = activeVIPProjects.find(p => p.id === projectId);
    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    // Verificar se a opção existe
    const option = project.options.find(o => o.id === optionId);
    if (!option) {
      return NextResponse.json({ error: 'Opção não encontrada' }, { status: 404 });
    }

    // Verificar se o projeto ainda está ativo
    if (project.status !== 'voting') {
      return NextResponse.json({ error: 'Votação encerrada para este projeto' }, { status: 400 });
    }

    // Verificar se ainda está dentro do prazo
    if (project.votingEnds && new Date() > project.votingEnds) {
      return NextResponse.json({ error: 'Prazo de votação expirado' }, { status: 400 });
    }

    // Buscar tier VIP do usuário
    const userStats = await getUserVIPStats(userData);
    const currentTier = calculateVIPTier(userStats);
    
    if (!currentTier) {
      return NextResponse.json({ error: 'Você precisa ser VIP para votar' }, { status: 403 });
    }

    // Verificar se tem acesso ao projeto
    const tierPriority = {
      'bronze_vip': 1,
      'silver_vip': 2,
      'gold_vip': 3,
      'diamond_vip': 4
    };
    
    const userPriority = tierPriority[currentTier.id as keyof typeof tierPriority];
    const requiredPriority = tierPriority[project.requiredTier as keyof typeof tierPriority];
    
    if (userPriority < requiredPriority) {
      return NextResponse.json({ 
        error: `Você precisa ser VIP ${project.requiredTier.split('_')[0]} ou superior para votar neste projeto` 
      }, { status: 403 });
    }

    // Verificar se já votou
    const userVotes = getUserVotes(userData.id);
    if (userVotes[projectId]) {
      return NextResponse.json({ error: 'Você já votou neste projeto' }, { status: 400 });
    }

    // Registrar voto
    registerVote(userData.id, projectId, optionId);

    // Atualizar dados do usuário
    const updatedUserData = {
      ...userData,
      totalVotes: (userData.totalVotes || 0) + 1,
      lastVote: {
        projectId,
        optionId,
        projectName: project.name,
        optionName: option.name,
        votedAt: new Date().toISOString()
      }
    };

    // Calcular tokens de recompensa por votar
    const voteTokens = getVoteRewardTokens(currentTier.id);
    updatedUserData.voteTokens = (userData.voteTokens || 0) + voteTokens;

    const response = NextResponse.json({
      success: true,
      message: `Voto registrado com sucesso! +${voteTokens} tokens`,
      tokensEarned: voteTokens,
      vote: {
        projectId,
        optionId,
        projectName: project.name,
        optionName: option.name
      }
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
    console.error('Erro ao processar voto:', error);
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

    // Calcular dias ativos
    const joinedAt = new Date(userData.joinedAt || Date.now());
    const now = new Date();
    const daysActive = Math.floor((now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalTokens,
      totalActivities,
      totalPurchases: userData.totalPurchases || 0,
      totalReferrals: userData.totalReferrals || 0,
      totalFeedback: userData.totalFeedback || 0,
      daysActive: Math.max(1, daysActive)
    };

  } catch (error) {
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

// Simular sistema de votos
const userVotesStore = new Map<string, { [projectId: string]: string }>();

function getUserVotes(userId: string): { [projectId: string]: string } {
  return userVotesStore.get(userId) || {};
}

function registerVote(userId: string, projectId: string, optionId: string) {
  const userVotes = getUserVotes(userId);
  userVotes[projectId] = optionId;
  userVotesStore.set(userId, userVotes);
  
  console.log(`Voto registrado: Usuário ${userId} votou em ${optionId} para projeto ${projectId}`);
}

function getVoteRewardTokens(tierId: string): number {
  const rewards = {
    'bronze_vip': 100,
    'silver_vip': 150,
    'gold_vip': 200,
    'diamond_vip': 300
  };
  
  return rewards[tierId as keyof typeof rewards] || 50;
}
