/**
 * Modelo de Equipe
 * 
 * Este modelo representa uma equipe no sistema, com informações sobre
 * membros, competições e estatísticas.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema para membros de uma equipe
 */
const TeamMemberSchema = new Schema({
  // Referência ao usuário
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Data de entrada na equipe
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // Função na equipe
  role: {
    type: String,
    enum: ['admin', 'captain', 'member'],
    default: 'member'
  },
  
  // Contribuição para a equipe (pontos)
  contribution: {
    type: Number,
    default: 0
  },
  
  // Histórico de contribuição
  history: [{
    date: {
      type: Date,
      required: true
    },
    points: {
      type: Number,
      required: true
    },
    activities: [{
      type: Schema.Types.ObjectId,
      ref: 'Activity'
    }]
  }]
});

/**
 * Schema para convites para equipe
 */
const TeamInvitationSchema = new Schema({
  // Email do convidado
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  
  // Referência ao usuário (se já registrado)
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Data do convite
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Data de expiração
  expiresAt: {
    type: Date,
    required: true
  },
  
  // Status do convite
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  
  // Código de convite
  code: {
    type: String,
    required: true
  }
});

/**
 * Schema para competições da equipe
 */
const TeamCompetitionSchema = new Schema({
  // Referência à competição
  competition: {
    type: Schema.Types.ObjectId,
    ref: 'Competition',
    required: true
  },
  
  // Data de entrada na competição
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // Pontuação na competição
  score: {
    type: Number,
    default: 0
  },
  
  // Posição no ranking
  rank: {
    type: Number
  },
  
  // Status na competição
  status: {
    type: String,
    enum: ['active', 'completed', 'disqualified'],
    default: 'active'
  }
});

/**
 * Schema principal da equipe
 */
const TeamSchema = new Schema({
  // Informações básicas
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Imagem/logo da equipe
  avatar: {
    type: String
  },
  
  // Cor da equipe
  color: {
    type: String,
    default: '#3498db'
  },
  
  // Privacidade da equipe
  privacy: {
    type: String,
    enum: ['public', 'private', 'invitation'],
    default: 'public'
  },
  
  // Código de acesso (para equipes privadas)
  accessCode: {
    type: String
  },
  
  // Tamanho máximo da equipe
  maxSize: {
    type: Number,
    default: 10
  },
  
  // Membros da equipe
  members: [TeamMemberSchema],
  
  // Convites pendentes
  invitations: [TeamInvitationSchema],
  
  // Competições da equipe
  competitions: [TeamCompetitionSchema],
  
  // Estatísticas da equipe
  statistics: {
    totalDistance: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0
    },
    totalActivities: {
      type: Number,
      default: 0
    },
    totalElevation: {
      type: Number,
      default: 0
    },
    totalCalories: {
      type: Number,
      default: 0
    },
    activityTypes: {
      running: {
        type: Number,
        default: 0
      },
      cycling: {
        type: Number,
        default: 0
      },
      walking: {
        type: Number,
        default: 0
      },
      swimming: {
        type: Number,
        default: 0
      },
      hiking: {
        type: Number,
        default: 0
      },
      workout: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Criador da equipe
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Metadados
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Middleware para atualizar a data de modificação
 */
TeamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Método para verificar se um usuário é membro da equipe
 */
TeamSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

/**
 * Método para verificar se um usuário é administrador da equipe
 */
TeamSchema.methods.isAdmin = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    (member.role === 'admin' || member.role === 'captain')
  );
};

/**
 * Método para verificar se um usuário é o capitão da equipe
 */
TeamSchema.methods.isCaptain = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && 
    member.role === 'captain'
  );
};

/**
 * Método para verificar se a equipe está cheia
 */
TeamSchema.methods.isFull = function() {
  return this.members.length >= this.maxSize;
};

/**
 * Método para verificar se a equipe está participando de uma competição
 */
TeamSchema.methods.isInCompetition = function(competitionId) {
  return this.competitions.some(comp => 
    comp.competition.toString() === competitionId.toString()
  );
};

/**
 * Método para adicionar um membro à equipe
 */
TeamSchema.methods.addMember = function(userId, role = 'member') {
  // Verificar se o usuário já é membro
  if (this.isMember(userId)) {
    return false;
  }
  
  // Verificar se a equipe está cheia
  if (this.isFull()) {
    return false;
  }
  
  // Adicionar membro
  this.members.push({
    user: userId,
    role,
    contribution: 0
  });
  
  return true;
};

/**
 * Método para remover um membro da equipe
 */
TeamSchema.methods.removeMember = function(userId) {
  // Verificar se o usuário é membro
  if (!this.isMember(userId)) {
    return false;
  }
  
  // Verificar se o usuário é o capitão
  if (this.isCaptain(userId)) {
    // Não permitir remover o capitão
    return false;
  }
  
  // Remover membro
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  
  return true;
};

/**
 * Método para atualizar estatísticas da equipe
 */
TeamSchema.methods.updateStatistics = async function() {
  // Implementação depende da lógica de negócio específica
  // Geralmente envolve consultas ao banco de dados para agregar atividades dos membros
};

/**
 * Método para criar um convite
 */
TeamSchema.methods.createInvitation = function(email, expiresInHours = 48) {
  // Verificar se já existe um convite pendente para este email
  const existingInvitation = this.invitations.find(inv => 
    inv.email === email && inv.status === 'pending'
  );
  
  if (existingInvitation) {
    return existingInvitation;
  }
  
  // Gerar código de convite
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Calcular data de expiração
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
  // Criar convite
  const invitation = {
    email,
    code,
    expiresAt,
    status: 'pending'
  };
  
  this.invitations.push(invitation);
  
  return invitation;
};

// Criar índices
TeamSchema.index({ name: 'text', description: 'text' });
TeamSchema.index({ 'members.user': 1 });
TeamSchema.index({ createdBy: 1 });
TeamSchema.index({ 'invitations.email': 1, 'invitations.status': 1 });
TeamSchema.index({ 'competitions.competition': 1 });

// Exportar modelo
module.exports = mongoose.model('Team', TeamSchema);
