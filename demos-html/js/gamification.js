/**
 * FUSEtech Gamification Controller
 * Gerencia sistema de conquistas, badges e gamificação
 */

class GamificationController {
  constructor() {
    this.achievements = [];
    this.leaderboard = [];
    this.challenges = [];
    this.userLevel = 42;
    this.userXP = 6800;
    this.userRank = 12;

    this.init();
  }

  init() {
    this.loadAchievements();
    this.loadLeaderboard();
    this.loadChallenges();
    this.setupEventListeners();
    this.animateProgressBars();
  }

  /**
   * Carrega conquistas do usuário
   */
  loadAchievements() {
    this.achievements = [
      {
        id: 1,
        title: 'Primeiro Passo',
        description: 'Complete sua primeira atividade',
        icon: 'fas fa-baby',
        tier: 'bronze',
        category: 'distance',
        unlocked: true,
        unlockedDate: '2024-01-15',
        progress: 100,
        maxProgress: 100,
        reward: { type: 'xp', amount: 100 }
      },
      {
        id: 2,
        title: 'Maratonista',
        description: 'Corra um total de 42km',
        icon: 'fas fa-running',
        tier: 'gold',
        category: 'distance',
        unlocked: true,
        unlockedDate: '2024-01-20',
        progress: 100,
        maxProgress: 100,
        reward: { type: 'tokens', amount: 500 }
      },
      {
        id: 3,
        title: 'Sequência de Fogo',
        description: 'Mantenha uma sequência de 30 dias',
        icon: 'fas fa-fire',
        tier: 'diamond',
        category: 'consistency',
        unlocked: false,
        progress: 15,
        maxProgress: 30,
        reward: { type: 'tokens', amount: 1000 }
      },
      {
        id: 4,
        title: 'Velocista',
        description: 'Atinja 20 km/h em uma corrida',
        icon: 'fas fa-tachometer-alt',
        tier: 'silver',
        category: 'speed',
        unlocked: true,
        unlockedDate: '2024-01-18',
        progress: 100,
        maxProgress: 100,
        reward: { type: 'xp', amount: 250 }
      },
      {
        id: 5,
        title: 'Influenciador',
        description: 'Tenha 100 seguidores',
        icon: 'fas fa-users',
        tier: 'platinum',
        category: 'social',
        unlocked: false,
        progress: 67,
        maxProgress: 100,
        reward: { type: 'tokens', amount: 750 }
      },
      {
        id: 6,
        title: 'Lenda do Fitness',
        description: 'Alcance o nível 50',
        icon: 'fas fa-crown',
        tier: 'diamond',
        category: 'special',
        unlocked: false,
        progress: 42,
        maxProgress: 50,
        reward: { type: 'tokens', amount: 2000 }
      }
    ];

    this.renderAchievements();
  }

  /**
   * Carrega leaderboard
   */
  loadLeaderboard() {
    this.leaderboard = [
      {
        rank: 1,
        name: 'Carlos Silva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        points: 15420,
        activities: 89,
        change: 'up'
      },
      {
        rank: 2,
        name: 'Ana Costa',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        points: 14850,
        activities: 76,
        change: 'down'
      },
      {
        rank: 3,
        name: 'Pedro Santos',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        points: 13920,
        activities: 82,
        change: 'up'
      },
      {
        rank: 4,
        name: 'Maria Oliveira',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        points: 12750,
        activities: 65,
        change: 'up'
      },
      {
        rank: 5,
        name: 'João Ferreira',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        points: 11980,
        activities: 71,
        change: 'down'
      }
    ];

    this.renderLeaderboard();
  }

