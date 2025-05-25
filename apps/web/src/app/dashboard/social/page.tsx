'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SocialPlatform } from '@fuseapp/types';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button,
  Badge
} from '@fuseapp/ui';

// Dados simulados para demonstração
const mockConnectedAccounts = [
  {
    id: 'ig1',
    platform: SocialPlatform.INSTAGRAM,
    username: 'usuario_instagram',
    profileUrl: 'https://instagram.com/usuario_instagram',
    isVerified: true,
    connectedAt: '2023-07-15T10:30:00Z',
  },
];

export default function SocialConnections() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({});
  
  // Verificar se houve alguma conexão ou erro recente
  const justConnected = searchParams.get('connected');
  const connectionError = searchParams.get('error');
  
  // Função para iniciar conexão OAuth
  const startConnection = (platform: SocialPlatform) => {
    setIsLoading({ ...isLoading, [platform]: true });
    
    // Em produção, isso redirecionaria para as APIs OAuth reais
    // Este é apenas um exemplo simulado
    
    const userId = 'user123'; // Em produção, obter do contexto de autenticação
    
    setTimeout(() => {
      if (platform === SocialPlatform.INSTAGRAM) {
        // Exemplo de URL de autorização do Instagram
        window.location.href = `https://api.instagram.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/instagram/callback')}&scope=user_profile,user_media&response_type=code&state=${userId}`;
      } else if (platform === SocialPlatform.TIKTOK) {
        // Exemplo de URL de autorização do TikTok
        window.location.href = `https://www.tiktok.com/auth/authorize?client_key=${process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/tiktok/callback')}&scope=user.info.basic,video.list&response_type=code&state=${userId}`;
      }
      
      setIsLoading({ ...isLoading, [platform]: false });
    }, 500);
  };
  
  // Função para desconectar uma conta
  const disconnectAccount = (accountId: string) => {
    // Em produção, chamaria uma API para remover a conexão
    // Este é apenas um exemplo simulado
    
    alert(`Conta ${accountId} desconectada com sucesso!`);
  };
  
  // Verifica se uma plataforma já está conectada
  const isPlatformConnected = (platform: SocialPlatform) => {
    return mockConnectedAccounts.some(account => account.platform === platform);
  };
  
  // Função para renderizar o status de conexão
  const renderConnectionStatus = (platform: SocialPlatform) => {
    const isConnected = isPlatformConnected(platform);
    const account = mockConnectedAccounts.find(acc => acc.platform === platform);
    
    if (isConnected && account) {
      return (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="success">Conectado</Badge>
            <span className="text-sm font-medium">@{account.username}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Conectado em {new Date(account.connectedAt).toLocaleDateString('pt-BR')}
          </p>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 w-full"
            onClick={() => disconnectAccount(account.id)}
          >
            Desconectar
          </Button>
        </div>
      );
    }
    
    return (
      <Button
        onClick={() => startConnection(platform)}
        disabled={isLoading[platform]}
        className="w-full"
      >
        {isLoading[platform] ? 'Conectando...' : 'Conectar'}
      </Button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Conexões Sociais</h1>
        <p className="text-muted-foreground mt-2">
          Conecte suas redes sociais para ganhar tokens ao compartilhar conteúdo sobre sua jornada fitness.
        </p>
      </div>
      
      {/* Notificações */}
      {justConnected && (
        <div className="bg-green-500/10 border border-green-500 text-green-700 px-4 py-3 rounded-md">
          <p className="font-medium">Conectado com sucesso!</p>
          <p className="text-sm">Sua conta do {justConnected} foi conectada com sucesso.</p>
        </div>
      )}
      
      {connectionError && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <p className="font-medium">Erro ao conectar</p>
          <p className="text-sm">Ocorreu um erro ao conectar sua conta. Por favor, tente novamente.</p>
        </div>
      )}
      
      {/* Cards de conexão */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Instagram */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Instagram</CardTitle>
              <CardDescription>
                Compartilhe fotos e histórias das suas atividades físicas
              </CardDescription>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-muted-foreground"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Ganhe tokens ao:</p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Compartilhar fotos das suas corridas</li>
                  <li>Postar stories com hashtag #fuselabs</li>
                  <li>Marcar @fuselabsapp nas suas publicações</li>
                </ul>
              </div>
              
              <div className="pt-4">
                {renderConnectionStatus(SocialPlatform.INSTAGRAM)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* TikTok */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>TikTok</CardTitle>
              <CardDescription>
                Compartilhe vídeos da sua jornada fitness e ganhe tokens
              </CardDescription>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 448 512"
              fill="currentColor"
              className="h-6 w-6 text-muted-foreground"
            >
              <path d="M448 209.9a210.1 210.1 0 01-122.8-39.3v178.8a162.6 162.6 0 11-161-162.8v89.9a74.6 74.6 0 1074.7 73.3V0h88.2a121.2 121.2 0 10.1 39.4z" />
            </svg>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Ganhe tokens ao:</p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>Postar vídeos da sua rotina de exercícios</li>
                  <li>Compartilhar seus resultados com hashtag #fuselabs</li>
                  <li>Criar conteúdo mencionando @fuselabsapp</li>
                </ul>
              </div>
              
              <div className="pt-4">
                {renderConnectionStatus(SocialPlatform.TIKTOK)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Informações sobre ganhos */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Como ganhar tokens com redes sociais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">
              Ao conectar suas redes sociais com o FuseLabs App, você pode ganhar tokens FUSE compartilhando sua jornada fitness e atividades físicas. Aqui está como funciona:
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-md font-medium">1. Conecte suas contas</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte suas contas do Instagram e TikTok para começar a ganhar tokens.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-md font-medium">2. Compartilhe seu progresso</h3>
                <p className="text-sm text-muted-foreground">
                  Crie e poste conteúdo sobre suas atividades físicas usando as hashtags e menções necessárias.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-md font-medium">3. Receba tokens automaticamente</h3>
                <p className="text-sm text-muted-foreground">
                  Nosso sistema detecta suas publicações e atribui tokens automaticamente para sua carteira.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 