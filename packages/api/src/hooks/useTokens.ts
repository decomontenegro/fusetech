import { useState } from 'react';
import { TokenTransaction } from '@fuseapp/types';
import { tokenClient, ListTransactionsParams, BalanceResponse } from '../clients/tokenClient';

interface UseTokensOptions {
  initialLoading?: boolean;
}

export function useTokens(userId: string, options: UseTokensOptions = {}) {
  const [loading, setLoading] = useState(options.initialLoading ?? false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<BalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Carregar o saldo do usuário
  const loadBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const balanceData = await tokenClient.getBalance(userId);
      setBalance(balanceData);
      return balanceData;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar saldo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar as transações do usuário
  const loadTransactions = async (params: Omit<ListTransactionsParams, 'userId'> = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await tokenClient.listTransactions({
        userId,
        ...params,
      });
      setTransactions(response.transactions);
      setTotalTransactions(response.total);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao carregar transações';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Transferir tokens para outro usuário
  const transferTokens = async (toUserId: string, amount: number, memo?: string) => {
    setLoading(true);
    setError(null);
    try {
      const transaction = await tokenClient.transferTokens({
        fromUserId: userId,
        toUserId,
        amount,
        memo,
      });
      
      // Atualizar o saldo após a transferência
      await loadBalance();
      
      return transaction;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao transferir tokens';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    balance,
    transactions,
    totalTransactions,
    loadBalance,
    loadTransactions,
    transferTokens,
  };
} 