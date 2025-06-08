'use client'

import React, { useState } from 'react'
import { Gift, ShoppingBag, Star, Zap, Clock, Check, Info, Lock } from 'lucide-react'

export default function DashboardRewardsPage() {
  const [rewards] = useState([
    {
      id: 1,
      title: 'Tênis Nike Air Max',
      description: 'Tênis de corrida profissional',
      cost: 500,
      category: 'Equipamentos',
      image: '👟',
      available: true,
      rating: 4.8,
      claimed: 45
    },
    {
      id: 2,
      title: 'Smartwatch Garmin',
      description: 'Monitor de atividades com GPS',
      cost: 800,
      category: 'Tecnologia',
      image: '⌚',
      available: true,
      rating: 4.9,
      claimed: 23
    },
    {
      id: 3,
      title: 'Suplemento Whey Protein',
      description: 'Proteína premium 1kg',
      cost: 150,
      category: 'Suplementos',
      image: '🥤',
      available: true,
      rating: 4.7,
      claimed: 128
    },
    {
      id: 4,
      title: 'Aula de Personal Trainer',
      description: 'Sessão individual de 1 hora',
      cost: 200,
      category: 'Serviços',
      image: '🏋️',
      available: true,
      rating: 4.9,
      claimed: 67
    },
  ])

  const [myRewards] = useState([
    {
      id: 1,
      title: 'Garrafa Térmica Premium',
      description: 'Garrafa de 750ml com isolamento térmico',
      cost: 100,
      claimedAt: '2024-01-15',
      status: 'delivered'
    },
    {
      id: 2,
      title: 'Camiseta FUSEtech',
      description: 'Camiseta oficial da comunidade',
      cost: 75,
      claimedAt: '2024-01-10',
      status: 'shipped'
    },
  ])

  const userFUSE = 1250

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Entregue'
      case 'shipped': return 'Enviado'
      case 'processing': return 'Processando'
      default: return 'Pendente'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recompensas</h1>
          <p className="text-gray-600 mt-1">Troque seus FUSE tokens por produtos e experiências incríveis</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-lg">
          {userFUSE} FUSE Points
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">FUSE Disponível</p>
              <p className="text-2xl font-bold text-gray-900">{userFUSE}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recompensas Resgatadas</p>
              <p className="text-2xl font-bold text-gray-900">{myRewards.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">FUSE Gastos</p>
              <p className="text-2xl font-bold text-gray-900">175</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nível VIP</p>
              <p className="text-2xl font-bold text-gray-900">Bronze</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Phase 1 Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Sistema de Pontos - Fase 1</h3>
            <p className="text-gray-600 text-sm mb-3">
              Atualmente você está acumulando <strong>FUSE Points</strong> que serão convertidos 1:1 em tokens FUSE reais quando a Fase 2 for lançada.
            </p>
            <div className="bg-white/70 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>🚀 Lançamento da Fase 2:</strong> Julho de 2024
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Quando a Fase 2 for ativada, você poderá usar seus tokens FUSE para resgatar produtos reais!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Rewards */}
      <div className="bg-white rounded-2xl shadow-sm border relative">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Recompensas Disponíveis</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Lock className="w-3 h-3 mr-1" />
            Desbloqueado na Fase 2
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {rewards.map((reward) => (
            <div key={reward.id} className="border rounded-xl p-6 hover:shadow-lg transition-all relative overflow-hidden">
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10"></div>
              
              <div className="relative z-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{reward.image}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{reward.rating}</span>
                      <span className="text-sm text-gray-400">• {reward.claimed} resgatados</span>
                    </div>
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {reward.category}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-lg text-gray-900">{reward.cost} FUSE</span>
                </div>
                <div className="relative">
                  <button 
                    className="px-4 py-2 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
                    disabled={true}
                  >
                    Fase 2
                  </button>
                  <div className="absolute -top-8 right-0 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                    Disponível após lançamento
                  </div>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Rewards */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Minhas Recompensas</h2>
          <span className="text-sm text-gray-500">(Simulação - Fase 1)</span>
        </div>
        <div className="divide-y">
          {myRewards.map((reward) => (
            <div key={reward.id} className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                <p className="text-sm text-gray-600">{reward.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Resgatado em {new Date(reward.claimedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{reward.cost} FUSE Points</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reward.status)}`}>
                    {getStatusText(reward.status)}
                  </span>
                </div>
                {reward.status === 'delivered' && (
                  <Check className="w-6 h-6 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
