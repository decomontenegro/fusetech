/**
 * Componente NotificationCenter
 * 
 * Este componente gerencia e exibe notificações para o usuário,
 * incluindo notificações em tempo real e histórico.
 */

class NotificationCenter extends Component {
  /**
   * Construtor do componente
   * @param {HTMLElement} element - Elemento do componente
   * @param {Object} props - Props do componente
   */
  constructor(element, props) {
    super(element, props);
    
    // Estado inicial
    this.state = {
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      loading: true,
      error: null,
      filter: 'all' // 'all', 'unread', 'read'
    };
    
    // Vincular métodos
    this.toggleOpen = this.toggleOpen.bind(this);
    this.loadNotifications = this.loadNotifications.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
    this.deleteNotification = this.deleteNotification.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleNewNotification = this.handleNewNotification.bind(this);
  }
  
  /**
   * Inicializar componente
   */
  init() {
    // Adicionar classes ao elemento
    this.element.classList.add('notification-center');
    
    // Carregar notificações
    this.loadNotifications();
    
    // Adicionar listener para notificações em tempo real
    document.addEventListener('newNotification', this.handleNewNotification);
    
    // Adicionar listener para cliques fora do componente
    document.addEventListener('click', this.handleClickOutside);
  }
  
  /**
   * Carregar notificações
   */
  async loadNotifications() {
    try {
      this.setState({ loading: true, error: null });
      
      // Em um ambiente real, buscaríamos os dados da API
      // Aqui, estamos simulando com um atraso
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dados simulados
      const notifications = [
        {
          id: '1',
          type: 'achievement',
          title: 'Nova conquista desbloqueada!',
          message: 'Você desbloqueou a conquista "Maratonista" por correr 42km em uma semana.',
          date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutos atrás
          read: false,
          icon: 'fa-medal',
          color: 'text-yellow-500',
          action: '/conquistas.html'
        },
        {
          id: '2',
          type: 'challenge',
          title: 'Desafio concluído!',
          message: 'Você completou o desafio "30 dias de atividade" com sucesso.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
          read: false,
          icon: 'fa-trophy',
          color: 'text-green-500',
          action: '/desafios.html'
        },
        {
          id: '3',
          type: 'social',
          title: 'Novo seguidor',
          message: 'Maria Silva começou a seguir você.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
          read: true,
          icon: 'fa-user-plus',
          color: 'text-blue-500',
          action: '/perfil.html?id=maria'
        },
        {
          id: '4',
          type: 'activity',
          title: 'Lembrete de atividade',
          message: 'Você não registrou nenhuma atividade hoje. Que tal uma caminhada?',
          date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 horas atrás
          read: true,
          icon: 'fa-running',
          color: 'text-indigo-500',
          action: '/atividades.html'
        },
        {
          id: '5',
          type: 'system',
          title: 'Atualização do aplicativo',
          message: 'Uma nova versão do FuseLabs está disponível com novos recursos.',
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 dias atrás
          read: true,
          icon: 'fa-info-circle',
          color: 'text-gray-500',
          action: null
        }
      ];
      
      // Contar notificações não lidas
      const unreadCount = notifications.filter(notification => !notification.read).length;
      
      this.setState({ 
        notifications, 
        unreadCount, 
        loading: false 
      });
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      this.setState({ 
        error: 'Erro ao carregar notificações', 
        loading: false 
      });
    }
  }
  
  /**
   * Alternar abertura do centro de notificações
   */
  toggleOpen() {
    this.setState({ isOpen: !this.state.isOpen });
  }
  
  /**
   * Marcar notificação como lida
   * @param {String} id - ID da notificação
   */
  markAsRead(id) {
    const { notifications } = this.state;
    
    // Encontrar e atualizar a notificação
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === id && !notification.read) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    // Contar notificações não lidas
    const unreadCount = updatedNotifications.filter(notification => !notification.read).length;
    
    this.setState({ 
      notifications: updatedNotifications, 
      unreadCount 
    });
    
