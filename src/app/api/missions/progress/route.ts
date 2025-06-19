import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const missionId = searchParams.get('missionId');
    
    if (!missionId) {
      return NextResponse.json({ error: 'Mission ID é obrigatório' }, { status: 400 });
    }

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

    if (!activitiesResponse.ok) {
      return NextResponse.json({ error: 'Erro ao buscar atividades' }, { status: 500 });
    }

    const activitiesData = await activitiesResponse.json();
    const activities = activitiesData.activities || [];

    // Calcular progresso baseado no tipo de missão
    const progress = calculateMissionProgress(missionId, activities, userData);

    return NextResponse.json({
      missionId,
      progress,
      canComplete: progress >= getMissionTarget(missionId)
    });

  } catch (error) {
    console.error('Erro ao calcular progresso da missão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function calculateMissionProgress(missionId: string, activities: any[], userData: any): number {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weekStart = getStartOfWeek(today);

  // Identificar tipo de missão pelo ID
  if (missionId.includes('movement') || missionId.includes('engagement')) {
    // Missão de atividade diária
    return activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= todayStart;
    }).length;
  }

  if (missionId.includes('run')) {
    // Missão de corrida diária
    const todayRuns = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= todayStart && activity.type === 'Run';
    });
    
    return todayRuns.reduce((total, activity) => total + (activity.distance || 0), 0);
  }

  if (missionId.includes('bike')) {
    // Missão de ciclismo diária
    const todayRides = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= todayStart && activity.type === 'Ride';
    });
    
    return todayRides.reduce((total, activity) => total + (activity.distance || 0), 0);
  }

  if (missionId.includes('walk')) {
    // Missão de caminhada diária
    const todayWalks = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= todayStart && activity.type === 'Walk';
    });
    
    return todayWalks.reduce((total, activity) => total + (activity.moving_time || 0), 0);
  }

  if (missionId.includes('warrior')) {
    // Missão semanal - 5 atividades
    return activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= weekStart;
    }).length;
  }

  if (missionId.includes('versatile')) {
    // Missão semanal - tipos diferentes de atividade
    const weekActivities = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= weekStart;
    });
    
    const uniqueTypes = new Set(weekActivities.map(activity => activity.type));
    return uniqueTypes.size;
  }

  if (missionId.includes('ambassador')) {
    // Missão de convites (simulado)
    return userData.referrals || 0;
  }

  // Missões especiais
  if (missionId.includes('special_0')) {
    // Beta Tester VIP - feedback
    return userData.feedbackCount || 0;
  }

  if (missionId.includes('special_1')) {
    // Fim de semana ativo
    const weekendActivities = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      const day = activityDate.getDay();
      return activityDate >= weekStart && (day === 0 || day === 6); // Domingo ou Sábado
    });
    
    const weekendDays = new Set(weekendActivities.map(activity => {
      const date = new Date(activity.start_date);
      return date.getDay();
    }));
    
    return weekendDays.size;
  }

  if (missionId.includes('special_2')) {
    // Desafio 100km mensal
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthActivities = activities.filter(activity => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= monthStart;
    });
    
    return monthActivities.reduce((total, activity) => total + (activity.distance || 0), 0);
  }

  return 0;
}

function getMissionTarget(missionId: string): number {
  // Retornar target baseado no tipo de missão
  if (missionId.includes('movement') || missionId.includes('engagement')) return 1;
  if (missionId.includes('run')) return 3000; // 3km em metros
  if (missionId.includes('bike')) return 10000; // 10km em metros
  if (missionId.includes('walk')) return 1800; // 30 minutos em segundos
  if (missionId.includes('warrior')) return 5;
  if (missionId.includes('versatile')) return 3;
  if (missionId.includes('ambassador')) return 2;
  if (missionId.includes('special_0')) return 3;
  if (missionId.includes('special_1')) return 2;
  if (missionId.includes('special_2')) return 100000; // 100km em metros
  
  return 1;
}

function getStartOfWeek(date: Date): Date {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}
