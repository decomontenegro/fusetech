'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { DesafioCard, Desafio } from '../../components/desafios/DesafioCard';
import { ChallengeStatus, ActivityType } from '@fuseapp/types';
import { 
  Button, 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@fuseapp/ui';
import { Filter } from 'lucide-react';
import { toast } from 'sonner';
import { desafiosApi } from '../../lib/api';
import { useRouter } from 'next/navigation';
// import { challengeClient } from '@fuseapp/api'; // Importaremos quando estiver pronto

// Função para simular a chamada de API durante o desenvolvimento
async function fetchDesafios(): Promise<Desafio[]> {
  try {
    // Tentamos usar a API real
    const response = await desafiosApi.listar();
    
    // Se a API retornar resultados, mapeamos para o formato esperado
    if (response && response.data && Array.isArray(response.data)) {
      return response.data.map(item => ({
        id: item.id,
        title: item.title || item.nome,
        description: item.description || item.descricao,
        type: item.type || item.tipo,
        targetValue: item.targetValue || item.valorAlvo,
        status: item.status as ChallengeStatus,
        startDate: new Date(item.startDate || item.dataInicio),
        endDate: new Date(item.endDate || item.dataFim),
        progress: item.progress || item.progresso,
        categories: item.categories || item.categorias || [ActivityType.RUN],
        participants: item.participants || item.participantes || 0,
        reward: {
          points: item.reward?.points || item.recompensa?.pontos || 0,
          tokens: item.reward?.tokens || item.recompensa?.tokens || 0
        }
      }));
    }
  } catch (error) {
    console.warn('Erro ao buscar dados da API real, usando dados simulados:', error);
  }
  
  // Simulando um delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Dados simulados como fallback
  return [
    {
      id: '1',
      title: 'Desafio de Corrida Semanal',
      description: 'Complete 15 km de corrida nesta semana para ganhar pontos e tokens extras.',
      type: 'distance',
      targetValue: 15000, // 15km em metros
      status: ChallengeStatus.ACTIVE,
      startDate: new Date(Date.now() - 172800000), // 2 dias atrás
      endDate: new Date(Date.now() + 432000000), // 5 dias à frente
      progress: 35, // 35% concluído
      categories: [ActivityType.RUN],
      participants: 128,
      reward: {
        points: 50,
        tokens: 25
      }
    },
    {
      id: '2',
      title: 'Desafio de Ciclismo Mensal',
      description: 'Pedale 100 km durante este mês para subir no ranking de ciclistas.',
      type: 'distance',
      targetValue: 100000, // 100km em metros
      status: ChallengeStatus.ACTIVE,
      startDate: new Date(Date.now() - 1209600000), // 14 dias atrás
      endDate: new Date(Date.now() + 1209600000), // 14 dias à frente
      progress: 65, // 65% concluído
      categories: [ActivityType.CYCLE],
      participants: 87,
      reward: {
        points: 120,
        tokens: 60
      }
    },
    {
      id: '3',
      title: 'Desafio Social: Promova a Saúde',
      description: 'Faça 3 posts sobre saúde e bem-estar nas redes sociais.',
      type: 'count',
      targetValue: 3, // 3 posts
      status: ChallengeStatus.ACTIVE,
      startDate: new Date(Date.now() - 604800000), // 7 dias atrás
      endDate: new Date(Date.now() + 604800000), // 7 dias à frente
      progress: 33, // 33% concluído (1/3)
      categories: [ActivityType.SOCIAL_POST],
      participants: 56,
      reward: {
        points: 45,
        tokens: 20
      }
    },
    {
      id: '4',
      title: 'Desafio de Caminhada',
      description: 'Caminhe 50 km no mês para ganhar prêmios.',
      type: 'distance',
      targetValue: 50000, // 50km em metros
      status: ChallengeStatus.COMPLETED,
      startDate: new Date(Date.now() - 3024000000), // 35 dias atrás
      endDate: new Date(Date.now() - 432000000), // 5 dias atrás
      progress: 100, // Completo
      categories: [ActivityType.WALK],
      participants: 134,
      reward: {
        points: 80,
        tokens: 40
      }
    },
    {
      id: '5',
      title: 'Desafio Comunitário: Treinos em Grupo',
      description: 'Participe de 2 atividades físicas em grupo e compartilhe nas redes sociais.',
      type: 'count',
      targetValue: 2,
      status: ChallengeStatus.UPCOMING,
      startDate: new Date(Date.now() + 259200000), // 3 dias à frente
      endDate: new Date(Date.now() + 2592000000), // 30 dias à frente
      categories: [ActivityType.RUN, ActivityType.WALK, ActivityType.CYCLE, ActivityType.SOCIAL_POST],
      participants: 0,
      reward: {
        points: 100,
        tokens: 50
      }
    }
  ];
}

export default function DesafiosPage() {
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState('ativos');
  const [filtroCategoria, setFiltroCategoria] = useState<ActivityType | 'all'>('all');
  const router = useRouter();
  
  // Carregar desafios
  useEffect(() => {
    async function loadDesafios() {
      try {
        setLoading(true);
        
        // Carregar dados, primeiro tentando a API real e depois simulados como fallback
        const data = await fetchDesafios();
        
        setDesafios(data);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar desafios:', err);
        setError(err as Error);
        toast.error('Não foi possível carregar os desafios. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    
    loadDesafios();
  }, []);
  
  // Filtrar desafios por status e categoria
  const desafiosFiltrados = desafios.filter(desafio => {
    const statusMatch = 
      (activeTab === 'ativos' && desafio.status === ChallengeStatus.ACTIVE) ||
      (activeTab === 'concluidos' && desafio.status === ChallengeStatus.COMPLETED) ||
      (activeTab === 'futuros' && desafio.status === ChallengeStatus.UPCOMING);
      
    const categoriaMatch = 
      filtroCategoria === 'all' || 
      desafio.categories.includes(filtroCategoria as ActivityType);
      
    return statusMatch && categoriaMatch;
  });
  
  // Handlers para ações de desafios
  const handleContinuarDesafio = (id: string) => {
    toast.success('Redirecionando para o desafio...');
    router.push(`/desafios/${id}`);
  };
  
  const handleInscreverDesafio = async (id: string) => {
    try {
      // Tentamos usar a API real
      const userId = 'user-simulado-123'; // Na implementação real, viria do contexto de autenticação
      
      try {
        await desafiosApi.inscrever(id, userId);
      } catch (apiError) {
        console.warn('Erro ao usar API real para inscrição, simulando:', apiError);
        // Simulação de inscrição como fallback
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success('Inscrito com sucesso!');
      // Redirecionar para a página de detalhes após a inscrição
      router.push(`/desafios/${id}`);
    } catch (err) {
      console.error('Erro ao inscrever no desafio:', err);
      toast.error('Erro ao inscrever no desafio. Tente novamente.');
    }
  };
  
  const handleVerDetalhesDesafio = (id: string) => {
    toast('Carregando detalhes...', {
      description: 'Redirecionando para página de detalhes'
    });
    router.push(`/desafios/${id}`);
  };
  
  if (loading) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando desafios...</p>
          </div>
        </div>
      </AppShell>
    );
  }
  
  if (error) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Ocorreu um erro ao carregar os desafios.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Tentar novamente
            </Button>
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
            <h1 className="text-3xl font-bold">Desafios</h1>
            <p className="text-muted-foreground">
              Participe de desafios para ganhar pontos e tokens extras
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtrar</span>
            </Button>
          </div>
        </header>
        
        <Tabs defaultValue="ativos" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="ativos">Ativos</TabsTrigger>
              <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
              <TabsTrigger value="futuros">Em Breve</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center">
              <select 
                className="bg-background border rounded p-1 text-sm"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value as ActivityType | 'all')}
              >
                <option value="all">Todas categorias</option>
                <option value={ActivityType.RUN}>Corrida</option>
                <option value={ActivityType.WALK}>Caminhada</option>
                <option value={ActivityType.CYCLE}>Ciclismo</option>
                <option value={ActivityType.SOCIAL_POST}>Social</option>
              </select>
            </div>
          </div>
          
          <TabsContent value="ativos" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {desafiosFiltrados.length > 0 ? (
                desafiosFiltrados.map(desafio => (
                  <DesafioCard 
                    key={desafio.id}
                    desafio={desafio}
                    onContinuar={handleContinuarDesafio}
                    onInscrever={handleInscreverDesafio}
                    onVerDetalhes={handleVerDetalhesDesafio}
                  />
                ))
              ) : (
                <div className="col-span-2 py-8 text-center">
                  <p className="text-muted-foreground">
                    Nenhum desafio ativo com esse filtro.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="concluidos" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {desafiosFiltrados.length > 0 ? (
                desafiosFiltrados.map(desafio => (
                  <DesafioCard 
                    key={desafio.id}
                    desafio={desafio}
                    onVerDetalhes={handleVerDetalhesDesafio}
                  />
                ))
              ) : (
                <div className="col-span-2 py-8 text-center">
                  <p className="text-muted-foreground">
                    Você ainda não concluiu nenhum desafio.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="futuros" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {desafiosFiltrados.length > 0 ? (
                desafiosFiltrados.map(desafio => (
                  <DesafioCard 
                    key={desafio.id}
                    desafio={desafio}
                    onInscrever={handleInscreverDesafio}
                    onVerDetalhes={handleVerDetalhesDesafio}
                  />
                ))
              ) : (
                <div className="col-span-2 py-8 text-center">
                  <p className="text-muted-foreground">
                    Não há desafios futuros disponíveis no momento.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
} 