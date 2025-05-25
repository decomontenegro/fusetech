/**
 * Script para gerenciar a página de ligas e competições
 *
 * Este script gerencia a interface de usuário para visualizar, entrar e sair
 * de ligas e competições no FuseLabs.
 */

// Variáveis do sistema de ligas
let tabButtons, tabContents;
let myLeaguesContent, availableLeaguesContent, myCompetitionsContent, availableCompetitionsContent;
let createCompetitionButton, closeCompetitionModal, createCompetitionSubmit;
let detailsModal, detailsModalContent;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  // Obter elementos
  tabButtons = document.querySelectorAll('.tab-button');
  tabContents = document.querySelectorAll('.tab-content');

  myLeaguesContent = document.getElementById('content-my-leagues');
  availableLeaguesContent = document.getElementById('content-available-leagues');
  myCompetitionsContent = document.getElementById('content-my-competitions');
  availableCompetitionsContent = document.getElementById('content-available-competitions');

  createCompetitionButton = document.getElementById('create-competition-button');
  closeCompetitionModal = document.getElementById('close-competition-modal');
  createCompetitionSubmit = document.getElementById('create-competition-submit');

  detailsModal = document.getElementById('details-modal');
  detailsModalContent = document.getElementById('details-modal-content');

  // Verificar se o sistema de ligas está disponível
  if (!window.leagueSystem) {
    showError('Sistema de ligas não disponível');
    return;
  }

  // Inicializar sistema
  initLeagueSystem();

  // Adicionar event listeners
  addEventListeners();
});

/**
 * Inicializar sistema de ligas
 */
async function initLeagueSystem() {
  try {
    // Verificar se o sistema já foi inicializado
    if (window.leagueSystem.state && window.leagueSystem.state.initialized) {
      console.log('Sistema de ligas já inicializado');

      // Carregar dados
      loadMyLeagues();
      loadAvailableLeagues();
      loadMyCompetitions();
      loadAvailableCompetitions();

      return;
    }

    // Inicializar sistema
    await window.leagueSystem.init();

    console.log('Sistema de ligas inicializado');

    // Carregar dados
    loadMyLeagues();
    loadAvailableLeagues();
    loadMyCompetitions();
    loadAvailableCompetitions();
  } catch (error) {
    console.error('Erro ao inicializar sistema de ligas:', error);
    showError('Erro ao inicializar sistema de ligas');
  }
}

/**
 * Adicionar event listeners
 */
function addEventListeners() {
  // Event listeners para tabs
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.id.replace('tab-', '');
      switchTab(tabId);
    });
  });

  // Event listeners para modais
  if (createCompetitionButton) {
    createCompetitionButton.addEventListener('click', showCreateCompetitionModal);
  }

  if (closeCompetitionModal) {
    closeCompetitionModal.addEventListener('click', hideCreateCompetitionModal);
  }

  if (createCompetitionSubmit) {
    createCompetitionSubmit.addEventListener('click', handleCreateCompetition);
  }

  // Event listeners para eventos do sistema de ligas
  document.addEventListener('league:leaguesLoaded', () => {
    loadMyLeagues();
    loadAvailableLeagues();
  });

  document.addEventListener('league:competitionsLoaded', () => {
    loadMyCompetitions();
    loadAvailableCompetitions();
  });

  document.addEventListener('league:leagueJoined', () => {
    loadMyLeagues();
    loadAvailableLeagues();
  });

  document.addEventListener('league:leagueLeft', () => {
    loadMyLeagues();
    loadAvailableLeagues();
  });

  document.addEventListener('league:competitionJoined', () => {
    loadMyCompetitions();
    loadAvailableCompetitions();
  });

  document.addEventListener('league:competitionLeft', () => {
    loadMyCompetitions();
    loadAvailableCompetitions();
  });

  document.addEventListener('league:competitionCreated', () => {
    hideCreateCompetitionModal();
    loadMyCompetitions();
    loadAvailableCompetitions();
  });
}

/**
 * Alternar entre tabs
 * @param {String} tabId - ID da tab a ser exibida
 */
function switchTab(tabId) {
  // Atualizar botões
  tabButtons.forEach(button => {
    const buttonTabId = button.id.replace('tab-', '');

    if (buttonTabId === tabId) {
      button.classList.add('border-primary', 'text-primary');
      button.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
    } else {
      button.classList.remove('border-primary', 'text-primary');
      button.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
    }
  });

  // Atualizar conteúdo
  tabContents.forEach(content => {
    const contentTabId = content.id.replace('content-', '');

    if (contentTabId === tabId) {
      content.classList.remove('hidden');
    } else {
      content.classList.add('hidden');
    }
  });
}

/**
 * Carregar ligas do usuário
 */
