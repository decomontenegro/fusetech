// Interface para atividade do Strava
export interface StravaActivity {
  id: number;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  start_date_local: string;
  timezone: string;
  average_speed: number;
  max_speed: number;
  // Outros campos relevantes aqui
}

// Função para calcular pontos com base na atividade
export function calculatePoints(activity: StravaActivity): number {
  // Implementação simplificada - adicionar lógica de negócio aqui
  // Por exemplo: pontos por km para corrida, pontos por hora para ciclismo, etc.
  
  const { type, distance } = activity;
  
  // Base: 10 pontos por km para corrida, 5 pontos por km para ciclismo
  if (type === 'Run') {
    return Math.floor((distance / 1000) * 10);
  } else if (type === 'Ride') {
    return Math.floor((distance / 1000) * 5);
  } else {
    // Outros tipos de atividade: 3 pontos por km
    return Math.floor((distance / 1000) * 3);
  }
} 