export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'challenge' | 'campaign' | 'tournament' | 'special' | 'seasonal';
  status: 'upcoming' | 'active' | 'ending_soon' | 'ended';
  startDate: Date;
  endDate: Date;
  icon: string;
  banner?: string;
  color: string;
  requirements: EventRequirement[];
  rewards: EventReward[];
  participants: number;
  maxParticipants?: number;
  leaderboard?: EventParticipant[];
  rules: string[];
  tags: string[];
}

export interface EventRequirement {
  id: string;
  type: 'activity_count' | 'distance' | 'time' | 'streak' | 'tokens' | 'referrals' | 'purchases';
  target: number;
  description: string;
  unit?: string;
}

export interface EventReward {
  id: string;
  type: 'tokens' | 'product' | 'discount' | 'badge' | 'vip_upgrade' | 'exclusive_access';
  value: number | string;
  description: string;
  condition: 'participation' | 'completion' | 'top_10' | 'top_3' | 'winner';
  icon: string;
}

export interface EventParticipant {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  position: number;
  progress: { [requirementId: string]: number };
  joinedAt: Date;
  vipTier?: string;
}

// Eventos ativos e futuros
export const activeEvents: GameEvent[] = [
  {
    id: 'summer_challenge_2024',
    name: 'Desafio de Verão FUSEtech',
    description: 'Queime calorias e ganhe produtos exclusivos neste verão!',
    type: 'challenge',
    status: 'active',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2024-12-31'),
    icon: '🏖️',
    banner: '/events/summer-challenge.jpg',
    color: 'from-yellow-400 via-orange-500 to-red-500',
    requirements: [
      {
        id: 'activities_30',
        type: 'activity_count',
        target: 30,
        description: 'Complete 30 atividades durante o evento',
        unit: 'atividades'
      },
      {
        id: 'distance_100km',
        type: 'distance',
        target: 100000, // 100km em metros
        description: 'Percorra 100km no total',
        unit: 'metros'
      }
    ],
    rewards: [
      {
        id: 'participation_reward',
        type: 'tokens',
        value: 1000,
        description: '1000 tokens por participar',
        condition: 'participation',
        icon: '🪙'
      },
      {
        id: 'completion_reward',
        type: 'product',
        value: 'Kit Verão FUSEtech',
        description: 'Kit exclusivo de verão',
        condition: 'completion',
        icon: '🎁'
      },
      {
        id: 'winner_reward',
        type: 'product',
        value: 'Suplementos por 6 meses',
        description: 'Suplementos FUSEtech por 6 meses',
        condition: 'winner',
        icon: '👑'
      }
    ],
    participants: 47,
    maxParticipants: 100,
    leaderboard: [],
    rules: [
      'Apenas atividades registradas durante o período do evento contam',
      'Atividades devem ser validadas pelo Strava',
      'Participantes devem ser beta testers ativos',
      'Recompensas serão distribuídas até 7 dias após o fim do evento'
    ],
    tags: ['verão', 'desafio', 'produtos', 'limitado']
  },
  {
    id: 'beta_feedback_campaign',
    name: 'Campanha Feedback Beta',
    description: 'Ajude a melhorar o FUSEtech e ganhe recompensas exclusivas!',
    type: 'campaign',
    status: 'active',
    startDate: new Date('2024-11-15'),
    endDate: new Date('2025-01-15'),
    icon: '💡',
    color: 'from-blue-400 via-purple-500 to-pink-500',
    requirements: [
      {
        id: 'feedback_reports',
        type: 'tokens', // Usando tokens como proxy para feedback
        target: 5,
        description: 'Envie 5 relatórios de feedback detalhados',
        unit: 'relatórios'
      },
      {
        id: 'bug_reports',
        type: 'tokens',
        target: 3,
        description: 'Reporte 3 bugs ou problemas',
        unit: 'bugs'
      }
    ],
    rewards: [
      {
        id: 'feedback_tokens',
        type: 'tokens',
        value: 500,
        description: '500 tokens por feedback',
        condition: 'participation',
        icon: '💰'
      },
      {
        id: 'beta_badge',
        type: 'badge',
        value: 'Beta Tester Elite',
        description: 'Badge exclusivo de Beta Tester Elite',
        condition: 'completion',
        icon: '🏆'
      },
      {
        id: 'vip_upgrade',
        type: 'vip_upgrade',
        value: 'Upgrade automático para próximo tier VIP',
        description: 'Upgrade automático de tier VIP',
        condition: 'top_10',
        icon: '👑'
      }
    ],
    participants: 23,
    leaderboard: [],
    rules: [
      'Feedback deve ser construtivo e detalhado',
      'Bugs reportados devem ser reproduzíveis',
      'Spam ou feedback irrelevante será desconsiderado',
      'Participação limitada a beta testers verificados'
    ],
    tags: ['beta', 'feedback', 'melhoria', 'vip']
  },
  {
    id: 'weekend_warrior',
    name: 'Guerreiro de Fim de Semana',
    description: 'Evento semanal para os mais dedicados!',
    type: 'tournament',
    status: 'active',
    startDate: new Date('2024-12-21'), // Sábado
    endDate: new Date('2024-12-22'), // Domingo
    icon: '⚔️',
    color: 'from-red-500 via-orange-500 to-yellow-500',
    requirements: [
      {
        id: 'weekend_activities',
        type: 'activity_count',
        target: 4,
        description: 'Complete 4 atividades no fim de semana',
        unit: 'atividades'
      },
      {
        id: 'weekend_distance',
        type: 'distance',
        target: 20000, // 20km
        description: 'Percorra 20km no fim de semana',
        unit: 'metros'
      }
    ],
    rewards: [
      {
        id: 'warrior_tokens',
        type: 'tokens',
        value: 800,
        description: '800 tokens para completar',
        condition: 'completion',
        icon: '🪙'
      },
      {
        id: 'warrior_badge',
        type: 'badge',
        value: 'Guerreiro de Fim de Semana',
        description: 'Badge de Guerreiro de Fim de Semana',
        condition: 'completion',
        icon: '⚔️'
      },
      {
        id: 'top_warrior',
        type: 'discount',
        value: 30,
        description: '30% desconto na loja',
        condition: 'winner',
        icon: '🏆'
      }
    ],
    participants: 15,
    maxParticipants: 50,
    leaderboard: [],
    rules: [
      'Apenas atividades de sábado e domingo contam',
      'Mínimo de 2 atividades por dia',
      'Atividades devem ter pelo menos 30 minutos',
      'Ranking baseado em distância total'
    ],
    tags: ['fim-de-semana', 'intensivo', 'competição']
  },
  {
    id: 'new_year_resolution',
    name: 'Resolução de Ano Novo',
    description: 'Comece 2025 com tudo! Evento especial de janeiro.',
    type: 'special',
    status: 'upcoming',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31'),
    icon: '🎊',
    color: 'from-purple-500 via-pink-500 to-red-500',
    requirements: [
      {
        id: 'january_streak',
        type: 'streak',
        target: 21,
        description: 'Mantenha uma sequência de 21 dias ativos',
        unit: 'dias'
      },
      {
        id: 'january_activities',
        type: 'activity_count',
        target: 31,
        description: 'Uma atividade por dia em janeiro',
        unit: 'atividades'
      }
    ],
    rewards: [
      {
        id: 'resolution_tokens',
        type: 'tokens',
        value: 2500,
        description: '2500 tokens por completar',
        condition: 'completion',
        icon: '💰'
      },
      {
        id: 'resolution_product',
        type: 'product',
        value: 'Kit Resolução 2025',
        description: 'Kit especial de Ano Novo',
        condition: 'completion',
        icon: '🎁'
      },
      {
        id: 'champion_title',
        type: 'badge',
        value: 'Campeão das Resoluções',
        description: 'Título exclusivo de Campeão',
        condition: 'top_3',
        icon: '👑'
      }
    ],
    participants: 0,
    leaderboard: [],
    rules: [
      'Evento começa exatamente à meia-noite de 1º de janeiro',
      'Sequência não pode ser quebrada',
      'Atividades mínimas de 20 minutos',
      'Apenas para usuários que se inscreverem até 31/12'
    ],
    tags: ['ano-novo', 'resolução', 'janeiro', 'especial']
  },
  {
    id: 'refer_friend_bonus',
    name: 'Traga um Amigo',
    description: 'Convide amigos e ganhem juntos!',
    type: 'campaign',
    status: 'active',
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-28'),
    icon: '👥',
    color: 'from-green-400 via-blue-500 to-purple-500',
    requirements: [
      {
        id: 'successful_referrals',
        type: 'referrals',
        target: 3,
        description: 'Convide 3 amigos que se tornem ativos',
        unit: 'amigos'
      }
    ],
    rewards: [
      {
        id: 'referral_tokens',
        type: 'tokens',
        value: 1000,
        description: '1000 tokens por amigo ativo',
        condition: 'participation',
        icon: '🪙'
      },
      {
        id: 'friend_bonus',
        type: 'tokens',
        value: 500,
        description: '500 tokens para o amigo convidado',
        condition: 'participation',
        icon: '🎁'
      },
      {
        id: 'ambassador_status',
        type: 'vip_upgrade',
        value: 'Status de Embaixador FUSEtech',
        description: 'Torne-se um Embaixador oficial',
        condition: 'completion',
        icon: '🌟'
      }
    ],
    participants: 12,
    leaderboard: [],
    rules: [
      'Amigos devem se registrar usando seu link de convite',
      'Amigos devem completar pelo menos 5 atividades',
      'Amigos devem permanecer ativos por 30 dias',
      'Limite de 10 convites por usuário'
    ],
    tags: ['referral', 'amigos', 'social', 'embaixador']
  }
];

