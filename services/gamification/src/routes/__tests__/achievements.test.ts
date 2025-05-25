import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { setupAchievementsRoutes } from '../achievements';

// Mock do Redis
const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
} as unknown as Redis;

// Mock do Fastify
const mockServer = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  log: {
    error: jest.fn(),
    info: jest.fn(),
  },
} as unknown as FastifyInstance;

describe('Achievements Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupAchievementsRoutes(mockServer, mockRedis);
  });

  it('should register GET /api/achievements route', () => {
    expect(mockServer.get).toHaveBeenCalledWith('/api/achievements', expect.any(Function));
  });

  it('should register GET /api/achievements/:id route', () => {
    expect(mockServer.get).toHaveBeenCalledWith('/api/achievements/:id', expect.any(Function));
  });

  it('should register GET /api/users/:userId/achievements route', () => {
    expect(mockServer.get).toHaveBeenCalledWith('/api/users/:userId/achievements', expect.any(Function));
  });

  it('should register POST /api/achievements route', () => {
    expect(mockServer.post).toHaveBeenCalledWith('/api/achievements', expect.any(Function));
  });
});
