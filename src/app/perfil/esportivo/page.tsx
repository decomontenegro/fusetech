import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import PerfilEsportivoForm from '@/components/perfil/PerfilEsportivoForm';

export const metadata = {
  title: 'Perfil Esportivo | FuseLabs',
  description: 'Configure seu perfil esportivo no FuseLabs App',
};

export default function PerfilEsportivoPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Perfil Esportivo</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowLeft size={16} />
          Voltar ao Perfil
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Perfil Esportivo</CardTitle>
            <CardDescription>
              Configure seu perfil esportivo para receber planos de treino personalizados e uma
              experiência de recompensas adaptada ao seu esforço individual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basico" className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="basico">Informações Básicas</TabsTrigger>
                <TabsTrigger value="metricas">Métricas de Saúde</TabsTrigger>
                <TabsTrigger value="objetivos">Objetivos</TabsTrigger>
                <TabsTrigger value="preferencias">Preferências</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basico" className="space-y-4">
                <PerfilEsportivoForm section="basico" />
                
                <div className="flex justify-end mt-6 gap-4">
                  <Button variant="outline">Cancelar</Button>
                  <Button className="gap-2" data-next-tab="metricas">
                    Próximo
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="metricas" className="space-y-4">
                <PerfilEsportivoForm section="metricas" />
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" className="gap-2" data-prev-tab="basico">
                    <ArrowLeft size={16} />
                    Anterior
                  </Button>
                  <div className="flex gap-4">
                    <Button variant="outline">Pular</Button>
                    <Button className="gap-2" data-next-tab="objetivos">
                      Próximo
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="objetivos" className="space-y-4">
                <PerfilEsportivoForm section="objetivos" />
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" className="gap-2" data-prev-tab="metricas">
                    <ArrowLeft size={16} />
                    Anterior
                  </Button>
                  <div className="flex gap-4">
                    <Button variant="outline">Pular</Button>
                    <Button className="gap-2" data-next-tab="preferencias">
                      Próximo
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preferencias" className="space-y-4">
                <PerfilEsportivoForm section="preferencias" />
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" className="gap-2" data-prev-tab="objetivos">
                    <ArrowLeft size={16} />
                    Anterior
                  </Button>
                  <Button variant="default" className="gap-2">
                    <Save size={16} />
                    Salvar Perfil
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Benefícios de um Perfil Completo</CardTitle>
            <CardDescription>
              Saiba como o seu perfil esportivo torna a experiência no FuseLabs mais personalizada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Planos Personalizados</h3>
                <p className="text-sm text-muted-foreground">
                  Receba planos de treino adaptados ao seu nível de condicionamento,
                  objetivos e preferências pessoais.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Recompensas Justas</h3>
                <p className="text-sm text-muted-foreground">
                  Ganhe tokens FUSE de acordo com seu esforço relativo, não apenas com métricas absolutas,
                  reconhecendo seu progresso pessoal.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Acompanhamento de Evolução</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize seu progresso ao longo do tempo, identificando padrões
                  e melhorias em suas atividades físicas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 