'use client'

import React, { useState, useEffect } from 'react'
import { Activity, Calendar, MapPin, Clock, Zap, Filter, Plus } from 'lucide-react'

export default function ActivitiesPage() {
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState('all')

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
          <p className="text-gray-700 font-semibold">Carregando Atividades...</p>
        </div>
      </div>
    )
  }

  const mockActivities = [
    {
      id: 1,
      type: 'Corrida',
      name: 'Corrida Matinal no Parque',
      distance: 5.2,
      duration: '28:30',
      pace: '5:29/km',
      tokens: 25,
      date: '2024-01-15',
      time: '07:30',
      location: 'Parque Ibirapuera, SP',
      calories: 312,
      icon: '🏃‍♂️'
    },
    {
      id: 2,
      type: 'Ciclismo',
      name: 'Pedalada pela Ciclovia',
      distance: 15.8,
      duration: '45:20',
      pace: '20.9 km/h',
      tokens: 45,
      date: '2024-01-14',
      time: '18:00',
      location: 'Ciclovia Faria Lima, SP',
      calories: 580,
      icon: '🚴‍♂️'
    },
    {
      id: 3,
      type: 'Caminhada',
      name: 'Caminhada Relaxante',
      distance: 3.1,
      duration: '35:15',
      pace: '11:22/km',
      tokens: 15,
      date: '2024-01-13',
      time: '19:30',
      location: 'Vila Madalena, SP',
      calories: 180,
      icon: '🚶‍♂️'
    },
    {
      id: 4,
      type: 'Corrida',
      name: 'Treino Intervalado',
      distance: 8.5,
      duration: '42:10',
      pace: '4:58/km',
      tokens: 40,
      date: '2024-01-12',
      time: '06:45',
      location: 'Parque Villa-Lobos, SP',
      calories: 510,
      icon: '🏃‍♂️'
    },
    {
      id: 5,
      type: 'Ciclismo',
      name: 'Volta Completa na Cidade',
      distance: 22.3,
      duration: '1:15:30',
      pace: '17.7 km/h',
      tokens: 65,
      date: '2024-01-11',
      time: '16:00',
      location: 'Centro de SP',
      calories: 820,
      icon: '🚴‍♂️'
    }
  ]

  const filteredActivities = filter === 'all' 
    ? mockActivities 
    : mockActivities.filter(activity => activity.type.toLowerCase() === filter)

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'Corrida':
        return 'from-red-500 to-red-600'
      case 'Ciclismo':
        return 'from-blue-500 to-blue-600'
      case 'Caminhada':
        return 'from-green-500 to-green-600'
      default:
        return 'from-gray-500 to-gray-600'
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
              <h1 className="text-2xl font-bold text-gray-900">Minhas Atividades</h1>
            </div>
            <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nova Atividade</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Atividades</p>
                <p className="text-2xl font-bold text-gray-900">{mockActivities.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Distância Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockActivities.reduce((sum, activity) => sum + activity.distance, 0).toFixed(1)}km
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">FUSE Ganhos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockActivities.reduce((sum, activity) => sum + activity.tokens, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calorias Queimadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockActivities.reduce((sum, activity) => sum + activity.calories, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 font-bold text-lg">🔥</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtrar Atividades</h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex flex-wrap gap-3">
            {['all', 'corrida', 'ciclismo', 'caminhada'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? 'Todas' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-6">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getActivityColor(activity.type)} rounded-xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{activity.name}</h3>
                    <p className="text-gray-600 mb-2">{activity.type}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(activity.date).toLocaleDateString('pt-BR')} às {activity.time}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {activity.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Distância</p>
                    <p className="text-lg font-bold text-gray-900">{activity.distance}km</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tempo</p>
                    <p className="text-lg font-bold text-gray-900">{activity.duration}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ritmo</p>
                    <p className="text-lg font-bold text-gray-900">{activity.pace}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">FUSE</p>
                    <p className="text-lg font-bold text-blue-600">+{activity.tokens}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma atividade encontrada</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou adicione uma nova atividade.</p>
          </div>
        )}
      </div>
    </div>
  )
}