function loadMyLeagues() {
  if (!myLeaguesContent) return;

  const userLeagues = window.leagueSystem.state.userLeagues || [];

  // Limpar conteúdo
  myLeaguesContent.innerHTML = '';

  // Criar container
  const container = document.createElement('div');
  container.className = 'px-4 sm:px-0';

  // Verificar se há ligas
  if (userLeagues.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white rounded-lg shadow-sm">
        <i class="fas fa-trophy text-gray-300 text-5xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma liga encontrada</h3>
        <p class="text-gray-500 mb-4">Você ainda não participa de nenhuma liga.</p>
        <button id="switch-to-available-leagues" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Explorar Ligas Disponíveis
        </button>
      </div>
    `;

    // Adicionar event listener
    const switchButton = container.querySelector('#switch-to-available-leagues');
    if (switchButton) {
      switchButton.addEventListener('click', () => {
        switchTab('available-leagues');
      });
    }
  } else {
    // Criar grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

    // Renderizar ligas
    userLeagues.forEach(league => {
      const leagueCard = createLeagueCard(league, true);
      grid.appendChild(leagueCard);
    });

    container.appendChild(grid);
  }

  // Adicionar ao conteúdo
  myLeaguesContent.appendChild(container);
}

/**
 * Carregar ligas disponíveis
 */
function loadAvailableLeagues() {
  if (!availableLeaguesContent) return;

  const availableLeagues = window.leagueSystem.state.availableLeagues || [];

  // Limpar conteúdo
  availableLeaguesContent.innerHTML = '';

  // Criar container
  const container = document.createElement('div');
  container.className = 'px-4 sm:px-0';

  // Verificar se há ligas
  if (availableLeagues.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white rounded-lg shadow-sm">
        <i class="fas fa-search text-gray-300 text-5xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma liga disponível</h3>
        <p class="text-gray-500">Não há ligas disponíveis para participar no momento.</p>
      </div>
    `;
  } else {
    // Criar grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

    // Renderizar ligas
    availableLeagues.forEach(league => {
      const leagueCard = createLeagueCard(league, false);
      grid.appendChild(leagueCard);
    });

    container.appendChild(grid);
  }

  // Adicionar ao conteúdo
  availableLeaguesContent.appendChild(container);
}

/**
 * Carregar competições do usuário
 */
