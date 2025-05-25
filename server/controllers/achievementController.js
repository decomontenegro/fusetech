/**
 * Controlador de Conquistas
 * 
 * Este controlador gerencia todas as operações relacionadas a conquistas,
 * incluindo verificação, progresso e recompensas.
 */

const { Achievement, UserAchievement } = require('../models/Achievement');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Obter todas as conquistas
 * @route GET /api/achievements
 * @access Public
 */
exports.getAchievements = async (req, res) => {
  try {
    // Parâmetros de consulta
    const { 
      category, 
      difficulty,
      visibility = 'visible',
      search, 
      limit = 20, 
      page = 1,
      sort = 'difficulty'
    } = req.query;
    
    // Construir filtro
    const filter = { visibility };
    
    if (category) {
      filter.category = category;
    }
    
    if (difficulty) {
      filter.difficulty = parseInt(difficulty);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Filtrar por disponibilidade
    filter.$or = [
      { 'availability.isLimited': false },
      {
        'availability.isLimited': true,
        'availability.startDate': { $lte: new Date() },
        'availability.endDate': { $gte: new Date() }
      }
    ];
    
    // Calcular paginação
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determinar ordenação
    let sortOption = {};
    
    switch (sort) {
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'category':
        sortOption = { category: 1, difficulty: 1 };
        break;
      case 'difficulty':
      default:
        sortOption = { difficulty: 1, name: 1 };
    }
    
    // Buscar conquistas
    const achievements = await Achievement.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name description icon category difficulty criteria.type');
    
    // Contar total de conquistas
    const total = await Achievement.countDocuments(filter);
    
    // Calcular páginas
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      achievements,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas' });
  }
};

/**
 * Obter conquistas do usuário
 * @route GET /api/achievements/user
 * @access Private
 */
exports.getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar progresso de conquistas do usuário
    const userAchievements = await UserAchievement.find({ user: userId })
      .populate('achievement', 'name description icon category difficulty criteria rewards');
    
    // Formatar resposta
    const achievements = userAchievements.map(ua => ({
      id: ua.achievement._id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      category: ua.achievement.category,
      difficulty: ua.achievement.difficulty,
      status: ua.status,
      progress: ua.getProgressPercentage(),
      unlockedAt: ua.unlockedAt,
      rewards: ua.achievement.rewards.map((reward, index) => {
        const claimed = ua.claimedRewards.some(cr => cr.rewardIndex === index);
        return {
          ...reward.toObject(),
          claimed
        };
      })
    }));
    
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas do usuário' });
  }
};

/**
 * Obter conquistas disponíveis para o usuário
 * @route GET /api/achievements/available
 * @access Private
 */
exports.getAvailableAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar IDs de conquistas que o usuário já tem
    const userAchievementIds = await UserAchievement.find({ 
      user: userId,
      status: { $in: ['in_progress', 'completed'] }
    }).distinct('achievement');
    
    // Buscar conquistas disponíveis que o usuário ainda não tem
    const availableAchievements = await Achievement.find({
      _id: { $nin: userAchievementIds },
      visibility: 'visible',
      $or: [
        { 'availability.isLimited': false },
        {
          'availability.isLimited': true,
          'availability.startDate': { $lte: new Date() },
          'availability.endDate': { $gte: new Date() }
        }
      ]
    })
    .select('name description icon category difficulty criteria');
    
    res.json(availableAchievements);
  } catch (error) {
    console.error('Error fetching available achievements:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas disponíveis' });
  }
};

/**
 * Obter detalhes de uma conquista
 * @route GET /api/achievements/:id
 * @access Public
 */
