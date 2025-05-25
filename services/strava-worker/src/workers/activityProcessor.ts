import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { StravaWebhookEvent, StravaActivity } from '../models/StravaWebhookEvent';
import { ActivityType, ActivityStatus, ActivitySource, PhysicalActivity } from '@fuseapp/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Inicia o processador de atividades Strava
 */
export function startActivityProcessor(
  server: FastifyInstance,
  redis: Redis,
  stravaClient: any
) {
  // Intervalo para verificação de novos eventos (em ms)
  const POLLING_INTERVAL = parseInt(process.env.STRAVA_POLLING_INTERVAL || '5000', 10);

  // Função para processar uma atividade
  async function processActivity(event: StravaWebhookEvent) {
    try {
      server.log.info({ activityId: event.object_id }, 'Processando atividade Strava');

      // Buscar detalhes da atividade na API do Strava
      const activityDetails = await stravaClient.activities.get({
        id: event.object_id,
        include_all_efforts: false
      }) as StravaActivity;

      // Mapear tipo de atividade
      let activityType: ActivityType;
      switch (activityDetails.type.toLowerCase()) {
        case 'run':
          activityType = ActivityType.RUN;
          break;
        case 'walk':
          activityType = ActivityType.WALK;
          break;
        case 'ride':
        case 'virtualride':
          activityType = ActivityType.CYCLE;
          break;
        default:
          // Se não for uma atividade compatível, ignorar
          server.log.info(
            { activityType: activityDetails.type },
            'Atividade não suportada, ignorando'
          );
          return;
      }

      // Calcular pontos com base na distância e tipo de atividade
      let pointsPerKm = 0;
      switch (activityType) {
        case ActivityType.RUN:
          pointsPerKm = 10; // 10 pontos por km para corridas
          break;
        case ActivityType.WALK:
          pointsPerKm = 5; // 5 pontos por km para caminhadas
          break;
        case ActivityType.CYCLE:
          pointsPerKm = 3; // 3 pontos por km para pedaladas
          break;
        default:
          pointsPerKm = 2; // 2 pontos por km para outras atividades
      }

      // Calcular pontos totais (distância em km * pontos por km)
      const distanceKm = activityDetails.distance / 1000;
      const points = Math.floor(distanceKm * pointsPerKm);

      // Buscar o usuário associado ao atleta do Strava
      // Em produção, isso seria uma consulta ao banco de dados
      const connectionKey = `strava:connection:*`;
      const connectionKeys = await redis.keys(connectionKey);
      let userId = null;

      for (const key of connectionKeys) {
        const connectionData = await redis.get(key);
        if (!connectionData) continue;

        const connection = JSON.parse(connectionData);
        if (connection.stravaId === event.owner_id) {
          userId = connection.userId;
          break;
        }
      }

      // Se não encontrou usuário, não podemos processar
      if (!userId) {
        server.log.warn(
          { stravaAthleteId: event.owner_id, activityId: event.object_id },
          'Não foi possível encontrar usuário para atividade do Strava'
        );
        return;
      }

      // Criar objeto de atividade
      const activity: PhysicalActivity = {
        id: uuidv4(),
        userId,
        type: activityType,
        distance: activityDetails.distance,
        duration: activityDetails.moving_time,
        points,
        status: ActivityStatus.PENDING,
        tokenized: false,
        stravaId: event.object_id.toString(),
        source: 'strava',
        createdAt: new Date()
      };

      // Enviar para fila de validação antifraude
      await redis.rpush('fraud:check', JSON.stringify({
        source: 'strava',
        activityId: activity.id,
        data: activity
      }));

      // Salvar na fila de atividades pendentes
      await redis.rpush('activities:pending', JSON.stringify(activity));

      server.log.info(
        { activityId: activity.id, points },
        'Atividade Strava processada com sucesso'
      );
    } catch (error) {
      server.log.error(
        { error, activityId: event.object_id },
        'Erro ao processar atividade Strava'
      );
    }
  }

  // Função para verificar e processar novos eventos
  async function pollEvents() {
    try {
      // Obter novo evento da fila
      const result = await redis.lpop('strava:events');

      if (result) {
        const event: StravaWebhookEvent = JSON.parse(result);
        await processActivity(event);
      }
    } catch (error) {
      server.log.error({ error }, 'Erro ao verificar eventos Strava');
    } finally {
      // Agendar próxima verificação
      setTimeout(pollEvents, POLLING_INTERVAL);
    }
  }

  // Iniciar o processador
  server.log.info('Iniciando processador de atividades Strava');
  pollEvents();

  // Opcional: Escutar por notificações para processamento imediato
  const pubsub = redis.duplicate();
  pubsub.subscribe('strava:notifications', (err) => {
    if (err) {
      server.log.error({ error: err }, 'Erro ao assinar canal de notificações Strava');
      return;
    }

    server.log.info('Assinado no canal de notificações Strava');
  });

  pubsub.on('message', (channel, message) => {
    if (channel === 'strava:notifications' && message === 'new_event') {
      // Processar imediatamente quando receber uma notificação
      pollEvents();
    }
  });

  // Retornar função para parar o processador se necessário
  return {
    stop: () => {
      pubsub.unsubscribe('strava:notifications');
      pubsub.quit();
    }
  };
}