function loadMyCompetitions() {
  if (!myCompetitionsContent) return;

  const userCompetitions = window.leagueSystem.state.userCompetitions || [];

  // Limpar conteúdo
  myCompetitionsContent.innerHTML = '';

  // Criar container
  const container = document.createElement('div');
  container.className = 'px-4 sm:px-0';

  // Verificar se há competições
  if (userCompetitions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-white rounded-lg shadow-sm">
        <i class="fas fa-medal text-gray-300 text-5xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma competição encontrada</h3>
        <p class="text-gray-500 mb-4">Você ainda não participa de nenhuma competição.</p>
        <div class="space-x-4">
          <button id="switch-to-available-competitions" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Explorar Competições
          </button>
          <button id="create-competition-button-empty" class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Criar Competição
          </button>
        </div>
      </div>
    `;

    // Adicionar event listeners
    const switchButton = container.querySelector('#switch-to-available-competitions');
    if (switchButton) {
      switchButton.addEventListener('click', () => {
        switchTab('available-competitions');
      });
    }

    const createButton = container.querySelector('#create-competition-button-empty');
    if (createButton) {
      createButton.addEventListener('click', showCreateCompetitionModal);
    }
  } else {
    // Criar grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

    // Renderizar competições
    userCompetitions.forEach(competition => {
      const competitionCard = createCompetitionCard(competition, true);
      grid.appendChild(competitionCard);
    });

    container.appendChild(grid);
  }

  // Adicionar ao conteúdo
  myCompetitionsContent.appendChild(container);
}

/**
 * Carregar competições disponíveis
 */
function loadAvailableCompetitions() {
  if (!availableCompetitionsContent) return;

  // Obter container de competições
  const competitionsContainer = availableCompetitionsContent.querySelector('.grid');

  if (!competitionsContainer) return;

  const availableCompetitions = window.leagueSystem.state.availableCompetitions || [];

  // Limpar conteúdo
  competitionsContainer.innerHTML = '';

  // Verificar se há competições
  if (availableCompetitions.length === 0) {
    competitionsContainer.innerHTML = `
      <div class="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
        <i class="fas fa-search text-gray-300 text-5xl mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma competição disponível</h3>
        <p class="text-gray-500">Não há competições disponíveis para participar no momento.</p>
      </div>
    `;
  } else {
    // Renderizar competições
    availableCompetitions.forEach(competition => {
      const competitionCard = createCompetitionCard(competition, false);
      competitionsContainer.appendChild(competitionCard);
    });
  }
}

/**
 * Criar card de liga
 * @param {Object} league - Dados da liga
 * @param {Boolean} isUserLeague - Se é uma liga do usuário
 * @returns {HTMLElement} - Elemento do card
 */
function createLeagueCard(league, isUserLeague) {
  // Obter tipo de liga
  const leagueType = window.leagueSystem.leagueTypes[league.type.toUpperCase()] || {
    icon: 'fa-trophy',
    color: 'blue',
    name: 'Liga',
    metricName: 'Pontos',
    metricUnit: ''
  };

  // Criar elemento
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-sm overflow-hidden';
  card.setAttribute('data-league-id', league.id);

  // Formatar datas
  const startDate = new Date(league.startDate);
  const endDate = new Date(league.endDate);

  const formattedStartDate = startDate.toLocaleDateString();
  const formattedEndDate = endDate.toLocaleDateString();

  // Calcular status
  const now = new Date();
  let statusText, statusClass;

  if (now < startDate) {
    statusText = 'Em breve';
    statusClass = 'bg-yellow-100 text-yellow-800';
  } else if (now > endDate) {
    statusText = 'Encerrada';
    statusClass = 'bg-gray-100 text-gray-800';
  } else {
    statusText = 'Ativa';
    statusClass = 'bg-green-100 text-green-800';
  }

  // Renderizar HTML
  card.innerHTML = `
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="h-12 w-12 rounded-full bg-${leagueType.color}-100 flex items-center justify-center">
            <i class="fas ${leagueType.icon} text-${leagueType.color}-500 text-xl"></i>
          </div>
        </div>
        <div class="ml-4 flex-1">
          <h3 class="text-lg font-medium text-gray-900">${league.name}</h3>
          <p class="text-sm text-gray-500">${league.description || `Liga de ${leagueType.name}`}</p>
        </div>
      </div>
    </div>

    <div class="p-4 border-b border-gray-200">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-500">Tipo</p>
          <p class="font-medium text-gray-900">${leagueType.name}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Participantes</p>
          <p class="font-medium text-gray-900">${league.members}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Período</p>
          <p class="font-medium text-gray-900">${formattedStartDate} - ${formattedEndDate}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Status</p>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
            ${statusText}
          </span>
        </div>
      </div>

      ${isUserLeague ? `
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500">Sua posição</p>
              <p class="font-medium text-gray-900">${league.userRank}º lugar</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">${leagueType.metricName}</p>
              <p class="font-medium text-gray-900">${league.userScore} ${leagueType.metricUnit}</p>
            </div>
          </div>

          <div class="mt-2">
            <div class="bg-gray-200 rounded-full h-2.5 w-full">
              <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, Math.round((league.userScore / (league.leaderScore || 1)) * 100))}%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>Você</span>
              <span>Líder: ${league.leaderScore} ${leagueType.metricUnit}</span>
            </div>
          </div>
        </div>
      ` : ''}
    </div>

    <div class="p-4 flex justify-between">
      <button class="view-league-button inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none" data-league-id="${league.id}">
        <i class="fas fa-chart-bar mr-1.5"></i> Leaderboard
      </button>

      ${isUserLeague ? `
        <button class="leave-league-button inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none" data-league-id="${league.id}">
          <i class="fas fa-sign-out-alt mr-1.5"></i> Sair
        </button>
      ` : `
        <button class="join-league-button inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none" data-league-id="${league.id}">
          <i class="fas fa-plus mr-1.5"></i> Participar
        </button>
      `}
    </div>
  `;

  // Adicionar event listeners
  const viewButton = card.querySelector('.view-league-button');
  if (viewButton) {
    viewButton.addEventListener('click', () => {
      showLeagueDetails(league.id);
    });
  }

  if (isUserLeague) {
    const leaveButton = card.querySelector('.leave-league-button');
    if (leaveButton) {
      leaveButton.addEventListener('click', () => {
        leaveLeague(league.id);
      });
    }
  } else {
    const joinButton = card.querySelector('.join-league-button');
    if (joinButton) {
      joinButton.addEventListener('click', () => {
        joinLeague(league.id);
      });
    }
  }

  return card;
}

/**
 * Criar card de competição
 * @param {Object} competition - Dados da competição
 * @param {Boolean} isUserCompetition - Se é uma competição do usuário
 * @returns {HTMLElement} - Elemento do card
 */
function createCompetitionCard(competition, isUserCompetition) {
  // Obter tipo de competição
  const competitionType = window.leagueSystem.competitionTypes[competition.type.toUpperCase()] || {
    id: 'individual',
    name: 'Individual',
    description: 'Competição entre indivíduos'
  };

  // Obter tipo de liga
  const leagueType = window.leagueSystem.leagueTypes[competition.leagueType.toUpperCase()] || {
    icon: 'fa-trophy',
    color: 'blue',
    name: 'Competição',
    metricName: 'Pontos',
    metricUnit: ''
  };

  // Obter duração
  const durationType = window.leagueSystem.competitionDurations[competition.duration.toUpperCase()] || {
    id: 'weekly',
    name: 'Semanal',
    description: 'Competição com duração de uma semana'
  };

  // Criar elemento
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-sm overflow-hidden';
  card.setAttribute('data-competition-id', competition.id);

  // Formatar datas
  const startDate = new Date(competition.startDate);
  const endDate = new Date(competition.endDate);

  const formattedStartDate = startDate.toLocaleDateString();
  const formattedEndDate = endDate.toLocaleDateString();

  // Calcular status
  const now = new Date();
  let statusText, statusClass;

  if (competition.status === 'upcoming' || now < startDate) {
    statusText = 'Em breve';
    statusClass = 'bg-yellow-100 text-yellow-800';
  } else if (competition.status === 'completed' || now > endDate) {
    statusText = 'Encerrada';
    statusClass = 'bg-gray-100 text-gray-800';
  } else {
    statusText = 'Ativa';
    statusClass = 'bg-green-100 text-green-800';
  }

  // Renderizar HTML
  card.innerHTML = `
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="h-12 w-12 rounded-full bg-${leagueType.color}-100 flex items-center justify-center">
            <i class="fas ${leagueType.icon} text-${leagueType.color}-500 text-xl"></i>
          </div>
        </div>
        <div class="ml-4 flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">${competition.name}</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
              ${statusText}
            </span>
          </div>
          <p class="text-sm text-gray-500">${competition.description || `Competição de ${leagueType.name}`}</p>
        </div>
      </div>
    </div>

    <div class="p-4 border-b border-gray-200">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-500">Tipo</p>
          <p class="font-medium text-gray-900">${competitionType.name}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Métrica</p>
          <p class="font-medium text-gray-900">${leagueType.name}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Duração</p>
          <p class="font-medium text-gray-900">${durationType.name}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Participantes</p>
          <p class="font-medium text-gray-900">${competition.members}</p>
        </div>
        <div class="col-span-2">
          <p class="text-xs text-gray-500">Período</p>
          <p class="font-medium text-gray-900">${formattedStartDate} - ${formattedEndDate}</p>
        </div>
      </div>

      ${isUserCompetition && competition.goal ? `
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500">Seu progresso</p>
              <p class="font-medium text-gray-900">${Math.round((competition.progress / competition.goal) * 100)}%</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Meta</p>
              <p class="font-medium text-gray-900">${competition.progress} / ${competition.goal} ${leagueType.metricUnit}</p>
            </div>
          </div>

          <div class="mt-2">
            <div class="bg-gray-200 rounded-full h-2.5 w-full">
              <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, Math.round((competition.progress / competition.goal) * 100))}%"></div>
            </div>
          </div>
        </div>
      ` : ''}

      ${isUserCompetition && !competition.goal ? `
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500">Sua posição</p>
              <p class="font-medium text-gray-900">${competition.userRank}º lugar</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">${leagueType.metricName}</p>
              <p class="font-medium text-gray-900">${competition.userScore} ${leagueType.metricUnit}</p>
            </div>
          </div>

          <div class="mt-2">
            <div class="bg-gray-200 rounded-full h-2.5 w-full">
              <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, Math.round((competition.userScore / (competition.leaderScore || 1)) * 100))}%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>Você</span>
              <span>Líder: ${competition.leaderScore} ${leagueType.metricUnit}</span>
            </div>
          </div>
        </div>
      ` : ''}
    </div>

    <div class="p-4 flex justify-between">
      <button class="view-competition-button inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none" data-competition-id="${competition.id}">
        <i class="fas fa-chart-bar mr-1.5"></i> Detalhes
      </button>

      ${isUserCompetition ? `
        <button class="leave-competition-button inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none" data-competition-id="${competition.id}">
          <i class="fas fa-sign-out-alt mr-1.5"></i> Sair
        </button>
      ` : `
        <button class="join-competition-button inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none" data-competition-id="${competition.id}">
          <i class="fas fa-plus mr-1.5"></i> Participar
        </button>
      `}
    </div>
  `;

  // Adicionar event listeners
  const viewButton = card.querySelector('.view-competition-button');
  if (viewButton) {
    viewButton.addEventListener('click', () => {
      showCompetitionDetails(competition.id);
    });
  }

  if (isUserCompetition) {
    const leaveButton = card.querySelector('.leave-competition-button');
    if (leaveButton) {
      leaveButton.addEventListener('click', () => {
        leaveCompetition(competition.id);
      });
    }
  } else {
    const joinButton = card.querySelector('.join-competition-button');
    if (joinButton) {
      joinButton.addEventListener('click', () => {
        joinCompetition(competition.id);
      });
    }
  }

  return card;
}

/**
 * Entrar em uma liga
 * @param {String} leagueId - ID da liga
 */
async function joinLeague(leagueId) {
  try {
    // Mostrar feedback ao usuário
    showToast('Entrando na liga...', 'info');

    // Entrar na liga
    const result = await window.leagueSystem.joinLeague(leagueId);

    if (result.success) {
      // Mostrar feedback ao usuário
      showToast('Você entrou na liga com sucesso!', 'success');

      // Recarregar listas
      loadMyLeagues();
      loadAvailableLeagues();
    } else {
      // Mostrar feedback ao usuário
      showToast(`Erro ao entrar na liga: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Erro ao entrar na liga:', error);
    showToast('Erro ao entrar na liga', 'error');
  }
}

