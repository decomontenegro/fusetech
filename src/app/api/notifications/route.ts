import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { mockNotifications, defaultNotificationSettings } from '@/data/notifications';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);

    // Buscar notificações do usuário
    const userNotifications = await getUserNotifications(userData.id);
    
    // Buscar configurações de notificação
    const settings = getUserNotificationSettings(userData.id);

    // Gerar notificações automáticas baseadas na atividade do usuário
    const autoNotifications = await generateAutoNotifications(userData);
    
    // Combinar notificações
    const allNotifications = [...userNotifications, ...autoNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50); // Limitar a 50 notificações mais recentes

    return NextResponse.json({
      notifications: allNotifications,
      settings,
      unreadCount: allNotifications.filter(n => !n.isRead).length,
      totalCount: allNotifications.length
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

async function getUserNotifications(userId: string) {
  // Em produção, isso buscaria do banco de dados
  // Por enquanto, usar notificações mock filtradas por usuário
  return mockNotifications.filter(notif => notif.userId === userId || notif.userId === 'user1');
}

async function generateAutoNotifications(userData: any) {
  const autoNotifications = [];
  const now = new Date();

  try {
    // Verificar se precisa de lembrete de atividade
    const activitiesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/activities`, {
      headers: {
        'Cookie': `fusetech_user=${JSON.stringify(userData)}`
      }
    });

    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      const activities = activitiesData.activities || [];
      
      // Verificar atividades de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayActivities = activities.filter((activity: any) => {
        const activityDate = new Date(activity.start_date);
        return activityDate >= today;
      });

      // Se não tem atividade hoje e já passou das 18h, criar lembrete
      if (todayActivities.length === 0 && now.getHours() >= 18) {
        autoNotifications.push({
          id: `auto_activity_reminder_${now.getTime()}`,
          type: 'activity_reminder',
          title: 'Ainda dá tempo! 💪',
          message: 'Você ainda não registrou nenhuma atividade hoje. Que tal uma caminhada noturna?',
          icon: '🌙',
          priority: 'medium',
          category: 'fitness',
          createdAt: now,
          isRead: false,
          actionUrl: '/dashboard',
          actionText: 'Sincronizar',
          userId: userData.id
        });
      }
    }

    // Verificar missões disponíveis
    const missionsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/missions`, {
      headers: {
        'Cookie': `fusetech_user=${JSON.stringify(userData)}`
      }
    });

    if (missionsResponse.ok) {
      const missionsData = await missionsResponse.json();
      const dailyMissions = missionsData.daily || [];
      const completedMissions = missionsData.completed || [];
      
      const availableMissions = dailyMissions.filter((mission: any) => 
        !completedMissions.includes(mission.id)
      );

      // Se tem missões disponíveis e é manhã (8-10h), criar lembrete
      if (availableMissions.length > 0 && now.getHours() >= 8 && now.getHours() <= 10) {
        autoNotifications.push({
          id: `auto_mission_reminder_${now.getTime()}`,
          type: 'mission_available',
          title: 'Missões matinais disponíveis! 🌅',
          message: `Você tem ${availableMissions.length} missões disponíveis. Comece o dia ganhando tokens!`,
          icon: '🎯',
          priority: 'medium',
          category: 'rewards',
          createdAt: now,
          isRead: false,
          actionUrl: '/missoes',
          actionText: 'Ver Missões',
          userId: userData.id
        });
      }
    }

    // Verificar eventos terminando
    const eventsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/events`, {
      headers: {
        'Cookie': `fusetech_user=${JSON.stringify(userData)}`
      }
    });

    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      const events = eventsData.events || [];
      
      const endingSoonEvents = events.filter((event: any) => {
        const endDate = new Date(event.endDate);
        const timeToEnd = endDate.getTime() - now.getTime();
        const hoursToEnd = timeToEnd / (1000 * 60 * 60);
        return hoursToEnd > 0 && hoursToEnd <= 24 && event.status === 'active';
      });

      endingSoonEvents.forEach((event: any) => {
        autoNotifications.push({
          id: `auto_event_ending_${event.id}_${now.getTime()}`,
          type: 'event_ending',
          title: 'Evento terminando em breve! ⏰',
          message: `O evento "${event.name}" termina em menos de 24 horas!`,
          icon: '🚨',
          priority: 'high',
          category: 'events',
          createdAt: now,
          expiresAt: new Date(event.endDate),
          isRead: false,
          actionUrl: '/eventos',
          actionText: 'Ver Evento',
          userId: userData.id
        });
      });
    }

  } catch (error) {
    console.error('Erro ao gerar notificações automáticas:', error);
  }

  return autoNotifications;
}

// Sistema de configurações de notificação (simulado)
const userNotificationSettings = new Map<string, any>();

function getUserNotificationSettings(userId: string) {
  return userNotificationSettings.get(userId) || {
    ...defaultNotificationSettings,
    userId
  };
}
