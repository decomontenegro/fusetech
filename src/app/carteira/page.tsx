'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Separator
} from '@fuseapp/ui';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Copy, 
  Clock,
  Send,
  Download,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '@fuseapp/utils';
import { toast } from 'sonner';

// Tipos para a carteira
interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer';
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  fromAddress?: string;
  toAddress?: string;
  description?: string;
  txHash?: string;
}

interface WalletData {
  address: string;
  balance: number;
  transactions: Transaction[];
  pendingRewards: number;
}

export default function CarteiraPage() {
  const [carteira, setCarteira] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Simulação de dados para demonstração
  useEffect(() => {
    const timer = setTimeout(() => {
      // Dados simulados da carteira
      const carteiraSimulada: WalletData = {
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        balance: 125.75,
        pendingRewards: 15.5,
        transactions: [
          {
            id: '1',
            type: 'deposit',
            amount: 25,
            timestamp: new Date(Date.now() - 259200000), // 3 dias atrás
            status: 'completed',
            description: 'Recompensa: Desafio de Corrida Semanal',
            txHash: '0x123456789abcdef'
          },
          {
            id: '2',
            type: 'deposit',
            amount: 30,
            timestamp: new Date(Date.now() - 604800000), // 7 dias atrás
            status: 'completed',
            description: 'Recompensa: Desafio de Ciclismo',
            txHash: '0x987654321fedcba'
          },
          {
            id: '3',
            type: 'withdraw',
            amount: 10,
            timestamp: new Date(Date.now() - 432000000), // 5 dias atrás
            status: 'completed',
            toAddress: '0x8901234567890123456789012345678901234567',
            description: 'Resgate: Amazon Gift Card',
            txHash: '0xabcdef123456789'
          },
          {
            id: '4',
            type: 'transfer',
            amount: 5,
            timestamp: new Date(Date.now() - 86400000), // 1 dia atrás
            status: 'completed',
            toAddress: '0x5678901234567890123456789012345678901234',
            description: 'Transferência para amigo',
            txHash: '0xfedcba987654321'
          },
          {
            id: '5',
            type: 'deposit',
            amount: 15.5,
            timestamp: new Date(Date.now() - 3600000), // 1 hora atrás
            status: 'pending',
            description: 'Recompensa: Atividade pendente',
          }
        ]
      };
      
      setCarteira(carteiraSimulada);
      setIsLoading(false);
    }, 800); // Simulando carregamento
    
    return () => clearTimeout(timer);
  }, []);
  
  // Função para copiar o endereço para a área de transferência
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Endereço copiado!');
  };
  
  // Função para abrir o explorador de blockchain
  const openExplorer = (txHash: string) => {
    window.open(`https://basescan.org/tx/${txHash}`, '_blank');
  };
  
  // Função para renderizar ícone com base no tipo de transação
  const renderTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdraw':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'transfer':
        return <Send className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };
  
  // Função para renderizar status com badge
  const renderStatus = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Concluído</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando dados da carteira...</p>
          </div>
        </div>
      </AppShell>
    );
  }
  
  if (!carteira) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Erro ao carregar carteira. Tente novamente mais tarde.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }
  
  // Ordenar transações por data (mais recentes primeiro)
  const transacoesOrdenadas = [...carteira.transactions].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header>
          <h1 className="text-3xl font-bold">Carteira</h1>
          <p className="text-muted-foreground">
            Gerencie suas recompensas e tokens
          </p>
        </header>
        
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="send">Enviar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-4">
            {/* Card de Saldo */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Saldo de Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold mb-1">
                      {carteira.balance.toFixed(2)} <span className="text-primary">FUSE</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      + {carteira.pendingRewards.toFixed(2)} FUSE pendentes
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  <span>Receber</span>
                </Button>
                <Button 
                  size="sm" 
                  className="gap-1"
                  onClick={() => setActiveTab('send')}
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar</span>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Card de Endereço */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Endereço da Carteira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center bg-card border rounded-md p-3">
                  <p className="text-sm font-mono truncate flex-1">
                    {carteira.address}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => copyToClipboard(carteira.address)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Este é o seu endereço na blockchain Base (L2).
                </p>
              </CardContent>
            </Card>
            
            {/* Transações Recentes */}
            <div>
              <h3 className="font-semibold mb-3">Transações Recentes</h3>
              <div className="space-y-3">
                {transacoesOrdenadas.slice(0, 3).map((tx) => (
                  <Card key={tx.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 p-2 bg-muted rounded-full">
                            {renderTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium">
                              {tx.type === 'deposit' 
                                ? 'Recebimento' 
                                : tx.type === 'withdraw'
                                ? 'Resgate'
                                : 'Envio'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.timestamp)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-semibold ${
                            tx.type === 'deposit' 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} FUSE
                          </p>
                          <div className="mt-1">
                            {renderStatus(tx.status)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {transacoesOrdenadas.length > 3 && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={() => setActiveTab('transactions')}
                >
                  Ver todas as transações
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="transactions" className="pt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transacoesOrdenadas.length > 0 ? (
                    transacoesOrdenadas.map((tx) => (
                      <div key={tx.id} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="mr-3 p-2 bg-muted rounded-full">
                              {renderTransactionIcon(tx.type)}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">
                                  {tx.type === 'deposit' 
                                    ? 'Recebimento' 
                                    : tx.type === 'withdraw'
                                    ? 'Resgate'
                                    : 'Envio'}
                                </p>
                                {renderStatus(tx.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(tx.timestamp)}
                              </p>
                            </div>
                          </div>
                          
                          <p className={`font-semibold ${
                            tx.type === 'deposit' 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} FUSE
                          </p>
                        </div>
                        
                        <div className="text-sm">
                          {tx.description && (
                            <p className="text-muted-foreground text-sm">{tx.description}</p>
                          )}
                          
                          {tx.txHash && tx.status === 'completed' && (
                            <button 
                              className="text-xs text-primary flex items-center mt-1 hover:underline"
                              onClick={() => openExplorer(tx.txHash!)}
                            >
                              <span>Ver na blockchain</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="send" className="pt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Enviar Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço de Destino</label>
                    <input 
                      type="text" 
                      className="w-full p-2 rounded-md border" 
                      placeholder="0x..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Insira o endereço completo do destinatário
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantidade</label>
                    <div className="flex">
                      <input 
                        type="number" 
                        className="w-full p-2 rounded-l-md border" 
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <div className="bg-muted border border-l-0 rounded-r-md px-3 flex items-center">
                        FUSE
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        Saldo disponível: {carteira.balance.toFixed(2)} FUSE
                      </p>
                      <button 
                        className="text-xs text-primary"
                        onClick={() => {
                          // Lógica para preencher o valor máximo
                          const inputEl = document.querySelector('input[type="number"]') as HTMLInputElement;
                          if (inputEl) {
                            inputEl.value = carteira.balance.toFixed(2);
                          }
                        }}
                      >
                        Enviar máximo
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Nota (opcional)</label>
                    <input 
                      type="text" 
                      className="w-full p-2 rounded-md border" 
                      placeholder="Adicione uma nota para o destinatário"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de transação</span>
                      <span>0.001 FUSE</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>0.00 FUSE</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-2">
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setActiveTab('overview')}
                >
                  Cancelar
                </Button>
                <Button>Enviar Tokens</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
} 