/**
 * Sair de uma liga
 * @param {String} leagueId - ID da liga
 */
async function leaveLeague(leagueId) {
  try {
    // Confirmar com o usuário
    if (!confirm('Tem certeza que deseja sair desta liga?')) {
      return;
    }

    // Mostrar feedback ao usuário
    showToast('Saindo da liga...', 'info');

    // Sair da liga
    const result = await window.leagueSystem.leaveLeague(leagueId);

    if (result.success) {
      // Mostrar feedback ao usuário
      showToast('Você saiu da liga com sucesso!', 'success');

      // Recarregar listas
      loadMyLeagues();
      loadAvailableLeagues();
    } else {
      // Mostrar feedback ao usuário
      showToast(`Erro ao sair da liga: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Erro ao sair da liga:', error);
    showToast('Erro ao sair da liga', 'error');
  }
}

/**
 * Entrar em uma competição
 * @param {String} competitionId - ID da competição
 */
async function joinCompetition(competitionId) {
  try {
    // Mostrar feedback ao usuário
    showToast('Entrando na competição...', 'info');

    // Entrar na competição
    const result = await window.leagueSystem.joinCompetition(competitionId);

    if (result.success) {
      // Mostrar feedback ao usuário
      showToast('Você entrou na competição com sucesso!', 'success');

      // Recarregar listas
      loadMyCompetitions();
      loadAvailableCompetitions();
    } else {
      // Mostrar feedback ao usuário
      showToast(`Erro ao entrar na competição: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Erro ao entrar na competição:', error);
    showToast('Erro ao entrar na competição', 'error');
  }
}

/**
 * Sair de uma competição
 * @param {String} competitionId - ID da competição
 */
async function leaveCompetition(competitionId) {
  try {
    // Confirmar com o usuário
    if (!confirm('Tem certeza que deseja sair desta competição?')) {
      return;
    }

    // Mostrar feedback ao usuário
    showToast('Saindo da competição...', 'info');

    // Sair da competição
    const result = await window.leagueSystem.leaveCompetition(competitionId);

    if (result.success) {
      // Mostrar feedback ao usuário
      showToast('Você saiu da competição com sucesso!', 'success');

      // Recarregar listas
      loadMyCompetitions();
      loadAvailableCompetitions();
    } else {
      // Mostrar feedback ao usuário
      showToast(`Erro ao sair da competição: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Erro ao sair da competição:', error);
    showToast('Erro ao sair da competição', 'error');
  }
}

/**
 * Mostrar detalhes da liga
 * @param {String} leagueId - ID da liga
 */
/**
 * Esconder modal de detalhes
 */
function hideDetailsModal() {
  if (detailsModal) {
    detailsModal.classList.add('hidden');
  }
}

/**
 * Mostrar detalhes da liga
 * @param {String} leagueId - ID da liga
 */
async function showLeagueDetails(leagueId) {
  try {
    // Verificar se o modal existe
    if (!detailsModal || !detailsModalContent) {
      console.error('Modal de detalhes não encontrado');
      return;
    }

    // Mostrar modal
    detailsModal.classList.remove('hidden');

    // Mostrar loading
    detailsModalContent.innerHTML = `
      <div class="p-6 text-center">
        <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
        <p class="text-gray-500">Carregando detalhes da liga...</p>
      </div>
    `;

    // Buscar liga
    const userLeagues = window.leagueSystem.state.userLeagues || [];
    const availableLeagues = window.leagueSystem.state.availableLeagues || [];

    const league = [...userLeagues, ...availableLeagues].find(l => l.id === leagueId);

    if (!league) {
      detailsModalContent.innerHTML = `
        <div class="p-6 text-center">
          <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-4"></i>
          <p class="text-gray-500">Liga não encontrada</p>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" class="close-details-modal mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm">
            Fechar
          </button>
        </div>
      `;

      // Adicionar event listener
      const closeButton = detailsModalContent.querySelector('.close-details-modal');
      if (closeButton) {
        closeButton.addEventListener('click', hideDetailsModal);
      }

      return;
    }

    // Obter tipo de liga
    const leagueType = window.leagueSystem.leagueTypes[league.type.toUpperCase()] || {
      icon: 'fa-trophy',
      color: 'blue',
      name: 'Liga',
      metricName: 'Pontos',
      metricUnit: ''
    };

    // Verificar se o usuário está na liga
    const isUserLeague = userLeagues.some(l => l.id === leagueId);

    // Formatar datas
    const startDate = new Date(league.startDate);
    const endDate = new Date(league.endDate);

    const formattedStartDate = startDate.toLocaleDateString();
    const formattedEndDate = endDate.toLocaleDateString();

    // Calcular status
    const now = new Date();
    let statusText, statusClass;

    if (now < startDate) {
      statusText = 'Em breve';
      statusClass = 'bg-yellow-100 text-yellow-800';
    } else if (now > endDate) {
      statusText = 'Encerrada';
      statusClass = 'bg-gray-100 text-gray-800';
    } else {
      statusText = 'Ativa';
      statusClass = 'bg-green-100 text-green-800';
    }

    // Buscar leaderboard
    const leaderboard = await window.leagueSystem.getLeaderboard(leagueId, 'league');

    // Renderizar HTML
    detailsModalContent.innerHTML = `
      <div class="p-6">
        <div class="flex items-center mb-6">
          <div class="flex-shrink-0">
            <div class="h-16 w-16 rounded-full bg-${leagueType.color}-100 flex items-center justify-center">
              <i class="fas ${leagueType.icon} text-${leagueType.color}-500 text-2xl"></i>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-medium text-gray-900">${league.name}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                ${statusText}
              </span>
            </div>
            <p class="text-sm text-gray-500">${league.description || `Liga de ${leagueType.name}`}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-xs text-gray-500">Tipo</p>
            <p class="font-medium text-gray-900">${leagueType.name}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Participantes</p>
            <p class="font-medium text-gray-900">${league.members}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Período</p>
            <p class="font-medium text-gray-900">${formattedStartDate} - ${formattedEndDate}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Métrica</p>
            <p class="font-medium text-gray-900">${leagueType.metricName} (${leagueType.metricUnit})</p>
          </div>
        </div>

        ${isUserLeague ? `
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="text-xs text-gray-500">Sua posição</p>
                <p class="font-medium text-gray-900">${league.userRank}º lugar</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">${leagueType.metricName}</p>
                <p class="font-medium text-gray-900">${league.userScore} ${leagueType.metricUnit}</p>
              </div>
            </div>

            <div class="mt-2">
              <div class="bg-gray-200 rounded-full h-2.5 w-full">
                <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, Math.round((league.userScore / (league.leaderScore || 1)) * 100))}%"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>Você</span>
                <span>Líder: ${league.leaderScore} ${leagueType.metricUnit}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <h4 class="text-lg font-medium text-gray-900 mb-4">Leaderboard</h4>

        <div class="overflow-hidden border-b border-gray-200 rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ${leagueType.metricName}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${leaderboard.map(entry => `
                <tr class="${entry.isCurrentUser ? 'bg-primary-50' : ''}">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${entry.isCurrentUser ? 'text-primary' : 'text-gray-900'}">
                    ${entry.rank}º
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm ${entry.isCurrentUser ? 'font-medium text-primary' : 'text-gray-500'}">
                    ${entry.name} ${entry.isCurrentUser ? '(Você)' : ''}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right ${entry.isCurrentUser ? 'font-medium text-primary' : 'text-gray-500'}">
                    ${entry.score.toFixed(1)} ${leagueType.metricUnit}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        ${isUserLeague ? `
          <button type="button" class="leave-league-button-modal w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm" data-league-id="${league.id}">
            Sair da Liga
          </button>
        ` : `
          <button type="button" class="join-league-button-modal w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm" data-league-id="${league.id}">
            Participar
          </button>
        `}
        <button type="button" class="close-details-modal mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          Fechar
        </button>
      </div>
    `;

    // Adicionar event listeners
    const closeButton = detailsModalContent.querySelector('.close-details-modal');
    if (closeButton) {
      closeButton.addEventListener('click', hideDetailsModal);
    }

    if (isUserLeague) {
      const leaveButton = detailsModalContent.querySelector('.leave-league-button-modal');
      if (leaveButton) {
        leaveButton.addEventListener('click', () => {
          hideDetailsModal();
          leaveLeague(leagueId);
        });
      }
    } else {
      const joinButton = detailsModalContent.querySelector('.join-league-button-modal');
      if (joinButton) {
        joinButton.addEventListener('click', () => {
          hideDetailsModal();
          joinLeague(leagueId);
        });
      }
    }
  } catch (error) {
    console.error('Erro ao mostrar detalhes da liga:', error);

    if (detailsModalContent) {
      detailsModalContent.innerHTML = `
        <div class="p-6 text-center">
          <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-4"></i>
          <p class="text-gray-500">Erro ao carregar detalhes da liga</p>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" class="close-details-modal mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm">
            Fechar
          </button>
        </div>
      `;

      // Adicionar event listener
      const closeButton = detailsModalContent.querySelector('.close-details-modal');
      if (closeButton) {
        closeButton.addEventListener('click', hideDetailsModal);
      }
    }
  }
}

/**
 * Mostrar detalhes da competição
 * @param {String} competitionId - ID da competição
 */
async function showCompetitionDetails(competitionId) {
  try {
    // Verificar se o modal existe
    if (!detailsModal || !detailsModalContent) {
      console.error('Modal de detalhes não encontrado');
      return;
    }

    // Mostrar modal
    detailsModal.classList.remove('hidden');

    // Mostrar loading
    detailsModalContent.innerHTML = `
      <div class="p-6 text-center">
        <i class="fas fa-spinner fa-spin text-primary text-3xl mb-4"></i>
        <p class="text-gray-500">Carregando detalhes da competição...</p>
      </div>
    `;

    // Buscar competição
    const userCompetitions = window.leagueSystem.state.userCompetitions || [];
    const availableCompetitions = window.leagueSystem.state.availableCompetitions || [];

    const competition = [...userCompetitions, ...availableCompetitions].find(c => c.id === competitionId);

    if (!competition) {
      detailsModalContent.innerHTML = `
        <div class="p-6 text-center">
          <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-4"></i>
          <p class="text-gray-500">Competição não encontrada</p>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" class="close-details-modal mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm">
            Fechar
          </button>
        </div>
      `;

      // Adicionar event listener
      const closeButton = detailsModalContent.querySelector('.close-details-modal');
      if (closeButton) {
        closeButton.addEventListener('click', hideDetailsModal);
      }

      return;
    }

    // Obter tipo de competição
    const competitionTypeMap = {
      'individual': { name: 'Individual', icon: 'fa-user' },
      'team': { name: 'Equipe', icon: 'fa-users' },
      'challenge': { name: 'Desafio', icon: 'fa-flag-checkered' }
    };

    const competitionType = competitionTypeMap[competition.type] || {
      name: 'Competição',
      icon: 'fa-trophy'
    };

    // Obter tipo de liga/métrica
    const leagueType = window.leagueSystem.leagueTypes[competition.leagueType.toUpperCase()] || {
      icon: 'fa-trophy',
      color: 'blue',
      name: 'Distância',
      metricName: 'Pontos',
      metricUnit: 'km'
    };

    // Obter tipo de duração
    const durationTypeMap = {
      'daily': { name: 'Diário', days: 1 },
      'weekly': { name: 'Semanal', days: 7 },
      'monthly': { name: 'Mensal', days: 30 },
      'quarterly': { name: 'Trimestral', days: 90 },
      'yearly': { name: 'Anual', days: 365 }
    };

    const durationType = durationTypeMap[competition.duration] || {
      name: 'Personalizado',
      days: 0
    };

    // Verificar se o usuário está na competição
    const isUserCompetition = userCompetitions.some(c => c.id === competitionId);

    // Formatar datas
    const startDate = new Date(competition.startDate);
    const endDate = new Date(competition.endDate);

    const formattedStartDate = startDate.toLocaleDateString();
    const formattedEndDate = endDate.toLocaleDateString();

    // Calcular status
    const now = new Date();
    let statusText, statusClass;

    if (now < startDate) {
      statusText = 'Em breve';
      statusClass = 'bg-yellow-100 text-yellow-800';
    } else if (now > endDate) {
      statusText = 'Encerrada';
      statusClass = 'bg-gray-100 text-gray-800';
    } else {
      statusText = 'Ativa';
      statusClass = 'bg-green-100 text-green-800';
    }

    // Buscar leaderboard
    const leaderboard = await window.leagueSystem.getLeaderboard(competitionId, 'competition');

    // Obter tipos de atividade aceitos
    const activityTypes = competition.activityTypes || [];
    const activityTypeNames = {
      'running': 'Corrida',
      'cycling': 'Ciclismo',
      'walking': 'Caminhada',
      'swimming': 'Natação',
      'hiking': 'Trilha',
      'workout': 'Treino'
    };

    const activityTypesFormatted = activityTypes
      .map(type => activityTypeNames[type] || type)
      .join(', ');

    // Renderizar HTML
    detailsModalContent.innerHTML = `
      <div class="p-6">
        <div class="flex items-center mb-6">
          <div class="flex-shrink-0">
            <div class="h-16 w-16 rounded-full bg-${leagueType.color}-100 flex items-center justify-center">
              <i class="fas ${competitionType.icon} text-${leagueType.color}-500 text-2xl"></i>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-medium text-gray-900">${competition.name}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                ${statusText}
              </span>
            </div>
            <p class="text-sm text-gray-500">${competition.description || `Competição de ${leagueType.name}`}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-xs text-gray-500">Tipo</p>
            <p class="font-medium text-gray-900">${competitionType.name}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Participantes</p>
            <p class="font-medium text-gray-900">${competition.members}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Período</p>
            <p class="font-medium text-gray-900">${formattedStartDate} - ${formattedEndDate}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Métrica</p>
            <p class="font-medium text-gray-900">${leagueType.metricName} (${leagueType.metricUnit})</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Duração</p>
            <p class="font-medium text-gray-900">${durationType.name}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Atividades aceitas</p>
            <p class="font-medium text-gray-900">${activityTypesFormatted || 'Todas'}</p>
          </div>
        </div>

        ${competition.goal ? `
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-900 mb-2">Meta da Competição</h4>
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="text-xs text-gray-500">Objetivo</p>
                <p class="font-medium text-gray-900">${competition.goal} ${leagueType.metricUnit}</p>
              </div>
              ${isUserCompetition ? `
                <div>
                  <p class="text-xs text-gray-500">Seu progresso</p>
                  <p class="font-medium text-gray-900">${competition.progress || 0} ${leagueType.metricUnit}</p>
                </div>
              ` : ''}
            </div>

            ${isUserCompetition ? `
              <div class="mt-2">
                <div class="bg-gray-200 rounded-full h-2.5 w-full">
                  <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, Math.round(((competition.progress || 0) / competition.goal) * 100))}%"></div>
                </div>
                <div class="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 ${leagueType.metricUnit}</span>
                  <span>${competition.goal} ${leagueType.metricUnit}</span>
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${isUserCompetition ? `
          <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="text-xs text-gray-500">Sua posição</p>
                <p class="font-medium text-gray-900">${competition.userRank}º lugar</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">${leagueType.metricName}</p>
                <p class="font-medium text-gray-900">${competition.userScore} ${leagueType.metricUnit}</p>
              </div>
            </div>

            <div class="mt-2">
              <div class="bg-gray-200 rounded-full h-2.5 w-full">
                <div class="bg-primary h-2.5 rounded-full" style="width: ${Math.min(100, Math.round((competition.userScore / (competition.leaderScore || 1)) * 100))}%"></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>Você</span>
                <span>Líder: ${competition.leaderScore} ${leagueType.metricUnit}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <h4 class="text-lg font-medium text-gray-900 mb-4">Leaderboard</h4>

        <div class="overflow-hidden border-b border-gray-200 rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ${leagueType.metricName}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${leaderboard.map(entry => `
                <tr class="${entry.isCurrentUser ? 'bg-primary-50' : ''}">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${entry.isCurrentUser ? 'text-primary' : 'text-gray-900'}">
                    ${entry.rank}º
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm ${entry.isCurrentUser ? 'font-medium text-primary' : 'text-gray-500'}">
                    ${entry.name} ${entry.isCurrentUser ? '(Você)' : ''}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right ${entry.isCurrentUser ? 'font-medium text-primary' : 'text-gray-500'}">
                    ${entry.score.toFixed(1)} ${leagueType.metricUnit}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        ${isUserCompetition ? `
          <button type="button" class="leave-competition-button-modal w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm" data-competition-id="${competition.id}">
            Sair da Competição
          </button>
        ` : `
          <button type="button" class="join-competition-button-modal w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm" data-competition-id="${competition.id}">
            Participar
          </button>
        `}
        <button type="button" class="close-details-modal mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          Fechar
        </button>
      </div>
    `;

    // Adicionar event listeners
    const closeButton = detailsModalContent.querySelector('.close-details-modal');
    if (closeButton) {
      closeButton.addEventListener('click', hideDetailsModal);
    }

    if (isUserCompetition) {
      const leaveButton = detailsModalContent.querySelector('.leave-competition-button-modal');
      if (leaveButton) {
        leaveButton.addEventListener('click', () => {
          hideDetailsModal();
          leaveCompetition(competitionId);
        });
      }
    } else {
      const joinButton = detailsModalContent.querySelector('.join-competition-button-modal');
      if (joinButton) {
        joinButton.addEventListener('click', () => {
          hideDetailsModal();
          joinCompetition(competitionId);
        });
      }
    }
  } catch (error) {
    console.error('Erro ao mostrar detalhes da competição:', error);

    if (detailsModalContent) {
      detailsModalContent.innerHTML = `
        <div class="p-6 text-center">
          <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-4"></i>
          <p class="text-gray-500">Erro ao carregar detalhes da competição</p>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="button" class="close-details-modal mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm">
            Fechar
          </button>
        </div>
      `;

      // Adicionar event listener
      const closeButton = detailsModalContent.querySelector('.close-details-modal');
      if (closeButton) {
        closeButton.addEventListener('click', hideDetailsModal);
      }
    }
  }
}

/**
 * Mostrar modal de criação de competição
 */
function showCreateCompetitionModal() {
  const createCompetitionModal = document.getElementById('create-competition-modal');
  if (createCompetitionModal) {
    createCompetitionModal.classList.remove('hidden');
  }
}

/**
 * Esconder modal de criação de competição
 */
function hideCreateCompetitionModal() {
  const createCompetitionModal = document.getElementById('create-competition-modal');
  if (createCompetitionModal) {
    createCompetitionModal.classList.add('hidden');
  }
}

/**
 * Processar formulário de criação de competição
 */
async function handleCreateCompetition() {
  try {
    // Mostrar feedback ao usuário
    showToast('Criando competição...', 'info');

    // Obter valores do formulário
    const name = document.getElementById('competition-name').value;
    const description = document.getElementById('competition-description').value;
    const competitionType = document.getElementById('competition-type').value;
    const leagueType = document.getElementById('league-type').value;
    const duration = document.getElementById('competition-duration').value;

    // Obter tipos de atividade selecionados
    const activityTypes = Array.from(document.querySelectorAll('input[name="activity-types"]:checked'))
      .map(checkbox => checkbox.value);

    // Validar campos obrigatórios
    if (!name || !competitionType || !leagueType || !duration) {
      showToast('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }

    // Criar objeto da competição
    const competition = {
      name,
      description,
      type: competitionType,
      leagueType,
      duration,
      activityTypes
    };

    // Criar competição através da API
    const result = await window.leagueSystem.createCompetition(competition);

    if (result.success) {
      // Mostrar feedback ao usuário
      showToast('Competição criada com sucesso!', 'success');

      // Fechar modal
      hideCreateCompetitionModal();

      // Recarregar listas
      loadMyCompetitions();
      loadAvailableCompetitions();
    } else {
      // Mostrar feedback ao usuário
      showToast(`Erro ao criar competição: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Erro ao criar competição:', error);
    showToast('Erro ao criar competição', 'error');
  }
}

/**
 * Exibir mensagem de toast para feedback ao usuário
 * @param {String} message - Mensagem a ser exibida
 * @param {String} type - Tipo de mensagem: success, error, info, warning
 */
function showToast(message, type = 'info') {
  // Verificar se o elemento toast existe
  let toastContainer = document.getElementById('toast-container');

  // Criar container se não existir
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }

  // Criar elemento toast
  const toast = document.createElement('div');

  // Definir classes com base no tipo
  let typeClasses = 'bg-blue-500';
  let icon = '<i class="fas fa-info-circle"></i>';

  switch (type) {
    case 'success':
      typeClasses = 'bg-green-500';
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case 'error':
      typeClasses = 'bg-red-500';
      icon = '<i class="fas fa-exclamation-circle"></i>';
      break;
    case 'warning':
      typeClasses = 'bg-yellow-500';
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
  }

  // Definir HTML e classes
  toast.className = `${typeClasses} text-white py-2 px-4 rounded-md shadow-md flex items-center max-w-xs transition-opacity duration-300`;
  toast.innerHTML = `
    <div class="mr-2">${icon}</div>
    <div>${message}</div>
  `;

  // Adicionar ao container
  toastContainer.appendChild(toast);

  // Remover após 5 segundos
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

/**
 * Exibir mensagem de erro
 * @param {String} message - Mensagem de erro
 */
function showError(message) {
  showToast(message, 'error');
}