exports.getAchievementById = async (req, res) => {
  try {
    const achievementId = req.params.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(achievementId)) {
      return res.status(400).json({ error: 'ID de conquista inválido' });
    }
    
    // Buscar conquista
    const achievement = await Achievement.findById(achievementId)
      .populate('relatedAchievements', 'name icon')
      .populate('prerequisite', 'name icon');
    
    // Verificar se a conquista existe
    if (!achievement) {
      return res.status(404).json({ error: 'Conquista não encontrada' });
    }
    
    // Se o usuário estiver autenticado, buscar progresso
    let userProgress = null;
    if (req.user) {
      userProgress = await UserAchievement.findOne({
        user: req.user.id,
        achievement: achievementId
      });
    }
    
    // Formatar resposta
    const response = {
      ...achievement.toObject(),
      userProgress: userProgress ? {
        status: userProgress.status,
        progress: userProgress.progress,
        progressPercentage: userProgress.getProgressPercentage(),
        unlockedAt: userProgress.unlockedAt,
        claimedRewards: userProgress.claimedRewards
      } : null
    };
    
    res.json(response);
  } catch (error) {
    console.error(`Error fetching achievement ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da conquista' });
  }
};

/**
 * Obter progresso de uma conquista
 * @route GET /api/achievements/:id/progress
 * @access Private
 */
exports.getAchievementProgress = async (req, res) => {
  try {
    const achievementId = req.params.id;
    const userId = req.user.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(achievementId)) {
      return res.status(400).json({ error: 'ID de conquista inválido' });
    }
    
    // Buscar conquista
    const achievement = await Achievement.findById(achievementId);
    
    // Verificar se a conquista existe
    if (!achievement) {
      return res.status(404).json({ error: 'Conquista não encontrada' });
    }
    
    // Buscar progresso do usuário
    let userProgress = await UserAchievement.findOne({
      user: userId,
      achievement: achievementId
    });
    
    // Se não existir, criar novo progresso
    if (!userProgress) {
      userProgress = new UserAchievement({
        user: userId,
        achievement: achievementId,
        status: 'locked',
        progress: achievement.criteria.map((criteria, index) => ({
          criteriaIndex: index,
          currentValue: 0,
          targetValue: criteria.target
        }))
      });
      
      await userProgress.save();
    }
    
    // Formatar resposta
    const response = {
      status: userProgress.status,
      progress: userProgress.progress,
      progressPercentage: userProgress.getProgressPercentage(),
      unlockedAt: userProgress.unlockedAt
    };
    
    res.json(response);
  } catch (error) {
    console.error(`Error fetching achievement progress for ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar progresso da conquista' });
  }
};

/**
 * Rastrear progresso de conquistas
 * @route POST /api/achievements/track
 * @access Private
 */
exports.trackProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, data } = req.body;
    
    // Verificar se o tipo foi fornecido
    if (!type) {
      return res.status(400).json({ error: 'Tipo de progresso é obrigatório' });
    }
    
    // Buscar conquistas relacionadas ao tipo
    const achievements = await Achievement.find({
      'criteria.type': type,
      visibility: { $ne: 'hidden' },
      $or: [
        { 'availability.isLimited': false },
        {
          'availability.isLimited': true,
          'availability.startDate': { $lte: new Date() },
          'availability.endDate': { $gte: new Date() }
        }
      ]
    });
    
    // Se não houver conquistas para este tipo
    if (achievements.length === 0) {
      return res.json({ success: true, updated: [] });
    }
    
    // Atualizar progresso para cada conquista
    const updatedAchievements = [];
    
    for (const achievement of achievements) {
      // Buscar progresso do usuário
      let userProgress = await UserAchievement.findOne({
        user: userId,
        achievement: achievement._id
      });
      
      // Se não existir, criar novo progresso
      if (!userProgress) {
        userProgress = new UserAchievement({
          user: userId,
          achievement: achievement._id,
          status: 'locked',
          progress: achievement.criteria.map((criteria, index) => ({
            criteriaIndex: index,
            currentValue: 0,
            targetValue: criteria.target
          }))
        });
      }
      
      // Se já estiver completo, pular
      if (userProgress.status === 'completed') {
        continue;
      }
      
      // Verificar cada critério
      let updated = false;
      
      achievement.criteria.forEach((criteria, index) => {
        // Se o critério for do tipo correto
        if (criteria.type === type) {
          // Calcular novo valor com base no tipo
          let newValue = 0;
          
          switch (type) {
            case 'distance_total':
              // Implementar lógica específica
              break;
            case 'activity_count':
              // Implementar lógica específica
              break;
            // Outros tipos...
            default:
              // Valor padrão
              newValue = data.value || 0;
          }
          
          // Atualizar progresso
          if (userProgress.updateProgress(index, newValue)) {
            updated = true;
          }
        }
      });
      
      // Se houve atualização, salvar
      if (updated) {
        await userProgress.save();
        updatedAchievements.push({
          id: achievement._id,
          name: achievement.name,
          status: userProgress.status,
          progress: userProgress.getProgressPercentage()
        });
      }
    }
    
    res.json({ success: true, updated: updatedAchievements });
  } catch (error) {
    console.error('Error tracking achievement progress:', error);
    res.status(500).json({ error: 'Erro ao rastrear progresso de conquistas' });
  }
};

