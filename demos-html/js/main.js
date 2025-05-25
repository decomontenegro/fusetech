// Funcionalidades principais do FuseLabs

// Funcionalidade de abas
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabButtons.length > 0 && tabContents.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');

        // Update active tab button
        tabButtons.forEach(btn => {
          btn.classList.remove('border-primary', 'text-primary');
          btn.classList.add('border-transparent', 'text-gray-500');
        });
        button.classList.remove('border-transparent', 'text-gray-500');
        button.classList.add('border-primary', 'text-primary');

        // Update active tab content
        tabContents.forEach(content => {
          content.classList.remove('active');
        });

        const tabContent = document.getElementById(tabId);
        if (tabContent) {
          tabContent.classList.add('active');
        } else {
          console.warn(`Tab content with id "${tabId}" not found`);
        }
      });
    });

    // Verificar se há uma aba ativa, caso contrário ativar a primeira
    const hasActiveTab = Array.from(tabContents).some(content => content.classList.contains('active'));
    if (!hasActiveTab && tabContents.length > 0) {
      const firstTabId = tabButtons[0].getAttribute('data-tab');
      tabButtons[0].classList.remove('border-transparent', 'text-gray-500');
      tabButtons[0].classList.add('border-primary', 'text-primary');
      document.getElementById(firstTabId).classList.add('active');
    }
  }
}

// Funcionalidade de menu mobile
function setupMobileMenu() {
  const menuButton = document.getElementById('mobile-menu-button');
  let mobileMenu = document.getElementById('mobile-menu');

  // Se o menu mobile não existir, carregá-lo dinamicamente
  if (menuButton && !mobileMenu) {
    fetch('components/mobile-menu.html')
      .then(response => response.text())
      .then(html => {
        // Inserir o menu após o botão
        const navbar = document.querySelector('nav');
        if (navbar) {
          navbar.insertAdjacentHTML('beforeend', html);

          // Obter referência ao menu inserido
          mobileMenu = document.getElementById('mobile-menu');

          // Configurar eventos
          setupMobileMenuEvents(menuButton, mobileMenu);
        }
      })
      .catch(error => {
        console.error('Erro ao carregar o menu mobile:', error);
      });
  } else if (menuButton && mobileMenu) {
    // Se o menu já existir, apenas configurar eventos
    setupMobileMenuEvents(menuButton, mobileMenu);
  }
}

// Configurar eventos do menu mobile
function setupMobileMenuEvents(menuButton, mobileMenu) {
  menuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');

    // Adicionar/remover classe para impedir rolagem do body quando o menu estiver aberto
    if (!mobileMenu.classList.contains('hidden')) {
      document.body.classList.add('overflow-hidden', 'sm:overflow-auto');
    } else {
      document.body.classList.remove('overflow-hidden', 'sm:overflow-auto');
    }
  });

  // Fechar menu ao clicar em um link
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      document.body.classList.remove('overflow-hidden', 'sm:overflow-auto');
    });
  });
}

// Funcionalidade de dropdown do perfil
function setupUserMenu() {
  const userMenuButton = document.getElementById('user-menu-button');
  let userMenu = document.getElementById('user-menu');

  // Se o menu do usuário não existir, carregá-lo dinamicamente
  if (userMenuButton && !userMenu) {
    fetch('components/user-menu.html')
      .then(response => response.text())
      .then(html => {
        // Inserir o menu após o botão
        userMenuButton.insertAdjacentHTML('afterend', html);

        // Obter referência ao menu inserido
        userMenu = document.getElementById('user-menu');

        // Configurar eventos
        setupUserMenuEvents(userMenuButton, userMenu);
      })
      .catch(error => {
        console.error('Erro ao carregar o menu do usuário:', error);
      });
  } else if (userMenuButton && userMenu) {
    // Se o menu já existir, apenas configurar eventos
    setupUserMenuEvents(userMenuButton, userMenu);
  }
}

