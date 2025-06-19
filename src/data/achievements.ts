export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'activity' | 'social' | 'special' | 'beta';
  difficulty: 'bronze' | 'prata' | 'ouro' | 'diamante';
  tokenReward: number;
  requirements: {
    type: 'activities_count' | 'distance_total' | 'streak_days' | 'product_purchase' | 'referrals' | 'login_days' | 'activity_types' | 'special';
    target: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
    activityType?: string[];
  };
  unlockConditions?: string[];
  isHidden?: boolean;
  isBetaExclusive?: boolean;
}

export const achievements: Achievement[] = [
  // ONBOARDING ACHIEVEMENTS
  {
    id: 'welcome_aboard',
    name: 'Bem-vindo a bordo!',
    description: 'Conecte sua conta Strava ao FUSEtech',
    icon: '🚀',
    category: 'onboarding',
    difficulty: 'bronze',
    tokenReward: 500,
    requirements: {
      type: 'special',
      target: 1
    }
  },
  {
    id: 'first_steps',
    name: 'Primeiros Passos',
    description: 'Complete sua primeira atividade sincronizada',
    icon: '👟',
    category: 'onboarding',
    difficulty: 'bronze',
    tokenReward: 300,
    requirements: {
      type: 'activities_count',
      target: 1
    }
  },
  {
    id: 'explorer',
    name: 'Explorador',
    description: 'Visite todas as seções do app (Dashboard, Loja, Perfil)',
    icon: '🗺️',
    category: 'onboarding',
    difficulty: 'bronze',
    tokenReward: 200,
    requirements: {
      type: 'special',
      target: 3
    }
  },

  // ACTIVITY ACHIEVEMENTS
  {
    id: 'consistent_runner',
    name: 'Corredor Consistente',
    description: 'Complete 5 corridas em uma semana',
    icon: '🏃‍♂️',
    category: 'activity',
    difficulty: 'prata',
    tokenReward: 800,
    requirements: {
      type: 'activities_count',
      target: 5,
      timeframe: 'weekly',
      activityType: ['Run']
    }
  },
  {
    id: 'distance_warrior',
    name: 'Guerreiro da Distância',
    description: 'Percorra 100km em atividades',
    icon: '🎯',
    category: 'activity',
    difficulty: 'ouro',
    tokenReward: 1500,
    requirements: {
      type: 'distance_total',
      target: 100000, // em metros
      timeframe: 'all_time'
    }
  },
  {
    id: 'streak_master',
    name: 'Mestre da Sequência',
    description: 'Mantenha uma sequência de 7 dias consecutivos',
    icon: '🔥',
    category: 'activity',
    difficulty: 'ouro',
    tokenReward: 2000,
    requirements: {
      type: 'streak_days',
      target: 7
    }
  },
  {
    id: 'variety_athlete',
    name: 'Atleta Versátil',
    description: 'Complete 3 tipos diferentes de atividade',
    icon: '🎪',
    category: 'activity',
    difficulty: 'prata',
    tokenReward: 1000,
    requirements: {
      type: 'activity_types',
      target: 3
    }
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Complete 5 atividades antes das 8h',
    icon: '🌅',
    category: 'activity',
    difficulty: 'prata',
    tokenReward: 600,
    requirements: {
      type: 'special',
      target: 5
    }
  },
  {
    id: 'weekend_warrior',
    name: 'Guerreiro de Fim de Semana',
    description: 'Complete atividades em 4 fins de semana consecutivos',
    icon: '⚔️',
    category: 'activity',
    difficulty: 'ouro',
    tokenReward: 1200,
    requirements: {
      type: 'special',
      target: 4
    }
  },

  // SOCIAL ACHIEVEMENTS
  {
    id: 'first_purchase',
    name: 'Primeira Compra',
    description: 'Troque tokens por seu primeiro produto',
    icon: '🛍️',
    category: 'social',
    difficulty: 'bronze',
    tokenReward: 400,
    requirements: {
      type: 'product_purchase',
      target: 1
    }
  },
  {
    id: 'big_spender',
    name: 'Grande Comprador',
    description: 'Gaste mais de 10.000 tokens na loja',
    icon: '💎',
    category: 'social',
    difficulty: 'diamante',
    tokenReward: 3000,
    requirements: {
      type: 'special',
      target: 10000
    }
  },
  {
    id: 'community_builder',
    name: 'Construtor de Comunidade',
    description: 'Convide 5 amigos para o FUSEtech',
    icon: '👥',
    category: 'social',
    difficulty: 'ouro',
    tokenReward: 2500,
    requirements: {
      type: 'referrals',
      target: 5
    }
  },

  // BETA EXCLUSIVE ACHIEVEMENTS
  {
    id: 'beta_pioneer',
    name: 'Pioneiro Beta',
    description: 'Seja um dos primeiros 100 usuários beta',
    icon: '🏆',
    category: 'beta',
    difficulty: 'diamante',
    tokenReward: 5000,
    requirements: {
      type: 'special',
      target: 1
    },
    isBetaExclusive: true
  },
  {
    id: 'bug_hunter',
    name: 'Caçador de Bugs',
    description: 'Reporte 3 bugs que foram corrigidos',
    icon: '🐛',
    category: 'beta',
    difficulty: 'ouro',
    tokenReward: 1500,
    requirements: {
      type: 'special',
      target: 3
    },
    isBetaExclusive: true
  },
  {
    id: 'feedback_master',
    name: 'Mestre do Feedback',
    description: 'Tenha 5 sugestões implementadas',
    icon: '💡',
    category: 'beta',
    difficulty: 'diamante',
    tokenReward: 3000,
    requirements: {
      type: 'special',
      target: 5
    },
    isBetaExclusive: true
  },
  {
    id: 'beta_legend',
    name: 'Lenda Beta',
    description: 'Complete todas as conquistas beta',
    icon: '👑',
    category: 'beta',
    difficulty: 'diamante',
    tokenReward: 10000,
    requirements: {
      type: 'special',
      target: 1
    },
    isBetaExclusive: true,
    isHidden: true
  },

  // SPECIAL ACHIEVEMENTS
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Complete 3 atividades após 22h',
    icon: '🦉',
    category: 'special',
    difficulty: 'prata',
    tokenReward: 700,
    requirements: {
      type: 'special',
      target: 3
    }
  },
  {
    id: 'speed_demon',
    name: 'Demônio da Velocidade',
    description: 'Mantenha pace abaixo de 5min/km por 5km',
    icon: '⚡',
    category: 'special',
    difficulty: 'diamante',
    tokenReward: 2500,
    requirements: {
      type: 'special',
      target: 1
    },
    isHidden: true
  },
  {
    id: 'endurance_king',
    name: 'Rei da Resistência',
    description: 'Complete uma atividade de mais de 2 horas',
    icon: '👑',
    category: 'special',
    difficulty: 'ouro',
    tokenReward: 1800,
    requirements: {
      type: 'special',
      target: 1
    }
  }
];

export const getAchievementsByCategory = (category: string) => {
  return achievements.filter(achievement => achievement.category === category);
};

export const getBetaExclusiveAchievements = () => {
  return achievements.filter(achievement => achievement.isBetaExclusive);
};

export const getVisibleAchievements = () => {
  return achievements.filter(achievement => !achievement.isHidden);
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'bronze': return 'from-amber-400 to-orange-500';
    case 'prata': return 'from-gray-400 to-gray-600';
    case 'ouro': return 'from-yellow-400 to-yellow-600';
    case 'diamante': return 'from-blue-400 to-purple-600';
    default: return 'from-gray-400 to-gray-600';
  }
};
