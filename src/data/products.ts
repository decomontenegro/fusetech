export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Preço real em R$
  tokens: number; // Custo em tokens
  category: 'bronze' | 'prata' | 'ouro' | 'diamante';
  image: string;
  inStock: boolean;
  featured: boolean;
  activityType?: string[]; // Tipos de atividade relacionados
  benefits: string[];
}

export const products: Product[] = [
  // TIER BRONZE (1000-3000 tokens)
  {
    id: 'mixer-fuselabs',
    name: 'Mixer FuseLabs',
    description: 'Mixer oficial para seus suplementos',
    price: 19.90,
    tokens: 2000,
    category: 'bronze',
    image: '/products/mixer.jpg',
    inStock: true,
    featured: false,
    activityType: ['all'],
    benefits: ['Praticidade', 'Design exclusivo', 'Durabilidade']
  },
  {
    id: 'meia-foguinho',
    name: 'Meia Foguinho - 100% Algodão',
    description: 'Meia esportiva confortável para seus treinos',
    price: 24.90,
    tokens: 2500,
    category: 'bronze',
    image: '/products/meia.jpg',
    inStock: true,
    featured: true,
    activityType: ['running', 'cycling', 'walking'],
    benefits: ['100% Algodão', 'Conforto', 'Respirabilidade']
  },

  // TIER PRATA (3000-7000 tokens)
  {
    id: 'bone-runner',
    name: 'Boné Runner RapidFuse',
    description: 'Boné esportivo para proteção solar durante atividades',
    price: 59.90,
    tokens: 6000,
    category: 'prata',
    image: '/products/bone.jpg',
    inStock: true,
    featured: true,
    activityType: ['running', 'cycling', 'outdoor'],
    benefits: ['Proteção UV', 'Respirável', 'Design esportivo']
  },
  {
    id: 'vitamin-fuse',
    name: 'Vitamin Fuse 60 Cápsulas',
    description: 'Complexo vitamínico para energia e performance',
    price: 89.00,
    tokens: 8900,
    category: 'prata',
    image: '/products/vitamin-fuse.jpg',
    inStock: true,
    featured: true,
    activityType: ['all'],
    benefits: ['Energia', 'Imunidade', 'Performance']
  },
  {
    id: 'rapid-beauty',
    name: 'Rapid Beauty 60 Cápsulas',
    description: 'Vitaminas para cabelo, pele e unhas',
    price: 99.00,
    tokens: 9900,
    category: 'prata',
    image: '/products/rapid-beauty.jpg',
    inStock: true,
    featured: true,
    activityType: ['yoga', 'pilates', 'wellness'],
    benefits: ['Beleza', 'Cabelo forte', 'Pele saudável']
  },

  // TIER OURO (7000-15000 tokens)
  {
    id: 'rapid-osteo',
    name: 'Rapid Osteo Regeneration 90 Cápsulas',
    description: 'Suplemento para saúde óssea e articular',
    price: 109.00,
    tokens: 10900,
    category: 'ouro',
    image: '/products/rapid-osteo.jpg',
    inStock: true,
    featured: true,
    activityType: ['running', 'weightlifting', 'cycling'],
    benefits: ['Saúde óssea', 'Articulações', 'Recuperação']
  },
  {
    id: 'creatina',
    name: 'Creatina 350g - Suplemento Alimentar',
    description: 'Creatina pura para força e performance',
    price: 119.00,
    tokens: 11900,
    category: 'ouro',
    image: '/products/creatina.jpg',
    inStock: true,
    featured: true,
    activityType: ['weightlifting', 'hiit', 'crossfit'],
    benefits: ['Força', 'Potência', 'Massa muscular']
  },
  {
    id: 'rapid-sleep',
    name: 'Rapid Sleep 60 Cápsulas',
    description: 'Suplemento para melhor qualidade do sono',
    price: 119.00,
    tokens: 11900,
    category: 'ouro',
    image: '/products/rapid-sleep.jpg',
    inStock: true,
    featured: false,
    activityType: ['all'],
    benefits: ['Sono reparador', 'Recuperação', 'Relaxamento']
  },

  // TIER DIAMANTE (15000+ tokens)
  {
    id: 'rapid-rage',
    name: 'RapidRage Pre Workout 300g',
    description: 'Pré-treino para máxima performance',
    price: 159.00,
    tokens: 15900,
    category: 'diamante',
    image: '/products/rapid-rage.jpg',
    inStock: true,
    featured: true,
    activityType: ['weightlifting', 'hiit', 'crossfit'],
    benefits: ['Energia explosiva', 'Foco', 'Resistência']
  },
  {
    id: 'combo-completo',
    name: 'Combo Rapid Fuse + Sleep + Vitamin',
    description: 'Kit completo para performance e recuperação',
    price: 289.00,
    tokens: 28900,
    category: 'diamante',
    image: '/products/combo.jpg',
    inStock: true,
    featured: true,
    activityType: ['all'],
    benefits: ['Kit completo', 'Economia', 'Performance total']
  },
  {
    id: 'beta-exclusive',
    name: 'Kit Exclusivo Beta Tester',
    description: 'Produtos exclusivos para beta testers',
    price: 500.00,
    tokens: 50000,
    category: 'diamante',
    image: '/products/beta-kit.jpg',
    inStock: true,
    featured: true,
    activityType: ['all'],
    benefits: ['Exclusividade', 'Edição limitada', 'Status VIP']
  }
];

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.category === category);
};

export const getFeaturedProducts = () => {
  return products.filter(product => product.featured);
};

export const getProductsByActivity = (activityType: string) => {
  return products.filter(product => 
    product.activityType?.includes(activityType) || 
    product.activityType?.includes('all')
  );
};
