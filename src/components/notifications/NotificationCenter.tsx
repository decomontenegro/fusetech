import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  Calendar, 
  MessageSquare, 
  Users, 
  Trophy, 
  Zap,
  Clock,
  Info
} from 'lucide-react';
import { 
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ScrollArea,
  Badge
} from '@fuseapp/ui';
import { formatDistanceToNow } from '@fuseapp/utils';
import { useRouter } from 'next/navigation';

// Tipos de notificações
export type NotificationType = 
  | 'achievement' 
  | 'challenge' 
  | 'friend_request' 
  | 'friend_accepted' 
  | 'activity' 
  | 'system' 
  | 'reward'
  | 'training';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>;
  action?: {
    text: string;
    url: string;
  };
}

interface NotificationCenterProps {
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onMarkAllAsRead,
  onClearAll
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Carregar notificações
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        
        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dados simulados
        const mockNotifications: Notification[] = [
          {
            id: 'notif_1',
            type: 'achievement',
            title: 'Nova Conquista!',
            message: 'Você desbloqueou a conquista "Corredor Iniciante".',
            read: false,
            createdAt: new Date(Date.now() - 30 * 60 * 1000),
            action: {
              text: 'Ver Conquista',
              url: '/conquistas'
            }
          },
          {
            id: 'notif_2',
            type: 'challenge',
            title: 'Desafio Concluído',
            message: 'Você completou o desafio "Corrida de 10K".',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            action: {
              text: 'Ver Recompensa',
              url: '/desafios'
            }
          },
          {
            id: 'notif_3',
            type: 'friend_request',
            title: 'Nova Solicitação de Amizade',
            message: 'João Silva enviou uma solicitação de amizade.',
            read: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            data: {
              userId: 'user_123',
              userName: 'João Silva'
            },
            action: {
              text: 'Responder',
              url: '/amigos'
            }
          },
          {
            id: 'notif_4',
            type: 'activity',
            title: 'Atividade Sincronizada',
            message: 'Sua corrida de 5km foi sincronizada com sucesso.',
            read: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            action: {
              text: 'Ver Atividade',
              url: '/atividades'
            }
          },
          {
            id: 'notif_5',
            type: 'system',
            title: 'Manutenção Programada',
            message: 'O sistema estará indisponível para manutenção no dia 15/06 das 2h às 4h.',
            read: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'notif_6',
            type: 'reward',
            title: 'Tokens Recebidos',
            message: 'Você recebeu 50 tokens FUSE por suas atividades recentes.',
            read: false,
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            action: {
              text: 'Ver Carteira',
              url: '/carteira'
            }
          },
          {
            id: 'notif_7',
            type: 'training',
            title: 'Treino Agendado',
            message: 'Você tem um treino de corrida agendado para hoje às 18h.',
            read: false,
            createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
            action: {
              text: 'Ver Plano',
              url: '/planos'
            }
          }
        ];
        
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Simular recebimento de novas notificações
    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.8) {
        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          type: ['achievement', 'challenge', 'activity', 'reward', 'training'][Math.floor(Math.random() * 5)] as NotificationType,
          title: 'Nova Notificação',
          message: 'Você recebeu uma nova notificação.',
          read: false,
          createdAt: new Date()
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    }, 60000); // A cada minuto
    
    return () => clearInterval(interval);
  }, []);

  // Marcar notificação como lida
  const handleMarkAsRead = async (id: string) => {
    // Em produção, chamar API
    // await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    
    // Simulação
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    // Em produção, chamar API
    // await fetch('/api/notifications/read-all', { method: 'POST' });
    
    // Simulação
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    
    setUnreadCount(0);
    
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  // Limpar todas as notificações
  const handleClearAll = async () => {
    // Em produção, chamar API
    // await fetch('/api/notifications/clear-all', { method: 'POST' });
    
    // Simulação
    setNotifications([]);
    setUnreadCount(0);
    
    if (onClearAll) {
      onClearAll();
    }
  };

  // Filtrar notificações por tipo
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  // Renderizar ícone de tipo
  const renderTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'challenge':
        return <Trophy className="h-5 w-5 text-purple-500" />;
      case 'friend_request':
      case 'friend_accepted':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'activity':
        return <Zap className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-gray-500" />;
      case 'reward':
        return <Award className="h-5 w-5 text-amber-500" />;
      case 'training':
        return <Calendar className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Navegar para a ação
  const handleAction = (notification: Notification) => {
    if (notification.action) {
      router.push(notification.action.url);
      setIsOpen(false);
      handleMarkAsRead(notification.id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Notificações</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                disabled={unreadCount === 0}
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                disabled={notifications.length === 0}
                onClick={handleClearAll}
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none border-b px-4">
              <TabsTrigger value="all" className="rounded-none">
                Todas
              </TabsTrigger>
              <TabsTrigger value="unread" className="rounded-none">
                Não lidas
                {unreadCount > 0 && (
                  <Badge className="ml-1 bg-red-500 text-[10px]">{unreadCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-muted rounded"></div>
                      <div className="h-3 w-full bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Nenhuma notificação encontrada.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-4">
                  {filteredNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`flex gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <div className="flex-shrink-0">
                        {renderTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        {notification.action && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(notification);
                            }}
                          >
                            {notification.action.text}
                          </Button>
                        )}
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 self-center">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};
