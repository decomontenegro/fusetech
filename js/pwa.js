/**
 * FUSEtech PWA Controller
 * Gerencia funcionalidades de Progressive Web App
 */

class PWAController {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;

    this.init();
  }

  init() {
    this.checkInstallation();
    this.setupInstallPrompt();
    this.setupOfflineDetection();
    this.setupUpdateDetection();
    this.setupNotifications();
    this.setupShortcuts();
  }

  /**
   * Verifica se o app está instalado
   */
  checkInstallation() {
    // Verifica se está rodando como PWA
    this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');

    if (this.isInstalled) {
      console.log('[PWA] App is installed');
      this.hideInstallPrompt();
    }
  }

  /**
   * Configura prompt de instalação
   */
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Install prompt available');

      // Previne o prompt automático
      e.preventDefault();

      // Salva o evento para uso posterior
      this.deferredPrompt = e;

      // Mostra botão de instalação customizado
      this.showInstallButton();
    });

    // Detecta quando o app foi instalado
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App was installed');
      this.isInstalled = true;
      this.hideInstallPrompt();
      this.showInstallSuccess();
    });
  }

  /**
   * Mostra botão de instalação
   */
  showInstallButton() {
    const installButton = this.createInstallButton();

    // Adiciona o botão na navegação
    const nav = document.querySelector('.nav .flex.items-center.gap-4');
    if (nav && !document.getElementById('install-btn')) {
      nav.insertBefore(installButton, nav.firstChild);
    }
  }

  /**
   * Cria botão de instalação
   */
  createInstallButton() {
    const button = document.createElement('button');
    button.id = 'install-btn';
    button.className = 'btn btn-primary btn-sm';
    button.innerHTML = '<i class="fas fa-download mr-2"></i>Instalar App';

    button.addEventListener('click', () => {
      this.promptInstall();
    });

    return button;
  }

  /**
   * Solicita instalação do app
   */
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.warn('[PWA] No install prompt available');
      return;
    }

    try {
      // Mostra o prompt de instalação
      this.deferredPrompt.prompt();

      // Aguarda a escolha do usuário
      const { outcome } = await this.deferredPrompt.userChoice;

      console.log('[PWA] Install prompt outcome:', outcome);

      if (outcome === 'accepted') {
        this.trackEvent('pwa_install_accepted');
      } else {
        this.trackEvent('pwa_install_dismissed');
      }

      // Limpa o prompt
      this.deferredPrompt = null;

    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
    }
  }

  /**
   * Esconde prompt de instalação
   */
  hideInstallPrompt() {
    const installButton = document.getElementById('install-btn');
    if (installButton) {
      installButton.remove();
    }
  }

  /**
   * Mostra sucesso da instalação
   */
  showInstallSuccess() {
    if (window.animationsManager) {
      window.animationsManager.animateNotification(
        '🎉 FUSEtech instalado com sucesso!',
        'success'
      );
    }
  }

  /**
   * Rastreia eventos de PWA
   */
  trackEvent(eventName, data = {}) {
    // Integração com analytics
    if (window.performanceMonitor) {
      window.performanceMonitor.trackEvent(eventName, data);
    }

    console.log('[PWA] Event tracked:', eventName, data);
  }

  /**
   * Configura detecção de offline/online
   */
  setupOfflineDetection() {
    window.addEventListener('online', () => {
      console.log('[PWA] Back online');
      this.isOnline = true;
      this.hideOfflineIndicator();
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Gone offline');
      this.isOnline = false;
      this.showOfflineIndicator();
    });
  }

  /**
   * Mostra indicador offline
   */
  showOfflineIndicator() {
    let indicator = document.getElementById('offline-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.className = 'fixed top-0 left-0 right-0 bg-warning text-white text-center py-2 z-50';
      indicator.innerHTML = `
        <i class="fas fa-wifi-slash mr-2"></i>
        Você está offline. Algumas funcionalidades podem estar limitadas.
      `;

      document.body.appendChild(indicator);
    }

    indicator.style.display = 'block';
  }

  /**
   * Esconde indicador offline
   */
  hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  /**
   * Configura detecção de atualizações
   */
  setupUpdateDetection() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] New service worker activated');
        this.showUpdateNotification();
      });
    }
  }

  /**
   * Mostra notificação de atualização
   */
  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-primary text-white p-4 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas fa-sync-alt"></i>
        <div>
          <div class="font-semibold">Nova versão disponível!</div>
          <div class="text-sm opacity-90">Recarregue para atualizar</div>
        </div>
        <button onclick="window.location.reload()" class="btn btn-sm bg-white text-primary ml-3">
          Atualizar
        </button>
      </div>
    `;

    document.body.appendChild(notification);
  }

  /**
   * Configura notificações push
   */
  async setupNotifications() {
    // Implementação básica
    console.log('[PWA] Notifications setup');
  }

  /**
   * Configura atalhos do app
   */
  setupShortcuts() {
    // Implementação básica
    console.log('[PWA] Shortcuts setup');
  }
}

// Inicializa PWA Controller
const pwaController = new PWAController();

// Exporta para uso global
window.pwaController = pwaController;
