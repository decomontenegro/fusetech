// api/league-repository.js
export class LeagueRepository {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async getLeagues() {
    return this.apiClient.get('/leagues');
  }

  async getLeagueById(id) {
    return this.apiClient.get(`/leagues/${id}`);
  }

  async joinLeague(leagueId) {
    return this.apiClient.post(`/leagues/${leagueId}/join`);
  }

  async leaveLeague(leagueId) {
    return this.apiClient.post(`/leagues/${leagueId}/leave`);
  }

  async getLeaderboard(leagueId) {
    return this.apiClient.get(`/leagues/${leagueId}/leaderboard`);
  }

  async createCompetition(competitionData) {
    return this.apiClient.post('/competitions', competitionData);
  }

  // Outros métodos necessários
}

// Implementações específicas para web e mobile
// web/api-client.js
// mobile/api-client.js

// state/league-store.js
export class LeagueStore {
  constructor() {
    this.state = { ... };
    this.subscribers = [];
  }

  subscribe(callback) { ... }
  updateState(newState) { ... }
  // etc.
}

// auth/token-manager.js
export class TokenManager {
  constructor(storage) {
    this.storage = storage;
  }

  async getToken() { ... }
  async refreshToken() { ... }
  async revokeToken() { ... }
  isTokenValid() { ... }
}

// platform/platform-service.js
export class PlatformService {
  constructor(config) {
    this.platform = this.detectPlatform();
    this.version = config.version;
  }

  detectPlatform() { ... }
  checkForUpdates() { ... }
  syncData() { ... }
}

// api/api-client.js
export class ApiClient {
  constructor(baseUrl, tokenManager) {
    this.baseUrl = baseUrl;
    this.tokenManager = tokenManager;
  }

  async get(endpoint, params = {}) {
    return this._request('GET', endpoint, params);
  }

  async post(endpoint, data = {}) {
    return this._request('POST', endpoint, data);
  }

  async _request(method, endpoint, data) {
    const token = await this.tokenManager.getToken();
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (method !== 'GET') {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      
      if (!response.ok) {
        // Tratar erros específicos (401, 403, etc.)
        if (response.status === 401) {
          await this.tokenManager.refreshToken();
          return this._request(method, endpoint, data);
        }
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
}

// services/strava-worker/src/middleware/security.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
  };
};

// services/strava-service.js
export class StravaService {
  constructor(apiClient, activityRepository) {
    this.apiClient = apiClient;
    this.activityRepository = activityRepository;
  }

  async connectAccount(userId, stravaCode) {
    // Trocar código por token de acesso
    const tokenData = await this.apiClient.post('/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: stravaCode,
      grant_type: 'authorization_code'
    });
    
    // Salvar tokens no banco de dados
    await this.saveTokens(userId, tokenData);
    
    return { success: true };
  }

  async syncActivities(userId) {
    // Obter token do usuário
    const tokens = await this.getUserTokens(userId);
    
    // Verificar se token expirou e renovar se necessário
    if (tokens.expiresAt < Date.now() / 1000) {
      await this.refreshToken(userId, tokens.refreshToken);
      tokens = await this.getUserTokens(userId);
    }
    
    // Buscar atividades recentes
    const activities = await this.apiClient.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { 'Authorization': `Bearer ${tokens.accessToken}` }
    });
    
    // Processar e salvar atividades
    for (const activity of activities) {
      await this.processActivity(userId, activity);
    }
    
    return { success: true, count: activities.length };
  }

  async processActivity(userId, stravaActivity) {
    // Converter atividade do Strava para formato interno
    const activity = {
      userId,
      externalId: stravaActivity.id,
      source: 'strava',
      type: this.mapActivityType(stravaActivity.type),
      startDate: new Date(stravaActivity.start_date),
      duration: stravaActivity.moving_time,
      distance: stravaActivity.distance,
      elevationGain: stravaActivity.total_elevation_gain,
      calories: stravaActivity.calories || this.estimateCalories(stravaActivity),
      // Outros campos relevantes
    };
    
    // Salvar ou atualizar atividade
    await this.activityRepository.saveActivity(activity);
    
    // Atualizar progresso em ligas e competições
    await this.updateLeagueProgress(userId, activity);
  }

  // Outros métodos auxiliares
}

// models/League.js
const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, required: true, enum: ['distance', 'elevation', 'duration', 'calories', 'frequency', 'streak'] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'active', enum: ['active', 'upcoming', 'completed'] },
  activityTypes: [{ type: String }],
  members: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('League', LeagueSchema);

// controllers/leagueController.js
const League = require('../models/League');
const User = require('../models/User');

