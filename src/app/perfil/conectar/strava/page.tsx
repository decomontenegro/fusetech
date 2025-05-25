'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button
} from '@fuseapp/ui';
import { useAuth } from '../../../../context/AuthContext';
import ProtectedRoute from '../../../../components/auth/ProtectedRoute';
import { AppShell } from '../../../../components/layout/AppShell';

export default function ConectarStravaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL de autorização do Strava
  const stravaAuthUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI || '')}&approval_prompt=force&scope=activity:read_all`;

  const handleConnect = () => {
    setIsLoading(true);
    // Redirecionar para a página de autorização do Strava
    window.location.href = stravaAuthUrl;
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="max-w-3xl mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Conectar com Strava</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Conecte sua conta do Strava</CardTitle>
              <CardDescription>
                Conecte sua conta do Strava para sincronizar suas atividades e ganhar tokens.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Como funciona?</h3>
                <p className="text-orange-700 text-sm">
                  Ao conectar sua conta do Strava, você nos autoriza a acessar suas atividades. 
                  Nós sincronizamos automaticamente suas corridas, caminhadas e pedaladas, 
                  convertendo-as em pontos que podem ser trocados por tokens FUSE.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Você receberá pontos por:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Corridas (10 pontos por km)</li>
                  <li>Caminhadas (5 pontos por km)</li>
                  <li>Pedaladas (3 pontos por km)</li>
                  <li>Outras atividades (2 pontos por km)</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Privacidade:</h3>
                <p className="text-sm text-muted-foreground">
                  Respeitamos sua privacidade. Só acessamos dados de atividades físicas, 
                  não publicamos nada em seu nome e você pode desconectar a qualquer momento.
                </p>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full bg-[#FC4C02] hover:bg-[#E34402] text-white"
              >
                {isLoading ? 'Conectando...' : 'Conectar com Strava'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
