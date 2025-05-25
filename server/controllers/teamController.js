/**
 * Controlador de Equipes
 * 
 * Este controlador gerencia todas as operações relacionadas a equipes,
 * incluindo criação, atualização, busca e gerenciamento de membros.
 */

const Team = require('../models/Team');
const User = require('../models/User');
const Competition = require('../models/Competition');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const nodemailer = require('../utils/nodemailer');

/**
 * Obter todas as equipes
 * @route GET /api/teams
 * @access Public
 */
exports.getTeams = async (req, res) => {
  try {
    // Parâmetros de consulta
    const { 
      privacy = 'public', 
      search, 
      limit = 20, 
      page = 1,
      sort = 'createdAt'
    } = req.query;
    
    // Construir filtro
    const filter = { privacy };
    
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
      case 'createdAt':
      default:
        sortOption = { createdAt: -1 };
    }
    
    // Buscar equipes
    const teams = await Team.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name description avatar color privacy members.length createdBy')
      .populate('createdBy', 'name avatar');
    
    // Contar total de equipes
    const total = await Team.countDocuments(filter);
    
    // Calcular páginas
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      teams,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Erro ao buscar equipes' });
  }
};

/**
 * Obter equipes do usuário atual
 * @route GET /api/teams/user
 * @access Private
 */
exports.getUserTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar equipes onde o usuário é membro
    const teams = await Team.find({ 'members.user': userId })
      .select('name description avatar color privacy members competitions')
      .populate('createdBy', 'name avatar')
      .populate('members.user', 'name avatar')
      .populate('competitions.competition', 'name startDate endDate');
    
    // Formatar resposta
    const userTeams = teams.map(team => {
      const userMember = team.members.find(member => 
        member.user._id.toString() === userId
      );
      
      return {
        id: team._id,
        name: team.name,
        description: team.description,
        avatar: team.avatar,
        color: team.color,
        privacy: team.privacy,
        members: team.members.length,
        competitions: team.competitions.length,
        role: userMember ? userMember.role : null,
        contribution: userMember ? userMember.contribution : 0,
        isAdmin: team.isAdmin(userId),
        isCaptain: team.isCaptain(userId)
      };
    });
    
    res.json(userTeams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ error: 'Erro ao buscar equipes do usuário' });
  }
};

/**
 * Obter equipes disponíveis para o usuário
 * @route GET /api/teams/available
 * @access Private
 */
exports.getAvailableTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar equipes públicas onde o usuário não é membro
    const teams = await Team.find({
      privacy: 'public',
      'members.user': { $ne: userId }
    })
    .select('name description avatar color members')
    .populate('createdBy', 'name avatar');
    
    // Formatar resposta
    const availableTeams = teams.map(team => ({
      id: team._id,
      name: team.name,
      description: team.description,
      avatar: team.avatar,
      color: team.color,
      members: team.members.length,
      isFull: team.isFull()
    }));
    
    res.json(availableTeams);
  } catch (error) {
    console.error('Error fetching available teams:', error);
    res.status(500).json({ error: 'Erro ao buscar equipes disponíveis' });
  }
};

/**
 * Obter detalhes de uma equipe
 * @route GET /api/teams/:id
 * @access Public/Private
 */
