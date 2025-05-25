'use client'

import React, { useState } from 'react'
import { Trophy, Target, Calendar, Users, Zap, Clock } from 'lucide-react'

export default function DashboardChallengesPage() {
  const [challenges] = useState([
    {
      id: 1,
      title: 'Corrida de Janeiro',
      description: 'Complete 50km de corrida este mês',
      progress: 32,
      target: 50,
      unit: 'km',
      reward: 100,
      deadline: '2024-01-31',
      participants: 1250,
      status: 'active'
    },
    {
      id: 2,
      title: 'Desafio Semanal',
      description: 'Faça exercícios por 5 dias consecutivos',
      progress: 3,
      target: 5,
      unit: 'dias',
      reward: 50,
      deadline: '2024-01-27',
      participants: 890,
      status: 'active'
    },
    {
      id: 3,
      title: 'Meta de Calorias',
      description: 'Queime 2000 calorias esta semana',
      progress: 1580,
      target: 2000,
      unit: 'cal',
      reward: 75,
      deadline: '2024-01-28',
      participants: 650,
      status: 'active'
    },
  ])

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Desafios</h1>
          <p className="text-gray-600 mt-1">Participe de desafios e ganhe FUSE tokens extras</p>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
          <Target className="w-5 h-5" />
          Explorar Desafios
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Desafios Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{challenges.filter(c => c.status === 'active').length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Desafios Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">FUSE Potencial</p>
              <p className="text-2xl font-bold text-gray-900">225</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ranking</p>
              <p className="text-2xl font-bold text-gray-900">#47</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Meus Desafios Ativos</h2>
        </div>
        <div className="divide-y">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{challenge.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                      Ativo
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{challenge.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progresso: {challenge.progress} / {challenge.target} {challenge.unit}</span>
                      <span>{Math.round(getProgressPercentage(challenge.progress, challenge.target))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${getProgressPercentage(challenge.progress, challenge.target)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Challenge Info */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Até {new Date(challenge.deadline).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{challenge.participants.toLocaleString()} participantes</span>
                    </div>
                  </div>
                </div>

                <div className="text-right ml-6">
                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Recompensa</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{challenge.reward} FUSE</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
