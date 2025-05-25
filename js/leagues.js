/**
 * Sistema de Ligas e Competições
 *
 * Este módulo gerencia o sistema de ligas, competições e desafios
 * para gamificação da plataforma FUSEtech.
 */

class LeagueSystem {
  constructor() {
    // Estado do sistema
    this.state = {
      initialized: false,
      currentUser: null,
      userLeagues: [],
      availableLeagues: [],
      userCompetitions: [],
      availableCompetitions: [],
      leaderboards: {},
      achievements: [],
      userPoints: 0,
      userLevel: 1,
      userRank: null,
      notifications: []
    };

    // Configurações
    this.config = {
      pointsMultiplier: 1.0,
      levelThresholds: [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7500, 10000],
      leagueRefreshInterval: 24 * 60 * 60 * 1000, // 24 horas
      notificationsEnabled: true,
      autoJoinRecommended: false,
      showLeaderboards: true
    };

    // Definições de tipos de ligas
    this.leagueTypes = {
      DISTANCE: {
        id: 'distance',
        name: 'Distância',
        icon: 'fa-route',
        color: 'blue',
        description: 'Competição baseada na distância total percorrida',
        metricName: 'Distância',
        metricUnit: 'km',
        activityTypes: ['running', 'cycling', 'walking', 'swimming', 'hiking']
      },
      ELEVATION: {
        id: 'elevation',
        name: 'Elevação',
        icon: 'fa-mountain',
        color: 'green',
        description: 'Competição baseada no ganho de elevação acumulado',
        metricName: 'Elevação',
        metricUnit: 'm',
        activityTypes: ['running', 'cycling', 'hiking']
      },
      DURATION: {
        id: 'duration',
        name: 'Duração',
        icon: 'fa-clock',
        color: 'purple',
        description: 'Competição baseada no tempo total de atividade',
        metricName: 'Tempo',
        metricUnit: 'min',
        activityTypes: ['running', 'cycling', 'walking', 'swimming', 'hiking', 'workout']
      },
      CALORIES: {
        id: 'calories',
        name: 'Calorias',
        icon: 'fa-fire',
        color: 'red',
        description: 'Competição baseada nas calorias queimadas',
        metricName: 'Calorias',
        metricUnit: 'kcal',
        activityTypes: ['running', 'cycling', 'walking', 'swimming', 'hiking', 'workout']
      },
      FREQUENCY: {
        id: 'frequency',
        name: 'Frequência',
        icon: 'fa-calendar-check',
        color: 'orange',
        description: 'Competição baseada no número de atividades realizadas',
        metricName: 'Atividades',
        metricUnit: '',
        activityTypes: ['running', 'cycling', 'walking', 'swimming', 'hiking', 'workout']
      },
      STREAK: {
        id: 'streak',
        name: 'Sequência',
        icon: 'fa-fire-alt',
        color: 'yellow',
        description: 'Competição baseada na sequência de dias com atividades',
        metricName: 'Dias',
        metricUnit: '',
        activityTypes: ['running', 'cycling', 'walking', 'swimming', 'hiking', 'workout']
      }
    };

    // Definições de tipos de competições
    this.competitionTypes = {
      INDIVIDUAL: {
        id: 'individual',
        name: 'Individual',
        description: 'Competição entre indivíduos'
      },
      TEAM: {
        id: 'team',
        name: 'Equipe',
        description: 'Competição entre equipes'
      },
      CHALLENGE: {
        id: 'challenge',
        name: 'Desafio',
        description: 'Desafio com objetivo específico'
      }
    };

    // Definições de duração de competições
    this.competitionDurations = {
      DAILY: {
        id: 'daily',
        name: 'Diário',
        description: 'Competição com duração de um dia',
        durationMs: 24 * 60 * 60 * 1000
      },
      WEEKLY: {
        id: 'weekly',
        name: 'Semanal',
        description: 'Competição com duração de uma semana',
        durationMs: 7 * 24 * 60 * 60 * 1000
      },
      MONTHLY: {
        id: 'monthly',
        name: 'Mensal',
        description: 'Competição com duração de um mês',
        durationMs: 30 * 24 * 60 * 60 * 1000
      },
      QUARTERLY: {
        id: 'quarterly',
        name: 'Trimestral',
        description: 'Competição com duração de três meses',
        durationMs: 90 * 24 * 60 * 60 * 1000
      },
      YEARLY: {
        id: 'yearly',
        name: 'Anual',
        description: 'Competição com duração de um ano',
        durationMs: 365 * 24 * 60 * 60 * 1000
      },
      CUSTOM: {
        id: 'custom',
        name: 'Personalizado',
        description: 'Competição com duração personalizada'
      }
    };

    // Vincular métodos
    this.init = this.init.bind(this);
    this.loadUserData = this.loadUserData.bind(this);
    this.loadLeagues = this.loadLeagues.bind(this);
    this.loadCompetitions = this.loadCompetitions.bind(this);
    this.joinLeague = this.joinLeague.bind(this);
    this.leaveLeague = this.leaveLeague.bind(this);
    this.joinCompetition = this.joinCompetition.bind(this);
    this.leaveCompetition = this.leaveCompetition.bind(this);
    this.getLeaderboard = this.getLeaderboard.bind(this);
    this.getUserRank = this.getUserRank.bind(this);
    this.calculatePoints = this.calculatePoints.bind(this);
    this.updateUserLevel = this.updateUserLevel.bind(this);
    this.getRecommendedLeagues = this.getRecommendedLeagues.bind(this);
    this.getRecommendedCompetitions = this.getRecommendedCompetitions.bind(this);
    this.createCompetition = this.createCompetition.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
  }

