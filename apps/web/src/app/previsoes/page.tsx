'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Lightbulb,
  Filter,
  BarChart,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

// Importar componentes (serão implementados em seguida)
import { RecomendacaoCard, Recomendacao } from '../../components/recomendacoes/RecomendacaoCard';
import { PrevisaoCard, Previsao } from '../../components/previsoes/PrevisaoCard';

export default function PrevisoesPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recomendacoes');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [periodoFiltro, setPeriodoFiltro] = useState('7dias');

  // Estados para armazenar dados
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [previsoes, setPrevisoes] = useState<Previsao[]>([]);

  // Estados para modais
  const [selectedRecomendacao, setSelectedRecomendacao] = useState<Recomendacao | null>(null);
  const [selectedPrevisao, setSelectedPrevisao] = useState<Previsao | null>(null);
  const [showRecomendacaoModal, setShowRecomendacaoModal] = useState(false);
  const [showPrevisaoModal, setShowPrevisaoModal] = useState(false);

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const recomendacoesResponse = await fetch(`/api/recomendacoes?categoria=${categoriaFiltro}&periodo=${periodoFiltro}`);
        // const previsoesResponse = await fetch(`/api/previsoes?categoria=${categoriaFiltro}&periodo=${periodoFiltro}`);

        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Dados simulados - Recomendações
        const mockRecomendacoes: Recomendacao[] = [
          {
            id: 'rec_1',
            titulo: 'Aumente seu volume de treino gradualmente',
            descricao: 'Baseado no seu histórico, recomendamos aumentar sua quilometragem semanal em 10% para melhorar seu condicionamento.',
            tipo: 'treino',
            categoria: 'corrida',
            prioridade: 'alta',
            baseadoEm: 'Histórico de corridas das últimas 4 semanas',
            dataGeracao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            acoes: {
              primaria: {
                texto: 'Ver plano sugerido',
                url: '/planos'
              }
            }
          },
          {
            id: 'rec_2',
            titulo: 'Dia de descanso recomendado',
            descricao: 'Detectamos sinais de fadiga acumulada. Recomendamos um dia de descanso para evitar lesões e melhorar a recuperação.',
            tipo: 'descanso',
            categoria: 'geral',
            prioridade: 'alta',
            baseadoEm: 'Análise de carga de treino e frequência cardíaca',
            dataGeracao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'rec_3',
            titulo: 'Melhore sua técnica de pedalada',
            descricao: 'Sua cadência média está abaixo do ideal. Tente manter uma cadência de 80-90 RPM para melhorar eficiência e reduzir fadiga.',
            tipo: 'tecnica',
            categoria: 'ciclismo',
            prioridade: 'media',
            baseadoEm: 'Análise de cadência das últimas pedaladas',
            dataGeracao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            acoes: {
              primaria: {
                texto: 'Ver exercícios',
                url: '/treinos/tecnica'
              }
            }
          },
          {
            id: 'rec_4',
            titulo: 'Aumente sua hidratação',
            descricao: 'Suas atividades recentes indicam possível desidratação. Recomendamos aumentar a ingestão de água antes, durante e após os treinos.',
            tipo: 'hidratacao',
            categoria: 'geral',
            prioridade: 'media',
            baseadoEm: 'Duração e intensidade dos treinos recentes',
            dataGeracao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ];

        // Dados simulados - Previsões
        const mockPrevisoes: Previsao[] = [
          {
            id: 'prev_1',
            titulo: 'Previsão de tempo para 5K',
            descricao: 'Com base no seu progresso recente, estimamos que você pode completar uma corrida de 5K no tempo previsto.',
            tipo: 'tempo',
            categoria: 'corrida',
            tendencia: 'diminuicao',
            valorAtual: 28.5,
            valorPrevisto: 26.2,
            unidade: 'min',
            confianca: 85,
            dataGeracao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            dataPrevisao: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            baseadoEm: 'Histórico de corridas e progressão de ritmo',
            acoes: {
              primaria: {
                texto: 'Ver plano de treino',
                url: '/planos'
              }
            }
          },
          {
            id: 'prev_2',
            titulo: 'Previsão de VO2max',
            descricao: 'Seu VO2max estimado deve aumentar nas próximas semanas se mantiver a consistência atual de treinos.',
            tipo: 'vo2max',
            categoria: 'geral',
            tendencia: 'aumento',
            valorAtual: 42,
            valorPrevisto: 44.5,
            unidade: 'ml/kg/min',
            confianca: 75,
            dataGeracao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            dataPrevisao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            baseadoEm: 'Frequência cardíaca e intensidade dos treinos'
          },
          {
            id: 'prev_3',
            titulo: 'Previsão de distância máxima',
            descricao: 'Com seu nível atual de condicionamento, estimamos que você pode completar esta distância em uma única sessão.',
            tipo: 'distancia',
            categoria: 'ciclismo',
            tendencia: 'aumento',
            valorAtual: 40,
            valorPrevisto: 60,
            unidade: 'km',
            confianca: 80,
            dataGeracao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            dataPrevisao: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            baseadoEm: 'Histórico de pedaladas e progressão de resistência'
          }
        ];

        // Filtrar por categoria
        let filteredRecomendacoes = mockRecomendacoes;
        let filteredPrevisoes = mockPrevisoes;

        if (categoriaFiltro !== 'todas') {
          filteredRecomendacoes = mockRecomendacoes.filter(r => r.categoria === categoriaFiltro);
          filteredPrevisoes = mockPrevisoes.filter(p => p.categoria === categoriaFiltro);
        }

        // Filtrar por período (para previsões)
        if (periodoFiltro !== 'todos') {
          const hoje = new Date();
          let diasFuturos = 7;

          if (periodoFiltro === '14dias') diasFuturos = 14;
          if (periodoFiltro === '30dias') diasFuturos = 30;

          const dataLimite = new Date(hoje.getTime() + diasFuturos * 24 * 60 * 60 * 1000);

          filteredPrevisoes = filteredPrevisoes.filter(p =>
            new Date(p.dataPrevisao) <= dataLimite
          );
        }

        setRecomendacoes(filteredRecomendacoes);
        setPrevisoes(filteredPrevisoes);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Não foi possível carregar os dados. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [categoriaFiltro, periodoFiltro]);

  // Estrutura básica da página
  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Previsões e Recomendações</h1>
            <p className="text-muted-foreground">
              Insights personalizados baseados no seu histórico de atividades
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              toast.info('Atualizando previsões e recomendações...');
              // Implementar lógica de atualização
            }}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </Button>
        </header>

        <Tabs defaultValue="recomendacoes" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="recomendacoes">
              <Lightbulb className="h-4 w-4 mr-2" />
              Recomendações
            </TabsTrigger>
            <TabsTrigger value="previsoes">
              <TrendingUp className="h-4 w-4 mr-2" />
              Previsões
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  <SelectItem value="corrida">Corrida</SelectItem>
                  <SelectItem value="ciclismo">Ciclismo</SelectItem>
                  <SelectItem value="caminhada">Caminhada</SelectItem>
                  <SelectItem value="natacao">Natação</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7dias">Próximos 7 dias</SelectItem>
                  <SelectItem value="14dias">Próximos 14 dias</SelectItem>
                  <SelectItem value="30dias">Próximos 30 dias</SelectItem>
                  <SelectItem value="todos">Todos os períodos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="recomendacoes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-6 w-3/4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-muted rounded mb-4"></div>
                      <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : recomendacoes.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhuma recomendação encontrada para os filtros selecionados.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCategoriaFiltro('todas');
                      setPeriodoFiltro('7dias');
                    }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <>
                  {/* Recomendações de alta prioridade */}
                  {recomendacoes.filter(r => r.prioridade === 'alta').length > 0 && (
                    <div className="col-span-2 mb-2">
                      <h2 className="text-lg font-medium mb-3">Recomendações Prioritárias</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recomendacoes
                          .filter(r => r.prioridade === 'alta')
                          .map(recomendacao => (
                            <RecomendacaoCard
                              key={recomendacao.id}
                              recomendacao={recomendacao}
                              onAcaoPrimaria={(id) => {
                                const rec = recomendacoes.find(r => r.id === id);
                                if (rec?.acoes?.primaria) {
                                  window.location.href = rec.acoes.primaria.url;
                                }
                              }}
                              onDetalhes={(id) => {
                                const rec = recomendacoes.find(r => r.id === id);
                                if (rec) {
                                  setSelectedRecomendacao(rec);
                                  setShowRecomendacaoModal(true);
                                }
                              }}
                            />
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Outras recomendações */}
                  {recomendacoes.filter(r => r.prioridade !== 'alta').length > 0 && (
                    <div className="col-span-2">
                      <h2 className="text-lg font-medium mb-3">Outras Recomendações</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recomendacoes
                          .filter(r => r.prioridade !== 'alta')
                          .map(recomendacao => (
                            <RecomendacaoCard
                              key={recomendacao.id}
                              recomendacao={recomendacao}
                              onAcaoPrimaria={(id) => {
                                const rec = recomendacoes.find(r => r.id === id);
                                if (rec?.acoes?.primaria) {
                                  window.location.href = rec.acoes.primaria.url;
                                }
                              }}
                              onDetalhes={(id) => {
                                const rec = recomendacoes.find(r => r.id === id);
                                if (rec) {
                                  setSelectedRecomendacao(rec);
                                  setShowRecomendacaoModal(true);
                                }
                              }}
                            />
                          ))
                        }
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="previsoes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-6 w-3/4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-muted rounded mb-4"></div>
                      <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : previsoes.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhuma previsão encontrada para os filtros selecionados.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCategoriaFiltro('todas');
                      setPeriodoFiltro('7dias');
                    }}
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <>
                  {/* Previsões por categoria */}
                  {['corrida', 'ciclismo', 'caminhada', 'natacao', 'geral'].map(categoria => {
                    const previsoesFiltradas = previsoes.filter(p => p.categoria === categoria);
                    if (previsoesFiltradas.length === 0) return null;

                    return (
                      <div key={categoria} className="col-span-2 mb-4">
                        <h2 className="text-lg font-medium mb-3">
                          {categoria === 'corrida' ? 'Previsões de Corrida' :
                           categoria === 'ciclismo' ? 'Previsões de Ciclismo' :
                           categoria === 'caminhada' ? 'Previsões de Caminhada' :
                           categoria === 'natacao' ? 'Previsões de Natação' :
                           'Previsões Gerais'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {previsoesFiltradas.map(previsao => (
                            <PrevisaoCard
                              key={previsao.id}
                              previsao={previsao}
                              onAcaoPrimaria={(id) => {
                                const prev = previsoes.find(p => p.id === id);
                                if (prev?.acoes?.primaria) {
                                  window.location.href = prev.acoes.primaria.url;
                                }
                              }}
                              onDetalhes={(id) => {
                                const prev = previsoes.find(p => p.id === id);
                                if (prev) {
                                  setSelectedPrevisao(prev);
                                  setShowPrevisaoModal(true);
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de detalhes da recomendação */}
      {selectedRecomendacao && showRecomendacaoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedRecomendacao.tipo === 'treino' ? (
                    <Zap className="h-6 w-6 text-blue-500" />
                  ) : selectedRecomendacao.tipo === 'descanso' ? (
                    <Clock className="h-6 w-6 text-purple-500" />
                  ) : selectedRecomendacao.tipo === 'nutricao' ? (
                    <Heart className="h-6 w-6 text-green-500" />
                  ) : selectedRecomendacao.tipo === 'hidratacao' ? (
                    <Heart className="h-6 w-6 text-cyan-500" />
                  ) : selectedRecomendacao.tipo === 'tecnica' ? (
                    <Target className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <Lightbulb className="h-6 w-6 text-gray-500" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedRecomendacao.titulo}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedRecomendacao.prioridade === 'alta' ? (
                        <Badge className="bg-red-500">Alta Prioridade</Badge>
                      ) : selectedRecomendacao.prioridade === 'media' ? (
                        <Badge className="bg-orange-500">Média Prioridade</Badge>
                      ) : (
                        <Badge className="bg-green-500">Baixa Prioridade</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <p className="mb-4">{selectedRecomendacao.descricao}</p>

              <div className="space-y-4 mb-6">
                {selectedRecomendacao.baseadoEm && (
                  <div>
                    <h3 className="font-medium mb-2">Baseado em</h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm">{selectedRecomendacao.baseadoEm}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">Categoria</h3>
                  <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-2">
                    {selectedRecomendacao.categoria === 'corrida' ? (
                      <Footprints className="h-5 w-5 text-orange-500" />
                    ) : selectedRecomendacao.categoria === 'ciclismo' ? (
                      <Bike className="h-5 w-5 text-blue-500" />
                    ) : selectedRecomendacao.categoria === 'caminhada' ? (
                      <Footprints className="h-5 w-5 text-green-500" />
                    ) : selectedRecomendacao.categoria === 'natacao' ? (
                      <Zap className="h-5 w-5 text-cyan-500" />
                    ) : (
                      <BarChart className="h-5 w-5 text-gray-500" />
                    )}
                    <span>
                      {selectedRecomendacao.categoria === 'corrida' ? 'Corrida' :
                       selectedRecomendacao.categoria === 'ciclismo' ? 'Ciclismo' :
                       selectedRecomendacao.categoria === 'caminhada' ? 'Caminhada' :
                       selectedRecomendacao.categoria === 'natacao' ? 'Natação' :
                       'Geral'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Gerado em</h3>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm">{new Date(selectedRecomendacao.dataGeracao).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRecomendacaoModal(false)}
                >
                  Fechar
                </Button>

                {selectedRecomendacao.acoes?.primaria && (
                  <Button
                    className="flex-1 gap-1"
                    onClick={() => {
                      window.location.href = selectedRecomendacao.acoes!.primaria!.url;
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>{selectedRecomendacao.acoes.primaria.texto}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes da previsão */}
      {selectedPrevisao && showPrevisaoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedPrevisao.tipo === 'tempo' ? (
                    <Clock className="h-6 w-6 text-blue-500" />
                  ) : selectedPrevisao.tipo === 'distancia' ? (
                    <Footprints className="h-6 w-6 text-green-500" />
                  ) : selectedPrevisao.tipo === 'ritmo' ? (
                    <Zap className="h-6 w-6 text-orange-500" />
                  ) : selectedPrevisao.tipo === 'vo2max' ? (
                    <BarChart className="h-6 w-6 text-purple-500" />
                  ) : (
                    <TrendingUp className="h-6 w-6 text-gray-500" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedPrevisao.titulo}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Previsão
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedPrevisao.confianca}% de confiança
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mb-4">{selectedPrevisao.descricao}</p>

              <div className="space-y-4 mb-6">
                {selectedPrevisao.valorAtual !== undefined && selectedPrevisao.valorPrevisto !== undefined && (
                  <div>
                    <h3 className="font-medium mb-2">Valores</h3>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Valor atual:</span>
                        <span className="font-medium">
                          {selectedPrevisao.valorAtual} {selectedPrevisao.unidade}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Valor previsto:</span>
                        <span className="font-medium">
                          {selectedPrevisao.valorPrevisto} {selectedPrevisao.unidade}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Variação:</span>
                        <span className={`font-medium ${
                          selectedPrevisao.tendencia === 'aumento' ? 'text-green-500' :
                          selectedPrevisao.tendencia === 'diminuicao' ? 'text-red-500' :
                          'text-gray-500'
                        }`}>
                          {selectedPrevisao.tendencia === 'aumento' ? '+' :
                           selectedPrevisao.tendencia === 'diminuicao' ? '-' : ''}
                          {Math.abs(((selectedPrevisao.valorPrevisto - selectedPrevisao.valorAtual) / selectedPrevisao.valorAtual) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPrevisao.baseadoEm && (
                  <div>
                    <h3 className="font-medium mb-2">Baseado em</h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm">{selectedPrevisao.baseadoEm}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">Categoria</h3>
                  <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-2">
                    {selectedPrevisao.categoria === 'corrida' ? (
                      <Footprints className="h-5 w-5 text-orange-500" />
                    ) : selectedPrevisao.categoria === 'ciclismo' ? (
                      <Bike className="h-5 w-5 text-blue-500" />
                    ) : selectedPrevisao.categoria === 'caminhada' ? (
                      <Footprints className="h-5 w-5 text-green-500" />
                    ) : selectedPrevisao.categoria === 'natacao' ? (
                      <Zap className="h-5 w-5 text-cyan-500" />
                    ) : (
                      <BarChart className="h-5 w-5 text-gray-500" />
                    )}
                    <span>
                      {selectedPrevisao.categoria === 'corrida' ? 'Corrida' :
                       selectedPrevisao.categoria === 'ciclismo' ? 'Ciclismo' :
                       selectedPrevisao.categoria === 'caminhada' ? 'Caminhada' :
                       selectedPrevisao.categoria === 'natacao' ? 'Natação' :
                       'Geral'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Datas</h3>
                  <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gerado em:</span>
                      <span className="text-sm">
                        {new Date(selectedPrevisao.dataGeracao).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Previsão para:</span>
                      <span className="text-sm">
                        {new Date(selectedPrevisao.dataPrevisao).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPrevisaoModal(false)}
                >
                  Fechar
                </Button>

                {selectedPrevisao.acoes?.primaria && (
                  <Button
                    className="flex-1 gap-1"
                    onClick={() => {
                      window.location.href = selectedPrevisao.acoes!.primaria!.url;
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>{selectedPrevisao.acoes.primaria.texto}</span>
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
