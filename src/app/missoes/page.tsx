'use client'

import React, { useState, useEffect } from 'react';
import { Target, Clock, Star, ArrowLeft, CheckCircle, Timer, Zap } from 'lucide-react';
import { Mission } from '@/data/missions';

export default function MissoesPage() {
  const [user, setUser] = useState<any>(null);
  const [dailyMissions, setDailyMissions] = useState<Mission[]>([]);
  const [weeklyMissions, setWeeklyMissions] = useState<Mission[]>([]);
  const [specialMissions, setSpecialMissions] = useState<Mission[]>([]);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchMissions();
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

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/missions');
      const data = await response.json();
      
      setDailyMissions(data.daily || []);
      setWeeklyMissions(data.weekly || []);
      setSpecialMissions(data.special || []);
      setCompletedMissions(data.completed || []);
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimMission = async (missionId: string) => {
    try {
      const response = await fetch('/api/missions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`🎉 Missão completada! +${data.tokensEarned} tokens!`);
        setCompletedMissions(prev => [...prev, missionId]);
        fetchMissions(); // Atualizar missões
      }
    } catch (error) {
      console.error('Erro ao resgatar missão:', error);
    }
  };

  const getMissionProgress = async (mission: Mission) => {
    try {
      const response = await fetch(`/api/missions/progress?missionId=${mission.id}`);
      const data = await response.json();
      return data.progress || 0;
    } catch (error) {
      return 0;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-400 to-green-600';
      case 'medium': return 'from-yellow-400 to-orange-500';
      case 'hard': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getTimeRemaining = (expiresAt?: Date) => {
    if (!expiresAt) return '';
    
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirada';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d restantes`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const MissionCard = ({ mission, type }: { mission: Mission, type: string }) => {
    const isCompleted = completedMissions.includes(mission.id);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      if (!isCompleted) {
        getMissionProgress(mission).then(setProgress);
      }
    }, [mission.id, isCompleted]);

    const progressPercentage = Math.min(100, (progress / mission.requirements.target) * 100);
    const canClaim = progressPercentage >= 100 && !isCompleted;

    return (
      <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
        isCompleted ? 'ring-2 ring-green-400' : canClaim ? 'ring-2 ring-yellow-400' : ''
      }`}>
        {/* Header com tipo e dificuldade */}
        <div className={`h-2 bg-gradient-to-r ${getDifficultyColor(mission.difficulty)}`}></div>
        
        <div className="p-6">
          {/* Ícone e Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`text-3xl ${isCompleted ? '' : 'grayscale opacity-70'}`}>
                {mission.icon}
              </div>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  type === 'daily' ? 'bg-blue-100 text-blue-800' :
                  type === 'weekly' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {type === 'daily' ? 'DIÁRIA' : type === 'weekly' ? 'SEMANAL' : 'ESPECIAL'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {mission.expiresAt && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {getTimeRemaining(mission.expiresAt)}
                </div>
              )}
              {isCompleted ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : canClaim ? (
                <Star className="w-6 h-6 text-yellow-500" />
              ) : (
                <Target className="w-6 h-6 text-gray-400" />
              )}
            </div>
          </div>

          {/* Nome e Descrição */}
          <h3 className={`font-bold mb-2 ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
            {mission.name}
          </h3>
          <p className={`text-sm mb-4 ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
            {mission.description}
          </p>

          {/* Progresso */}
          {!isCompleted && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progresso: {progress}/{mission.requirements.target}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${getDifficultyColor(mission.difficulty)} h-2 rounded-full transition-all`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Recompensa e Ação */}
          <div className="flex justify-between items-center">
            <div>
              <span className={`font-bold text-lg ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                +{mission.tokenReward} tokens
              </span>
              {mission.bonusReward && (
                <span className="text-xs text-orange-600 ml-2">
                  +{mission.bonusReward} bônus
                </span>
              )}
            </div>
            
            {canClaim && (
              <button
                onClick={() => claimMission(mission.id)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Resgatar
              </button>
            )}
            
            {isCompleted && (
              <span className="text-green-600 font-semibold text-sm">
                ✓ Completa
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Faça login para ver suas missões</h1>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Carregando missões...</p>
        </div>
      </div>
    );
  }

  const totalMissions = dailyMissions.length + weeklyMissions.length + specialMissions.length;
  const totalCompleted = completedMissions.length;

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
              <Target className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Missões
                </h1>
                <p className="text-sm text-gray-500">{totalCompleted}/{totalMissions} completadas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Beta Tester</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Missões Diárias */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Missões Diárias</h2>
            <span className="text-sm text-gray-500">Renovam a cada dia</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dailyMissions.map(mission => (
              <MissionCard key={mission.id} mission={mission} type="daily" />
            ))}
          </div>
        </div>

        {/* Missões Semanais */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Missões Semanais</h2>
            <span className="text-sm text-gray-500">Renovam toda segunda-feira</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weeklyMissions.map(mission => (
              <MissionCard key={mission.id} mission={mission} type="weekly" />
            ))}
          </div>
        </div>

        {/* Missões Especiais */}
        {specialMissions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Missões Especiais</h2>
              <span className="text-sm text-gray-500">Eventos limitados</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialMissions.map(mission => (
                <MissionCard key={mission.id} mission={mission} type="special" />
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Estatísticas de Missões</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCompleted}</div>
              <div className="text-sm text-gray-600">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalMissions - totalCompleted}</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {totalMissions > 0 ? Math.round((totalCompleted / totalMissions) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Taxa de Conclusão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {dailyMissions.filter(m => completedMissions.includes(m.id)).length}
              </div>
              <div className="text-sm text-gray-600">Diárias Hoje</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