// Configurar eventos do menu do usuário
function setupUserMenuEvents(userMenuButton, userMenu) {
  userMenuButton.addEventListener('click', () => {
    userMenu.classList.toggle('hidden');
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (event) => {
    if (!userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
      userMenu.classList.add('hidden');
    }
  });
}

// Verificar autenticação e atualizar UI
function checkAuthentication() {
  // Verificar se o gerenciador de autenticação está disponível
  if (typeof authManager !== 'undefined') {
    if (authManager.isAuthenticated()) {
      // Usuário está logado
      const user = authManager.getCurrentUser();

      // Atualizar avatar do usuário
      const userMenuButton = document.getElementById('user-menu-button');
      if (userMenuButton) {
        const avatarImg = userMenuButton.querySelector('img');
        if (avatarImg && user.avatar) {
          avatarImg.src = user.avatar;
          avatarImg.alt = user.name;
        }
      }

      // Adicionar nome do usuário ao menu (se necessário)
      // Isso seria feito quando o menu for carregado
    } else {
      // Usuário não está logado
      // Redirecionar para a página de login se estiver em uma página protegida
      const currentPage = document.body.getAttribute('data-page');
      const publicPages = ['login', 'register', 'home'];

      if (!publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
      }
    }
  } else {
    console.warn('Gerenciador de autenticação não encontrado');
  }
}

// Inicializar todas as funcionalidades quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Carregar o script de autenticação se ainda não estiver carregado
  if (typeof authManager === 'undefined') {
    const authScript = document.createElement('script');
    authScript.src = 'js/auth.js';
    authScript.onload = function() {
      // Verificar autenticação após carregar o script
      checkAuthentication();
    };
    document.head.appendChild(authScript);
  } else {
    // Verificar autenticação se o script já estiver carregado
    checkAuthentication();
  }

  setupTabs();
  setupMobileMenu();
  setupUserMenu();

  // Inicializar gráficos se estiver na página de análises
  if (document.body.getAttribute('data-page') === 'analytics') {
    setupAnalyticsCharts();
  }

  // Inicializar gráficos do perfil se estiver na página de perfil
  if (document.body.getAttribute('data-page') === 'profile') {
    setupProfileCharts();
  }

  // Inicializar filtros de desafios se estiver na página de desafios
  if (document.body.getAttribute('data-page') === 'challenges') {
    setupChallengeFilters();
  }
});

// Funções para a página de perfil
function setupProfileCharts() {
  const activityChartEl = document.getElementById('activity-chart');
  const progressChartEl = document.getElementById('progress-chart');

  if (activityChartEl) {
    // Implementação do gráfico de atividades
    console.log('Activity chart initialized');
  }

  if (progressChartEl) {
    // Implementação do gráfico de progresso
    console.log('Progress chart initialized');
  }
}

// Funções para a página de desafios
function setupChallengeFilters() {
  const filterForm = document.getElementById('challenge-filters');

  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Lógica de filtragem
      console.log('Filters applied');
    });
  }
}

// Funções para a página de análises
function setupAnalyticsCharts() {
  const weeklyChartEl = document.getElementById('weekly-chart');
  const monthlyChartEl = document.getElementById('monthly-chart');
  const yearlyChartEl = document.getElementById('yearly-chart');
  const activityDistributionEl = document.getElementById('activity-distribution');

  if (weeklyChartEl) {
    // Implementação do gráfico semanal
    const weeklyCtx = weeklyChartEl.getContext('2d');
    new Chart(weeklyCtx, {
      type: 'line',
      data: {
        labels: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
        datasets: [{
          label: 'Distância (km)',
          data: [5.2, 0, 8.3, 4.5, 0, 12.7, 6.8],
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Distância (km)'
            }
          }
        }
      }
    });
  }

  if (monthlyChartEl) {
    // Implementação do gráfico mensal
    const monthlyCtx = monthlyChartEl.getContext('2d');
    new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Distância (km)',
          data: [32.5, 45.8, 38.2, 42.1],
          backgroundColor: 'rgba(99, 102, 241, 0.7)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Distância (km)'
            }
          }
        }
      }
    });
  }

  if (yearlyChartEl) {
    // Implementação do gráfico anual
    const yearlyCtx = yearlyChartEl.getContext('2d');
    new Chart(yearlyCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
          label: 'Distância (km)',
          data: [120, 145, 165, 180, 210, 195, 220, 240, 200, 185, 170, 150],
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Distância (km)'
            }
          }
        }
      }
    });
  }

  if (activityDistributionEl) {
    // Implementação do gráfico de distribuição de atividades
    const distributionCtx = activityDistributionEl.getContext('2d');
    new Chart(distributionCtx, {
      type: 'doughnut',
      data: {
        labels: ['Corrida', 'Ciclismo', 'Caminhada', 'Natação', 'Outros'],
        datasets: [{
          data: [45, 25, 15, 10, 5],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(156, 163, 175, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
