'use client';

import React, { useState, useEffect } from 'react';
import { formatTokenAmount, truncateWalletAddress } from '@fuseapp/utils';
import { TokenTransactionType, TokenTransactionStatus } from '@fuseapp/types';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button,
  Badge,
  Input
} from '@fuseapp/ui';

// Dados simulados para demonstração
const mockWalletData = {
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  balance: 234.56,
  transactions: [
    {
      id: 'tx1',
      amount: 25.5,
      type: TokenTransactionType.EARN,
      status: TokenTransactionStatus.COMPLETED,
      txHash: '0x8a25b7f5cdae698ef9059589d5c15cbe5f429c31b31df137619adb653c104aaa',
      createdAt: '2023-08-10T14:30:00Z',
      source: 'strava',
    },
    {
      id: 'tx2',
      amount: 10.2,
      type: TokenTransactionType.EARN,
      status: TokenTransactionStatus.COMPLETED,
      txHash: '0x9b35c7f5cdae698ef9059589d5c15cbe5f429c31b31df137619adb653c104bbb',
      createdAt: '2023-08-08T09:15:00Z',
      source: 'instagram',
    },
    {
      id: 'tx3',
      amount: 50.0,
      type: TokenTransactionType.BURN,
      status: TokenTransactionStatus.PENDING,
      createdAt: '2023-08-12T16:45:00Z',
      source: 'cashout',
    },
  ],
};

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAmount, setPendingAmount] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(mockWalletData.transactions);
  const [filter, setFilter] = useState<'all' | 'earn' | 'burn'>('all');
  
  // Simulação de carregamento de dados
  useEffect(() => {
    // Em produção, isso buscaria dados da API
  }, []);
  
  // Filtrar transações quando o filtro mudar
  useEffect(() => {
    if (filter === 'all') {
      setFilteredTransactions(mockWalletData.transactions);
    } else {
      const filtered = mockWalletData.transactions.filter(
        tx => tx.type === (filter === 'earn' ? TokenTransactionType.EARN : TokenTransactionType.BURN)
      );
      setFilteredTransactions(filtered);
    }
  }, [filter]);
  
  // Função para solicitar tokens (em produção, isso chamaria uma API)
  const handleRequestTokens = async () => {
    setIsLoading(true);
    
    // Simulação de chamada de API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simula sucesso
    alert('Solicitação de tokens enviada com sucesso!');
    setIsLoading(false);
  };
  
  // Helper para formatar o tipo de transação
  const formatTransactionType = (type: TokenTransactionType) => {
    return type === TokenTransactionType.EARN ? 'Recebido' : 'Resgatado';
  };
  
  // Helper para obter a cor do badge de status
  const getStatusBadgeVariant = (status: TokenTransactionStatus) => {
    switch (status) {
      case TokenTransactionStatus.COMPLETED:
        return 'success';
      case TokenTransactionStatus.PENDING:
        return 'warning';
      case TokenTransactionStatus.FAILED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  // Helper para formatar o status da transação
  const formatTransactionStatus = (status: TokenTransactionStatus) => {
    switch (status) {
      case TokenTransactionStatus.COMPLETED:
        return 'Concluído';
      case TokenTransactionStatus.PENDING:
        return 'Pendente';
      case TokenTransactionStatus.FAILED:
        return 'Falhou';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sua Carteira</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus tokens FUSE e veja seu histórico de transações.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de Saldo */}
        <Card>
          <CardHeader>
            <CardTitle>Saldo de Tokens</CardTitle>
            <CardDescription>
              Seu saldo atual de tokens FUSE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="text-4xl font-bold">
                {formatTokenAmount(mockWalletData.balance)}
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Carteira:</span>
                <span className="font-mono">
                  {truncateWalletAddress(mockWalletData.address)}
                </span>
                <button 
                  className="text-primary hover:underline text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(mockWalletData.address);
                    alert('Endereço copiado!');
                  }}
                >
                  Copiar
                </button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="grid grid-cols-2 gap-4 w-full">
              <Button
                onClick={handleRequestTokens}
                disabled={isLoading}
              >
                {isLoading ? 'Processando...' : 'Visualizar na Base'}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://basescan.org/address/${mockWalletData.address}`, '_blank')}
              >
                Explorar
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Card de Resgate */}
        <Card>
          <CardHeader>
            <CardTitle>Resgatar Tokens</CardTitle>
            <CardDescription>
              Converta seus tokens FUSE para outros produtos ou benefícios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Disponível para resgate:</span>
                <span className="font-bold">{formatTokenAmount(mockWalletData.balance)}</span>
              </div>
              
              <Input
                type="number"
                placeholder="Quantidade de tokens"
                value={pendingAmount}
                onChange={(e) => setPendingAmount(e.target.value)}
              />
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPendingAmount('50')}
                >
                  50 FUSE
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPendingAmount('100')}
                >
                  100 FUSE
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPendingAmount(mockWalletData.balance.toString())}
                >
                  Máximo
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              disabled={!pendingAmount || isLoading || parseFloat(pendingAmount) <= 0 || parseFloat(pendingAmount) > mockWalletData.balance}
              onClick={() => {
                alert(`Solicitação de resgate de ${pendingAmount} FUSE enviada!`);
                setPendingAmount('');
              }}
            >
              Resgatar Tokens
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Histórico de Transações */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Histórico de Transações</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button 
                variant={filter === 'earn' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('earn')}
              >
                Ganhos
              </Button>
              <Button 
                variant={filter === 'burn' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('burn')}
              >
                Resgates
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada.
              </p>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-4 border-b last:border-0">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${transaction.type === TokenTransactionType.EARN ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === TokenTransactionType.EARN ? '+' : '-'}{transaction.amount} FUSE
                      </span>
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {formatTransactionStatus(transaction.status)}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1">
                      {new Date(transaction.createdAt).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium">
                      {formatTransactionType(transaction.type)}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {transaction.source === 'strava' ? 'Atividade física' : 
                       transaction.source === 'instagram' ? 'Post social' : 
                       transaction.source === 'cashout' ? 'Resgate para benefício' : 
                       transaction.source}
                    </span>
                    {transaction.txHash && (
                      <a 
                        href={`https://basescan.org/tx/${transaction.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Ver transação
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 