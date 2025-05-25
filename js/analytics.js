// Funcionalidades para a página de análises

// Função para ajustar configurações de gráficos com base no tamanho da tela
function getResponsiveChartOptions(isMobile) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !isMobile,
        position: isMobile ? 'bottom' : 'top',
        labels: {
          boxWidth: isMobile ? 10 : 40,
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        bodyFont: {
          size: isMobile ? 10 : 12
        },
        titleFont: {
          size: isMobile ? 11 : 14
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: isMobile ? 8 : 12
          },
          maxRotation: isMobile ? 45 : 0
        },
        grid: {
          display: !isMobile
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: isMobile ? 8 : 12
          }
        },
        title: {
          display: !isMobile,
          font: {
            size: isMobile ? 10 : 14
          }
        }
      }
    }
  };
}

// Configurar gráficos da página de análises
function setupAnalyticsCharts() {
  // Verificar se estamos em um dispositivo móvel
  const isMobile = window.innerWidth < 768;
  const weeklyChartEl = document.getElementById('weekly-chart');
  const monthlyChartEl = document.getElementById('monthly-chart');
  const yearlyChartEl = document.getElementById('yearly-chart');
  const activityDistributionEl = document.getElementById('activity-distribution');

  // Configurar gráfico semanal
  if (weeklyChartEl) {
    const weeklyCtx = weeklyChartEl.getContext('2d');
    new Chart(weeklyCtx, {
      type: 'line',
      data: {
        labels: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
        datasets: [{
          label: 'Distância (km)',
          data: [5.2, 0, 8.5, 4.2, 0, 12.3, 6.8],
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(99, 102, 241, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        ...getResponsiveChartOptions(isMobile),
        scales: {
          ...getResponsiveChartOptions(isMobile).scales,
          y: {
            ...getResponsiveChartOptions(isMobile).scales.y,
            title: {
              ...getResponsiveChartOptions(isMobile).scales.y.title,
              text: 'Distância (km)'
            }
          }
        }
      }
    });
  }

  // Configurar gráfico mensal
  if (monthlyChartEl) {
    const monthlyCtx = monthlyChartEl.getContext('2d');
    new Chart(monthlyCtx, {
      type: 'bar',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Distância (km)',
          data: [35, 42, 38, 41],
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        ...getResponsiveChartOptions(isMobile),
        scales: {
          ...getResponsiveChartOptions(isMobile).scales,
          y: {
            ...getResponsiveChartOptions(isMobile).scales.y,
            title: {
              ...getResponsiveChartOptions(isMobile).scales.y.title,
              text: 'Distância (km)'
            }
          }
        }
      }
    });
  }

  // Configurar gráfico anual
  if (yearlyChartEl) {
    const yearlyCtx = yearlyChartEl.getContext('2d');
    new Chart(yearlyCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
          label: 'Distância (km)',
          data: [120, 145, 160, 175, 190, 210, 230, 245, 260, 280, 300, 320],
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        ...getResponsiveChartOptions(isMobile),
        scales: {
          ...getResponsiveChartOptions(isMobile).scales,
          y: {
            ...getResponsiveChartOptions(isMobile).scales.y,
            title: {
              ...getResponsiveChartOptions(isMobile).scales.y.title,
              text: 'Distância (km)'
            }
          }
        }
      }
    });
  }

  // Configurar gráfico de distribuição de atividades
  if (activityDistributionEl) {
    const distributionCtx = activityDistributionEl.getContext('2d');
    new Chart(distributionCtx, {
      type: 'doughnut',
      data: {
        labels: ['Corrida', 'Ciclismo', 'Caminhada', 'Natação', 'Outros'],
        datasets: [{
          data: [45, 25, 15, 10, 5],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(249, 115, 22, 0.8)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(249, 115, 22, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        ...getResponsiveChartOptions(isMobile),
        plugins: {
          ...getResponsiveChartOptions(isMobile).plugins,
          legend: {
            ...getResponsiveChartOptions(isMobile).plugins.legend,
            position: 'bottom',
            display: true
          }
        }
      }
    });
  }

  // Configurar tabs
  setupTabs();
}

// Configurar as tabs na página de análises
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  if (tabButtons.length > 0 && tabContents.length > 0) {
    // Esconder todos os conteúdos de tab exceto o primeiro
    tabContents.forEach((content, index) => {
      if (index !== 0) {
        content.classList.remove('active');
        content.classList.add('hidden');
        content.setAttribute('aria-hidden', 'true');
      } else {
        content.classList.add('active');
        content.classList.remove('hidden');
        content.setAttribute('aria-hidden', 'false');
      }
    });

    // Configurar eventos de clique
    tabButtons.forEach(button => {
      // Adicionar evento de clique
      button.addEventListener('click', () => {
        activateTab(button, tabButtons, tabContents);
      });

      // Adicionar navegação por teclado
      button.addEventListener('keydown', (event) => {
        handleTabKeydown(event, button, tabButtons, tabContents);
      });
    });
  }
}

// Ativar uma tab específica
function activateTab(selectedTab, allTabs, allContents) {
  const tabId = selectedTab.getAttribute('data-tab');

  // Atualizar atributos ARIA e classes para todos os botões de tab
  allTabs.forEach(tab => {
    const isSelected = tab === selectedTab;
    tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    tab.classList.remove('border-primary', 'text-primary');
    tab.classList.add('border-transparent', 'text-gray-500');

    // Se estiver usando tabindex para controle de foco
    // tab.setAttribute('tabindex', isSelected ? '0' : '-1');
  });

  // Adicionar classes ativas ao botão selecionado
  selectedTab.classList.remove('border-transparent', 'text-gray-500');
  selectedTab.classList.add('border-primary', 'text-primary');

  // Atualizar conteúdo de tab ativo
  allContents.forEach(content => {
    const isActive = content.id === tabId;
    content.classList.toggle('active', isActive);
    content.classList.toggle('hidden', !isActive);
    content.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });

  // Mostrar feedback visual
  if (typeof showToast === 'function') {
    showToast(`Mostrando estatísticas de ${selectedTab.textContent.trim()}`, 'info', 1500);
  }
}

// Lidar com navegação por teclado nas tabs
function handleTabKeydown(event, currentTab, allTabs, allContents) {
  const tabsArray = Array.from(allTabs);
  const currentIndex = tabsArray.indexOf(currentTab);
  let nextTab;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      event.preventDefault();
      nextTab = tabsArray[(currentIndex + 1) % tabsArray.length];
      nextTab.focus();
      activateTab(nextTab, allTabs, allContents);
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      event.preventDefault();
      nextTab = tabsArray[(currentIndex - 1 + tabsArray.length) % tabsArray.length];
      nextTab.focus();
      activateTab(nextTab, allTabs, allContents);
      break;
    case 'Home':
      event.preventDefault();
      nextTab = tabsArray[0];
      nextTab.focus();
      activateTab(nextTab, allTabs, allContents);
      break;
    case 'End':
      event.preventDefault();
      nextTab = tabsArray[tabsArray.length - 1];
      nextTab.focus();
      activateTab(nextTab, allTabs, allContents);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      activateTab(currentTab, allTabs, allContents);
      break;
  }
}

// Função para redimensionar gráficos quando a janela for redimensionada
function handleResize() {
  // Verificar se estamos na página de análises
  if (document.body.getAttribute('data-page') === 'analytics' || window.location.pathname.includes('analytics.html')) {
    // Destruir gráficos existentes
    Chart.helpers.each(Chart.instances, function(instance) {
      instance.destroy();
    });

    // Recriar gráficos com novas configurações responsivas
    setupAnalyticsCharts();
  }
}

// Configurar funcionalidades de exportação
function setupExportFeatures() {
  // Botões de exportação
  const exportButtons = [
    document.getElementById('export-all-button'),
    document.getElementById('export-weekly-button'),
    document.getElementById('export-monthly-button'),
    document.getElementById('export-yearly-button'),
    document.getElementById('export-distribution-button')
  ];

  // Dropdowns de exportação
  const exportDropdowns = [
    document.getElementById('export-all-dropdown'),
    document.getElementById('export-weekly-dropdown'),
    document.getElementById('export-monthly-dropdown'),
    document.getElementById('export-yearly-dropdown'),
    document.getElementById('export-distribution-dropdown')
  ];

  // Configurar eventos de clique nos botões
  exportButtons.forEach((button, index) => {
    if (button) {
      button.addEventListener('click', (event) => {
        event.stopPropagation();

        // Fechar todos os outros dropdowns
        exportDropdowns.forEach((dropdown, i) => {
          if (i !== index && dropdown) {
            dropdown.classList.add('hidden');
            if (exportButtons[i]) {
              exportButtons[i].setAttribute('aria-expanded', 'false');
            }
          }
        });

        // Alternar visibilidade do dropdown atual
        if (exportDropdowns[index]) {
          const isHidden = exportDropdowns[index].classList.toggle('hidden');
          button.setAttribute('aria-expanded', !isHidden);
        }
      });
    }
  });

  // Fechar dropdowns ao clicar fora
  document.addEventListener('click', (event) => {
    let clickedInsideDropdown = false;

    // Verificar se o clique foi dentro de algum dropdown ou botão
    exportDropdowns.forEach((dropdown, index) => {
      if (dropdown && !dropdown.classList.contains('hidden')) {
        if (dropdown.contains(event.target) || (exportButtons[index] && exportButtons[index].contains(event.target))) {
          clickedInsideDropdown = true;
        }
      }
    });

    // Se o clique foi fora, fechar todos os dropdowns
    if (!clickedInsideDropdown) {
      exportDropdowns.forEach((dropdown, index) => {
        if (dropdown) {
          dropdown.classList.add('hidden');
          if (exportButtons[index]) {
            exportButtons[index].setAttribute('aria-expanded', 'false');
          }
        }
      });
    }
  });

  // Configurar opções de exportação
  const exportOptions = document.querySelectorAll('.export-option');
  exportOptions.forEach(option => {
    option.addEventListener('click', (event) => {
      event.preventDefault();

      const format = option.getAttribute('data-format');
      const type = option.getAttribute('data-type');

      // Obter dados para exportação
      let data;
      let filename;

      switch (type) {
        case 'all':
          data = dataExporter.getActivitiesData();
          filename = 'todas-atividades';
          break;
        case 'weekly':
          data = getWeeklyData();
          filename = 'atividade-semanal';
          break;
        case 'monthly':
          data = getMonthlyData();
          filename = 'atividade-mensal';
          break;
        case 'yearly':
          data = getYearlyData();
          filename = 'atividade-anual';
          break;
        case 'distribution':
          data = getDistributionData();
          filename = 'distribuicao-atividades';
          break;
        default:
          data = [];
          filename = 'dados';
      }

      // Exportar dados
      const success = dataExporter.export(data, format, filename);

      // Fechar dropdown
      const dropdown = option.closest('.dropdown').querySelector('[id$="-dropdown"]');
      if (dropdown) {
        dropdown.classList.add('hidden');
        const button = option.closest('.dropdown').querySelector('button');
        if (button) {
          button.setAttribute('aria-expanded', 'false');
        }
      }

      // Mostrar feedback
      if (success) {
        showToast(`Dados exportados com sucesso em formato ${format.toUpperCase()}`, 'success');
      } else {
        showToast(`Falha ao exportar dados em formato ${format.toUpperCase()}`, 'error');
      }
    });
  });
}

// Obter dados para exportação
function getWeeklyData() {
  return [
    { dia: 'Segunda', distancia: 5.2 },
    { dia: 'Terça', distancia: 0 },
    { dia: 'Quarta', distancia: 8.5 },
    { dia: 'Quinta', distancia: 4.2 },
    { dia: 'Sexta', distancia: 0 },
    { dia: 'Sábado', distancia: 12.3 },
    { dia: 'Domingo', distancia: 6.8 }
  ];
}

function getMonthlyData() {
  return [
    { semana: 'Semana 1', distancia: 35 },
    { semana: 'Semana 2', distancia: 42 },
    { semana: 'Semana 3', distancia: 38 },
    { semana: 'Semana 4', distancia: 41 }
  ];
}

function getYearlyData() {
  return [
    { mes: 'Janeiro', distancia: 120 },
    { mes: 'Fevereiro', distancia: 145 },
    { mes: 'Março', distancia: 160 },
    { mes: 'Abril', distancia: 175 },
    { mes: 'Maio', distancia: 190 },
    { mes: 'Junho', distancia: 210 },
    { mes: 'Julho', distancia: 230 },
    { mes: 'Agosto', distancia: 245 },
    { mes: 'Setembro', distancia: 260 },
    { mes: 'Outubro', distancia: 280 },
    { mes: 'Novembro', distancia: 300 },
    { mes: 'Dezembro', distancia: 320 }
  ];
}

function getDistributionData() {
  return [
    { tipo: 'Corrida', porcentagem: 45 },
    { tipo: 'Ciclismo', porcentagem: 25 },
    { tipo: 'Caminhada', porcentagem: 15 },
    { tipo: 'Natação', porcentagem: 10 },
    { tipo: 'Outros', porcentagem: 5 }
  ];
}

// Configurar gráficos de previsão
function setupPredictionChart() {
  const canvas = document.getElementById('prediction-chart');
  if (!canvas) return;

  // Obter tipo de atividade selecionado
  const predictionType = document.getElementById('prediction-type').value || 'running';

  // Obter previsões
  const predictions = advancedAnalytics.getPrediction(predictionType, 'distance', 14);

  // Preparar dados para o gráfico
  const labels = predictions.map(p => p.date);
  const values = predictions.map(p => p.value);

  // Criar gráfico
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Distância Prevista (km)',
        data: values,
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      ...getResponsiveChartOptions(isMobile),
      scales: {
        ...getResponsiveChartOptions(isMobile).scales,
        y: {
          ...getResponsiveChartOptions(isMobile).scales.y,
          title: {
            ...getResponsiveChartOptions(isMobile).scales.y.title,
            text: 'Distância (km)'
          }
        }
      }
    }
  });

  // Configurar evento de alteração do tipo
  document.getElementById('prediction-type').addEventListener('change', function() {
    // Destruir gráfico existente
    Chart.helpers.each(Chart.instances, function(instance) {
      if (instance.canvas.id === 'prediction-chart') {
        instance.destroy();
      }
    });

    // Recriar gráfico
    setupPredictionChart();
  });
}

