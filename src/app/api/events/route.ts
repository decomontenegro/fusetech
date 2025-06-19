import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { activeEvents, calculateEventProgress } from '@/data/events';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Buscar eventos ativos e futuros
    const events = activeEvents.map(event => ({
      ...event,
      // Atualizar status baseado na data atual
      status: getEventCurrentStatus(event)
    }));

    // Calcular progresso do usuário em cada evento
    const userProgress: { [eventId: string]: any } = {};
    
    for (const event of events) {
      const userStats = await getUserEventStats(userData, event);
      const progress = calculateEventProgress(event, userStats);
      
      // Verificar se está participando
      const isParticipating = getUserEventParticipation(userData.id, event.id);
      
      userProgress[event.id] = {
        ...progress,
        isParticipating,
        completed: Object.values(progress).every((p: any) => p.completed),
        tokensEarned: getUserEventTokens(userData.id, event.id),
        rewardsEarned: getUserEventRewards(userData.id, event.id)
      };
    }

    return NextResponse.json({
      events,
      userProgress,
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'active').length,
      participatingEvents: Object.values(userProgress).filter((p: any) => p.isParticipating).length
    });

  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

function getEventCurrentStatus(event: any): string {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  
  // Verificar se está terminando logo (últimas 24 horas)
  const timeToEnd = end.getTime() - now.getTime();
  const hoursToEnd = timeToEnd / (1000 * 60 * 60);
  
  if (hoursToEnd <= 24) return 'ending_soon';
  
  return 'active';
}

async function getUserEventStats(userData: any, event: any) {
  try {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    
    // Buscar atividades do usuário no período do evento
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

    // Filtrar atividades do período do evento
    const eventActivities = activities.filter((activity: any) => {
      const activityDate = new Date(activity.start_date);
      return activityDate >= eventStart && activityDate <= eventEnd;
    });

    // Calcular estatísticas
    const activitiesInPeriod = eventActivities.length;
    const distanceInPeriod = eventActivities.reduce((sum: number, activity: any) => 
      sum + (activity.distance || 0), 0
    );
    const timeInPeriod = eventActivities.reduce((sum: number, activity: any) => 
      sum + (activity.moving_time || 0), 0
    );

    // Calcular streak atual
    const currentStreak = calculateCurrentStreak(activities);

    // Buscar tokens ganhos no período
    const tokensResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/tokens`, {
      headers: {
        'Cookie': `fusetech_user=${JSON.stringify(userData)}`
      }
    });
    
    let tokensEarned = 0;
    if (tokensResponse.ok) {
      const tokensData = await tokensResponse.json();
      // Simular tokens ganhos no período do evento
      tokensEarned = Math.floor(activitiesInPeriod * 100 + distanceInPeriod * 0.1);
    }

    return {
      activitiesInPeriod,
      distanceInPeriod,
      timeInPeriod,
      currentStreak,
      tokensEarned,
      referralsInPeriod: userData.referralsInPeriod || 0,
      purchasesInPeriod: userData.purchasesInPeriod || 0
    };

  } catch (error) {
    console.error('Erro ao calcular stats do evento:', error);
    return {
      activitiesInPeriod: 0,
      distanceInPeriod: 0,
      timeInPeriod: 0,
      currentStreak: 0,
      tokensEarned: 0,
      referralsInPeriod: 0,
      purchasesInPeriod: 0
    };
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

// Simular sistema de participação em eventos
const eventParticipations = new Map<string, Set<string>>();

function getUserEventParticipation(userId: string, eventId: string): boolean {
  const participants = eventParticipations.get(eventId) || new Set();
  return participants.has(userId);
}

function getUserEventTokens(userId: string, eventId: string): number {
  // Simular tokens ganhos em eventos
  return getUserEventParticipation(userId, eventId) ? Math.floor(Math.random() * 1000) : 0;
}

function getUserEventRewards(userId: string, eventId: string): number {
  // Simular recompensas ganhas em eventos
  return getUserEventParticipation(userId, eventId) ? Math.floor(Math.random() * 3) : 0;
}
