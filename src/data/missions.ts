export interface Mission {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'special';
  category: 'activity' | 'social' | 'engagement' | 'beta';
  difficulty: 'easy' | 'medium' | 'hard';
  tokenReward: number;
  bonusReward?: number;
  requirements: {
    type: 'activity_count' | 'distance' | 'duration' | 'activity_type' | 'streak' | 'login' | 'shop_visit' | 'referral' | 'feedback';
    target: number;
    activityType?: string[];
    timeframe: 'today' | 'this_week' | 'this_month';
  };
  expiresAt?: Date;
  isActive: boolean;
  priority: number; // 1-5, maior = mais importante
}

// Missões diárias que se renovam automaticamente
export const dailyMissionTemplates: Omit<Mission, 'id' | 'expiresAt' | 'isActive'>[] = [
  {
    name: 'Movimento Matinal',
    description: 'Complete uma atividade antes das 10h',
    icon: '🌅',
    type: 'daily',
    category: 'activity',
    difficulty: 'easy',
    tokenReward: 150,
    bonusReward: 50,
    requirements: {
      type: 'activity_count',
      target: 1,
      timeframe: 'today'
    },
    priority: 3
  },
  {
    name: 'Corredor do Dia',
    description: 'Corra pelo menos 3km hoje',
    icon: '🏃‍♂️',
    type: 'daily',
    category: 'activity',
    difficulty: 'medium',
    tokenReward: 200,
    requirements: {
      type: 'distance',
      target: 3000, // em metros
      activityType: ['Run'],
      timeframe: 'today'
    },
    priority: 4
  },
  {
    name: 'Ativo e Conectado',
    description: 'Faça login e complete uma atividade',
    icon: '⚡',
    type: 'daily',
    category: 'engagement',
    difficulty: 'easy',
    tokenReward: 100,
    requirements: {
      type: 'activity_count',
      target: 1,
      timeframe: 'today'
    },
    priority: 2
  },
  {
    name: 'Explorador da Loja',
    description: 'Visite a loja de recompensas',
    icon: '🛍️',
    type: 'daily',
    category: 'engagement',
    difficulty: 'easy',
    tokenReward: 75,
    requirements: {
      type: 'shop_visit',
      target: 1,
      timeframe: 'today'
    },
    priority: 1
  },
  {
    name: 'Ciclista Urbano',
    description: 'Pedale pelo menos 10km',
    icon: '🚴‍♂️',
    type: 'daily',
    category: 'activity',
    difficulty: 'medium',
    tokenReward: 250,
    requirements: {
      type: 'distance',
      target: 10000,
      activityType: ['Ride'],
      timeframe: 'today'
    },
    priority: 4
  },
  {
    name: 'Caminhada Relaxante',
    description: 'Caminhe por pelo menos 30 minutos',
    icon: '🚶‍♂️',
    type: 'daily',
    category: 'activity',
    difficulty: 'easy',
    tokenReward: 120,
    requirements: {
      type: 'duration',
      target: 1800, // 30 minutos em segundos
      activityType: ['Walk'],
      timeframe: 'today'
    },
    priority: 2
  }
];

// Missões semanais mais desafiadoras
export const weeklyMissionTemplates: Omit<Mission, 'id' | 'expiresAt' | 'isActive'>[] = [
  {
    name: 'Guerreiro da Semana',
    description: 'Complete 5 atividades esta semana',
    icon: '⚔️',
    type: 'weekly',
    category: 'activity',
    difficulty: 'medium',
    tokenReward: 800,
    bonusReward: 200,
    requirements: {
      type: 'activity_count',
      target: 5,
      timeframe: 'this_week'
    },
    priority: 5
  },
  {
    name: 'Maratonista Semanal',
    description: 'Percorra 50km em atividades esta semana',
    icon: '🏃‍♂️',
    type: 'weekly',
    category: 'activity',
    difficulty: 'hard',
    tokenReward: 1500,
    bonusReward: 500,
    requirements: {
      type: 'distance',
      target: 50000,
      timeframe: 'this_week'
    },
    priority: 5
  },
  {
    name: 'Atleta Versátil',
    description: 'Complete 3 tipos diferentes de atividade',
    icon: '🎪',
    type: 'weekly',
    category: 'activity',
    difficulty: 'medium',
    tokenReward: 600,
    requirements: {
      type: 'activity_type',
      target: 3,
      timeframe: 'this_week'
    },
    priority: 4
  },
  {
    name: 'Sequência Perfeita',
    description: 'Mantenha uma sequência de 5 dias',
    icon: '🔥',
    type: 'weekly',
    category: 'activity',
    difficulty: 'hard',
    tokenReward: 1200,
    requirements: {
      type: 'streak',
      target: 5,
      timeframe: 'this_week'
    },
    priority: 5
  },
  {
    name: 'Embaixador FUSEtech',
    description: 'Convide 2 amigos para o app',
    icon: '👥',
    type: 'weekly',
    category: 'social',
    difficulty: 'medium',
    tokenReward: 1000,
    bonusReward: 500,
    requirements: {
      type: 'referral',
      target: 2,
      timeframe: 'this_week'
    },
    priority: 3
  },
  {
    name: 'Comprador da Semana',
    description: 'Faça uma compra na loja',
    icon: '💳',
    type: 'weekly',
    category: 'social',
    difficulty: 'easy',
    tokenReward: 300,
    requirements: {
      type: 'shop_visit',
      target: 1,
      timeframe: 'this_week'
    },
    priority: 2
  }
];

