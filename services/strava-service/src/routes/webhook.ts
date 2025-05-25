import { Router, Request, Response } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';

interface StravaWebhookEvent {
  object_type: 'activity' | 'athlete';
  object_id: number;
  aspect_type: 'create' | 'update' | 'delete';
  owner_id: number;
  subscription_id: number;
  event_time: number;
  updates?: Record<string, any>;
}

/**
 * Rotas para webhook do Strava
 */
export function webhookRoutes(supabase: SupabaseClient, strava: any) {
  const router = Router();

  /**
   * Endpoint para validação do webhook pelo Strava
   * Responde ao desafio de verificação
   */
  router.get('/', (req: Request, res: Response) => {
    const { 
      'hub.mode': mode, 
      'hub.verify_token': token, 
      'hub.challenge': challenge 
    } = req.query;
    
    if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
      console.log('Webhook verificado com sucesso');
      return res.json({ 'hub.challenge': challenge });
    }
    
    console.error('Falha na verificação do webhook:', { mode, token });
    return res.status(403).json({ error: 'Verificação inválida' });
  });

  /**
   * Endpoint para receber eventos do webhook
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const event = req.body as StravaWebhookEvent;
      
      // Logar evento para depuração
      console.log('Evento Strava recebido:', event);
      
      // Responder imediatamente para o Strava (para evitar timeout)
      res.status(200).json({ status: 'evento recebido' });
      
      // Processar o evento de forma assíncrona
      processEvent(event, supabase, strava).catch(error => {
        console.error('Erro ao processar evento Strava:', error);
      });
    } catch (error) {
      console.error('Erro ao receber webhook:', error);
      // Mesmo em caso de erro, responder 200 para o Strava
      res.status(200).json({ status: 'erro no processamento' });
    }
  });

  return router;
}

/**
 * Processa um evento do webhook
 */
async function processEvent(
  event: StravaWebhookEvent, 
  supabase: SupabaseClient, 
  strava: any
) {
  // Apenas processar eventos de criação ou atualização de atividades
  if (event.object_type !== 'activity' || event.aspect_type === 'delete') {
    console.log('Evento ignorado:', event.object_type, event.aspect_type);
    return;
  }
  
  try {
    // Buscar atleta relacionado ao evento
    const { data: integration, error: integrationError } = await supabase
      .from('strava_integrations')
      .select('user_id, access_token, refresh_token, expires_at')
      .eq('strava_athlete_id', event.owner_id)
      .single();
    
    if (integrationError || !integration) {
      console.error('Integração não encontrada para o atleta:', event.owner_id);
      return;
    }
    
    // Verificar se o token de acesso expirou e renová-lo se necessário
    const now = Math.floor(Date.now() / 1000); // timestamp atual em segundos
    const tokenExpiry = Math.floor(new Date(integration.expires_at).getTime() / 1000);
    
    let accessToken = integration.access_token;
    
    if (tokenExpiry <= now) {
      console.log('Token expirado, renovando...');
      try {
        const refreshResponse = await strava.oauth.refreshToken(integration.refresh_token);
        
        // Atualizar tokens na base de dados
        const { error: updateError } = await supabase
          .from('strava_integrations')
          .update({
            access_token: refreshResponse.access_token,
            refresh_token: refreshResponse.refresh_token,
            expires_at: new Date(refreshResponse.expires_at * 1000).toISOString()
          })
          .eq('strava_athlete_id', event.owner_id);
        
        if (updateError) {
          console.error('Erro ao atualizar tokens:', updateError);
          return;
        }
        
        accessToken = refreshResponse.access_token;
      } catch (refreshError) {
        console.error('Erro ao renovar token:', refreshError);
        return;
      }
    }
    
    // Obter detalhes da atividade
    const activityDetails = await strava.activities.get({
      id: event.object_id,
      access_token: accessToken
    });
    
    // Ignorar atividades privadas (se configurado)
    if (activityDetails.private && process.env.IGNORE_PRIVATE_ACTIVITIES === 'true') {
      console.log('Atividade privada ignorada:', event.object_id);
      return;
    }
    
    // Mapear tipo de atividade
    let activityType = mapActivityType(activityDetails.type);
    
    // Se não for um tipo suportado, ignorar
    if (!activityType) {
      console.log('Tipo de atividade não suportado:', activityDetails.type);
      return;
    }
    
    // Calcular pontos baseados na distância, duração e tipo
    const points = calculatePoints(activityDetails);
    
    // Inserir/atualizar atividade no banco de dados
    const { error: activityError } = await supabase
      .from('activities')
      .upsert({
        id: `strava_${event.object_id}`,
        user_id: integration.user_id,
        source: 'strava',
        source_id: event.object_id.toString(),
        type: activityType,
        distance: activityDetails.distance,
        duration: activityDetails.moving_time,
        start_date: activityDetails.start_date,
        points: points,
        status: 'pending', // Pendente de verificação/tokenização
        tokenized: false,
        raw_data: activityDetails,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (activityError) {
      console.error('Erro ao salvar atividade:', activityError);
      return;
    }
    
    console.log('Atividade processada com sucesso:', event.object_id);
    
    // Notificar serviço de verificação para processar a nova atividade
    try {
      await fetch(`${process.env.VERIFICATION_SERVICE_URL}/api/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_id: `strava_${event.object_id}`,
          source: 'strava'
        })
      });
    } catch (notifyError) {
      console.error('Erro ao notificar serviço de verificação:', notifyError);
    }
  } catch (error) {
    console.error('Erro ao processar atividade:', error);
  }
}

/**
 * Mapeia o tipo de atividade do Strava para o formato interno
 */
function mapActivityType(stravaType: string): string | null {
  const typeMap: Record<string, string> = {
    'Run': 'run',
    'VirtualRun': 'run',
    'TrailRun': 'run',
    'Walk': 'walk',
    'Hike': 'walk',
    'Ride': 'cycle',
    'VirtualRide': 'cycle',
    'MountainBikeRide': 'cycle',
    'EBikeRide': 'cycle'
  };
  
  return typeMap[stravaType] || null;
}

/**
 * Calcula pontos para uma atividade
 */
function calculatePoints(activity: any): number {
  // Algoritmo básico de pontuação: 1 ponto a cada 100m
  // Pode ser ajustado conforme regras de negócio
  let points = Math.floor(activity.distance / 100);
  
  // Bônus por duração longa (mais de 1h)
  if (activity.moving_time > 3600) {
    points += 10;
  }
  
  // Bônus por elevação (cada 100m de ganho)
  if (activity.total_elevation_gain) {
    points += Math.floor(activity.total_elevation_gain / 100) * 5;
  }
  
  return points;
} 