    // Em um ambiente real, enviaríamos uma requisição para a API
    console.log(`Marcou notificação ${id} como lida`);
  }
  
  /**
   * Marcar todas as notificações como lidas
   */
  markAllAsRead() {
    const { notifications } = this.state;
    
    // Marcar todas como lidas
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    this.setState({ 
      notifications: updatedNotifications, 
      unreadCount: 0 
    });
    
    // Em um ambiente real, enviaríamos uma requisição para a API
    console.log('Marcou todas as notificações como lidas');
  }
  
  /**
   * Excluir notificação
   * @param {String} id - ID da notificação
   * @param {Event} event - Evento do DOM
   */
  deleteNotification(id, event) {
    // Impedir propagação do evento
    event.stopPropagation();
    
    const { notifications } = this.state;
    
    // Encontrar a notificação
    const notification = notifications.find(n => n.id === id);
    
    // Remover a notificação
    const updatedNotifications = notifications.filter(n => n.id !== id);
    
    // Atualizar contagem de não lidas
    const unreadCount = notification && !notification.read
      ? this.state.unreadCount - 1
      : this.state.unreadCount;
    
    this.setState({ 
      notifications: updatedNotifications, 
      unreadCount 
    });
    
    // Em um ambiente real, enviaríamos uma requisição para a API
    console.log(`Excluiu notificação ${id}`);
  }
  
  /**
   * Manipular filtro de notificações
   * @param {String} filter - Filtro a ser aplicado
   */
  handleFilter(filter) {
    this.setState({ filter });
  }
  
  /**
   * Manipular clique fora do componente
   * @param {Event} event - Evento do DOM
   */
  handleClickOutside(event) {
    if (this.state.isOpen && !this.element.contains(event.target)) {
      this.setState({ isOpen: false });
    }
  }
  
  /**
   * Manipular nova notificação
   * @param {CustomEvent} event - Evento personalizado
   */
  handleNewNotification(event) {
    const notification = event.detail;
    
    if (!notification) return;
    
    // Adicionar notificação à lista
    const updatedNotifications = [
      notification,
      ...this.state.notifications
    ];
    
    // Atualizar contagem de não lidas
    const unreadCount = this.state.unreadCount + 1;
    
    this.setState({ 
      notifications: updatedNotifications, 
      unreadCount 
    });
    
    // Mostrar notificação toast
    this.showToast(notification);
  }
  
  /**
   * Mostrar notificação toast
   * @param {Object} notification - Notificação
   */
  showToast(notification) {
    // Verificar se o serviço de toast está disponível
    if (typeof window.showToast === 'function') {
      window.showToast(notification.title, 'info');
      return;
    }
    
    // Implementação fallback
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-white shadow-lg rounded-lg p-4 z-50 max-w-sm';
    toast.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <i class="fas ${notification.icon} ${notification.color}"></i>
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium text-gray-900">${notification.title}</p>
          <p class="mt-1 text-sm text-gray-500">${notification.message}</p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
            <span class="sr-only">Fechar</span>
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Adicionar evento de clique ao botão de fechar
    const closeButton = toast.querySelector('button');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(toast);
    });
    
    // Remover após 5 segundos
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 5000);
  }
  
  /**
   * Formatar data relativa
   * @param {String} dateString - Data em formato ISO
   * @returns {String} - Data formatada
   */
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'agora';
    } else if (diffMin < 60) {
      return `${diffMin} min atrás`;
    } else if (diffHour < 24) {
      return `${diffHour} h atrás`;
    } else if (diffDay < 7) {
      return `${diffDay} dia${diffDay > 1 ? 's' : ''} atrás`;
    } else {
      return date.toLocaleDateString();
    }
  }
  
  /**
   * Renderizar componente
   */
  render() {
    const { notifications, unreadCount, isOpen, loading, error, filter } = this.state;
    
    // Filtrar notificações
    const filteredNotifications = notifications.filter(notification => {
      if (filter === 'unread') return !notification.read;
      if (filter === 'read') return notification.read;
      return true;
    });
    
    // Limpar conteúdo atual
    this.element.innerHTML = '';
    
    // Renderizar componente
    const html = `
      <div class="relative inline-block text-left">
        <!-- Botão de notificações -->
        <button class="notification-button relative p-2 rounded-full text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none">
          <span class="sr-only">Notificações</span>
          <i class="fas fa-bell text-xl"></i>
          ${unreadCount > 0 ? `
            <span class="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
              ${unreadCount}
            </span>
          ` : ''}
        </button>
        
        <!-- Painel de notificações -->
        <div class="notification-panel origin-top-right absolute right-0 mt-2 w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${isOpen ? 'block' : 'hidden'}">
          <div class="p-4 border-b border-gray-100">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">Notificações</h3>
              ${unreadCount > 0 ? `
                <button class="mark-all-read text-sm text-primary hover:text-indigo-700">
                  Marcar todas como lidas
                </button>
              ` : ''}
            </div>
            
            <!-- Filtros -->
            <div class="mt-2 flex space-x-2">
              <button class="filter-button px-3 py-1 text-xs rounded-full ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}" data-filter="all">
                Todas
              </button>
              <button class="filter-button px-3 py-1 text-xs rounded-full ${filter === 'unread' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}" data-filter="unread">
                Não lidas
              </button>
              <button class="filter-button px-3 py-1 text-xs rounded-full ${filter === 'read' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}" data-filter="read">
                Lidas
              </button>
            </div>
          </div>
          
          <div class="max-h-96 overflow-y-auto">
            ${loading ? `
              <!-- Estado de carregamento -->
              <div class="p-4">
                <div class="animate-pulse space-y-4">
                  ${Array(3).fill().map(() => `
                    <div class="flex items-start">
                      <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200"></div>
                      <div class="ml-3 flex-1">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : error ? `
              <!-- Estado de erro -->
              <div class="p-4 text-center">
                <div class="text-red-500 mb-2">
                  <i class="fas fa-exclamation-circle text-xl"></i>
                </div>
                <p class="text-gray-700">${error}</p>
                <button class="retry-button mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Tentar novamente
                </button>
              </div>
            ` : filteredNotifications.length === 0 ? `
              <!-- Estado vazio -->
              <div class="p-8 text-center">
                <div class="text-gray-400 mb-2">
                  <i class="fas fa-bell-slash text-2xl"></i>
                </div>
                <p class="text-gray-500">Nenhuma notificação ${filter !== 'all' ? `${filter === 'unread' ? 'não lida' : 'lida'}` : ''}</p>
              </div>
            ` : `
              <!-- Lista de notificações -->
              <div class="divide-y divide-gray-100">
                ${filteredNotifications.map(notification => `
                  <div class="notification-item p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}" data-id="${notification.id}">
                    <div class="flex items-start">
                      <div class="flex-shrink-0 pt-0.5">
                        <div class="h-10 w-10 rounded-full bg-${notification.color.replace('text-', '')}-100 flex items-center justify-center">
                          <i class="fas ${notification.icon} ${notification.color}"></i>
                        </div>
                      </div>
                      <div class="ml-3 flex-1">
                        <p class="text-sm font-medium text-gray-900">${notification.title}</p>
                        <p class="text-sm text-gray-500">${notification.message}</p>
                        <p class="mt-1 text-xs text-gray-400">${this.formatRelativeTime(notification.date)}</p>
                      </div>
                      <div class="ml-4 flex-shrink-0 flex">
                        <button class="delete-notification bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none" data-id="${notification.id}">
                          <span class="sr-only">Excluir</span>
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
          
          <div class="p-2 border-t border-gray-100 text-center">
            <a href="/notifications.html" class="text-sm text-primary hover:text-indigo-700">
              Ver todas as notificações
            </a>
          </div>
        </div>
      </div>
    `;
    
    this.element.innerHTML = html;
    
    // Adicionar eventos
    const notificationButton = this.element.querySelector('.notification-button');
    notificationButton.addEventListener('click', this.toggleOpen);
    
    const markAllReadButton = this.element.querySelector('.mark-all-read');
    if (markAllReadButton) {
      markAllReadButton.addEventListener('click', this.markAllAsRead);
    }
    
    const filterButtons = this.element.querySelectorAll('.filter-button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        this.handleFilter(filter);
      });
    });
    
    const retryButton = this.element.querySelector('.retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', this.loadNotifications);
    }
    
    const notificationItems = this.element.querySelectorAll('.notification-item');
    notificationItems.forEach(item => {
      const id = item.getAttribute('data-id');
      
      item.addEventListener('click', () => {
        // Marcar como lida
        this.markAsRead(id);
        
        // Obter notificação
        const notification = notifications.find(n => n.id === id);
        
        // Navegar para a ação, se existir
        if (notification && notification.action) {
          window.location.href = notification.action;
        }
      });
    });
    
    const deleteButtons = this.element.querySelectorAll('.delete-notification');
    deleteButtons.forEach(button => {
      const id = button.getAttribute('data-id');
      
      button.addEventListener('click', (event) => {
        this.deleteNotification(id, event);
      });
    });
  }
  
  /**
   * Destruir componente
   */
  destroy() {
    // Remover listeners
    document.removeEventListener('newNotification', this.handleNewNotification);
    document.removeEventListener('click', this.handleClickOutside);
  }
}

// Registrar componente
registerComponent('notification-center', NotificationCenter);