  /**
   * Inicializar o sistema de ligas
   * @param {Object} options - Opções de inicialização
   * @returns {Promise<Boolean>} - Verdadeiro se inicializado com sucesso
   */
  async init(options = {}) {
    try {
      console.log('Inicializando sistema de ligas e competições...');

      // Mesclar opções com configurações padrão
      this.config = { ...this.config, ...options };

      // Carregar dados do usuário
      await this.loadUserData();

      // Carregar ligas
      await this.loadLeagues();

      // Carregar competições
      await this.loadCompetitions();

      // Configurar atualização periódica
      setInterval(() => {
        this.loadLeagues();
        this.loadCompetitions();
      }, this.config.leagueRefreshInterval);

      this.state.initialized = true;
      console.log('Sistema de ligas e competições inicializado com sucesso');

      // Disparar evento de inicialização
      this.dispatchEvent('initialized', { success: true });

      return true;
    } catch (error) {
      console.error('Erro ao inicializar sistema de ligas:', error);
      return false;
    }
  }

  /**
   * Carregar dados do usuário
   * @returns {Promise<Object>} - Dados do usuário
   */
  async loadUserData() {
    try {
      // Em um ambiente real, buscaríamos os dados da API
      // Aqui, estamos simulando com dados fictícios

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Dados simulados do usuário
      const userData = {
        id: 'user123',
        name: 'João Silva',
        email: 'joao.silva@exemplo.com',
        points: 1250,
        level: 3,
        achievements: [
          {
            id: 'achievement1',
            name: 'Maratonista',
            description: 'Completou uma corrida de mais de 42km',
            earnedAt: '2023-05-15T10:30:00Z',
            icon: 'fa-medal',
            color: 'gold'
          },
          {
            id: 'achievement2',
            name: 'Madrugador',
            description: 'Completou 10 atividades antes das 7h',
            earnedAt: '2023-06-02T06:15:00Z',
            icon: 'fa-sun',
            color: 'orange'
          },
          {
            id: 'achievement3',
            name: 'Explorador',
            description: 'Visitou 5 parques diferentes',
            earnedAt: '2023-07-10T16:45:00Z',
            icon: 'fa-tree',
            color: 'green'
          }
        ],
        stats: {
          totalDistance: 523.7,
          totalDuration: 4320,
          totalCalories: 32150,
          totalActivities: 78,
          longestStreak: 14,
          currentStreak: 3
        }
      };

      // Atualizar estado
      this.state.currentUser = userData;
      this.state.userPoints = userData.points;
      this.state.userLevel = userData.level;
      this.state.achievements = userData.achievements;

      return userData;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      throw error;
    }
  }

  /**
   * Carregar ligas disponíveis e do usuário
   * @returns {Promise<Object>} - Ligas carregadas
   */
  async loadLeagues() {
    try {
      // Em um ambiente real, buscaríamos os dados da API
      // Aqui, estamos simulando com dados fictícios

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 700));

