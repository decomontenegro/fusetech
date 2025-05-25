/**
 * Serviço de análises avançadas para FuseLabs
 *
 * Este módulo fornece análises avançadas, previsões e tendências
 * com base nos dados de atividades do usuário.
 */

class AdvancedAnalyticsService {
  constructor() {
    // Dados de atividades
    this.activities = [];

    // Dados de desafios
    this.challenges = [];

    // Dados de estatísticas
    this.stats = {};

    // Dados de comparação
    this.comparisonData = null;

    // Zonas de treinamento
    this.trainingZones = {
      heartRate: [
        { name: 'Recuperação', min: 0, max: 60, color: '#4ade80' },
        { name: 'Aeróbica Leve', min: 60, max: 70, color: '#a3e635' },
        { name: 'Aeróbica Moderada', min: 70, max: 80, color: '#facc15' },
        { name: 'Aeróbica Intensa', min: 80, max: 90, color: '#fb923c' },
        { name: 'Limiar Anaeróbico', min: 90, max: 95, color: '#f87171' },
        { name: 'Anaeróbica', min: 95, max: 100, color: '#ef4444' }
      ],
      pace: [
        { name: 'Recuperação', min: 0, max: 60, color: '#4ade80' },
        { name: 'Aeróbica Leve', min: 60, max: 70, color: '#a3e635' },
        { name: 'Aeróbica Moderada', min: 70, max: 80, color: '#facc15' },
        { name: 'Aeróbica Intensa', min: 80, max: 90, color: '#fb923c' },
        { name: 'Limiar Anaeróbico', min: 90, max: 95, color: '#f87171' },
        { name: 'Anaeróbica', min: 95, max: 100, color: '#ef4444' }
      ],
      power: [
        { name: 'Recuperação', min: 0, max: 55, color: '#4ade80' },
        { name: 'Endurance', min: 55, max: 75, color: '#a3e635' },
        { name: 'Tempo', min: 75, max: 90, color: '#facc15' },
        { name: 'Limiar', min: 90, max: 105, color: '#fb923c' },
        { name: 'VO2 Max', min: 105, max: 120, color: '#f87171' },
        { name: 'Anaeróbica', min: 120, max: 150, color: '#ef4444' },
        { name: 'Neuromuscular', min: 150, max: 1000, color: '#c026d3' }
      ]
    };

    // Inicializar
    this.init();
  }

  /**
   * Inicializar o serviço de análises avançadas
   */
  async init() {
    try {
      // Carregar dados
      await this.loadData();

      console.log('Serviço de análises avançadas inicializado');
    } catch (error) {
      console.error('Erro ao inicializar serviço de análises avançadas:', error);
    }
  }

  /**
   * Carregar dados para análise
   */
  async loadData() {
    // Em um ambiente real, isso seria uma chamada de API
    // Para fins de demonstração, usamos dados simulados

    // Carregar atividades
    this.activities = this.generateSampleActivities();

    // Carregar desafios
    this.challenges = this.generateSampleChallenges();

    // Calcular estatísticas
    this.stats = this.calculateStats();

    console.log('Dados carregados para análise');
  }

  /**
   * Gerar atividades de exemplo
   * @returns {Array} - Array de atividades
   */
  generateSampleActivities() {
    const activities = [];
    const types = ['running', 'cycling', 'walking', 'swimming'];
    const now = new Date();

    // Gerar atividades para os últimos 90 dias
    for (let i = 0; i < 90; i++) {
      // Não gerar atividade para todos os dias
      if (Math.random() < 0.3) continue;

      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Gerar 1-3 atividades por dia
      const activitiesPerDay = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < activitiesPerDay; j++) {
        const type = types[Math.floor(Math.random() * types.length)];

        // Gerar dados com base no tipo
        let distance, duration, calories;

        switch (type) {
          case 'running':
            distance = 3 + Math.random() * 7; // 3-10 km
            duration = distance * (5 + Math.random() * 2) * 60; // 5-7 min/km
            calories = distance * (70 + Math.random() * 30); // 70-100 kcal/km
            break;
          case 'cycling':
            distance = 10 + Math.random() * 30; // 10-40 km
            duration = distance * (2 + Math.random()) * 60; // 2-3 min/km
            calories = distance * (30 + Math.random() * 20); // 30-50 kcal/km
            break;
          case 'walking':
            distance = 2 + Math.random() * 5; // 2-7 km
            duration = distance * (10 + Math.random() * 5) * 60; // 10-15 min/km
            calories = distance * (50 + Math.random() * 20); // 50-70 kcal/km
            break;
          case 'swimming':
            distance = 1 + Math.random() * 2; // 1-3 km
            duration = distance * (20 + Math.random() * 10) * 60; // 20-30 min/km
            calories = distance * (300 + Math.random() * 100); // 300-400 kcal/km
            break;
        }

        // Arredondar valores
        distance = Math.round(distance * 10) / 10;
        duration = Math.round(duration);
        calories = Math.round(calories);

        // Adicionar atividade
        activities.push({
          id: activities.length + 1,
          type,
          date: date.toISOString().split('T')[0],
          distance,
          duration,
          calories,
          heartRate: Math.round(120 + Math.random() * 40), // 120-160 bpm
          elevationGain: Math.round(Math.random() * 200), // 0-200 m
          pace: Math.round((duration / 60) / distance * 100) / 100 // min/km
        });
      }
    }

