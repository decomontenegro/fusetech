/**
 * Controlador de Ligas
 * 
 * Este controlador gerencia todas as operações relacionadas a ligas,
 * incluindo criação, atualização, busca e gerenciamento de membros.
 */

const League = require('../models/League');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Obter todas as ligas
 * @route GET /api/leagues
 * @access Public
 */
exports.getLeagues = async (req, res) => {
  try {
    // Parâmetros de consulta
    const { 
      status = 'active', 
      type, 
      search, 
      limit = 20, 
      page = 1,
      sort = 'startDate'
    } = req.query;
    
    // Construir filtro
    const filter = { status };
    
    if (type) {
      filter.type = type;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Calcular paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determinar ordenação
    let sortOption = {};
    
    switch (sort) {
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'members':
        sortOption = { 'members.length': -1 };
        break;
      case 'endDate':
        sortOption = { endDate: 1 };
        break;
      case 'startDate':
      default:
        sortOption = { startDate: -1 };
    }
    
    // Buscar ligas
    const leagues = await League.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name description type startDate endDate status activityTypes members.length createdBy')
      .populate('createdBy', 'name avatar');
    
    // Contar total de ligas
    const total = await League.countDocuments(filter);
    
    // Calcular páginas
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      leagues,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    res.status(500).json({ error: 'Erro ao buscar ligas' });
  }
};

/**
 * Obter ligas do usuário atual
 * @route GET /api/leagues/user
 * @access Private
 */
exports.getUserLeagues = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar ligas onde o usuário é membro
    const leagues = await League.find({ 'members.user': userId })
      .select('name description type startDate endDate status activityTypes members')
      .populate('createdBy', 'name avatar');
    
    // Filtrar membros para obter apenas o do usuário atual
    const userLeagues = leagues.map(league => {
      const userMember = league.members.find(member => 
        member.user.toString() === userId
      );
      
      return {
        id: league._id,
        name: league.name,
        description: league.description,
        type: league.type,
        startDate: league.startDate,
        endDate: league.endDate,
        status: league.status,
        activityTypes: league.activityTypes,
        members: league.members.length,
        userRank: userMember ? userMember.rank : null,
        userScore: userMember ? userMember.score : 0,
        leaderScore: league.members.length > 0 ? 
          Math.max(...league.members.map(m => m.score)) : 0,
        isAdmin: league.isAdmin(userId)
      };
    });
    
    res.json(userLeagues);
  } catch (error) {
    console.error('Error fetching user leagues:', error);
    res.status(500).json({ error: 'Erro ao buscar ligas do usuário' });
  }
};

/**
 * Obter ligas disponíveis para o usuário
 * @route GET /api/leagues/available
 * @access Private
 */
exports.getAvailableLeagues = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar ligas ativas onde o usuário não é membro
    const leagues = await League.find({
      status: 'active',
      'members.user': { $ne: userId },
      endDate: { $gt: new Date() }
    })
    .select('name description type startDate endDate status activityTypes members')
    .populate('createdBy', 'name avatar');
    
    // Formatar resposta
    const availableLeagues = leagues.map(league => ({
      id: league._id,
      name: league.name,
      description: league.description,
      type: league.type,
      startDate: league.startDate,
      endDate: league.endDate,
      status: league.status,
      activityTypes: league.activityTypes,
      members: league.members.length,
      leaderScore: league.members.length > 0 ? 
        Math.max(...league.members.map(m => m.score)) : 0
    }));
    
    res.json(availableLeagues);
  } catch (error) {
    console.error('Error fetching available leagues:', error);
    res.status(500).json({ error: 'Erro ao buscar ligas disponíveis' });
  }
};

/**
 * Obter detalhes de uma liga
 * @route GET /api/leagues/:id
 * @access Public
 */
