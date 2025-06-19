export interface VIPTier {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: {
    minTokens: number;
    minActivities: number;
    minPurchases: number;
    minReferrals: number;
    minFeedback: number;
    daysActive: number;
  };
  benefits: VIPBenefit[];
  exclusiveAccess: string[];
  priority: number;
}

export interface VIPBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'discount' | 'exclusive' | 'early_access' | 'influence' | 'recognition';
  value?: number; // Para descontos em %
}

export interface VIPProject {
  id: string;
  name: string;
  description: string;
  type: 'product_design' | 'flavor_choice' | 'brand_decision' | 'feature_request';
  status: 'voting' | 'development' | 'testing' | 'launched';
  votingEnds?: Date;
  requiredTier: string;
  options: VIPProjectOption[];
  currentVotes: { [optionId: string]: number };
  totalVotes: number;
}

export interface VIPProjectOption {
  id: string;
  name: string;
  description: string;
  image?: string;
  details: string[];
}

// Tiers do programa VIP
export const vipTiers: VIPTier[] = [
  {
    id: 'bronze_vip',
    name: 'Explorador',
    description: 'Primeiro passo na jornada VIP',
    icon: '🥉',
    color: 'from-amber-400 to-orange-500',
    requirements: {
      minTokens: 5000,
      minActivities: 10,
      minPurchases: 1,
      minReferrals: 1,
      minFeedback: 2,
      daysActive: 7
    },
    benefits: [
      {
        id: 'early_access_products',
        name: 'Acesso Antecipado',
        description: 'Veja novos produtos 48h antes do lançamento',
        icon: '👀',
        type: 'early_access'
      },
      {
        id: 'exclusive_discount',
        name: 'Desconto Exclusivo',
        description: 'Desconto especial na loja',
        icon: '💰',
        type: 'discount',
        value: 10
      }
    ],
    exclusiveAccess: ['product_previews', 'monthly_newsletter'],
    priority: 1
  },
  {
    id: 'silver_vip',
    name: 'Influenciador',
    description: 'Sua opinião importa para a marca',
    icon: '🥈',
    color: 'from-gray-400 to-gray-600',
    requirements: {
      minTokens: 15000,
      minActivities: 25,
      minPurchases: 3,
      minReferrals: 3,
      minFeedback: 5,
      daysActive: 21
    },
    benefits: [
      {
        id: 'product_voting',
        name: 'Voto em Produtos',
        description: 'Vote em novos sabores e designs',
        icon: '🗳️',
        type: 'influence'
      },
      {
        id: 'exclusive_discount_silver',
        name: 'Desconto Prata',
        description: 'Desconto maior na loja',
        icon: '💎',
        type: 'discount',
        value: 15
      },
      {
        id: 'monthly_call',
        name: 'Call Mensal',
        description: 'Participe de calls exclusivas com a equipe',
        icon: '📞',
        type: 'exclusive'
      }
    ],
    exclusiveAccess: ['product_voting', 'design_feedback', 'monthly_calls'],
    priority: 2
  },
  {
    id: 'gold_vip',
    name: 'Co-Criador',
    description: 'Ajude a criar o futuro da FuseLabs',
    icon: '🥇',
    color: 'from-yellow-400 to-yellow-600',
    requirements: {
      minTokens: 35000,
      minActivities: 50,
      minPurchases: 5,
      minReferrals: 5,
      minFeedback: 10,
      daysActive: 45
    },
    benefits: [
      {
        id: 'product_creation',
        name: 'Criação de Produtos',
        description: 'Proponha e desenvolva novos produtos',
        icon: '🎨',
        type: 'influence'
      },
      {
        id: 'exclusive_discount_gold',
        name: 'Desconto Ouro',
        description: 'Desconto premium na loja',
        icon: '👑',
        type: 'discount',
        value: 25
      },
      {
        id: 'brand_ambassador',
        name: 'Embaixador da Marca',
        description: 'Represente a FuseLabs oficialmente',
        icon: '🌟',
        type: 'recognition'
      },
      {
        id: 'exclusive_products',
        name: 'Produtos Exclusivos',
        description: 'Acesso a produtos limitados',
        icon: '🎁',
        type: 'exclusive'
      }
    ],
    exclusiveAccess: ['product_creation', 'brand_decisions', 'exclusive_products', 'ambassador_program'],
    priority: 3
  },
  {
    id: 'diamond_vip',
    name: 'Fundador',
    description: 'Elite dos co-criadores FuseLabs',
    icon: '💎',
    color: 'from-blue-400 to-purple-600',
    requirements: {
      minTokens: 75000,
      minActivities: 100,
      minPurchases: 10,
      minReferrals: 10,
      minFeedback: 20,
      daysActive: 90
    },
    benefits: [
      {
        id: 'company_decisions',
        name: 'Decisões da Empresa',
        description: 'Influencie decisões estratégicas',
        icon: '🏛️',
        type: 'influence'
      },
      {
        id: 'lifetime_discount',
        name: 'Desconto Vitalício',
        description: 'Desconto máximo para sempre',
        icon: '♾️',
        type: 'discount',
        value: 50
      },
      {
        id: 'founder_recognition',
        name: 'Reconhecimento Fundador',
        description: 'Seu nome na história da FuseLabs',
        icon: '🏆',
        type: 'recognition'
      },
      {
        id: 'revenue_share',
        name: 'Participação nos Lucros',
        description: 'Receba parte dos lucros dos produtos que ajudou a criar',
        icon: '💰',
        type: 'exclusive'
      }
    ],
    exclusiveAccess: ['all_access', 'founder_board', 'revenue_sharing', 'legacy_recognition'],
    priority: 4
  }
];

