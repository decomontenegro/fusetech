'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
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
  Separator,
  Progress
} from '@fuseapp/ui';
import {
  User,
  Settings,
  Link as LinkIcon,
  Shield,
  Bell,
  Edit3,
  Save,
  Key,
  LogOut,
  Info,
  CheckCircle,
  XCircle,
  Award,
  Trophy,
  Zap,
  Activity,
  BarChart,
  Calendar,
  Clock,
  Flame
} from 'lucide-react';
import { notifyError, notifySuccess } from '../../lib/notifications';

export default function PerfilPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [userStats, setUserStats] = useState({
    totalActivities: 24,
    totalDistance: 187500, // em metros
    totalDuration: 54000, // em segundos
    totalPoints: 1250,
    level: 3,
    xp: 750,
    nextLevelXp: 1000,
    achievements: {
      total: 10,
      completed: 3
    },
    challenges: {
      total: 8,
      completed: 2,
      active: 3
    },
    streak: {
      current: 4,
      longest: 7
    },
    activities: {
      running: 65,
      cycling: 25,
      walking: 10
    },
    tokens: {
      earned: 450,
      spent: 150,
      balance: 300
    },
    friends: 12,
    ranking: 87 // posição no ranking geral
  });

  // Estados para o formulário de perfil
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  // Estados para conexões
  const [connectedAccounts, setConnectedAccounts] = useState({
    strava: false,
    instagram: false,
    tiktok: false,
    metamask: false
  });

  // Estados para configurações
  const [notificacoesEmail, setNotificacoesEmail] = useState(true);
  const [notificacoesPush, setNotificacoesPush] = useState(true);
  const [privacidadePublica, setPrivacidadePublica] = useState(true);

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      setLoadingUser(true);
      try {
        // Em uma implementação real, carregaríamos os dados da API
        // const response = await fetch('/api/user/profile');
        // const data = await response.json();

        // Simulação de carregamento
        await new Promise(resolve => setTimeout(resolve, 800));

        // Dados simulados
        setNome('Carlos Silva');
        setEmail('carlos.silva@exemplo.com');
        setUsername('carlossilva');
        setBio('Entusiasta de corrida e ciclismo. Pratico atividades físicas regularmente e compartilho minha jornada de bem-estar.');
        setAvatar('https://via.placeholder.com/150');

        // Contas conectadas simuladas
        setConnectedAccounts({
          strava: true,
          instagram: false,
          tiktok: false,
          metamask: true
        });

      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        notifyError('Não foi possível carregar seus dados. Tente novamente mais tarde.');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  // Salvar perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSavingProfile(true);

      // Validação básica
      if (!nome || !email) {
        notifyError('Nome e email são campos obrigatórios.');
        return;
      }

      // Simulação de salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      notifySuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      notifyError('Não foi possível salvar suas alterações. Tente novamente mais tarde.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Salvar configurações
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSavingSettings(true);

      // Simulação de salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));

      notifySuccess('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      notifyError('Não foi possível salvar suas configurações. Tente novamente mais tarde.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Conectar com serviço
  const handleConnect = (service: string) => {
    // Simulação de conexão
    notifySuccess(`Redirecionando para autenticação do ${service}...`);

    setTimeout(() => {
      setConnectedAccounts(prev => ({
        ...prev,
        [service]: true
      }));
      notifySuccess(`Conta ${service} conectada com sucesso!`);
    }, 2000);
  };

  // Desconectar serviço
  const handleDisconnect = (service: string) => {
    // Simulação de desconexão
    notifySuccess(`Desconectando ${service}...`);

    setTimeout(() => {
      setConnectedAccounts(prev => ({
        ...prev,
        [service]: false
      }));
      notifySuccess(`Conta ${service} desconectada com sucesso!`);
    }, 1500);
  };

  if (loadingUser) {
    return (
      <AppShell>
        <div className="h-full flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header>
          <h1 className="text-3xl font-bold">Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie seus dados pessoais e configurações
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="stats">
              <Activity className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="connections">
              <LinkIcon className="h-4 w-4 mr-2" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab de Perfil */}
          <TabsContent value="profile" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile}>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt="Avatar do usuário"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-full h-full p-6 text-muted-foreground" />
                          )}
                        </div>
                        <button
                          type="button"
                          className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full"
                          title="Alterar foto"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-semibold">{nome || 'Seu Nome'}</h3>
                        <p className="text-muted-foreground">
                          @{username || 'username'}
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                          <span className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            <Info className="h-3 w-3 mr-1" /> Nível {userStats.level}
                          </span>

                          <span className="inline-flex items-center text-xs bg-orange-500/10 text-orange-600 px-2 py-1 rounded-full">
                            <Flame className="h-3 w-3 mr-1" /> {userStats.streak.current} dias seguidos
                          </span>

                          {connectedAccounts.strava && (
                            <span className="inline-flex items-center text-xs bg-orange-500/10 text-orange-600 px-2 py-1 rounded-full">
                              Strava
                            </span>
                          )}

                          {connectedAccounts.metamask && (
                            <span className="inline-flex items-center text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">
                              Wallet
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Nome de Usuário *</label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded-md"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email *</label>
                      <input
                        type="email"
                        className="w-full p-2 border rounded-md"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Bio</label>
                      <textarea
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Conte um pouco sobre você e suas atividades físicas preferidas..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      disabled={savingProfile}
                    >
                      {savingProfile ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Integrações */}
          <TabsContent value="connections" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Integrações com Serviços Externos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Conecte sua conta com os serviços externos para facilitar o registro de atividades e tokenização.
                </p>

                {/* Strava */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center mr-4">
                      <span className="text-white font-bold">S</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Strava</h3>
                      <p className="text-xs text-muted-foreground">
                        Importe automaticamente suas atividades físicas
                      </p>
                    </div>
                  </div>

                  <div>
                    {connectedAccounts.strava ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" /> Conectado
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect('strava')}
                        >
                          Desconectar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleConnect('strava')}
                      >
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Instagram */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-gradient-to-r from-pink-500 to-purple-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Instagram</h3>
                      <p className="text-xs text-muted-foreground">
                        Conecte para registrar posts relacionados a saúde e fitness
                      </p>
                    </div>
                  </div>

                  <div>
                    {connectedAccounts.instagram ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" /> Conectado
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect('instagram')}
                        >
                          Desconectar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleConnect('instagram')}
                      >
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Metamask / Carteira */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center mr-4">
                      <Key className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Carteira Blockchain</h3>
                      <p className="text-xs text-muted-foreground">
                        Conecte sua carteira para gerenciar tokens na Base L2
                      </p>
                    </div>
                  </div>

                  <div>
                    {connectedAccounts.metamask ? (
                      <div className="flex items-center gap-3">
                        <span className="text-sm flex items-center text-green-500">
                          <CheckCircle className="h-4 w-4 mr-1" /> Conectado
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect('metamask')}
                        >
                          Desconectar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleConnect('metamask')}
                      >
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Estatísticas */}
          <TabsContent value="stats" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas e Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Nível e XP */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Nível {userStats.level}</h3>
                      <span className="text-sm text-muted-foreground">
                        {userStats.xp} / {userStats.nextLevelXp} XP
                      </span>
                    </div>
                    <Progress value={(userStats.xp / userStats.nextLevelXp) * 100} className="h-2" />
                  </div>

                  {/* Estatísticas gerais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{userStats.totalActivities}</p>
                      <p className="text-xs text-muted-foreground">Atividades</p>
                    </div>

                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <BarChart className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{userStats.totalDistance / 1000}</p>
                      <p className="text-xs text-muted-foreground">Quilômetros</p>
                    </div>

                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{Math.round(userStats.totalDuration / 3600)}</p>
                      <p className="text-xs text-muted-foreground">Horas</p>
                    </div>

                    <div className="bg-primary/10 rounded-lg p-4 text-center">
                      <Flame className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <p className="text-2xl font-bold">{userStats.totalPoints}</p>
                      <p className="text-xs text-muted-foreground">Pontos</p>
                    </div>
                  </div>

                  {/* Distribuição de atividades */}
                  <div>
                    <h3 className="font-medium mb-4">Distribuição de Atividades</h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="text-sm">Corrida</span>
                        </div>
                        <span className="text-sm font-medium">{userStats.activities.running}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-3">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${userStats.activities.running}%` }}></div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm">Ciclismo</span>
                        </div>
                        <span className="text-sm font-medium">{userStats.activities.cycling}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-3">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${userStats.activities.cycling}%` }}></div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Caminhada</span>
                        </div>
                        <span className="text-sm font-medium">{userStats.activities.walking}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${userStats.activities.walking}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Conquistas */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Conquistas</h3>
                      <Button variant="link" size="sm" className="h-auto p-0" asChild>
                        <a href="/conquistas">Ver todas</a>
                      </Button>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm">Progresso</span>
                      <span className="text-sm text-muted-foreground">
                        {userStats.achievements.completed} / {userStats.achievements.total}
                      </span>
                    </div>
                    <Progress
                      value={(userStats.achievements.completed / userStats.achievements.total) * 100}
                      className="h-2 mb-4"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 p-2 rounded-full">
                            <Trophy className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">Corredor Iniciante</p>
                            <p className="text-xs text-muted-foreground">Corra um total de 10km</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Award className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Desafiante</p>
                            <p className="text-xs text-muted-foreground">Complete seu primeiro desafio</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desafios */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Desafios</h3>
                      <Button variant="link" size="sm" className="h-auto p-0" asChild>
                        <a href="/desafios">Ver todos</a>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <p className="font-medium">Ativos</p>
                        <p className="text-2xl font-bold">{userStats.challenges.active}</p>
                      </div>

                      <div className="border rounded-lg p-4">
                        <p className="font-medium">Concluídos</p>
                        <p className="text-2xl font-bold">{userStats.challenges.completed}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tokens e Ranking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-4">Tokens FUSE</h3>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Ganhos</span>
                          <span className="font-medium text-green-500">+{userStats.tokens.earned}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm">Gastos</span>
                          <span className="font-medium text-red-500">-{userStats.tokens.spent}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-medium">Saldo</span>
                          <span className="font-bold text-lg">{userStats.tokens.balance}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-4">Ranking</h3>
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <p className="text-4xl font-bold text-primary">#{userStats.ranking}</p>
                        <p className="text-sm text-muted-foreground">Posição no ranking global</p>
                        <div className="mt-2">
                          <Button variant="link" size="sm" className="h-auto p-0">
                            Ver ranking completo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Configurações */}
          <TabsContent value="settings" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings}>
                  <div className="space-y-6">
                    {/* Notificações */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Notificações</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Notificações por email</p>
                            <p className="text-sm text-muted-foreground">
                              Receba atualizações sobre atividades, desafios e tokens
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={notificacoesEmail}
                              onChange={(e) => setNotificacoesEmail(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Notificações push</p>
                            <p className="text-sm text-muted-foreground">
                              Receba notificações em tempo real no seu dispositivo
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={notificacoesPush}
                              onChange={(e) => setNotificacoesPush(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Privacidade */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Privacidade</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Perfil público</p>
                            <p className="text-sm text-muted-foreground">
                              Tornar seu perfil e atividades visíveis para outros usuários
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={privacidadePublica}
                              onChange={(e) => setPrivacidadePublica(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Sessão e Segurança */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Sessão e Segurança</h3>
                      <div className="space-y-3">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Key className="h-4 w-4" />
                          <span>Alterar senha</span>
                        </Button>

                        <Button variant="destructive" size="sm" className="gap-1">
                          <LogOut className="h-4 w-4" />
                          <span>Sair de todos os dispositivos</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      type="submit"
                      disabled={savingSettings}
                    >
                      {savingSettings ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Configurações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}