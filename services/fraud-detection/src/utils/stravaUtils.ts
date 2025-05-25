import { ActivityType } from '@fuseapp/types';

// Mapear tipos de atividade do Strava para tipos internos
export function mapStravaType(stravaType: string): ActivityType {
  switch (stravaType?.toLowerCase()) {
    case 'run':
    case 'running':
      return ActivityType.RUN;
    case 'ride':
    case 'cycling':
      return ActivityType.RIDE;
    case 'swim':
    case 'swimming':
      return ActivityType.SWIM;
    case 'walk':
    case 'walking':
      return ActivityType.WALK;
    case 'hike':
    case 'hiking':
      return ActivityType.HIKE;
    default:
      return ActivityType.OTHER;
  }
} 