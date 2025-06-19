'use client'

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Trophy, Coins, Play, ArrowRight, CheckCircle } from 'lucide-react';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [activities, setActivities] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Simular atividades
  const mockActivities = [
    { id: 1, type: 'Corrida', distance: '5.2 km', time: '25 min', tokens: 52, date: 'Hoje' },
    { id: 2, type: 'Ciclismo', distance: '15.8 km', time: '45 min', tokens: 79, date: 'Ontem' },
    { id: 3, type: 'Caminhada', distance: '3.1 km', time: '35 min', tokens: 31, date: '2 dias atrás' },
  ];

  const steps = [
    { title: 'Bem-vindo ao FUSEtech!', desc: 'Transforme movimento em tokens' },
    { title: 'Conectar Strava', desc: 'Simular conexão com Strava' },
    { title: 'Sincronizar Atividades', desc: 'Importar suas atividades' },
    { title: 'Ganhar Tokens', desc: 'Ver seus FUSE tokens' },
    { title: 'Dashboard Completo', desc: 'Explorar todas as funcionalidades' }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Simular ações em cada step
      switch (currentStep + 1) {
        case 1:
          // Simular conexão Strava
          setTimeout(() => setIsConnected(true), 1500);
          break;
        case 2:
          // Simular importação de atividades
          setTimeout(() => setActivities(mockActivities), 2000);
          break;
        case 3:
          // Simular cálculo de tokens
          setTimeout(() => setTokens(162), 1000);
          break;
        case 4:
          // Redirecionar para dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          break;
      }
    }
  };

  const handleSkipToEnd = () => {
    setCurrentStep(4);
    setIsConnected(true);
    setActivities(mockActivities);
    setTokens(162);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FUSEtech Demo
          </h1>
          <p className="text-gray-600 mt-2">Veja como funciona em 30 segundos</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Progresso</span>
            <span className="text-sm text-gray-600">{currentStep + 1}/{steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">{steps[currentStep].desc}</p>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 0 && (
              <div className="text-center">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-2xl">
                    <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-blue-700">Conecte</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl">
                    <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-purple-700">Mova-se</p>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-2xl">
                    <Coins className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-pink-700">Ganhe</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="text-center">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {isConnected ? (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  ) : (
                    <div className="w-12 h-12 bg-orange-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-lg font-semibold">
                  {isConnected ? '✅ Conectado ao Strava!' : '🔄 Conectando ao Strava...'}
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-center">
                  {activities.length > 0 ? '✅ Atividades Importadas!' : '🔄 Importando atividades...'}
                </h3>
                {activities.length > 0 && (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-semibold">{activity.type}</p>
                            <p className="text-sm text-gray-600">{activity.distance} • {activity.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">+{activity.tokens}</p>
                          <p className="text-xs text-gray-500">FUSE</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <div className="text-center">
                    <Coins className="w-12 h-12 text-white mx-auto mb-1" />
                    <p className="text-2xl font-bold text-white">{tokens}</p>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Você ganhou {tokens} FUSE tokens!
                </h3>
                <p className="text-gray-600">
                  Baseado nas suas últimas 3 atividades
                </p>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  🎉 Demo Completa!
                </h3>
                <p className="text-gray-600 mb-6">
                  Agora você pode explorar o dashboard completo
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="font-semibold text-blue-700">✅ Strava Conectado</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="font-semibold text-green-700">✅ {tokens} FUSE Tokens</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <p className="font-semibold text-purple-700">✅ {activities.length} Atividades</p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-xl">
                    <p className="font-semibold text-pink-700">✅ Dashboard Ativo</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleSkipToEnd}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              ⚡ Pular Demo
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <Trophy className="w-5 h-5" />
                  Ir para Dashboard
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <p className="text-2xl font-bold text-blue-600">25K+</p>
            <p className="text-sm text-gray-600">Usuários</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <p className="text-2xl font-bold text-purple-600">5.2M</p>
            <p className="text-sm text-gray-600">Tokens</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <p className="text-2xl font-bold text-green-600">1.8M</p>
            <p className="text-sm text-gray-600">Atividades</p>
          </div>
        </div>
      </div>
    </div>
  );
}
