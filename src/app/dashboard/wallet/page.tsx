'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Send,
  Download,
  TrendingUp,
  TrendingDown,
  Copy,
  ExternalLink,
  Zap,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  PiggyBank,
  Target
} from 'lucide-react';

// Tipos para a wallet
type TransactionType = 'earn' | 'spend' | 'transfer' | 'stake' | 'reward';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  txHash?: string;
  createdAt: string;
  source: string;
  description: string;
}

// Dados simulados para demonstração - FASE 1: SISTEMA DE PONTOS
const mockWalletData = {
  address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  balance: 1250.75,
  pendingBalance: 45.25,
  totalEarned: 2890.50,
  totalSpent: 1639.75,
  stakingBalance: 500.00,
  stakingRewards: 12.50,
  // Configurações da Fase 1
  isPhase1: true,
  tokenLaunchDate: '2024-07-01',
  transactions: [
    {
      id: 'tx1',
      amount: 25.5,
      type: 'earn' as TransactionType,
      status: 'completed' as TransactionStatus,
      txHash: '0x8a25b7f5cdae698ef9059589d5c15cbe5f429c31b31df137619adb653c104aaa',
      createdAt: '2024-01-20T14:30:00Z',
      source: 'strava',
      description: 'Corrida de 5.2km no Parque Ibirapuera'
    },
    {
      id: 'tx2',
      amount: 45.0,
      type: 'earn' as TransactionType,
      status: 'completed' as TransactionStatus,
      txHash: '0x9b35c7f5cdae698ef9059589d5c15cbe5f429c31b31df137619adb653c104bbb',
      createdAt: '2024-01-19T09:15:00Z',
      source: 'strava',
      description: 'Ciclismo de 15.8km na Ciclovia Marginal'
    },
    {
      id: 'tx3',
      amount: 100.0,
      type: 'spend' as TransactionType,
      status: 'completed' as TransactionStatus,
      txHash: '0x7c45d7f5cdae698ef9059589d5c15cbe5f429c31b31df137619adb653c104ccc',
      createdAt: '2024-01-18T16:45:00Z',
      source: 'marketplace',
      description: 'Resgate: Garrafa Térmica Premium'
    },
    {
      id: 'tx4',
      amount: 15.0,
      type: 'earn' as TransactionType,
      status: 'completed' as TransactionStatus,
      txHash: '0x6d35e7f5cdae698ef9059589d5c15cbe5f429c31b31df137619adb653c104ddd',
      createdAt: '2024-01-17T11:20:00Z',
      source: 'challenge',
      description: 'Desafio Semanal: 5 dias consecutivos'
    },
    {
      id: 'tx5',
      amount: 500.0,
      type: 'stake' as TransactionType,
      status: 'completed' as TransactionStatus,
      txHash: '0x5e25f7f5cdae698ef9059589d5c15cbe5f429c31b31df137619adb653c104eee',
      createdAt: '2024-01-15T08:30:00Z',
      source: 'staking',
      description: 'Staking de FUSE tokens - 30 dias'
    },
    {
      id: 'tx6',
      amount: 75.0,
      type: 'spend' as TransactionType,
      status: 'pending' as TransactionStatus,
      createdAt: '2024-01-21T10:15:00Z',
      source: 'marketplace',
      description: 'Resgate: Camiseta FUSEtech (Processando)'
    },
    {
      id: 'tx7',
      amount: 12.5,
      type: 'reward' as TransactionType,
      status: 'completed' as TransactionStatus,
      txHash: '0x4f15g7f5cdae698ef9059589d5c15cbe5f429c31b31df137619adb653c104fff',
      createdAt: '2024-01-14T16:00:00Z',
      source: 'staking',
      description: 'Recompensa de Staking - Semana 1'
    },
  ],
};

