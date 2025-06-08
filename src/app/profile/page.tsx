'use client'

import React, { useState, useEffect } from 'react'
import { User, Settings, Trophy, Activity, Calendar, MapPin, Edit3, Camera, Wallet, Info } from 'lucide-react'

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <p className="text-gray-700 font-semibold">Carregando Perfil...</p>
        </div>
      </div>
    )
  }

  const mockUser = {
    name: 'João Silva',
    email: 'joao@example.com',
    joinDate: 'Janeiro 2024',
    location: 'São Paulo, SP',
    bio: 'Apaixonado por corrida e ciclismo. Sempre em busca de novos desafios!',
    walletId: 'FUSE-D897-6F1A',
    stats: {
      totalActivities: 24,
      totalDistance: 156.8,
      totalFUSE: 1250,
      achievements: 8
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
            </div>
            <button className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Configurações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white font-bold text-4xl">{mockUser.name.charAt(0)}</span>
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{mockUser.name}</h2>
                <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Editar Perfil</span>
                </button>
              </div>
              
              <div className="space-y-2 text-gray-600 mb-4">
                <p className="flex items-center justify-center md:justify-start">
                  <User className="w-4 h-4 mr-2" />
                  {mockUser.email}
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <MapPin className="w-4 h-4 mr-2" />
                  {mockUser.location}
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Membro desde {mockUser.joinDate}
                </p>
                <p className="flex items-center justify-center md:justify-start">
                  <Wallet className="w-4 h-4 mr-2" />
                  Wallet ID: <code className="font-mono bg-gray-100 px-2 py-0.5 rounded ml-1">{mockUser.walletId}</code>
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">{mockUser.bio}</p>
            </div>
          </div>
        </div>

        {/* Phase 1 Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6 border border-blue-200">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              <strong>Fase 1:</strong> Seus pontos FUSE serão convertidos 1:1 em tokens reais quando a Fase 2 for lançada em julho de 2024.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{mockUser.stats.totalActivities}</p>
            <p className="text-sm text-gray-600">Atividades</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{mockUser.stats.totalDistance}km</p>
            <p className="text-sm text-gray-600">Distância</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{mockUser.stats.achievements}</p>
            <p className="text-sm text-gray-600">Conquistas</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold text-lg">F</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{mockUser.stats.totalFUSE}</p>
            <p className="text-sm text-gray-600">FUSE Points</p>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Conquistas Recentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Primeira Corrida', description: 'Complete sua primeira atividade', icon: '🏃‍♂️', date: '2 dias atrás' },
              { name: 'Maratonista', description: 'Corra 42km em uma atividade', icon: '🏅', date: '1 semana atrás' },
              { name: 'Consistência', description: '7 dias consecutivos de atividade', icon: '🔥', date: '2 semanas atrás' },
              { name: 'Explorador', description: 'Atividades em 5 locais diferentes', icon: '🗺️', date: '3 semanas atrás' },
            ].map((achievement, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl mr-4">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo de Atividades</h3>
          <div className="space-y-4">
            {[
              { type: 'Corrida', count: 15, distance: 89.2, avgPace: '5:30/km' },
              { type: 'Ciclismo', count: 7, distance: 58.6, avgPace: '25 km/h' },
              { type: 'Caminhada', count: 2, distance: 9.0, avgPace: '8:00/km' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{activity.type}</h4>
                    <p className="text-sm text-gray-600">{activity.count} atividades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{activity.distance}km</p>
                  <p className="text-sm text-gray-600">{activity.avgPace}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