exports.getLeagueById = async (req, res) => {
  try {
    const leagueId = req.params.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ error: 'ID de liga inválido' });
    }
    
    // Buscar liga
    const league = await League.findById(leagueId)
      .populate('createdBy', 'name avatar')
      .populate('admins', 'name avatar')
      .populate('members.user', 'name avatar');
    
    // Verificar se a liga existe
    if (!league) {
      return res.status(404).json({ error: 'Liga não encontrada' });
    }
    
    res.json(league);
  } catch (error) {
    console.error(`Error fetching league ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da liga' });
  }
};

/**
 * Criar uma nova liga
 * @route POST /api/leagues
 * @access Private
 */
exports.createLeague = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      activityTypes,
      rules
    } = req.body;
    
    // Criar nova liga
    const league = new League({
      name,
      description,
      type,
      startDate,
      endDate,
      activityTypes,
      rules,
      createdBy: req.user.id,
      admins: [req.user.id],
      status: 'active'
    });
    
    // Adicionar criador como membro
    league.members.push({
      user: req.user.id,
      score: 0,
      rank: 1
    });
    
    // Salvar liga
    await league.save();
    
    res.status(201).json(league);
  } catch (error) {
    console.error('Error creating league:', error);
    res.status(500).json({ error: 'Erro ao criar liga' });
  }
};

/**
 * Atualizar uma liga
 * @route PUT /api/leagues/:id
 * @access Private
 */
exports.updateLeague = async (req, res) => {
  try {
    const leagueId = req.params.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ error: 'ID de liga inválido' });
    }
    
    // Buscar liga
    const league = await League.findById(leagueId);
    
    // Verificar se a liga existe
    if (!league) {
      return res.status(404).json({ error: 'Liga não encontrada' });
    }
    
    // Verificar permissão
    if (!league.isAdmin(req.user.id)) {
      return res.status(403).json({ error: 'Sem permissão para atualizar esta liga' });
    }
    
    // Campos permitidos para atualização
    const {
      name,
      description,
      activityTypes,
      rules,
      status
    } = req.body;
    
    // Atualizar campos
    if (name) league.name = name;
    if (description) league.description = description;
    if (activityTypes) league.activityTypes = activityTypes;
    if (rules) league.rules = { ...league.rules, ...rules };
    if (status) league.status = status;
    
    // Salvar alterações
    await league.save();
    
    res.json(league);
  } catch (error) {
    console.error(`Error updating league ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar liga' });
  }
};

/**
 * Entrar em uma liga
 * @route POST /api/leagues/:id/join
 * @access Private
 */
