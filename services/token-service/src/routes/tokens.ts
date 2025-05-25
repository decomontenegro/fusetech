import { FastifyInstance } from 'fastify';
import { ethers } from 'ethers';
import { TokenService } from '../services/tokenService';
import { z } from '@fuseapp/validation';

// Esquema para validação de endereço de carteira
const addressSchema = z.string().refine(
  (address) => ethers.utils.isAddress(address),
  { message: 'Endereço de carteira inválido' }
);

// Esquema para validação de transação de token
const mintTokenSchema = z.object({
  userId: z.string().min(1),
  address: addressSchema,
  amount: z.number().positive(),
  reason: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

const burnTokenSchema = z.object({
  userId: z.string().min(1),
  address: addressSchema,
  amount: z.number().positive(),
  reason: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

// Configurar rotas para tokens
export function setupTokenRoutes(server: FastifyInstance, tokenService: TokenService) {
  // Obter informações do token
  server.get('/api/token/info', {
    schema: {
      tags: ['tokens'],
      summary: 'Obtém informações sobre o token FUSE',
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                symbol: { type: 'string' },
                decimals: { type: 'number' },
                totalSupply: { type: 'string' },
                contractAddress: { type: 'string' },
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
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
  
  // Obter saldo de uma carteira
  server.get('/api/token/balance/:address', {
    schema: {
      tags: ['tokens'],
      summary: 'Obtém o saldo de tokens FUSE de uma carteira',
      params: {
        type: 'object',
        required: ['address'],
        properties: {
          address: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                balance: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { address } = request.params as { address: string };
      
      // Validar endereço
      try {
        addressSchema.parse(address);
      } catch (error) {
        return reply.status(400).send({ 
          error: 'Endereço de carteira inválido' 
        });
      }
      
      const balance = await tokenService.getBalance(address);
      return { data: { address, balance } };
    } catch (error) {
      server.log.error({ error }, 'Erro ao buscar saldo');
      return reply.status(500).send({ 
        error: 'Erro ao buscar saldo da carteira' 
      });
    }
  });
  
  // Criar (mint) tokens para um usuário
  server.post('/api/token/mint', {
    schema: {
      tags: ['tokens'],
      summary: 'Cria (mint) tokens FUSE para um usuário',
      body: {
        type: 'object',
        required: ['userId', 'address', 'amount', 'reason'],
        properties: {
          userId: { type: 'string' },
          address: { type: 'string' },
          amount: { type: 'number' },
          reason: { type: 'string' },
          metadata: { 
            type: 'object',
            additionalProperties: true
          }
        }
      },
      response: {
        202: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                transactionId: { type: 'string' },
                status: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Validar dados de entrada
      const mintData = mintTokenSchema.parse(request.body);
      
      // Enviar transação para processamento
      const transactionId = await tokenService.queueMintTransaction(
        mintData.userId,
        mintData.address,
        mintData.amount,
        mintData.reason,
        mintData.metadata
      );
      
      return reply.status(202).send({ 
        data: { 
          transactionId,
          status: 'pending'
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Dados inválidos',
          details: error.errors
        });
      }
      
      server.log.error({ error }, 'Erro ao criar tokens');
      return reply.status(500).send({ 
        error: 'Erro ao criar tokens' 
      });
    }
  });
  
  // Queimar (burn) tokens de um usuário
  server.post('/api/token/burn', {
    schema: {
      tags: ['tokens'],
      summary: 'Queima (burn) tokens FUSE de um usuário',
      body: {
        type: 'object',
        required: ['userId', 'address', 'amount', 'reason'],
        properties: {
          userId: { type: 'string' },
          address: { type: 'string' },
          amount: { type: 'number' },
          reason: { type: 'string' },
          metadata: { 
            type: 'object',
            additionalProperties: true
          }
        }
      },
      response: {
        202: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                transactionId: { type: 'string' },
                status: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // Validar dados de entrada
      const burnData = burnTokenSchema.parse(request.body);
      
      // Enviar transação para processamento
      const transactionId = await tokenService.queueBurnTransaction(
        burnData.userId,
        burnData.address,
        burnData.amount,
        burnData.reason,
        burnData.metadata
      );
      
      return reply.status(202).send({ 
        data: { 
          transactionId,
          status: 'pending'
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Dados inválidos',
          details: error.errors
        });
      }
      
      server.log.error({ error }, 'Erro ao queimar tokens');
      return reply.status(500).send({ 
        error: 'Erro ao queimar tokens' 
      });
    }
  });
  
  // Verificar status de uma transação
  server.get('/api/token/transaction/:id', {
    schema: {
      tags: ['tokens'],
      summary: 'Verifica o status de uma transação de token',
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                status: { type: 'string' },
                txHash: { type: 'string', nullable: true },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string', nullable: true }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      // Buscar status da transação
      const transaction = await tokenService.getTransactionStatus(id);
      
      if (!transaction) {
        return reply.status(404).send({ 
          error: 'Transação não encontrada' 
        });
      }
      
      return { data: transaction };
    } catch (error) {
      server.log.error({ error }, 'Erro ao verificar status da transação');
      return reply.status(500).send({ 
        error: 'Erro ao verificar status da transação' 
      });
    }
  });
}
