import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronRight, Plus, Running, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Planos de Treino | FuseLabs',
  description: 'Gerencie seus planos de treino personalizados',
};

export default function PlanosPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Planos de Treino</h1>
        <Link href="/planos/treinos/criar">
          <Button className="gap-2">
            <Plus size={16} />
            Criar Novo Plano
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="meus" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="meus">Meus Planos</TabsTrigger>
          <TabsTrigger value="ativos">Ativos</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="meus">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Plano Ativo */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Corrida 5K - 8 Semanas</CardTitle>
                    <CardDescription>Plano para iniciantes</CardDescription>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">Ativo</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Running size={16} className="text-muted-foreground" />
                    <span>Corrida</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>8 semanas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-muted-foreground" />
                    <span>Iniciante</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Progresso:</span>
                    <div className="w-full h-2 bg-muted rounded overflow-hidden mt-1">
                      <div className="h-full bg-primary" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Plano gradual para iniciantes que desejam completar sua primeira corrida de 5K.
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href="/planos/treinos/1" className="w-full">
                  <Button variant="outline" className="w-full justify-between">
                    Ver Detalhes
                    <ChevronRight size={16} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
            
            {/* Plano em Rascunho */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Musculação - 12 Semanas</CardTitle>
                    <CardDescription>Ganho de força</CardDescription>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">Rascunho</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Running size={16} className="text-muted-foreground" />
                    <span>Musculação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>12 semanas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-muted-foreground" />
                    <span>Intermediário</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Plano focado em ganho de força e hipertrofia muscular para praticantes intermediários.
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1">
                    Ativar
                  </Button>
                  <Link href="/planos/treinos/2" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Editar
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
            
            {/* Plano Concluído */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Caminhada Diária</CardTitle>
                    <CardDescription>Melhoria de saúde</CardDescription>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">Concluído</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Running size={16} className="text-muted-foreground" />
                    <span>Caminhada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    <span>4 semanas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-muted-foreground" />
                    <span>Iniciante</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Progresso:</span>
                    <div className="w-full h-2 bg-muted rounded overflow-hidden mt-1">
                      <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Plano de caminhada diária para iniciantes buscando melhorar saúde e condicionamento.
                </p>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href="/planos/treinos/3" className="w-full">
                  <Button variant="outline" className="w-full justify-between">
                    Ver Resultados
                    <ChevronRight size={16} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="ativos">
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Corrida 5K - 8 Semanas</CardTitle>
                    <CardDescription>Plano para iniciantes - Semana 2 de 8</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Ver Detalhes</Button>
                    <Button size="sm">Treino de Hoje</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Geral</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '25%' }}></div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Próximos treinos:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Hoje</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <p className="text-xs">Corrida leve - 20 min (2.5km)</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Quarta</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <p className="text-xs">Caminhada/Corrida - 25 min</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-sm">Sexta</CardTitle>
                      </CardHeader>
                      <CardContent className="py-2 px-3">
                        <p className="text-xs">Corrida progressiva - 30 min</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="concluidos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Caminhada Diária</CardTitle>
                    <CardDescription>Concluído em 15/05/2023</CardDescription>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    100% Completo
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duração:</span>
                      <span className="ml-2 font-medium">4 semanas</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Treinos:</span>
                      <span className="ml-2 font-medium">28/28</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tokens ganhos:</span>
                      <span className="ml-2 font-medium">240 FUSE</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Distância total:</span>
                      <span className="ml-2 font-medium">83.4 km</span>
                    </div>
                  </div>
                </div>
                <h4 className="text-sm font-medium mb-1">Resultados alcançados:</h4>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Caminhada diária de 30 minutos alcançada</li>
                  <li>Aumento de resistência cardiovascular</li>
                  <li>Redução de 1.2kg de peso corporal</li>
                </ul>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href="/planos/treinos/3" className="w-full">
                  <Button variant="outline" className="w-full justify-between">
                    Ver Relatório Completo
                    <ChevronRight size={16} />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Benefícios Premium */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle>Potencialize seus Treinos com IA</CardTitle>
          <CardDescription>
            Nossos planos de treino personalizados são criados por IA de última geração, adaptados ao seu perfil e objetivos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Running size={20} className="text-primary" />
                5 Fases Progressivas
              </h3>
              <p className="text-sm">
                Evolua gradualmente com planos que se adaptam ao seu nível atual e progridem com você, 
                desde iniciante até performance avançada.
              </p>
            </div>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Zap size={20} className="text-primary" />
                Recompensas Personalizadas
              </h3>
              <p className="text-sm">
                Ganhe tokens baseados no seu esforço pessoal, não em métricas absolutas, 
                garantindo reconhecimento justo para todos os níveis.
              </p>
            </div>
            <div className="bg-white bg-opacity-50 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Adaptação Contínua
              </h3>
              <p className="text-sm">
                Planos que evoluem automaticamente com base no seu feedback e desempenho, 
                garantindo desafio constante e resultados reais.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/perfil/esportivo" className="w-full">
            <Button className="w-full">
              Configurar Meu Perfil Esportivo
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 