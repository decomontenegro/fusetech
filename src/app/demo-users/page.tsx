'use client'

import React, { useState } from 'react';
import { User, Activity, Trophy, Zap } from 'lucide-react';

const DEMO_USERS = [
  {
    id: 0,
    name: 'André Montenegro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'São Paulo, Brasil',
    totalActivities: 45,
    totalDistance: 287.5,
    level: 'advanced',
    description: 'Corredor experiente, foca em maratonas',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 1,
    name: 'Maria Silva',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    location: 'Rio de Janeiro, Brasil',
    totalActivities: 32,
    totalDistance: 198.3,
    level: 'intermediate',
    description: 'Ciclista urbana, adora pedalar na orla',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 2,
    name: 'João Santos',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Belo Horizonte, Brasil',
    totalActivities: 67,
    totalDistance: 423.7,
    level: 'expert',
    description: 'Triatleta dedicado, treina todos os dias',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 3,
    name: 'Ana Costa',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    location: 'Porto Alegre, Brasil',
    totalActivities: 23,
    totalDistance: 145.2,
    level: 'beginner',
    description: 'Iniciante motivada, começou há 3 meses',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 4,
    name: 'Carlos Oliveira',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    location: 'Brasília, Brasil',
    totalActivities: 89,
    totalDistance: 567.8,
    level: 'pro',
    description: 'Atleta profissional, competidor nacional',
    color: 'from-purple-500 to-indigo-600'
  }
];

const LEVEL_BADGES = {
  beginner: { emoji: '🌱', label: 'Iniciante', tokens: '1.000' },
  intermediate: { emoji: '🏃‍♀️', label: 'Intermediário', tokens: '2.500' },
  advanced: { emoji: '🏆', label: 'Avançado', tokens: '3.500' },
  expert: { emoji: '⭐', label: 'Expert', tokens: '5.000' },
  pro: { emoji: '👑', label: 'Profissional', tokens: '7.500' }
};

export default function DemoUsersPage() {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserLogin = async (userIndex) => {
    setLoading(true);
    setSelectedUser(userIndex);
    
    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIndex })
      });
      
      if (response.ok) {
        // Redirecionar para dashboard
        window.location.href = '/dashboard';
      } else {
        console.error('Demo login failed');
        setLoading(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FUSEtech Demo</h1>
              <p className="text-xs text-purple-600 font-medium">Escolha seu perfil de teste</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎭 Escolha seu Perfil Demo
              </span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Teste o FUSEtech com diferentes perfis de usuário. Cada perfil tem dados únicos e níveis de experiência diferentes.
            </p>
          </div>

          {/* User Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DEMO_USERS.map((user) => {
              const badge = LEVEL_BADGES[user.level];
              const isLoading = loading && selectedUser === user.id;
              
              return (
                <div
                  key={user.id}
                  className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-gray-100"
                >
                  {/* Avatar */}
                  <div className="text-center mb-6">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg"
                    />
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{user.location}</p>
                    
                    {/* Level Badge */}
                    <div className={`inline-flex items-center px-4 py-2 bg-gradient-to-r ${user.color} text-white rounded-full text-sm font-bold shadow-lg`}>
                      <span className="mr-2">{badge.emoji}</span>
                      {badge.label}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-600">Atividades</span>
                      </div>
                      <span className="font-bold text-gray-800">{user.totalActivities}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">Distância</span>
                      </div>
                      <span className="font-bold text-gray-800">{user.totalDistance}km</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-sm text-gray-600">Tokens</span>
                      </div>
                      <span className="font-bold text-gray-800">{badge.tokens}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 text-center italic">
                    {user.description}
                  </p>

                  {/* Login Button */}
                  <button
                    onClick={() => handleUserLogin(user.id)}
                    disabled={loading}
                    className={`w-full py-3 bg-gradient-to-r ${user.color} text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      `🚀 Entrar como ${user.name.split(' ')[0]}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-blue-800 mb-2">💡 Sobre o Demo</h3>
            <p className="text-blue-700">
              Cada perfil tem dados únicos, diferentes níveis de tokens e histórico de atividades. 
              Perfeito para testar todas as funcionalidades do FUSEtech sem limitações!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
