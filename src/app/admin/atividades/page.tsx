'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Button,
  Badge
} from '@fuseapp/ui';
import { AppShell } from '../../../components/layout/AppShell';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import { ActivityStatus, ActivityType } from '@fuseapp/types';
import { formatDistance, formatDuration, formatDate } from '@fuseapp/utils';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Filter, 
  RefreshCw 
} from 'lucide-react';

// Interface para atividades suspeitas
interface SuspiciousActivity {
  id: string;
  userId: string;
  type: ActivityType;
  source: string;
  distance: number;
  duration: number;
  status: ActivityStatus;
  fraudScore: number;
  fraudReasons: string[];
  createdAt: string;
}

export default function AdminAtividadesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activities, setActivities] = useState<SuspiciousActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pending'>('flagged');

  // Carregar atividades suspeitas
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockActivities: SuspiciousActivity[] = [
          {
            id: 'act_1',
            userId: 'user_123',
            type: ActivityType.RUN,
            source: 'strava',
            distance: 10000,
            duration: 1800,
            status: ActivityStatus.FLAGGED,
            fraudScore: 75,
            fraudReasons: ['Velocidade implausível de 20.0 km/h para corrida'],
            createdAt: new Date().toISOString()
          },
          {
            id: 'act_2',
            userId: 'user_456',
            type: ActivityType.CYCLE,
            source: 'strava',
            distance: 50000,
            duration: 3600,
            status: ActivityStatus.FLAGGED,
            fraudScore: 85,
            fraudReasons: ['Velocidade implausível de 50.0 km/h para ciclismo', 'Padrão anormal para o usuário'],
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'act_3',
            userId: 'user_789',
            type: ActivityType.WALK,
            source: 'strava',
            distance: 15000,
            duration: 7200,
            status: ActivityStatus.PENDING,
            fraudScore: 60,
            fraudReasons: ['Tempo 120.0 min desvia 35% do esperado (90.0 min)'],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setActivities(mockActivities);
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  // Filtrar atividades
  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'flagged') return activity.status === ActivityStatus.FLAGGED;
    if (filter === 'pending') return activity.status === ActivityStatus.PENDING;
    return true;
  });

  // Aprovar atividade
  const handleApprove = async (activityId: string) => {
    try {
      // Em produção, chamar API
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: ActivityStatus.VERIFIED } 
            : activity
        )
      );
    } catch (error) {
      console.error('Erro ao aprovar atividade:', error);
    }
  };

  // Rejeitar atividade
  const handleReject = async (activityId: string) => {
    try {
      // Em produção, chamar API
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: ActivityStatus.REJECTED } 
            : activity
        )
      );
    } catch (error) {
      console.error('Erro ao rejeitar atividade:', error);
    }
  };

  // Renderizar badge de status
  const renderStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.VERIFIED:
        return <Badge className="bg-green-500">Verificada</Badge>;
      case ActivityStatus.REJECTED:
        return <Badge className="bg-red-500">Rejeitada</Badge>;
      case ActivityStatus.FLAGGED:
        return <Badge className="bg-yellow-500">Suspeita</Badge>;
      case ActivityStatus.PENDING:
        return <Badge className="bg-blue-500">Pendente</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 py-6">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Revisão de Atividades</h1>
              <p className="text-muted-foreground">
                Revise e aprove/rejeite atividades suspeitas
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={() => setFilter('all')}
              >
                <Filter className="h-4 w-4" />
                <span>Todas</span>
              </Button>
              
              <Button 
                variant={filter === 'flagged' ? 'default' : 'outline'}
                className="gap-2" 
                onClick={() => setFilter('flagged')}
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Suspeitas</span>
              </Button>
              
              <Button 
                variant={filter === 'pending' ? 'default' : 'outline'}
                className="gap-2" 
                onClick={() => setFilter('pending')}
              >
                <Clock className="h-4 w-4" />
                <span>Pendentes</span>
              </Button>
              
              <Button 
                variant="outline"
                className="gap-2" 
                onClick={() => {
                  // Recarregar atividades
                }}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Atualizar</span>
              </Button>
            </div>
          </header>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredActivities.length === 0 ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center">
                <p className="text-muted-foreground text-center mb-4">
                  Nenhuma atividade encontrada com os filtros atuais.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map(activity => (
                <Card key={activity.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {activity.type === ActivityType.RUN ? 'Corrida' : 
                           activity.type === ActivityType.WALK ? 'Caminhada' : 
                           activity.type === ActivityType.CYCLE ? 'Ciclismo' : 'Atividade'}
                        </CardTitle>
                        <CardDescription>
                          Usuário: {activity.userId} • {formatDate(new Date(activity.createdAt))}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(activity.status)}
                        <Badge className={`${activity.fraudScore > 70 ? 'bg-red-500' : activity.fraudScore > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}>
                          Score: {activity.fraudScore}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Distância</p>
                        <p className="font-medium">{formatDistance(activity.distance)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duração</p>
                        <p className="font-medium">{formatDuration(activity.duration)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fonte</p>
                        <p className="font-medium capitalize">{activity.source}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Motivos de suspeita:</p>
                      <ul className="list-disc list-inside text-sm">
                        {activity.fraudReasons.map((reason, index) => (
                          <li key={index} className="text-red-500">{reason}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {(activity.status === ActivityStatus.FLAGGED || activity.status === ActivityStatus.PENDING) && (
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1"
                          onClick={() => handleReject(activity.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Rejeitar</span>
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="gap-1"
                          onClick={() => handleApprove(activity.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Aprovar</span>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