      // Ligas do usuário simuladas
      const userLeagues = [
        {
          id: 'league1',
          name: 'Liga dos Corredores',
          type: this.leagueTypes.DISTANCE.id,
          members: 128,
          userRank: 42,
          userScore: 78.5,
          leaderScore: 215.3,
          startDate: '2023-07-01T00:00:00Z',
          endDate: '2023-07-31T23:59:59Z',
          status: 'active',
          activityTypes: ['running'],
          description: 'Liga para corredores de todos os níveis'
        },
        {
          id: 'league2',
          name: 'Desafio de Elevação',
          type: this.leagueTypes.ELEVATION.id,
          members: 64,
          userRank: 12,
          userScore: 1250,
          leaderScore: 3450,
          startDate: '2023-07-01T00:00:00Z',
          endDate: '2023-07-31T23:59:59Z',
          status: 'active',
          activityTypes: ['running', 'hiking', 'cycling'],
          description: 'Acumule metros de elevação em suas atividades'
        }
      ];

      // Ligas disponíveis simuladas
      const availableLeagues = [
        {
          id: 'league3',
          name: 'Desafio de Calorias',
          type: this.leagueTypes.CALORIES.id,
          members: 95,
          startDate: '2023-07-01T00:00:00Z',
          endDate: '2023-07-31T23:59:59Z',
          status: 'active',
          activityTypes: ['running', 'cycling', 'walking', 'workout'],
          description: 'Queime o máximo de calorias possível'
        },
        {
          id: 'league4',
          name: 'Liga dos Ciclistas',
          type: this.leagueTypes.DISTANCE.id,
          members: 156,
          startDate: '2023-07-01T00:00:00Z',
          endDate: '2023-07-31T23:59:59Z',
          status: 'active',
          activityTypes: ['cycling'],
          description: 'Liga exclusiva para ciclistas'
        },
        {
          id: 'league5',
          name: 'Desafio de Consistência',
          type: this.leagueTypes.STREAK.id,
          members: 210,
          startDate: '2023-07-01T00:00:00Z',
          endDate: '2023-09-30T23:59:59Z',
          status: 'active',
          activityTypes: ['running', 'cycling', 'walking', 'workout'],
          description: 'Mantenha a consistência nos seus treinos'
        }
      ];

      // Atualizar estado
      this.state.userLeagues = userLeagues;
      this.state.availableLeagues = availableLeagues;

      // Disparar evento
      this.dispatchEvent('leaguesLoaded', {
        userLeagues,
        availableLeagues
      });

