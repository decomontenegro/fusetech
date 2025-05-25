import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { startAchievementProcessor } from '../achievementProcessor';

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

describe('Achievement Processor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the achievement processor', () => {
    startAchievementProcessor(mockServer, mockRedis);
    
    expect(mockServer.log.info).toHaveBeenCalledWith('Processador de conquistas iniciado');
  });

  it('should set up an interval to process achievements', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    
    startAchievementProcessor(mockServer, mockRedis);
    
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
  });

  it('should log errors when processing fails', () => {
    startAchievementProcessor(mockServer, mockRedis);
    
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
      'Erro ao processar conquistas'
    );
  });
});