// Projetos ativos para votação/colaboração
export const activeVIPProjects: VIPProject[] = [
  {
    id: 'new_flavor_creatine',
    name: 'Novo Sabor de Creatina',
    description: 'Escolha o próximo sabor da nossa creatina premium',
    type: 'flavor_choice',
    status: 'voting',
    votingEnds: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
    requiredTier: 'silver_vip',
    options: [
      {
        id: 'tropical',
        name: 'Tropical',
        description: 'Sabor refrescante de frutas tropicais',
        details: ['Manga', 'Maracujá', 'Coco', 'Sem açúcar']
      },
      {
        id: 'berry_blast',
        name: 'Berry Blast',
        description: 'Explosão de frutas vermelhas',
        details: ['Morango', 'Mirtilo', 'Framboesa', 'Antioxidantes naturais']
      },
      {
        id: 'citrus_power',
        name: 'Citrus Power',
        description: 'Energia cítrica para seus treinos',
        details: ['Laranja', 'Limão', 'Lima', 'Vitamina C extra']
      }
    ],
    currentVotes: {
      tropical: 15,
      berry_blast: 23,
      citrus_power: 12
    },
    totalVotes: 50
  },
  {
    id: 'bottle_design',
    name: 'Design da Nova Garrafa',
    description: 'Ajude a criar o design da nossa nova linha de garrafas',
    type: 'product_design',
    status: 'voting',
    votingEnds: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 dias
    requiredTier: 'gold_vip',
    options: [
      {
        id: 'minimalist',
        name: 'Minimalista',
        description: 'Design clean e elegante',
        details: ['Linhas simples', 'Logo discreto', 'Cores neutras', 'Foco na funcionalidade']
      },
      {
        id: 'sporty',
        name: 'Esportivo',
        description: 'Visual dinâmico e energético',
        details: ['Formas angulares', 'Cores vibrantes', 'Textura antiderrapante', 'Logo em destaque']
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Luxo e sofisticação',
        details: ['Acabamento metálico', 'Detalhes dourados', 'Formato ergonômico', 'Edição limitada']
      }
    ],
    currentVotes: {
      minimalist: 8,
      sporty: 12,
      premium: 6
    },
    totalVotes: 26
  },
  {
    id: 'app_feature',
    name: 'Próxima Funcionalidade do App',
    description: 'Que funcionalidade devemos desenvolver primeiro?',
    type: 'feature_request',
    status: 'voting',
    votingEnds: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
    requiredTier: 'bronze_vip',
    options: [
      {
        id: 'social_feed',
        name: 'Feed Social',
        description: 'Compartilhe atividades com outros usuários',
        details: ['Timeline de atividades', 'Curtidas e comentários', 'Desafios entre amigos', 'Ranking social']
      },
      {
        id: 'nutrition_tracker',
        name: 'Rastreador Nutricional',
        description: 'Acompanhe sua alimentação e suplementação',
        details: ['Log de refeições', 'Integração com suplementos', 'Metas nutricionais', 'Relatórios detalhados']
      },
      {
        id: 'workout_planner',
        name: 'Planejador de Treinos',
        description: 'Crie e siga planos de treino personalizados',
        details: ['Templates de treino', 'Progressão automática', 'Integração com atividades', 'Coach virtual']
      }
    ],
    currentVotes: {
      social_feed: 34,
      nutrition_tracker: 28,
      workout_planner: 31
    },
    totalVotes: 93
  }
];

