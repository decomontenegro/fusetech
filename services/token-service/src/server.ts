import { FastifyInstance } from 'fastify';
import { ethers } from 'ethers';
import { TokenService } from './services/tokenService';

// Função para inicializar as rotas e o servidor
export async function startServer(server: FastifyInstance, tokenService: TokenService): Promise<void> {
  // Definir rotas da API
  server.get('/api/token/info', async (request, reply) => {
    try {
      const tokenInfo = await tokenService.getTokenInfo();
      return { data: tokenInfo };
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar informações do token');
      return reply.status(500).send({ 
        error: 'Erro ao buscar informações do token' 
      });
    }
  });
  
  server.get('/api/token/balance/:address', async (request, reply) => {
    const { address } = request.params as { address: string };
    
    if (!ethers.utils.isAddress(address)) {
      return reply.status(400).send({ 
        error: 'Endereço de carteira inválido' 
      });
    }
    
    try {
      const balance = await tokenService.getBalance(address);
      return { data: { address, balance } };
    } catch (error) {
      server.log.error({ error, address }, 'Erro ao buscar saldo');
      return reply.status(500).send({ 
        error: 'Erro ao buscar saldo da carteira' 
      });
    }
  });
  
  // Iniciar o servidor HTTP
  await server.listen({ 
    port: parseInt(process.env.PORT || '3003'), 
    host: '0.0.0.0' 
  });
  
  server.log.info(`Servidor iniciado na porta ${process.env.PORT || '3003'}`);
} 