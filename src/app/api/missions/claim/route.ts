import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dailyMissionTemplates, weeklyMissionTemplates, specialMissionTemplates } from '@/data/missions';

export async function POST(request: NextRequest) {
  try {
    const { missionId } = await request.json();
    
    if (!missionId) {
      return NextResponse.json({ error: 'Mission ID é obrigatório' }, { status: 400 });
    }

    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Verificar se a missão pode ser resgatada
    const progressResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/missions/progress?missionId=${missionId}`, {
      headers: {
        'Cookie': `fusetech_user=${userCookie.value}`
      }
    });

    if (!progressResponse.ok) {
      return NextResponse.json({ error: 'Erro ao verificar progresso' }, { status: 500 });
    }

    const progressData = await progressResponse.json();
    
    if (!progressData.canComplete) {
      return NextResponse.json({ error: 'Missão ainda não pode ser completada' }, { status: 400 });
    }

    // Verificar se já foi resgatada
    const completedMissions = getCompletedMissions(userData.id);
    if (completedMissions.includes(missionId)) {
      return NextResponse.json({ error: 'Missão já foi resgatada' }, { status: 400 });
    }

    // Encontrar a missão e calcular recompensa
    const mission = findMissionById(missionId);
    if (!mission) {
      return NextResponse.json({ error: 'Missão não encontrada' }, { status: 404 });
    }

    const tokensEarned = mission.tokenReward + (mission.bonusReward || 0);

    // Marcar missão como completada (em produção seria salvo no banco)
    markMissionAsCompleted(userData.id, missionId);

    // Atualizar dados do usuário
    const updatedUserData = {
      ...userData,
      completedMissions: [...(userData.completedMissions || []), missionId],
      missionTokens: (userData.missionTokens || 0) + tokensEarned,
      lastMissionCompleted: {
        id: missionId,
        name: mission.name,
        tokens: tokensEarned,
        completedAt: new Date().toISOString()
      }
    };

    // Atualizar cookie
    const response = NextResponse.json({
      success: true,
      missionId,
      tokensEarned,
      mission: {
        name: mission.name,
        description: mission.description,
        icon: mission.icon
      }
    });

    response.cookies.set('fusetech_user', JSON.stringify(updatedUserData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 dias
    });

    return response;

  } catch (error) {
    console.error('Erro ao resgatar missão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function findMissionById(missionId: string) {
  // Buscar em templates diários
  const dailyMission = dailyMissionTemplates.find((_, index) => 
    missionId.includes('movement') || 
    missionId.includes('run') || 
    missionId.includes('engagement') ||
    missionId.includes('bike') ||
    missionId.includes('walk')
  );
  
  if (dailyMission) return dailyMission;

  // Buscar em templates semanais
  const weeklyMission = weeklyMissionTemplates.find((_, index) => 
    missionId.includes('warrior') || 
    missionId.includes('versatile') || 
    missionId.includes('ambassador')
  );
  
  if (weeklyMission) return weeklyMission;

  // Buscar em templates especiais
  if (missionId.includes('special_0')) return specialMissionTemplates[0];
  if (missionId.includes('special_1')) return specialMissionTemplates[1];
  if (missionId.includes('special_2')) return specialMissionTemplates[2];

  return null;
}

// Simular sistema de missões completadas (em produção seria banco de dados)
const completedMissionsStore = new Map<string, string[]>();

function getCompletedMissions(userId: string): string[] {
  return completedMissionsStore.get(userId) || [];
}

function markMissionAsCompleted(userId: string, missionId: string) {
  const completed = getCompletedMissions(userId);
  if (!completed.includes(missionId)) {
    completed.push(missionId);
    completedMissionsStore.set(userId, completed);
  }
}
