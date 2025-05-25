/**
 * FUSEtech Interactive Components
 * Gerencia componentes interativos da interface
 */

class ComponentsManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupProgressBars();
    this.setupTokenBalance();
    this.setupNotifications();
    this.setupModals();
    this.setupTooltips();
    this.setupCards();
  }

  /**
   * Configura navegação responsiva
   */
  setupNavigation() {
    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('[class*="md:hidden"]');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', () => {
        const isHidden = mobileMenu.classList.contains('hidden');
        
        if (isHidden) {
          mobileMenu.classList.remove('hidden');
          mobileMenu.classList.add('animate-slide-in-down');
        } else {
          mobileMenu.classList.add('animate-slide-in-up');
          setTimeout(() => {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('animate-slide-in-up');
          }, 300);
        }
      });
    }

    // Active link highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Animate transition
        if (window.animationsManager) {
          window.animationsManager.animatePageTransition(() => {
            // Here you would typically navigate to the new page
            console.log('Navigating to:', link.textContent.trim());
          });
        }
      });
    });
  }

  /**
   * Configura barras de progresso animadas
   */
  setupProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
      const targetWidth = bar.style.width || '0%';
      
      // Intersection Observer para animar quando visível
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateProgressBar(bar, targetWidth);
            observer.unobserve(bar);
          }
        });
      }, { threshold: 0.5 });
      
      observer.observe(bar);
    });
  }

  /**
   * Anima uma barra de progresso
   */
  animateProgressBar(bar, targetWidth) {
    bar.style.width = '0%';
    bar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
      bar.style.width = targetWidth;
    }, 100);
  }

  /**
   * Configura o display de tokens
   */
  setupTokenBalance() {
    const tokenDisplay = document.querySelector('[class*="bg-gradient-primary"]');
    
    if (tokenDisplay) {
      // Simula atualizações de token em tempo real
      this.simulateTokenUpdates(tokenDisplay);
      
      // Adiciona efeito de hover
      tokenDisplay.addEventListener('mouseenter', () => {
        tokenDisplay.style.transform = 'scale(1.05)';
        tokenDisplay.style.transition = 'transform 0.2s ease';
      });
      
      tokenDisplay.addEventListener('mouseleave', () => {
        tokenDisplay.style.transform = 'scale(1)';
      });
    }
  }

  /**
   * Simula atualizações de tokens
   */
  simulateTokenUpdates(tokenDisplay) {
    const tokenValue = tokenDisplay.querySelector('span.font-semibold');
    if (!tokenValue) return;
    
    let currentTokens = parseInt(tokenValue.textContent.replace(/,/g, ''));
    
    // Simula ganho de tokens a cada 30 segundos
    setInterval(() => {
      const gain = Math.floor(Math.random() * 10) + 1;
      currentTokens += gain;
      
      // Anima a mudança
      tokenValue.style.transform = 'scale(1.2)';
      tokenValue.style.color = '#10b981';
      
      setTimeout(() => {
        tokenValue.textContent = currentTokens.toLocaleString();
        tokenValue.style.transform = 'scale(1)';
        tokenValue.style.color = '';
      }, 200);
      
      // Mostra notificação
      if (window.animationsManager) {
        window.animationsManager.animateNotification(`+${gain} FUSE ganhos!`, 'success');
      }
    }, 30000);
  }

  /**
   * Configura sistema de notificações
   */
  setupNotifications() {
    const notificationButton = document.querySelector('[class*="fa-bell"]')?.parentElement;
    
    if (notificationButton) {
      notificationButton.addEventListener('click', () => {
        this.showNotificationPanel();
      });
      
      // Simula notificações
      this.simulateNotifications();
    }
  }

  /**
   * Mostra painel de notificações
   */
  showNotificationPanel() {
    // Cria painel se não existir
    let panel = document.getElementById('notification-panel');
    
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'notification-panel';
      panel.className = 'fixed top-16 right-4 w-80 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto';
      panel.innerHTML = `
        <div class="p-4 border-b">
          <h3 class="font-semibold text-gray-900">Notificações</h3>
        </div>
        <div class="divide-y">
          <div class="p-4 hover:bg-gray-50">
            <div class="flex items-start">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-trophy text-green-600 text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Desafio Concluído!</p>
                <p class="text-xs text-gray-500">Você completou o desafio "Corredor de 10km"</p>
                <p class="text-xs text-gray-400 mt-1">2 horas atrás</p>
              </div>
            </div>
          </div>
          <div class="p-4 hover:bg-gray-50">
            <div class="flex items-start">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-coins text-blue-600 text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Tokens Recebidos</p>
                <p class="text-xs text-gray-500">+25 FUSE pela sua corrida matinal</p>
                <p class="text-xs text-gray-400 mt-1">3 horas atrás</p>
              </div>
            </div>
          </div>
          <div class="p-4 hover:bg-gray-50">
            <div class="flex items-start">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <i class="fas fa-users text-purple-600 text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">Novo Seguidor</p>
                <p class="text-xs text-gray-500">Maria Silva começou a seguir você</p>
                <p class="text-xs text-gray-400 mt-1">1 dia atrás</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(panel);
    }
    
    // Toggle visibility
    const isVisible = panel.style.display === 'block';
    
    if (isVisible) {
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        panel.style.display = 'none';
      }, 200);
    } else {
      panel.style.display = 'block';
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(-10px)';
      panel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      
      setTimeout(() => {
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
      }, 10);
    }
    
    // Fechar ao clicar fora
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!panel.contains(e.target) && !notificationButton.contains(e.target)) {
          panel.style.opacity = '0';
          panel.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            panel.style.display = 'none';
          }, 200);
          document.removeEventListener('click', closeHandler);
        }
      };
      
      document.addEventListener('click', closeHandler);
    }, 100);
  }

  /**
   * Simula notificações em tempo real
   */
  simulateNotifications() {
    const notificationBadge = document.querySelector('[class*="bg-error"]');
    
    if (notificationBadge) {
      // Simula nova notificação a cada 2 minutos
      setInterval(() => {
        notificationBadge.style.animation = 'pulse 1s ease-in-out 3';
        
        if (window.animationsManager) {
          window.animationsManager.animateNotification('Nova notificação recebida!', 'info');
        }
      }, 120000);
    }
  }

  /**
   * Configura modais
   */
  setupModals() {
    // Fechar modais ao clicar no backdrop
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
        const modal = e.target;
        if (window.animationsManager) {
          window.animationsManager.hideModal(modal);
        } else {
          modal.style.display = 'none';
        }
      }
    });
  }

  /**
   * Configura tooltips
   */
  setupTooltips() {
    const elementsWithTooltips = document.querySelectorAll('[title]');
    
    elementsWithTooltips.forEach(element => {
      const title = element.getAttribute('title');
      element.removeAttribute('title');
      
      element.addEventListener('mouseenter', (e) => {
        this.showTooltip(e.target, title);
      });
      
      element.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });
    });
  }

  /**
   * Mostra tooltip
   */
  showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = 'fixed bg-gray-900 text-white text-xs px-2 py-1 rounded z-50 pointer-events-none';
    tooltip.textContent = text;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
    
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(5px)';
    tooltip.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    
    setTimeout(() => {
      tooltip.style.opacity = '1';
      tooltip.style.transform = 'translateY(0)';
    }, 10);
  }

  /**
   * Esconde tooltip
   */
  hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'translateY(5px)';
      setTimeout(() => {
        tooltip.remove();
      }, 200);
    }
  }

  /**
   * Configura interações dos cards
   */
  setupCards() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
      // Efeito de hover
      card.addEventListener('mouseenter', () => {
        if (card.classList.contains('hover-lift')) {
          card.style.transform = 'translateY(-4px)';
          card.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        }
      });
      
      card.addEventListener('mouseleave', () => {
        if (card.classList.contains('hover-lift')) {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '';
        }
      });
      
      // Click para expandir (se aplicável)
      card.addEventListener('click', () => {
        if (card.dataset.expandable === 'true') {
          this.expandCard(card);
        }
      });
    });
  }

  /**
   * Expande um card
   */
  expandCard(card) {
    card.classList.toggle('expanded');
    
    if (card.classList.contains('expanded')) {
      card.style.transform = 'scale(1.02)';
      card.style.zIndex = '10';
    } else {
      card.style.transform = 'scale(1)';
      card.style.zIndex = '';
    }
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.componentsManager = new ComponentsManager();
});

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentsManager;
}
