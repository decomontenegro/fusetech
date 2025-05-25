import axios from 'axios';
import { FastifyInstance } from 'fastify';

export interface InstagramAPI {
  getUserMedia(accessToken: string, limit?: number): Promise<any[]>;
  refreshAccessToken(accessToken: string): Promise<{ accessToken: string; expiresIn: number }>;
}

// Factory para criar instância da API do Instagram
export function createInstagramAPI(server: FastifyInstance): InstagramAPI {
  return new InstagramAPIImpl(server);
}

// Implementação da API do Instagram
class InstagramAPIImpl implements InstagramAPI {
  private baseUrl = 'https://graph.instagram.com/v12.0';
  private logger: FastifyInstance['log'];

  constructor(server: FastifyInstance) {
    this.logger = server.log;
  }

  async getUserMedia(accessToken: string, limit = 5): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp',
          access_token: accessToken,
          limit,
        },
      });
      
      return response.data.data;
    } catch (error) {
      this.logger.error({ error }, 'Erro ao buscar posts do Instagram');
      throw error;
    }
  }

  async refreshAccessToken(accessToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const response = await axios.get(`${this.baseUrl}/refresh_access_token`, {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
      });
      
      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      this.logger.error({ error }, 'Erro ao atualizar token do Instagram');
      throw error;
    }
  }
} 