    return activities;
  }

  /**
   * Gerar desafios de exemplo
   * @returns {Array} - Array de desafios
   */
  generateSampleChallenges() {
    return [
      {
        id: 1,
        name: 'Desafio 10K de Verão',
        description: 'Complete uma corrida de 10 km',
        type: 'running',
        target: 10,
        unit: 'km',
        startDate: '2023-06-01',
        endDate: '2023-06-30',
        progress: 7.5,
        status: 'in_progress'
      },
      {
        id: 2,
        name: 'Maratona Virtual',
        description: 'Complete 42.2 km de corrida em um mês',
        type: 'running',
        target: 42.2,
        unit: 'km',
        startDate: '2023-05-01',
        endDate: '2023-05-31',
        progress: 42.2,
        status: 'completed'
      },
      {
        id: 3,
        name: 'Desafio de Ciclismo 100K',
        description: 'Pedale 100 km em duas semanas',
        type: 'cycling',
        target: 100,
        unit: 'km',
        startDate: '2023-07-01',
        endDate: '2023-07-15',
        progress: 0,
        status: 'pending'
      }
    ];
  }

  /**
   * Calcular estatísticas gerais
   * @returns {Object} - Estatísticas calculadas
   */
  calculateStats() {
    // Inicializar estatísticas
    const stats = {
      totalDistance: 0,
      totalDuration: 0,
      totalCalories: 0,
      totalActivities: this.activities.length,
      averagePace: 0,
      averageHeartRate: 0,
      byType: {},
      byMonth: {},
      byWeekday: {
        0: 0, // Domingo
        1: 0, // Segunda
        2: 0, // Terça
        3: 0, // Quarta
        4: 0, // Quinta
        5: 0, // Sexta
        6: 0  // Sábado
      }
    };

    // Inicializar estatísticas por tipo
    const types = ['running', 'cycling', 'walking', 'swimming'];
    types.forEach(type => {
      stats.byType[type] = {
        count: 0,
        distance: 0,
        duration: 0,
        calories: 0
      };
    });

    // Calcular estatísticas
    this.activities.forEach(activity => {
      // Estatísticas gerais
      stats.totalDistance += activity.distance;
      stats.totalDuration += activity.duration;
      stats.totalCalories += activity.calories;

      // Estatísticas por tipo
      if (stats.byType[activity.type]) {
        stats.byType[activity.type].count++;
        stats.byType[activity.type].distance += activity.distance;
        stats.byType[activity.type].duration += activity.duration;
        stats.byType[activity.type].calories += activity.calories;
      }

      // Estatísticas por mês
      const month = activity.date.substring(0, 7); // YYYY-MM
      if (!stats.byMonth[month]) {
        stats.byMonth[month] = {
          count: 0,
          distance: 0,
          duration: 0,
          calories: 0
        };
      }
      stats.byMonth[month].count++;
      stats.byMonth[month].distance += activity.distance;
      stats.byMonth[month].duration += activity.duration;
      stats.byMonth[month].calories += activity.calories;

      // Estatísticas por dia da semana
      const date = new Date(activity.date);
      const weekday = date.getDay();
      stats.byWeekday[weekday] += activity.distance;
    });

    // Calcular médias
    if (stats.totalActivities > 0) {
      stats.averagePace = stats.totalDuration / 60 / stats.totalDistance;

      let totalHeartRate = 0;
      let activitiesWithHeartRate = 0;

      this.activities.forEach(activity => {
        if (activity.heartRate) {
          totalHeartRate += activity.heartRate;
          activitiesWithHeartRate++;
        }
      });

      if (activitiesWithHeartRate > 0) {
        stats.averageHeartRate = totalHeartRate / activitiesWithHeartRate;
      }
    }

    // Arredondar valores
    stats.totalDistance = Math.round(stats.totalDistance * 10) / 10;
    stats.averagePace = Math.round(stats.averagePace * 100) / 100;
    stats.averageHeartRate = Math.round(stats.averageHeartRate);

    return stats;
  }

  /**
   * Obter previsão de desempenho
   * @param {String} type - Tipo de atividade
   * @param {String} metric - Métrica a ser prevista (distance, pace, etc.)
   * @param {Number} days - Número de dias para previsão
   * @returns {Array} - Array de previsões
   */
  getPrediction(type = 'running', metric = 'distance', days = 30) {
    // Filtrar atividades por tipo
    const filteredActivities = this.activities.filter(activity => activity.type === type);

    if (filteredActivities.length < 5) {
      console.warn('Dados insuficientes para previsão');
      return [];
    }

    // Ordenar por data
    filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Obter valores da métrica
    const values = filteredActivities.map(activity => activity[metric]);

    // Calcular tendência linear simples
    const n = values.length;
    const indices = Array.from({ length: n }, (_, i) => i);

    // Calcular médias
    const meanX = indices.reduce((sum, x) => sum + x, 0) / n;
    const meanY = values.reduce((sum, y) => sum + y, 0) / n;

    // Calcular coeficientes
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (indices[i] - meanX) * (values[i] - meanY);
      denominator += Math.pow(indices[i] - meanX, 2);
    }

    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;

    // Gerar previsões
    const predictions = [];
    const lastDate = new Date(filteredActivities[filteredActivities.length - 1].date);

    for (let i = 1; i <= days; i++) {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i);

      const predictedValue = intercept + slope * (n + i - 1);

      // Adicionar alguma variação aleatória
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9-1.1
      const finalValue = Math.max(0, predictedValue * randomFactor);

      predictions.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(finalValue * 100) / 100
      });
    }

    return predictions;
  }

  /**
   * Obter tendências de desempenho
   * @param {String} type - Tipo de atividade
   * @param {String} metric - Métrica a ser analisada (distance, pace, etc.)
   * @param {Number} periods - Número de períodos para análise
   * @returns {Object} - Objeto com tendências
   */
  getTrends(type = 'running', metric = 'distance', periods = 4) {
    // Filtrar atividades por tipo
    const filteredActivities = this.activities.filter(activity => activity.type === type);

    if (filteredActivities.length < 5) {
      console.warn('Dados insuficientes para análise de tendências');
      return { trend: 'neutral', data: [] };
    }

    // Ordenar por data
    filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Dividir em períodos
    const periodSize = Math.floor(filteredActivities.length / periods);
    const periodData = [];

    for (let i = 0; i < periods; i++) {
      const start = i * periodSize;
      const end = (i === periods - 1) ? filteredActivities.length : (i + 1) * periodSize;
      const periodActivities = filteredActivities.slice(start, end);

      // Calcular média da métrica para o período
      const sum = periodActivities.reduce((total, activity) => total + activity[metric], 0);
      const average = periodActivities.length > 0 ? sum / periodActivities.length : 0;

      // Determinar intervalo de datas
      const startDate = periodActivities[0]?.date || '';
      const endDate = periodActivities[periodActivities.length - 1]?.date || '';

      periodData.push({
        period: i + 1,
        startDate,
        endDate,
        average: Math.round(average * 100) / 100
      });
    }

    // Determinar tendência
    const firstAvg = periodData[0]?.average || 0;
    const lastAvg = periodData[periodData.length - 1]?.average || 0;

    let trend;
    if (lastAvg > firstAvg * 1.05) {
      trend = 'improving';
    } else if (lastAvg < firstAvg * 0.95) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    // Calcular percentual de mudança
    const changePercent = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

    return {
      trend,
      changePercent: Math.round(changePercent * 10) / 10,
      data: periodData
    };
  }

  /**
   * Carregar dados de comparação com outros usuários
   * @param {String} compareWith - Tipo de comparação ('similar', 'better', 'all')
   * @returns {Promise<Object>} - Dados de comparação
   */
  async loadComparisonData(compareWith = 'similar') {
    try {
      // Em um ambiente real, buscaríamos os dados do servidor
      // Aqui, estamos simulando com dados estáticos

      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Dados de comparação
      switch (compareWith) {
        case 'similar':
          this.comparisonData = {
            avgDistance: Math.round(this.stats.totalDistance * 0.9 * 10) / 10,
            avgDuration: Math.round(this.stats.totalDuration * 0.9),
            avgCalories: Math.round(this.stats.totalCalories * 0.9),
            avgHeartRate: Math.round(this.stats.averageHeartRate * 0.95),
            avgPace: Math.round(this.stats.averagePace * 1.05 * 100) / 100,
            description: 'Usuários com perfil similar ao seu'
          };
          break;

        case 'better':
          this.comparisonData = {
            avgDistance: Math.round(this.stats.totalDistance * 1.2 * 10) / 10,
            avgDuration: Math.round(this.stats.totalDuration * 1.1),
            avgCalories: Math.round(this.stats.totalCalories * 1.2),
            avgHeartRate: Math.round(this.stats.averageHeartRate * 0.9),
            avgPace: Math.round(this.stats.averagePace * 0.9 * 100) / 100,
            description: 'Usuários com desempenho superior'
          };
          break;

        case 'all':
        default:
          this.comparisonData = {
            avgDistance: Math.round(this.stats.totalDistance * 0.8 * 10) / 10,
            avgDuration: Math.round(this.stats.totalDuration * 0.8),
            avgCalories: Math.round(this.stats.totalCalories * 0.8),
            avgHeartRate: Math.round(this.stats.averageHeartRate * 1.02),
            avgPace: Math.round(this.stats.averagePace * 1.1 * 100) / 100,
            description: 'Todos os usuários'
          };
          break;
      }

      console.log(`Dados de comparação carregados: ${compareWith}`);

      return this.comparisonData;
    } catch (error) {
      console.error('Erro ao carregar dados de comparação:', error);
      return null;
    }
  }

  /**
   * Renderizar gráfico de comparação com outros usuários
   * @param {String} containerId - ID do container do gráfico
   * @param {String} compareWith - Tipo de comparação ('similar', 'better', 'all')
   */
  async renderComparisonChart(containerId = 'comparison-chart', compareWith = 'similar') {
    // Verificar se o elemento existe
    const container = document.getElementById(containerId);
    if (!container) return;

    // Verificar se o Chart.js está disponível
    if (typeof Chart === 'undefined') {
      container.innerHTML = '<div class="p-4 text-center text-gray-500">Chart.js não está disponível</div>';
      return;
    }

    // Verificar se os dados do usuário estão disponíveis
    if (!this.stats || Object.keys(this.stats).length === 0) {
      container.innerHTML = '<div class="p-4 text-center text-gray-500">Dados não disponíveis</div>';
      return;
    }

    // Carregar dados de comparação, se necessário
    if (!this.comparisonData) {
      // Mostrar indicador de carregamento
      container.innerHTML = '<div class="p-4 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i> Carregando dados de comparação...</div>';

      // Carregar dados
      await this.loadComparisonData(compareWith);

      // Limpar container
      container.innerHTML = '';
    }

    // Verificar se os dados de comparação estão disponíveis
    if (!this.comparisonData) {
      container.innerHTML = '<div class="p-4 text-center text-gray-500">Dados de comparação não disponíveis</div>';
      return;
    }

    // Preparar dados para o gráfico
    const labels = ['Distância', 'Duração', 'Calorias', 'Freq. Cardíaca', 'Ritmo'];

    // Normalizar dados para o gráfico radar (valores entre 0 e 100)
    const maxValues = {
      distance: Math.max(this.stats.totalDistance, this.comparisonData.avgDistance),
      duration: Math.max(this.stats.totalDuration, this.comparisonData.avgDuration),
      calories: Math.max(this.stats.totalCalories, this.comparisonData.avgCalories),
      heartRate: Math.max(this.stats.averageHeartRate, this.comparisonData.avgHeartRate),
      pace: Math.max(this.stats.averagePace, this.comparisonData.avgPace)
    };

    const userData = [
      (this.stats.totalDistance / maxValues.distance) * 100,
      (this.stats.totalDuration / maxValues.duration) * 100,
      (this.stats.totalCalories / maxValues.calories) * 100,
      (this.stats.averageHeartRate / maxValues.heartRate) * 100,
      // Para ritmo, menor é melhor, então invertemos
      ((maxValues.pace - this.stats.averagePace) / maxValues.pace) * 100
    ];

    const comparisonData = [
      (this.comparisonData.avgDistance / maxValues.distance) * 100,
      (this.comparisonData.avgDuration / maxValues.duration) * 100,
      (this.comparisonData.avgCalories / maxValues.calories) * 100,
      (this.comparisonData.avgHeartRate / maxValues.heartRate) * 100,
      // Para ritmo, menor é melhor, então invertemos
      ((maxValues.pace - this.comparisonData.avgPace) / maxValues.pace) * 100
    ];

    // Criar canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Adicionar título
    const title = document.createElement('h3');
    title.className = 'text-sm font-medium text-gray-700 mb-2 text-center';
    title.textContent = `Comparação com ${this.comparisonData.description}`;
    container.insertBefore(title, canvas);

    // Criar gráfico
    new Chart(canvas, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Seus dados',
            data: userData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#6366f1'
          },
          {
            label: 'Outros usuários',
            data: comparisonData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#f59e0b'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        },
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.raw || 0;
                const index = context.dataIndex;

                // Obter valores reais
                let realValue;
                if (context.dataset.label === 'Seus dados') {
                  switch (index) {
                    case 0: realValue = `${Math.round(this.stats.totalDistance * 10) / 10} km`; break;
                    case 1: realValue = `${Math.floor(this.stats.totalDuration / 3600)} h ${Math.floor((this.stats.totalDuration % 3600) / 60)} min`; break;
                    case 2: realValue = `${this.stats.totalCalories} kcal`; break;
                    case 3: realValue = `${Math.round(this.stats.averageHeartRate)} bpm`; break;
                    case 4: realValue = `${Math.round(this.stats.averagePace * 100) / 100} min/km`; break;
                  }
                } else {
                  switch (index) {
                    case 0: realValue = `${Math.round(this.comparisonData.avgDistance * 10) / 10} km`; break;
                    case 1: realValue = `${Math.floor(this.comparisonData.avgDuration / 3600)} h ${Math.floor((this.comparisonData.avgDuration % 3600) / 60)} min`; break;
                    case 2: realValue = `${this.comparisonData.avgCalories} kcal`; break;
                    case 3: realValue = `${Math.round(this.comparisonData.avgHeartRate)} bpm`; break;
                    case 4: realValue = `${Math.round(this.comparisonData.avgPace * 100) / 100} min/km`; break;
                  }
                }

                return `${label}: ${realValue}`;
              }.bind(this)
            }
          }
        }
      }
    });

    // Adicionar seletores de comparação
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'flex justify-center mt-4 space-x-2';

    const options = [
      { value: 'similar', label: 'Perfil similar' },
      { value: 'better', label: 'Desempenho superior' },
      { value: 'all', label: 'Todos os usuários' }
    ];

    options.forEach(option => {
      const button = document.createElement('button');
      button.className = `px-3 py-1 text-xs rounded-full ${option.value === compareWith ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
      button.textContent = option.label;
      button.addEventListener('click', () => {
        // Atualizar gráfico com nova comparação
        this.comparisonData = null; // Forçar recarregamento
        this.renderComparisonChart(containerId, option.value);
      });

      selectorContainer.appendChild(button);
    });

    container.appendChild(selectorContainer);
  }

  /**
   * Calcular distribuição de zonas de treinamento
   * @param {String} type - Tipo de atividade
   * @param {String} metric - Métrica para zonas ('heartRate', 'pace', 'power')
   * @returns {Array} - Distribuição de zonas
   */
  calculateTrainingZones(type = 'running', metric = 'heartRate') {
    // Filtrar atividades por tipo
    const filteredActivities = this.activities.filter(activity => activity.type === type);

    if (filteredActivities.length === 0) {
      console.warn('Sem atividades para calcular zonas de treinamento');
      return Array(this.trainingZones[metric].length).fill(0);
    }

    // Verificar se as atividades têm a métrica
    const activitiesWithMetric = filteredActivities.filter(activity => activity[metric]);

    if (activitiesWithMetric.length === 0) {
      console.warn(`Sem dados de ${metric} para calcular zonas de treinamento`);
      return Array(this.trainingZones[metric].length).fill(0);
    }

    // Obter valores máximos para normalização
    let maxValue;

    switch (metric) {
      case 'heartRate':
        // Usar frequência cardíaca máxima estimada (220 - idade)
        // Para simplificar, usamos 180 como padrão
        maxValue = 180;
        break;

      case 'pace':
        // Usar ritmo máximo (menor valor)
        maxValue = Math.min(...activitiesWithMetric.map(activity => activity.pace));
        break;

      case 'power':
        // Usar FTP estimado (potência máxima sustentável por 1 hora)
        // Para simplificar, usamos 95% da potência máxima
        const maxPower = Math.max(...activitiesWithMetric.map(activity => activity.power));
        maxValue = maxPower * 0.95;
        break;

      default:
        console.warn(`Métrica desconhecida: ${metric}`);
        return Array(this.trainingZones[metric].length).fill(0);
    }

    // Inicializar contadores de zona
    const zoneCounts = Array(this.trainingZones[metric].length).fill(0);

    // Contar pontos em cada zona
    activitiesWithMetric.forEach(activity => {
      // Normalizar valor para percentual do máximo
      let normalizedValue;

      if (metric === 'pace') {
        // Para ritmo, menor é melhor, então invertemos
        normalizedValue = (maxValue / activity[metric]) * 100;
      } else {
        normalizedValue = (activity[metric] / maxValue) * 100;
      }

      // Encontrar zona correspondente
      for (let i = 0; i < this.trainingZones[metric].length; i++) {
        const zone = this.trainingZones[metric][i];

        if (normalizedValue >= zone.min && normalizedValue < zone.max) {
          zoneCounts[i]++;
          break;
        }
      }
    });

    // Converter contagens para percentuais
    const total = zoneCounts.reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      return zoneCounts;
    }

    return zoneCounts.map(count => Math.round((count / total) * 100));
  }

  /**
   * Renderizar gráfico de zonas de treinamento
   * @param {String} containerId - ID do container do gráfico
   * @param {String} type - Tipo de atividade
   * @param {String} metric - Métrica para zonas ('heartRate', 'pace', 'power')
   */
  renderTrainingZonesChart(containerId = 'zones-chart', type = 'running', metric = 'heartRate') {
    // Verificar se o elemento existe
    const container = document.getElementById(containerId);
    if (!container) return;

    // Verificar se o Chart.js está disponível
    if (typeof Chart === 'undefined') {
      container.innerHTML = '<div class="p-4 text-center text-gray-500">Chart.js não está disponível</div>';
      return;
    }

    // Calcular distribuição de zonas
    const zoneData = this.calculateTrainingZones(type, metric);

    // Verificar se há dados
    if (zoneData.every(value => value === 0)) {
      container.innerHTML = '<div class="p-4 text-center text-gray-500">Dados insuficientes para análise de zonas</div>';
      return;
    }

    // Obter zonas
    const zones = this.trainingZones[metric];

    // Criar canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Adicionar título
    const title = document.createElement('h3');
    title.className = 'text-sm font-medium text-gray-700 mb-2 text-center';
    title.textContent = `Zonas de ${metric === 'heartRate' ? 'Frequência Cardíaca' : metric === 'pace' ? 'Ritmo' : 'Potência'}`;
    container.insertBefore(title, canvas);

    // Criar gráfico
    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: zones.map(zone => zone.name),
        datasets: [{
          data: zoneData,
          backgroundColor: zones.map(zone => zone.color),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    });

    // Adicionar seletores de métrica
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'flex justify-center mt-4 space-x-2';

    const options = [
      { value: 'heartRate', label: 'Freq. Cardíaca' },
      { value: 'pace', label: 'Ritmo' },
      { value: 'power', label: 'Potência' }
    ];

    options.forEach(option => {
      const button = document.createElement('button');
      button.className = `px-3 py-1 text-xs rounded-full ${option.value === metric ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`;
      button.textContent = option.label;
      button.addEventListener('click', () => {
        // Atualizar gráfico com nova métrica
        this.renderTrainingZonesChart(containerId, type, option.value);
      });

      selectorContainer.appendChild(button);
    });

    container.appendChild(selectorContainer);
  }
}

// Criar instância global
const advancedAnalytics = new AdvancedAnalyticsService();
