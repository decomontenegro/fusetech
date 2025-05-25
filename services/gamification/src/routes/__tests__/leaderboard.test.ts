import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { setupLeaderboardRoutes } from '../leaderboard';

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

describe('Leaderboard Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupLeaderboardRoutes(mockServer, mockRedis);
  });

  it('should register GET /api/leaderboard route', () => {
    expect(mockServer.get).toHaveBeenCalledWith('/api/leaderboard', expect.any(Function));
  });

  it('should register GET /api/leaderboard/users/:userId route', () => {
    expect(mockServer.get).toHaveBeenCalledWith('/api/leaderboard/users/:userId', expect.any(Function));
  });

  it('should register GET /api/leaderboard/:type route', () => {
    expect(mockServer.get).toHaveBeenCalledWith('/api/leaderboard/:type', expect.any(Function));
  });
});
