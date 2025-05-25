import { 
  ActivityType,
  PhysicalActivity,
  UserRank, 
  TokenTransactionType 
} from '@fuseapp/types';

// Exportação de formatadores de data/hora
export * from './formatters/date';

// Exportação de validações
// export * from './validations/schema';

// Exportação de helpers
export * from './helpers/string';
// export * from './helpers/array';
// export * from './helpers/object';

/**
 * Formata uma distância de metros para km com 2 casas decimais
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  
  const km = meters / 1000;
  return `${km.toFixed(2)}km`;
}

/**
 * Formata um tempo em segundos para formato hora:minuto:segundo
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${remainingSeconds}s`;
}

/**
 * Calcula pontos para uma atividade com base no tipo, distância e duração
 */
export function calculateActivityPoints(activity: PhysicalActivity): number {
  const { type, distance = 0, duration = 0 } = activity;
  
  // Pontos base por km
  const pointsPerKm = {
    [ActivityType.RUN]: 10,
    [ActivityType.CYCLE]: 5,
    [ActivityType.WALK]: 3,
    [ActivityType.OTHER]: 2,
  };
  
  // Cálculo base: pontos por km * distância em km
  const basePoints = (distance / 1000) * (pointsPerKm[type] || 2);
  
  // Bônus por duração (para atividades longas)
  let durationBonus = 0;
  if (duration > 3600) { // mais de 1h
    durationBonus = Math.floor((duration / 3600) * 5); // 5 pontos extra por hora
  }
  
  return Math.floor(basePoints + durationBonus);
}

/**
 * Determina o rank do usuário com base nos pontos
 */
export function getUserRankByPoints(totalPoints: number): UserRank {
  if (totalPoints >= 10000) {
    return UserRank.PLATINUM;
  } else if (totalPoints >= 5000) {
    return UserRank.GOLD;
  } else if (totalPoints >= 1000) {
    return UserRank.SILVER;
  } else {
    return UserRank.BRONZE;
  }
}

/**
 * Retorna informações sobre o próximo rank
 */
export function getNextRankInfo(totalPoints: number): { 
  nextRank: UserRank | null; 
  pointsToNextRank: number;
  progress: number;
} {
  const currentRank = getUserRankByPoints(totalPoints);
  
  switch (currentRank) {
    case UserRank.BRONZE:
      return {
        nextRank: UserRank.SILVER,
        pointsToNextRank: 1000 - totalPoints,
        progress: (totalPoints / 1000) * 100,
      };
    case UserRank.SILVER:
      return {
        nextRank: UserRank.GOLD,
        pointsToNextRank: 5000 - totalPoints,
        progress: ((totalPoints - 1000) / 4000) * 100,
      };
    case UserRank.GOLD:
      return {
        nextRank: UserRank.PLATINUM,
        pointsToNextRank: 10000 - totalPoints,
        progress: ((totalPoints - 5000) / 5000) * 100,
      };
    case UserRank.PLATINUM:
      return {
        nextRank: null,
        pointsToNextRank: 0,
        progress: 100,
      };
    default:
      return {
        nextRank: UserRank.BRONZE,
        pointsToNextRank: 0,
        progress: 0,
      };
  }
}

/**
 * Obtém o nome amigável de um tipo de transação
 */
export function getTransactionTypeName(type: TokenTransactionType): string {
  const typeNames: Record<string, string> = {
    [TokenTransactionType.REWARD]: 'Ganho',
    [TokenTransactionType.BURN]: 'Resgate',
    [TokenTransactionType.TRANSFER]: 'Transferência',
    [TokenTransactionType.DEPOSIT]: 'Depósito',
    [TokenTransactionType.WITHDRAW]: 'Saque'
  };
  
  return typeNames[type] || 'Desconhecido';
}

/**
 * Obtém o nome amigável de um tipo de atividade
 */
export function getActivityTypeName(type: ActivityType): string {
  const typeNames: Record<string, string> = {
    [ActivityType.RUN]: 'Corrida',
    [ActivityType.CYCLE]: 'Ciclismo',
    [ActivityType.WALK]: 'Caminhada',
    [ActivityType.SOCIAL_POST]: 'Post Social',
    [ActivityType.OTHER]: 'Outro',
  };
  
  return typeNames[type] || 'Desconhecido';
} 