exports.getLeagues = async (req, res) => {
  try {
    const leagues = await League.find({ status: 'active' });
    res.json(leagues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.joinLeague = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const userId = req.user.id;
    
    const league = await League.findById(leagueId);
    
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    
    // Verificar se o usuário já está na liga
    const isMember = league.members.some(member => member.userId.toString() === userId);
    
    if (isMember) {
      return res.status(400).json({ error: 'User already in league' });
    }
    
    // Adicionar usuário à liga
    league.members.push({ userId, score: 0 });
    await league.save();
    
    res.json({ success: true, league });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Outros métodos do controlador

// routes/leagueRoutes.js
const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const { authenticate } = require('../middleware/security');

router.get('/', authenticate, leagueController.getLeagues);
router.get('/:id', authenticate, leagueController.getLeagueById);
router.post('/:id/join', authenticate, leagueController.joinLeague);
router.post('/:id/leave', authenticate, leagueController.leaveLeague);
router.get('/:id/leaderboard', authenticate, leagueController.getLeaderboard);
router.post('/', authenticate, leagueController.createLeague);

module.exports = router;

// state/store.js
export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Criar instância global
export const store = new Store({
  user: null,
  leagues: [],
  competitions: [],
  activities: [],
  loading: false,
  error: null
});

// Exemplo de uso em um componente
import { store } from '../state/store';
import { LeagueRepository } from '../api/league-repository';
import { ApiClient } from '../api/api-client';
import { TokenManager } from '../auth/token-manager';

const tokenManager = new TokenManager();
const apiClient = new ApiClient('/api', tokenManager);
const leagueRepository = new LeagueRepository(apiClient);

async function loadLeagues() {
  try {
    store.setState({ loading: true, error: null });
    const leagues = await leagueRepository.getLeagues();
    store.setState({ leagues, loading: false });
  } catch (error) {
    store.setState({ error: error.message, loading: false });
  }
}

// auth/auth-service.js
export class AuthService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async login(email, password) {
    const response = await this.apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', response.token);
    return response.user;
  }

  async register(userData) {
    return this.apiClient.post('/auth/register', userData);
  }

  async logout() {
    localStorage.removeItem('token');
  }

  async getCurrentUser() {
    return this.apiClient.get('/auth/me');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

// services/websocket-service.js
export class WebSocketService {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.listeners = {};
  }

  connect() {
    this.socket = new WebSocket(this.url);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type, payload } = data;
      
      if (this.listeners[type]) {
        this.listeners[type].forEach(callback => callback(payload));
      }
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Reconectar após um tempo
      setTimeout(() => this.connect(), 5000);
    };
  }

  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  off(type, callback) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
    }
  }

  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    }
  }
}

// tests/league-repository.test.js
import { LeagueRepository } from '../api/league-repository';

describe('LeagueRepository', () => {
  let repository;
  let mockApiClient;
  
  beforeEach(() => {
    mockApiClient = {
      get: jest.fn(),
      post: jest.fn()
    };
    
    repository = new LeagueRepository(mockApiClient);
  });
  
  test('getLeagues should call the correct endpoint', async () => {
    mockApiClient.get.mockResolvedValue([{ id: '1', name: 'Test League' }]);
    
    const result = await repository.getLeagues();
    
    expect(mockApiClient.get).toHaveBeenCalledWith('/leagues');
    expect(result).toEqual([{ id: '1', name: 'Test League' }]);
  });
  
  // Mais testes
});

// services/cache-service.js
export class CacheService {
  constructor(ttl = 3600000) { // 1 hora por padrão
    this.cache = {};
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache[key] = {
      value,
      timestamp: Date.now()
    };
    
    // Também salvar no localStorage para persistência
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        value,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  get(key) {
    // Verificar memória primeiro
    const item = this.cache[key];
    
    if (item && Date.now() - item.timestamp < this.ttl) {
      return item.value;
    }
    
    // Verificar localStorage
    try {
      const storedItem = localStorage.getItem(`cache_${key}`);
      
      if (storedItem) {
        const parsed = JSON.parse(storedItem);
        
        if (Date.now() - parsed.timestamp < this.ttl) {
          // Atualizar cache em memória
          this.cache[key] = parsed;
          return parsed.value;
        }
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
    }
    
    return null;
  }

  invalidate(key) {
    delete this.cache[key];
    localStorage.removeItem(`cache_${key}`);
  }

  clear() {
    this.cache = {};
    
    // Limpar apenas itens de cache no localStorage
    Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .forEach(key => localStorage.removeItem(key));
  }
}