// Configurar gráficos de tendências
function setupTrendChart() {
  const canvas = document.getElementById('trend-chart');
  if (!canvas) return;

  // Obter tipo de atividade e métrica selecionados
  const trendMetric = document.getElementById('trend-metric').value || 'distance';

  // Obter tendências
  const trends = advancedAnalytics.getTrends('running', trendMetric, 4);

  // Preparar dados para o gráfico
  const labels = trends.data.map(p => `Período ${p.period}`);
  const values = trends.data.map(p => p.average);

  // Criar gráfico
  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Média por Período',
        data: values,
        backgroundColor: function(context) {
          const value = context.dataset.data[context.dataIndex];
          const firstValue = context.dataset.data[0];

          if (value > firstValue) {
            return 'rgba(16, 185, 129, 0.7)'; // Verde para melhoria
          } else if (value < firstValue) {
            return 'rgba(239, 68, 68, 0.7)'; // Vermelho para queda
          } else {
            return 'rgba(249, 115, 22, 0.7)'; // Laranja para estável
          }
        },
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      }]
    },
    options: {
      ...getResponsiveChartOptions(isMobile),
      scales: {
        ...getResponsiveChartOptions(isMobile).scales,
        y: {
          ...getResponsiveChartOptions(isMobile).scales.y,
          title: {
            ...getResponsiveChartOptions(isMobile).scales.y.title,
            text: trendMetric === 'distance' ? 'Distância (km)' :
                 trendMetric === 'pace' ? 'Ritmo (min/km)' :
                 trendMetric === 'duration' ? 'Duração (min)' : 'Calorias'
          }
        }
      }
    }
  });

  // Atualizar resumo de tendência
  updateTrendSummary(trends);

  // Configurar evento de alteração da métrica
  document.getElementById('trend-metric').addEventListener('change', function() {
    // Destruir gráfico existente
    Chart.helpers.each(Chart.instances, function(instance) {
      if (instance.canvas.id === 'trend-chart') {
        instance.destroy();
      }
    });

    // Recriar gráfico
    setupTrendChart();
  });
}

