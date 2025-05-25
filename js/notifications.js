// Funcionalidades para gerenciar notificações

class NotificationsManager {
  constructor() {
    // Elementos do DOM
    this.notificationsButton = document.getElementById('notifications-button');
    this.notificationsDropdown = document.getElementById('notifications-dropdown');
    this.notificationsList = document.getElementById('notifications-list');
    this.markAllReadBtn = document.getElementById('mark-all-read-btn');
    this.notificationsSettingsBtn = document.getElementById('notifications-settings-btn');
    this.viewAllNotificationsLink = document.getElementById('view-all-notifications');
    this.notificationBadge = document.querySelector('#notifications-button .absolute');

    // Estado
    this.notifications = [];
    this.unreadCount = 0;
    this.isOpen = false;

    // Inicializar
    this.init();
  }

  // Inicializar o gerenciador de notificações
  init() {
    if (!this.notificationsButton || !this.notificationsDropdown) {
      console.warn('Elementos de notificações não encontrados');
      return;
    }

    // Configurar evento de clique no botão de notificações
    this.notificationsButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Impedir propagação para não fechar imediatamente
      this.toggleDropdown();
    });

    // Fechar o dropdown ao clicar fora dele
    document.addEventListener('click', (event) => {
      if (this.isOpen && !this.notificationsDropdown.contains(event.target) && event.target !== this.notificationsButton) {
        this.closeDropdown();
      }
    });

    // Configurar botão de marcar todas como lidas
    if (this.markAllReadBtn) {
      this.markAllReadBtn.addEventListener('click', () => {
        this.markAllAsRead();
      });
    }

    // Configurar botão de configurações
    if (this.notificationsSettingsBtn) {
      this.notificationsSettingsBtn.addEventListener('click', () => {
        // Implementar abertura de configurações de notificações
        console.log('Abrir configurações de notificações');
      });
    }

    // Configurar link para ver todas as notificações
    if (this.viewAllNotificationsLink) {
      this.viewAllNotificationsLink.addEventListener('click', (event) => {
        event.preventDefault();
        // Redirecionar para a página de notificações
        window.location.href = 'notificacoes.html';
      });
    }

    // Carregar notificações
    this.loadNotifications();
  }

  // Alternar exibição do dropdown
  toggleDropdown() {
    if (this.isOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  // Abrir o dropdown
  openDropdown() {
    this.notificationsDropdown.classList.remove('hidden');
    this.isOpen = true;
  }

  // Fechar o dropdown
  closeDropdown() {
    this.notificationsDropdown.classList.add('hidden');
    this.isOpen = false;
  }

  // Carregar notificações (simulação)
  loadNotifications() {
    // Em um ambiente real, isso seria uma chamada de API
    // Para fins de demonstração, usamos dados estáticos
    this.notifications = [
      {
        id: 1,
        type: 'comment',
        user: {
          name: 'Ana Silva',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        message: 'Comentou na sua atividade de corrida',
        time: '2 horas',
        read: false
      },
      {
        id: 2,
        type: 'challenge',
        message: 'Desafio de 10K de Verão está aberto para inscrições',
        time: '1 dia',
        read: true
      }
    ];

    this.updateUnreadCount();
    this.updateBadge();
  }

  // Atualizar contagem de não lidas
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(notification => !notification.read).length;
  }

  // Atualizar badge de notificações
  updateBadge() {
    if (this.notificationBadge) {
      if (this.unreadCount > 0) {
        this.notificationBadge.classList.remove('hidden');
      } else {
        this.notificationBadge.classList.add('hidden');
      }
    }
  }

  // Marcar todas as notificações como lidas
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });

    // Atualizar UI
    const unreadIndicators = this.notificationsList.querySelectorAll('.bg-primary');
    unreadIndicators.forEach(indicator => {
      indicator.classList.add('hidden');
    });

    this.unreadCount = 0;
    this.updateBadge();
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar gerenciador de notificações
  const notificationsManager = new NotificationsManager();
});
