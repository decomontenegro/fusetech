/**
 * Testes para o Modelo de Liga
 * 
 * Este arquivo contém testes unitários para o modelo League,
 * verificando se todas as operações e métodos funcionam corretamente.
 */

const mongoose = require('mongoose');
const { expect } = require('chai');
const sinon = require('sinon');
const League = require('../server/models/League');
const User = require('../server/models/User');
const Activity = require('../server/models/Activity');

describe('League Model', () => {
  // Configurar sandbox para stubs e mocks
  let sandbox;
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  describe('Schema', () => {
    it('should have the correct fields', () => {
      const league = new League();
      
      // Verificar campos básicos
      expect(league).to.have.property('name');
      expect(league).to.have.property('description');
      expect(league).to.have.property('type');
      expect(league).to.have.property('startDate');
      expect(league).to.have.property('endDate');
      expect(league).to.have.property('status');
      expect(league).to.have.property('activityTypes');
      expect(league).to.have.property('members');
      expect(league).to.have.property('createdBy');
      expect(league).to.have.property('admins');
      expect(league).to.have.property('createdAt');
      expect(league).to.have.property('updatedAt');
      
      // Verificar campos de regras
      expect(league.rules).to.have.property('minScore');
      expect(league.rules).to.have.property('isPrivate');
      expect(league.rules.multipliers).to.have.property('running');
      expect(league.rules.multipliers).to.have.property('cycling');
      expect(league.rules.multipliers).to.have.property('walking');
      expect(league.rules.multipliers).to.have.property('swimming');
      expect(league.rules.multipliers).to.have.property('hiking');
      expect(league.rules.multipliers).to.have.property('workout');
    });
    
    it('should have default values', () => {
      const league = new League();
      
      // Verificar valores padrão
      expect(league.type).to.equal('distance');
      expect(league.status).to.equal('draft');
      expect(league.rules.minScore).to.equal(0);
      expect(league.rules.isPrivate).to.equal(false);
      expect(league.rules.multipliers.running).to.equal(1.0);
      expect(league.rules.multipliers.cycling).to.equal(1.0);
      expect(league.rules.multipliers.walking).to.equal(1.0);
      expect(league.rules.multipliers.swimming).to.equal(1.0);
      expect(league.rules.multipliers.hiking).to.equal(1.0);
      expect(league.rules.multipliers.workout).to.equal(1.0);
    });
    
    it('should validate required fields', async () => {
      const league = new League();
      
      try {
        await league.validate();
        // Se chegar aqui, o teste falhou
        expect.fail('Validation should fail for missing required fields');
      } catch (error) {
        // Verificar erros de validação
        expect(error.errors).to.have.property('name');
        expect(error.errors).to.have.property('startDate');
        expect(error.errors).to.have.property('endDate');
        expect(error.errors).to.have.property('createdBy');
      }
    });
  });
  
  describe('Methods', () => {
    describe('calculateActivityScore', () => {
      it('should calculate score for distance type', () => {
        const league = new League({
          type: 'distance',
          activityTypes: ['running', 'cycling']
        });
        
        const activity = {
          type: 'running',
          distance: 10, // 10 km
          elevationGain: 100,
          duration: 3600, // 1 hour
          calories: 500
        };
        
        const score = league.calculateActivityScore(activity);
        
        // Para tipo 'distance', a pontuação é igual à distância
        expect(score).to.equal(10);
      });
      
      it('should calculate score for elevation type', () => {
        const league = new League({
          type: 'elevation',
          activityTypes: ['running', 'cycling']
        });
        
        const activity = {
          type: 'running',
          distance: 10,
          elevationGain: 100, // 100 m
          duration: 3600,
          calories: 500
        };
        
        const score = league.calculateActivityScore(activity);
        
        // Para tipo 'elevation', a pontuação é igual ao ganho de elevação
        expect(score).to.equal(100);
      });
      
      it('should calculate score for duration type', () => {
        const league = new League({
          type: 'duration',
          activityTypes: ['running', 'cycling']
        });
        
        const activity = {
          type: 'running',
          distance: 10,
          elevationGain: 100,
          duration: 3600, // 1 hour = 60 minutes
          calories: 500
        };
        
        const score = league.calculateActivityScore(activity);
        
        // Para tipo 'duration', a pontuação é igual à duração em minutos
        expect(score).to.equal(60);
      });
      
      it('should calculate score for calories type', () => {
        const league = new League({
          type: 'calories',
          activityTypes: ['running', 'cycling']
        });
        
        const activity = {
          type: 'running',
          distance: 10,
          elevationGain: 100,
          duration: 3600,
          calories: 500
        };
        
        const score = league.calculateActivityScore(activity);
        
        // Para tipo 'calories', a pontuação é igual às calorias
        expect(score).to.equal(500);
      });
      
      it('should apply multipliers correctly', () => {
        const league = new League({
          type: 'distance',
          activityTypes: ['running', 'cycling'],
          rules: {
            multipliers: {
              running: 2.0,
              cycling: 0.5
            }
          }
        });
        
        const runningActivity = {
          type: 'running',
          distance: 10
        };
        
        const cyclingActivity = {
          type: 'cycling',
          distance: 10
        };
        
        const runningScore = league.calculateActivityScore(runningActivity);
        const cyclingScore = league.calculateActivityScore(cyclingActivity);
        
        // Verificar multiplicadores
        expect(runningScore).to.equal(20); // 10 * 2.0
        expect(cyclingScore).to.equal(5);  // 10 * 0.5
      });
      
      it('should return 0 for disallowed activity types', () => {
        const league = new League({
          type: 'distance',
          activityTypes: ['running'] // Apenas corrida permitida
        });
        
        const activity = {
          type: 'cycling', // Tipo não permitido
          distance: 10
        };
        
        const score = league.calculateActivityScore(activity);
        
        // Deve retornar 0 para tipos não permitidos
        expect(score).to.equal(0);
      });
    });
    
    describe('updateRankings', () => {
      it('should sort members by score and update ranks', () => {
        const league = new League();
        
        // Adicionar membros com pontuações diferentes
        league.members = [
          { user: new mongoose.Types.ObjectId(), score: 50, rank: 0 },
          { user: new mongoose.Types.ObjectId(), score: 100, rank: 0 },
          { user: new mongoose.Types.ObjectId(), score: 75, rank: 0 }
        ];
        
        // Atualizar rankings
        league.updateRankings();
        
        // Verificar se os membros foram ordenados por pontuação
        expect(league.members[0].score).to.equal(100);
        expect(league.members[1].score).to.equal(75);
        expect(league.members[2].score).to.equal(50);
        
        // Verificar se os ranks foram atualizados
        expect(league.members[0].rank).to.equal(1);
        expect(league.members[1].rank).to.equal(2);
        expect(league.members[2].rank).to.equal(3);
      });
      
      it('should handle ties correctly', () => {
        const league = new League();
        
        // Adicionar membros com pontuações iguais
        league.members = [
          { user: new mongoose.Types.ObjectId(), score: 100, rank: 0 },
          { user: new mongoose.Types.ObjectId(), score: 100, rank: 0 },
          { user: new mongoose.Types.ObjectId(), score: 50, rank: 0 }
        ];
        
        // Atualizar rankings
        league.updateRankings();
        
        // Verificar se os membros foram ordenados por pontuação
        expect(league.members[0].score).to.equal(100);
        expect(league.members[1].score).to.equal(100);
        expect(league.members[2].score).to.equal(50);
        
        // Verificar se os ranks foram atualizados
        expect(league.members[0].rank).to.equal(1);
        expect(league.members[1].rank).to.equal(2); // Segundo lugar mesmo com pontuação igual
        expect(league.members[2].rank).to.equal(3);
      });
    });
    
    describe('isActive', () => {
      it('should return true for active leagues within date range', () => {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1); // Ontem
        
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 1); // Amanhã
        
        const league = new League({
          status: 'active',
          startDate,
          endDate
        });
        
        expect(league.isActive()).to.be.true;
      });
      
      it('should return false for inactive leagues', () => {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1); // Ontem
        
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 1); // Amanhã
        
        const league = new League({
          status: 'draft', // Não ativa
          startDate,
          endDate
        });
        
        expect(league.isActive()).to.be.false;
      });
      
      it('should return false for leagues outside date range', () => {
        const now = new Date();
        
        // Liga futura
        const futureLeague = new League({
          status: 'active',
          startDate: new Date(now.getTime() + 86400000), // Amanhã
          endDate: new Date(now.getTime() + 172800000)   // Depois de amanhã
        });
        
        // Liga passada
        const pastLeague = new League({
          status: 'active',
          startDate: new Date(now.getTime() - 172800000), // Anteontem
          endDate: new Date(now.getTime() - 86400000)     // Ontem
        });
        
        expect(futureLeague.isActive()).to.be.false;
        expect(pastLeague.isActive()).to.be.false;
      });
    });
    
    describe('isMember', () => {
      it('should return true if user is a member', () => {
        const userId = new mongoose.Types.ObjectId();
        
        const league = new League({
          members: [
            { user: userId },
            { user: new mongoose.Types.ObjectId() }
          ]
        });
        
        expect(league.isMember(userId)).to.be.true;
      });
      
      it('should return false if user is not a member', () => {
        const userId = new mongoose.Types.ObjectId();
        
        const league = new League({
          members: [
            { user: new mongoose.Types.ObjectId() },
            { user: new mongoose.Types.ObjectId() }
          ]
        });
        
        expect(league.isMember(userId)).to.be.false;
      });
    });
    
    describe('isAdmin', () => {
      it('should return true if user is the creator', () => {
        const userId = new mongoose.Types.ObjectId();
        
        const league = new League({
          createdBy: userId,
          admins: []
        });
        
        expect(league.isAdmin(userId)).to.be.true;
      });
      
      it('should return true if user is an admin', () => {
        const userId = new mongoose.Types.ObjectId();
        
        const league = new League({
          createdBy: new mongoose.Types.ObjectId(),
          admins: [userId, new mongoose.Types.ObjectId()]
        });
        
        expect(league.isAdmin(userId)).to.be.true;
      });
      
      it('should return false if user is not an admin or creator', () => {
        const userId = new mongoose.Types.ObjectId();
        
        const league = new League({
          createdBy: new mongoose.Types.ObjectId(),
          admins: [new mongoose.Types.ObjectId()]
        });
        
        expect(league.isAdmin(userId)).to.be.false;
      });
    });
  });
});
