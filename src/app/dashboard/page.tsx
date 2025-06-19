'use client'

import React, { useState, useEffect } from 'react';
import { Activity, Zap, Trophy, Coins, TrendingUp, Calendar, Target, Award, Crown, Star, Bell } from 'lucide-react';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalTokens, setTotalTokens] = useState(0);

  useEffect(() => {
    setMounted(true);
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Verificar se usuário está autenticado
      const userResponse = await fetch('/api/user');
      const userData = await userResponse.json();

      if (!userData.authenticated) {
        // Redirecionar para login
        window.location.href = '/';
        return;
      }

      setUser(userData.user);

      // Carregar atividades reais
      const activitiesResponse = await fetch('/api/activities');
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.activities);
        setTotalTokens(activitiesData.totalTokens);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <p className="text-gray-700 font-semibold">
            {loading ? 'Carregando suas atividades...' : 'Carregando Dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // Calcular estatísticas dos dados reais
  const userStats = {
    name: user?.name || 'Usuário',
    totalTokens: totalTokens,
    weeklyTokens: calculateWeeklyTokens(activities),
    totalActivities: activities.length,
    weeklyActivities: calculateWeeklyActivities(activities),
    totalDistance: calculateTotalDistance(activities),
    weeklyDistance: calculateWeeklyDistance(activities)
  };

  const recentActivities = activities.slice(0, 4).map(activity => ({
    id: activity.id,
    type: translateActivityType(activity.type),
    distance: `${(activity.distance / 1000).toFixed(1)} km`,
    time: formatDuration(activity.duration),
    tokens: activity.tokens,
    date: formatDate(activity.date),
    calories: activity.calories || Math.round(activity.distance * 0.06) // Estimativa se não tiver
  }));

  const achievements = [
    { id: 1, title: 'Primeira Corrida', desc: 'Complete sua primeira atividade', icon: '🏃‍♂️', unlocked: activities.length > 0 },
    { id: 2, title: '100 FUSE', desc: 'Ganhe 100 FUSE tokens', icon: '💎', unlocked: totalTokens >= 100 },
    { id: 3, title: 'Semana Ativa', desc: '5 atividades em uma semana', icon: '🔥', unlocked: userStats.weeklyActivities >= 5 },
    { id: 4, title: 'Maratonista', desc: 'Corra 42km em um mês', icon: '🏆', unlocked: userStats.totalDistance >= 42 },
  ];

  // Funções auxiliares
  function calculateWeeklyTokens(activities: any[]) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return activities
      .filter(activity => new Date(activity.date) >= oneWeekAgo)
      .reduce((sum, activity) => sum + activity.tokens, 0);
  }

  function calculateWeeklyActivities(activities: any[]) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return activities.filter(activity => new Date(activity.date) >= oneWeekAgo).length;
  }

  function calculateTotalDistance(activities: any[]) {
    return activities.reduce((sum, activity) => sum + (activity.distance / 1000), 0);
  }

  function calculateWeeklyDistance(activities: any[]) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return activities
      .filter(activity => new Date(activity.date) >= oneWeekAgo)
      .reduce((sum, activity) => sum + (activity.distance / 1000), 0);
  }

  function translateActivityType(type: string) {
    const translations: { [key: string]: string } = {
      'Run': 'Corrida',
      'Ride': 'Ciclismo',
      'Walk': 'Caminhada',
      'Swim': 'Natação',
      'Hike': 'Trilha',
      'VirtualRide': 'Bike Indoor',
      'VirtualRun': 'Esteira'
    };
    return translations[type] || type;
  }

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays - 1} dias atrás`;

    return date.toLocaleDateString('pt-BR');
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/user', { method: 'DELETE' });
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Olá, {userStats.name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">Aqui está seu resumo de atividades</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/notificacoes'}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Notificações"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userStats.name}</p>
                <p className="text-xs text-gray-500">Conectado via Strava</p>
              </div>
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={userStats.name}
                  className="w-12 h-12 rounded-full border-2 border-gray-200"
                />
              )}
              {!user?.avatar && (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-2xl">F</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{userStats.totalTokens}</h3>
            <p className="text-sm text-gray-600">FUSE Tokens</p>
            <div className="mt-2 text-xs text-green-600 font-semibold">+{userStats.weeklyTokens} esta semana</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{userStats.totalActivities}</h3>
            <p className="text-sm text-gray-600">Atividades</p>
            <div className="mt-2 text-xs text-green-600 font-semibold">+{userStats.weeklyActivities} esta semana</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">{userStats.totalDistance}</h3>
            <p className="text-sm text-gray-600">km percorridos</p>
            <div className="mt-2 text-xs text-green-600 font-semibold">+{userStats.weeklyDistance}km esta semana</div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-gray-500">Meta</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-1">78%</h3>
            <p className="text-sm text-gray-600">Meta semanal</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{width: '78%'}}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Atividades Recentes</h2>
                <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">Ver todas</button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{activity.type}</h3>
                        <p className="text-sm text-gray-600">{activity.distance} • {activity.time} • {activity.calories} cal</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-lg">+{activity.tokens}</p>
                      <p className="text-xs text-gray-500">FUSE</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Conquistas</h2>
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`p-4 rounded-xl border-2 transition-all ${
                    achievement.unlocked 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-green-800' : 'text-gray-600'}`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${achievement.unlocked ? 'text-green-600' : 'text-gray-500'}`}>
                          {achievement.desc}
                        </p>
                      </div>
                      {achievement.unlocked && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Eventos Especiais */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Star className="w-12 h-12 text-white" />
                <div>
                  <h2 className="text-2xl font-bold">Eventos Especiais</h2>
                  <p className="text-white/90">Campanhas e desafios exclusivos</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/eventos'}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-semibold"
              >
                Ver Eventos
              </button>
            </div>
          </div>
        </div>

        {/* Programa VIP */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="w-12 h-12 text-white" />
                <div>
                  <h2 className="text-2xl font-bold">Programa VIP</h2>
                  <p className="text-white/90">Torne-se um co-criador FuseLabs</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/vip'}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all font-semibold"
              >
                Acessar VIP
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <button
              onClick={() => window.location.href = '/missoes'}
              className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
            >
              <Target className="w-6 h-6" />
              <span className="text-sm font-semibold">Missões</span>
            </button>
            <button
              onClick={() => window.location.href = '/ranking'}
              className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
            >
              <Trophy className="w-6 h-6" />
              <span className="text-sm font-semibold">Ranking</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2">
              <Zap className="w-6 h-6" />
              <span className="text-sm font-semibold">Sincronizar</span>
            </button>
            <button
              onClick={() => window.location.href = '/loja'}
              className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
            >
              <Trophy className="w-6 h-6" />
              <span className="text-sm font-semibold">Loja</span>
            </button>
            <button
              onClick={() => window.location.href = '/conquistas'}
              className="p-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2"
            >
              <Award className="w-6 h-6" />
              <span className="text-sm font-semibold">Conquistas</span>
            </button>
            <button className="p-4 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all flex flex-col items-center gap-2">
              <Activity className="w-6 h-6" />
              <span className="text-sm font-semibold">Atividade</span>
            </button>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            ← Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}