exports.getTeamById = async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ error: 'ID de equipe inválido' });
    }
    
    // Buscar equipe
    const team = await Team.findById(teamId)
      .populate('createdBy', 'name avatar')
      .populate('members.user', 'name avatar')
      .populate('competitions.competition', 'name startDate endDate type');
    
    // Verificar se a equipe existe
    if (!team) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }
    
    // Verificar permissão para equipes privadas
    if (team.privacy !== 'public') {
      // Se não estiver autenticado
      if (!req.user) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
      
      // Se não for membro da equipe
      if (!team.isMember(req.user.id)) {
        return res.status(403).json({ error: 'Acesso negado' });
      }
    }
    
    res.json(team);
  } catch (error) {
    console.error(`Error fetching team ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da equipe' });
  }
};

/**
 * Criar uma nova equipe
 * @route POST /api/teams
 * @access Private
 */
exports.createTeam = async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      name,
      description,
      avatar,
      color,
      privacy,
      accessCode,
      maxSize
    } = req.body;
    
    // Criar nova equipe
    const team = new Team({
      name,
      description,
      avatar,
      color,
      privacy,
      accessCode,
      maxSize,
      createdBy: req.user.id
    });
    
    // Adicionar criador como capitão
    team.members.push({
      user: req.user.id,
      role: 'captain',
      contribution: 0
    });
    
    // Salvar equipe
    await team.save();
    
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Erro ao criar equipe' });
  }
};

/**
 * Atualizar uma equipe
 * @route PUT /api/teams/:id
 * @access Private
 */
exports.updateTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ error: 'ID de equipe inválido' });
    }
    
    // Buscar equipe
    const team = await Team.findById(teamId);
    
    // Verificar se a equipe existe
    if (!team) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }
    
    // Verificar permissão
    if (!team.isAdmin(req.user.id)) {
      return res.status(403).json({ error: 'Sem permissão para atualizar esta equipe' });
    }
    
    // Campos permitidos para atualização
    const {
      name,
      description,
      avatar,
      color,
      privacy,
      accessCode,
      maxSize
    } = req.body;
    
    // Atualizar campos
    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (avatar) team.avatar = avatar;
    if (color) team.color = color;
    if (privacy) team.privacy = privacy;
    if (accessCode !== undefined) team.accessCode = accessCode;
    if (maxSize) team.maxSize = maxSize;
    
    // Salvar alterações
    await team.save();
    
    res.json(team);
  } catch (error) {
    console.error(`Error updating team ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar equipe' });
  }
};

/**
 * Excluir uma equipe
 * @route DELETE /api/teams/:id
 * @access Private
 */
exports.deleteTeam = async (req, res) => {
  try {
    const teamId = req.params.id;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ error: 'ID de equipe inválido' });
    }
    
    // Buscar equipe
    const team = await Team.findById(teamId);
    
    // Verificar se a equipe existe
    if (!team) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }
    
    // Verificar permissão
    if (!team.isCaptain(req.user.id)) {
      return res.status(403).json({ error: 'Apenas o capitão pode excluir a equipe' });
    }
    
    // Excluir equipe
    await team.remove();
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting team ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao excluir equipe' });
  }
};

/**
 * Convidar um membro para a equipe
 * @route POST /api/teams/:id/invite
 * @access Private
 */
