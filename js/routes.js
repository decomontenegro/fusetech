// Funcionalidades para a página de rotas

// Dados de exemplo para simulação
const sampleRoutes = [
  {
    id: 1,
    name: 'Corrida no Parque',
    type: 'running',
    distance: 5.2,
    elevation: 45,
    date: '2023-06-15',
    coordinates: [
      [-23.5505, -46.6333], // São Paulo
      [-23.5480, -46.6310],
      [-23.5460, -46.6290],
      [-23.5440, -46.6270],
      [-23.5420, -46.6250],
      [-23.5400, -46.6230],
      [-23.5380, -46.6210],
      [-23.5360, -46.6190],
      [-23.5340, -46.6170],
      [-23.5320, -46.6150]
    ]
  },
  {
    id: 2,
    name: 'Ciclismo na Avenida',
    type: 'cycling',
    distance: 15.8,
    elevation: 120,
    date: '2023-06-10',
    coordinates: [
      [-23.5505, -46.6333], // São Paulo
      [-23.5525, -46.6353],
      [-23.5545, -46.6373],
      [-23.5565, -46.6393],
      [-23.5585, -46.6413],
      [-23.5605, -46.6433],
      [-23.5625, -46.6453],
      [-23.5645, -46.6473],
      [-23.5665, -46.6493],
      [-23.5685, -46.6513]
    ]
  },
  {
    id: 3,
    name: 'Caminhada na Praia',
    type: 'walking',
    distance: 3.5,
    elevation: 10,
    date: '2023-06-05',
    coordinates: [
      [-23.0095, -43.3773], // Rio de Janeiro
      [-23.0075, -43.3753],
      [-23.0055, -43.3733],
      [-23.0035, -43.3713],
      [-23.0015, -43.3693],
      [-22.9995, -43.3673],
      [-22.9975, -43.3653],
      [-22.9955, -43.3633],
      [-22.9935, -43.3613],
      [-22.9915, -43.3593]
    ]
  }
];

// Classe para gerenciar as rotas
class RoutesManager {
  constructor() {
    this.map = null;
    this.routes = [];
    this.currentRoute = null;
    this.routeLayer = null;
    
    // Elementos da UI
    this.routesList = document.getElementById('routes-list');
    this.routeFilter = document.getElementById('route-filter');
    this.mapContainer = document.getElementById('map-container');
    this.routeDetails = document.getElementById('route-details');
    this.routeEmptyState = document.getElementById('route-empty-state');
    
    // Botões
    this.createRouteBtn = document.getElementById('create-route-btn');
    this.createRouteBtnEmpty = document.getElementById('create-route-btn-empty');
    this.importRouteBtn = document.getElementById('import-route-btn');
    this.startActivityBtn = document.getElementById('start-activity-btn');
    this.editRouteBtn = document.getElementById('edit-route-btn');
    this.shareRouteBtn = document.getElementById('share-route-btn');
    this.deleteRouteBtn = document.getElementById('delete-route-btn');
    
    // Modal de importação
    this.importGpxModal = document.getElementById('import-gpx-modal');
    this.gpxFileUpload = document.getElementById('gpx-file-upload');
    this.gpxFileInfo = document.getElementById('gpx-file-info');
    this.gpxFilename = document.getElementById('gpx-filename');
    this.gpxFilesize = document.getElementById('gpx-filesize');
    this.routeNameInput = document.getElementById('route-name-input');
    this.routeTypeInput = document.getElementById('route-type-input');
    this.importGpxBtn = document.getElementById('import-gpx-btn');
    this.cancelImportBtn = document.getElementById('cancel-import-btn');
    
    this.init();
  }
  
  init() {
    // Inicializar o mapa
    this.initMap();
    
    // Carregar rotas
    this.loadRoutes();
    
    // Configurar eventos
    this.setupEventListeners();
  }
  
