/**
 * Componente ActivityCard
 * 
 * Este componente exibe um cartão de atividade com informações
 * como tipo, distância, duração e outras métricas.
 */

class ActivityCard extends Component {
  /**
   * Construtor do componente
   * @param {HTMLElement} element - Elemento do componente
   * @param {Object} props - Props do componente
   */
  constructor(element, props) {
    super(element, props);
    
    // Estado inicial
    this.state = {
      expanded: false,
      loading: false,
      error: null,
      activity: props.activity || null
    };
    
    // Vincular métodos
    this.toggleExpand = this.toggleExpand.bind(this);
    this.handleShare = this.handleShare.bind(this);
    this.handleLike = this.handleLike.bind(this);
    this.handleComment = this.handleComment.bind(this);
    this.loadActivityDetails = this.loadActivityDetails.bind(this);
  }
  
  /**
   * Inicializar componente
   */
  init() {
    // Adicionar classes ao elemento
    this.element.classList.add('activity-card');
    
    // Carregar detalhes da atividade, se necessário
    if (this.props.activityId && !this.state.activity) {
      this.loadActivityDetails(this.props.activityId);
    }
  }
  
  /**
   * Carregar detalhes da atividade
   * @param {String} activityId - ID da atividade
   */
  async loadActivityDetails(activityId) {
    try {
      this.setState({ loading: true, error: null });
      
      // Em um ambiente real, buscaríamos os dados da API
      // Aqui, estamos simulando com um atraso
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dados simulados
      const activity = {
        id: activityId,
        type: ['running', 'cycling', 'swimming'][Math.floor(Math.random() * 3)],
        title: `Atividade ${activityId}`,
        date: new Date().toISOString(),
        distance: Math.round(Math.random() * 20 * 10) / 10,
        duration: Math.round(Math.random() * 120 * 60),
        calories: Math.round(Math.random() * 800),
        heartRate: Math.round(Math.random() * 40 + 140),
        pace: Math.round(Math.random() * 3 * 100 + 400) / 100,
        elevation: Math.round(Math.random() * 500),
        location: 'São Paulo, SP',
        user: {
          id: '123',
          name: 'João Silva',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
        },
        stats: {
          likes: Math.floor(Math.random() * 50),
          comments: Math.floor(Math.random() * 10),
          shares: Math.floor(Math.random() * 5)
        }
      };
      
      this.setState({ activity, loading: false });
    } catch (error) {
      console.error('Erro ao carregar detalhes da atividade:', error);
      this.setState({ error: 'Erro ao carregar detalhes da atividade', loading: false });
    }
  }
  
  /**
   * Alternar expansão do cartão
   */
  toggleExpand() {
    this.setState({ expanded: !this.state.expanded });
  }
  
  /**
   * Manipular compartilhamento
   */
  handleShare() {
    const { activity } = this.state;
    
    if (!activity) return;
    
    // Verificar se o serviço de compartilhamento está disponível
    if (window.socialSharing) {
      window.socialSharing.shareContent('activity', activity.id);
    } else {
      // Fallback para compartilhamento básico
      alert(`Compartilhando atividade: ${activity.title}`);
    }
  }
  
  /**
   * Manipular curtida
   */
  handleLike() {
    const { activity } = this.state;
    
    if (!activity) return;
    
    // Atualizar contagem de curtidas localmente
    const updatedActivity = {
      ...activity,
      stats: {
        ...activity.stats,
        likes: activity.stats.likes + 1
      }
    };
    
    this.setState({ activity: updatedActivity });
    
    // Em um ambiente real, enviaríamos uma requisição para a API
    console.log(`Curtiu atividade: ${activity.id}`);
  }
  
  /**
   * Manipular comentário
   */
  handleComment() {
    const { activity } = this.state;
    
    if (!activity) return;
    
    // Em um ambiente real, abriríamos um modal de comentário
    // Aqui, apenas simulamos
    const comment = prompt('Digite seu comentário:');
    
    if (comment) {
      // Atualizar contagem de comentários localmente
      const updatedActivity = {
        ...activity,
        stats: {
          ...activity.stats,
          comments: activity.stats.comments + 1
        }
      };
      
      this.setState({ activity: updatedActivity });
      
      // Em um ambiente real, enviaríamos uma requisição para a API
      console.log(`Comentou na atividade ${activity.id}: ${comment}`);
    }
  }
  
  /**
   * Formatar duração
   * @param {Number} seconds - Duração em segundos
   * @returns {String} - Duração formatada
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else {
      return `${minutes}m ${secs}s`;
    }
  }
  
  /**
   * Obter ícone para tipo de atividade
   * @param {String} type - Tipo de atividade
   * @returns {String} - Classe do ícone
   */
  getActivityIcon(type) {
    switch (type) {
      case 'running':
        return 'fa-running';
      case 'cycling':
        return 'fa-bicycle';
      case 'swimming':
        return 'fa-swimmer';
      default:
        return 'fa-dumbbell';
    }
  }
  
