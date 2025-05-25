/**
 * Modelo de Competição
 * 
 * Este modelo representa uma competição no sistema, que pode ser
 * individual, em equipe ou um desafio com objetivo específico.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema para participantes de uma competição
 */
const CompetitionParticipantSchema = new Schema({
  // Referência ao usuário
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Data de entrada na competição
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // Pontuação atual
  score: {
    type: Number,
    default: 0
  },
  
  // Progresso (para competições com objetivo)
  progress: {
    type: Number,
    default: 0
  },
  
  // Posição no ranking
  rank: {
    type: Number,
    default: 0
  },
  
  // Histórico de pontuação
  history: [{
    date: {
      type: Date,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    progress: {
      type: Number
    },
    activities: [{
      type: Schema.Types.ObjectId,
      ref: 'Activity'
    }]
  }],
  
  // Status de conclusão
  completed: {
    type: Boolean,
    default: false
  },
  
  // Data de conclusão
  completedAt: {
    type: Date
  }
});

/**
 * Schema para equipes em competições
 */
const CompetitionTeamSchema = new Schema({
  // Nome da equipe
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Descrição da equipe
  description: {
    type: String,
    trim: true
  },
  
  // Membros da equipe
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    contribution: {
      type: Number,
      default: 0
    }
  }],
  
  // Pontuação da equipe
  score: {
    type: Number,
    default: 0
  },
  
  // Progresso da equipe
  progress: {
    type: Number,
    default: 0
  },
  
  // Posição no ranking
  rank: {
    type: Number,
    default: 0
  }
});

/**
 * Schema para recompensas
 */
const RewardSchema = new Schema({
  // Tipo de recompensa
  type: {
    type: String,
    enum: ['points', 'badge', 'achievement', 'virtual_item', 'physical_item'],
    required: true
  },
  
  // Nome da recompensa
  name: {
    type: String,
    required: true
  },
  
  // Descrição da recompensa
  description: {
    type: String
  },
  
  // Valor da recompensa (para pontos)
  value: {
    type: Number
  },
  
  // Imagem da recompensa (para badges)
  image: {
    type: String
  }
});

/**
 * Schema principal da competição
 */