export default function WalletPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(mockWalletData.transactions);
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend' | 'stake' | 'reward'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'stake'>('overview');

  // Simulação de carregamento de dados
  useEffect(() => {
    // Em produção, isso buscaria dados da API
  }, []);

  // Filtrar transações quando o filtro mudar
  useEffect(() => {
    if (filter === 'all') {
      setFilteredTransactions(mockWalletData.transactions);
    } else {
      const filtered = mockWalletData.transactions.filter(tx => tx.type === filter);
      setFilteredTransactions(filtered);
    }
  }, [filter]);

  // Funções utilitárias
  const formatTokenAmount = (amount: number) => {
    return `${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} FUSE`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Endereço copiado para a área de transferência!');
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'earn': return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'spend': return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'stake': return <PiggyBank className="w-4 h-4 text-blue-600" />;
      case 'reward': return <Zap className="w-4 h-4 text-yellow-600" />;
      case 'transfer': return <Send className="w-4 h-4 text-purple-600" />;
      default: return <Wallet className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'earn': return 'text-green-600';
      case 'spend': return 'text-red-600';
      case 'stake': return 'text-blue-600';
      case 'reward': return 'text-yellow-600';
      case 'transfer': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const handleSendTokens = () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) return;
    alert(`Enviando ${sendAmount} FUSE tokens...`);
    setSendAmount('');
  };

  const handleStakeTokens = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    alert(`Fazendo staking de ${stakeAmount} FUSE tokens por 30 dias...`);
    setStakeAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carteira FUSE</h1>
          <p className="text-gray-600 mt-1">Gerencie seus tokens e acompanhe suas transações</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'send'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
          <button
            onClick={() => setActiveTab('stake')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'stake'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            Staking
          </button>
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo Principal */}
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Wallet className="w-8 h-8" />
            <span className="text-sm opacity-80">Saldo Principal</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{formatTokenAmount(mockWalletData.balance)}</p>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <span>{truncateAddress(mockWalletData.address)}</span>
              <button onClick={() => copyToClipboard(mockWalletData.address)}>
                <Copy className="w-4 h-4 hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>

        {/* Saldo Pendente */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-yellow-500" />
            <span className="text-sm text-gray-600">Pendente</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{formatTokenAmount(mockWalletData.pendingBalance)}</p>
            <p className="text-sm text-gray-600">Aguardando confirmação</p>
          </div>
        </div>

        {/* Total Ganho */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <span className="text-sm text-gray-600">Total Ganho</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{formatTokenAmount(mockWalletData.totalEarned)}</p>
            <p className="text-sm text-green-600">+12.5% este mês</p>
          </div>
        </div>

        {/* Staking */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <PiggyBank className="w-8 h-8 text-purple-500" />
            <span className="text-sm text-gray-600">Em Staking</span>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-gray-900">{formatTokenAmount(mockWalletData.stakingBalance)}</p>
            <p className="text-sm text-purple-600">+{formatTokenAmount(mockWalletData.stakingRewards)} recompensas</p>
          </div>
        </div>
      </div>

      {/* Action Tabs Content */}
      {activeTab === 'send' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-6">
            <Send className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">Enviar FUSE Tokens</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço do destinatário</label>
              <input
                type="text"
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
              <input
                type="number"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSendAmount('10')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                10 FUSE
              </button>
              <button
                onClick={() => setSendAmount('50')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                50 FUSE
              </button>
              <button
                onClick={() => setSendAmount('100')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                100 FUSE
              </button>
            </div>
            <button
              onClick={handleSendTokens}
              disabled={!sendAmount || parseFloat(sendAmount) <= 0}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Enviar Tokens
            </button>
          </div>
        </div>
      )}

      {activeTab === 'stake' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-6">
            <PiggyBank className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold text-gray-900">Staking de FUSE Tokens</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade para Staking</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setStakeAmount('100')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  100 FUSE
                </button>
                <button
                  onClick={() => setStakeAmount('500')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  500 FUSE
                </button>
                <button
                  onClick={() => setStakeAmount('1000')}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  1000 FUSE
                </button>
              </div>
              <button
                onClick={handleStakeTokens}
                disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Fazer Staking (30 dias)
              </button>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <h3 className="font-semibold text-purple-900 mb-3">Benefícios do Staking</h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>APY de 15% ao ano</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>Recompensas semanais</span>
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Sem taxas de entrada</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Período mínimo: 30 dias</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <ExternalLink className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Blockchain Explorer</h3>
            </div>
            <p className="text-gray-600 mb-4">Visualize suas transações na blockchain Base</p>
            <button
              onClick={() => window.open(`https://basescan.org/address/${mockWalletData.address}`, '_blank')}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Ver na BaseScan
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">Conectar Carteira</h3>
            </div>
            <p className="text-gray-600 mb-4">Conecte sua carteira externa para mais funcionalidades</p>
            <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
              Conectar MetaMask
            </button>
          </div>
        </div>
      )}

      {/* Histórico de Transações */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Histórico de Transações</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('earn')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'earn' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ganhos
              </button>
              <button
                onClick={() => setFilter('spend')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'spend' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Gastos
              </button>
              <button
                onClick={() => setFilter('stake')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'stake' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Staking
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma transação encontrada para este filtro.
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'earn' || transaction.type === 'reward' ? '+' : '-'}
                          {formatTokenAmount(transaction.amount)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusIcon(transaction.status)}
                    {transaction.txHash && (
                      <a
                        href={`https://basescan.org/tx/${transaction.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mt-1 block"
                      >
                        Ver na blockchain
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}