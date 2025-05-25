import apiService, { PaginatedResponse } from './api';

// Tipos
export enum TokenTransactionType {
  EARN = 'earn',
  BURN = 'burn',
}

export enum TokenTransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface TokenTransaction {
  id: string;
  userId: string;
  amount: number;
  type: TokenTransactionType;
  status: TokenTransactionStatus;
  source: string;
  sourceId?: string;
  txHash?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  contractAddress: string;
}

export interface TokenBalance {
  address: string;
  balance: string;
}

// Serviço de tokens
export class TokenService {
  // Obter informações do token
  async getTokenInfo(): Promise<TokenInfo> {
    return apiService.get<TokenInfo>('/api/token/info');
  }

  // Obter saldo de tokens
  async getBalance(address: string): Promise<TokenBalance> {
    return apiService.get<TokenBalance>(`/api/token/balance/${address}`);
  }

  // Obter saldo do usuário atual
  async getCurrentUserBalance(): Promise<TokenBalance> {
    return apiService.get<TokenBalance>('/api/token/balance/me');
  }

  // Obter histórico de transações
  async getTransactions(
    limit: number = 10,
    offset: number = 0,
    type?: TokenTransactionType
  ): Promise<PaginatedResponse<TokenTransaction>> {
    return apiService.get<PaginatedResponse<TokenTransaction>>('/api/token/transactions', {
      params: { limit, offset, type },
    });
  }

  // Solicitar resgate de tokens
  async requestRedemption(
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<{ transactionId: string; status: string }> {
    return apiService.post<{ transactionId: string; status: string }>('/api/token/burn', {
      amount,
      reason,
      metadata,
    });
  }

  // Verificar status de uma transação
  async getTransactionStatus(
    transactionId: string
  ): Promise<{ id: string; status: string; txHash?: string; createdAt: string; updatedAt?: string }> {
    return apiService.get<{
      id: string;
      status: string;
      txHash?: string;
      createdAt: string;
      updatedAt?: string;
    }>(`/api/token/transaction/${transactionId}`);
  }
}

// Instância única do serviço
export const tokenService = new TokenService();

export default tokenService;
