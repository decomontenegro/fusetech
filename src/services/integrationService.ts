import apiService from './api';

// Tipos
export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
}

export interface SocialAccount {
  id: string;
  userId: string;
  platform: SocialPlatform;
  username: string;
  profileUrl?: string;
  isVerified: boolean;
  connectedAt: string;
  metadata?: Record<string, any>;
}

export interface StravaAccount {
  id: string;
  userId: string;
  athleteId: string;
  username: string;
  profileUrl?: string;
  isVerified: boolean;
  connectedAt: string;
  metadata?: Record<string, any>;
}

// Serviço de integração
export class IntegrationService {
  // Conectar conta do Strava
  async connectStrava(code: string): Promise<{ connected: boolean; athleteId: string; username: string }> {
    return apiService.post<{ connected: boolean; athleteId: string; username: string }>(
      '/api/integrations/strava/connect',
      { code }
    );
  }

  // Desconectar conta do Strava
  async disconnectStrava(): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>('/api/integrations/strava/disconnect');
  }

  // Obter status da conexão com Strava
  async getStravaStatus(): Promise<{ connected: boolean; account?: StravaAccount }> {
    return apiService.get<{ connected: boolean; account?: StravaAccount }>('/api/integrations/strava/status');
  }

  // Conectar conta de rede social
  async connectSocialAccount(
    platform: SocialPlatform,
    code: string
  ): Promise<{ connected: boolean; userId: string; username: string }> {
    return apiService.post<{ connected: boolean; userId: string; username: string }>(
      `/api/integrations/${platform}/connect`,
      { code }
    );
  }

  // Desconectar conta de rede social
  async disconnectSocialAccount(platform: SocialPlatform): Promise<{ success: boolean }> {
    return apiService.post<{ success: boolean }>(`/api/integrations/${platform}/disconnect`);
  }

  // Obter status das conexões com redes sociais
  async getSocialAccountsStatus(): Promise<Record<SocialPlatform, { connected: boolean; account?: SocialAccount }>> {
    return apiService.get<Record<SocialPlatform, { connected: boolean; account?: SocialAccount }>>(
      '/api/integrations/social/status'
    );
  }

  // Obter URL de autorização para Strava
  getStravaAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = `${window.location.origin}/dashboard/integrations/strava/callback`;
    const scope = 'read,activity:read';
    
    return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}`;
  }

  // Obter URL de autorização para Instagram
  getInstagramAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID;
    const redirectUri = `${window.location.origin}/dashboard/integrations/instagram/callback`;
    const scope = 'user_profile,user_media';
    
    return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}`;
  }

  // Obter URL de autorização para TikTok
  getTikTokAuthUrl(): string {
    const clientId = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_ID;
    const redirectUri = `${window.location.origin}/dashboard/integrations/tiktok/callback`;
    const scope = 'user.info.basic,video.list';
    
    return `https://open-api.tiktok.com/platform/oauth/connect?client_key=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}`;
  }
}

// Instância única do serviço
export const integrationService = new IntegrationService();

export default integrationService;
