'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { ActivityType, ActivityStatus } from '@fuseapp/types';
import { 
  Card, 
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator
} from '@fuseapp/ui';
import { 
  ArrowLeft, 
  Activity,
  Upload,
  Camera,
  Check,
  Dumbbell,
  Github,
  Instagram,
  Save,
  Timer
} from 'lucide-react';
import { actividadesApi } from '../../../lib/api';
import { notifyError, notifySuccess } from '../../../lib/notifications';

export default function RegistrarAtividadePage() {
  const router = useRouter();
  const [tipoAtividade, setTipoAtividade] = useState<ActivityType>(ActivityType.RUN);
  const [distancia, setDistancia] = useState('');
  const [duracao, setDuracao] = useState('');
  const [calorias, setCalorias] = useState('');
  const [dataAtividade, setDataAtividade] = useState(new Date().toISOString().split('T')[0]);
  const [descricao, setDescricao] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  
  // Handler para submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setEnviando(true);
      
      // Validação básica
      if (!distancia || !duracao || !dataAtividade) {
        notifyError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      
      // Converter valores
      const distanciaMetros = parseFloat(distancia) * 1000; // Converter para metros
      const [horas, minutos, segundos] = duracao.split(':').map(Number);
      const duracaoSegundos = (horas || 0) * 3600 + (minutos || 0) * 60 + (segundos || 0);
      
      // Em uma implementação real, usaríamos o upload da foto e envio para API
      // const formData = new FormData();
      // if (foto) formData.append('foto', foto);
      // formData.append('atividade', JSON.stringify({
      //   tipo: tipoAtividade,
      //   distancia: distanciaMetros,
      //   duracao: duracaoSegundos,
      //   data: dataAtividade,
      //   descricao,
      //   calorias: calorias ? parseInt(calorias) : undefined
      // }));
      
      // Simulação de envio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notifySuccess('Atividade registrada com sucesso!');
      
      // Redirecionar de volta para a lista de atividades
      router.push('/atividades');
    } catch (err) {
      console.error('Erro ao registrar atividade:', err);
      notifyError('Não foi possível registrar a atividade. Tente novamente mais tarde.');
    } finally {
      setEnviando(false);
    }
  };
  
  // Handler para upload de imagem
  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Conectar com o Strava
  const handleConectarStrava = () => {
    // Em uma implementação real, redirecionaríamos para a página de autenticação do Strava
    // window.location.href = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=activity:read_all`;
    
    // Simulação
    notifySuccess('Redirecionando para autenticação do Strava...');
    setTimeout(() => {
      notifySuccess('Conta Strava conectada com sucesso!');
    }, 2000);
  };
  
  // Conectar com o Instagram
  const handleConectarInstagram = () => {
    // Em uma implementação real, redirecionaríamos para a página de autenticação do Instagram
    // window.location.href = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`;
    
    // Simulação
    notifySuccess('Redirecionando para autenticação do Instagram...');
    setTimeout(() => {
      notifySuccess('Conta Instagram conectada com sucesso!');
    }, 2000);
  };
  
  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <div 
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          onClick={() => router.push('/atividades')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span>Voltar para Atividades</span>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold">Registrar Atividade</h1>
          <p className="text-muted-foreground">
            Registre suas atividades físicas ou conecte suas contas
          </p>
        </div>
        
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="manual">Registro Manual</TabsTrigger>
            <TabsTrigger value="strava">Strava</TabsTrigger>
            <TabsTrigger value="social">Redes Sociais</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Atividade Física</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo de Atividade</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className={`p-3 border rounded-md flex flex-col items-center ${
                            tipoAtividade === ActivityType.RUN ? 'border-primary bg-primary/10' : 'hover:bg-accent'
                          }`}
                          onClick={() => setTipoAtividade(ActivityType.RUN)}
                        >
                          <span className="text-2xl mb-1">🏃</span>
                          <span className="text-sm">Corrida</span>
                        </button>
                        
                        <button
                          type="button"
                          className={`p-3 border rounded-md flex flex-col items-center ${
                            tipoAtividade === ActivityType.WALK ? 'border-primary bg-primary/10' : 'hover:bg-accent'
                          }`}
                          onClick={() => setTipoAtividade(ActivityType.WALK)}
                        >
                          <span className="text-2xl mb-1">🚶</span>
                          <span className="text-sm">Caminhada</span>
                        </button>
                        
                        <button
                          type="button"
                          className={`p-3 border rounded-md flex flex-col items-center ${
                            tipoAtividade === ActivityType.CYCLE ? 'border-primary bg-primary/10' : 'hover:bg-accent'
                          }`}
                          onClick={() => setTipoAtividade(ActivityType.CYCLE)}
                        >
                          <span className="text-2xl mb-1">🚴</span>
                          <span className="text-sm">Ciclismo</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Distância (km) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full p-2 border rounded-md"
                          value={distancia}
                          onChange={(e) => setDistancia(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Duração (hh:mm:ss) *</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md"
                          placeholder="00:30:00"
                          value={duracao}
                          onChange={(e) => setDuracao(e.target.value)}
                          pattern="[0-9]{1,2}:[0-9]{2}(:[0-9]{2})?"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Data *</label>
                        <input
                          type="date"
                          className="w-full p-2 border rounded-md"
                          value={dataAtividade}
                          onChange={(e) => setDataAtividade(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Calorias (opcional)</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full p-2 border rounded-md"
                          value={calorias}
                          onChange={(e) => setCalorias(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Comprovante (opcional)</label>
                      <div className="border-2 border-dashed rounded-md p-4 text-center">
                        {fotoPreview ? (
                          <div className="relative">
                            <img 
                              src={fotoPreview} 
                              alt="Preview" 
                              className="mx-auto max-h-48 rounded-md"
                            />
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                              onClick={() => {
                                setFoto(null);
                                setFotoPreview(null);
                              }}
                            >
                              <span className="sr-only">Remover</span>
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="py-4">
                            <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Clique para fazer upload de uma imagem de comprovação
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('foto-upload')?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Selecionar Imagem
                            </Button>
                            <input
                              id="foto-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImagemChange}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={enviando}
                    >
                      {enviando ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Registrando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Registrar Atividade
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="strava" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Conectar com Strava</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">S</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Sincronize suas atividades com o Strava</h3>
                  <p className="text-muted-foreground mb-4">
                    Conecte sua conta do Strava para importar suas atividades automaticamente.
                    Suas corridas, caminhadas e pedaladas serão sincronizadas e tokenizadas.
                  </p>
                  
                  <Button onClick={handleConectarStrava}>
                    Conectar com Strava
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Benefícios</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Sincronização automática de atividades</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Verificação simplificada</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Tokenização mais rápida</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span>Estatísticas detalhadas</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Conectar Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="py-6">
                      <div className="text-center">
                        <Instagram className="h-10 w-10 text-pink-500 mx-auto mb-2" />
                        <h3 className="text-lg font-medium mb-1">Instagram</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Conecte sua conta do Instagram para registrar posts relacionados a saúde e fitness.
                        </p>
                        <Button 
                          onClick={handleConectarInstagram}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                        >
                          Conectar Instagram
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="py-6">
                      <div className="text-center">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="40" 
                          height="40" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className="mx-auto mb-2 text-blue-500"
                        >
                          <path d="M9 12A4 4 0 1 0 9 4 4 4 0 0 0 9 12z"></path>
                          <path d="M15 12A4 4 0 1 0 15 4 4 4 0 0 0 15 12z"></path>
                          <path d="M9 20A4 4 0 1 0 9 12 4 4 0 0 0 9 20z"></path>
                          <path d="M15 20A4 4 0 1 0 15 12 4 4 0 0 0 15 20z"></path>
                        </svg>
                        <h3 className="text-lg font-medium mb-1">TikTok</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Conecte sua conta do TikTok para registrar vídeos relacionados a saúde e fitness.
                        </p>
                        <Button variant="outline">
                          Em breve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Como Funciona</h3>
                  <p className="text-muted-foreground mb-4">
                    Ao conectar suas redes sociais, você poderá:
                  </p>
                  <ol className="space-y-2 list-decimal pl-5">
                    <li>Publicar conteúdo relacionado a saúde e fitness nas suas redes sociais</li>
                    <li>Utilizar as hashtags #FuseApp e #HealthyLifestyle</li>
                    <li>Nosso sistema detectará automaticamente esses posts</li>
                    <li>Tokens serão atribuídos com base no engajamento recebido</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
} 