// Atualizar resumo de tendência
function updateTrendSummary(trends) {
  const trendIcon = document.getElementById('trend-icon');
  const trendText = document.getElementById('trend-text');
  const trendDetail = document.getElementById('trend-detail');

  if (!trendIcon || !trendText || !trendDetail) return;

  // Atualizar ícone
  trendIcon.innerHTML = '';
  let icon, color, text;

  if (trends.trend === 'improving') {
    icon = '<i class="fas fa-arrow-up"></i>';
    color = 'text-green-500';
    text = 'Seu desempenho está melhorando';
  } else if (trends.trend === 'declining') {
    icon = '<i class="fas fa-arrow-down"></i>';
    color = 'text-red-500';
    text = 'Seu desempenho está diminuindo';
  } else {
    icon = '<i class="fas fa-equals"></i>';
    color = 'text-yellow-500';
    text = 'Seu desempenho está estável';
  }

  trendIcon.innerHTML = icon;
  trendIcon.className = `mr-3 text-2xl ${color}`;
  trendText.textContent = text;

  // Atualizar detalhes
  const changePercent = Math.abs(trends.changePercent);
  let detailText;

  if (trends.trend === 'improving') {
    detailText = `Melhoria de ${changePercent}% nos últimos períodos`;
  } else if (trends.trend === 'declining') {
    detailText = `Queda de ${changePercent}% nos últimos períodos`;
  } else {
    detailText = 'Sem alterações significativas nos últimos períodos';
  }

  trendDetail.textContent = detailText;
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de análises
  if (document.body.getAttribute('data-page') === 'analytics' || window.location.pathname.includes('analytics.html')) {
    setupAnalyticsCharts();
    setupTabs();
    setupExportFeatures();

    // Configurar gráficos avançados após um pequeno delay para garantir que os dados estejam carregados
    setTimeout(() => {
      setupPredictionChart();
      setupTrendChart();
    }, 500);

    // Adicionar listener para redimensionamento da janela
    let resizeTimer;
    window.addEventListener('resize', function() {
      // Usar debounce para evitar múltiplas chamadas durante o redimensionamento
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 250);
    });
  }
});