export function calculateVIPTier(userStats: any): VIPTier | null {
  // Ordenar tiers por prioridade (maior primeiro)
  const sortedTiers = [...vipTiers].sort((a, b) => b.priority - a.priority);
  
  for (const tier of sortedTiers) {
    if (meetsRequirements(userStats, tier.requirements)) {
      return tier;
    }
  }
  
  return null;
}

function meetsRequirements(userStats: any, requirements: VIPTier['requirements']): boolean {
  return (
    userStats.totalTokens >= requirements.minTokens &&
    userStats.totalActivities >= requirements.minActivities &&
    userStats.totalPurchases >= requirements.minPurchases &&
    userStats.totalReferrals >= requirements.minReferrals &&
    userStats.totalFeedback >= requirements.minFeedback &&
    userStats.daysActive >= requirements.daysActive
  );
}

export function getNextTierProgress(userStats: any, currentTier: VIPTier | null): {
  nextTier: VIPTier | null;
  progress: { [key: string]: { current: number; required: number; percentage: number } };
} {
  const currentPriority = currentTier?.priority || 0;
  const nextTier = vipTiers.find(tier => tier.priority === currentPriority + 1) || null;
  
  if (!nextTier) {
    return { nextTier: null, progress: {} };
  }
  
  const progress = {
    tokens: {
      current: userStats.totalTokens,
      required: nextTier.requirements.minTokens,
      percentage: Math.min(100, (userStats.totalTokens / nextTier.requirements.minTokens) * 100)
    },
    activities: {
      current: userStats.totalActivities,
      required: nextTier.requirements.minActivities,
      percentage: Math.min(100, (userStats.totalActivities / nextTier.requirements.minActivities) * 100)
    },
    purchases: {
      current: userStats.totalPurchases,
      required: nextTier.requirements.minPurchases,
      percentage: Math.min(100, (userStats.totalPurchases / nextTier.requirements.minPurchases) * 100)
    },
    referrals: {
      current: userStats.totalReferrals,
      required: nextTier.requirements.minReferrals,
      percentage: Math.min(100, (userStats.totalReferrals / nextTier.requirements.minReferrals) * 100)
    },
    feedback: {
      current: userStats.totalFeedback,
      required: nextTier.requirements.minFeedback,
      percentage: Math.min(100, (userStats.totalFeedback / nextTier.requirements.minFeedback) * 100)
    },
    daysActive: {
      current: userStats.daysActive,
      required: nextTier.requirements.daysActive,
      percentage: Math.min(100, (userStats.daysActive / nextTier.requirements.daysActive) * 100)
    }
  };
  
  return { nextTier, progress };
}
