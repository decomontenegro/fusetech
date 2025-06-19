export interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  position: number;
  score: number;
  change: number; // +1, -1, 0 para mudança de posição
  badge?: string;
  vipTier?: string;
  stats: {
    totalActivities: number;
    totalDistance: number;
    totalTokens: number;
    currentStreak: number;
    achievements: number;
    missionsCompleted: number;
  };
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  metric: 'tokens' | 'activities' | 'distance' | 'streak' | 'achievements' | 'missions' | 'overall';
  color: string;
  users: RankingUser[];
  lastUpdated: Date;
}

export interface RankingReward {
  position: number;
  tokenReward: number;
  badge?: string;
  specialReward?: string;
}

// Categorias de ranking
export const leaderboardCategories: Omit<LeaderboardCategory, 'users' | 'lastUpdated'>[] = [
  {
    id: 'overall_weekly',
    name: 'Ranking Geral',
    description: 'Pontuação geral da semana',
    icon: '🏆',
    timeframe: 'weekly',
    metric: 'overall',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'tokens_weekly',
    name: 'Mais Tokens',
    description: 'Quem ganhou mais tokens esta semana',
    icon: '💰',
    timeframe: 'weekly',
    metric: 'tokens',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'activities_weekly',
    name: 'Mais Ativo',
    description: 'Maior número de atividades',
    icon: '🏃‍♂️',
    timeframe: 'weekly',
    metric: 'activities',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'distance_weekly',
    name: 'Maior Distância',
    description: 'Quem percorreu mais quilômetros',
    icon: '📏',
    timeframe: 'weekly',
    metric: 'distance',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'streak_current',
    name: 'Maior Sequência',
    description: 'Sequência atual de dias ativos',
    icon: '🔥',
    timeframe: 'all_time',
    metric: 'streak',
    color: 'from-red-400 to-red-600'
  },
  {
    id: 'achievements_all',
    name: 'Colecionador',
    description: 'Mais conquistas desbloqueadas',
    icon: '🏅',
    timeframe: 'all_time',
    metric: 'achievements',
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    id: 'missions_weekly',
    name: 'Missionário',
    description: 'Mais missões completadas',
    icon: '🎯',
    timeframe: 'weekly',
    metric: 'missions',
    color: 'from-pink-400 to-pink-600'
  }
];

// Recompensas por posição
export const rankingRewards: { [categoryId: string]: RankingReward[] } = {
  overall_weekly: [
    { position: 1, tokenReward: 2000, badge: '👑', specialReward: 'Produto grátis da loja' },
    { position: 2, tokenReward: 1500, badge: '🥈', specialReward: '50% desconto na loja' },
    { position: 3, tokenReward: 1000, badge: '🥉', specialReward: '25% desconto na loja' },
    { position: 4, tokenReward: 750 },
    { position: 5, tokenReward: 500 },
    { position: 10, tokenReward: 250 } // Top 10
  ],
  tokens_weekly: [
    { position: 1, tokenReward: 1000, badge: '💎' },
    { position: 2, tokenReward: 750, badge: '💰' },
    { position: 3, tokenReward: 500, badge: '🪙' }
  ],
  activities_weekly: [
    { position: 1, tokenReward: 800, badge: '⚡' },
    { position: 2, tokenReward: 600, badge: '🏃‍♂️' },
    { position: 3, tokenReward: 400, badge: '🚀' }
  ],
  distance_weekly: [
    { position: 1, tokenReward: 800, badge: '🌟' },
    { position: 2, tokenReward: 600, badge: '📏' },
    { position: 3, tokenReward: 400, badge: '🎯' }
  ],
  streak_current: [
    { position: 1, tokenReward: 1500, badge: '🔥', specialReward: 'Título: Inabalável' },
    { position: 2, tokenReward: 1000, badge: '💪' },
    { position: 3, tokenReward: 750, badge: '⭐' }
  ],
  achievements_all: [
    { position: 1, tokenReward: 1200, badge: '🏆', specialReward: 'Conquista exclusiva' },
    { position: 2, tokenReward: 900, badge: '🏅' },
    { position: 3, tokenReward: 600, badge: '⭐' }
  ],
  missions_weekly: [
    { position: 1, tokenReward: 700, badge: '🎯' },
    { position: 2, tokenReward: 500, badge: '🎪' },
    { position: 3, tokenReward: 300, badge: '🎨' }
  ]
};

