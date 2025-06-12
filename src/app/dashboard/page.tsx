'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Activity, Trophy, Target, Calendar, TrendingUp, Bell, Coins, ArrowRight, Plus, Info, Wallet, Settings } from 'lucide-react'
import { notificationService } from '@/lib/notifications/firebase'
import { StatsCard, StatsGrid } from '@/components/ui/StatsCard'
import { GlassCard, GlassPanel } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { TouchableCard } from '@/components/ui/TouchableCard'
import { motion } from 'framer-motion'
import { 
  AIInsightsWidget, 
  FeatureFlaggedMarketplace, 
  PhaseBasedContent, 
  BetaFeatures 
} from './components/FeatureFlaggedComponents'
import { useFeatureFlags } from '@/lib/feature-flags'

// Mock data - replace with real data from your store/API
const mockStats = {
  totalTokens: 1250,
  totalActivities: 42,
  currentStreak: 7,
  level: 3,
  weeklyChange: 15,
  tokensChange: 23,
  activitiesChange: 8,
  streakChange: 100,
}

const recentActivities = [
  { id: 1, type: 'Corrida', duration: '30 min', tokens: 50, date: 'Hoje, 08:00' },
  { id: 2, type: 'Ciclismo', duration: '45 min', tokens: 75, date: 'Ontem, 18:30' },
  { id: 3, type: 'Caminhada', duration: '20 min', tokens: 30, date: 'Ontem, 07:15' },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [fcmToken, setFcmToken] = useState<string | null>(null)
  const [showFeatureFlags, setShowFeatureFlags] = useState(false)
  const { getFlagsByPhase } = useFeatureFlags()

  useEffect(() => {
    setMounted(true)
    initializeNotifications()
  }, [])

  const initializeNotifications = async () => {
    if (notificationService.isSupported()) {
      await notificationService.initialize()
      const permission = notificationService.getPermissionStatus()
      setNotificationsEnabled(permission === 'granted')

      notificationService.onForegroundMessage((payload) => {
        console.log('Foreground notification:', payload)
        if (payload.notification) {
          notificationService.showLocalNotification({
            title: payload.notification.title || 'FUSEtech',
            body: payload.notification.body || 'New notification',
            icon: payload.notification.icon,
            data: payload.data
          })
        }
      })
    }
  }

  const enableNotifications = async () => {
    const token = await notificationService.requestPermissionAndGetToken()
    if (token) {
      setFcmToken(token)
      setNotificationsEnabled(true)
      // Subscribe to general notifications topic (implementation pending)
      console.log('FCM token obtained:', token)
    }
  }

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-bg-secondary rounded-lg mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-bg-secondary rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-text-secondary mt-1 text-sm sm:text-base">Acompanhe seu progresso</p>
        </div>
        
        <Button
          icon={<Plus className="w-4 h-4" />}
          size="md"
          onClick={() => console.log('Nova atividade')}
          ariaLabel="Adicionar nova atividade"
          fullWidth={false}
          className="sm:w-auto"
        >
          <span className="hidden sm:inline">Nova Atividade</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Phase-based Content */}
      <PhaseBasedContent />
      
      {/* Phase 1 Notice - Mobile Optimized */}
      <GlassCard variant="gradient" padding="md" className="mb-4 sm:mb-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-primary/10 shrink-0">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary mb-1 text-sm sm:text-base">Fase 1 - Sistema de Pontos</h3>
            <p className="text-xs sm:text-sm text-text-secondary mb-2">
              Você está acumulando FUSE Points que serão convertidos 1:1 em tokens reais na Fase 2.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-text-secondary">
              <Wallet className="w-4 h-4 hidden sm:block" />
              <span className="break-all">Wallet: <code className="font-mono bg-bg-secondary px-1.5 py-0.5 rounded text-xs">FUSE-8976-F1A2</code></span>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            icon={<Settings className="w-4 h-4" />}
            onClick={() => setShowFeatureFlags(!showFeatureFlags)}
            ariaLabel="Toggle feature flags"
            className="shrink-0"
          >
            <span className="hidden sm:inline">Features</span>
          </Button>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <StatsGrid>
        <StatsCard
          title="FUSE Points"
          value={mockStats.totalTokens.toLocaleString()}
          change={mockStats.tokensChange}
          changeLabel="vs semana passada"
          icon={Coins}
          color="primary"
          animationDelay={0}
          subtitle="Conversão 1:1 na Fase 2"
        />
        <StatsCard
          title="Atividades"
          value={mockStats.totalActivities}
          change={mockStats.activitiesChange}
          changeLabel="este mês"
          icon={Activity}
          color="success"
          animationDelay={0.1}
        />
        <StatsCard
          title="Sequência"
          value={`${mockStats.currentStreak} dias`}
          change={mockStats.streakChange}
          changeLabel="recorde pessoal!"
          icon={Trophy}
          color="warning"
          animationDelay={0.2}
        />
        <StatsCard
          title="Nível"
          value={`Nível ${mockStats.level}`}
          icon={Target}
          color="secondary"
          animationDelay={0.3}
        />
      </StatsGrid>

      {/* Main Content Grid - Mobile First */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <GlassPanel className="lg:col-span-2" animation="slideIn">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Atividades Recentes</h2>
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" ariaLabel="Ver todas as atividades">
              <span className="hidden sm:inline">Ver todas</span>
              <span className="sm:hidden">Ver</span>
            </Button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {recentActivities.map((activity, index) => (
              <TouchableCard
                key={activity.id}
                className="glass p-3 sm:p-4 hover:bg-bg-hover transition-colors min-h-touch"
                onTap={() => console.log('Activity clicked:', activity.id)}
                onSwipeLeft={() => console.log('Delete activity:', activity.id)}
                onSwipeRight={() => console.log('Share activity:', activity.id)}
                ariaLabel={`Atividade: ${activity.type}, ${activity.duration}, ${activity.date}. Ganhou ${activity.tokens} FUSE. Pressione Enter para ver detalhes, seta esquerda para deletar, seta direita para compartilhar`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                      <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary text-sm sm:text-base truncate">{activity.type}</p>
                      <p className="text-xs sm:text-sm text-text-secondary">{activity.duration} • {activity.date}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-text-primary text-sm sm:text-base">+{activity.tokens}</p>
                    <p className="text-xs text-text-secondary">Points</p>
                  </div>
                </div>
              </TouchableCard>
            ))}
          </div>
        </GlassPanel>

        {/* Quick Actions - Mobile Optimized */}
        <GlassPanel animation="fadeIn" animationDelay={0.2}>
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4 sm:mb-6">Ações Rápidas</h2>
          
          <div className="space-y-2 sm:space-y-3">
            <Button fullWidth variant="primary" icon={<Zap className="w-4 h-4" />} ariaLabel="Sincronizar atividades do Strava" size="md">
              <span className="text-sm sm:text-base">Sincronizar Strava</span>
            </Button>
            
            <Button fullWidth variant="secondary" icon={<Trophy className="w-4 h-4" />} ariaLabel="Ver todos os desafios" size="md">
              <span className="text-sm sm:text-base">Ver Desafios</span>
            </Button>
            
            <Button fullWidth variant="secondary" icon={<Calendar className="w-4 h-4" />} ariaLabel="Agendar próximo treino" size="md">
              <span className="text-sm sm:text-base">Agendar Treino</span>
            </Button>
          </div>

          {/* Notifications Card - Mobile Optimized */}
          <GlassCard variant="gradient" padding="sm" className="mt-4 sm:mt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Bell className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${notificationsEnabled ? 'text-success' : 'text-text-secondary'}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">Notificações</p>
                  <p className="text-xs text-text-secondary">
                    {notificationsEnabled ? 'Ativadas' : 'Desativadas'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={notificationsEnabled ? 'ghost' : 'primary'}
                onClick={notificationsEnabled ? undefined : enableNotifications}
                disabled={notificationsEnabled}
                ariaLabel={notificationsEnabled ? 'Notificações ativadas' : 'Ativar notificações'}
                className="shrink-0"
              >
                {notificationsEnabled ? 'Ativo' : 'Ativar'}
              </Button>
            </div>
          </GlassCard>
        </GlassPanel>
      </div>

      {/* Weekly Progress - Mobile Optimized */}
      <GlassPanel animation="scaleIn" animationDelay={0.3}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary">Progresso Semanal</h2>
          <div className="flex items-center gap-1 sm:gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-xs sm:text-sm font-medium text-success">+{mockStats.weeklyChange}%</span>
          </div>
        </div>

        {/* Progress bars - Mobile Optimized */}
        <div className="space-y-3 sm:space-y-4">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
            const progress = Math.random() * 100
            const isToday = index === new Date().getDay() - 1
            
            return (
              <motion.div
                key={day}
                className="flex items-center gap-2 sm:gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <span className={`text-xs sm:text-sm w-8 sm:w-10 ${isToday ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                  {day}
                </span>
                <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isToday ? 'bg-gradient-primary' : 'bg-primary/60'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + index * 0.05 }}
                  />
                </div>
                <span className="text-xs sm:text-sm text-text-secondary w-10 sm:w-12 text-right">
                  {Math.round(progress)}%
                </span>
              </motion.div>
            )
          })}
        </div>
      </GlassPanel>

      {/* Feature Flag Toggle Panel */}
      {showFeatureFlags && (
        <GlassPanel animation="slideIn" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Feature Flags</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFeatureFlags(false)}
              ariaLabel="Close feature flags"
            >
              Close
            </Button>
          </div>
          <div className="bg-secondary/5 rounded-lg p-4">
            <p className="text-sm text-text-secondary mb-2">
              Toggle features on/off to test different phases of the application.
            </p>
            <p className="text-xs text-text-secondary">
              Press Ctrl+Shift+F to open the full feature flag dev tools.
            </p>
          </div>
        </GlassPanel>
      )}

      {/* Phase 2 Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <AIInsightsWidget />
        <FeatureFlaggedMarketplace />
      </div>

      {/* Beta Features */}
      <div className="mt-6">
        <BetaFeatures />
      </div>
    </div>
  )
}