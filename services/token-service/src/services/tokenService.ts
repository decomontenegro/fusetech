import { ethers } from 'ethers';
import { FastifyInstance } from 'fastify';
import Redis from 'ioredis';
import { erc20Abi } from '../constants/abi';

export class TokenService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;
  private minterWallet: string;
  private logger: FastifyInstance['log'];
  private redis?: Redis;

  constructor(logger: FastifyInstance['log'], redis?: Redis) {
    this.logger = logger;
    this.redis = redis;

    // Inicializar provider L2 Base
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.BASE_L2_URL || 'https://goerli.base.org'
    );

    // Inicializar carteira de operações (minter role)
    const privateKey = process.env.MINTER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('MINTER_PRIVATE_KEY não configurada');
    }

    // Verificar se a chave privada está no formato correto
    if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
      throw new Error('MINTER_PRIVATE_KEY em formato inválido. Deve ser uma chave hexadecimal de 32 bytes com prefixo 0x');
    }

    try {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.minterWallet = this.wallet.address;

      // Limpar a chave privada da memória após uso
      // Nota: Isso não garante que a chave seja removida completamente da memória
      // devido ao garbage collector do JavaScript, mas é uma boa prática
      setTimeout(() => {
        (process.env as any).MINTER_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000000';
      }, 1000);
    } catch (error: any) {
      throw new Error(`Erro ao inicializar carteira: ${error.message || 'Erro desconhecido'}`);
    }

    // Inicializar contrato do token
    if (!process.env.FUSE_TOKEN_ADDRESS) {
      throw new Error('FUSE_TOKEN_ADDRESS não configurado');
    }

    // Verificar se o endereço do contrato está definido
    if (!process.env.FUSE_TOKEN_ADDRESS) {
      throw new Error('FUSE_TOKEN_ADDRESS não definido no ambiente');
    }

    this.contract = new ethers.Contract(
      process.env.FUSE_TOKEN_ADDRESS,
      erc20Abi,
      this.wallet
    );

    // Inicializar multicall para transações em batch não é mais necessário
    // Removido devido à simplificação da arquitetura

    this.logger.info(
      { contractAddress: process.env.FUSE_TOKEN_ADDRESS, minter: this.minterWallet },
      'Serviço de token inicializado'
    );
  }

  // Método para obter o saldo de um endereço
  async getBalance(address: string): Promise<string> {
    try {
      // Verificar se temos o saldo em cache
      if (this.redis) {
        const cachedBalance = await this.redis.get(`token:balance:${address}`);
        if (cachedBalance) {
          return cachedBalance;
        }
      }

      // Buscar saldo do contrato
      const balance = await this.contract.balanceOf(address);
      const decimals = await this.contract.decimals();
      const formattedBalance = ethers.utils.formatUnits(balance, decimals);

      // Armazenar em cache por 5 minutos
      if (this.redis) {
        await this.redis.set(`token:balance:${address}`, formattedBalance, 'EX', 300);
      }

      return formattedBalance;
    } catch (error) {
      this.logger.error({ error, address }, 'Erro ao obter saldo');
      throw error;
    }
  }

  // Método para mintar tokens
  async mintTokens(toAddress: string, amount: number): Promise<ethers.providers.TransactionReceipt> {
    this.logger.info(
      { to: toAddress, amount, minter: this.minterWallet },
      'Mintando tokens'
    );

    try {
      // Validar endereço
      if (!ethers.utils.isAddress(toAddress)) {
        throw new Error('Endereço de carteira inválido');
      }

      // Validar quantidade
      if (amount <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      const decimals = await this.contract.decimals();
      const amountWithDecimals = ethers.utils.parseUnits(amount.toString(), decimals);

      // Executa a transação de mint
      const tx = await this.contract.mint(toAddress, amountWithDecimals);
      const receipt = await tx.wait();

      this.logger.info(
        {
          txHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          to: toAddress,
          amount
        },
        'Tokens mintados com sucesso'
      );

      // Invalidar cache de saldo
      if (this.redis) {
        await this.redis.del(`token:balance:${toAddress}`);
      }

      // Publicar evento de mint
      if (this.redis) {
        await this.redis.publish('token:events', JSON.stringify({
          type: 'mint',
          data: {
            address: toAddress,
            amount: amount.toString(),
            txHash: receipt.transactionHash,
          }
        }));
      }

      return receipt;
    } catch (error) {
      this.logger.error(
        { error, to: toAddress, amount },
        'Erro ao mintar tokens'
      );
      throw error;
    }
  }

  // Método para queimar tokens
  async burnTokens(fromAddress: string, amount: number): Promise<ethers.providers.TransactionReceipt> {
    this.logger.info(
      { from: fromAddress, amount, burner: this.minterWallet },
      'Queimando tokens'
    );

    try {
      // Validar endereço
      if (!ethers.utils.isAddress(fromAddress)) {
        throw new Error('Endereço de carteira inválido');
      }

      // Validar quantidade
      if (amount <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      // Verificar se o endereço tem saldo suficiente
      const balance = await this.contract.balanceOf(fromAddress);
      const decimals = await this.contract.decimals();
      const amountWithDecimals = ethers.utils.parseUnits(amount.toString(), decimals);

      if (balance.lt(amountWithDecimals)) {
        throw new Error('Saldo insuficiente para queimar tokens');
      }

      // Executa a transação de burn
      const tx = await this.contract.burn(fromAddress, amountWithDecimals);
      const receipt = await tx.wait();

      this.logger.info(
        {
          txHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          from: fromAddress,
          amount
        },
        'Tokens queimados com sucesso'
      );

      // Invalidar cache de saldo
      if (this.redis) {
        await this.redis.del(`token:balance:${fromAddress}`);
      }

      // Publicar evento de burn
      if (this.redis) {
        await this.redis.publish('token:events', JSON.stringify({
          type: 'burn',
          data: {
            address: fromAddress,
            amount: amount.toString(),
            txHash: receipt.transactionHash,
          }
        }));
      }

      return receipt;
    } catch (error) {
      this.logger.error(
        { error, from: fromAddress, amount },
        'Erro ao queimar tokens'
      );
      throw error;
    }
  }

  // Método para obter informações básicas do token
  async getTokenInfo(): Promise<{ name: string; symbol: string; decimals: number; totalSupply: string }> {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      this.contract.name(),
      this.contract.symbol(),
      this.contract.decimals(),
      this.contract.totalSupply(),
    ]);

    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
    };
  }
}

// Função factory para criar o serviço de token
export function createTokenService(server: FastifyInstance, redis?: Redis): TokenService {
  return new TokenService(server.log, redis);
}