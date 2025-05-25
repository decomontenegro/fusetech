import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Clock, Info, Running, Weight, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Criar Plano de Treino | FuseLabs',
  description: 'Crie um novo plano de treino personalizado com IA',
};

export default function CriarPlanoPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Criar Plano de Treino</h1>
        <Link href="/planos/treinos">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Voltar
          </Button>
        </Link>
      </div>
      
      <p className="text-muted-foreground">
        Nosso sistema de IA criará um plano personalizado com base nas suas informações de perfil esportivo e preferências.
      </p>
      
      <Tabs defaultValue="basico" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 mb-8">
          <TabsTrigger value="basico">Básico</TabsTrigger>
          <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Defina o tipo de plano de treino que você deseja criar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="exerciseType">Tipo de Exercício</Label>
                <Select defaultValue="running">
                  <SelectTrigger id="exerciseType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="running">Corrida</SelectItem>
                    <SelectItem value="walking">Caminhada</SelectItem>
                    <SelectItem value="cycling">Ciclismo</SelectItem>
                    <SelectItem value="swimming">Natação</SelectItem>
                    <SelectItem value="strength">Musculação</SelectItem>
                    <SelectItem value="hiit">HIIT</SelectItem>
                    <SelectItem value="yoga">Yoga</SelectItem>
                    <SelectItem value="mixed">Treino Misto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Nível de Experiência</Label>
                <Select defaultValue="beginner">
                  <SelectTrigger id="experienceLevel">
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Este nível determinará a intensidade e progressão do seu plano.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duração do Plano</Label>
                <Select defaultValue="8">
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 semanas</SelectItem>
                    <SelectItem value="8">8 semanas</SelectItem>
                    <SelectItem value="12">12 semanas</SelectItem>
                    <SelectItem value="16">16 semanas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência Semanal</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="frequency"
                    defaultValue={[3]}
                    min={1}
                    max={7}
                    step={1}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">3 dias</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="useProfile" defaultChecked />
                  <Label htmlFor="useProfile" className="text-sm font-normal cursor-pointer">
                    Usar meu perfil esportivo para personalização avançada
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Recomendado para resultados mais personalizados baseados no seu histórico e capacidades.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Próximo</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="objetivos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos do Plano</CardTitle>
              <CardDescription>
                Defina suas metas específicas para este plano de treino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primaryGoal">Objetivo Principal</Label>
                <Select defaultValue="endurance">
                  <SelectTrigger id="primaryGoal">
                    <SelectValue placeholder="Selecione o objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="endurance">Melhorar Resistência</SelectItem>
                    <SelectItem value="speed">Aumentar Velocidade</SelectItem>
                    <SelectItem value="strength">Ganhar Força</SelectItem>
                    <SelectItem value="weight_loss">Perder Peso</SelectItem>
                    <SelectItem value="general_fitness">Condicionamento Geral</SelectItem>
                    <SelectItem value="competition">Preparação para Competição</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Objetivos Específicos</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="goal-5k" />
                    <Label htmlFor="goal-5k" className="text-sm font-normal cursor-pointer">
                      Completar 5km
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="goal-10k" />
                    <Label htmlFor="goal-10k" className="text-sm font-normal cursor-pointer">
                      Completar 10km
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="goal-half" />
                    <Label htmlFor="goal-half" className="text-sm font-normal cursor-pointer">
                      Completar meia maratona
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="goal-time" />
                    <Label htmlFor="goal-time" className="text-sm font-normal cursor-pointer">
                      Melhorar tempo em corridas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="goal-weight" />
                    <Label htmlFor="goal-weight" className="text-sm font-normal cursor-pointer">
                      Perder peso (5kg+)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="goal-habit" />
                    <Label htmlFor="goal-habit" className="text-sm font-normal cursor-pointer">
                      Criar hábito de exercício
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="targetDistance">Distância Alvo (km)</Label>
                  <Input 
                    id="targetDistance" 
                    type="number" 
                    placeholder="Ex: 5, 10, 21..." 
                    defaultValue="5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetTime">Tempo Alvo (minutos)</Label>
                  <Input 
                    id="targetTime" 
                    type="number" 
                    placeholder="Ex: 30, 60..." 
                    defaultValue="30"
                  />
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3">
                <Info size={20} className="text-primary mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Planos Baseados em Esforço</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nosso sistema de tokenização recompensa o esforço relativo, não apenas métricas absolutas. 
                    Isso significa que você receberá tokens FUSE com base no seu esforço pessoal em relação ao seu 
                    próprio nível de condicionamento, garantindo uma recompensa justa independente do seu nível inicial.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Voltar</Button>
              <Button>Próximo</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização do Plano</CardTitle>
              <CardDescription>
                Revise o resumo do seu plano antes de criá-lo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-muted/30">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Running size={18} className="text-primary" />
                      Tipo de Treino
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <p className="font-medium">Corrida</p>
                    <p className="text-sm text-muted-foreground">
                      Foco em corrida para iniciantes
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock size={18} className="text-primary" />
                      Duração
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <p className="font-medium">8 Semanas</p>
                    <p className="text-sm text-muted-foreground">
                      3 sessões por semana
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader className="py-3 px-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap size={18} className="text-primary" />
                      Nível e Objetivo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-3 px-4">
                    <p className="font-medium">Iniciante</p>
                    <p className="text-sm text-muted-foreground">
                      Melhorar resistência e correr 5km
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Progresso Esperado</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Semana 1</span>
                      <span>Distância: 1.5-2km por sessão</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-primary/30" style={{ width: '20%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Semana 4</span>
                      <span>Distância: 2.5-3km por sessão</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-primary/50" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Semana 8</span>
                      <span>Distância: 5km por sessão</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Recompensas Estimadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Por treino completado</p>
                    <p className="text-lg font-semibold">10-20 FUSE</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Semanal (média)</p>
                    <p className="text-lg font-semibold">30-60 FUSE</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Bônus por objetivo</p>
                    <p className="text-lg font-semibold">50 FUSE</p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Total estimado</p>
                    <p className="text-lg font-semibold">290-530 FUSE</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Recompensas variam de acordo com o esforço relativo em cada treino. Valores máximos são para esforço acima de 80%.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Voltar</Button>
              <Button>Criar Plano de Treino</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Como Funcionam os Planos Personalizados?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Weight className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">1. Análise de Perfil</h3>
              <p className="text-sm text-muted-foreground">
                Nossa IA analisa seu perfil esportivo, histórico de atividades e objetivos.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">2. Geração de Plano</h3>
              <p className="text-sm text-muted-foreground">
                Criamos um plano progressivo e personalizado com treinos específicos para cada dia.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Running className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">3. Adaptação Contínua</h3>
              <p className="text-sm text-muted-foreground">
                O plano se adapta ao seu progresso, ajustando-se conforme seu desempenho melhora.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 