  /**
   * Renderizar componente
   */
  render() {
    const { activity, loading, error, expanded } = this.state;
    
    // Limpar conteúdo atual
    this.element.innerHTML = '';
    
    if (loading) {
      // Renderizar estado de carregamento
      this.element.innerHTML = `
        <div class="p-4 bg-white rounded-lg shadow-md animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      `;
      return;
    }
    
    if (error) {
      // Renderizar estado de erro
      this.element.innerHTML = `
        <div class="p-4 bg-white rounded-lg shadow-md">
          <div class="text-red-500 mb-2">
            <i class="fas fa-exclamation-circle mr-2"></i>
            Erro
          </div>
          <p class="text-gray-700">${error}</p>
          <button class="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors">
            Tentar novamente
          </button>
        </div>
      `;
      
      // Adicionar evento de clique ao botão
      const retryButton = this.element.querySelector('button');
      retryButton.addEventListener('click', () => {
        if (this.props.activityId) {
          this.loadActivityDetails(this.props.activityId);
        }
      });
      
      return;
    }
    
    if (!activity) {
      // Renderizar estado vazio
      this.element.innerHTML = `
        <div class="p-4 bg-white rounded-lg shadow-md">
          <p class="text-gray-500 text-center">Nenhuma atividade disponível</p>
        </div>
      `;
      return;
    }
    
    // Renderizar cartão de atividade
    const html = `
      <div class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${expanded ? 'transform hover:-translate-y-1' : ''}">
        <!-- Cabeçalho -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary mr-3">
              <i class="fas ${this.getActivityIcon(activity.type)}"></i>
            </div>
            <div class="flex-1">
              <h3 class="font-medium text-gray-900">${activity.title}</h3>
              <p class="text-sm text-gray-500">
                ${new Date(activity.date).toLocaleDateString()} • ${activity.location}
              </p>
            </div>
            <button class="expand-button text-gray-400 hover:text-gray-600">
              <i class="fas ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
            </button>
          </div>
        </div>
        
        <!-- Métricas principais -->
        <div class="p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-sm text-gray-500">Distância</p>
            <p class="font-semibold text-gray-900">${activity.distance} km</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Tempo</p>
            <p class="font-semibold text-gray-900">${this.formatDuration(activity.duration)}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Calorias</p>
            <p class="font-semibold text-gray-900">${activity.calories}</p>
          </div>
        </div>
        
        <!-- Detalhes (expandidos) -->
        <div class="details ${expanded ? 'block' : 'hidden'}">
          <div class="p-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Freq. Cardíaca</p>
              <p class="font-semibold text-gray-900">${activity.heartRate} bpm</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Ritmo</p>
              <p class="font-semibold text-gray-900">${activity.pace} min/km</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Elevação</p>
              <p class="font-semibold text-gray-900">${activity.elevation} m</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Tipo</p>
              <p class="font-semibold text-gray-900 capitalize">${activity.type}</p>
            </div>
          </div>
          
          <!-- Mapa (placeholder) -->
          <div class="p-4 border-t border-gray-100">
            <div class="bg-gray-100 h-40 rounded-lg flex items-center justify-center text-gray-400">
              <i class="fas fa-map-marker-alt mr-2"></i> Mapa da atividade
            </div>
          </div>
        </div>
        
        <!-- Ações -->
        <div class="p-4 border-t border-gray-100 flex justify-between">
          <button class="like-button flex items-center text-gray-500 hover:text-primary">
            <i class="far fa-heart mr-1"></i>
            <span>${activity.stats.likes}</span>
          </button>
          <button class="comment-button flex items-center text-gray-500 hover:text-primary">
            <i class="far fa-comment mr-1"></i>
            <span>${activity.stats.comments}</span>
          </button>
          <button class="share-button flex items-center text-gray-500 hover:text-primary">
            <i class="far fa-share-square mr-1"></i>
            <span>${activity.stats.shares}</span>
          </button>
        </div>
      </div>
    `;
    
    this.element.innerHTML = html;
    
    // Adicionar eventos
    const expandButton = this.element.querySelector('.expand-button');
    expandButton.addEventListener('click', this.toggleExpand);
    
    const likeButton = this.element.querySelector('.like-button');
    likeButton.addEventListener('click', this.handleLike);
    
    const commentButton = this.element.querySelector('.comment-button');
    commentButton.addEventListener('click', this.handleComment);
    
    const shareButton = this.element.querySelector('.share-button');
    shareButton.addEventListener('click', this.handleShare);
  }
  
  /**
   * Destruir componente
   */
  destroy() {
    // Remover eventos, se necessário
    // Limpar recursos, se necessário
  }
}

// Registrar componente
registerComponent('activity-card', ActivityCard);
