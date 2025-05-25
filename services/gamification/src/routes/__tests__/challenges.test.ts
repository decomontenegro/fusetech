import { FastifyInstance } from 'fastify';
import { Redis } from 'ioredis';
import { setupChallengesRoutes } from '../challenges';

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

describe('Challenges Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupChallengesRoutes(mockServer, mockRedis);
  });

  it('should register GET /api/challenges route', () => {
    expect(mockServer.get).toHaveBeenCalledWith('/api/challenges', expect.any(Function));
  });

  it('should register GET /api/challenges/:id route', () => {
    expect(mockServer.get).toHaveBeenCalledWith('/api/challenges/:id', expect.any(Function));
  });

  it('should register POST /api/challenges route', () => {
    expect(mockServer.post).toHaveBeenCalledWith('/api/challenges', expect.any(Function));
  });

  it('should register PUT /api/challenges/:id route', () => {
    expect(mockServer.put).toHaveBeenCalledWith('/api/challenges/:id', expect.any(Function));
  });

  it('should register DELETE /api/challenges/:id route', () => {
    expect(mockServer.delete).toHaveBeenCalledWith('/api/challenges/:id', expect.any(Function));
  });
});