export function getEventStatus(event: GameEvent): {
  status: string;
  timeRemaining: string;
  urgency: 'low' | 'medium' | 'high';
} {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  
  if (now < start) {
    const timeToStart = start.getTime() - now.getTime();
    const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return {
      status: 'Começa em',
      timeRemaining: days > 0 ? `${days}d ${hours}h` : `${hours}h`,
      urgency: 'low'
    };
  }
  
  if (now > end) {
    return {
      status: 'Encerrado',
      timeRemaining: '',
      urgency: 'low'
    };
  }
  
  // Evento ativo
  const timeToEnd = end.getTime() - now.getTime();
  const days = Math.floor(timeToEnd / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (days <= 1) urgency = 'high';
  else if (days <= 3) urgency = 'medium';
  
  return {
    status: 'Termina em',
    timeRemaining: days > 0 ? `${days}d ${hours}h` : `${hours}h`,
    urgency
  };
}

export function calculateEventProgress(event: GameEvent, userStats: any): {
  [requirementId: string]: { current: number; target: number; percentage: number; completed: boolean };
} {
  const progress: any = {};
  
  event.requirements.forEach(req => {
    let current = 0;
    
    switch (req.type) {
      case 'activity_count':
        current = userStats.activitiesInPeriod || 0;
        break;
      case 'distance':
        current = userStats.distanceInPeriod || 0;
        break;
      case 'time':
        current = userStats.timeInPeriod || 0;
        break;
      case 'streak':
        current = userStats.currentStreak || 0;
        break;
      case 'tokens':
        current = userStats.tokensEarned || 0;
        break;
      case 'referrals':
        current = userStats.referralsInPeriod || 0;
        break;
      case 'purchases':
        current = userStats.purchasesInPeriod || 0;
        break;
    }
    
    progress[req.id] = {
      current,
      target: req.target,
      percentage: Math.min(100, (current / req.target) * 100),
      completed: current >= req.target
    };
  });
  
  return progress;
}

export function getEventTypeIcon(type: GameEvent['type']): string {
  switch (type) {
    case 'challenge': return '🏆';
    case 'campaign': return '📢';
    case 'tournament': return '⚔️';
    case 'special': return '⭐';
    case 'seasonal': return '🌟';
    default: return '🎯';
  }
}

export function getEventTypeColor(type: GameEvent['type']): string {
  switch (type) {
    case 'challenge': return 'from-yellow-400 to-orange-500';
    case 'campaign': return 'from-blue-400 to-purple-500';
    case 'tournament': return 'from-red-400 to-red-600';
    case 'special': return 'from-purple-400 to-pink-500';
    case 'seasonal': return 'from-green-400 to-blue-500';
    default: return 'from-gray-400 to-gray-600';
  }
}