  /**
   * Carrega desafios ativos
   */
  loadChallenges() {
    this.challenges = [
      {
        id: 1,
        title: 'Desafio 100km',
        description: 'Corra 100km neste mês para ganhar tokens extras',
        icon: 'fas fa-route',
        difficulty: 'medium',
        progress: 68,
        maxProgress: 100,
        unit: 'km',
        timeLeft: '12 dias restantes',
        reward: { type: 'tokens', amount: 800 }
      },
      {
        id: 2,
        title: 'Guerreiro do Fim de Semana',
        description: 'Complete atividades em todos os fins de semana deste mês',
        icon: 'fas fa-calendar-week',
        difficulty: 'easy',
        progress: 3,
        maxProgress: 4,
        unit: 'fins de semana',
        timeLeft: '1 fim de semana restante',
        reward: { type: 'xp', amount: 500 }
      },
      {
        id: 3,
        title: 'Velocidade Extrema',
        description: 'Mantenha velocidade média acima de 15 km/h por 30 minutos',
        icon: 'fas fa-bolt',
        difficulty: 'hard',
        progress: 0,
        maxProgress: 1,
        unit: 'sessão',
        timeLeft: '30 dias restantes',
        reward: { type: 'tokens', amount: 1200 }
      }
    ];

    this.renderChallenges();
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Filtros de conquistas
    document.querySelectorAll('.achievement-filter').forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleAchievementFilter(e.target.dataset.category);
      });
    });

    // Clique em conquistas
    document.addEventListener('click', (e) => {
      if (e.target.closest('.achievement-card')) {
        const card = e.target.closest('.achievement-card');
        const achievementId = parseInt(card.dataset.achievementId);
        this.showAchievementDetails(achievementId);
      }
    });
  }

  /**
   * Filtra conquistas por categoria
   */
  handleAchievementFilter(category) {
    // Atualiza UI dos filtros
    document.querySelectorAll('.achievement-filter').forEach(btn => {
      btn.classList.remove('active');
    });

    const activeButton = document.querySelector(`[data-category="${category}"]`);
    activeButton.classList.add('active');

    // Filtra conquistas
    const filteredAchievements = category === 'all'
      ? this.achievements
      : this.achievements.filter(achievement => achievement.category === category);

    this.renderAchievements(filteredAchievements);
  }

  /**
   * Renderiza conquistas
   */
  renderAchievements(achievementsToRender = this.achievements) {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    container.innerHTML = achievementsToRender.map(achievement =>
      this.createAchievementCard(achievement)
    ).join('');

    // Anima entrada dos cards
    setTimeout(() => {
      container.querySelectorAll('.achievement-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }, 100);
  }

  /**
   * Cria card de conquista
   */
  createAchievementCard(achievement) {
    const isUnlocked = achievement.unlocked;
    const progressPercent = (achievement.progress / achievement.maxProgress) * 100;

    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" data-achievement-id="${achievement.id}">
        <div class="achievement-badge ${achievement.tier} ${isUnlocked ? '' : 'locked'}">
          <i class="${achievement.icon}"></i>
        </div>

        <h3 class="achievement-title">${achievement.title}</h3>
        <p class="achievement-description">${achievement.description}</p>

        ${!isUnlocked ? `
          <div class="achievement-progress">
            <div class="achievement-progress-bar">
              <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="achievement-progress-text">
              ${achievement.progress}/${achievement.maxProgress} ${achievement.unit || ''}
            </div>
          </div>
        ` : ''}

        <div class="achievement-reward">
          <i class="fas fa-${achievement.reward.type === 'tokens' ? 'coins' : 'star'}"></i>
          <span>+${achievement.reward.amount} ${achievement.reward.type === 'tokens' ? 'FUSE' : 'XP'}</span>
        </div>

        ${isUnlocked ? `
          <div class="achievement-unlock-date">
            Desbloqueado em ${new Date(achievement.unlockedDate).toLocaleDateString('pt-BR')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Renderiza leaderboard
   */
  renderLeaderboard() {
    const container = document.getElementById('leaderboard-list');
    if (!container) return;

    container.innerHTML = this.leaderboard.map(user =>
      this.createLeaderboardItem(user)
    ).join('');
  }

  /**
   * Cria item do leaderboard
   */
  createLeaderboardItem(user) {
    const rankClass = user.rank === 1 ? 'first' : user.rank === 2 ? 'second' : user.rank === 3 ? 'third' : 'other';
    const isCurrentUser = user.rank === this.userRank;

    return `
      <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
        <div class="leaderboard-rank ${rankClass}">
          ${user.rank <= 3 ? `<i class="fas fa-${user.rank === 1 ? 'crown' : user.rank === 2 ? 'medal' : 'award'}"></i>` : user.rank}
        </div>

        <img src="${user.avatar}" alt="${user.name}" class="leaderboard-avatar">

        <div class="leaderboard-info">
          <div class="leaderboard-name">${user.name}</div>
          <div class="leaderboard-stats">${user.activities} atividades</div>
        </div>

        <div class="leaderboard-score">
          <div class="leaderboard-points">${user.points.toLocaleString()}</div>
          <div class="leaderboard-change ${user.change}">
            <i class="fas fa-arrow-${user.change === 'up' ? 'up' : 'down'}"></i>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza desafios
   */
  renderChallenges() {
    const container = document.getElementById('active-challenges');
    if (!container) return;

    container.innerHTML = this.challenges.map(challenge =>
      this.createChallengeCard(challenge)
    ).join('');
  }

  /**
   * Cria card de desafio
   */
  createChallengeCard(challenge) {
    const progressPercent = (challenge.progress / challenge.maxProgress) * 100;

    return `
      <div class="challenge-card">
        <div class="challenge-header">
          <div class="challenge-icon">
            <i class="${challenge.icon}"></i>
          </div>
          <div class="challenge-difficulty ${challenge.difficulty}">
            ${challenge.difficulty}
          </div>
        </div>

        <h3 class="challenge-title">${challenge.title}</h3>
        <p class="challenge-description">${challenge.description}</p>

        <div class="challenge-progress">
          <div class="challenge-progress-bar">
            <div class="challenge-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
          <div class="challenge-progress-text">
            ${challenge.progress}/${challenge.maxProgress} ${challenge.unit}
          </div>
        </div>

        <div class="challenge-footer">
          <div class="challenge-reward">
            <i class="fas fa-${challenge.reward.type === 'tokens' ? 'coins' : 'star'}"></i>
            <span>+${challenge.reward.amount} ${challenge.reward.type === 'tokens' ? 'FUSE' : 'XP'}</span>
          </div>
          <div class="challenge-time">${challenge.timeLeft}</div>
        </div>
      </div>
    `;
  }

  /**
   * Anima barras de progresso
   */
  animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill, .achievement-progress-fill, .challenge-progress-fill');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const targetWidth = bar.style.width || '0%';

          bar.style.width = '0%';
          setTimeout(() => {
            bar.style.width = targetWidth;
          }, 200);

          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });

    progressBars.forEach(bar => observer.observe(bar));
  }

  /**
   * Mostra detalhes da conquista
   */
  showAchievementDetails(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-md w-full">
        <div class="text-center mb-6">
          <div class="achievement-badge ${achievement.tier} ${achievement.unlocked ? '' : 'locked'} mx-auto mb-4">
            <i class="${achievement.icon}"></i>
          </div>
          <h3 class="text-xl font-bold mb-2">${achievement.title}</h3>
          <p class="text-gray-600">${achievement.description}</p>
        </div>

        ${!achievement.unlocked ? `
          <div class="mb-6">
            <div class="achievement-progress-bar mb-2">
              <div class="achievement-progress-fill" style="width: ${(achievement.progress / achievement.maxProgress) * 100}%"></div>
            </div>
            <div class="text-center text-sm text-gray-500">
              ${achievement.progress}/${achievement.maxProgress} ${achievement.unit || ''}
            </div>
          </div>
        ` : `
          <div class="text-center mb-6">
            <div class="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <i class="fas fa-check"></i>
              Desbloqueado em ${new Date(achievement.unlockedDate).toLocaleDateString('pt-BR')}
            </div>
          </div>
        `}

        <div class="text-center mb-6">
          <div class="achievement-reward inline-flex">
            <i class="fas fa-${achievement.reward.type === 'tokens' ? 'coins' : 'star'}"></i>
            <span>+${achievement.reward.amount} ${achievement.reward.type === 'tokens' ? 'FUSE' : 'XP'}</span>
          </div>
        </div>

        <button class="btn btn-primary w-full" onclick="this.parentElement.parentElement.remove()">
          Fechar
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    // Anima entrada
    setTimeout(() => {
      modal.querySelector('div').style.transform = 'scale(1)';
      modal.querySelector('div').style.opacity = '1';
    }, 10);
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.gamificationController = new GamificationController();
});

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GamificationController;
}