exports.joinLeague = async (req, res) => {
  try {
    const leagueId = req.params.id;
    const userId = req.user.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ error: 'ID de liga inválido' });
    }
    
    // Buscar liga
    const league = await League.findById(leagueId);
    
    // Verificar se a liga existe
    if (!league) {
      return res.status(404).json({ error: 'Liga não encontrada' });
    }
    
    // Verificar se a liga está ativa
    if (!league.isActive()) {
      return res.status(400).json({ error: 'Esta liga não está ativa' });
    }
    
    // Verificar se o usuário já é membro
    if (league.isMember(userId)) {
      return res.status(400).json({ error: 'Você já é membro desta liga' });
    }
    
    // Verificar código de acesso para ligas privadas
    if (league.rules.isPrivate) {
      const { accessCode } = req.body;
      
      if (!accessCode || accessCode !== league.rules.accessCode) {
        return res.status(403).json({ error: 'Código de acesso inválido' });
      }
    }
    
    // Verificar limite de participantes
    if (league.rules.maxParticipants && league.members.length >= league.rules.maxParticipants) {
      return res.status(400).json({ error: 'Esta liga atingiu o limite de participantes' });
    }
    
    // Adicionar usuário como membro
    league.members.push({
      user: userId,
      score: 0,
      rank: league.members.length + 1
    });
    
    // Atualizar rankings
    league.updateRankings();
    
    // Salvar alterações
    await league.save();
    
    // Buscar membro adicionado
    const userMember = league.members.find(member => 
      member.user.toString() === userId
    );
    
    // Formatar resposta
    const response = {
      success: true,
      league: {
        id: league._id,
        name: league.name,
        description: league.description,
        type: league.type,
        startDate: league.startDate,
        endDate: league.endDate,
        status: league.status,
        activityTypes: league.activityTypes,
        members: league.members.length,
        userRank: userMember.rank,
        userScore: userMember.score,
        leaderScore: league.members.length > 0 ? 
          Math.max(...league.members.map(m => m.score)) : 0
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error(`Error joining league ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao entrar na liga' });
  }
};

/**
 * Sair de uma liga
 * @route POST /api/leagues/:id/leave
 * @access Private
 */
exports.leaveLeague = async (req, res) => {
  try {
    const leagueId = req.params.id;
    const userId = req.user.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ error: 'ID de liga inválido' });
    }
    
    // Buscar liga
    const league = await League.findById(leagueId);
    
    // Verificar se a liga existe
    if (!league) {
      return res.status(404).json({ error: 'Liga não encontrada' });
    }
    
    // Verificar se o usuário é membro
    if (!league.isMember(userId)) {
      return res.status(400).json({ error: 'Você não é membro desta liga' });
    }
    
    // Verificar se o usuário é o criador
    if (league.createdBy.toString() === userId) {
      return res.status(400).json({ error: 'O criador não pode sair da liga' });
    }
    
    // Remover usuário da liga
    league.members = league.members.filter(member => 
      member.user.toString() !== userId
    );
    
    // Remover usuário dos administradores
    league.admins = league.admins.filter(admin => 
      admin.toString() !== userId
    );
    
    // Atualizar rankings
    league.updateRankings();
    
    // Salvar alterações
    await league.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error leaving league ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao sair da liga' });
  }
};

/**
 * Obter leaderboard de uma liga
 * @route GET /api/leagues/:id/leaderboard
 * @access Public
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const leagueId = req.params.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(leagueId)) {
      return res.status(400).json({ error: 'ID de liga inválido' });
    }
    
    // Buscar liga
    const league = await League.findById(leagueId)
      .populate('members.user', 'name avatar');
    
    // Verificar se a liga existe
    if (!league) {
      return res.status(404).json({ error: 'Liga não encontrada' });
    }
    
    // Ordenar membros por pontuação
    league.updateRankings();
    
    // Formatar leaderboard
    const leaderboard = league.members.map(member => ({
      rank: member.rank,
      userId: member.user._id,
      name: member.user.name,
      avatar: member.user.avatar,
      score: member.score,
      isCurrentUser: req.user && member.user._id.toString() === req.user.id
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error(`Error fetching leaderboard for league ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar leaderboard' });
  }
};

/**
 * Obter ligas recomendadas para o usuário
 * @route GET /api/leagues/recommended
 * @access Private
 */
exports.getRecommendedLeagues = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 3;
    
    // Buscar atividades recentes do usuário
    const recentActivities = await Activity.find({ user: userId })
      .sort({ startDate: -1 })
      .limit(10);
    
    // Extrair tipos de atividade mais frequentes
    const activityTypes = {};
    recentActivities.forEach(activity => {
      activityTypes[activity.type] = (activityTypes[activity.type] || 0) + 1;
    });
    
    const preferredTypes = Object.keys(activityTypes)
      .sort((a, b) => activityTypes[b] - activityTypes[a]);
    
    // Buscar ligas ativas que correspondam aos tipos de atividade preferidos
    let leagues = [];
    
    if (preferredTypes.length > 0) {
      leagues = await League.find({
        status: 'active',
        'members.user': { $ne: userId },
        endDate: { $gt: new Date() },
        activityTypes: { $in: preferredTypes }
      })
      .limit(limit)
      .select('name description type startDate endDate status activityTypes members')
      .populate('createdBy', 'name avatar');
    }
    
    // Se não encontrou ligas suficientes, buscar outras ligas populares
    if (leagues.length < limit) {
      const additionalLeagues = await League.find({
        status: 'active',
        'members.user': { $ne: userId },
        endDate: { $gt: new Date() },
        _id: { $nin: leagues.map(l => l._id) }
      })
      .sort({ 'members.length': -1 })
      .limit(limit - leagues.length)
      .select('name description type startDate endDate status activityTypes members')
      .populate('createdBy', 'name avatar');
      
      leagues = [...leagues, ...additionalLeagues];
    }
    
    // Formatar resposta
    const recommendedLeagues = leagues.map(league => ({
      id: league._id,
      name: league.name,
      description: league.description,
      type: league.type,
      startDate: league.startDate,
      endDate: league.endDate,
      status: league.status,
      activityTypes: league.activityTypes,
      members: league.members.length,
      leaderScore: league.members.length > 0 ? 
        Math.max(...league.members.map(m => m.score)) : 0
    }));
    
    res.json(recommendedLeagues);
  } catch (error) {
    console.error('Error fetching recommended leagues:', error);
    res.status(500).json({ error: 'Erro ao buscar ligas recomendadas' });
  }
};

// Exportar controlador
module.exports = exports;