// Missões especiais para eventos
export const specialMissionTemplates: Omit<Mission, 'id' | 'expiresAt' | 'isActive'>[] = [
  {
    name: 'Beta Tester VIP',
    description: 'Dê feedback sobre 3 funcionalidades',
    icon: '💡',
    type: 'special',
    category: 'beta',
    difficulty: 'medium',
    tokenReward: 2000,
    bonusReward: 1000,
    requirements: {
      type: 'feedback',
      target: 3,
      timeframe: 'this_month'
    },
    priority: 5
  },
  {
    name: 'Fim de Semana Ativo',
    description: 'Complete atividades no sábado E domingo',
    icon: '🎯',
    type: 'special',
    category: 'activity',
    difficulty: 'medium',
    tokenReward: 500,
    requirements: {
      type: 'activity_count',
      target: 2,
      timeframe: 'this_week'
    },
    priority: 4
  },
  {
    name: 'Desafio 100km',
    description: 'Percorra 100km em um mês',
    icon: '🎖️',
    type: 'special',
    category: 'activity',
    difficulty: 'hard',
    tokenReward: 3000,
    bonusReward: 2000,
    requirements: {
      type: 'distance',
      target: 100000,
      timeframe: 'this_month'
    },
    priority: 5
  }
];

export function generateDailyMissions(date: Date = new Date()): Mission[] {
  const dayOfWeek = date.getDay();
  const missions: Mission[] = [];
  
  // Sempre incluir missão básica de atividade
  missions.push({
    ...dailyMissionTemplates[0], // Movimento Matinal
    id: `daily_${date.toISOString().split('T')[0]}_movement`,
    expiresAt: getEndOfDay(date),
    isActive: true
  });

  // Adicionar missão específica baseada no dia da semana
  if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) { // Segunda, Quarta, Sexta
    missions.push({
      ...dailyMissionTemplates[1], // Corredor do Dia
      id: `daily_${date.toISOString().split('T')[0]}_run`,
      expiresAt: getEndOfDay(date),
      isActive: true
    });
  } else if (dayOfWeek === 2 || dayOfWeek === 4) { // Terça, Quinta
    missions.push({
      ...dailyMissionTemplates[4], // Ciclista Urbano
      id: `daily_${date.toISOString().split('T')[0]}_bike`,
      expiresAt: getEndOfDay(date),
      isActive: true
    });
  } else { // Fim de semana
    missions.push({
      ...dailyMissionTemplates[5], // Caminhada Relaxante
      id: `daily_${date.toISOString().split('T')[0]}_walk`,
      expiresAt: getEndOfDay(date),
      isActive: true
    });
  }

  // Sempre incluir missão de engajamento
  missions.push({
    ...dailyMissionTemplates[2], // Ativo e Conectado
    id: `daily_${date.toISOString().split('T')[0]}_engagement`,
    expiresAt: getEndOfDay(date),
    isActive: true
  });

  return missions;
}

export function generateWeeklyMissions(date: Date = new Date()): Mission[] {
  const weekStart = getStartOfWeek(date);
  const weekEnd = getEndOfWeek(date);
  
  return [
    {
      ...weeklyMissionTemplates[0], // Guerreiro da Semana
      id: `weekly_${weekStart.toISOString().split('T')[0]}_warrior`,
      expiresAt: weekEnd,
      isActive: true
    },
    {
      ...weeklyMissionTemplates[2], // Atleta Versátil
      id: `weekly_${weekStart.toISOString().split('T')[0]}_versatile`,
      expiresAt: weekEnd,
      isActive: true
    },
    {
      ...weeklyMissionTemplates[4], // Embaixador FUSEtech
      id: `weekly_${weekStart.toISOString().split('T')[0]}_ambassador`,
      expiresAt: weekEnd,
      isActive: true
    }
  ];
}

function getEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
}

function getStartOfWeek(date: Date): Date {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Segunda-feira
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

function getEndOfWeek(date: Date): Date {
  const endOfWeek = getStartOfWeek(date);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}
