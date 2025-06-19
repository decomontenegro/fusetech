'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Gift, ArrowLeft, Star, Trophy, Zap } from 'lucide-react';
import { GameEvent, activeEvents, getEventStatus, getEventTypeIcon, getEventTypeColor } from '@/data/events';

export default function EventosPage() {
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<GameEvent[]>(activeEvents);
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [userProgress, setUserProgress] = useState<{ [eventId: string]: any }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchEvents();
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

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      
      setEvents(data.events || activeEvents);
      setUserProgress(data.userProgress || {});
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      // Usar dados mock em caso de erro
      setEvents(activeEvents);
    } finally {
      setLoading(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });

      if (response.ok) {
        alert('🎉 Você se inscreveu no evento!');
        fetchEvents(); // Atualizar dados
      }
    } catch (error) {
      console.error('Erro ao se inscrever no evento:', error);
    }
  };

  const getActiveEvents = () => events.filter(e => e.status === 'active');
  const getUpcomingEvents = () => events.filter(e => e.status === 'upcoming');
  const getEndingSoonEvents = () => events.filter(e => e.status === 'ending_soon');

  const EventCard = ({ event, size = 'normal' }: { event: GameEvent, size?: 'normal' | 'large' }) => {
    const eventStatus = getEventStatus(event);
    const progress = userProgress[event.id] || {};
    const isParticipating = progress.isParticipating || false;
    
    const completedRequirements = event.requirements.filter(req => 
      progress[req.id]?.completed
    ).length;
    
    const totalRequirements = event.requirements.length;
    const overallProgress = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;

    return (
      <div 
        className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl cursor-pointer ${
          size === 'large' ? 'col-span-2' : ''
        }`}
        onClick={() => setSelectedEvent(event)}
      >
        {/* Header com gradiente */}
        <div className={`h-32 bg-gradient-to-r ${event.color} relative`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-3xl">{event.icon}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              event.status === 'active' ? 'bg-green-500 text-white' :
              event.status === 'upcoming' ? 'bg-blue-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {event.type.toUpperCase()}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              eventStatus.urgency === 'high' ? 'bg-red-500 text-white' :
              eventStatus.urgency === 'medium' ? 'bg-yellow-500 text-white' :
              'bg-white/20 text-white'
            }`}>
              {eventStatus.status} {eventStatus.timeRemaining}
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold">{event.name}</h3>
            <p className="text-white/90 text-sm">{event.description}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Participantes */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {event.participants} participantes
                {event.maxParticipants && ` / ${event.maxParticipants}`}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {new Date(event.endDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Progresso (se participando) */}
          {isParticipating && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progresso Geral</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${event.color} h-2 rounded-full transition-all`}
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {completedRequirements}/{totalRequirements} objetivos completos
              </div>
            </div>
          )}

          {/* Recompensas principais */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Recompensas
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.rewards.slice(0, 3).map(reward => (
                <div key={reward.id} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
                  <span>{reward.icon}</span>
                  <span>{typeof reward.value === 'number' ? `${reward.value}` : reward.value}</span>
                </div>
              ))}
              {event.rewards.length > 3 && (
                <div className="text-xs text-gray-500 px-2 py-1">
                  +{event.rewards.length - 3} mais
                </div>
              )}
            </div>
          </div>

          {/* Ação */}
          <div className="flex gap-2">
            {!isParticipating && event.status === 'active' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  joinEvent(event.id);
                }}
                className={`flex-1 py-2 px-4 bg-gradient-to-r ${event.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all`}
              >
                Participar
              </button>
            )}
            {isParticipating && (
              <div className="flex-1 py-2 px-4 bg-green-100 text-green-800 rounded-lg font-semibold text-center">
                ✓ Participando
              </div>
            )}
            {event.status === 'upcoming' && (
              <div className="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg font-semibold text-center">
                Em breve
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Detalhes
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Faça login para ver os eventos</h1>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
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
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Eventos
                </h1>
                <p className="text-sm text-gray-500">Campanhas e desafios especiais</p>
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
        {/* Eventos Terminando Logo */}
        {getEndingSoonEvents().length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-800">Terminando Logo!</h2>
              <span className="text-sm text-red-600 font-semibold">Últimas horas</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getEndingSoonEvents().map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Eventos Ativos */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-800">Eventos Ativos</h2>
            <span className="text-sm text-gray-500">Participe agora</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {getActiveEvents().map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Próximos Eventos */}
        {getUpcomingEvents().length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Próximos Eventos</h2>
              <span className="text-sm text-gray-500">Fique atento</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getUpcomingEvents().map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Suas Estatísticas de Eventos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {events.filter(e => userProgress[e.id]?.isParticipating).length}
              </div>
              <div className="text-sm text-gray-600">Participando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {events.filter(e => userProgress[e.id]?.completed).length}
              </div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(userProgress).reduce((sum: number, p: any) => sum + (p.tokensEarned || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Tokens Ganhos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(userProgress).reduce((sum: number, p: any) => sum + (p.rewardsEarned || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Recompensas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`h-40 bg-gradient-to-r ${selectedEvent.color} relative`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selectedEvent.icon}</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                    {selectedEvent.type.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{selectedEvent.name}</h2>
                <p className="text-white/90">{selectedEvent.description}</p>
              </div>
            </div>
            
            <div className="p-6">
              {/* Informações do evento */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Período</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedEvent.startDate).toLocaleDateString('pt-BR')} - {new Date(selectedEvent.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Participantes</h4>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.participants}{selectedEvent.maxParticipants && ` / ${selectedEvent.maxParticipants}`}
                  </p>
                </div>
              </div>

              {/* Objetivos */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Objetivos</h4>
                <div className="space-y-3">
                  {selectedEvent.requirements.map(req => (
                    <div key={req.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{req.description}</span>
                        <span className="text-sm text-gray-600">{req.target} {req.unit}</span>
                      </div>
                      {userProgress[selectedEvent.id]?.[req.id] && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${selectedEvent.color} h-2 rounded-full transition-all`}
                            style={{ width: `${userProgress[selectedEvent.id][req.id].percentage}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recompensas */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Recompensas</h4>
                <div className="space-y-2">
                  {selectedEvent.rewards.map(reward => (
                    <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{reward.icon}</span>
                        <div>
                          <div className="font-medium text-gray-800">{reward.description}</div>
                          <div className="text-sm text-gray-600 capitalize">{reward.condition.replace('_', ' ')}</div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-800">
                        {typeof reward.value === 'number' ? `${reward.value}` : reward.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regras */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Regras</h4>
                <ul className="space-y-1">
                  {selectedEvent.rules.map((rule, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ações */}
              <div className="flex gap-3">
                {!userProgress[selectedEvent.id]?.isParticipating && selectedEvent.status === 'active' && (
                  <button
                    onClick={() => {
                      joinEvent(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    className={`flex-1 py-3 px-6 bg-gradient-to-r ${selectedEvent.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all`}
                  >
                    Participar do Evento
                  </button>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
