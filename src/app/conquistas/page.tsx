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
  Badge,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '@fuseapp/utils';
import { 
  Trophy, 
  Award, 
  Star, 
  Zap, 
  Flame, 
  Medal,
  Calendar,
  Clock,
  Share2,
  Lock,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos de conquistas
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'distance' | 'activity' | 'social' | 'challenge' | 'streak';
  icon: 'trophy' | 'award' | 'star' | 'zap' | 'flame' | 'medal';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress?: number; // 0-100
  completed: boolean;
  completedAt?: Date;
  reward: {
    xp: number;
    tokens?: number;
  };
  secret?: boolean;
}

export default function ConquistasPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Carregar conquistas
  useEffect(() => {
    const fetchAchievements = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const response = await fetch('/api/achievements');
        // const data = await response.json();
        
        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados
        const mockAchievements: Achievement[] = [
          {
            id: 'ach_1',
            title: 'Primeiros Passos',
            description: 'Complete sua primeira atividade física',
            category: 'activity',
            icon: 'award',
            level: 'bronze',
            completed: true,
            completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            reward: {
              xp: 50,
              tokens: 5
            }
          },
          {
            id: 'ach_2',
            title: 'Corredor Iniciante',
            description: 'Corra um total de 10km',
            category: 'distance',
            icon: 'zap',
            level: 'bronze',
            progress: 100,
            completed: true,
            completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            reward: {
              xp: 100,
              tokens: 10
            }
          },
          {
            id: 'ach_3',
            title: 'Corredor Intermediário',
            description: 'Corra um total de 50km',
            category: 'distance',
            icon: 'zap',
            level: 'silver',
            progress: 68,
            completed: false,
            reward: {
              xp: 200,
              tokens: 20
            }
          },
          {
            id: 'ach_4',
            title: 'Corredor Avançado',
            description: 'Corra um total de 100km',
            category: 'distance',
            icon: 'zap',
            level: 'gold',
            progress: 34,
            completed: false,
            reward: {
              xp: 500,
              tokens: 50
            }
          },
          {
            id: 'ach_5',
            title: 'Maratonista',
            description: 'Complete uma corrida de pelo menos 42km',
            category: 'distance',
            icon: 'trophy',
            level: 'platinum',
            progress: 0,
            completed: false,
            reward: {
              xp: 1000,
              tokens: 100
            }
          },
          {
            id: 'ach_6',
            title: 'Ciclista Iniciante',
            description: 'Pedale um total de 20km',
            category: 'distance',
            icon: 'zap',
            level: 'bronze',
            progress: 100,
            completed: true,
            completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            reward: {
              xp: 100,
              tokens: 10
            }
          },
          {
            id: 'ach_7',
            title: 'Desafiante',
            description: 'Complete seu primeiro desafio',
            category: 'challenge',
            icon: 'flame',
            level: 'bronze',
            progress: 100,
            completed: true,
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            reward: {
              xp: 150,
              tokens: 15
            }
          },
          {
            id: 'ach_8',
            title: 'Consistência',
            description: 'Complete atividades em 7 dias consecutivos',
            category: 'streak',
            icon: 'flame',
            level: 'silver',
            progress: 57,
            completed: false,
            reward: {
              xp: 300,
              tokens: 30
            }
          },
          {
            id: 'ach_9',
            title: 'Influenciador',
            description: 'Compartilhe 5 atividades nas redes sociais',
            category: 'social',
            icon: 'star',
            level: 'bronze',
            progress: 60,
            completed: false,
            reward: {
              xp: 200,
              tokens: 20
            }
          },
          {
            id: 'ach_10',
            title: 'Conquista Secreta',
            description: '???',
            category: 'activity',
            icon: 'medal',
            level: 'gold',
            secret: true,
            completed: false,
            reward: {
              xp: 500,
              tokens: 50
            }
          }
        ];
        
        setAchievements(mockAchievements);
      } catch (error) {
        console.error('Erro ao carregar conquistas:', error);
        toast.error('Não foi possível carregar suas conquistas. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAchievements();
  }, []);

  // Filtrar conquistas por categoria
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return achievement.completed;
    if (activeTab === 'in-progress') return !achievement.completed && achievement.progress && achievement.progress > 0;
    return achievement.category === activeTab;
  });

  // Renderizar ícone da conquista
  const renderIcon = (icon: string, level: string) => {
    const iconColor = level === 'bronze' ? 'text-amber-600' :
                     level === 'silver' ? 'text-slate-400' :
                     level === 'gold' ? 'text-yellow-500' :
                     'text-purple-600';
    
    switch(icon) {
      case 'trophy':
        return <Trophy className={`h-6 w-6 ${iconColor}`} />;
      case 'award':
        return <Award className={`h-6 w-6 ${iconColor}`} />;
      case 'star':
        return <Star className={`h-6 w-6 ${iconColor}`} />;
      case 'zap':
        return <Zap className={`h-6 w-6 ${iconColor}`} />;
      case 'flame':
        return <Flame className={`h-6 w-6 ${iconColor}`} />;
      case 'medal':
        return <Medal className={`h-6 w-6 ${iconColor}`} />;
      default:
        return <Award className={`h-6 w-6 ${iconColor}`} />;
    }
  };

  // Abrir modal de detalhes
  const openAchievementDetails = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowDetailsModal(true);
  };

  // Compartilhar conquista
  const shareAchievement = (achievement: Achievement) => {
    if (navigator.share) {
      navigator.share({
        title: `Conquista: ${achievement.title}`,
        text: `Acabei de conquistar "${achievement.title}" no FuseLabs! ${achievement.description}`,
        url: window.location.href
      }).catch(err => {
        console.error('Erro ao compartilhar:', err);
      });
    } else {
      // Fallback para navegadores que não suportam a API Web Share
      toast.info('Copie o link e compartilhe sua conquista!');
      navigator.clipboard.writeText(
        `Acabei de conquistar "${achievement.title}" no FuseLabs! ${achievement.description} ${window.location.href}`
      );
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header>
          <h1 className="text-3xl font-bold">Conquistas</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e desbloqueie recompensas
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="completed">Concluídas</TabsTrigger>
                <TabsTrigger value="in-progress">Em Progresso</TabsTrigger>
                <TabsTrigger value="distance">Distância</TabsTrigger>
                <TabsTrigger value="challenge">Desafios</TabsTrigger>
              </TabsList>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                ) : filteredAchievements.length === 0 ? (
                  <div className="col-span-2 py-8 text-center">
                    <p className="text-muted-foreground">
                      Nenhuma conquista encontrada nesta categoria.
                    </p>
                  </div>
                ) : (
                  filteredAchievements.map(achievement => (
                    <Card 
                      key={achievement.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${achievement.completed ? 'border-green-200' : ''}`}
                      onClick={() => openAchievementDetails(achievement)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                              {renderIcon(achievement.icon, achievement.level)}
                            </div>
                            <CardTitle className="text-lg">{achievement.title}</CardTitle>
                          </div>
                          
                          {achievement.completed && (
                            <Badge variant="success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Concluída
                            </Badge>
                          )}
                          
                          {achievement.secret && !achievement.completed && (
                            <Badge variant="outline">
                              <Lock className="h-3 w-3 mr-1" />
                              Secreta
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {achievement.secret && !achievement.completed 
                            ? 'Complete esta conquista para revelar seus detalhes.' 
                            : achievement.description}
                        </p>
                        
                        {!achievement.completed && achievement.progress !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progresso:</span>
                              <span>{achievement.progress}%</span>
                            </div>
                            <Progress value={achievement.progress} />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="px-2 py-1">
                              {achievement.reward.xp} XP
                            </Badge>
                            {achievement.reward.tokens && (
                              <Badge variant="outline" className="px-2 py-1">
                                {achievement.reward.tokens} FUSE
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </Tabs>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-3xl font-bold">
                      {achievements.filter(a => a.completed).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Conquistas</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-3xl font-bold">
                      {achievements.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Progresso Geral</p>
                  <Progress 
                    value={Math.round((achievements.filter(a => a.completed).length / achievements.length) * 100)} 
                  />
                  <p className="text-sm text-right text-muted-foreground">
                    {Math.round((achievements.filter(a => a.completed).length / achievements.length) * 100)}%
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">Por Nível</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Bronze</span>
                      <span>
                        {achievements.filter(a => a.level === 'bronze' && a.completed).length}/
                        {achievements.filter(a => a.level === 'bronze').length}
                      </span>
                    </div>
                    <Progress 
                      value={Math.round((achievements.filter(a => a.level === 'bronze' && a.completed).length / 
                              Math.max(1, achievements.filter(a => a.level === 'bronze').length)) * 100)}
                      className="h-2 bg-amber-200"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Prata</span>
                      <span>
                        {achievements.filter(a => a.level === 'silver' && a.completed).length}/
                        {achievements.filter(a => a.level === 'silver').length}
                      </span>
                    </div>
                    <Progress 
                      value={Math.round((achievements.filter(a => a.level === 'silver' && a.completed).length / 
                              Math.max(1, achievements.filter(a => a.level === 'silver').length)) * 100)}
                      className="h-2 bg-slate-300"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Ouro</span>
                      <span>
                        {achievements.filter(a => a.level === 'gold' && a.completed).length}/
                        {achievements.filter(a => a.level === 'gold').length}
                      </span>
                    </div>
                    <Progress 
                      value={Math.round((achievements.filter(a => a.level === 'gold' && a.completed).length / 
                              Math.max(1, achievements.filter(a => a.level === 'gold').length)) * 100)}
                      className="h-2 bg-yellow-400"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Platina</span>
                      <span>
                        {achievements.filter(a => a.level === 'platinum' && a.completed).length}/
                        {achievements.filter(a => a.level === 'platinum').length}
                      </span>
                    </div>
                    <Progress 
                      value={Math.round((achievements.filter(a => a.level === 'platinum' && a.completed).length / 
                              Math.max(1, achievements.filter(a => a.level === 'platinum').length)) * 100)}
                      className="h-2 bg-purple-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Modal de detalhes da conquista */}
      {selectedAchievement && showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  {renderIcon(selectedAchievement.icon, selectedAchievement.level)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selectedAchievement.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedAchievement.level.charAt(0).toUpperCase() + selectedAchievement.level.slice(1)}
                  </p>
                </div>
                
                {selectedAchievement.completed && (
                  <Badge variant="success" className="ml-auto">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Concluída
                  </Badge>
                )}
              </div>
              
              <p className="mb-4">{selectedAchievement.description}</p>
              
              {!selectedAchievement.completed && selectedAchievement.progress !== undefined && (
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso:</span>
                    <span>{selectedAchievement.progress}%</span>
                  </div>
                  <Progress value={selectedAchievement.progress} />
                </div>
              )}
              
              {selectedAchievement.completed && selectedAchievement.completedAt && (
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Concluída em {formatDate(selectedAchievement.completedAt)}</span>
                </div>
              )}
              
              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="font-medium mb-2">Recompensas:</p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{selectedAchievement.reward.xp} XP</span>
                  </div>
                  
                  {selectedAchievement.reward.tokens && (
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-primary" />
                      <span>{selectedAchievement.reward.tokens} FUSE</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Fechar
                </Button>
                
                {selectedAchievement.completed && (
                  <Button 
                    className="flex-1 gap-1"
                    onClick={() => shareAchievement(selectedAchievement)}
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Compartilhar</span>
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
