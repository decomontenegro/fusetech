'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import {
  GET_TOKEN_TRANSACTIONS,
  GET_TOKEN_TRANSACTION,
  GET_USER_WALLETS,
  ADD_WALLET,
  SET_PRIMARY_WALLET,
  REMOVE_WALLET
} from '../lib/graphql/queries/token';

export function useTokens() {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [type, setType] = useState<string | null>(null);

  // Obter lista de transações
  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery(GET_TOKEN_TRANSACTIONS, {
    variables: {
      limit,
      offset,
      type
    },
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter carteiras do usuário
  const {
    data: walletsData,
    loading: walletsLoading,
    error: walletsError,
    refetch: refetchWallets
  } = useQuery(GET_USER_WALLETS, {
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Adicionar carteira
  const [addWallet, { loading: addWalletLoading }] = useMutation(ADD_WALLET, {
    onCompleted: () => {
      toast.success('Carteira adicionada com sucesso!');
      refetchWallets();
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar carteira: ${error.message}`);
    }
  });

  // Definir carteira primária
  const [setPrimaryWallet, { loading: setPrimaryLoading }] = useMutation(SET_PRIMARY_WALLET, {
    onCompleted: () => {
      toast.success('Carteira primária definida com sucesso!');
      refetchWallets();
    },
    onError: (error) => {
      toast.error(`Erro ao definir carteira primária: ${error.message}`);
    }
  });

  // Remover carteira
  const [removeWallet, { loading: removeWalletLoading }] = useMutation(REMOVE_WALLET, {
    onCompleted: () => {
      toast.success('Carteira removida com sucesso!');
      refetchWallets();
    },
    onError: (error) => {
      toast.error(`Erro ao remover carteira: ${error.message}`);
    }
  });

  // Obter detalhes de uma transação
  const getTransaction = (id: string) => {
    return useQuery(GET_TOKEN_TRANSACTION, {
      variables: { id },
      skip: typeof window === 'undefined', // Não executar no servidor
      fetchPolicy: 'cache-and-network'
    });
  };

  // Adicionar nova carteira
  const handleAddWallet = async (address: string, isPrimary: boolean = false) => {
    try {
      await addWallet({
        variables: {
          address,
          isPrimary
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao adicionar carteira:', error);
      return false;
    }
  };

  // Definir carteira primária
  const handleSetPrimaryWallet = async (walletId: string) => {
    try {
      await setPrimaryWallet({
        variables: {
          walletId
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao definir carteira primária:', error);
      return false;
    }
  };

  // Remover carteira
  const handleRemoveWallet = async (walletId: string) => {
    try {
      await removeWallet({
        variables: {
          walletId
        }
      });
      return true;
    } catch (error) {
      console.error('Erro ao remover carteira:', error);
      return false;
    }
  };

  // Obter saldo de tokens (via API REST)
  const getTokenBalance = async (address?: string) => {
    try {
      const endpoint = address ? `/api/token/balance/${address}` : '/api/token/balance/me';
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Erro ao obter saldo de tokens');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao obter saldo de tokens:', error);
      toast.error('Erro ao obter saldo de tokens');
      return null;
    }
  };

  // Obter informações do token (via API REST)
  const getTokenInfo = async () => {
    try {
      const response = await fetch('/api/token/info');
      
      if (!response.ok) {
        throw new Error('Erro ao obter informações do token');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao obter informações do token:', error);
      toast.error('Erro ao obter informações do token');
      return null;
    }
  };

  // Solicitar resgate de tokens (via API REST)
  const requestRedemption = async (amount: number, reason: string, metadata?: Record<string, any>) => {
    try {
      const response = await fetch('/api/token/burn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reason,
          metadata,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao solicitar resgate de tokens');
      }
      
      const data = await response.json();
      toast.success('Solicitação de resgate enviada com sucesso!');
      refetchTransactions();
      return data.data;
    } catch (error) {
      console.error('Erro ao solicitar resgate de tokens:', error);
      toast.error('Erro ao solicitar resgate de tokens');
      return null;
    }
  };

  return {
    // Dados
    transactions: transactionsData?.token_transactions || [],
    totalTransactions: transactionsData?.token_transactions_aggregate.aggregate.count || 0,
    wallets: walletsData?.wallets || [],
    
    // Estado
    loading: transactionsLoading || walletsLoading || addWalletLoading || setPrimaryLoading || removeWalletLoading,
    error: transactionsError || walletsError,
    
    // Paginação
    limit,
    offset,
    setLimit,
    setOffset,
    
    // Filtros
    type,
    setType,
    
    // Ações
    refetchTransactions,
    refetchWallets,
    getTransaction,
    getTokenBalance,
    getTokenInfo,
    addWallet: handleAddWallet,
    setPrimaryWallet: handleSetPrimaryWallet,
    removeWallet: handleRemoveWallet,
    requestRedemption
  };
}