/**
 * Verificar conquistas com base em uma atividade ou evento
 * @route POST /api/achievements/check
 * @access Private
 */
exports.checkAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activity, event } = req.body;
    
    // Verificar se atividade ou evento foi fornecido
    if (!activity && !event) {
      return res.status(400).json({ error: 'Atividade ou evento é obrigatório' });
    }
    
    // Conquistas desbloqueadas
    const unlockedAchievements = [];
    
    // Processar com base no tipo de entrada
    if (activity) {
      // Implementar lógica para verificar conquistas baseadas em atividade
      // ...
    }
    
    if (event) {
      // Implementar lógica para verificar conquistas baseadas em evento
      // ...
    }
    
    res.json({ success: true, unlockedAchievements });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Erro ao verificar conquistas' });
  }
};

/**
 * Reivindicar recompensa de uma conquista
 * @route POST /api/achievements/:id/rewards/:rewardIndex/claim
 * @access Private
 */
exports.claimReward = async (req, res) => {
  try {
    const achievementId = req.params.id;
    const rewardIndex = parseInt(req.params.rewardIndex);
    const userId = req.user.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(achievementId)) {
      return res.status(400).json({ error: 'ID de conquista inválido' });
    }
    
    // Verificar se o índice de recompensa é válido
    if (isNaN(rewardIndex) || rewardIndex < 0) {
      return res.status(400).json({ error: 'Índice de recompensa inválido' });
    }
    
    // Buscar conquista
    const achievement = await Achievement.findById(achievementId);
    
    // Verificar se a conquista existe
    if (!achievement) {
      return res.status(404).json({ error: 'Conquista não encontrada' });
    }
    
    // Verificar se a recompensa existe
    if (!achievement.rewards[rewardIndex]) {
      return res.status(404).json({ error: 'Recompensa não encontrada' });
    }
    
    // Buscar progresso do usuário
    const userProgress = await UserAchievement.findOne({
      user: userId,
      achievement: achievementId
    });
    
    // Verificar se o usuário desbloqueou a conquista
    if (!userProgress || userProgress.status !== 'completed') {
      return res.status(403).json({ error: 'Conquista não desbloqueada' });
    }
    
    // Verificar se a recompensa já foi reivindicada
    if (userProgress.claimedRewards.some(cr => cr.rewardIndex === rewardIndex)) {
      return res.status(400).json({ error: 'Recompensa já reivindicada' });
    }
    
    // Obter a recompensa
    const reward = achievement.rewards[rewardIndex];
    
    // Processar a recompensa com base no tipo
    let rewardResult = null;
    
    switch (reward.type) {
      case 'points':
        // Adicionar pontos ao usuário
        const user = await User.findById(userId);
        user.points = (user.points || 0) + reward.value;
        await user.save();
        
        rewardResult = {
          type: 'points',
          value: reward.value,
          newTotal: user.points
        };
        break;
        
      case 'badge':
        // Adicionar badge ao usuário
        // Implementar lógica específica
        rewardResult = {
          type: 'badge',
          badge: {
            name: reward.description,
            image: reward.image
          }
        };
        break;
        
      case 'token':
        // Adicionar tokens ao usuário
        // Implementar lógica específica
        rewardResult = {
          type: 'token',
          value: reward.value
        };
        break;
        
      // Outros tipos...
      
      default:
        rewardResult = {
          type: reward.type,
          description: reward.description
        };
    }
    
    // Registrar recompensa como reivindicada
    userProgress.claimedRewards.push({
      rewardIndex,
      claimedAt: new Date()
    });
    
    await userProgress.save();
    
    res.json({ success: true, reward: rewardResult });
  } catch (error) {
    console.error(`Error claiming achievement reward:`, error);
    res.status(500).json({ error: 'Erro ao reivindicar recompensa' });
  }
};

// Exportar controlador
module.exports = exports;
