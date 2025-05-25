'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { PhysicalActivity, SocialActivity, ActivityStatus, ActivityType } from '@fuseapp/types';
import { 
  Card, 
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
  Button,
  Badge,
  Separator
} from '@fuseapp/ui';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Calendar,
  Target, 
  Award,
  Wallet,
  Instagram,
  BarChart,
  Share2,
  ExternalLink,
  User,
  Activity
} from 'lucide-react';
import { formatDistance, formatDuration, formatDate } from '@fuseapp/utils';
import { actividadesApi } from '../../../lib/api';
import { notifyError, notifySuccess } from '../../../lib/notifications';
import Link from 'next/link';

// Tipo estendido para atividades físicas com campos adicionais
interface ExtendedPhysicalActivity extends PhysicalActivity {
  route?: string;
  pace?: number;
  elevation?: number;
  calories?: number;
}

// Tipo estendido para atividades sociais com campos adicionais
interface ExtendedSocialActivity extends SocialActivity {
  mediaUrl?: string;
  description?: string;
}

interface AtividadeDetalhesPageProps {
  params: {
    id: string;
  };
}

export default function AtividadeDetalhesPage({ params }: AtividadeDetalhesPageProps) {
  const { id } = params;
  const [atividade, setAtividade] = useState<ExtendedPhysicalActivity | ExtendedSocialActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [solicitandoTokenizacao, setSolicitandoTokenizacao] = useState(false);
  const router = useRouter();
  
  // Carregar detalhes da atividade
  useEffect(() => {
    async function carregarAtividade() {
      setLoading(true);
      try {
        // Em uma implementação real, usaríamos:
        // const response = await actividadesApi.obter(id);
        // if (response && response.data) {
        //   setAtividade(response.data);
        // }
        
        // Simulação de carregamento
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulação de dados para demonstração
        // Com base no ID, retornamos uma atividade fictícia
        if (id === '1') {
          // Corrida via Strava
          setAtividade({
            id: '1',
            userId: 'user1',
            type: ActivityType.RUN,
            distance: 5230, // em metros
            duration: 1800, // 30 minutos
            points: 25,
            status: ActivityStatus.VERIFIED,
            tokenized: true,
            stravaId: '12345',
            source: 'strava',
            elevation: 85, // em metros
            pace: 5.75, // min/km
            calories: 420,
            route: "https://via.placeholder.com/600x300",
            createdAt: new Date(Date.now() - 86400000) // ontem
          } as ExtendedPhysicalActivity);
        } else if (id === '4') {
          // Post no Instagram
          setAtividade({
            id: '4',
            userId: 'user1',
            type: ActivityType.SOCIAL_POST,
            platform: 'instagram',
            postId: 'post123',
            postUrl: 'https://instagram.com/p/123456',
            engagement: 124,
            points: 20,
            status: ActivityStatus.PENDING,
            tokenized: false,
            verified: false,
            contentType: 'image',
            description: 'Acabei de completar meu desafio semanal de corrida! #FuseApp #HealthyLifestyle',
            mediaUrl: 'https://via.placeholder.com/600x600',
            createdAt: new Date(Date.now() - 43200000) // 12 horas atrás
          } as ExtendedSocialActivity);
        } else {
          // Para outros IDs, criar uma atividade genérica
          const isPhysical = Math.random() > 0.3; // 70% de chance de ser física
          
          if (isPhysical) {
            setAtividade({
              id,
              userId: 'user1',
              type: Math.random() > 0.5 ? ActivityType.RUN : ActivityType.CYCLE,
              distance: Math.floor(Math.random() * 10000) + 1000,
              duration: Math.floor(Math.random() * 3600) + 900,
              points: Math.floor(Math.random() * 40) + 10,
              status: Math.random() > 0.3 ? ActivityStatus.VERIFIED : ActivityStatus.PENDING,
              tokenized: Math.random() > 0.5,
              source: Math.random() > 0.5 ? 'strava' : 'manual',
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 604800000))
            } as ExtendedPhysicalActivity);
          } else {
            setAtividade({
              id,
              userId: 'user1',
              type: ActivityType.SOCIAL_POST,
              platform: Math.random() > 0.5 ? 'instagram' : 'tiktok',
              postId: `post${Math.floor(Math.random() * 1000)}`,
              postUrl: `https://example.com/p/${Math.floor(Math.random() * 1000)}`,
              engagement: Math.floor(Math.random() * 200) + 50,
              points: Math.floor(Math.random() * 30) + 10,
              status: Math.random() > 0.3 ? ActivityStatus.VERIFIED : ActivityStatus.PENDING,
              tokenized: Math.random() > 0.5,
              verified: Math.random() > 0.3,
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 604800000))
            } as ExtendedSocialActivity);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes da atividade:', err);
        notifyError('Não foi possível carregar os detalhes desta atividade.');
      } finally {
        setLoading(false);
      }
    }
    
    carregarAtividade();
  }, [id]);
  
  // Função para renderizar ícone com base no tipo
  const renderIconForType = (tipo: ActivityType) => {
    switch (tipo) {
      case ActivityType.RUN:
        return <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">🏃</div>;
      case ActivityType.WALK:
        return <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">🚶</div>;
      case ActivityType.CYCLE:
        return <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">🚴</div>;
      case ActivityType.SOCIAL_POST:
        const ativSocial = atividade as ExtendedSocialActivity;
        if (ativSocial.platform === 'instagram') {
          return <Instagram className="h-8 w-8 text-pink-500" />;
        } else {
          return <Share2 className="h-8 w-8 text-blue-500" />;
        }
      default:
        return <Activity className="h-8 w-8 text-primary" />;
    }
  };
  
  // Função para renderizar o título
  const getTitle = () => {
    if (!atividade) return 'Detalhes da Atividade';
    
    if ('distance' in atividade) {
      switch (atividade.type) {
        case ActivityType.RUN:
          return 'Corrida';
        case ActivityType.WALK:
          return 'Caminhada';
        case ActivityType.CYCLE:
          return 'Ciclismo';
        default:
          return 'Atividade Física';
      }
    } else {
      return (atividade as ExtendedSocialActivity).platform === 'instagram' 
        ? 'Post no Instagram' 
        : 'Post no TikTok';
    }
  };
  
  // Handler para solicitar tokenização
  const handleSolicitarTokenizacao = async () => {
    if (!atividade) return;
    
    try {
      setSolicitandoTokenizacao(true);
      // Simulação de delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar estado local
      setAtividade(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tokenized: true
        };
      });
      
      notifySuccess('Tokenização solicitada com sucesso! Você receberá seus tokens em breve.');
    } catch (err) {
      console.error('Erro ao solicitar tokenização:', err);
      notifyError('Não foi possível solicitar a tokenização. Tente novamente mais tarde.');
    } finally {
      setSolicitandoTokenizacao(false);
    }
  };
  
  // Verificar se é uma atividade física
  const isPhysical = atividade && 'distance' in atividade;
  
  if (loading) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando detalhes da atividade...</p>
          </div>
        </div>
      </AppShell>
    );
  }
  
  if (!atividade) {
    return (
      <AppShell>
        <div className="space-y-4 py-6">
          <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer" onClick={() => router.push('/atividades')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Voltar para Atividades</span>
          </div>
          
          <div className="h-full flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Não foi possível encontrar esta atividade.
              </p>
              <Button 
                onClick={() => router.push('/atividades')}
                variant="outline"
              >
                Ver todas as atividades
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <div className="flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer" onClick={() => router.push('/atividades')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Voltar para Atividades</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {renderIconForType(atividade.type)}
            <div>
              <h1 className="text-3xl font-bold">{getTitle()}</h1>
              <p className="text-muted-foreground">
                {formatDate(atividade.createdAt)}
              </p>
            </div>
          </div>
          
          <div>
            <Badge variant={
              atividade.status === ActivityStatus.VERIFIED ? 'success' :
              atividade.status === ActivityStatus.REJECTED ? 'destructive' :
              atividade.status === ActivityStatus.FLAGGED ? 'default' : 'secondary'
            } className="text-sm">
              {atividade.status === ActivityStatus.VERIFIED ? 'Verificado' :
               atividade.status === ActivityStatus.REJECTED ? 'Rejeitado' :
               atividade.status === ActivityStatus.FLAGGED ? 'Sinalizado' : 'Pendente'}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Card principal com detalhes */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Atividade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPhysical ? (
                  // Conteúdo para atividade física
                  <>
                    {(atividade as ExtendedPhysicalActivity).route && (
                      <div className="overflow-hidden rounded-md w-full h-48 bg-muted">
                        <img 
                          src={(atividade as ExtendedPhysicalActivity).route} 
                          alt="Rota da atividade"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-4 w-4 mr-1" /> Distância
                        </span>
                        <span className="font-medium">
                          {formatDistance((atividade as ExtendedPhysicalActivity).distance)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-4 w-4 mr-1" /> Duração
                        </span>
                        <span className="font-medium">
                          {formatDuration((atividade as ExtendedPhysicalActivity).duration)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-1" /> Data
                        </span>
                        <span className="font-medium">
                          {formatDate(atividade.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Award className="h-4 w-4 mr-1" /> Pontos
                        </span>
                        <span className="font-medium text-primary">
                          {atividade.points}
                        </span>
                      </div>
                    </div>
                    
                    {/* Detalhes adicionais para atividade física */}
                    <Separator />
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(atividade as ExtendedPhysicalActivity).pace && (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Ritmo médio</span>
                          <span className="font-medium">
                            {(atividade as ExtendedPhysicalActivity).pace} min/km
                          </span>
                        </div>
                      )}
                      
                      {(atividade as ExtendedPhysicalActivity).elevation && (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Elevação</span>
                          <span className="font-medium">
                            {(atividade as ExtendedPhysicalActivity).elevation} m
                          </span>
                        </div>
                      )}
                      
                      {(atividade as ExtendedPhysicalActivity).calories && (
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Calorias</span>
                          <span className="font-medium">
                            {(atividade as ExtendedPhysicalActivity).calories} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Conteúdo para post social
                  <>
                    {(atividade as ExtendedSocialActivity).mediaUrl && (
                      <div className="overflow-hidden rounded-md w-full bg-muted">
                        <img 
                          src={(atividade as ExtendedSocialActivity).mediaUrl} 
                          alt="Conteúdo do post"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {(atividade as ExtendedSocialActivity).description && (
                      <p className="text-sm py-2">
                        {(atividade as ExtendedSocialActivity).description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <BarChart className="h-4 w-4 mr-1" /> Engajamento
                        </span>
                        <span className="font-medium">
                          {(atividade as ExtendedSocialActivity).engagement} interações
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="h-4 w-4 mr-1" /> Data
                        </span>
                        <span className="font-medium">
                          {formatDate(atividade.createdAt)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Award className="h-4 w-4 mr-1" /> Pontos
                        </span>
                        <span className="font-medium text-primary">
                          {atividade.points}
                        </span>
                      </div>
                    </div>
                    
                    {(atividade as ExtendedSocialActivity).postUrl && (
                      <div className="mt-4">
                        <a 
                          href={(atividade as ExtendedSocialActivity).postUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <span>Ver post original</span>
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Coluna lateral */}
          <div className="space-y-6">
            {/* Status de Tokenização */}
            <Card>
              <CardHeader>
                <CardTitle>Status de Tokenização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold">
                      {atividade.tokenized ? 'Tokenizado' : 'Não tokenizado'}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${atividade.tokenized ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Tokens recebidos</p>
                  <p className="text-xl font-bold flex items-center">
                    {atividade.tokenized ? atividade.points : '0'} 
                    <span className="text-primary ml-1">FUSE</span>
                  </p>
                </div>
                
                {!atividade.tokenized && atividade.status === ActivityStatus.VERIFIED && (
                  <Button 
                    className="w-full mt-2"
                    onClick={handleSolicitarTokenizacao}
                    disabled={solicitandoTokenizacao}
                  >
                    {solicitandoTokenizacao ? 'Processando...' : 'Tokenizar Atividade'}
                  </Button>
                )}
                
                {!atividade.tokenized && atividade.status !== ActivityStatus.VERIFIED && (
                  <p className="text-xs text-muted-foreground mt-2">
                    A atividade precisa ser verificada antes de ser tokenizada.
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Fonte da Atividade */}
            <Card>
              <CardHeader>
                <CardTitle>Fonte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  {isPhysical ? (
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                        {(atividade as ExtendedPhysicalActivity).source === 'strava' ? (
                          <span className="text-orange-500 font-bold">S</span>
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {(atividade as ExtendedPhysicalActivity).source === 'strava' ? 'Strava' : 'Registro Manual'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(atividade as ExtendedPhysicalActivity).source === 'strava' ? 'Via API Strava' : 'Registrado pelo usuário'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                        {(atividade as ExtendedSocialActivity).platform === 'instagram' ? (
                          <Instagram className="h-5 w-5 text-pink-500" />
                        ) : (
                          <Share2 className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {(atividade as ExtendedSocialActivity).platform === 'instagram' ? 'Instagram' : 'TikTok'}
                        </p>
                        <p className="text-xs text-muted-foreground">Via conexão de conta</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
} 