'use client'

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Lock, ArrowLeft, Filter, Award, Zap } from 'lucide-react';
import { achievements, Achievement, getAchievementsByCategory, getDifficultyColor } from '@/data/achievements';

export default function ConquistasPage() {
  const [user, setUser] = useState<any>(null);
  const [userAchievements, setUserAchievements] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>(achievements);
  const [userStats, setUserStats] = useState<any>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    filterAchievements();
  }, [selectedCategory]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      if (userData.authenticated) {
        setUser(userData.user);
        
        // Buscar conquistas do usuário
        const achievementsResponse = await fetch('/api/user/achievements');
        const achievementsData = await achievementsResponse.json();
        setUserAchievements(achievementsData.unlockedAchievements || []);
        setUserStats(achievementsData.stats || {});
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
  };

  const filterAchievements = () => {
    let filtered = achievements;

    if (selectedCategory !== 'all') {
      filtered = getAchievementsByCategory(selectedCategory);
    }

    // Filtrar conquistas ocultas que não foram desbloqueadas
    filtered = filtered.filter(achievement => 
      !achievement.isHidden || userAchievements.includes(achievement.id)
    );

    setFilteredAchievements(filtered);
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.includes(achievementId);
  };

  const getProgressPercentage = (achievement: Achievement) => {
    if (isUnlocked(achievement.id)) return 100;
    
    const stats = userStats;
    const req = achievement.requirements;
    
    switch (req.type) {
      case 'activities_count':
        const activityCount = req.activityType 
          ? stats.activitiesByType?.[req.activityType[0]] || 0
          : stats.totalActivities || 0;
        return Math.min(100, (activityCount / req.target) * 100);
      
      case 'distance_total':
        const distance = stats.totalDistance || 0;
        return Math.min(100, (distance / req.target) * 100);
      
      case 'streak_days':
        const streak = stats.currentStreak || 0;
        return Math.min(100, (streak / req.target) * 100);
      
      default:
        return 0;
    }
  };

  const getCategoryStats = () => {
    const categories = ['onboarding', 'activity', 'social', 'beta', 'special'];
    return categories.map(category => {
      const categoryAchievements = getAchievementsByCategory(category);
      const unlockedCount = categoryAchievements.filter(a => isUnlocked(a.id)).length;
      return {
        category,
        total: categoryAchievements.length,
        unlocked: unlockedCount,
        percentage: Math.round((unlockedCount / categoryAchievements.length) * 100)
      };
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Faça login para ver suas conquistas</h1>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  const totalUnlocked = userAchievements.length;
  const totalAchievements = achievements.filter(a => !a.isHidden).length;
  const completionPercentage = Math.round((totalUnlocked / totalAchievements) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
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
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Conquistas
                </h1>
                <p className="text-sm text-gray-500">{totalUnlocked}/{totalAchievements} desbloqueadas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-lg font-bold text-yellow-600">{completionPercentage}% completo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas Gerais */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Progresso Geral</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {getCategoryStats().map(stat => (
                <div key={stat.category} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">
                      {stat.category === 'onboarding' && '🚀'}
                      {stat.category === 'activity' && '🏃‍♂️'}
                      {stat.category === 'social' && '👥'}
                      {stat.category === 'beta' && '🏆'}
                      {stat.category === 'special' && '⭐'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{stat.category}</p>
                  <p className="text-xs text-gray-600">{stat.unlocked}/{stat.total}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            {['onboarding', 'activity', 'social', 'beta', 'special'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Conquistas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);
            const progress = getProgressPercentage(achievement);
            
            return (
              <div 
                key={achievement.id} 
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  unlocked ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                {/* Badge de Dificuldade */}
                <div className={`h-2 bg-gradient-to-r ${getDifficultyColor(achievement.difficulty)}`}></div>
                
                <div className="p-6">
                  {/* Ícone e Status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-4xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {achievement.isBetaExclusive && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          BETA
                        </span>
                      )}
                      {unlocked ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Nome e Descrição */}
                  <h3 className={`font-bold mb-2 ${unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm mb-4 ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>

                  {/* Progresso */}
                  {!unlocked && progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getDifficultyColor(achievement.difficulty)} h-2 rounded-full transition-all`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Recompensa */}
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-semibold capitalize ${
                      unlocked ? 'text-yellow-600' : 'text-gray-400'
                    }`}>
                      {achievement.difficulty}
                    </span>
                    <span className={`font-bold ${unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                      +{achievement.tokenReward} tokens
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhuma conquista encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
