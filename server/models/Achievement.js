/**
 * Modelo de Conquista
 * 
 * Este modelo representa uma conquista no sistema, com informações sobre
 * critérios, recompensas e progresso.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Schema para critérios de conquista
 */
const AchievementCriteriaSchema = new Schema({
  // Tipo de critério
  type: {
    type: String,
    enum: [
      'distance_total', 'distance_single', 
      'elevation_total', 'elevation_single',
      'duration_total', 'duration_single',
      'activity_count', 'activity_streak',
      'league_join', 'league_win',
      'competition_join', 'competition_win',
      'team_join', 'team_create',
      'social_share', 'social_invite',
      'custom'
    ],
    required: true
  },
  
  // Valor alvo para o critério
  target: {
    type: Number,
    required: true
  },
  
  // Unidade de medida (km, m, min, etc.)
  unit: {
    type: String
  },
  
  // Tipo de atividade (se aplicável)
  activityType: {
    type: String,
    enum: ['running', 'cycling', 'walking', 'swimming', 'hiking', 'workout', 'any']
  },
  
  // Período de tempo (se aplicável)
  timeFrame: {
    type: String,
    enum: ['day', 'week', 'month', 'year', 'all_time']
  },
  
  // Parâmetros adicionais (JSON)
  params: {
    type: Schema.Types.Mixed
  }
});

/**
 * Schema para recompensas de conquista
 */
const AchievementRewardSchema = new Schema({
  // Tipo de recompensa
  type: {
    type: String,
    enum: ['points', 'badge', 'token', 'discount', 'physical', 'custom'],
    required: true
  },
  
  // Valor da recompensa
  value: {
    type: Number
  },
  
  // Descrição da recompensa
  description: {
    type: String
  },
  
  // Imagem da recompensa
  image: {
    type: String
  },
  
  // Código de resgate (para recompensas físicas)
  code: {
    type: String
  },
  
  // Data de expiração (se aplicável)
  expiresAt: {
    type: Date
  }
});

/**
 * Schema principal da conquista
 */
const AchievementSchema = new Schema({
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
  
  // Ícone da conquista
  icon: {
    type: String
  },
  
  // Imagem de fundo
  background: {
    type: String
  },
  
  // Categoria da conquista
  category: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'elite', 'special', 'seasonal', 'challenge'],
    default: 'beginner'
  },
  
  // Nível de dificuldade
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  
  // Visibilidade da conquista
  visibility: {
    type: String,
    enum: ['visible', 'hidden', 'secret'],
    default: 'visible'
  },
  
  // Critérios para desbloquear a conquista
  criteria: [AchievementCriteriaSchema],
  
  // Recompensas por desbloquear a conquista
  rewards: [AchievementRewardSchema],
  
  // Conquistas relacionadas
  relatedAchievements: [{
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  
  // Conquista necessária para desbloquear esta
  prerequisite: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  
  // Disponibilidade temporal
  availability: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    isLimited: {
      type: Boolean,
      default: false
    }
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
 * Schema para progresso de conquista do usuário
 */
const UserAchievementSchema = new Schema({
  // Referência ao usuário
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Referência à conquista
  achievement: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  
  // Status da conquista
  status: {
    type: String,
    enum: ['locked', 'in_progress', 'completed'],
    default: 'locked'
  },
  
  // Progresso atual para cada critério
  progress: [{
    criteriaIndex: {
      type: Number,
      required: true
    },
    currentValue: {
      type: Number,
      default: 0
    },
    targetValue: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date
    }
  }],
  
  // Data de desbloqueio
  unlockedAt: {
    type: Date
  },
  
  // Recompensas reivindicadas
  claimedRewards: [{
    rewardIndex: {
      type: Number,
      required: true
    },
    claimedAt: {
      type: Date,
      default: Date.now
    }
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
AchievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

UserAchievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Método para verificar se a conquista está disponível
 */
AchievementSchema.methods.isAvailable = function() {
  // Se não tiver restrição de disponibilidade
  if (!this.availability.isLimited) {
    return true;
  }
  
  const now = new Date();
  
  // Verificar data de início
  if (this.availability.startDate && now < this.availability.startDate) {
    return false;
  }
  
  // Verificar data de término
  if (this.availability.endDate && now > this.availability.endDate) {
    return false;
  }
  
  return true;
};

/**
 * Método para verificar se todos os critérios foram atendidos
 */
UserAchievementSchema.methods.isCompleted = function() {
  // Verificar se todos os critérios foram atendidos
  return this.progress.every(p => p.currentValue >= p.targetValue);
};

/**
 * Método para calcular porcentagem de progresso
 */
UserAchievementSchema.methods.getProgressPercentage = function() {
  if (this.progress.length === 0) {
    return 0;
  }
  
  // Calcular progresso total
  const totalProgress = this.progress.reduce((sum, p) => {
    const percentage = Math.min(100, (p.currentValue / p.targetValue) * 100);
    return sum + percentage;
  }, 0);
  
  // Calcular média
  return totalProgress / this.progress.length;
};

/**
 * Método para atualizar progresso
 */
UserAchievementSchema.methods.updateProgress = function(criteriaIndex, value) {
  // Encontrar o critério
  const progressItem = this.progress.find(p => p.criteriaIndex === criteriaIndex);
  
  if (!progressItem) {
    return false;
  }
  
  // Atualizar valor atual
  progressItem.currentValue = value;
  
  // Verificar se o critério foi completado
  if (progressItem.currentValue >= progressItem.targetValue && !progressItem.completedAt) {
    progressItem.completedAt = new Date();
  }
  
  // Verificar se todos os critérios foram atendidos
  if (this.isCompleted() && this.status !== 'completed') {
    this.status = 'completed';
    this.unlockedAt = new Date();
  } else if (!this.isCompleted() && this.status !== 'in_progress') {
    this.status = 'in_progress';
  }
  
  return true;
};

// Criar índices
AchievementSchema.index({ name: 'text', description: 'text' });
AchievementSchema.index({ category: 1, difficulty: 1 });
AchievementSchema.index({ 'availability.startDate': 1, 'availability.endDate': 1 });

UserAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
UserAchievementSchema.index({ user: 1, status: 1 });
UserAchievementSchema.index({ achievement: 1, status: 1 });

// Exportar modelos
const Achievement = mongoose.model('Achievement', AchievementSchema);
const UserAchievement = mongoose.model('UserAchievement', UserAchievementSchema);

module.exports = {
  Achievement,
  UserAchievement
};
