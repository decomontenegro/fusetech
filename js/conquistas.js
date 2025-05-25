/**
 * Script para a página de conquistas
 */

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de conquistas
  if (document.body.getAttribute('data-page') === 'achievements') {
    // Inicializar componentes
    initAchievementsPage();
  }
});

/**
 * Inicializar página de conquistas
 */
function initAchievementsPage() {
  // Verificar se o serviço de gamificação está disponível
  if (typeof gamification === 'undefined') {
    console.error('Serviço de gamificação não encontrado');
    return;
  }
  
  // Atualizar informações de nível
  updateLevelInfo();
  
  // Renderizar conquistas
  renderAchievements();
  
  // Configurar tabs
  setupTabs();
  
  // Configurar filtro
  setupFilter();
}

/**
 * Atualizar informações de nível
 */
function updateLevelInfo() {
  // Obter elementos
  const currentLevelEl = document.getElementById('current-level');
  const levelNameEl = document.getElementById('level-name');
  const levelIconEl = document.getElementById('level-icon');
  const currentXpEl = document.getElementById('current-xp');
  const nextLevelXpEl = document.getElementById('next-level-xp');
  const xpProgressEl = document.getElementById('xp-progress');
  
  // Obter informações de nível
  const currentLevel = gamification.getCurrentLevel();
  const nextLevel = gamification.getNextLevel();
  const levelProgress = gamification.getLevelProgress();
  
  // Atualizar elementos
  if (currentLevel) {
    currentLevelEl.textContent = currentLevel.level;
    levelNameEl.textContent = currentLevel.name;
    
    // Atualizar ícone
    levelIconEl.className = `fas ${currentLevel.icon} text-3xl`;
    levelIconEl.style.color = currentLevel.color;
  }
  
  // Atualizar XP
  currentXpEl.textContent = levelProgress.current;
  nextLevelXpEl.textContent = levelProgress.required;
  
  // Atualizar barra de progresso
  xpProgressEl.style.width = `${levelProgress.percentage}%`;
}

/**
 * Renderizar conquistas
 */
function renderAchievements() {
  // Obter conquistas
  const userAchievements = gamification.getUserAchievements();
  const availableAchievements = gamification.getAvailableAchievements();
  const allAchievements = [...userAchievements, ...availableAchievements];
  
  // Obter estatísticas do usuário
  const userStats = gamification.getUserStats();
  
  // Renderizar todas as conquistas
  renderAchievementsByType('all', allAchievements, userStats);
  
  // Renderizar conquistas por categoria
  renderAchievementsByType('distance', filterAchievementsByCategory('distance', allAchievements), userStats);
  renderAchievementsByType('activities', filterAchievementsByCategory('activities', allAchievements), userStats);
  renderAchievementsByType('challenges', filterAchievementsByCategory('challenges', allAchievements), userStats);
  renderAchievementsByType('social', filterAchievementsByCategory('social', allAchievements), userStats);
}

/**
 * Filtrar conquistas por categoria
 * @param {String} category - Categoria
 * @param {Array} achievements - Lista de conquistas
 * @returns {Array} - Conquistas filtradas
 */
function filterAchievementsByCategory(category, achievements) {
  const categoryMap = {
    'distance': ['distance_10km', 'distance_50km', 'distance_100km', 'distance_500km'],
    'activities': ['first_activity', 'activities_10', 'activities_50', 'activities_100', 'streak_7', 'streak_30', 'activity_types_3', 'activity_types_5'],
    'challenges': ['challenge_complete_1', 'challenge_complete_5', 'challenge_complete_10'],
    'social': ['social_share_1', 'social_share_10', 'device_connect_1']
  };
  
  const categoryIds = categoryMap[category] || [];
  
  return achievements.filter(achievement => categoryIds.includes(achievement.id));
}

/**
 * Renderizar conquistas por tipo
 * @param {String} type - Tipo de conquista
 * @param {Array} achievements - Lista de conquistas
 * @param {Object} userStats - Estatísticas do usuário
 */
