'use client'

import React, { useState } from 'react'
import { Activity, ExternalLink, Loader2, CheckCircle } from 'lucide-react'
import { stravaService } from '@/lib/strava'
import { toast } from 'sonner'

interface StravaConnectProps {
  userId: string
  isConnected: boolean
  onConnectionChange: (connected: boolean) => void
}

export function StravaConnect({ userId, isConnected, onConnectionChange }: StravaConnectProps) {
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const handleConnect = () => {
    const authUrl = stravaService.getAuthUrl()
    window.location.href = authUrl
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const newActivitiesCount = await stravaService.syncActivities(userId)
      toast.success(`${newActivitiesCount} novas atividades sincronizadas!`)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao sincronizar atividades')
    } finally {
      setSyncing(false)
    }
  }

  if (isConnected) {
    return (
      <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl p-8 border-2 border-orange-300 text-center shadow-xl">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        
        <h3 className="text-3xl font-black mb-4">
          <span className="bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            🔗 Strava Conectado!
          </span>
        </h3>
        
        <p className="text-xl text-orange-700 font-semibold mb-6">
          Suas atividades estão sendo sincronizadas automaticamente! 🚀
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {syncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                Sincronizar Agora
              </>
            )}
          </button>

          <a
            href="https://www.strava.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-2xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ExternalLink className="w-5 h-5" />
            Abrir Strava
          </a>
        </div>

        <div className="mt-6 p-4 bg-white/50 rounded-2xl">
          <p className="text-sm text-orange-700">
            💡 <strong>Dica:</strong> Cada quilômetro que você correr, pedalar ou caminhar gera tokens FUSE automaticamente!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl p-12 border-2 border-purple-300 text-center shadow-xl">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Activity className="w-10 h-10 text-white" />
      </div>
      
      <h3 className="text-3xl font-black mb-4">
        <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
          🏃‍♂️ Conectar Strava
        </span>
      </h3>
      
      <p className="text-xl text-purple-700 font-semibold mb-6">
        Conecte seu Strava para começar a ganhar <span className="text-yellow-500">tokens</span> por cada atividade! ⚡
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/70 p-4 rounded-2xl">
          <div className="text-2xl mb-2">🏃‍♂️</div>
          <p className="font-bold text-purple-800">Corrida</p>
          <p className="text-sm text-purple-600">1.2x tokens</p>
        </div>
        <div className="bg-white/70 p-4 rounded-2xl">
          <div className="text-2xl mb-2">🚴‍♂️</div>
          <p className="font-bold text-purple-800">Ciclismo</p>
          <p className="text-sm text-purple-600">0.8x tokens</p>
        </div>
        <div className="bg-white/70 p-4 rounded-2xl">
          <div className="text-2xl mb-2">🚶‍♂️</div>
          <p className="font-bold text-purple-800">Caminhada</p>
          <p className="text-sm text-purple-600">1.0x tokens</p>
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="px-10 py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl text-xl font-black hover:shadow-2xl transition-all transform hover:scale-110 disabled:opacity-50 flex items-center justify-center gap-3 mx-auto"
      >
        {loading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <ExternalLink className="w-6 h-6" />
            🔗 Conectar com Strava
          </>
        )}
      </button>

      <div className="mt-6 p-4 bg-white/50 rounded-2xl">
        <p className="text-sm text-purple-700">
          🔒 <strong>Seguro:</strong> Só acessamos suas atividades públicas. Seus dados estão protegidos.
        </p>
      </div>
    </div>
  )
}
