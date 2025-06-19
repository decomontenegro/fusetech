export interface Notification {
  id: string;
  type: 'activity_reminder' | 'mission_available' | 'event_ending' | 'ranking_update' | 'vip_voting' | 'achievement_unlocked' | 'token_reward' | 'social' | 'system';
  title: string;
  message: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'fitness' | 'rewards' | 'social' | 'events' | 'system';
  createdAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  data?: any;
  userId: string;
}

export interface NotificationSettings {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  categories: {
    fitness: boolean;
    rewards: boolean;
    social: boolean;
    events: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "08:00"
  };
  frequency: {
    activityReminders: 'never' | 'daily' | 'every_2_days' | 'weekly';
    missionReminders: boolean;
    eventReminders: boolean;
    rankingUpdates: boolean;
    vipUpdates: boolean;
  };
  timezone: string;
}

export interface NotificationTemplate {
  id: string;
  type: Notification['type'];
  title: string;
  message: string;
  icon: string;
  priority: Notification['priority'];
  category: Notification['category'];
  triggers: NotificationTrigger[];
  conditions?: NotificationCondition[];
}

export interface NotificationTrigger {
  event: 'activity_completed' | 'mission_available' | 'event_ending' | 'ranking_changed' | 'achievement_unlocked' | 'inactivity' | 'scheduled';
  delay?: number; // minutos
  data?: any;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

// Templates de notificações
export const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'daily_activity_reminder',
    type: 'activity_reminder',
    title: 'Hora de se exercitar! 💪',
    message: 'Você ainda não registrou nenhuma atividade hoje. Que tal uma caminhada?',
    icon: '🏃‍♂️',
    priority: 'medium',
    category: 'fitness',
    triggers: [
      {
        event: 'scheduled',
        delay: 0
      }
    ],
    conditions: [
      {
        field: 'todayActivities',
        operator: 'equals',
        value: 0
      }
    ]
  },
  {
    id: 'streak_risk',
    type: 'activity_reminder',
    title: 'Sua sequência está em risco! 🔥',
    message: 'Você tem uma sequência de {streak} dias. Não deixe ela acabar hoje!',
    icon: '⚠️',
    priority: 'high',
    category: 'fitness',
    triggers: [
      {
        event: 'inactivity',
        delay: 1200 // 20 horas
      }
    ],
    conditions: [
      {
        field: 'currentStreak',
        operator: 'greater_than',
        value: 3
      }
    ]
  },
  {
    id: 'mission_available',
    type: 'mission_available',
    title: 'Novas missões disponíveis! 🎯',
    message: 'Missões diárias renovadas. Complete e ganhe tokens extras!',
    icon: '🎯',
    priority: 'medium',
    category: 'rewards',
    triggers: [
      {
        event: 'scheduled',
        delay: 0
      }
    ]
  },
  {
    id: 'mission_completion',
    type: 'token_reward',
    title: 'Missão completada! 🎉',
    message: 'Parabéns! Você ganhou {tokens} tokens. Continue assim!',
    icon: '🏆',
    priority: 'medium',
    category: 'rewards',
    triggers: [
      {
        event: 'mission_available',
        delay: 0
      }
    ]
  },
  {
    id: 'event_ending_soon',
    type: 'event_ending',
    title: 'Evento terminando em 24h! ⏰',
    message: 'O evento "{eventName}" termina amanhã. Últimas horas para participar!',
    icon: '🚨',
    priority: 'high',
    category: 'events',
    triggers: [
      {
        event: 'event_ending',
        delay: 0
      }
    ]
  },
  {
    id: 'ranking_position_change',
    type: 'ranking_update',
    title: 'Sua posição no ranking mudou! 📈',
    message: 'Você subiu para a posição #{position} no ranking geral!',
    icon: '🏆',
    priority: 'medium',
    category: 'social',
    triggers: [
      {
        event: 'ranking_changed',
        delay: 0
      }
    ]
  },
  {
    id: 'vip_voting_available',
    type: 'vip_voting',
    title: 'Nova votação VIP disponível! 👑',
    message: 'Como VIP, você pode votar no projeto "{projectName}". Sua opinião importa!',
    icon: '🗳️',
    priority: 'medium',
    category: 'social',
    triggers: [
      {
        event: 'scheduled',
        delay: 0
      }
    ]
  },
  {
    id: 'achievement_unlocked',
    type: 'achievement_unlocked',
    title: 'Conquista desbloqueada! 🏅',
    message: 'Parabéns! Você desbloqueou "{achievementName}" e ganhou {tokens} tokens!',
    icon: '🎖️',
    priority: 'high',
    category: 'rewards',
    triggers: [
      {
        event: 'achievement_unlocked',
        delay: 0
      }
    ]
  },
  {
    id: 'weekly_summary',
    type: 'system',
    title: 'Resumo da semana 📊',
    message: 'Esta semana você completou {activities} atividades e ganhou {tokens} tokens!',
    icon: '📈',
    priority: 'low',
    category: 'system',
    triggers: [
      {
        event: 'scheduled',
        delay: 0
      }
    ]
  },
  {
    id: 'friend_activity',
    type: 'social',
    title: 'Amigo ativo! 👥',
    message: '{friendName} completou uma corrida de {distance}km. Que tal acompanhar?',
    icon: '🏃‍♀️',
    priority: 'low',
    category: 'social',
    triggers: [
      {
        event: 'activity_completed',
        delay: 30
      }
    ]
  }
];

