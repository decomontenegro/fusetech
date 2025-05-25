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
  SelectItem,
  Separator
} from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  Zap, 
  Award, 
  Target, 
  CheckCircle,
  XCircle,
  Info,
  Plus,
  ArrowRight,
  BarChart,
  Dumbbell,
  Heart,
  Flame,
  Footprints,
  Bike,
  Timer,
  Repeat,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@fuseapp/utils';

// Tipos
interface TrainingPlan {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'running' | 'cycling' | 'walking' | 'mixed';
  duration: number; // em semanas
  goal: string;
  startDate?: Date;
  endDate?: Date;
  progress?: number; // 0-100
  status: 'active' | 'completed' | 'available' | 'paused';
  workouts: Workout[];
  createdAt: Date;
}

interface Workout {
  id: string;
  day: number; // dia da semana (0-6, domingo-sábado)
  title: string;
  description: string;
  duration: number; // em minutos
  distance?: number; // em metros
  intensity: 'low' | 'medium' | 'high';
  completed?: boolean;
  completedAt?: Date;
}

export default function PlanosPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  // Carregar planos
  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const response = await fetch('/api/training-plans');
        // const data = await response.json();
        
        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados
        const mockPlans: TrainingPlan[] = [
          {
            id: 'plan_1',
            title: 'Plano para 5K',
            description: 'Plano de treino para completar uma corrida de 5K em 8 semanas.',
            level: 'beginner',
            type: 'running',
            duration: 8,
            goal: 'Completar 5K',
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
            progress: 25,
            status: 'active',
            workouts: [
              {
                id: 'workout_1',
                day: 1, // Segunda
                title: 'Corrida Leve',
                description: 'Corrida leve para aquecimento e adaptação.',
                duration: 20,
                distance: 2000,
                intensity: 'low',
                completed: true,
                completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'workout_2',
                day: 3, // Quarta
                title: 'Intervalos',
                description: 'Treino de intervalos para melhorar resistência.',
                duration: 30,
                distance: 3000,
                intensity: 'medium',
                completed: true,
                completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
              },
              {
                id: 'workout_3',
                day: 5, // Sexta
                title: 'Corrida Longa',
                description: 'Corrida mais longa para construir resistência.',
                duration: 40,
                distance: 4000,
                intensity: 'medium',
                completed: false
              }
            ],
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'plan_2',
            title: 'Plano para 10K',
            description: 'Plano de treino para completar uma corrida de 10K em 12 semanas.',
            level: 'intermediate',
            type: 'running',
            duration: 12,
            goal: 'Completar 10K',
            status: 'available',
            workouts: [
              {
                id: 'workout_4',
                day: 1, // Segunda
                title: 'Corrida Leve',
                description: 'Corrida leve para aquecimento.',
                duration: 30,
                distance: 3000,
                intensity: 'low'
              },
              {
                id: 'workout_5',
                day: 2, // Terça
                title: 'Treino de Força',
                description: 'Exercícios de força para corredores.',
                duration: 45,
                intensity: 'medium'
              },
              {
                id: 'workout_6',
                day: 4, // Quinta
                title: 'Intervalos',
                description: 'Treino de intervalos para melhorar velocidade.',
                duration: 40,
                distance: 5000,
                intensity: 'high'
              },
              {
                id: 'workout_7',
                day: 6, // Sábado
                title: 'Corrida Longa',
                description: 'Corrida longa para construir resistência.',
                duration: 60,
                distance: 8000,
                intensity: 'medium'
              }
            ],
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'plan_3',
            title: 'Plano de Ciclismo',
            description: 'Plano de treino para melhorar sua performance no ciclismo.',
            level: 'intermediate',
            type: 'cycling',
            duration: 10,
            goal: 'Melhorar resistência',
            status: 'available',
            workouts: [
              {
                id: 'workout_8',
                day: 1, // Segunda
                title: 'Pedalada Leve',
                description: 'Pedalada leve para recuperação.',
                duration: 45,
                distance: 15000,
                intensity: 'low'
              },
              {
                id: 'workout_9',
                day: 3, // Quarta
                title: 'Treino de Subidas',
                description: 'Treino focado em subidas para ganhar força.',
                duration: 60,
                distance: 20000,
                intensity: 'high'
              },
              {
                id: 'workout_10',
                day: 5, // Sexta
                title: 'Intervalos',
                description: 'Treino de intervalos para melhorar potência.',
                duration: 50,
                distance: 18000,
                intensity: 'high'
              },
              {
                id: 'workout_11',
                day: 6, // Sábado
                title: 'Pedalada Longa',
                description: 'Pedalada longa para construir resistência.',
                duration: 120,
                distance: 40000,
                intensity: 'medium'
              }
            ],
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
          }
        ];
        
        setPlans(mockPlans);
      } catch (error) {
        console.error('Erro ao carregar planos de treino:', error);
        toast.error('Não foi possível carregar seus planos de treino. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  // Filtrar planos por status
  const filteredPlans = plans.filter(plan => {
    if (activeTab === 'active') return plan.status === 'active';
    if (activeTab === 'completed') return plan.status === 'completed';
    if (activeTab === 'available') return plan.status === 'available';
    return true;
  });

  // Renderizar ícone de tipo
  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'running':
        return <Footprints className="h-5 w-5 text-orange-500" />;
      case 'cycling':
        return <Bike className="h-5 w-5 text-blue-500" />;
      case 'walking':
        return <Footprints className="h-5 w-5 text-green-500" />;
      case 'mixed':
        return <Dumbbell className="h-5 w-5 text-purple-500" />;
      default:
        return <Dumbbell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Renderizar badge de nível
  const renderLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Badge className="bg-green-500">Iniciante</Badge>;
      case 'intermediate':
        return <Badge className="bg-blue-500">Intermediário</Badge>;
      case 'advanced':
        return <Badge className="bg-purple-500">Avançado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  // Iniciar um plano
  const handleStartPlan = (plan: TrainingPlan) => {
    // Em produção, chamar API
    // const response = await fetch(`/api/training-plans/${plan.id}/start`, { method: 'POST' });
    
    // Simulação
    const updatedPlan = {
      ...plan,
      status: 'active' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.duration * 7 * 24 * 60 * 60 * 1000),
      progress: 0
    };
    
    setPlans(plans.map(p => p.id === plan.id ? updatedPlan : p));
    setActiveTab('active');
    toast.success('Plano de treino iniciado com sucesso!');
  };

  // Marcar treino como concluído
  const handleCompleteWorkout = (planId: string, workoutId: string) => {
    // Em produção, chamar API
    // const response = await fetch(`/api/training-plans/${planId}/workouts/${workoutId}/complete`, { method: 'POST' });
    
    // Simulação
    const updatedPlans = plans.map(plan => {
      if (plan.id === planId) {
        const updatedWorkouts = plan.workouts.map(workout => {
          if (workout.id === workoutId) {
            return {
              ...workout,
              completed: true,
              completedAt: new Date()
            };
          }
          return workout;
        });
        
        // Calcular progresso
        const totalWorkouts = plan.workouts.length;
        const completedWorkouts = updatedWorkouts.filter(w => w.completed).length;
        const progress = Math.round((completedWorkouts / totalWorkouts) * 100);
        
        // Verificar se o plano foi concluído
        const status = progress === 100 ? 'completed' : plan.status;
        
        return {
          ...plan,
          workouts: updatedWorkouts,
          progress,
          status
        };
      }
      return plan;
    });
    
    setPlans(updatedPlans);
    
    // Atualizar plano selecionado se estiver aberto
    if (selectedPlan && selectedPlan.id === planId) {
      const updatedPlan = updatedPlans.find(p => p.id === planId);
      if (updatedPlan) {
        setSelectedPlan(updatedPlan);
      }
    }
    
    toast.success('Treino marcado como concluído!');
  };

  // Abrir detalhes do plano
  const handleOpenPlanDetails = (plan: TrainingPlan) => {
    setSelectedPlan(plan);
    setShowPlanDetails(true);
  };

  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Planos de Treino</h1>
            <p className="text-muted-foreground">
              Planos personalizados para alcançar seus objetivos
            </p>
          </div>
        </header>
        
        <Tabs defaultValue="active" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="available">Disponíveis</TabsTrigger>
            <TabsTrigger value="completed">Concluídos</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(2).fill(0).map((_, i) => (
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
            ) : filteredPlans.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    {activeTab === 'active' 
                      ? 'Você não tem planos de treino ativos no momento.' 
                      : activeTab === 'completed'
                        ? 'Você ainda não concluiu nenhum plano de treino.'
                        : 'Não há planos de treino disponíveis no momento.'}
                  </p>
                  {activeTab === 'active' && (
                    <Button onClick={() => setActiveTab('available')}>
                      Ver Planos Disponíveis
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPlans.map(plan => (
                  <Card key={plan.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          {renderTypeIcon(plan.type)}
                          {renderLevelBadge(plan.level)}
                        </div>
                        {plan.status === 'active' && plan.progress !== undefined && (
                          <Badge variant="outline" className="font-medium">
                            {plan.progress}% Concluído
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-2">
                        {plan.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{plan.duration} semanas</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span>{plan.goal}</span>
                          </div>
                        </div>
                        
                        {plan.status === 'active' && plan.progress !== undefined && (
                          <div className="space-y-1">
                            <Progress value={plan.progress} className="h-2" />
                          </div>
                        )}
                        
                        {plan.status === 'active' && plan.startDate && plan.endDate && (
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{formatDate(plan.startDate)}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span>{formatDate(plan.endDate)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      {plan.status === 'available' ? (
                        <Button 
                          className="w-full gap-1"
                          onClick={() => handleStartPlan(plan)}
                        >
                          <Zap className="h-4 w-4" />
                          <span>Iniciar Plano</span>
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full gap-1"
                          onClick={() => handleOpenPlanDetails(plan)}
                        >
                          <Info className="h-4 w-4" />
                          <span>Ver Detalhes</span>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de detalhes do plano */}
      {selectedPlan && showPlanDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {renderTypeIcon(selectedPlan.type)}
                  <div>
                    <h2 className="text-xl font-bold">{selectedPlan.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      {renderLevelBadge(selectedPlan.level)}
                      <span className="text-sm text-muted-foreground">
                        {selectedPlan.duration} semanas
                      </span>
                    </div>
                  </div>
                </div>
                
                {selectedPlan.status === 'active' && selectedPlan.progress !== undefined && (
                  <Badge variant="outline" className="font-medium">
                    {selectedPlan.progress}% Concluído
                  </Badge>
                )}
              </div>
              
              <p className="mb-4">{selectedPlan.description}</p>
              
              {selectedPlan.status === 'active' && selectedPlan.progress !== undefined && (
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso:</span>
                    <span>{selectedPlan.progress}%</span>
                  </div>
                  <Progress value={selectedPlan.progress} className="h-2" />
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">Treinos</h3>
                <div className="space-y-3">
                  {selectedPlan.workouts.map(workout => {
                    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                    const intensityColors = {
                      low: 'text-green-500',
                      medium: 'text-orange-500',
                      high: 'text-red-500'
                    };
                    
                    return (
                      <Card key={workout.id} className={`border ${workout.completed ? 'border-green-200' : ''}`}>
                        <CardHeader className="p-3 pb-2">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{dayNames[workout.day]}</Badge>
                              <span className={`text-xs font-medium ${intensityColors[workout.intensity]}`}>
                                {workout.intensity === 'low' ? 'Leve' : 
                                 workout.intensity === 'medium' ? 'Moderado' : 'Intenso'}
                              </span>
                            </div>
                            {workout.completed && (
                              <Badge variant="success" className="ml-auto">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Concluído
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base mt-1">
                            {workout.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="p-3 pt-0">
                          <p className="text-sm text-muted-foreground mb-2">
                            {workout.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{workout.duration} min</span>
                            </div>
                            
                            {workout.distance && (
                              <div className="flex items-center gap-1">
                                <Footprints className="h-4 w-4 text-muted-foreground" />
                                <span>{workout.distance / 1000} km</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        
                        {selectedPlan.status === 'active' && !workout.completed && (
                          <CardFooter className="p-3 pt-0">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                              onClick={() => handleCompleteWorkout(selectedPlan.id, workout.id)}
                            >
                              Marcar como Concluído
                            </Button>
                          </CardFooter>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPlanDetails(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
