/**
 * Configurações globais para a API
 */

export interface ApiConfig {
  baseUrls: {
    activity: string;
    token: string;
    challenge: string;
    auth: string;
  };
  timeouts: {
    default: number;
    upload: number;
  };
  retries: number;
}

// Configuração padrão para ambientes
const configs: Record<string, ApiConfig> = {
  development: {
    baseUrls: {
      activity: process.env.NEXT_PUBLIC_ACTIVITY_API_URL || 'http://localhost:3001',
      token: process.env.NEXT_PUBLIC_TOKEN_API_URL || 'http://localhost:3003',
      challenge: process.env.NEXT_PUBLIC_CHALLENGE_API_URL || 'http://localhost:3005',
      auth: process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3000/api/auth',
    },
    timeouts: {
      default: 10000, // 10 segundos
      upload: 30000, // 30 segundos
    },
    retries: 3,
  },
  
  production: {
    baseUrls: {
      activity: process.env.NEXT_PUBLIC_ACTIVITY_API_URL || 'https://api.fuselabs.app/activity',
      token: process.env.NEXT_PUBLIC_TOKEN_API_URL || 'https://api.fuselabs.app/token',
      challenge: process.env.NEXT_PUBLIC_CHALLENGE_API_URL || 'https://api.fuselabs.app/challenge',
      auth: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://api.fuselabs.app/auth',
    },
    timeouts: {
      default: 8000, // 8 segundos
      upload: 60000, // 60 segundos
    },
    retries: 2,
  },
  
  test: {
    baseUrls: {
      activity: 'http://localhost:3001',
      token: 'http://localhost:3003',
      challenge: 'http://localhost:3005',
      auth: 'http://localhost:3000/api/auth',
    },
    timeouts: {
      default: 1000, // 1 segundo
      upload: 5000, // 5 segundos
    },
    retries: 0,
  },
};

// Determinar ambiente atual
const environment = process.env.NODE_ENV || 'development';

// Exportar a configuração do ambiente atual
export const apiConfig: ApiConfig = configs[environment] || configs.development; 