// Notificações mock para demonstração
export const mockNotifications: Notification[] = [
  {
    id: 'notif_1',
    type: 'mission_available',
    title: 'Novas missões disponíveis! 🎯',
    message: 'Missões diárias renovadas. Complete e ganhe tokens extras!',
    icon: '🎯',
    priority: 'medium',
    category: 'rewards',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
    isRead: false,
    actionUrl: '/missoes',
    actionText: 'Ver Missões',
    userId: 'user1'
  },
  {
    id: 'notif_2',
    type: 'achievement_unlocked',
    title: 'Conquista desbloqueada! 🏅',
    message: 'Parabéns! Você desbloqueou "Primeira Semana" e ganhou 500 tokens!',
    icon: '🎖️',
    priority: 'high',
    category: 'rewards',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
    isRead: false,
    actionUrl: '/conquistas',
    actionText: 'Ver Conquistas',
    data: { achievementName: 'Primeira Semana', tokens: 500 },
    userId: 'user1'
  },
  {
    id: 'notif_3',
    type: 'event_ending',
    title: 'Evento terminando em 24h! ⏰',
    message: 'O evento "Desafio de Verão" termina amanhã. Últimas horas para participar!',
    icon: '🚨',
    priority: 'high',
    category: 'events',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expira em 24h
    isRead: true,
    actionUrl: '/eventos',
    actionText: 'Ver Evento',
    data: { eventName: 'Desafio de Verão' },
    userId: 'user1'
  },
  {
    id: 'notif_4',
    type: 'ranking_update',
    title: 'Sua posição no ranking mudou! 📈',
    message: 'Você subiu para a posição #3 no ranking geral!',
    icon: '🏆',
    priority: 'medium',
    category: 'social',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
    isRead: true,
    actionUrl: '/ranking',
    actionText: 'Ver Ranking',
    data: { position: 3 },
    userId: 'user1'
  },
  {
    id: 'notif_5',
    type: 'activity_reminder',
    title: 'Hora de se exercitar! 💪',
    message: 'Você ainda não registrou nenhuma atividade hoje. Que tal uma caminhada?',
    icon: '🏃‍♂️',
    priority: 'medium',
    category: 'fitness',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
    isRead: true,
    actionUrl: '/dashboard',
    actionText: 'Sincronizar',
    userId: 'user1'
  }
];

// Configurações padrão de notificação
export const defaultNotificationSettings: Omit<NotificationSettings, 'userId'> = {
  pushEnabled: true,
  emailEnabled: false,
  categories: {
    fitness: true,
    rewards: true,
    social: true,
    events: true,
    system: false
  },
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '08:00'
  },
  frequency: {
    activityReminders: 'daily',
    missionReminders: true,
    eventReminders: true,
    rankingUpdates: true,
    vipUpdates: true
  },
  timezone: 'America/Sao_Paulo'
};

export function getNotificationIcon(type: Notification['type']): string {
  const icons = {
    'activity_reminder': '🏃‍♂️',
    'mission_available': '🎯',
    'event_ending': '⏰',
    'ranking_update': '🏆',
    'vip_voting': '👑',
    'achievement_unlocked': '🏅',
    'token_reward': '💰',
    'social': '👥',
    'system': '⚙️'
  };
  
  return icons[type] || '🔔';
}

export function getNotificationColor(priority: Notification['priority']): string {
  const colors = {
    'low': 'from-gray-400 to-gray-500',
    'medium': 'from-blue-400 to-blue-600',
    'high': 'from-orange-400 to-red-500',
    'urgent': 'from-red-500 to-red-700'
  };
  
  return colors[priority] || 'from-gray-400 to-gray-500';
}

export function getCategoryColor(category: Notification['category']): string {
  const colors = {
    'fitness': 'text-green-600',
    'rewards': 'text-yellow-600',
    'social': 'text-blue-600',
    'events': 'text-purple-600',
    'system': 'text-gray-600'
  };
  
  return colors[category] || 'text-gray-600';
}

export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  
  return date.toLocaleDateString('pt-BR');
}
