/**
 * Modelo de Liga
 * 
 * Este modelo representa uma liga no sistema, com informações sobre
 * participantes, regras, período de atividade e métricas.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema para membros de uma liga
 */
const LeagueMemberSchema = new Schema({
  // Referência ao usuário
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Data de entrada na liga
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // Pontuação atual
  score: {
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
    activities: [{
      type: Schema.Types.ObjectId,
      ref: 'Activity'
    }]
  }],
  
  // Conquistas na liga
  achievements: [{
    type: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    value: Number
  }]
});

/**
 * Schema principal da liga
 */
const LeagueSchema = new Schema({
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
  
  // Tipo de liga (distância, elevação, duração, calorias, frequência, sequência)
  type: {
    type: String,
    required: true,
    enum: ['distance', 'elevation', 'duration', 'calories', 'frequency', 'streak'],
    default: 'distance'
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
  
  // Status da liga
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Tipos de atividade permitidos
  activityTypes: [{
    type: String,
    enum: ['running', 'cycling', 'walking', 'swimming', 'hiking', 'workout']
  }],
  
  // Regras da liga
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
    
    // Privacidade
    isPrivate: {
      type: Boolean,
      default: false
    },
    
    // Código de acesso (para ligas privadas)
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
  
  // Membros da liga
  members: [LeagueMemberSchema],
  
  // Criador da liga
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Administradores da liga
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
LeagueSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Método para calcular pontuação de uma atividade
 */
LeagueSchema.methods.calculateActivityScore = function(activity) {
  // Verificar se o tipo de atividade é permitido
  if (this.activityTypes.length > 0 && !this.activityTypes.includes(activity.type)) {
    return 0;
  }
  
  // Obter multiplicador para o tipo de atividade
  const multiplier = this.rules.multipliers[activity.type] || 1.0;
  
  // Calcular pontuação com base no tipo de liga
  let score = 0;
  
  switch (this.type) {
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
 * Método para atualizar rankings
 */
LeagueSchema.methods.updateRankings = function() {
  // Ordenar membros por pontuação (decrescente)
  this.members.sort((a, b) => b.score - a.score);
  
  // Atualizar ranks
  this.members.forEach((member, index) => {
    member.rank = index + 1;
  });
};

/**
 * Método para verificar se a liga está ativa
 */
LeagueSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
};

/**
 * Método para verificar se um usuário é membro da liga
 */
LeagueSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

/**
 * Método para verificar se um usuário é administrador da liga
 */
LeagueSchema.methods.isAdmin = function(userId) {
  return this.admins.some(admin => admin.toString() === userId.toString()) || 
         this.createdBy.toString() === userId.toString();
};

// Criar índices
LeagueSchema.index({ name: 'text', description: 'text' });
LeagueSchema.index({ status: 1, startDate: 1, endDate: 1 });
LeagueSchema.index({ 'members.user': 1 });
LeagueSchema.index({ createdBy: 1 });

// Exportar modelo
module.exports = mongoose.model('League', LeagueSchema);
