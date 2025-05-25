'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { AtividadeCard } from '../../components/actividades/AtividadeCard';
import { PhysicalActivity, SocialActivity, ActivityStatus, ActivityType } from '@fuseapp/types';
import { 
  Button, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@fuseapp/ui';
import { Filter, Plus, Loader2 } from 'lucide-react';
import { formatDate } from '@fuseapp/utils';
import { actividadesApi } from '../../lib/api';
import { notifyError } from '../../lib/notifications';
import { useRouter } from 'next/navigation';

export default function AtividadesPage() {
  const [atividades, setAtividades] = useState<(PhysicalActivity | SocialActivity)[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'all' | ActivityType>('all');
  const [filtroStatus, setFiltroStatus] = useState<'all' | ActivityStatus>('all');
  const [loading, setLoading] = useState(true);
  const [tipoAtivo, setTipoAtivo] = useState('todas');
  const router = useRouter();

  // Carregar atividades
  useEffect(() => {
    async function carregarAtividades() {
      try {
        setLoading(true);
        
        // Em uma implementação real, usaríamos:
        // const userId = auth.usuario.id;
        // const response = await actividadesApi.listar(userId);
        // if (response && response.data) {
        //   setAtividades(response.data);
        // }
        
        // Simulação de carregamento
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulação de dados para demonstração
        const atividadesSimuladas: (PhysicalActivity | SocialActivity)[] = [
          {
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
            createdAt: new Date(Date.now() - 86400000) // ontem
          },
          {
            id: '2',
            userId: 'user1',
            type: ActivityType.CYCLE,
            distance: 15400, // em metros
            duration: 3600, // 1 hora
            points: 30,
            status: ActivityStatus.VERIFIED,
            tokenized: true,
            stravaId: '12346',
            source: 'strava',
            createdAt: new Date(Date.now() - 172800000) // 2 dias atrás
          },
          {
            id: '3',
            userId: 'user1',
            type: ActivityType.WALK,
            distance: 3200, // em metros
            duration: 2400, // 40 minutos
            points: 15,
            status: ActivityStatus.VERIFIED,
            tokenized: true,
            source: 'manual',
            createdAt: new Date(Date.now() - 432000000) // 5 dias atrás
          },
          {
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
            createdAt: new Date(Date.now() - 43200000) // 12 horas atrás
          },
          {
            id: '5',
            userId: 'user1',
            type: ActivityType.SOCIAL_POST,
            platform: 'tiktok',
            postId: 'post456',
            postUrl: 'https://tiktok.com/v/456789',
            engagement: 230,
            points: 35,
            status: ActivityStatus.VERIFIED,
            tokenized: true,
            verified: true,
            createdAt: new Date(Date.now() - 259200000) // 3 dias atrás
          },
          {
            id: '6',
            userId: 'user1',
            type: ActivityType.RUN,
            distance: 10500, // em metros
            duration: 3300, // 55 minutos
            points: 45,
            status: ActivityStatus.PENDING,
            tokenized: false,
            source: 'manual',
            createdAt: new Date() // hoje
          }
        ];
        
        setAtividades(atividadesSimuladas);
      } catch (err) {
        console.error('Erro ao carregar atividades:', err);
        notifyError('Não foi possível carregar suas atividades. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    carregarAtividades();
  }, []);
  
  // Filtrar atividades
  const atividadesFiltradas = atividades.filter(atividade => {
    // Filtro por tipo
    const tipoMatch = 
      tipoAtivo === 'todas' ||
      (tipoAtivo === 'fisicas' && 'distance' in atividade) ||
      (tipoAtivo === 'sociais' && 'platform' in atividade);
    
    // Filtro específico
    const filtroTipoMatch = 
      filtroTipo === 'all' || 
      atividade.type === filtroTipo;
    
    const filtroStatusMatch = 
      filtroStatus === 'all' || 
      atividade.status === filtroStatus;
    
    return tipoMatch && filtroTipoMatch && filtroStatusMatch;
  });
  
  // Ordenar por data (mais recentes primeiro)
  const atividadesOrdenadas = [...atividadesFiltradas].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
  
  const handleRegistrarAtividade = () => {
    // Navegar para página de registro
    router.push('/atividades/registrar');
  };
  
  const handleVerMaisAtividade = (id: string) => {
    // Navegar para página de detalhes
    router.push(`/atividades/${id}`);
  };
  
  if (loading) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Carregando atividades...</p>
          </div>
        </div>
      </AppShell>
    );
  }
  
  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Atividades</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie suas atividades físicas e sociais
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => {
                // Abrir modal de filtros avançados
                // Implementação futura
              }}
            >
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </Button>
            
            <Button className="gap-2" onClick={handleRegistrarAtividade}>
              <Plus className="h-4 w-4" />
              <span>Registrar Atividade</span>
            </Button>
          </div>
        </header>
        
        <Tabs defaultValue="todas" onValueChange={setTipoAtivo}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="fisicas">Físicas</TabsTrigger>
            <TabsTrigger value="sociais">Sociais</TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            {atividadesOrdenadas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {atividadesOrdenadas.map((atividade) => (
                  <AtividadeCard 
                    key={atividade.id} 
                    atividade={atividade} 
                    onVerMais={() => handleVerMaisAtividade(atividade.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 flex flex-col items-center">
                  <p className="text-muted-foreground text-center mb-4">
                    Nenhuma atividade encontrada com os filtros atuais.
                  </p>
                  <Button onClick={handleRegistrarAtividade}>
                    Registrar Nova Atividade
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </Tabs>
      </div>
    </AppShell>
  );
} 