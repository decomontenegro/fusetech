/**
 * Testes para o Repositório de Ligas
 * 
 * Este arquivo contém testes unitários para o LeagueRepository,
 * verificando se todas as operações funcionam corretamente.
 */

import { LeagueRepository } from '../js/api/league-repository';

// Mock do ApiClient
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

describe('LeagueRepository', () => {
  let repository;
  
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Criar instância do repositório com o cliente mock
    repository = new LeagueRepository(mockApiClient);
  });
  
  describe('getLeagues', () => {
    it('should call the correct endpoint', async () => {
      // Configurar mock para retornar dados
      const mockLeagues = [{ id: '1', name: 'Test League' }];
      mockApiClient.get.mockResolvedValue(mockLeagues);
      
      // Chamar método
      const result = await repository.getLeagues();
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues', {});
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLeagues);
    });
    
    it('should pass query parameters', async () => {
      // Configurar mock para retornar dados
      const mockLeagues = [{ id: '1', name: 'Test League' }];
      mockApiClient.get.mockResolvedValue(mockLeagues);
      
      // Parâmetros de consulta
      const params = { status: 'active', type: 'distance' };
      
      // Chamar método com parâmetros
      const result = await repository.getLeagues(params);
      
      // Verificar se o endpoint correto foi chamado com os parâmetros
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues', params);
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLeagues);
    });
  });
  
  describe('getUserLeagues', () => {
    it('should call the correct endpoint', async () => {
      // Configurar mock para retornar dados
      const mockLeagues = [{ id: '1', name: 'User League' }];
      mockApiClient.get.mockResolvedValue(mockLeagues);
      
      // Chamar método
      const result = await repository.getUserLeagues();
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues/user');
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLeagues);
    });
  });
  
  describe('getLeagueById', () => {
    it('should call the correct endpoint with the league ID', async () => {
      // Configurar mock para retornar dados
      const mockLeague = { id: '123', name: 'Test League' };
      mockApiClient.get.mockResolvedValue(mockLeague);
      
      // Chamar método
      const result = await repository.getLeagueById('123');
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues/123');
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLeague);
    });
    
    it('should throw an error if league ID is not provided', async () => {
      // Chamar método sem ID
      await expect(repository.getLeagueById()).rejects.toThrow();
    });
  });
  
  describe('joinLeague', () => {
    it('should call the correct endpoint with the league ID', async () => {
      // Configurar mock para retornar dados
      const mockResult = { success: true };
      mockApiClient.post.mockResolvedValue(mockResult);
      
      // Chamar método
      const result = await repository.joinLeague('123');
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.post).toHaveBeenCalledWith('/leagues/123/join');
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockResult);
    });
  });
  
  describe('leaveLeague', () => {
    it('should call the correct endpoint with the league ID', async () => {
      // Configurar mock para retornar dados
      const mockResult = { success: true };
      mockApiClient.post.mockResolvedValue(mockResult);
      
      // Chamar método
      const result = await repository.leaveLeague('123');
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.post).toHaveBeenCalledWith('/leagues/123/leave');
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockResult);
    });
  });
  
  describe('getLeaderboard', () => {
    it('should call the correct endpoint with the league ID', async () => {
      // Configurar mock para retornar dados
      const mockLeaderboard = [
        { rank: 1, name: 'User 1', score: 100 },
        { rank: 2, name: 'User 2', score: 90 }
      ];
      mockApiClient.get.mockResolvedValue(mockLeaderboard);
      
      // Chamar método
      const result = await repository.getLeaderboard('123');
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues/123/leaderboard');
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLeaderboard);
    });
  });
  
  describe('createLeague', () => {
    it('should call the correct endpoint with the league data', async () => {
      // Dados da liga
      const leagueData = {
        name: 'New League',
        description: 'Test league',
        type: 'distance',
        startDate: '2023-01-01',
        endDate: '2023-12-31'
      };
      
      // Configurar mock para retornar dados
      const mockResult = { id: '123', ...leagueData };
      mockApiClient.post.mockResolvedValue(mockResult);
      
      // Chamar método
      const result = await repository.createLeague(leagueData);
      
      // Verificar se o endpoint correto foi chamado com os dados
      expect(mockApiClient.post).toHaveBeenCalledWith('/leagues', leagueData);
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockResult);
    });
  });
  
  describe('getCompetitions', () => {
    it('should call the correct endpoint', async () => {
      // Configurar mock para retornar dados
      const mockCompetitions = [{ id: '1', name: 'Test Competition' }];
      mockApiClient.get.mockResolvedValue(mockCompetitions);
      
      // Chamar método
      const result = await repository.getCompetitions();
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.get).toHaveBeenCalledWith('/competitions', {});
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockCompetitions);
    });
  });
  
  describe('getUserCompetitions', () => {
    it('should call the correct endpoint', async () => {
      // Configurar mock para retornar dados
      const mockCompetitions = [{ id: '1', name: 'User Competition' }];
      mockApiClient.get.mockResolvedValue(mockCompetitions);
      
      // Chamar método
      const result = await repository.getUserCompetitions();
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.get).toHaveBeenCalledWith('/competitions/user');
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockCompetitions);
    });
  });
  
  describe('joinCompetition', () => {
    it('should call the correct endpoint with the competition ID', async () => {
      // Configurar mock para retornar dados
      const mockResult = { success: true };
      mockApiClient.post.mockResolvedValue(mockResult);
      
      // Chamar método
      const result = await repository.joinCompetition('123');
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.post).toHaveBeenCalledWith('/competitions/123/join');
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockResult);
    });
  });
  
  describe('leaveCompetition', () => {
    it('should call the correct endpoint with the competition ID', async () => {
      // Configurar mock para retornar dados
      const mockResult = { success: true };
      mockApiClient.post.mockResolvedValue(mockResult);
      
      // Chamar método
      const result = await repository.leaveCompetition('123');
      
      // Verificar se o endpoint correto foi chamado
      expect(mockApiClient.post).toHaveBeenCalledWith('/competitions/123/leave');
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockResult);
    });
  });
  
  describe('createCompetition', () => {
    it('should call the correct endpoint with the competition data', async () => {
      // Dados da competição
      const competitionData = {
        name: 'New Competition',
        description: 'Test competition',
        type: 'individual',
        leagueType: 'distance',
        duration: 'weekly'
      };
      
      // Configurar mock para retornar dados
      const mockResult = { id: '123', ...competitionData };
      mockApiClient.post.mockResolvedValue(mockResult);
      
      // Chamar método
      const result = await repository.createCompetition(competitionData);
      
      // Verificar se o endpoint correto foi chamado com os dados
      expect(mockApiClient.post).toHaveBeenCalledWith('/competitions', competitionData);
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockResult);
    });
  });
  
  describe('getRecommendedLeagues', () => {
    it('should call the correct endpoint with the limit parameter', async () => {
      // Configurar mock para retornar dados
      const mockLeagues = [{ id: '1', name: 'Recommended League' }];
      mockApiClient.get.mockResolvedValue(mockLeagues);
      
      // Chamar método com limite
      const result = await repository.getRecommendedLeagues(5);
      
      // Verificar se o endpoint correto foi chamado com o limite
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues/recommended', { limit: 5 });
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLeagues);
    });
    
    it('should use default limit if not provided', async () => {
      // Configurar mock para retornar dados
      const mockLeagues = [{ id: '1', name: 'Recommended League' }];
      mockApiClient.get.mockResolvedValue(mockLeagues);
      
      // Chamar método sem limite
      const result = await repository.getRecommendedLeagues();
      
      // Verificar se o endpoint correto foi chamado com o limite padrão
      expect(mockApiClient.get).toHaveBeenCalledWith('/leagues/recommended', { limit: 3 });
      
      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLeagues);
    });
  });
});
