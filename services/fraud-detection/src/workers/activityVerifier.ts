import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { ActivityStatus, PhysicalActivity, ActivityType, ActivitySource } from '@fuseapp/types';
import { createActivityFraudDetector } from '../services/activityFraudDetector';
import { StravaActivity as DetectorStravaActivitySchema, FraudCheckResult } from '../models/schemas';
import { v4 as uuidv4 } from 'uuid';

const FRAUD_DETECTION_QUEUE = 'fraud_detection_queue';
const ACTIVITY_VALIDATION_RESULTS_QUEUE = 'activity:validation_results';
const POLLING_INTERVAL_SECONDS = 1;

interface FraudQueueMessage {
  activityData: PhysicalActivity;
  correlationId?: string;
}

interface ValidationResultMessage {
  originalActivityId: string;
  validatedActivity: PhysicalActivity;
  fraudCheckResultData: FraudCheckResult;
  correlationId?: string;
}

function mapToDetectorActivity(pa: PhysicalActivity, serverLog: FastifyInstance['log']): DetectorStravaActivitySchema {
  if (pa.source !== 'strava') {
    serverLog.warn({ activityId: pa.id, source: pa.source }, 'ActivityFraudDetector: Recebida atividade não-Strava para mapeamento. Detector pode não ser ideal.');
  }
  return {
    id: pa.id,
    userId: pa.userId,
    source: 'strava',
    externalId: pa.stravaId || pa.id,
    type: pa.type as ActivityType,
    name: `Atividade ${pa.type} de ${pa.userId}`,
    distance: pa.distance,
    duration: pa.duration,
    startDate: new Date(pa.createdAt).toISOString(),
    metadata: {},
  };
}

export async function startActivityVerifier(
  server: FastifyInstance,
  redis: Redis
): Promise<void> {
  server.log.info(`Iniciando verificador de atividades da fila: ${FRAUD_DETECTION_QUEUE}`);
  const activityFraudDetector = createActivityFraudDetector(server);
  let keepPolling = true;

  async function processMessage(message: FraudQueueMessage) {
    const { activityData, correlationId: incomingCorrelationId } = message;
    const jobCorrelationId = incomingCorrelationId || uuidv4();

    server.log.info({ activityId: activityData.id, userId: activityData.userId, correlationId: jobCorrelationId }, 'Processando atividade para detecção de fraude.');

    try {
      const detectorActivityInput = mapToDetectorActivity(activityData, server.log);
      const fraudResult: FraudCheckResult = await activityFraudDetector.detectFraud(detectorActivityInput);
      let finalStatus: ActivityStatus;
      let finalPoints = activityData.points;

      if (!fraudResult.isValid) {
        finalStatus = ActivityStatus.REJECTED;
        finalPoints = 0;
        server.log.warn(
          {
            activityId: activityData.id,
            userId: activityData.userId,
            fraudScore: fraudResult.fraudScore,
            reasons: fraudResult.reasons,
            correlationId: jobCorrelationId
          },
          'Atividade REJEITADA por fraude.'
        );
      } else if (fraudResult.fraudScore > 30) {
        finalStatus = ActivityStatus.FLAGGED;
        server.log.info(
          {
            activityId: activityData.id,
            userId: activityData.userId,
            fraudScore: fraudResult.fraudScore,
            reasons: fraudResult.reasons,
            correlationId: jobCorrelationId
          },
          'Atividade MARCADA para revisão (score suspeito).'
        );
      } else {
        finalStatus = ActivityStatus.VERIFIED;
        server.log.info(
          {
            activityId: activityData.id,
            userId: activityData.userId,
            fraudScore: fraudResult.fraudScore,
            correlationId: jobCorrelationId
          },
          'Atividade VERIFICADA com sucesso (score baixo).'
        );
      }

      const validatedActivity: PhysicalActivity = {
        ...activityData,
        status: finalStatus,
        points: finalPoints,
      };

      const resultMessage: ValidationResultMessage = {
        originalActivityId: activityData.id,
        validatedActivity,
        fraudCheckResultData: fraudResult,
        correlationId: jobCorrelationId
      };

      await redis.rpush(ACTIVITY_VALIDATION_RESULTS_QUEUE, JSON.stringify(resultMessage));
      server.log.info(
        {
          activityId: validatedActivity.id,
          newStatus: validatedActivity.status,
          userId: validatedActivity.userId,
          queue: ACTIVITY_VALIDATION_RESULTS_QUEUE,
          correlationId: jobCorrelationId
        },
        'Resultado da validação de atividade enfileirado.'
      );
    } catch (error: any) {
      server.log.error(
        {
          error: error.message,
          stack: error.stack,
          activityId: activityData.id,
          correlationId: jobCorrelationId
        },
        'Erro ao processar detecção de fraude para atividade.'
      );
    }
  }

  async function pollQueue() {
    while (keepPolling) {
      try {
        const result = await redis.blpop(FRAUD_DETECTION_QUEUE, POLLING_INTERVAL_SECONDS);

        if (result && result.length === 2) {
          const rawMessage = result[1];
          const message: FraudQueueMessage = JSON.parse(rawMessage);
          await processMessage(message);
        }
      } catch (error: any) {
        server.log.error({ error: error.message, stack: error.stack, queue: FRAUD_DETECTION_QUEUE }, `Erro ao consumir da fila ${FRAUD_DETECTION_QUEUE}. Tentando novamente em ${POLLING_INTERVAL_SECONDS * 2}s.`);
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_SECONDS * 2000));
      }
    }
    server.log.info('Verificador de atividades parado.');
  }

  pollQueue().catch(err => server.log.fatal({error: err}, "Erro fatal no loop do ActivityVerifier"));

  function shutdown() {
    keepPolling = false;
    server.log.info('Sinal de desligamento recebido, parando o ActivityVerifier...');
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}