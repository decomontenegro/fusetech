import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { TokenService } from '../services/tokenService';
import { TransactionService } from '../services/transactionService';

// Worker para processar transações de token
export async function startTokenTransactionProcessor(
  server: FastifyInstance,
  redis: Redis,
  tokenService: TokenService,
  transactionService?: TransactionService
): Promise<void> {
  server.log.info('Iniciando processador de transações de tokens');

  // Verificar se o serviço de transações foi fornecido
  if (!transactionService) {
    server.log.warn('Serviço de transações não fornecido, usando modo legado');
  }

  // Iniciar loop de processamento
  const processLoop = async () => {
    try {
      if (transactionService) {
        // Usar o novo serviço de transações
        server.log.debug('Verificando próxima transação para processar');
        const processed = await transactionService.processNextTransaction();

        if (processed) {
          server.log.info({ transactionId: processed }, 'Transação processada com sucesso');
        } else {
          // Nenhuma transação para processar, aguardar um pouco
          server.log.debug('Nenhuma transação para processar, aguardando...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        // Modo legado: processar eventos do stream Redis
        server.log.debug('Verificando eventos no stream Redis (modo legado)');

        // Criar grupo de consumo se não existir
        try {
          await redis.xgroup('CREATE', 'earn:points', 'token-processor-group', '0', 'MKSTREAM');
          server.log.info('Grupo de consumo criado para o stream earn:points');
        } catch (error: any) {
          // Ignorar erro se o grupo já existir
          if (!error.message.includes('BUSYGROUP')) {
            throw error;
          }
        }

        // Ler mensagens pendentes para este consumidor
        const results = await redis.xreadgroup(
          'GROUP',
          'token-processor-group',
          'consumer-1',
          'COUNT',
          '10',
          'BLOCK',
          '2000',
          'STREAMS',
          'earn:points',
          '>'
        ) as Array<[string, Array<[string, string[]]>]> | null;

        if (!results || results.length === 0) {
          server.log.debug('Nenhum evento novo no stream, aguardando...');
          return;
        }

        const messageCount = results[0][1].length;
        server.log.info(`Processando ${messageCount} eventos do stream earn:points`);

        for (const [_stream, messages] of results) {
          for (const [id, fields] of messages) {
            try {
              // Extrair informações relevantes
              const userIdIndex = fields.indexOf('userId');
              const pointsIndex = fields.indexOf('points');
              const sourceIndex = fields.indexOf('source');

              if (userIdIndex >= 0 && pointsIndex >= 0 && sourceIndex >= 0) {
                const userId = fields[userIdIndex + 1];
                const points = parseInt(fields[pointsIndex + 1], 10);
                const source = fields[sourceIndex + 1];

                server.log.info(
                  { messageId: id, userId, points, source },
                  'Processando evento de pontos'
                );

                // Processar a transação de token
                await processLegacyTransaction(server, redis, tokenService, {
                  userId,
                  amount: points / 10, // Conversão de pontos para tokens (exemplo: 10 pontos = 1 token)
                  source,
                });

                // Confirmar processamento
                await redis.xack('earn:points', 'token-processor-group', id);

                server.log.info(
                  { messageId: id },
                  'Evento processado e confirmado'
                );
              } else {
                server.log.warn(
                  { messageId: id, fields },
                  'Evento com formato inválido, ignorando'
                );

                // Confirmar processamento mesmo para mensagens inválidas
                await redis.xack('earn:points', 'token-processor-group', id);
              }
            } catch (error) {
              server.log.error(
                { error, messageId: id },
                'Erro ao processar evento individual'
              );

              // Não confirmar processamento para tentar novamente depois
            }
          }
        }
      }
    } catch (error) {
      server.log.error({ error }, 'Erro ao processar transações de token');
      // Esperar um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Continuar o loop
    setImmediate(processLoop);
  };

  // Iniciar o loop de processamento
  processLoop();
}

// Processador de transações legado
async function processLegacyTransaction(
  server: FastifyInstance,
  redis: Redis,
  tokenService: TokenService,
  transaction: {
    userId: string;
    amount: number;
    source: string;
  }
): Promise<void> {
  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  server.log.info(
    { transactionId, userId: transaction.userId, amount: transaction.amount, source: transaction.source },
    'Processando transação de token (modo legado)'
  );

  try {
    // Em produção, buscar o endereço da carteira do usuário no banco de dados
    // Este é apenas um exemplo simulado
    const mockWalletAddress = '0x0000000000000000000000000000000000000000';

    // Registrar a transação como pendente
    const pendingTransaction = {
      id: transactionId,
      userId: transaction.userId,
      amount: transaction.amount,
      type: 'mint',
      source: transaction.source,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Publicar transação pendente
    await redis.xadd(
      'token:transactions',
      '*',
      'data',
      JSON.stringify(pendingTransaction)
    );

    // Executar a transação on-chain
    const receipt = await tokenService.mintTokens(mockWalletAddress, transaction.amount);

    // Atualizar a transação como completa
    const completedTransaction = {
      ...pendingTransaction,
      status: 'completed',
      txHash: receipt.transactionHash,
      updatedAt: new Date().toISOString(),
    };

    // Publicar transação completa
    await redis.xadd(
      'token:transactions',
      '*',
      'data',
      JSON.stringify(completedTransaction)
    );

    server.log.info(
      {
        transactionId,
        userId: transaction.userId,
        amount: transaction.amount,
        txHash: receipt.transactionHash
      },
      'Transação de token completada com sucesso (modo legado)'
    );
  } catch (error: any) {
    server.log.error(
      { error, transactionId, userId: transaction.userId },
      'Erro ao processar transação de token (modo legado)'
    );

    // Registrar a transação como falha
    const failedTransaction = {
      id: transactionId,
      userId: transaction.userId,
      amount: transaction.amount,
      type: 'mint',
      source: transaction.source,
      status: 'failed',
      error: error.message || 'Erro desconhecido',
      updatedAt: new Date().toISOString(),
    };

    // Publicar transação falha
    await redis.xadd(
      'token:transactions',
      '*',
      'data',
      JSON.stringify(failedTransaction)
    );
  }
}
