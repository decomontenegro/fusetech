import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { startChallengeProcessor } from '../challengeProcessor';

// Mock do Redis
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  lpop: jest.fn(),
  rpush: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn(),
  duplicate: jest.fn(() => mockRedis),
  on: jest.fn(),
} as unknown as Redis;

// Mock do Fastify
const mockServer = {
  log: {
    error: jest.fn(),
    info: jest.fn(),
  },
} as unknown as FastifyInstance;

// Mock do setInterval
jest.useFakeTimers();

describe('Challenge Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the challenge processor', () => {
    startChallengeProcessor(mockServer, mockRedis);
    
    expect(mockServer.log.info).toHaveBeenCalledWith('Processador de desafios iniciado');
  });

  it('should set up an interval to process challenges', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    
    startChallengeProcessor(mockServer, mockRedis);
    
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
  });

  it('should log errors when processing fails', () => {
    startChallengeProcessor(mockServer, mockRedis);
    
    // Simular um erro durante o processamento
    const error = new Error('Erro de processamento');
    jest.spyOn(global, 'setInterval').mockImplementationOnce((callback) => {
      (callback as Function)();
      return 1 as unknown as NodeJS.Timeout;
    });
    
    mockServer.log.info.mockImplementationOnce(() => {
      throw error;
    });
    
    jest.runOnlyPendingTimers();
    
    expect(mockServer.log.error).toHaveBeenCalledWith(
      { error },
      'Erro ao processar desafios'
    );
  });
});
