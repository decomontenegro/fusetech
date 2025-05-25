import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';
import { TokenService } from './tokenService';

// Interface para transações de token
export interface TokenTransaction {
  id: string;
  userId: string;
  address: string;
  amount: number;
  type: 'mint' | 'burn';
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt?: string;
  txHash?: string;
  blockNumber?: number;
  metadata?: Record<string, any>;
  error?: string;
}

export class TransactionService {
  private redis: Redis;
  private tokenService: TokenService;
  private logger: FastifyInstance['log'];

  constructor(redis: Redis, tokenService: TokenService, logger: FastifyInstance['log']) {
    this.redis = redis;
    this.tokenService = tokenService;
    this.logger = logger;
  }

  // Enfileirar transação de mint para processamento assíncrono
  async queueMintTransaction(
    userId: string,
    address: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      // Validar endereço
      if (!ethers.utils.isAddress(address)) {
        throw new Error('Endereço de carteira inválido');
      }

      // Validar quantidade
      if (amount <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      // Validar usuário
      if (!userId) {
        throw new Error('ID de usuário inválido');
      }

      // Gerar ID único para a transação
      const transactionId = uuidv4();

      // Criar objeto de transação
      const transaction: TokenTransaction = {
        id: transactionId,
        userId,
        address,
        amount,
        type: 'mint',
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
        metadata: metadata || {},
      };

      // Armazenar transação no Redis para processamento posterior
      await this.redis.set(
        `token:transaction:${transactionId}`,
        JSON.stringify(transaction)
      );

      // Adicionar à fila de processamento
      await this.redis.rpush('token:transactions:queue', transactionId);

      this.logger.info(
        { transactionId, userId, address, amount },
        'Transação de mint enfileirada para processamento'
      );

      return transactionId;
    } catch (error) {
      this.logger.error(
        { error, userId, address, amount },
        'Erro ao enfileirar transação de mint'
      );
      throw error;
    }
  }

  // Enfileirar transação de burn para processamento assíncrono
  async queueBurnTransaction(
    userId: string,
    address: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      // Validar endereço
      if (!ethers.utils.isAddress(address)) {
        throw new Error('Endereço de carteira inválido');
      }

      // Gerar ID único para a transação
      const transactionId = uuidv4();

      // Criar objeto de transação
      const transaction: TokenTransaction = {
        id: transactionId,
        userId,
        address,
        amount,
        type: 'burn',
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
        metadata: metadata || {},
      };

      // Armazenar transação no Redis para processamento posterior
      await this.redis.set(
        `token:transaction:${transactionId}`,
        JSON.stringify(transaction)
      );

      // Adicionar à fila de processamento
      await this.redis.rpush('token:transactions:queue', transactionId);

      this.logger.info(
        { transactionId, userId, address, amount },
        'Transação de burn enfileirada para processamento'
      );

      return transactionId;
    } catch (error) {
      this.logger.error(
        { error, userId, address, amount },
        'Erro ao enfileirar transação de burn'
      );
      throw error;
    }
  }

  // Obter status de uma transação
  async getTransactionStatus(transactionId: string): Promise<TokenTransaction | null> {
    try {
      const transactionJson = await this.redis.get(`token:transaction:${transactionId}`);

      if (!transactionJson) {
        return null;
      }

      return JSON.parse(transactionJson) as TokenTransaction;
    } catch (error) {
      this.logger.error(
        { error, transactionId },
        'Erro ao obter status da transação'
      );
      throw error;
    }
  }

  // Processar próxima transação na fila
  async processNextTransaction(): Promise<boolean> {
    try {
      // Obter próxima transação da fila
      const transactionId = await this.redis.lpop('token:transactions:queue');

      if (!transactionId) {
        return false; // Fila vazia
      }

      // Obter detalhes da transação
      const transactionJson = await this.redis.get(`token:transaction:${transactionId}`);

      if (!transactionJson) {
        this.logger.warn(
          { transactionId },
          'Transação não encontrada no Redis'
        );
        return false;
      }

      const transaction = JSON.parse(transactionJson) as TokenTransaction;

      // Atualizar status para processando
      transaction.status = 'processing';
      transaction.updatedAt = new Date().toISOString();

      await this.redis.set(
        `token:transaction:${transactionId}`,
        JSON.stringify(transaction)
      );

      try {
        // Processar transação
        if (transaction.type === 'mint') {
          const receipt = await this.tokenService.mintTokens(
            transaction.address,
            transaction.amount
          );

          // Atualizar status para completado
          transaction.status = 'completed';
          transaction.txHash = receipt.transactionHash;
          transaction.blockNumber = receipt.blockNumber;
        } else if (transaction.type === 'burn') {
          const receipt = await this.tokenService.burnTokens(
            transaction.address,
            transaction.amount
          );

          // Atualizar status para completado
          transaction.status = 'completed';
          transaction.txHash = receipt.transactionHash;
          transaction.blockNumber = receipt.blockNumber;
        }
      } catch (error: any) {
        // Atualizar status para falha
        transaction.status = 'failed';
        transaction.error = error.message || 'Erro desconhecido';

        this.logger.error(
          { error, transactionId, transaction },
          'Erro ao processar transação'
        );
      }

      // Atualizar transação no Redis
      transaction.updatedAt = new Date().toISOString();

      await this.redis.set(
        `token:transaction:${transactionId}`,
        JSON.stringify(transaction)
      );

      return true;
    } catch (error) {
      this.logger.error(
        { error },
        'Erro ao processar próxima transação'
      );
      return false;
    }
  }
}

// Função factory para criar o serviço de transações
export function createTransactionService(
  server: FastifyInstance,
  redis: Redis,
  tokenService: TokenService
): TransactionService {
  return new TransactionService(redis, tokenService, server.log);
}
