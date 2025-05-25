import { FastifyInstance } from 'fastify'; // Assumindo que o gamification-service usa Fastify
import Redis from 'ioredis';
import { ActivityStatus, PhysicalActivity } from '@fuseapp/types';
// import { FraudCheckResult } from '../../fraud-detection/src/models/schemas'; // Removida importação direta
import { v4 as uuidv4 } from 'uuid';
// import axios from 'axios'; // Para chamadas HTTP reais no futuro

const ACTIVITY_VALIDATION_RESULTS_QUEUE = 'activity:validation_results';
const TOKEN_SERVICE_API_URL = process.env.TOKEN_SERVICE_URL || 'http://localhost:3003/api/token/mint'; // URL do token-service
const POLLING_INTERVAL_SECONDS = 1;

// Definição local simplificada para desacoplamento temporário
interface SimplifiedFraudCheckResult {
  isValid: boolean;
  fraudScore: number;
  reasons: string[];
}

interface ValidationResultMessage {
  originalActivityId: string;
  validatedActivity: PhysicalActivity;
  fraudCheckResultData: SimplifiedFraudCheckResult; // Usar tipo local
  correlationId?: string;
}

export async function startRewardProcessor(
  server: FastifyInstance, // Instância do Fastify do gamification-service
  redis: Redis
): Promise<void> {
  server.log.info(`Iniciando processador de recompensas da fila: ${ACTIVITY_VALIDATION_RESULTS_QUEUE}`);
  let keepPolling = true;

  async function processRewardableActivity(message: ValidationResultMessage) {
    const { validatedActivity, fraudCheckResultData, correlationId: incomingCorrelationId } = message;
    const jobCorrelationId = incomingCorrelationId || uuidv4();

    server.log.info(
      { activityId: validatedActivity.id, userId: validatedActivity.userId, status: validatedActivity.status, correlationId: jobCorrelationId },
      'Processando atividade validada para possível recompensa.'
    );

    if (validatedActivity.status !== ActivityStatus.VERIFIED) {
      server.log.info(
        { activityId: validatedActivity.id, status: validatedActivity.status, correlationId: jobCorrelationId },
        'Atividade não está VERIFIED, recompensa não aplicável.'
      );
      return;
    }

    if (validatedActivity.tokenized) {
      server.log.info(
        { activityId: validatedActivity.id, correlationId: jobCorrelationId },
        'Atividade já tokenizada, pulando.'
      );
      return;
    }

    try {
      const userWalletAddress = `0xWALLET_ADDRESS_FOR_${validatedActivity.userId.replace(/[^a-zA-Z0-9]/g, '_')}`.substring(0, 42);
      server.log.info(
        { userId: validatedActivity.userId, walletAddress: userWalletAddress, correlationId: jobCorrelationId },
        'Endereço da carteira do usuário (simulado).');

      if (!userWalletAddress) {
        server.log.warn(
          { userId: validatedActivity.userId, activityId: validatedActivity.id, correlationId: jobCorrelationId },
          'Usuário não possui endereço de carteira registrado. Não é possível recompensar.'
        );
        return;
      }

      const tokensToAward = validatedActivity.points;
      if (tokensToAward <= 0) {
        server.log.info(
          { activityId: validatedActivity.id, points: tokensToAward, correlationId: jobCorrelationId },
          'Atividade tem 0 ou menos pontos, nenhuma recompensa em token a ser concedida.'
        );
        return;
      }

      const mintRequestPayload = {
        userId: validatedActivity.userId,
        address: userWalletAddress,
        amount: tokensToAward,
        reason: `Recompensa pela atividade validada ID: ${validatedActivity.id}`,
        metadata: {
          activityId: validatedActivity.id,
          source: validatedActivity.source,
          correlationId: jobCorrelationId,
          fraudScore: fraudCheckResultData.fraudScore, // Acessar do tipo local
        }
      };

      server.log.info(
        { payload: mintRequestPayload, url: TOKEN_SERVICE_API_URL, correlationId: jobCorrelationId },
        'SIMULANDO chamada POST para token-service/mint...'
      );
      
      const simulatedTransactionId = `sim_tx_${uuidv4()}`;
      server.log.info(
        { activityId: validatedActivity.id, transactionId: simulatedTransactionId, status: 'pending', correlationId: jobCorrelationId },
        'Token minting request enviado ao token-service (simulado).');

      server.log.info(
        { activityId: validatedActivity.id, userId: validatedActivity.userId, tokensAwarded: tokensToAward, transactionId: simulatedTransactionId, correlationId: jobCorrelationId },
        'Atividade marcada como tokenização pendente (simulado).');

    } catch (error: any) {
      server.log.error({
        error: error.message, stack: error.stack, activityId: validatedActivity.id,
        correlationId: jobCorrelationId }, 'Erro ao processar recompensa para atividade.');
    }
  }

  async function pollQueue() {
    while (keepPolling) {
      try {
        const result = await redis.blpop(ACTIVITY_VALIDATION_RESULTS_QUEUE, POLLING_INTERVAL_SECONDS);
        if (result && result.length === 2) {
          const rawMessage = result[1];
          const message: ValidationResultMessage = JSON.parse(rawMessage);
          await processRewardableActivity(message);
        } 
      } catch (error: any) {
        server.log.error({ error: error.message, stack: error.stack, queue: ACTIVITY_VALIDATION_RESULTS_QUEUE }, `Erro ao consumir da fila. Tentando novamente em ${POLLING_INTERVAL_SECONDS * 2}s.`);
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_SECONDS * 2000)); 
      }
    }
    server.log.info('Processador de recompensas parado.');
  }

  pollQueue().catch(err => server.log.fatal({error: err}, "Erro fatal no loop do RewardProcessor"));
  
  function shutdown() {
    keepPolling = false;
    server.log.info('Sinal de desligamento recebido, parando o RewardProcessor...');
  }
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
} 