/**
 * FUSEtech Desktop Notifications System
 * Sistema avançado de notificações para desktop com diferentes tipos e ações
 */

class DesktopNotifications {
  constructor() {
    this.notifications = new Map();
    this.container = null;
    this.isDesktop = window.innerWidth >= 1024;
    this.maxNotifications = 5;
    this.defaultDuration = 5000;
    
    this.init();
  }

  init() {
    if (!this.isDesktop) return;
    
    this.createContainer();
    this.setupNotificationCenter();
    this.loadStoredNotifications();
    
    // Redetectar no resize
    window.addEventListener('resize', () => {
      this.isDesktop = window.innerWidth >= 1024;
      if (!this.isDesktop) {
        this.hideContainer();
      } else {
        this.showContainer();
      }
    });
  }

  /**
   * Cria container de notificações
   */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'desktop-notifications';
    this.container.className = 'desktop-notifications-container';
    
    document.body.appendChild(this.container);
  }

  /**
   * Configura centro de notificações
   */
  setupNotificationCenter() {
    const bellButton = document.querySelector('.btn-icon-only.btn-ghost.relative');
    if (!bellButton) return;

    // Criar dropdown de notificações
    const dropdown = document.createElement('div');
    dropdown.className = 'notification-center-dropdown';
    dropdown.innerHTML = `
      <div class="notification-center-header">
        <h3 class="notification-center-title">Notificações</h3>
        <button class="notification-center-clear" id="clear-all-notifications">
          <i class="fas fa-check-double"></i>
          Marcar todas como lidas
        </button>
      </div>
      <div class="notification-center-list" id="notification-center-list">
        <div class="notification-center-empty">
          <i class="fas fa-bell-slash"></i>
          <p>Nenhuma notificação</p>
        </div>
      </div>
    `;

    bellButton.appendChild(dropdown);

    // Configurar eventos
    bellButton.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleNotificationCenter();
    });

    document.addEventListener('click', (e) => {
      if (!bellButton.contains(e.target)) {
        this.closeNotificationCenter();
      }
    });

    // Configurar botão de limpar
    const clearButton = dropdown.querySelector('#clear-all-notifications');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearAllNotifications();
      });
    }
  }

  /**
   * Mostra notificação toast
   */
  showToast(type, title, message, options = {}) {
    const id = this.generateId();
    const duration = options.duration || this.defaultDuration;
    const actions = options.actions || [];
    
    const notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      actions
    };

    // Adicionar à lista
    this.notifications.set(id, notification);
    
    // Criar elemento toast
    const toast = this.createToastElement(notification);
    this.container.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto-remover se não for persistente
    if (!options.persistent) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }
    
    // Atualizar centro de notificações
    this.updateNotificationCenter();
    this.updateBadge();
    
    // Salvar no localStorage
    this.saveNotifications();
    
    return id;
  }

  /**
   * Cria elemento toast
   */
  createToastElement(notification) {
    const toast = document.createElement('div');
    toast.className = `desktop-toast desktop-toast-${notification.type}`;
    toast.dataset.notificationId = notification.id;
    
    toast.innerHTML = `
      <div class="desktop-toast-icon">
        <i class="fas fa-${this.getIconForType(notification.type)}"></i>
      </div>
      <div class="desktop-toast-content">
        <div class="desktop-toast-title">${notification.title}</div>
        <div class="desktop-toast-message">${notification.message}</div>
        ${notification.actions.length > 0 ? `
          <div class="desktop-toast-actions">
            ${notification.actions.map(action => `
              <button class="desktop-toast-action" data-action="${action.id}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <button class="desktop-toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Configurar eventos
    const closeBtn = toast.querySelector('.desktop-toast-close');
    closeBtn.addEventListener('click', () => {
      this.removeToast(notification.id);
    });
    
    // Configurar ações
    const actionButtons = toast.querySelectorAll('.desktop-toast-action');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const actionId = btn.dataset.action;
        const action = notification.actions.find(a => a.id === actionId);
        if (action && action.handler) {
          action.handler();
        }
        this.removeToast(notification.id);
      });
    });
    
    return toast;
  }

  /**
   * Remove toast
   */
  removeToast(id) {
    const toast = this.container.querySelector(`[data-notification-id="${id}"]`);
    if (toast) {
      toast.classList.add('removing');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }

  /**
   * Atualiza centro de notificações
   */
  updateNotificationCenter() {
    const list = document.getElementById('notification-center-list');
    if (!list) return;
    
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10); // Mostrar apenas as 10 mais recentes
    
    if (notifications.length === 0) {
      list.innerHTML = `
        <div class="notification-center-empty">
          <i class="fas fa-bell-slash"></i>
          <p>Nenhuma notificação</p>
        </div>
      `;
      return;
    }
    
    list.innerHTML = notifications.map(notification => `
      <div class="notification-center-item ${notification.read ? 'read' : 'unread'}" 
           data-notification-id="${notification.id}">
        <div class="notification-center-item-icon">
          <i class="fas fa-${this.getIconForType(notification.type)}"></i>
        </div>
        <div class="notification-center-item-content">
          <div class="notification-center-item-title">${notification.title}</div>
          <div class="notification-center-item-message">${notification.message}</div>
          <div class="notification-center-item-time">${this.formatTime(notification.timestamp)}</div>
        </div>
        <button class="notification-center-item-close" data-action="remove">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
    
    // Configurar eventos dos itens
    list.querySelectorAll('.notification-center-item').forEach(item => {
      const id = item.dataset.notificationId;
      
      item.addEventListener('click', () => {
        this.markAsRead(id);
      });
      
      const closeBtn = item.querySelector('.notification-center-item-close');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeNotification(id);
      });
    });
  }

  /**
   * Atualiza badge de notificações
   */
  updateBadge() {
    const badge = document.querySelector('.btn-icon-only.btn-ghost.relative .absolute');
    const unreadCount = Array.from(this.notifications.values())
      .filter(n => !n.read).length;
    
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = 'block';
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      } else {
        badge.style.display = 'none';
      }
    }
  }

  /**
   * Marca notificação como lida
   */
  markAsRead(id) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.updateNotificationCenter();
      this.updateBadge();
      this.saveNotifications();
    }
  }

  /**
   * Remove notificação
   */
  removeNotification(id) {
    this.notifications.delete(id);
    this.updateNotificationCenter();
    this.updateBadge();
    this.saveNotifications();
  }

  /**
   * Limpa todas as notificações
   */
  clearAllNotifications() {
    Array.from(this.notifications.keys()).forEach(id => {
      this.markAsRead(id);
    });
  }

  /**
   * Alterna centro de notificações
   */
  toggleNotificationCenter() {
    const dropdown = document.querySelector('.notification-center-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
    }
  }

  /**
   * Fecha centro de notificações
   */
  closeNotificationCenter() {
    const dropdown = document.querySelector('.notification-center-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  }

  /**
   * Obtém ícone para tipo de notificação
   */
  getIconForType(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle',
      achievement: 'trophy',
      activity: 'running',
      social: 'users',
      system: 'cog'
    };
    
    return icons[type] || 'bell';
  }

  /**
   * Formata timestamp
   */
  formatTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return timestamp.toLocaleDateString('pt-BR');
  }

  /**
   * Gera ID único
   */
  generateId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Salva notificações no localStorage
   */
  saveNotifications() {
    try {
      const data = Array.from(this.notifications.entries()).map(([id, notification]) => [
        id,
        {
          ...notification,
          timestamp: notification.timestamp.toISOString(),
          actions: [] // Não salvar handlers de ações
        }
      ]);
      
      localStorage.setItem('fusetech-notifications', JSON.stringify(data));
    } catch (error) {
      console.warn('Erro ao salvar notificações:', error);
    }
  }

  /**
   * Carrega notificações do localStorage
   */
  loadStoredNotifications() {
    try {
      const stored = localStorage.getItem('fusetech-notifications');
      if (stored) {
        const data = JSON.parse(stored);
        data.forEach(([id, notification]) => {
          this.notifications.set(id, {
            ...notification,
            timestamp: new Date(notification.timestamp),
            actions: []
          });
        });
        
        this.updateNotificationCenter();
        this.updateBadge();
      }
    } catch (error) {
      console.warn('Erro ao carregar notificações:', error);
    }
  }

  /**
   * Mostra container
   */
  showContainer() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  /**
   * Esconde container
   */
  hideContainer() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  // Métodos públicos para diferentes tipos de notificação
  success(title, message, options = {}) {
    return this.showToast('success', title, message, options);
  }

  error(title, message, options = {}) {
    return this.showToast('error', title, message, options);
  }

  warning(title, message, options = {}) {
    return this.showToast('warning', title, message, options);
  }

  info(title, message, options = {}) {
    return this.showToast('info', title, message, options);
  }

  achievement(title, message, options = {}) {
    return this.showToast('achievement', title, message, options);
  }

  activity(title, message, options = {}) {
    return this.showToast('activity', title, message, options);
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.desktopNotifications = new DesktopNotifications();
  
  // Exemplos de notificações para demonstração
  setTimeout(() => {
    if (window.desktopNotifications) {
      window.desktopNotifications.success(
        'Bem-vindo!', 
        'Sistema de notificações desktop ativado'
      );
    }
  }, 2000);
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DesktopNotifications;
}
