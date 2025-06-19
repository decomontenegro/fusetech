import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Verificar se usuário está autenticado
    const cookieStore = cookies();
    const userCookie = cookieStore.get('fusetech_user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userData = JSON.parse(userCookie.value);
    const accessToken = userData.access_token;

    // Buscar atividades do Strava
    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=20',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!activitiesResponse.ok) {
      if (activitiesResponse.status === 401) {
        return NextResponse.json({ error: 'Token expired' }, { status: 401 });
      }
      throw new Error('Failed to fetch activities');
    }

    const activities = await activitiesResponse.json();

    // Processar atividades e calcular tokens
    const processedActivities = activities.map((activity: any) => {
      const tokens = calculateTokens(activity);
      
      return {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        distance: Math.round(activity.distance), // metros
        duration: activity.moving_time, // segundos
        date: activity.start_date,
        tokens: tokens,
        calories: activity.kilojoules ? Math.round(activity.kilojoules * 0.239) : null,
        averageSpeed: activity.average_speed,
        elevationGain: activity.total_elevation_gain,
      };
    });

    return NextResponse.json({
      activities: processedActivities,
      totalTokens: processedActivities.reduce((sum, act) => sum + act.tokens, 0),
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateTokens(activity: any): number {
  const { type, distance, moving_time } = activity;
  
  // Fórmula básica: 1 token por 100 metros
  let baseTokens = Math.floor(distance / 100);
  
  // Multiplicadores por tipo de atividade
  const multipliers: { [key: string]: number } = {
    'Run': 1.0,
    'Ride': 0.3,      // Ciclismo é mais fácil
    'Walk': 0.8,      // Caminhada vale menos
    'Swim': 1.5,      // Natação vale mais
    'Hike': 0.9,      // Trilha
    'VirtualRide': 0.25, // Bike indoor
    'VirtualRun': 0.9,   // Esteira
  };
  
  const multiplier = multipliers[type] || 0.5;
  
  // Bônus por duração (atividades mais longas ganham bônus)
  let durationBonus = 1.0;
  if (moving_time > 3600) { // Mais de 1 hora
    durationBonus = 1.2;
  } else if (moving_time > 1800) { // Mais de 30 min
    durationBonus = 1.1;
  }
  
  // Mínimo de 1 token por atividade válida
  const finalTokens = Math.max(1, Math.floor(baseTokens * multiplier * durationBonus));
  
  return finalTokens;
}
