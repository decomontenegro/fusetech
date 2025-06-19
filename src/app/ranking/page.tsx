'use client'

import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, ArrowLeft, Crown, Zap, Target } from 'lucide-react';
import { LeaderboardCategory, RankingUser, mockRankingUsers, getPositionChange, getVIPTierIcon, formatDistance } from '@/data/rankings';

export default function RankingPage() {
  const [user, setUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('overall_weekly');
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: RankingUser[] }>({});
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchRankings();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      if (userData.authenticated) {
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/rankings');
      const data = await response.json();
      
      setLeaderboards(data.leaderboards || {});
      setUserPosition(data.userPosition || null);
    } catch (error) {
      console.error('Erro ao buscar rankings:', error);
      // Usar dados mock em caso de erro
      setLeaderboards({
        overall_weekly: mockRankingUsers,
        tokens_weekly: [...mockRankingUsers].sort((a, b) => b.stats.totalTokens - a.stats.totalTokens),
        activities_weekly: [...mockRankingUsers].sort((a, b) => b.stats.totalActivities - a.stats.totalActivities),
        distance_weekly: [...mockRankingUsers].sort((a, b) => b.stats.totalDistance - a.stats.totalDistance),
        streak_current: [...mockRankingUsers].sort((a, b) => b.stats.currentStreak - a.stats.currentStreak),
        achievements_all: [...mockRankingUsers].sort((a, b) => b.stats.achievements - a.stats.achievements),
        missions_weekly: [...mockRankingUsers].sort((a, b) => b.stats.missionsCompleted - a.stats.missionsCompleted)
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'overall_weekly', name: 'Geral', icon: '🏆', color: 'from-yellow-400 to-orange-500' },
    { id: 'tokens_weekly', name: 'Tokens', icon: '💰', color: 'from-green-400 to-green-600' },
    { id: 'activities_weekly', name: 'Atividades', icon: '🏃‍♂️', color: 'from-blue-400 to-blue-600' },
    { id: 'distance_weekly', name: 'Distância', icon: '📏', color: 'from-purple-400 to-purple-600' },
    { id: 'streak_current', name: 'Sequência', icon: '🔥', color: 'from-red-400 to-red-600' },
    { id: 'achievements_all', name: 'Conquistas', icon: '🏅', color: 'from-indigo-400 to-indigo-600' },
    { id: 'missions_weekly', name: 'Missões', icon: '🎯', color: 'from-pink-400 to-pink-600' }
  ];

  const currentLeaderboard = leaderboards[selectedCategory] || [];
  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  const getMetricValue = (user: RankingUser, categoryId: string): string => {
    switch (categoryId) {
      case 'overall_weekly':
        return user.score.toLocaleString();
      case 'tokens_weekly':
        return user.stats.totalTokens.toLocaleString();
      case 'activities_weekly':
        return user.stats.totalActivities.toString();
      case 'distance_weekly':
        return formatDistance(user.stats.totalDistance);
      case 'streak_current':
        return `${user.stats.currentStreak} dias`;
      case 'achievements_all':
        return user.stats.achievements.toString();
      case 'missions_weekly':
        return user.stats.missionsCompleted.toString();
      default:
        return '0';
    }
  };

  const getPodiumUsers = () => {
    return currentLeaderboard.slice(0, 3);
  };

  const getOtherUsers = () => {
    return currentLeaderboard.slice(3);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Faça login para ver os rankings</h1>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Carregando rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Trophy className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Rankings
                </h1>
                <p className="text-sm text-gray-500">Competição saudável</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              {userPosition && (
                <p className="text-sm text-orange-600 font-semibold">#{userPosition}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros de Categoria */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white`
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pódio */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Medal className="w-6 h-6" />
              Pódio - {currentCategory?.name}
            </h2>
            
            <div className="flex justify-center items-end gap-4 mb-6">
              {getPodiumUsers().map((user, index) => {
                const position = index + 1;
                const heights = ['h-32', 'h-40', 'h-28']; // 2º, 1º, 3º
                const orders = [1, 0, 2]; // Ordem visual: 2º, 1º, 3º
                const actualIndex = orders.indexOf(index);
                
                return (
                  <div key={user.id} className={`flex flex-col items-center ${actualIndex === 1 ? 'order-2' : actualIndex === 0 ? 'order-1' : 'order-3'}`}>
                    {/* Avatar */}
                    <div className="mb-2">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-16 h-16 rounded-full border-4 border-yellow-400"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    {/* Pódio */}
                    <div className={`${heights[actualIndex]} w-24 ${
                      position === 1 ? 'bg-gradient-to-t from-yellow-400 to-yellow-500' :
                      position === 2 ? 'bg-gradient-to-t from-gray-300 to-gray-400' :
                      'bg-gradient-to-t from-amber-600 to-amber-700'
                    } rounded-t-lg flex flex-col justify-between items-center p-3 text-white`}>
                      <div className="text-3xl mb-2">
                        {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-sm">{user.name.split(' ')[0]}</div>
                        <div className="text-xs">{getMetricValue(user, selectedCategory)}</div>
                        {user.vipTier && (
                          <div className="text-lg mt-1">{getVIPTierIcon(user.vipTier)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista Completa */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Ranking Completo
            </h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {currentLeaderboard.map((rankUser, index) => {
              const isCurrentUser = user.id === rankUser.id;
              const positionChange = getPositionChange(rankUser.change);
              
              return (
                <div key={rankUser.id} className={`p-4 hover:bg-gray-50 transition-colors ${
                  isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Posição */}
                      <div className="flex items-center gap-2 min-w-[60px]">
                        <span className={`text-2xl font-bold ${
                          rankUser.position <= 3 ? 'text-yellow-600' : 'text-gray-600'
                        }`}>
                          #{rankUser.position}
                        </span>
                        <span className={`text-sm ${positionChange.color}`}>
                          {positionChange.icon}
                        </span>
                      </div>
                      
                      {/* Avatar e Nome */}
                      <div className="flex items-center gap-3">
                        {rankUser.avatar ? (
                          <img 
                            src={rankUser.avatar} 
                            alt={rankUser.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold">
                            {rankUser.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                              {rankUser.name}
                            </span>
                            {rankUser.vipTier && (
                              <span className="text-lg">{getVIPTierIcon(rankUser.vipTier)}</span>
                            )}
                            {rankUser.badge && (
                              <span className="text-lg">{rankUser.badge}</span>
                            )}
                            {isCurrentUser && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                                VOCÊ
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rankUser.stats.totalActivities} atividades • {formatDistance(rankUser.stats.totalDistance)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Métrica */}
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-800">
                        {getMetricValue(rankUser, selectedCategory)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedCategory === 'overall_weekly' ? 'pontos' :
                         selectedCategory === 'tokens_weekly' ? 'tokens' :
                         selectedCategory === 'activities_weekly' ? 'atividades' :
                         selectedCategory === 'distance_weekly' ? '' :
                         selectedCategory === 'streak_current' ? '' :
                         selectedCategory === 'achievements_all' ? 'conquistas' :
                         'missões'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recompensas */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Recompensas da Semana
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg">
              <div className="text-3xl mb-2">🥇</div>
              <div className="font-bold text-gray-800">1º Lugar</div>
              <div className="text-sm text-gray-600">2000 tokens + Produto grátis</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
              <div className="text-3xl mb-2">🥈</div>
              <div className="font-bold text-gray-800">2º Lugar</div>
              <div className="text-sm text-gray-600">1500 tokens + 50% desconto</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg">
              <div className="text-3xl mb-2">🥉</div>
              <div className="font-bold text-gray-800">3º Lugar</div>
              <div className="text-sm text-gray-600">1000 tokens + 25% desconto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