      return {
        userLeagues,
        availableLeagues
      };
    } catch (error) {
      console.error('Erro ao carregar ligas:', error);
      throw error;
    }
  }

  /**
   * Carregar competições disponíveis e do usuário
   * @returns {Promise<Object>} - Competições carregadas
   */
  async loadCompetitions() {
    try {
      // Em um ambiente real, buscaríamos os dados da API
      // Aqui, estamos simulando com dados fictícios

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 600));

      // Competições do usuário simuladas
      const userCompetitions = [
        {
          id: 'comp1',
          name: 'Desafio 10K',
          type: this.competitionTypes.CHALLENGE.id,
          leagueType: this.leagueTypes.DISTANCE.id,
          duration: this.competitionDurations.WEEKLY.id,
          members: 256,
          userRank: 78,
          userScore: 8.5,
          leaderScore: 10.0,
          startDate: '2023-07-10T00:00:00Z',
          endDate: '2023-07-16T23:59:59Z',
          status: 'active',
          activityTypes: ['running'],
          description: 'Complete 10km de corrida em uma semana',
          goal: 10.0,
          progress: 8.5,
          reward: {
            points: 100,
            badge: 'Corredor 10K'
          }
        }
      ];

      // Competições disponíveis simuladas
      const availableCompetitions = [
        {
          id: 'comp2',
          name: 'Desafio 100K de Ciclismo',
          type: this.competitionTypes.CHALLENGE.id,
          leagueType: this.leagueTypes.DISTANCE.id,
          duration: this.competitionDurations.WEEKLY.id,
          members: 128,
          startDate: '2023-07-10T00:00:00Z',
          endDate: '2023-07-16T23:59:59Z',
          status: 'active',
          activityTypes: ['cycling'],
          description: 'Complete 100km de ciclismo em uma semana',
          goal: 100.0,
          reward: {
            points: 200,
            badge: 'Ciclista 100K'
          }
        },
        {
          id: 'comp3',
          name: 'Torneio de Corrida',
          type: this.competitionTypes.INDIVIDUAL.id,
          leagueType: this.leagueTypes.DISTANCE.id,
          duration: this.competitionDurations.WEEKLY.id,
          members: 64,
          startDate: '2023-07-17T00:00:00Z',
          endDate: '2023-07-23T23:59:59Z',
          status: 'upcoming',
          activityTypes: ['running'],
          description: 'Competição de corrida individual',
          reward: {
            points: 300,
            badge: 'Campeão de Corrida'
          }
        },
        {
          id: 'comp4',
          name: 'Copa das Equipes',
          type: this.competitionTypes.TEAM.id,
          leagueType: this.leagueTypes.DISTANCE.id,
          duration: this.competitionDurations.MONTHLY.id,
          members: 320,
          startDate: '2023-08-01T00:00:00Z',
          endDate: '2023-08-31T23:59:59Z',
          status: 'upcoming',
          activityTypes: ['running', 'cycling', 'walking'],
          description: 'Competição entre equipes',
          reward: {
            points: 500,
            badge: 'Equipe Campeã'
          }
        }
      ];

      // Atualizar estado
      this.state.userCompetitions = userCompetitions;
      this.state.availableCompetitions = availableCompetitions;

      // Disparar evento
      this.dispatchEvent('competitionsLoaded', {
        userCompetitions,
        availableCompetitions
      });

      return {
        userCompetitions,
        availableCompetitions
      };
    } catch (error) {
      console.error('Erro ao carregar competições:', error);
      throw error;
    }
  }

  /**
   * Entrar em uma liga
   * @param {String} leagueId - ID da liga
   * @returns {Promise<Object>} - Resultado da operação
   */
  async joinLeague(leagueId) {
    try {
      // Verificar se a liga existe
      const league = this.state.availableLeagues.find(l => l.id === leagueId);

      if (!league) {
        throw new Error(`Liga não encontrada: ${leagueId}`);
      }

      // Em um ambiente real, enviaríamos uma requisição para a API
      // Aqui, estamos simulando uma operação bem-sucedida

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Adicionar liga à lista do usuário
      const userLeague = {
        ...league,
        userRank: league.members + 1,
        userScore: 0,
        leaderScore: 0
      };

      // Atualizar estado
      this.state.userLeagues.push(userLeague);
      this.state.availableLeagues = this.state.availableLeagues.filter(l => l.id !== leagueId);

      // Disparar evento
      this.dispatchEvent('leagueJoined', { league: userLeague });

      // Adicionar notificação
      this.addNotification({
        type: 'league_joined',
        title: 'Nova Liga',
        message: `Você entrou na liga "${league.name}"`,
        timestamp: new Date().toISOString(),
        data: { leagueId }
      });

      return { success: true, league: userLeague };
    } catch (error) {
      console.error(`Erro ao entrar na liga ${leagueId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sair de uma liga
   * @param {String} leagueId - ID da liga
   * @returns {Promise<Object>} - Resultado da operação
   */
  async leaveLeague(leagueId) {
    try {
      // Verificar se o usuário está na liga
      const league = this.state.userLeagues.find(l => l.id === leagueId);

      if (!league) {
        throw new Error(`Usuário não está na liga: ${leagueId}`);
      }

      // Em um ambiente real, enviaríamos uma requisição para a API
      // Aqui, estamos simulando uma operação bem-sucedida

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remover liga da lista do usuário
      this.state.userLeagues = this.state.userLeagues.filter(l => l.id !== leagueId);

      // Adicionar liga à lista de disponíveis
      const availableLeague = {
        ...league
      };

      delete availableLeague.userRank;
      delete availableLeague.userScore;

      this.state.availableLeagues.push(availableLeague);

      // Disparar evento
      this.dispatchEvent('leagueLeft', { leagueId });

      // Adicionar notificação
      this.addNotification({
        type: 'league_left',
        title: 'Liga Abandonada',
        message: `Você saiu da liga "${league.name}"`,
        timestamp: new Date().toISOString(),
        data: { leagueId }
      });

      return { success: true };
    } catch (error) {
      console.error(`Erro ao sair da liga ${leagueId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Entrar em uma competição
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Object>} - Resultado da operação
   */
  async joinCompetition(competitionId) {
    try {
      // Verificar se a competição existe
      const competition = this.state.availableCompetitions.find(c => c.id === competitionId);

      if (!competition) {
        throw new Error(`Competição não encontrada: ${competitionId}`);
      }

      // Em um ambiente real, enviaríamos uma requisição para a API
      // Aqui, estamos simulando uma operação bem-sucedida

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Adicionar competição à lista do usuário
      const userCompetition = {
        ...competition,
        userRank: competition.members + 1,
        userScore: 0,
        leaderScore: 0,
        progress: 0
      };

      // Atualizar estado
      this.state.userCompetitions.push(userCompetition);
      this.state.availableCompetitions = this.state.availableCompetitions.filter(c => c.id !== competitionId);

      // Disparar evento
      this.dispatchEvent('competitionJoined', { competition: userCompetition });

      // Adicionar notificação
      this.addNotification({
        type: 'competition_joined',
        title: 'Nova Competição',
        message: `Você entrou na competição "${competition.name}"`,
        timestamp: new Date().toISOString(),
        data: { competitionId }
      });

      return { success: true, competition: userCompetition };
    } catch (error) {
      console.error(`Erro ao entrar na competição ${competitionId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sair de uma competição
   * @param {String} competitionId - ID da competição
   * @returns {Promise<Object>} - Resultado da operação
   */
  async leaveCompetition(competitionId) {
    try {
      // Verificar se o usuário está na competição
      const competition = this.state.userCompetitions.find(c => c.id === competitionId);

      if (!competition) {
        throw new Error(`Usuário não está na competição: ${competitionId}`);
      }

      // Em um ambiente real, enviaríamos uma requisição para a API
      // Aqui, estamos simulando uma operação bem-sucedida

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remover competição da lista do usuário
      this.state.userCompetitions = this.state.userCompetitions.filter(c => c.id !== competitionId);

      // Adicionar competição à lista de disponíveis
      const availableCompetition = {
        ...competition
      };

      delete availableCompetition.userRank;
      delete availableCompetition.userScore;
      delete availableCompetition.progress;

      this.state.availableCompetitions.push(availableCompetition);

      // Disparar evento
      this.dispatchEvent('competitionLeft', { competitionId });

      // Adicionar notificação
      this.addNotification({
        type: 'competition_left',
        title: 'Competição Abandonada',
        message: `Você saiu da competição "${competition.name}"`,
        timestamp: new Date().toISOString(),
        data: { competitionId }
      });

      return { success: true };
    } catch (error) {
      console.error(`Erro ao sair da competição ${competitionId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter leaderboard de uma liga ou competição
   * @param {String} id - ID da liga ou competição
   * @param {String} type - Tipo ('league' ou 'competition')
   * @returns {Promise<Array>} - Leaderboard
   */
  async getLeaderboard(id, type = 'league') {
    try {
      // Verificar se a liga ou competição existe
      const item = type === 'league'
        ? [...this.state.userLeagues, ...this.state.availableLeagues].find(l => l.id === id)
        : [...this.state.userCompetitions, ...this.state.availableCompetitions].find(c => c.id === id);

      if (!item) {
        throw new Error(`${type === 'league' ? 'Liga' : 'Competição'} não encontrada: ${id}`);
      }

      // Verificar se o leaderboard já está em cache
      if (this.state.leaderboards[id]) {
        return this.state.leaderboards[id];
      }

      // Em um ambiente real, buscaríamos os dados da API
      // Aqui, estamos simulando com dados fictícios

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      // Gerar leaderboard simulado
      const leaderboard = [];
      const totalEntries = Math.min(item.members, 100);

      for (let i = 0; i < totalEntries; i++) {
        const isCurrentUser = i === (item.userRank ? item.userRank - 1 : -1);

        leaderboard.push({
          rank: i + 1,
          userId: isCurrentUser ? this.state.currentUser.id : `user${i}`,
          name: isCurrentUser ? this.state.currentUser.name : `Usuário ${i + 1}`,
          score: isCurrentUser ? item.userScore : (item.leaderScore || 0) * (1 - i / totalEntries) * (0.9 + Math.random() * 0.2),
          isCurrentUser
        });
      }

      // Ordenar por pontuação
      leaderboard.sort((a, b) => b.score - a.score);

      // Atualizar ranks
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      // Armazenar em cache
      this.state.leaderboards[id] = leaderboard;

      return leaderboard;
    } catch (error) {
      console.error(`Erro ao obter leaderboard para ${type} ${id}:`, error);
      return [];
    }
  }

  /**
   * Obter rank do usuário em uma liga ou competição
   * @param {String} id - ID da liga ou competição
   * @param {String} type - Tipo ('league' ou 'competition')
   * @returns {Promise<Object>} - Informações de rank
   */
  async getUserRank(id, type = 'league') {
    try {
      // Verificar se a liga ou competição existe
      const item = type === 'league'
        ? this.state.userLeagues.find(l => l.id === id)
        : this.state.userCompetitions.find(c => c.id === id);

      if (!item) {
        throw new Error(`Usuário não está na ${type === 'league' ? 'liga' : 'competição'}: ${id}`);
      }

      // Em um ambiente real, buscaríamos os dados da API
      // Aqui, estamos retornando os dados já disponíveis

      return {
        rank: item.userRank,
        score: item.userScore,
        total: item.members,
        percentile: Math.round((1 - item.userRank / item.members) * 100)
      };
    } catch (error) {
      console.error(`Erro ao obter rank do usuário para ${type} ${id}:`, error);
      return null;
    }
  }

  /**
   * Calcular pontos para uma atividade
   * @param {Object} activity - Atividade
   * @returns {Number} - Pontos calculados
   */
  calculatePoints(activity) {
    try {
      if (!activity) return 0;

      // Pontos base por tipo de atividade
      const basePoints = {
        running: 10,
        cycling: 8,
        walking: 5,
        swimming: 12,
        hiking: 15,
        workout: 7
      };

      // Obter pontos base
      const base = basePoints[activity.type] || 5;

      // Calcular pontos com base na distância, duração e calorias
      let points = 0;

      if (activity.distance) {
        // Pontos por km
        points += activity.distance * base * 0.2;
      }

      if (activity.duration) {
        // Pontos por minuto (com limite para evitar atividades muito longas)
        const durationMinutes = Math.min(activity.duration / 60, 180);
        points += durationMinutes * base * 0.1;
      }

      if (activity.calories) {
        // Pontos por 100 calorias
        points += (activity.calories / 100) * base * 0.5;
      }

      if (activity.elevationGain) {
        // Pontos por 100m de elevação
        points += (activity.elevationGain / 100) * base * 2;
      }

      // Aplicar multiplicador de configuração
      points *= this.config.pointsMultiplier;

      // Arredondar para o inteiro mais próximo
      return Math.round(points);
    } catch (error) {
      console.error('Erro ao calcular pontos:', error);
      return 0;
    }
  }

  /**
   * Atualizar nível do usuário com base nos pontos
   * @returns {Object} - Informações de nível
   */
  updateUserLevel() {
    try {
      const { userPoints, userLevel } = this.state;
      const { levelThresholds } = this.config;

      // Encontrar o nível correto com base nos pontos
      let newLevel = 1;

      for (let i = 1; i < levelThresholds.length; i++) {
        if (userPoints >= levelThresholds[i]) {
          newLevel = i + 1;
        } else {
          break;
        }
      }

      // Verificar se o nível mudou
      if (newLevel !== userLevel) {
        const oldLevel = userLevel;
        this.state.userLevel = newLevel;

        // Disparar evento
        this.dispatchEvent('levelChanged', {
          oldLevel,
          newLevel,
          points: userPoints
        });

        // Adicionar notificação se o nível aumentou
        if (newLevel > oldLevel) {
          this.addNotification({
            type: 'level_up',
            title: 'Nível Aumentado!',
            message: `Você subiu para o nível ${newLevel}!`,
            timestamp: new Date().toISOString(),
            data: { level: newLevel }
          });
        }
      }

      // Calcular progresso para o próximo nível
      const currentThreshold = levelThresholds[newLevel - 1] || 0;
      const nextThreshold = levelThresholds[newLevel] || currentThreshold * 2;
      const pointsForNextLevel = nextThreshold - currentThreshold;
      const pointsEarned = userPoints - currentThreshold;
      const progress = Math.min(100, Math.round((pointsEarned / pointsForNextLevel) * 100));

      return {
        level: newLevel,
        points: userPoints,
        pointsForNextLevel,
        pointsEarned,
        progress,
        nextLevel: newLevel + 1
      };
    } catch (error) {
      console.error('Erro ao atualizar nível do usuário:', error);
      return {
        level: this.state.userLevel,
        points: this.state.userPoints,
        progress: 0
      };
    }
  }

  /**
   * Obter ligas recomendadas para o usuário
   * @param {Number} limit - Limite de resultados
   * @returns {Array} - Ligas recomendadas
   */
  getRecommendedLeagues(limit = 3) {
    try {
      // Em um ambiente real, usaríamos um algoritmo de recomendação
      // Aqui, estamos simplesmente retornando as primeiras ligas disponíveis

      return this.state.availableLeagues.slice(0, limit);
    } catch (error) {
      console.error('Erro ao obter ligas recomendadas:', error);
      return [];
    }
  }

  /**
   * Obter competições recomendadas para o usuário
   * @param {Number} limit - Limite de resultados
   * @returns {Array} - Competições recomendadas
   */
  getRecommendedCompetitions(limit = 3) {
    try {
      // Em um ambiente real, usaríamos um algoritmo de recomendação
      // Aqui, estamos simplesmente retornando as primeiras competições disponíveis

      return this.state.availableCompetitions.slice(0, limit);
    } catch (error) {
      console.error('Erro ao obter competições recomendadas:', error);
      return [];
    }
  }

  /**
   * Criar uma competição personalizada
   * @param {Object} competitionData - Dados da competição
   * @returns {Promise<Object>} - Resultado da operação
   */
  async createCompetition(competitionData) {
    try {
      // Validar dados
      if (!competitionData.name) {
        throw new Error('Nome da competição é obrigatório');
      }

      if (!competitionData.type) {
        throw new Error('Tipo da competição é obrigatório');
      }

      if (!competitionData.leagueType) {
        throw new Error('Tipo de liga é obrigatório');
      }

      if (!competitionData.duration) {
        throw new Error('Duração da competição é obrigatória');
      }

      if (!competitionData.activityTypes || competitionData.activityTypes.length === 0) {
        throw new Error('Tipos de atividade são obrigatórios');
      }

      // Em um ambiente real, enviaríamos uma requisição para a API
      // Aqui, estamos simulando uma operação bem-sucedida

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Gerar ID único
      const competitionId = `comp${Date.now()}`;

      // Criar competição
      const competition = {
        id: competitionId,
        ...competitionData,
        members: 1,
        userRank: 1,
        userScore: 0,
        leaderScore: 0,
        startDate: competitionData.startDate || new Date().toISOString(),
        status: 'active',
        progress: 0
      };

      // Adicionar à lista do usuário
      this.state.userCompetitions.push(competition);

      // Disparar evento
      this.dispatchEvent('competitionCreated', { competition });

      // Adicionar notificação
      this.addNotification({
        type: 'competition_created',
        title: 'Competição Criada',
        message: `Você criou a competição "${competition.name}"`,
        timestamp: new Date().toISOString(),
        data: { competitionId }
      });

      return { success: true, competition };
    } catch (error) {
      console.error('Erro ao criar competição:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Adicionar notificação
   * @param {Object} notification - Dados da notificação
   */
  addNotification(notification) {
    // Verificar se as notificações estão habilitadas
    if (!this.config.notificationsEnabled) return;

    // Adicionar à lista de notificações
    this.state.notifications.push(notification);

    // Limitar a 50 notificações
    if (this.state.notifications.length > 50) {
      this.state.notifications.shift();
    }

    // Disparar evento
    this.dispatchEvent('notification', { notification });

    // Disparar evento global
    const event = new CustomEvent('leagueNotification', {
      detail: notification
    });

    document.dispatchEvent(event);
  }

  /**
   * Disparar evento
   * @param {String} eventName - Nome do evento
   * @param {Object} data - Dados do evento
   */
  dispatchEvent(eventName, data) {
    // Disparar evento global
    const event = new CustomEvent(`league:${eventName}`, {
      detail: data
    });

    document.dispatchEvent(event);
  }

  /**
   * Atualizar configurações
   * @param {Object} newConfig - Novas configurações
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    // Disparar evento
    this.dispatchEvent('configUpdated', { config: this.config });
  }
}

// Criar instância global
window.leagueSystem = new LeagueSystem();

// Exportar classe
export default LeagueSystem;