  initMap() {
    if (!this.mapContainer) return;
    
    // Criar o mapa
    this.map = L.map(this.mapContainer).setView([-23.5505, -46.6333], 13); // São Paulo como padrão
    
    // Adicionar camada de mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }
  
  loadRoutes() {
    // Em um ambiente real, isso seria uma chamada de API
    setTimeout(() => {
      this.routes = sampleRoutes;
      this.renderRoutesList();
    }, 1000);
  }
  
  renderRoutesList() {
    if (!this.routesList) return;
    
    // Filtrar rotas se necessário
    const filter = this.routeFilter ? this.routeFilter.value : 'all';
    const filteredRoutes = filter === 'all' 
      ? this.routes 
      : this.routes.filter(route => route.type === filter);
    
    // Limpar lista
    this.routesList.innerHTML = '';
    
    if (filteredRoutes.length === 0) {
      this.routesList.innerHTML = `
        <li class="p-4 text-center text-gray-500">
          Nenhuma rota encontrada.
        </li>
      `;
      return;
    }
    
    // Renderizar cada rota
    filteredRoutes.forEach(route => {
      const routeItem = document.createElement('li');
      routeItem.className = `route-card p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent ${this.currentRoute && this.currentRoute.id === route.id ? 'active' : ''}`;
      routeItem.dataset.routeId = route.id;
      
      let typeIcon, typeColor;
      switch (route.type) {
        case 'running':
          typeIcon = 'fa-running';
          typeColor = 'text-blue-500';
          break;
        case 'cycling':
          typeIcon = 'fa-bicycle';
          typeColor = 'text-green-500';
          break;
        case 'walking':
          typeIcon = 'fa-walking';
          typeColor = 'text-yellow-500';
          break;
        default:
          typeIcon = 'fa-map-marker-alt';
          typeColor = 'text-gray-500';
      }
      
      routeItem.innerHTML = `
        <div class="flex items-center">
          <div class="flex-shrink-0 mr-3">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <i class="fas ${typeIcon} ${typeColor}"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              ${route.name}
            </p>
            <div class="flex items-center text-xs text-gray-500 mt-1">
              <span class="mr-2"><i class="fas fa-ruler-horizontal mr-1"></i> ${route.distance} km</span>
              <span><i class="fas fa-mountain mr-1"></i> ${route.elevation} m</span>
            </div>
          </div>
        </div>
      `;
      
      // Adicionar evento de clique
      routeItem.addEventListener('click', () => {
        this.selectRoute(route.id);
      });
      
      this.routesList.appendChild(routeItem);
    });
  }
  
  selectRoute(routeId) {
    // Encontrar a rota
    const route = this.routes.find(r => r.id === routeId);
    if (!route) return;
    
    // Atualizar rota atual
    this.currentRoute = route;
    
    // Atualizar UI
    this.updateRouteSelection();
    this.showRouteDetails();
    this.displayRouteOnMap();
  }
  
  updateRouteSelection() {
    // Atualizar seleção na lista
    const routeItems = this.routesList.querySelectorAll('.route-card');
    routeItems.forEach(item => {
      if (parseInt(item.dataset.routeId) === this.currentRoute.id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  showRouteDetails() {
    if (!this.routeDetails || !this.routeEmptyState || !this.currentRoute) return;
    
    // Mostrar detalhes e esconder estado vazio
    this.routeDetails.classList.remove('hidden');
    this.routeEmptyState.classList.add('hidden');
    
    // Preencher detalhes
    document.getElementById('route-name').textContent = this.currentRoute.name;
    document.getElementById('route-distance').textContent = `${this.currentRoute.distance} km`;
    document.getElementById('route-elevation').textContent = `${this.currentRoute.elevation} m`;
    
    let typeText;
    switch (this.currentRoute.type) {
      case 'running': typeText = 'Corrida'; break;
      case 'cycling': typeText = 'Ciclismo'; break;
      case 'walking': typeText = 'Caminhada'; break;
      default: typeText = 'Outro';
    }
    document.getElementById('route-type').textContent = typeText;
    
    // Formatar data
    const date = new Date(this.currentRoute.date);
    document.getElementById('route-date').textContent = date.toLocaleDateString('pt-BR');
  }
  
  displayRouteOnMap() {
    if (!this.map || !this.currentRoute) return;
    
    // Remover camada anterior se existir
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }
    
    // Criar nova camada com a rota
    this.routeLayer = L.polyline(this.currentRoute.coordinates, {
      color: this.getRouteColor(this.currentRoute.type),
      weight: 5,
      opacity: 0.7
    }).addTo(this.map);
    
    // Ajustar visualização para mostrar toda a rota
    this.map.fitBounds(this.routeLayer.getBounds());
    
    // Adicionar marcadores de início e fim
    const startPoint = this.currentRoute.coordinates[0];
    const endPoint = this.currentRoute.coordinates[this.currentRoute.coordinates.length - 1];
    
    L.marker(startPoint, {
      icon: L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      })
    }).addTo(this.map);
    
    L.marker(endPoint, {
      icon: L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      })
    }).addTo(this.map);
  }
  
  getRouteColor(type) {
    switch (type) {
      case 'running': return '#3b82f6'; // blue-500
      case 'cycling': return '#10b981'; // green-500
      case 'walking': return '#f59e0b'; // yellow-500
      default: return '#6b7280'; // gray-500
    }
  }
  