function renderAchievementsByType(type, achievements, userStats) {
  // Obter container
  const container = document.getElementById(`content-${type}`);
  
  if (!container) return;
  
  // Criar grid
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
  
  // Verificar se há conquistas
  if (achievements.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'col-span-full text-center py-8';
    emptyMessage.innerHTML = `
      <div class="text-gray-400 mb-2">
        <i class="fas fa-medal text-3xl"></i>
      </div>
      <p class="text-gray-500">Nenhuma conquista encontrada nesta categoria</p>
    `;
    
    grid.appendChild(emptyMessage);
  } else {
    // Ordenar conquistas (desbloqueadas primeiro)
    achievements.sort((a, b) => {
      const aUnlocked = gamification.currentUser.achievements.includes(a.id);
      const bUnlocked = gamification.currentUser.achievements.includes(b.id);
      
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;
      
      return 0;
    });
    
    // Renderizar cada conquista
    achievements.forEach(achievement => {
      const isUnlocked = gamification.currentUser.achievements.includes(achievement.id);
      
      // Calcular progresso
      let progress = 0;
      let progressText = '';
      
      if (!isUnlocked && achievement.condition) {
        // Extrair valores para cálculo de progresso
        if (achievement.id.startsWith('distance_')) {
          const target = parseInt(achievement.id.replace('distance_', ''));
          progress = Math.min(100, Math.round((userStats.totalDistance / target) * 100));
          progressText = `${userStats.totalDistance}/${target} km`;
        } else if (achievement.id.startsWith('activities_')) {
          const target = parseInt(achievement.id.replace('activities_', ''));
          progress = Math.min(100, Math.round((userStats.totalActivities / target) * 100));
          progressText = `${userStats.totalActivities}/${target} atividades`;
        } else if (achievement.id.startsWith('streak_')) {
          const target = parseInt(achievement.id.replace('streak_', ''));
          progress = Math.min(100, Math.round((userStats.currentStreak / target) * 100));
          progressText = `${userStats.currentStreak}/${target} dias`;
        } else if (achievement.id.startsWith('challenge_complete_')) {
          const target = parseInt(achievement.id.replace('challenge_complete_', ''));
          progress = Math.min(100, Math.round((userStats.completedChallenges / target) * 100));
          progressText = `${userStats.completedChallenges}/${target} desafios`;
        } else if (achievement.id.startsWith('social_share_')) {
          const target = parseInt(achievement.id.replace('social_share_', ''));
          progress = Math.min(100, Math.round((userStats.totalShares / target) * 100));
          progressText = `${userStats.totalShares}/${target} compartilhamentos`;
        } else if (achievement.id.startsWith('activity_types_')) {
          const target = parseInt(achievement.id.replace('activity_types_', ''));
          progress = Math.min(100, Math.round((userStats.activityTypes / target) * 100));
          progressText = `${userStats.activityTypes}/${target} tipos`;
        } else if (achievement.id === 'device_connect_1') {
          progress = Math.min(100, userStats.connectedDevices * 100);
          progressText = `${userStats.connectedDevices}/1 dispositivo`;
        } else if (achievement.id === 'first_activity') {
          progress = Math.min(100, userStats.totalActivities * 100);
          progressText = `${userStats.totalActivities}/1 atividade`;
        }
      }
      
      // Criar card
      const card = document.createElement('div');
      card.className = 'achievement-card bg-white shadow rounded-lg overflow-hidden';
      card.innerHTML = `
        <div class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style="background-color: ${achievement.color}20;">
              <i class="fas ${achievement.icon} text-xl" style="color: ${achievement.color};"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">${achievement.name}</h3>
              <p class="text-sm text-gray-500">${achievement.description}</p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex justify-between items-center">
              <span class="text-xs font-medium" style="color: ${achievement.color};">+${achievement.xp} XP</span>
              ${isUnlocked 
                ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <i class="fas fa-check-circle mr-1"></i> Desbloqueada
                  </span>`
                : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <i class="fas fa-lock mr-1"></i> Bloqueada
                  </span>`
              }
            </div>
            ${!isUnlocked && progress > 0 ? `
              <div class="mt-2">
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full" style="width: ${progress}%; background-color: ${achievement.color};"></div>
                </div>
                <div class="mt-1 text-xs text-gray-500 text-right">${progressText}</div>
              </div>
            ` : ''}
          </div>
        </div>
      `;
      
      grid.appendChild(card);
    });
  }
  
  // Limpar e adicionar grid
  container.innerHTML = '';
  container.appendChild(grid);
}

/**
 * Configurar tabs
 */
function setupTabs() {
  // Obter botões de tab
  const tabButtons = document.querySelectorAll('.tab-button');
  
  // Adicionar evento de clique
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remover classe active de todos os botões
      tabButtons.forEach(btn => {
        btn.classList.remove('active', 'border-primary', 'text-primary');
        btn.classList.add('border-transparent', 'text-gray-500');
      });
      
      // Adicionar classe active ao botão clicado
      this.classList.add('active', 'border-primary', 'text-primary');
      this.classList.remove('border-transparent', 'text-gray-500');
      
      // Obter ID do conteúdo
      const contentId = this.id.replace('tab-', 'content-');
      
      // Esconder todos os conteúdos
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Mostrar conteúdo correspondente
      document.getElementById(contentId).classList.add('active');
    });
  });
}

/**
 * Configurar filtro
 */
function setupFilter() {
  // Obter elemento de filtro
  const filterSelect = document.getElementById('achievement-filter');
  
  if (!filterSelect) return;
  
  // Adicionar evento de alteração
  filterSelect.addEventListener('change', function() {
    const filter = this.value;
    
    // Obter todos os cards de conquista
    const cards = document.querySelectorAll('.achievement-card');
    
    // Aplicar filtro
    cards.forEach(card => {
      const isUnlocked = card.querySelector('.bg-green-100') !== null;
      
      if (filter === 'all' || 
          (filter === 'unlocked' && isUnlocked) || 
          (filter === 'locked' && !isUnlocked)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
}
