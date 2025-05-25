// Funcionalidades para a página de busca

// Dados de exemplo para simulação
const sampleData = {
  activities: [
    {
      id: 1,
      type: 'running',
      name: 'Corrida Matinal',
      date: '2023-06-15',
      distance: 5.2,
      duration: 28,
      calories: 320,
      user: {
        id: 1,
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    },
    {
      id: 2,
      type: 'cycling',
      name: 'Ciclismo no Parque',
      date: '2023-06-14',
      distance: 15.8,
      duration: 45,
      calories: 450,
      user: {
        id: 1,
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    },
    {
      id: 3,
      type: 'walking',
      name: 'Caminhada na Praia',
      date: '2023-06-13',
      distance: 3.5,
      duration: 40,
      calories: 180,
      user: {
        id: 2,
        name: 'Maria Oliveira',
        avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    }
  ],
  challenges: [
    {
      id: 1,
      name: 'Desafio 5K',
      description: 'Complete uma corrida de 5K em menos de 30 minutos.',
      type: 'running',
      distance: 5,
      participants: 245,
      endDate: '2023-07-15'
    },
    {
      id: 2,
      name: 'Desafio de Ciclismo',
      description: 'Pedale 100km em uma semana.',
      type: 'cycling',
      distance: 100,
      participants: 156,
      endDate: '2023-06-30'
    },
    {
      id: 3,
      name: 'Caminhada Diária',
      description: 'Caminhe pelo menos 5000 passos todos os dias por um mês.',
      type: 'walking',
      distance: null,
      participants: 320,
      endDate: '2023-07-31'
    }
  ],
  users: [
    {
      id: 1,
      name: 'João Silva',
      username: 'joaosilva',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      level: 15,
      activities: 256,
      followers: 124,
      following: 98
    },
    {
      id: 2,
      name: 'Maria Oliveira',
      username: 'mariaoliveira',
      avatar: 'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      level: 22,
      activities: 312,
      followers: 256,
      following: 145
    },
    {
      id: 3,
      name: 'Carlos Santos',
      username: 'carlossantos',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      level: 20,
      activities: 198,
      followers: 87,
      following: 65
    }
  ]
};

// Classe para gerenciar a busca
class SearchManager {
  constructor() {
    this.searchForm = document.getElementById('search-form');
    this.searchQuery = document.getElementById('search-query');
    this.searchType = document.getElementById('search-type');
    this.resultsContainer = document.getElementById('search-results');
    this.resultsCount = document.getElementById('results-count');
    this.pagination = document.getElementById('pagination');
    this.toggleFiltersBtn = document.getElementById('toggle-filters');
    this.advancedFilters = document.getElementById('advanced-filters');
    this.filtersText = document.getElementById('filters-text');
    this.filtersIcon = document.getElementById('filters-icon');
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Formulário de busca
    if (this.searchForm) {
      this.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.performSearch();
      });
    }
    
    // Botão de filtros avançados
    if (this.toggleFiltersBtn && this.advancedFilters) {
      this.toggleFiltersBtn.addEventListener('click', () => {
        this.toggleAdvancedFilters();
      });
    }
    
    // Tabs de resultados
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });
  }
  
  toggleAdvancedFilters() {
    this.advancedFilters.classList.toggle('hidden');
    
    if (this.advancedFilters.classList.contains('hidden')) {
      this.filtersText.textContent = 'Mostrar filtros avançados';
      this.filtersIcon.classList.remove('fa-chevron-up');
      this.filtersIcon.classList.add('fa-chevron-down');
    } else {
      this.filtersText.textContent = 'Ocultar filtros avançados';
      this.filtersIcon.classList.remove('fa-chevron-down');
      this.filtersIcon.classList.add('fa-chevron-up');
    }
  }
  
  switchTab(tabId) {
    // Atualizar botões de tab
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.remove('border-transparent', 'text-gray-500');
        btn.classList.add('border-primary', 'text-primary');
      } else {
        btn.classList.remove('border-primary', 'text-primary');
        btn.classList.add('border-transparent', 'text-gray-500');
      }
    });
    
    // Atualizar conteúdo das tabs
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
      if (content.id === tabId) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  }
  
  performSearch() {
    const query = this.searchQuery.value.trim().toLowerCase();
    const type = this.searchType.value;
    
    if (!query) {
      this.showEmptyState();
      return;
    }
    
    // Filtros adicionais
    const dateFilter = document.getElementById('filter-date')?.value || 'any';
    const distanceFilter = document.getElementById('filter-distance')?.value || 'any';
    const activityFilter = document.getElementById('filter-activity')?.value || 'any';
    
    // Realizar busca com base no tipo selecionado
    let results = [];
    
    if (type === 'all' || type === 'activities') {
      const activityResults = this.searchActivities(query, dateFilter, distanceFilter, activityFilter);
      results = results.concat(activityResults);
    }
    
    if (type === 'all' || type === 'challenges') {
      const challengeResults = this.searchChallenges(query, activityFilter);
      results = results.concat(challengeResults);
    }
    
    if (type === 'all' || type === 'users') {
      const userResults = this.searchUsers(query);
      results = results.concat(userResults);
    }
    
    // Exibir resultados
    this.displayResults(results);
    
    // Atualizar contagem de resultados
    this.resultsCount.textContent = results.length;
    
    // Mostrar/ocultar paginação
    if (results.length > 10) {
      this.pagination.classList.remove('hidden');
    } else {
      this.pagination.classList.add('hidden');
    }
  }
  
  searchActivities(query, dateFilter, distanceFilter, activityFilter) {
    return sampleData.activities.filter(activity => {
      // Filtrar por termo de busca
      const matchesQuery = 
        activity.name.toLowerCase().includes(query) || 
        activity.type.toLowerCase().includes(query);
      
      // Filtrar por tipo de atividade
      const matchesActivityType = 
        activityFilter === 'any' || 
        activity.type === activityFilter;
      
      // Filtrar por distância
      let matchesDistance = true;
      if (distanceFilter !== 'any') {
        const maxDistance = parseInt(distanceFilter);
        matchesDistance = activity.distance <= maxDistance;
      }
      
      // Filtrar por data
      let matchesDate = true;
      if (dateFilter !== 'any') {
        const activityDate = new Date(activity.date);
        const today = new Date();
        
        if (dateFilter === 'today') {
          matchesDate = activityDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = activityDate >= weekAgo;
        } else if (dateFilter === 'month') {
          matchesDate = 
            activityDate.getMonth() === today.getMonth() && 
            activityDate.getFullYear() === today.getFullYear();
        } else if (dateFilter === 'year') {
          matchesDate = activityDate.getFullYear() === today.getFullYear();
        }
      }
      
      return matchesQuery && matchesActivityType && matchesDistance && matchesDate;
    }).map(activity => ({
      type: 'activity',
      data: activity
    }));
  }
  
  searchChallenges(query, activityFilter) {
    return sampleData.challenges.filter(challenge => {
      // Filtrar por termo de busca
      const matchesQuery = 
        challenge.name.toLowerCase().includes(query) || 
        challenge.description.toLowerCase().includes(query);
      
      // Filtrar por tipo de atividade
      const matchesActivityType = 
        activityFilter === 'any' || 
        challenge.type === activityFilter;
      
      return matchesQuery && matchesActivityType;
    }).map(challenge => ({
      type: 'challenge',
      data: challenge
    }));
  }
  
  searchUsers(query) {
    return sampleData.users.filter(user => {
      return user.name.toLowerCase().includes(query) || 
             user.username.toLowerCase().includes(query);
    }).map(user => ({
      type: 'user',
      data: user
    }));
  }
  
  displayResults(results) {
    if (results.length === 0) {
      this.showNoResultsState();
      return;
    }
    
    // Limpar contêiner de resultados
    this.resultsContainer.innerHTML = '';
    
    // Agrupar resultados por tipo
    const activityResults = results.filter(result => result.type === 'activity');
    const challengeResults = results.filter(result => result.type === 'challenge');
    const userResults = results.filter(result => result.type === 'user');
    
    // Preencher as tabs específicas
    this.fillActivityResults(activityResults);
    this.fillChallengeResults(challengeResults);
    this.fillUserResults(userResults);
    
    // Preencher a tab "Todos"
    results.forEach(result => {
      let resultHtml = '';
      
      if (result.type === 'activity') {
        resultHtml = this.createActivityResultHtml(result.data);
      } else if (result.type === 'challenge') {
        resultHtml = this.createChallengeResultHtml(result.data);
      } else if (result.type === 'user') {
        resultHtml = this.createUserResultHtml(result.data);
      }
      
      this.resultsContainer.innerHTML += resultHtml;
    });
  }
  
  fillActivityResults(results) {
    const container = document.getElementById('activities-results');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <p>Nenhuma atividade encontrada.</p>
        </div>
      `;
      return;
    }
    
    results.forEach(result => {
      const resultHtml = this.createActivityResultHtml(result.data);
      container.innerHTML += resultHtml;
    });
  }
  
  fillChallengeResults(results) {
    const container = document.getElementById('challenges-results');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <p>Nenhum desafio encontrado.</p>
        </div>
      `;
      return;
    }
    
    results.forEach(result => {
      const resultHtml = this.createChallengeResultHtml(result.data);
      container.innerHTML += resultHtml;
    });
  }
  
  fillUserResults(results) {
    const container = document.getElementById('users-results');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (results.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <p>Nenhum usuário encontrado.</p>
        </div>
      `;
      return;
    }
    
    results.forEach(result => {
      const resultHtml = this.createUserResultHtml(result.data);
      container.innerHTML += resultHtml;
    });
  }
  
  createActivityResultHtml(activity) {
    return `
      <div class="flex items-start p-4 border-b border-gray-200">
        <div class="flex-shrink-0 mr-4">
          <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="fas fa-${this.getActivityIcon(activity.type)} text-blue-500 text-xl"></i>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium">${activity.name}</h3>
            <span class="text-sm text-gray-500">${this.formatDate(activity.date)}</span>
          </div>
          <div class="flex items-center mt-1">
            <img class="h-5 w-5 rounded-full mr-1" src="${activity.user.avatar}" alt="${activity.user.name}">
            <span class="text-sm text-gray-600">${activity.user.name}</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <i class="fas fa-road mr-1"></i> ${activity.distance} km
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i class="fas fa-stopwatch mr-1"></i> ${activity.duration} min
            </span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <i class="fas fa-fire mr-1"></i> ${activity.calories} kcal
            </span>
          </div>
        </div>
      </div>
    `;
  }
  
  createChallengeResultHtml(challenge) {
    return `
      <div class="flex items-start p-4 border-b border-gray-200">
        <div class="flex-shrink-0 mr-4">
          <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <i class="fas fa-trophy text-purple-500 text-xl"></i>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-medium">${challenge.name}</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i class="fas fa-bolt mr-1"></i> Ativo
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-600">${challenge.description}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <i class="fas fa-${this.getActivityIcon(challenge.type)} mr-1"></i> ${this.capitalizeFirstLetter(challenge.type)}
            </span>
            ${challenge.distance ? `
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <i class="fas fa-road mr-1"></i> ${challenge.distance} km
              </span>
            ` : ''}
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <i class="fas fa-users mr-1"></i> ${challenge.participants} participantes
            </span>
          </div>
        </div>
      </div>
    `;
  }
  
  createUserResultHtml(user) {
    return `
      <div class="flex items-center p-4 border-b border-gray-200">
        <div class="flex-shrink-0 mr-4">
          <img class="h-12 w-12 rounded-full" src="${user.avatar}" alt="${user.name}">
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-medium">${user.name}</h3>
              <p class="text-sm text-gray-500">@${user.username}</p>
            </div>
            <button class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
              <i class="fas fa-user-plus mr-1"></i> Seguir
            </button>
          </div>
          <div class="mt-2 flex flex-wrap gap-4">
            <span class="inline-flex items-center text-sm text-gray-600">
              <i class="fas fa-medal text-primary mr-1"></i> Nível ${user.level}
            </span>
            <span class="inline-flex items-center text-sm text-gray-600">
              <i class="fas fa-running text-gray-400 mr-1"></i> ${user.activities} atividades
            </span>
            <span class="inline-flex items-center text-sm text-gray-600">
              <i class="fas fa-user-friends text-gray-400 mr-1"></i> ${user.followers} seguidores
            </span>
          </div>
        </div>
      </div>
    `;
  }
  
  showEmptyState() {
    this.resultsContainer.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-search text-4xl mb-4"></i>
        <p>Digite sua busca acima para encontrar atividades, desafios e usuários.</p>
      </div>
    `;
    this.resultsCount.textContent = '0';
    this.pagination.classList.add('hidden');
  }
  
  showNoResultsState() {
    this.resultsContainer.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-search text-4xl mb-4"></i>
        <p>Nenhum resultado encontrado para sua busca.</p>
        <p class="mt-2 text-sm">Tente termos diferentes ou remova alguns filtros.</p>
      </div>
    `;
    this.resultsCount.textContent = '0';
    this.pagination.classList.add('hidden');
  }
  
  getActivityIcon(type) {
    switch (type) {
      case 'running': return 'running';
      case 'cycling': return 'bicycle';
      case 'walking': return 'walking';
      case 'swimming': return 'swimmer';
      default: return 'running';
    }
  }
  
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
  
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de busca
  if (document.body.getAttribute('data-page') === 'search') {
    const searchManager = new SearchManager();
  }
});
