import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateDailyMissions, generateWeeklyMissions, specialMissionTemplates } from '@/data/missions';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);
    const today = new Date();

    // Gerar missões diárias
    const dailyMissions = generateDailyMissions(today);
    
    // Gerar missões semanais
    const weeklyMissions = generateWeeklyMissions(today);
    
    // Missões especiais (sempre ativas para beta)
    const specialMissions = specialMissionTemplates.map((template, index) => ({
      ...template,
      id: `special_${index}`,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    }));

    // Buscar missões completadas (simulado - em produção seria do banco)
    const completedMissions = getCompletedMissions(userData.id);

    return NextResponse.json({
      daily: dailyMissions,
      weekly: weeklyMissions,
      special: specialMissions,
      completed: completedMissions,
      stats: {
        totalAvailable: dailyMissions.length + weeklyMissions.length + specialMissions.length,
        totalCompleted: completedMissions.length,
        dailyCompleted: dailyMissions.filter(m => completedMissions.includes(m.id)).length,
        weeklyCompleted: weeklyMissions.filter(m => completedMissions.includes(m.id)).length
      }
    });

  } catch (error) {
    console.error('Erro ao buscar missões:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Simular missões completadas (em produção seria do banco de dados)
function getCompletedMissions(userId: string): string[] {
  // Por enquanto, simular algumas missões completadas
  const today = new Date().toISOString().split('T')[0];
  return [
    // Algumas missões já completadas para demonstração
    `daily_${today}_engagement`,
  ];
}