// Dados simulados para demonstração
export const mockRankingUsers: RankingUser[] = [
  {
    id: 'user1',
    name: 'André Montenegro',
    avatar: '/avatars/andre.jpg',
    position: 1,
    score: 15420,
    change: 0,
    badge: '👑',
    vipTier: 'gold_vip',
    stats: {
      totalActivities: 45,
      totalDistance: 234500, // em metros
      totalTokens: 15420,
      currentStreak: 12,
      achievements: 18,
      missionsCompleted: 23
    }
  },
  {
    id: 'user2',
    name: 'Maria Silva',
    avatar: '/avatars/maria.jpg',
    position: 2,
    score: 14890,
    change: 1,
    badge: '🥈',
    vipTier: 'silver_vip',
    stats: {
      totalActivities: 42,
      totalDistance: 198300,
      totalTokens: 14890,
      currentStreak: 8,
      achievements: 16,
      missionsCompleted: 21
    }
  },
  {
    id: 'user3',
    name: 'João Santos',
    avatar: '/avatars/joao.jpg',
    position: 3,
    score: 13750,
    change: -1,
    badge: '🥉',
    vipTier: 'silver_vip',
    stats: {
      totalActivities: 38,
      totalDistance: 187600,
      totalTokens: 13750,
      currentStreak: 15,
      achievements: 14,
      missionsCompleted: 19
    }
  },
  {
    id: 'user4',
    name: 'Ana Costa',
    position: 4,
    score: 12340,
    change: 2,
    vipTier: 'bronze_vip',
    stats: {
      totalActivities: 35,
      totalDistance: 156800,
      totalTokens: 12340,
      currentStreak: 6,
      achievements: 12,
      missionsCompleted: 17
    }
  },
  {
    id: 'user5',
    name: 'Pedro Lima',
    position: 5,
    score: 11890,
    change: -1,
    vipTier: 'bronze_vip',
    stats: {
      totalActivities: 33,
      totalDistance: 145200,
      totalTokens: 11890,
      currentStreak: 4,
      achievements: 11,
      missionsCompleted: 16
    }
  },
  {
    id: 'user6',
    name: 'Carla Oliveira',
    position: 6,
    score: 10560,
    change: 0,
    stats: {
      totalActivities: 29,
      totalDistance: 134500,
      totalTokens: 10560,
      currentStreak: 9,
      achievements: 10,
      missionsCompleted: 14
    }
  },
  {
    id: 'user7',
    name: 'Rafael Souza',
    position: 7,
    score: 9870,
    change: 1,
    stats: {
      totalActivities: 27,
      totalDistance: 123400,
      totalTokens: 9870,
      currentStreak: 3,
      achievements: 9,
      missionsCompleted: 13
    }
  },
  {
    id: 'user8',
    name: 'Fernanda Rocha',
    position: 8,
    score: 9340,
    change: -2,
    stats: {
      totalActivities: 25,
      totalDistance: 112300,
      totalTokens: 9340,
      currentStreak: 7,
      achievements: 8,
      missionsCompleted: 12
    }
  },
  {
    id: 'user9',
    name: 'Lucas Ferreira',
    position: 9,
    score: 8750,
    change: 0,
    stats: {
      totalActivities: 23,
      totalDistance: 98700,
      totalTokens: 8750,
      currentStreak: 2,
      achievements: 7,
      missionsCompleted: 11
    }
  },
  {
    id: 'user10',
    name: 'Juliana Alves',
    position: 10,
    score: 8230,
    change: 1,
    stats: {
      totalActivities: 21,
      totalDistance: 87600,
      totalTokens: 8230,
      currentStreak: 5,
      achievements: 6,
      missionsCompleted: 10
    }
  }
];

export function calculateOverallScore(stats: RankingUser['stats']): number {
  // Fórmula para pontuação geral
  const tokenWeight = 1;
  const activityWeight = 50;
  const distanceWeight = 0.01; // 1 ponto por 100m
  const streakWeight = 100;
  const achievementWeight = 200;
  const missionWeight = 75;

  return Math.round(
    stats.totalTokens * tokenWeight +
    stats.totalActivities * activityWeight +
    stats.totalDistance * distanceWeight +
    stats.currentStreak * streakWeight +
    stats.achievements * achievementWeight +
    stats.missionsCompleted * missionWeight
  );
}

export function getPositionChange(change: number): { icon: string; color: string; text: string } {
  if (change > 0) {
    return { icon: '↗️', color: 'text-green-600', text: `+${change}` };
  } else if (change < 0) {
    return { icon: '↘️', color: 'text-red-600', text: `${change}` };
  } else {
    return { icon: '➡️', color: 'text-gray-500', text: '=' };
  }
}

export function getVIPTierIcon(tier?: string): string {
  switch (tier) {
    case 'bronze_vip': return '🥉';
    case 'silver_vip': return '🥈';
    case 'gold_vip': return '🥇';
    case 'diamond_vip': return '💎';
    default: return '';
  }
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}
