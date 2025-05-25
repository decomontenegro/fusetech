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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import { InsightCard, Insight, InsightType } from '../../components/analytics/InsightCard';
import { ActivityLineChart } from '../../components/charts/ActivityLineChart';
import { ActivityDistributionChart } from '../../components/charts/ActivityDistributionChart';
import { ProgressBarChart } from '../../components/charts/ProgressBarChart';
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Calendar,
  Clock,
  Zap,
  Award,
  Target,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('month');
  const [activityType, setActivityType] = useState('all');

  // Dados para os gráficos (simulados)
  const [activityData, setActivityData] = useState({
    distanceOverTime: [
      { date: '2023-05-01', value: 5.2 },
      { date: '2023-05-03', value: 3.1 },
      { date: '2023-05-05', value: 7.4 },
      { date: '2023-05-08', value: 4.5 },
      { date: '2023-05-10', value: 6.2 },
      { date: '2023-05-12', value: 8.1 },
      { date: '2023-05-15', value: 5.7 },
      { date: '2023-05-18', value: 9.3 },
      { date: '2023-05-20', value: 7.8 },
      { date: '2023-05-23', value: 10.5 },
      { date: '2023-05-25', value: 8.9 },
      { date: '2023-05-28', value: 11.2 },
      { date: '2023-05-30', value: 9.7 }
    ],
    activityDistribution: [
      { label: 'Corrida', value: 45, color: 'rgb(239, 68, 68)' },
      { label: 'Ciclismo', value: 30, color: 'rgb(59, 130, 246)' },
      { label: 'Caminhada', value: 15, color: 'rgb(16, 185, 129)' },
      { label: 'Natação', value: 10, color: 'rgb(245, 158, 11)' }
    ],
    weeklyProgress: [
      { label: 'Segunda', value: 8.5, target: 10 },
      { label: 'Terça', value: 5.2, target: 10 },
      { label: 'Quarta', value: 0, target: 10 },
      { label: 'Quinta', value: 12.3, target: 10 },
      { label: 'Sexta', value: 7.8, target: 10 },
      { label: 'Sábado', value: 15.1, target: 10 },
      { label: 'Domingo', value: 6.4, target: 10 }
    ],
    paceOverTime: [
      { date: '2023-05-01', value: 5.8 },
      { date: '2023-05-03', value: 5.9 },
      { date: '2023-05-05', value: 5.7 },
      { date: '2023-05-08', value: 5.9 },
      { date: '2023-05-10', value: 6.0 },
      { date: '2023-05-12', value: 6.1 },
      { date: '2023-05-15', value: 6.2 },
      { date: '2023-05-18', value: 6.3 },
      { date: '2023-05-20', value: 6.4 },
      { date: '2023-05-23', value: 6.5 },
      { date: '2023-05-25', value: 6.7 },
      { date: '2023-05-28', value: 6.8 },
      { date: '2023-05-30', value: 7.0 }
    ]
  });

  // Carregar insights
  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const response = await fetch(`/api/analytics/insights?period=${period}&type=${activityType}`);
        // const data = await response.json();

        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Dados simulados
        const mockInsights: Insight[] = [
          {
            id: 'insight_1',
            title: 'Melhoria na Velocidade',
            description: 'Sua velocidade média de corrida melhorou 12% em relação ao mês passado.',
            type: 'improvement',
            date: new Date(),
            data: {
              current: 10.5,
              previous: 9.4,
              unit: 'km/h',
              percentage: 12,
              trend: 'up'
            }
          },
          {
            id: 'insight_2',
            title: 'Novo Recorde Pessoal',
            description: 'Você atingiu sua maior distância em uma única corrida: 15km!',
            type: 'achievement',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            data: {
              current: 15,
              unit: 'km'
            },
            actionText: 'Compartilhar'
          },
          {
            id: 'insight_3',
            title: 'Sugestão de Treino',
            description: 'Tente aumentar sua frequência de corrida para 3x por semana para melhores resultados.',
            type: 'suggestion',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            actionText: 'Ver Plano de Treino'
          },
          {
            id: 'insight_4',
            title: 'Queda na Atividade',
            description: 'Sua atividade de ciclismo diminuiu 30% nas últimas duas semanas.',
            type: 'decline',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            data: {
              current: 20,
              previous: 28.5,
              unit: 'km',
              percentage: -30,
              trend: 'down'
            }
          },
          {
            id: 'insight_5',
            title: 'Sequência de 7 Dias',
            description: 'Você está com uma sequência de 7 dias de atividade física. Continue assim!',
            type: 'streak',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            data: {
              current: 7,
              unit: ' dias'
            },
            actionText: 'Ver Histórico'
          },
          {
            id: 'insight_6',
            title: 'Marco de Distância',
            description: 'Você atingiu 100km acumulados de corrida. Parabéns!',
            type: 'milestone',
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            data: {
              current: 100,
              unit: 'km'
            },
            actionText: 'Ver Conquista'
          }
        ];

        setInsights(mockInsights);
      } catch (error) {
        console.error('Erro ao carregar insights:', error);
        toast.error('Não foi possível carregar seus insights. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [period, activityType]);

  // Filtrar insights por tipo
  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'overview') return true;
    if (activeTab === 'improvements') return insight.type === 'improvement';
    if (activeTab === 'achievements') return insight.type === 'achievement' || insight.type === 'milestone';
    if (activeTab === 'suggestions') return insight.type === 'suggestion';
    return true;
  });

  // Executar ação do insight
  const handleInsightAction = (id: string) => {
    const insight = insights.find(i => i.id === id);
    if (!insight) return;

    switch (insight.type) {
      case 'achievement':
      case 'milestone':
        // Navegar para conquistas
        window.location.href = '/conquistas';
        break;
      case 'suggestion':
        // Mostrar plano de treino
        toast.info('Plano de treino personalizado será implementado em breve!');
        break;
      case 'streak':
        // Mostrar histórico de atividades
        window.location.href = '/atividades';
        break;
      default:
        // Ação genérica
        if (insight.actionLink) {
          window.location.href = insight.actionLink;
        } else {
          toast.info('Esta funcionalidade será implementada em breve!');
        }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Análise de Desempenho</h1>
            <p className="text-muted-foreground">
              Insights personalizados baseados nas suas atividades
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
                <SelectItem value="all">Todo o Período</SelectItem>
              </SelectContent>
            </Select>

            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de Atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Atividades</SelectItem>
                <SelectItem value="running">Corrida</SelectItem>
                <SelectItem value="cycling">Ciclismo</SelectItem>
                <SelectItem value="walking">Caminhada</SelectItem>
                <SelectItem value="swimming">Natação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="improvements">Melhorias</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
            <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
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
            ) : filteredInsights.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    Nenhum insight disponível para o período selecionado.
                  </p>
                  <Button onClick={() => setPeriod('all')}>
                    Ver Todos os Períodos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredInsights.map(insight => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onAction={handleInsightAction}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {activeTab === 'overview' && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <ActivityLineChart
              title="Distância por Dia"
              data={activityData.distanceOverTime}
              label="Distância"
              color="rgb(99, 102, 241)"
              unit="km"
              height={300}
            />

            <ActivityDistributionChart
              title="Distribuição de Atividades"
              data={activityData.activityDistribution}
              height={300}
              doughnut={true}
            />

            <ProgressBarChart
              title="Progresso Semanal"
              data={activityData.weeklyProgress}
              unit="km"
              height={300}
              horizontal={false}
            />

            <ActivityLineChart
              title="Evolução do Ritmo"
              data={activityData.paceOverTime}
              label="Ritmo"
              color="rgb(245, 158, 11)"
              unit="min/km"
              height={300}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