exports.inviteMember = async (req, res) => {
  try {
    const teamId = req.params.id;
    const { email } = req.body;
    
    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ error: 'ID de equipe inválido' });
    }
    
    // Verificar se o email foi fornecido
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    // Buscar equipe
    const team = await Team.findById(teamId);
    
    // Verificar se a equipe existe
    if (!team) {
      return res.status(404).json({ error: 'Equipe não encontrada' });
    }
    
    // Verificar permissão
    if (!team.isAdmin(req.user.id)) {
      return res.status(403).json({ error: 'Sem permissão para convidar membros' });
    }
    
    // Verificar se a equipe está cheia
    if (team.isFull()) {
      return res.status(400).json({ error: 'A equipe atingiu o limite de membros' });
    }
    
    // Verificar se o usuário já é membro
    const user = await User.findOne({ email });
    if (user && team.isMember(user._id)) {
      return res.status(400).json({ error: 'Este usuário já é membro da equipe' });
    }
    
    // Criar convite
    const invitation = team.createInvitation(email);
    
    // Salvar equipe
    await team.save();
    
    // Enviar email de convite
    try {
      await nodemailer.sendTeamInvitation(email, {
        teamName: team.name,
        inviterName: req.user.name,
        invitationCode: invitation.code,
        expiresAt: invitation.expiresAt
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Continuar mesmo se o email falhar
    }
    
    res.json({ success: true, invitation });
  } catch (error) {
    console.error(`Error inviting member to team ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao convidar membro' });
  }
};

/**
 * Aceitar um convite para equipe
 * @route POST /api/teams/invitations/:code/accept
 * @access Private
 */
exports.acceptInvitation = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.id;
    
    // Verificar se o código foi fornecido
    if (!code) {
      return res.status(400).json({ error: 'Código de convite é obrigatório' });
    }
    
    // Buscar equipe com o convite
    const team = await Team.findOne({
      'invitations.code': code,
      'invitations.status': 'pending'
    });
    
    // Verificar se o convite existe
    if (!team) {
      return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
    }
    
    // Encontrar o convite
    const invitation = team.invitations.find(inv => 
      inv.code === code && inv.status === 'pending'
    );
    
    // Verificar se o convite expirou
    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      await team.save();
      return res.status(400).json({ error: 'Convite expirado' });
    }
    
    // Verificar se o email do convite corresponde ao usuário
    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ error: 'Este convite não é para você' });
    }
    
    // Verificar se a equipe está cheia
    if (team.isFull()) {
      invitation.status = 'rejected';
      await team.save();
      return res.status(400).json({ error: 'A equipe atingiu o limite de membros' });
    }
    
    // Verificar se o usuário já é membro
    if (team.isMember(userId)) {
      invitation.status = 'accepted';
      await team.save();
      return res.status(400).json({ error: 'Você já é membro desta equipe' });
    }
    
    // Adicionar usuário à equipe
    team.addMember(userId, 'member');
    
    // Atualizar status do convite
    invitation.status = 'accepted';
    invitation.user = userId;
    
    // Salvar equipe
    await team.save();
    
    res.json({ success: true, team: {
      id: team._id,
      name: team.name,
      description: team.description,
      avatar: team.avatar,
      color: team.color
    }});
  } catch (error) {
    console.error(`Error accepting team invitation:`, error);
    res.status(500).json({ error: 'Erro ao aceitar convite' });
  }
};

/**
 * Rejeitar um convite para equipe
 * @route POST /api/teams/invitations/:code/reject
 * @access Private
 */
exports.rejectInvitation = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user.id;
    
    // Verificar se o código foi fornecido
    if (!code) {
      return res.status(400).json({ error: 'Código de convite é obrigatório' });
    }
    
    // Buscar equipe com o convite
    const team = await Team.findOne({
      'invitations.code': code,
      'invitations.status': 'pending'
    });
    
    // Verificar se o convite existe
    if (!team) {
      return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
    }
    
    // Encontrar o convite
    const invitation = team.invitations.find(inv => 
      inv.code === code && inv.status === 'pending'
    );
    
    // Verificar se o email do convite corresponde ao usuário
    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({ error: 'Este convite não é para você' });
    }
    
    // Atualizar status do convite
    invitation.status = 'rejected';
    invitation.user = userId;
    
    // Salvar equipe
    await team.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Error rejecting team invitation:`, error);
    res.status(500).json({ error: 'Erro ao rejeitar convite' });
  }
};

/**
 * Obter convites para equipes do usuário
 * @route GET /api/teams/invitations
 * @access Private
 */
exports.getTeamInvitations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // Buscar equipes com convites para o usuário
    const teams = await Team.find({
      'invitations.email': user.email,
      'invitations.status': 'pending'
    })
    .select('name description avatar color invitations')
    .populate('createdBy', 'name avatar');
    
    // Formatar resposta
    const invitations = teams.map(team => {
      const invitation = team.invitations.find(inv => 
        inv.email.toLowerCase() === user.email.toLowerCase() && 
        inv.status === 'pending'
      );
      
      return {
        id: invitation._id,
        code: invitation.code,
        expiresAt: invitation.expiresAt,
        team: {
          id: team._id,
          name: team.name,
          description: team.description,
          avatar: team.avatar,
          color: team.color,
          createdBy: team.createdBy
        }
      };
    });
    
    res.json(invitations);
  } catch (error) {
    console.error('Error fetching team invitations:', error);
    res.status(500).json({ error: 'Erro ao buscar convites para equipes' });
  }
};

// Exportar controlador
module.exports = exports;
