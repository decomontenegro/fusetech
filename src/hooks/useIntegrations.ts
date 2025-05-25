'use client';

import { useQuery } from '@apollo/client';
import { toast } from 'sonner';
import {
  GET_STRAVA_CONNECTION,
  GET_SOCIAL_CONNECTIONS,
  GET_SOCIAL_CONNECTION
} from '../lib/graphql/queries/integration';

export function useIntegrations() {
  // Obter conexão com Strava
  const {
    data: stravaData,
    loading: stravaLoading,
    error: stravaError,
    refetch: refetchStrava
  } = useQuery(GET_STRAVA_CONNECTION, {
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter conexões com redes sociais
  const {
    data: socialData,
    loading: socialLoading,
    error: socialError,
    refetch: refetchSocial
  } = useQuery(GET_SOCIAL_CONNECTIONS, {
    skip: typeof window === 'undefined', // Não executar no servidor
    fetchPolicy: 'cache-and-network'
  });

  // Obter conexão com uma rede social específica
  const getSocialConnection = (platform: string) => {
    return useQuery(GET_SOCIAL_CONNECTION, {
      variables: { platform },
      skip: typeof window === 'undefined', // Não executar no servidor
      fetchPolicy: 'cache-and-network'
    });
  };

  // Conectar conta do Strava (via API REST)
  const connectStrava = async (code: string) => {
    try {
      const response = await fetch('/api/integrations/strava/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao conectar conta do Strava');
      }
      
      const data = await response.json();
      toast.success('Conta do Strava conectada com sucesso!');
      refetchStrava();
      return data.data;
    } catch (error) {
      console.error('Erro ao conectar conta do Strava:', error);
      toast.error('Erro ao conectar conta do Strava');
      return null;
    }
  };

  // Desconectar conta do Strava (via API REST)
  const disconnectStrava = async () => {
    try {
      const response = await fetch('/api/integrations/strava/disconnect', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erro ao desconectar conta do Strava');
      }
      
      const data = await response.json();
      toast.success('Conta do Strava desconectada com sucesso!');
      refetchStrava();
      return data.data;
    } catch (error) {
      console.error('Erro ao desconectar conta do Strava:', error);
      toast.error('Erro ao desconectar conta do Strava');
      return null;
    }
  };

  // Conectar conta de rede social (via API REST)
  const connectSocialAccount = async (platform: string, code: string) => {
    try {
      const response = await fetch(`/api/integrations/${platform}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao conectar conta do ${platform}`);
      }
      
      const data = await response.json();
      toast.success(`Conta do ${platform} conectada com sucesso!`);
      refetchSocial();
      return data.data;
    } catch (error) {
      console.error(`Erro ao conectar conta do ${platform}:`, error);
      toast.error(`Erro ao conectar conta do ${platform}`);
      return null;
    }
  };

  // Desconectar conta de rede social (via API REST)
  const disconnectSocialAccount = async (platform: string) => {
    try {
      const response = await fetch(`/api/integrations/${platform}/disconnect`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao desconectar conta do ${platform}`);
      }
      
      const data = await response.json();
      toast.success(`Conta do ${platform} desconectada com sucesso!`);
      refetchSocial();
      return data.data;
    } catch (error) {
      console.error(`Erro ao desconectar conta do ${platform}:`, error);
      toast.error(`Erro ao desconectar conta do ${platform}`);
      return null;
    }
  };

  // Obter URL de autorização para Strava
  const getStravaAuthUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = `${window.location.origin}/dashboard/integrations/strava/callback`;
    const scope = 'read,activity:read';
    
    return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}`;
  };

  // Obter URL de autorização para Instagram
  const getInstagramAuthUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = `${window.location.origin}/dashboard/integrations/instagram/callback`;
    const scope = 'user_profile,user_media';
    
    return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}`;
  };

  // Obter URL de autorização para TikTok
  const getTikTokAuthUrl = () => {
    const clientId = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/dashboard/integrations/tiktok/callback`;
    const scope = 'user.info.basic,video.list';
    
    return `https://open-api.tiktok.com/platform/oauth/connect?client_key=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}`;
  };

  return {
    // Dados
    stravaConnection: stravaData?.strava_connections[0] || null,
    socialConnections: socialData?.social_connections || [],
    
    // Estado
    loading: stravaLoading || socialLoading,
    error: stravaError || socialError,
    
    // Ações
    refetchStrava,
    refetchSocial,
    getSocialConnection,
    connectStrava,
    disconnectStrava,
    connectSocialAccount,
    disconnectSocialAccount,
    
    // URLs de autorização
    getStravaAuthUrl,
    getInstagramAuthUrl,
    getTikTokAuthUrl
  };
}
