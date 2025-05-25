import axios from 'axios';
import { TokenTransaction, TokenTransactionStatus, TokenTransactionType } from '@fuseapp/types';
import { apiConfig } from '../utils/apiConfig';
import { ApiError } from '../utils/apiErrors';

// Interfaces para as requisições
export interface ListTransactionsParams {
  userId: string;
  type?: TokenTransactionType;
  status?: TokenTransactionStatus;
  limit?: number;
  offset?: number;
  fromDate?: Date | string;
  toDate?: Date | string;
}

export interface ListTransactionsResponse {
  transactions: TokenTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface BalanceResponse {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  pendingTransactions: number;
}

export interface TransferParams {
  fromUserId: string;
  toUserId: string;
  amount: number;
  memo?: string;
}

// Cliente para o serviço de tokens
export class TokenClient {
  private client;
  
  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseUrls.token,
      timeout: apiConfig.timeouts.default,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Interceptor para tratamento de erros
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        throw ApiError.fromAxiosError(error);
      }
    );
  }
  
  /**
   * Busca as transações de um usuário
   */
  async listTransactions(params: ListTransactionsParams): Promise<ListTransactionsResponse> {
    const { data } = await this.client.get('/transactions', { params });
    return data as ListTransactionsResponse;
  }
  
  /**
   * Busca o saldo de um usuário
   */
  async getBalance(userId: string): Promise<BalanceResponse> {
    const { data } = await this.client.get(`/balance/${userId}`);
    return data as BalanceResponse;
  }
  
  /**
   * Transfere tokens entre usuários
   */
  async transferTokens(params: TransferParams): Promise<TokenTransaction> {
    const { data } = await this.client.post('/transfer', params);
    return data as TokenTransaction;
  }
  
  /**
   * Busca os detalhes de uma transação
   */
  async getTransaction(transactionId: string): Promise<TokenTransaction> {
    const { data } = await this.client.get(`/transactions/${transactionId}`);
    return data as TokenTransaction;
  }
  
  /**
   * Cria uma transação para recompensa de atividade
   */
  async rewardActivity(userId: string, activityId: string, amount: number): Promise<TokenTransaction> {
    const { data } = await this.client.post('/reward/activity', {
      userId,
      activityId,
      amount
    });
    return data as TokenTransaction;
  }
}

// Instância singleton para uso em toda a aplicação
export const tokenClient = new TokenClient(); 