'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { OnboardingFlow } from '../onboarding/OnboardingFlow'
import {
  Activity,
  Zap,
  Target,
  Trophy,
  ShoppingBag,
  Users,
  Plus
} from 'lucide-react'

export function Dashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { userStats, fuseBalance, unlockedBadges, weeklyGoal } = useGameStore()

  const stats = [
    {
      title: 'FUSE Balance',
      value: fuseBalance.toLocaleString(),
      icon: Zap,
      color: 'from-yellow-400 to-orange-500',
      change: '+12%',
    },
    {
      title: 'Atividades',
      value: userStats.totalActivities.toString(),
      icon: Activity,
      color: 'from-blue-400 to-blue-600',
      change: '+3',
    },
    {
      title: 'Distância Total',
      value: `${userStats.totalDistance.toFixed(1)}km`,
      icon: Target,
      color: 'from-green-400 to-green-600',
      change: '+5.2km',
    },
    {
      title: 'Badges',
      value: unlockedBadges.length.toString(),
      icon: Trophy,
      color: 'from-purple-400 to-purple-600',
      change: '+1',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <motion.div
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                ⚡ FUSEtech
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold">
                <Zap className="w-4 h-4" />
                {fuseBalance.toLocaleString()} FUSE
              </div>

              <button
                onClick={() => setShowOnboarding(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Configurar Conta
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Bem-vindo de volta! 👋
          </motion.h1>
          <p className="text-gray-600">
            Continue sua jornada fitness e ganhe mais tokens FUSE
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Goal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Semanal</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-semibold">{weeklyGoal.current}/{weeklyGoal.target} {weeklyGoal.type}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((weeklyGoal.current / weeklyGoal.target) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Faltam {Math.max(weeklyGoal.target - weeklyGoal.current, 0)} {weeklyGoal.type} para completar sua meta!
                </p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Activity className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-blue-900">Registrar Atividade</p>
                </button>
                <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Target className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-green-900">Ver Desafios</p>
                </button>
                <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-purple-900">Marketplace</p>
                </button>
                <button className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <Users className="w-6 h-6 text-yellow-600 mb-2" />
                  <p className="text-sm font-medium text-yellow-900">Comunidade</p>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Badge Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conquistas</h3>
              <div className="grid grid-cols-3 gap-3">
                {unlockedBadges.slice(0, 6).map((badge, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-xs text-gray-600">{badge.name}</p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todas as conquistas
              </button>
            </motion.div>

            {/* Social Feed Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Comunidade
                </h3>
                <Users className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">JM</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">João completou 10km hoje!</p>
                    <p className="text-xs text-gray-500">há 2 horas</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">AS</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Ana desbloqueou o badge "Streak Master"</p>
                    <p className="text-xs text-gray-500">há 4 horas</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver mais atividades
              </button>
            </motion.div>
          </div>
        </div>

        {/* Floating Action Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </main>

      {/* Onboarding Modal */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  )
}
