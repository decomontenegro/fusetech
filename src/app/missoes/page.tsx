'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Progress,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import { MissaoCard, Missao } from '../../components/missoes/MissaoCard';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Award,
  Flame,
  Zap,
  Target,
  ArrowRight,
  Filter,
  Footprints,
  Heart,
  Repeat,
  Gift,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

export default function MissoesPage() {
  const { user } = useAuth();
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('diarias');
  const [tipoFiltro, setTipoFiltro] = useState('todas');
  const [dificuldadeFiltro, setDificuldadeFiltro] = useState('todas');
  const [selectedMissao, setSelectedMissao] = useState<Missao | null>(null);
  const [showMissaoModal, setShowMissaoModal] = useState(false);
  const [streak, setStreak] = useState({
    atual: 5,
    maximo: 12,
    ultimaAtividade: new Date(Date.now() - 24 * 60 * 60 * 1000)
  });

  // Carregar missões
  useEffect(() => {
    const fetchMissoes = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const response = await fetch(`/api/missoes?tipo=${activeTab}`);
        // const data = await response.json();
        
        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados
        const mockMissoes: Missao[] = [
          {
            id: 'missao_1',
            titulo: 'Corrida Matinal',
            descricao: 'Complete uma corrida de pelo menos 3km antes do meio-dia.',
            tipo: 'distancia',
            dificuldade: 'facil',
            meta: 3,
            unidade: 'km',
            progresso: 2.5,
            status: 'ativa',
            dataExpiracao: new Date(Date.now() + 8 * 60 * 60 * 1000),
            recompensa: {
              tokens: 20,
              xp: 50
            }
          },
          {
            id: 'missao_2',
            titulo: 'Queima Calórica',
            descricao: 'Queime 300 calorias em qualquer atividade física.',
            tipo: 'calorias',
            dificuldade: 'media',
            meta: 300,
            unidade: 'kcal',
            progresso: 320,
            status: 'ativa',
            dataExpiracao: new Date(Date.now() + 12 * 60 * 60 * 1000),
            recompensa: {
              tokens: 30,
              xp: 75
            }
          },
          {
            id: 'missao_3',
            titulo: 'Caminhada Longa',
            descricao: 'Faça uma caminhada de pelo menos 5km.',
            tipo: 'distancia',
            dificuldade: 'media',
            meta: 5,
            unidade: 'km',
            progresso: 5.2,
            status: 'ativa',
            dataExpiracao: new Date(Date.now() + 10 * 60 * 60 * 1000),
            recompensa: {
              tokens: 25,
              xp: 60
            }
          },
          {
            id: 'missao_4',
            titulo: 'Exercício Matinal',
            descricao: 'Complete 30 minutos de qualquer atividade física antes das 10h.',
            tipo: 'tempo',
            dificuldade: 'facil',
            meta: 30,
            unidade: 'min',
            progresso: 30,
            status: 'concluida',
            dataExpiracao: new Date(Date.now() - 2 * 60 * 60 * 1000),
            recompensa: {
              tokens: 15,
              xp: 40
            }
          },
          {
            id: 'missao_5',
            titulo: 'Desafio de Passos',
            descricao: 'Complete 10.000 passos em um único dia.',
            tipo: 'passos',
            dificuldade: 'dificil',
            meta: 10000,
            unidade: 'passos',
            progresso: 8500,
            status: 'ativa',
            dataExpiracao: new Date(Date.now() + 14 * 60 * 60 * 1000),
            recompensa: {
              tokens: 40,
              xp: 100
            }
          },
          {
            id: 'missao_6',
            titulo: 'Compartilhe sua Atividade',
            descricao: 'Compartilhe uma atividade na comunidade.',
            tipo: 'social',
            dificuldade: 'facil',
            meta: 1,
            unidade: 'post',
            progresso: 0,
            status: 'ativa',
            dataExpiracao: new Date(Date.now() + 16 * 60 * 60 * 1000),
            recompensa: {
              tokens: 10,
              xp: 30
            }
          },
          {
            id: 'missao_7',
            titulo: 'Treino Intenso',
            descricao: 'Mantenha sua frequência cardíaca acima de 140bpm por 20 minutos.',
            tipo: 'tempo',
            dificuldade: 'dificil',
            meta: 20,
            unidade: 'min',
            progresso: 12,
            status: 'expirada',
            dataExpiracao: new Date(Date.now() - 1 * 60 * 60 * 1000),
            recompensa: {
              tokens: 35,
              xp: 90
            }
          }
        ];
        
        // Filtrar missões com base na aba ativa
        let filteredMissoes = mockMissoes;
        if (activeTab === 'semanais') {
          // Simulação de missões semanais
          filteredMissoes = [
            {
              id: 'missao_semanal_1',
              titulo: 'Maratona Semanal',
              descricao: 'Corra um total de 20km ao longo da semana.',
              tipo: 'distancia',
              dificuldade: 'dificil',
              meta: 20,
              unidade: 'km',
              progresso: 12.5,
              status: 'ativa',
              dataExpiracao: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
              recompensa: {
                tokens: 100,
                xp: 250
              }
            },
            {
              id: 'missao_semanal_2',
              titulo: 'Variedade de Exercícios',
              descricao: 'Complete 3 tipos diferentes de atividades físicas esta semana.',
              tipo: 'frequencia',
              dificuldade: 'media',
              meta: 3,
              unidade: 'atividades',
              progresso: 2,
              status: 'ativa',
              dataExpiracao: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
              recompensa: {
                tokens: 75,
                xp: 180
              }
            },
            {
              id: 'missao_semanal_3',
              titulo: 'Desafio de Ciclismo',
              descricao: 'Pedale um total de 50km ao longo da semana.',
              tipo: 'distancia',
              dificuldade: 'dificil',
              meta: 50,
              unidade: 'km',
              progresso: 30,
              status: 'ativa',
              dataExpiracao: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
              recompensa: {
                tokens: 120,
                xp: 300
              }
            }
          ];
        }
        
        setMissoes(filteredMissoes);
      } catch (error) {
        console.error('Erro ao carregar missões:', error);
        toast.error('Não foi possível carregar as missões. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMissoes();
  }, [activeTab]);

  // Filtrar missões
  const missoesFiltradas = missoes.filter(missao => {
    // Filtrar por tipo
    if (tipoFiltro !== 'todas' && missao.tipo !== tipoFiltro) {
      return false;
    }
    
    // Filtrar por dificuldade
    if (dificuldadeFiltro !== 'todas' && missao.dificuldade !== dificuldadeFiltro) {
      return false;
    }
    
    return true;
  });

  // Agrupar missões por status
  const missoesAtivas = missoesFiltradas.filter(m => m.status === 'ativa');
  const missoesConcluidas = missoesFiltradas.filter(m => m.status === 'concluida');
  const missoesExpiradas = missoesFiltradas.filter(m => m.status === 'expirada');

  // Concluir missão
  const handleConcluirMissao = async (id: string) => {
    try {
      // Em produção, chamar API
      // await fetch(`/api/missoes/${id}/concluir`, { method: 'POST' });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar estado local
      const missaoAtualizada = missoes.find(m => m.id === id);
      if (missaoAtualizada) {
        setMissoes(missoes.map(m => 
          m.id === id ? { ...m, status: 'concluida' as const } : m
        ));
        
        toast.success(`Missão "${missaoAtualizada.titulo}" concluída! Você ganhou ${missaoAtualizada.recompensa.tokens} FUSE e ${missaoAtualizada.recompensa.xp} XP.`);
      }
    } catch (error) {
      console.error('Erro ao concluir missão:', error);
      toast.error('Não foi possível concluir a missão. Tente novamente.');
    }
  };

  // Ver detalhes da missão
  const handleVerDetalhesMissao = (id: string) => {
    const missao = missoes.find(m => m.id === id);
    if (missao) {
      setSelectedMissao(missao);
      setShowMissaoModal(true);
    }
  };

  // Renderizar ícone de tipo
  const renderIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'distancia':
        return <Footprints className="h-5 w-5 text-blue-500" />;
      case 'tempo':
        return <Clock className="h-5 w-5 text-green-500" />;
      case 'calorias':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'passos':
        return <Footprints className="h-5 w-5 text-purple-500" />;
      case 'frequencia':
        return <Repeat className="h-5 w-5 text-indigo-500" />;
      case 'social':
        return <Heart className="h-5 w-5 text-red-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Missões e Recompensas</h1>
            <p className="text-muted-foreground">
              Complete missões diárias e semanais para ganhar recompensas
            </p>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Tabs defaultValue="diarias" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="diarias">Missões Diárias</TabsTrigger>
                <TabsTrigger value="semanais">Missões Semanais</TabsTrigger>
              </TabsList>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todos os tipos</SelectItem>
                      <SelectItem value="distancia">Distância</SelectItem>
                      <SelectItem value="tempo">Tempo</SelectItem>
                      <SelectItem value="calorias">Calorias</SelectItem>
                      <SelectItem value="passos">Passos</SelectItem>
                      <SelectItem value="frequencia">Frequência</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1">
                  <Select value={dificuldadeFiltro} onValueChange={setDificuldadeFiltro}>
                    <SelectTrigger>
                      <Target className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as dificuldades</SelectItem>
                      <SelectItem value="facil">Fácil</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="dificil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-6 w-3/4 bg-muted rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-4 w-full bg-muted rounded mb-4"></div>
                        <div className="h-4 w-2/3 bg-muted rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : missoesFiltradas.length === 0 ? (
                <Card>
                  <CardContent className="py-12 flex flex-col items-center">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center mb-4">
                      Nenhuma missão encontrada com os filtros selecionados.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setTipoFiltro('todas');
                        setDificuldadeFiltro('todas');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {missoesAtivas.length > 0 && (
                    <div>
                      <h2 className="text-lg font-medium mb-3">Missões Ativas</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {missoesAtivas.map(missao => (
                          <MissaoCard 
                            key={missao.id} 
                            missao={missao}
                            onConcluir={handleConcluirMissao}
                            onDetalhes={handleVerDetalhesMissao}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {missoesConcluidas.length > 0 && (
                    <div>
                      <h2 className="text-lg font-medium mb-3">Missões Concluídas</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {missoesConcluidas.map(missao => (
                          <MissaoCard 
                            key={missao.id} 
                            missao={missao}
                            onDetalhes={handleVerDetalhesMissao}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {missoesExpiradas.length > 0 && (
                    <div>
                      <h2 className="text-lg font-medium mb-3">Missões Expiradas</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {missoesExpiradas.map(missao => (
                          <MissaoCard 
                            key={missao.id} 
                            missao={missao}
                            onDetalhes={handleVerDetalhesMissao}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sequência de Atividades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <span className="font-medium">Sequência atual</span>
                  </div>
                  <span className="text-2xl font-bold">{streak.atual} dias</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Recorde pessoal</span>
                  </div>
                  <span className="text-2xl font-bold">{streak.maximo} dias</span>
                </div>
                
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Última atividade: {streak.ultimaAtividade.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mantenha sua sequência realizando pelo menos uma atividade por dia!
                  </p>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Próximas recompensas</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary">7 dias</Badge>
                        <span>Sequência de uma semana</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span>50 FUSE</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500">14 dias</Badge>
                        <span>Sequência de duas semanas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span>100 FUSE</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500">30 dias</Badge>
                        <span>Sequência de um mês</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span>250 FUSE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recompensas Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-medium">FUSE Tokens</span>
                  </div>
                  <span className="text-2xl font-bold">350</span>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Itens Disponíveis</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-purple-500" />
                        <span>Desconto de 15% na Nike</span>
                      </div>
                      <Button size="sm" variant="outline">
                        200 FUSE
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-blue-500" />
                        <span>1 mês de Spotify Premium</span>
                      </div>
                      <Button size="sm" variant="outline">
                        300 FUSE
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>Avatar exclusivo</span>
                      </div>
                      <Button size="sm" variant="outline">
                        100 FUSE
                      </Button>
                    </div>
                  </div>
                  
                  <Button variant="link" className="w-full mt-2">
                    Ver todas as recompensas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Modal de detalhes da missão */}
      {selectedMissao && showMissaoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {renderIconeTipo(selectedMissao.tipo)}
                  <div>
                    <h2 className="text-xl font-bold">{selectedMissao.titulo}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedMissao.dificuldade === 'facil' && (
                        <Badge className="bg-green-500">Fácil</Badge>
                      )}
                      {selectedMissao.dificuldade === 'media' && (
                        <Badge className="bg-orange-500">Média</Badge>
                      )}
                      {selectedMissao.dificuldade === 'dificil' && (
                        <Badge className="bg-red-500">Difícil</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="mb-4">{selectedMissao.descricao}</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium mb-2">Meta</h3>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span>Progresso</span>
                      <span>
                        {selectedMissao.progresso !== undefined ? selectedMissao.progresso : 0} / {selectedMissao.meta} {selectedMissao.unidade}
                      </span>
                    </div>
                    
                    {selectedMissao.progresso !== undefined && (
                      <Progress 
                        value={Math.min(100, Math.round((selectedMissao.progresso / selectedMissao.meta) * 100))} 
                        className="h-2" 
                      />
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Recompensas</h3>
                  <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Award className="h-5 w-5 text-primary" />
                      <span>{selectedMissao.recompensa.tokens} FUSE</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Flame className="h-5 w-5 text-orange-500" />
                      <span>{selectedMissao.recompensa.xp} XP</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span>Expira em</span>
                      <span>
                        {selectedMissao.status === 'expirada' 
                          ? 'Expirada' 
                          : selectedMissao.status === 'concluida'
                            ? 'Concluída'
                            : new Date(selectedMissao.dataExpiracao).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowMissaoModal(false)}
                >
                  Fechar
                </Button>
                
                {selectedMissao.status === 'ativa' && selectedMissao.progresso !== undefined && selectedMissao.progresso >= selectedMissao.meta && (
                  <Button 
                    className="flex-1 gap-1"
                    onClick={() => {
                      handleConcluirMissao(selectedMissao.id);
                      setShowMissaoModal(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Concluir Missão</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