  setupEventListeners() {
    // Filtro de rotas
    if (this.routeFilter) {
      this.routeFilter.addEventListener('change', () => {
        this.renderRoutesList();
      });
    }
    
    // Botão de criar rota
    if (this.createRouteBtn) {
      this.createRouteBtn.addEventListener('click', () => {
        alert('Funcionalidade de criação de rota será implementada em breve!');
      });
    }
    
    if (this.createRouteBtnEmpty) {
      this.createRouteBtnEmpty.addEventListener('click', () => {
        alert('Funcionalidade de criação de rota será implementada em breve!');
      });
    }
    
    // Botão de importar rota
    if (this.importRouteBtn) {
      this.importRouteBtn.addEventListener('click', () => {
        this.openImportModal();
      });
    }
    
    // Botões de ação da rota
    if (this.startActivityBtn) {
      this.startActivityBtn.addEventListener('click', () => {
        if (!this.currentRoute) return;
        alert(`Iniciando atividade na rota: ${this.currentRoute.name}`);
      });
    }
    
    if (this.editRouteBtn) {
      this.editRouteBtn.addEventListener('click', () => {
        if (!this.currentRoute) return;
        alert(`Editando rota: ${this.currentRoute.name}`);
      });
    }
    
    if (this.shareRouteBtn) {
      this.shareRouteBtn.addEventListener('click', () => {
        if (!this.currentRoute) return;
        alert(`Compartilhando rota: ${this.currentRoute.name}`);
      });
    }
    
    if (this.deleteRouteBtn) {
      this.deleteRouteBtn.addEventListener('click', () => {
        if (!this.currentRoute) return;
        if (confirm(`Tem certeza que deseja excluir a rota "${this.currentRoute.name}"?`)) {
          this.deleteRoute(this.currentRoute.id);
        }
      });
    }
    
    // Modal de importação
    if (this.gpxFileUpload) {
      this.gpxFileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.gpxFileInfo.classList.remove('hidden');
          this.gpxFilename.textContent = file.name;
          this.gpxFilesize.textContent = this.formatFileSize(file.size);
          this.importGpxBtn.disabled = false;
          
          // Sugerir nome da rota baseado no nome do arquivo
          const fileName = file.name.replace('.gpx', '');
          this.routeNameInput.value = fileName;
        }
      });
    }
    
    if (this.importGpxBtn) {
      this.importGpxBtn.addEventListener('click', () => {
        this.importGpxFile();
      });
    }
    
    if (this.cancelImportBtn) {
      this.cancelImportBtn.addEventListener('click', () => {
        this.closeImportModal();
      });
    }
  }
  
  openImportModal() {
    if (!this.importGpxModal) return;
    
    // Resetar formulário
    this.gpxFileUpload.value = '';
    this.gpxFileInfo.classList.add('hidden');
    this.routeNameInput.value = '';
    this.importGpxBtn.disabled = true;
    
    // Mostrar modal
    this.importGpxModal.classList.remove('hidden');
  }
  
  closeImportModal() {
    if (!this.importGpxModal) return;
    this.importGpxModal.classList.add('hidden');
  }
  
  importGpxFile() {
    const file = this.gpxFileUpload.files[0];
    if (!file) return;
    
    const routeName = this.routeNameInput.value.trim() || file.name.replace('.gpx', '');
    const routeType = this.routeTypeInput.value;
    
    // Em um ambiente real, isso enviaria o arquivo para o servidor
    // Aqui vamos simular a importação
    
    // Criar uma nova rota simulada
    const newRoute = {
      id: this.routes.length + 1,
      name: routeName,
      type: routeType,
      distance: Math.round((Math.random() * 10 + 2) * 10) / 10, // 2-12 km
      elevation: Math.round(Math.random() * 200), // 0-200 m
      date: new Date().toISOString().split('T')[0],
      coordinates: this.generateRandomCoordinates()
    };
    
    // Adicionar à lista de rotas
    this.routes.push(newRoute);
    
    // Atualizar UI
    this.renderRoutesList();
    this.selectRoute(newRoute.id);
    
    // Fechar modal
    this.closeImportModal();
    
    // Mostrar mensagem de sucesso
    alert(`Rota "${routeName}" importada com sucesso!`);
  }
  
  deleteRoute(routeId) {
    // Remover rota
    this.routes = this.routes.filter(route => route.id !== routeId);
    
    // Limpar rota atual se for a que foi excluída
    if (this.currentRoute && this.currentRoute.id === routeId) {
      this.currentRoute = null;
      
      // Limpar mapa
      if (this.routeLayer) {
        this.map.removeLayer(this.routeLayer);
        this.routeLayer = null;
      }
      
      // Mostrar estado vazio
      this.routeDetails.classList.add('hidden');
      this.routeEmptyState.classList.remove('hidden');
    }
    
    // Atualizar lista
    this.renderRoutesList();
  }
  
  generateRandomCoordinates() {
    // Gerar coordenadas aleatórias em torno de São Paulo
    const baseCoord = [-23.5505, -46.6333];
    const numPoints = 10 + Math.floor(Math.random() * 10); // 10-20 pontos
    const coordinates = [baseCoord];
    
    for (let i = 1; i < numPoints; i++) {
      const lastPoint = coordinates[i - 1];
      const newPoint = [
        lastPoint[0] + (Math.random() - 0.5) * 0.01,
        lastPoint[1] + (Math.random() - 0.5) * 0.01
      ];
      coordinates.push(newPoint);
    }
    
    return coordinates;
  }
  
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de rotas
  if (document.body.getAttribute('data-page') === 'routes') {
    const routesManager = new RoutesManager();
  }
});