const CompetitionSchema = new Schema({
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
  
  // Tipo de competição
  type: {
    type: String,
    required: true,
    enum: ['individual', 'team', 'challenge'],
    default: 'individual'
  },
  
  // Tipo de métrica
  leagueType: {
    type: String,
    required: true,
    enum: ['distance', 'elevation', 'duration', 'calories', 'frequency', 'streak'],
    default: 'distance'
  },
  
  // Duração da competição
  duration: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'],
    default: 'weekly'
  },
  
  // Período de atividade
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  // Status da competição
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Tipos de atividade permitidos
  activityTypes: [{
    type: String,
    enum: ['running', 'cycling', 'walking', 'swimming', 'hiking', 'workout']
  }],
  
  // Objetivo (para competições do tipo 'challenge')
  goal: {
    value: {
      type: Number
    },
    unit: {
      type: String
    }
  },
  
  // Regras da competição
  rules: {
    // Pontuação mínima para participar
    minScore: {
      type: Number,
      default: 0
    },
    
    // Número máximo de participantes
    maxParticipants: {
      type: Number
    },
    
    // Número máximo de membros por equipe (para competições em equipe)
    maxTeamSize: {
      type: Number
    },
    
    // Privacidade
    isPrivate: {
      type: Boolean,
      default: false
    },
    
    // Código de acesso (para competições privadas)
    accessCode: {
      type: String
    },
    
    // Multiplicadores de pontuação por tipo de atividade
    multipliers: {
      running: {
        type: Number,
        default: 1.0
      },
      cycling: {
        type: Number,
        default: 1.0
      },
      walking: {
        type: Number,
        default: 1.0
      },
      swimming: {
        type: Number,
        default: 1.0
      },
      hiking: {
        type: Number,
        default: 1.0
      },
      workout: {
        type: Number,
        default: 1.0
      }
    }
  },
  
  // Participantes (para competições individuais e desafios)
  participants: [CompetitionParticipantSchema],
  
  // Equipes (para competições em equipe)
  teams: [CompetitionTeamSchema],
  
  // Recompensas
  rewards: [RewardSchema],
  
  // Liga relacionada (opcional)
  league: {
    type: Schema.Types.ObjectId,
    ref: 'League'
  },
  
  // Criador da competição
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Administradores da competição
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
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
CompetitionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Método para calcular pontuação de uma atividade
 */
CompetitionSchema.methods.calculateActivityScore = function(activity) {
  // Verificar se o tipo de atividade é permitido
  if (this.activityTypes.length > 0 && !this.activityTypes.includes(activity.type)) {
    return 0;
  }
  
  // Obter multiplicador para o tipo de atividade
  const multiplier = this.rules.multipliers[activity.type] || 1.0;
  
  // Calcular pontuação com base no tipo de métrica
  let score = 0;
  
  switch (this.leagueType) {
    case 'distance':
      // Pontuação baseada na distância (em km)
      score = activity.distance * multiplier;
      break;
      
    case 'elevation':
      // Pontuação baseada no ganho de elevação (em metros)
      score = activity.elevationGain * multiplier;
      break;
      
    case 'duration':
      // Pontuação baseada na duração (em minutos)
      score = (activity.duration / 60) * multiplier;
      break;
      
    case 'calories':
      // Pontuação baseada nas calorias queimadas
      score = activity.calories * multiplier;
      break;
      
    case 'frequency':
      // Pontuação fixa por atividade
      score = 1 * multiplier;
      break;
      
    case 'streak':
      // Pontuação baseada na sequência de dias
      // Implementação depende da lógica de sequência
      score = 1 * multiplier;
      break;
  }
  
  return Math.round(score * 100) / 100;
};

/**
 * Método para calcular progresso em um desafio
 */
CompetitionSchema.methods.calculateProgress = function(userId) {
  // Verificar se é um desafio
  if (this.type !== 'challenge' || !this.goal || !this.goal.value) {
    return null;
  }
  
  // Encontrar participante
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  
  if (!participant) {
    return null;
  }
  
  // Calcular porcentagem de progresso
  const progress = (participant.score / this.goal.value) * 100;
  
  // Limitar a 100%
  return Math.min(100, progress);
};

/**
 * Método para atualizar rankings
 */
CompetitionSchema.methods.updateRankings = function() {
  if (this.type === 'individual' || this.type === 'challenge') {
    // Ordenar participantes por pontuação (decrescente)
    this.participants.sort((a, b) => b.score - a.score);
    
    // Atualizar ranks
    this.participants.forEach((participant, index) => {
      participant.rank = index + 1;
    });
  } else if (this.type === 'team') {
    // Ordenar equipes por pontuação (decrescente)
    this.teams.sort((a, b) => b.score - a.score);
    
    // Atualizar ranks
    this.teams.forEach((team, index) => {
      team.rank = index + 1;
    });
  }
};

/**
 * Método para verificar se a competição está ativa
 */
CompetitionSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
};

/**
 * Método para verificar se um usuário é participante da competição
 */
CompetitionSchema.methods.isParticipant = function(userId) {
  if (this.type === 'individual' || this.type === 'challenge') {
    return this.participants.some(p => p.user.toString() === userId.toString());
  } else if (this.type === 'team') {
    return this.teams.some(team => 
      team.members.some(member => member.user.toString() === userId.toString())
    );
  }
  return false;
};

/**
 * Método para verificar se um usuário é administrador da competição
 */
CompetitionSchema.methods.isAdmin = function(userId) {
  return this.admins.some(admin => admin.toString() === userId.toString()) || 
         this.createdBy.toString() === userId.toString();
};

// Criar índices
CompetitionSchema.index({ name: 'text', description: 'text' });
CompetitionSchema.index({ status: 1, startDate: 1, endDate: 1 });
CompetitionSchema.index({ 'participants.user': 1 });
CompetitionSchema.index({ 'teams.members.user': 1 });
CompetitionSchema.index({ createdBy: 1 });
CompetitionSchema.index({ league: 1 });

// Exportar modelo
module.exports = mongoose.model('Competition', CompetitionSchema);
