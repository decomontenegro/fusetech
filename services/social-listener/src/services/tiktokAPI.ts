import axios from 'axios';
import { FastifyInstance } from 'fastify';

export interface TiktokAPI {
  getUserVideos(accessToken: string, openId: string, cursor?: number, limit?: number): Promise<any[]>;
  refreshAccessToken(clientKey: string, clientSecret: string, refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    openId: string;
    expiresIn: number;
  }>;
}

// Factory para criar instância da API do TikTok
export function createTiktokAPI(server: FastifyInstance): TiktokAPI {
  return new TiktokAPIImpl(server);
}

// Implementação da API do TikTok
class TiktokAPIImpl implements TiktokAPI {
  private baseUrl = 'https://open-api.tiktok.com/v2';
  private logger: FastifyInstance['log'];

  constructor(server: FastifyInstance) {
    this.logger = server.log;
  }

  async getUserVideos(accessToken: string, openId: string, cursor = 0, limit = 10): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/video/list/`,
        {
          cursor,
          max_count: limit,
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          params: {
            open_id: openId,
            fields: 'id,desc,create_time,share_url,stats',
          },
        }
      );
      
      return response.data.data.videos;
    } catch (error) {
      this.logger.error({ error }, 'Erro ao buscar vídeos do TikTok');
      throw error;
    }
  }

  async refreshAccessToken(clientKey: string, clientSecret: string, refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    openId: string;
    expiresIn: number;
  }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/oauth/refresh_token/`,
        {
          client_key: clientKey,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }
      );
      
      return {
        accessToken: response.data.data.access_token,
        refreshToken: response.data.data.refresh_token,
        openId: response.data.data.open_id,
        expiresIn: response.data.data.expires_in,
      };
    } catch (error) {
      this.logger.error({ error }, 'Erro ao atualizar token do TikTok');
      throw error;
    }
  }
} 