'use client'

import React, { useState, useEffect } from 'react';
import { Bell, Settings, ArrowLeft, Check, X, Filter, BellOff } from 'lucide-react';
import { Notification, mockNotifications, formatNotificationTime, getNotificationColor, getCategoryColor } from '@/data/notifications';

export default function NotificacoesPage() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'fitness' | 'rewards' | 'social' | 'events' | 'system'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchNotifications();
    requestNotificationPermission();
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      setNotifications(data.notifications || mockNotifications);
      setNotificationSettings(data.settings);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      // Usar dados mock em caso de erro
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
      }
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const updateSettings = async (newSettings: any) => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        setNotificationSettings(newSettings);
        alert('Configurações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const NotificationCard = ({ notification }: { notification: Notification }) => {
    const isExpired = notification.expiresAt && new Date() > notification.expiresAt;
    
    return (
      <div className={`bg-white rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md ${
        notification.isRead ? 'border-gray-300 opacity-75' : `border-${notification.priority === 'high' ? 'red' : notification.priority === 'medium' ? 'blue' : 'gray'}-500`
      } ${isExpired ? 'opacity-50' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`text-2xl ${notification.isRead ? 'grayscale' : ''}`}>
              {notification.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
                  {notification.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(notification.category)} bg-gray-100`}>
                  {notification.category}
                </span>
                {notification.priority === 'high' && (
                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 font-medium">
                    ALTA
                  </span>
                )}
              </div>
              <p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                {notification.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatNotificationTime(notification.createdAt)}
                  {isExpired && ' • Expirada'}
                </span>
                <div className="flex items-center gap-2">
                  {notification.actionUrl && !isExpired && (
                    <button
                      onClick={() => window.location.href = notification.actionUrl!}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {notification.actionText || 'Ver'}
                    </button>
                  )}
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs px-2 py-1 text-gray-500 hover:text-green-600 transition-colors"
                      title="Marcar como lida"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-xs px-2 py-1 text-gray-500 hover:text-red-600 transition-colors"
                    title="Deletar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Faça login para ver suas notificações</h1>
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
          <p className="text-gray-700">Carregando notificações...</p>
        </div>
      </div>
    );
  }

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
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Notificações
                </h1>
                <p className="text-sm text-gray-500">
                  {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Configurações"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">Beta Tester</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Todas', icon: '📋' },
                { key: 'unread', label: 'Não lidas', icon: '🔔' },
                { key: 'fitness', label: 'Fitness', icon: '🏃‍♂️' },
                { key: 'rewards', label: 'Recompensas', icon: '🏆' },
                { key: 'social', label: 'Social', icon: '👥' },
                { key: 'events', label: 'Eventos', icon: '🎪' },
                { key: 'system', label: 'Sistema', icon: '⚙️' }
              ].map(filterOption => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === filterOption.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{filterOption.icon}</span>
                  {filterOption.label}
                </button>
              ))}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="text-center py-12">
              <BellOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
              </h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'Você está em dia com suas notificações!'
                  : 'Quando houver novidades, elas aparecerão aqui.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Estatísticas */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Estatísticas de Notificações</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Não lidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.isRead).length}
              </div>
              <div className="text-sm text-gray-600">Lidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">Alta Prioridade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Configurações */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Configurações de Notificação</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Notificações Push */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Notificações Push</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Ativar notificações push</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Notificações por email</span>
                      <input type="checkbox" className="rounded" />
                    </label>
                  </div>
                </div>

                {/* Categorias */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Categorias</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'fitness', label: 'Fitness e Atividades', icon: '🏃‍♂️' },
                      { key: 'rewards', label: 'Recompensas e Tokens', icon: '🏆' },
                      { key: 'social', label: 'Social e Rankings', icon: '👥' },
                      { key: 'events', label: 'Eventos e Campanhas', icon: '🎪' },
                      { key: 'system', label: 'Sistema', icon: '⚙️' }
                    ].map(category => (
                      <label key={category.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="text-sm text-gray-700">{category.label}</span>
                        </div>
                        <input type="checkbox" className="rounded" defaultChecked />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Horário Silencioso */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Horário Silencioso</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Ativar horário silencioso</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Início</label>
                        <input 
                          type="time" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          defaultValue="22:00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Fim</label>
                        <input 
                          type="time" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          defaultValue="08:00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frequência */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Frequência</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Lembretes de atividade</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option value="daily">Diário</option>
                        <option value="every_2_days">A cada 2 dias</option>
                        <option value="weekly">Semanal</option>
                        <option value="never">Nunca</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    // updateSettings(newSettings);
                    setShowSettings(false);
                  }}
                  className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
