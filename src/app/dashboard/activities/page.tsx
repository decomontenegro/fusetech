'use client'

import React, { useState } from 'react'
import { Activity, Plus, Calendar, MapPin, Clock, Zap } from 'lucide-react'

export default function DashboardActivitiesPage() {
  const [activities] = useState([
    {
      id: 1,
      type: 'Corrida',
      distance: '5.2 km',
      duration: '28 min',
      tokens: 25,
      date: '2024-01-20',
      location: 'Parque Ibirapuera',
      calories: 320
    },
    {
      id: 2,
      type: 'Ciclismo',
      distance: '15.8 km',
      duration: '45 min',
      tokens: 45,
      date: '2024-01-19',
      location: 'Ciclovia Marginal',
      calories: 580
    },
    {
      id: 3,
      type: 'Caminhada',
      distance: '3.1 km',
      duration: '35 min',
      tokens: 15,
      date: '2024-01-18',
      location: 'Vila Madalena',
      calories: 180
    },
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minhas Atividades</h1>
          <p className="text-gray-600 mt-1">Acompanhe seu progresso e ganhe FUSE tokens</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova Atividade
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Atividades</p>
              <p className="text-2xl font-bold text-gray-900">{activities.length}</p>
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
              <p className="text-2xl font-bold text-gray-900">24.1 km</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Total</p>
              <p className="text-2xl font-bold text-gray-900">108 min</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">FUSE Ganhos</p>
              <p className="text-2xl font-bold text-gray-900">85 FUSE</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Atividades Recentes</h2>
        </div>
        <div className="divide-y">
          {activities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{activity.type}</h3>
                    <p className="text-sm text-gray-600">{activity.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Distância</p>
                    <p className="font-semibold text-gray-900">{activity.distance}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Duração</p>
                    <p className="font-semibold text-gray-900">{activity.duration}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Calorias</p>
                    <p className="font-semibold text-gray-900">{activity.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">FUSE</p>
                    <p className="font-bold text-blue-600">+{activity.tokens}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Data</p>
                    <p className="font-semibold text-gray-900">{new Date(activity.date).toLocaleDateString('pt-BR')}</p>
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
