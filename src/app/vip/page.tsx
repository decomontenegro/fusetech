'use client'

import React, { useState, useEffect } from 'react';
import { Crown, Star, Vote, ArrowLeft, Users, Zap, Gift, TrendingUp } from 'lucide-react';
import { VIPTier, VIPProject, activeVIPProjects } from '@/data/vip-program';

export default function VIPPage() {
  const [user, setUser] = useState<any>(null);
  const [currentTier, setCurrentTier] = useState<VIPTier | null>(null);
  const [nextTierProgress, setNextTierProgress] = useState<any>(null);
  const [projects, setProjects] = useState<VIPProject[]>(activeVIPProjects);
  const [userVotes, setUserVotes] = useState<{ [projectId: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVIPData();
  }, []);

  const fetchVIPData = async () => {
    try {
      const response = await fetch('/api/vip');
      const data = await response.json();
      
      if (data.authenticated) {
        setUser(data.user);
        setCurrentTier(data.currentTier);
        setNextTierProgress(data.nextTierProgress);
        setUserVotes(data.userVotes || {});
      }
    } catch (error) {
      console.error('Erro ao buscar dados VIP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (projectId: string, optionId: string) => {
    try {
      const response = await fetch('/api/vip/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, optionId })
      });

      if (response.ok) {
        setUserVotes(prev => ({ ...prev, [projectId]: optionId }));
        // Atualizar contagem de votos
        setProjects(prev => prev.map(project => {
          if (project.id === projectId) {
            return {
              ...project,
              currentVotes: {
                ...project.currentVotes,
                [optionId]: (project.currentVotes[optionId] || 0) + 1
              },
              totalVotes: project.totalVotes + 1
            };
          }
          return project;
        }));
        alert('🗳️ Voto registrado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const canAccessProject = (project: VIPProject): boolean => {
    if (!currentTier) return false;
    
    const tierPriority = {
      'bronze_vip': 1,
      'silver_vip': 2,
      'gold_vip': 3,
      'diamond_vip': 4
    };
    
    return tierPriority[currentTier.id as keyof typeof tierPriority] >= 
           tierPriority[project.requiredTier as keyof typeof tierPriority];
  };

  const getVotePercentage = (project: VIPProject, optionId: string): number => {
    if (project.totalVotes === 0) return 0;
    return Math.round(((project.currentVotes[optionId] || 0) / project.totalVotes) * 100);
  };

  const getTimeRemaining = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h restantes`;
    if (hours > 0) return `${hours}h restantes`;
    return 'Encerrando em breve';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Faça login para acessar o programa VIP</h1>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Carregando programa VIP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
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
              <Crown className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Programa VIP
                </h1>
                <p className="text-sm text-gray-500">Co-criadores FuseLabs</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              {currentTier ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentTier.icon}</span>
                  <span className="text-sm font-semibold text-purple-600">{currentTier.name}</span>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Não qualificado</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status VIP Atual */}
        <div className="mb-8">
          {currentTier ? (
            <div className={`bg-gradient-to-r ${currentTier.color} rounded-2xl shadow-lg p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{currentTier.icon}</div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentTier.name}</h2>
                    <p className="text-white/90">{currentTier.description}</p>
                  </div>
                </div>
                <Crown className="w-12 h-12 text-white/80" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentTier.benefits.slice(0, 4).map(benefit => (
                  <div key={benefit.id} className="text-center">
                    <div className="text-2xl mb-1">{benefit.icon}</div>
                    <div className="text-sm font-semibold">{benefit.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Ainda não é VIP</h2>
                <p className="text-gray-600 mb-4">Continue se exercitando e engajando para se qualificar!</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Voltar ao Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Progresso para Próximo Tier */}
        {nextTierProgress?.nextTier && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Progresso para {nextTierProgress.nextTier.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(nextTierProgress.progress).map(([key, data]: [string, any]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm text-gray-600 mb-1 capitalize">{key}</div>
                    <div className="text-lg font-bold text-gray-800">{data.current}/{data.required}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{Math.round(data.percentage)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projetos de Votação */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Vote className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Projetos Ativos</h2>
            <span className="text-sm text-gray-500">Sua voz importa</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map(project => {
              const hasAccess = canAccessProject(project);
              const hasVoted = userVotes[project.id];
              
              return (
                <div key={project.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                  !hasAccess ? 'opacity-60' : ''
                }`}>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800">{project.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          project.type === 'product_design' ? 'bg-blue-100 text-blue-800' :
                          project.type === 'flavor_choice' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {project.type.replace('_', ' ').toUpperCase()}
                        </span>
                        {!hasAccess && <span className="text-xs text-red-500">VIP {project.requiredTier.split('_')[0]} necessário</span>}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    
                    {project.votingEnds && (
                      <div className="text-sm text-gray-500 mb-4">
                        ⏰ {getTimeRemaining(project.votingEnds)}
                      </div>
                    )}

                    <div className="space-y-3">
                      {project.options.map(option => {
                        const percentage = getVotePercentage(project, option.id);
                        const isSelected = hasVoted === option.id;
                        
                        return (
                          <div key={option.id} className={`border-2 rounded-lg p-3 transition-all ${
                            isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800">{option.name}</h4>
                              <span className="text-sm text-gray-600">{percentage}%</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                              <div 
                                className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            
                            {hasAccess && !hasVoted && (
                              <button
                                onClick={() => handleVote(project.id, option.id)}
                                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                Votar nesta opção
                              </button>
                            )}
                            
                            {isSelected && (
                              <div className="text-center text-purple-600 font-semibold">
                                ✓ Seu voto
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-4 text-center text-sm text-gray-500">
                      {project.totalVotes} votos totais
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefícios VIP */}
        {currentTier && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Seus Benefícios VIP
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTier.benefits.map(benefit => (
                <div key={benefit.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{benefit.icon}</span>
                    <h4 className="font-semibold text-gray-800">{benefit.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                  {benefit.value && (
                    <div className="mt-2 text-sm font-semibold text-green-600">
                      {benefit.value}% de desconto
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
