'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { Desafio } from '../../../components/desafios/DesafioCard';
import { ChallengeStatus, ActivityType } from '@fuseapp/types';
import { 
  Button, 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Progress
} from '@fuseapp/ui';
import { 
  ArrowLeft, 
  Award, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDate } from '@fuseapp/utils';
import { desafiosApi } from '../../../lib/api';
import { notifySuccess, notifyError, notifyLoading } from '../../../lib/notifications';
import Link from 'next/link';

interface DesafioDetalhesPageProps {
  params: {
    id: string;
  };
}

export default function DesafioDetalhesPage({ params }: DesafioDetalhesPageProps) {
  const { id } = params;
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [loading, setLoading] = useState(true);
  const [inscrevendo, setInscrevendo] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Carregar dados do desafio
  useEffect(() => {
    async function carregarDesafio() {
      setLoading(true);
      try {
        // Tentar carregar da API real
        try {
          const resposta = await desafiosApi.obter(id);
          if (resposta && resposta.data) {
            // Converter para o formato esperado
            const dadosDesafio: Desafio = {
              id: resposta.data.id,
              title: resposta.data.title || resposta.data.nome,
              description: resposta.data.description || resposta.data.descricao,
              type: resposta.data.type || resposta.data.tipo,
              targetValue: resposta.data.targetValue || resposta.data.valorAlvo,
              status: resposta.data.status as ChallengeStatus,
              startDate: new Date(resposta.data.startDate || resposta.data.dataInicio),
              endDate: new Date(resposta.data.endDate || resposta.data.dataFim),
              progress: resposta.data.progress || resposta.data.progresso,
              categories: resposta.data.categories || resposta.data.categorias || [ActivityType.RUN],
              participants: resposta.data.participants || resposta.data.participantes || 0,
              reward: {
                points: resposta.data.reward?.points || resposta.data.recompensa?.pontos || 0,
                tokens: resposta.data.reward?.tokens || resposta.data.recompensa?.tokens || 0
              }
            };
            setDesafio(dadosDesafio);
            setError(null);
            return;
          }
        } catch (apiErr) {
          console.warn('Erro ao buscar da API real, usando dados simulados:', apiErr);
        }
        
        // Se falhar, usar dados simulados
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dados simulados para testes
        const desafioMock: Desafio = {
          id,
          title: 'Desafio de Corrida Mensal',
          description: 'Complete 50 km de corrida este mês para receber tokens e subir no ranking. Inclui trilhas e corridas na esteira. Atividades devem ser registradas via Strava ou manualmente com comprovação.',
          type: 'distance',
          targetValue: 50000, // 50km em metros
          status: ChallengeStatus.ACTIVE,
          startDate: new Date(Date.now() - 1209600000), // 14 dias atrás
          endDate: new Date(Date.now() + 1209600000), // 14 dias à frente
          progress: 35, // 35% concluído
          categories: [ActivityType.RUN],
          participants: 152,
          reward: {
            points: 120,
            tokens: 60
          }
        };
        
        setDesafio(desafioMock);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar detalhes do desafio:', err);
        setError(err as Error);
        notifyError('Erro ao carregar detalhes do desafio', { error: err as Error });
      } finally {
        setLoading(false);
      }
    }
    
    carregarDesafio();
  }, [id]);
  
  // Função para calcular dias restantes
  const getDiasRestantes = (endDate: Date) => {
    if (!endDate) return 0;
    const diff = endDate.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };
  
  // Handler para inscrição
  const handleInscrever = async () => {
    if (!desafio) return;
    
    try {
      setInscrevendo(true);
      const loadingId = notifyLoading('Inscrevendo no desafio...');
      
      // Tenta usar a API real
      const userId = 'user-simulado-123'; // Na implementação real, viria do contexto de autenticação
      
      try {
        await desafiosApi.inscrever(desafio.id, userId);
      } catch (apiError) {
        console.warn('Erro ao usar API real para inscrição, simulando:', apiError);
        // Simulação de inscrição como fallback
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Atualiza o estado local para refletir a inscrição
      setDesafio(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants + 1,
          progress: 0
        };
      });
      
      notifySuccess('Inscrito com sucesso!', { id: loadingId });
    } catch (err) {
      console.error('Erro ao inscrever no desafio:', err);
      notifyError('Não foi possível concluir sua inscrição. Tente novamente.', { error: err as Error });
    } finally {
      setInscrevendo(false);
    }
  };
  
  if (loading) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando detalhes do desafio...</p>
          </div>
        </div>
      </AppShell>
    );
  }
  
  if (error || !desafio) {
    return (
      <AppShell>
        <div className="space-y-4 py-6">
          <Link href="/desafios" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Voltar para Desafios</span>
          </Link>
          
          <div className="h-full flex items-center justify-center py-12">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar os detalhes deste desafio.
              </p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }
  
  const diasRestantes = getDiasRestantes(desafio.endDate);
  const isInscrito = desafio.progress !== undefined && desafio.progress >= 0;
  const isCompleto = desafio.progress === 100;
  
  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <Link href="/desafios" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Voltar para Desafios</span>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{desafio.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {desafio.categories.map((categoria, index) => {
                switch(categoria) {
                  case ActivityType.RUN:
                    return <Badge key={index}>Corrida</Badge>;
                  case ActivityType.WALK:
                    return <Badge key={index}>Caminhada</Badge>;
                  case ActivityType.CYCLE:
                    return <Badge key={index}>Ciclismo</Badge>;
                  case ActivityType.SOCIAL_POST:
                    return <Badge key={index}>Social</Badge>;
                  default:
                    return <Badge key={index}>Outros</Badge>;
                }
              })}
              
              {desafio.status === ChallengeStatus.ACTIVE && (
                <Badge variant="default" className="ml-auto">
                  <Clock className="h-3 w-3 mr-1" />
                  {diasRestantes} dias restantes
                </Badge>
              )}
              
              {desafio.status === ChallengeStatus.COMPLETED && (
                <Badge variant="success" className="ml-auto">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              )}
              
              {desafio.status === ChallengeStatus.UPCOMING && (
                <Badge variant="secondary" className="ml-auto">Em breve</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição e Detalhes */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre o Desafio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>{desafio.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Início
                    </span>
                    <span className="font-medium">{formatDate(desafio.startDate)}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> Término
                    </span>
                    <span className="font-medium">{formatDate(desafio.endDate)}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Users className="h-4 w-4 mr-1" /> Participantes
                    </span>
                    <span className="font-medium">{desafio.participants}</span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" /> Objetivo
                    </span>
                    <span className="font-medium">
                      {desafio.type === 'distance' 
                        ? `${desafio.targetValue / 1000} km` 
                        : `${desafio.targetValue} ${desafio.type === 'count' ? 'atividades' : 'minutos'}`
                      }
                    </span>
                  </div>
                </div>
                
                {isInscrito && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-2">Seu progresso</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{desafio.progress}% completo</span>
                        <span>
                          {desafio.type === 'distance' 
                            ? `${((desafio.targetValue * desafio.progress) / 100000).toFixed(1)} / ${desafio.targetValue / 1000} km` 
                            : `${Math.floor((desafio.targetValue * desafio.progress) / 100)} / ${desafio.targetValue} ${desafio.type === 'count' ? 'atividades' : 'minutos'}`
                          }
                        </span>
                      </div>
                      <Progress value={desafio.progress} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Regras e requisitos */}
            <Card>
              <CardHeader>
                <CardTitle>Regras e Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Todas as atividades devem ser registradas via Strava ou manualmente com comprovação.</li>
                  <li>Para atividades manuais, é necessário enviar screenshot do aplicativo de atividade física.</li>
                  <li>Atividades indoor (esteira, bicicleta ergométrica) são válidas.</li>
                  <li>O desafio termina às 23:59 do dia final.</li>
                  <li>As recompensas serão distribuídas em até 24h após o término.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna lateral */}
          <div className="space-y-6">
            {/* Card de recompensas */}
            <Card>
              <CardHeader>
                <CardTitle>Recompensas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pontos</p>
                    <p className="text-2xl font-bold">{desafio.reward.points}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens FUSE</p>
                    <p className="text-2xl font-bold">{desafio.reward.tokens}</p>
                  </div>
                </div>
                
                {desafio.status === ChallengeStatus.ACTIVE && (
                  <div className="pt-4">
                    {isInscrito ? (
                      isCompleto ? (
                        <Button className="w-full" variant="success" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Desafio Concluído
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => {
                            // Aqui poderia abrir um modal de atividades ou um formulário
                            // para registrar o progresso, dependendo do tipo de desafio
                            notifySuccess("Registrando atividade para o desafio");
                            // Simulação
                            setTimeout(() => {
                              setDesafio(prev => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  progress: Math.min(100, (prev.progress || 0) + 15)
                                };
                              });
                            }, 1500);
                          }}
                        >
                          Continuar Desafio
                        </Button>
                      )
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={handleInscrever}
                        disabled={inscrevendo}
                      >
                        {inscrevendo ? 'Inscrevendo...' : 'Participar do Desafio'}
                      </Button>
                    )}
                  </div>
                )}
                
                {desafio.status === ChallengeStatus.UPCOMING && (
                  <div className="pt-4">
                    <Button 
                      className="w-full" 
                      onClick={handleInscrever}
                      disabled={inscrevendo}
                    >
                      {inscrevendo ? 'Inscrevendo...' : 'Inscrever-se'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Ranking e participantes */}
            <Card>
              <CardHeader>
                <CardTitle>Top Participantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-3">
                        1
                      </div>
                      <span>João Silva</span>
                    </div>
                    <span className="font-medium">92%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/80 text-primary-foreground rounded-full flex items-center justify-center mr-3">
                        2
                      </div>
                      <span>Maria Oliveira</span>
                    </div>
                    <span className="font-medium">87%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary/60 text-primary-foreground rounded-full flex items-center justify-center mr-3">
                        3
                      </div>
                      <span>Carlos Santos</span>
                    </div>
                    <span className="font-medium">75%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
} 