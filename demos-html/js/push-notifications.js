/**
 * Serviço de notificações push para FuseLabs
 * 
 * Este módulo gerencia o registro, permissões e exibição de notificações push
 * para manter os usuários engajados com a aplicação.
 */

class PushNotificationService {
  constructor() {
    // Estado de registro
    this.isRegistered = false;
    
    // Chave pública VAPID (em um ambiente real, seria gerada no servidor)
    this.vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    
    // Preferências de notificação
    this.preferences = {
      activities: true,
      challenges: true,
      social: true,
      achievements: true,
      reminders: true,
      marketing: false,
      timeWindow: {
        start: 8, // 8:00
        end: 21   // 21:00
      }
    };
    
    // Tipos de notificação
    this.notificationTypes = {
      ACTIVITY_REMINDER: 'activity_reminder',
      CHALLENGE_DEADLINE: 'challenge_deadline',
      CHALLENGE_COMPLETED: 'challenge_completed',
      ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
      FRIEND_REQUEST: 'friend_request',
      ACTIVITY_LIKE: 'activity_like',
      ACTIVITY_COMMENT: 'activity_comment',
      NEW_CHALLENGE: 'new_challenge',
      LEVEL_UP: 'level_up',
      SYSTEM_UPDATE: 'system_update'
    };
    
    // Inicializar
    this.init();
  }
  
  /**
   * Inicializar o serviço de notificações push
   */
  async init() {
    try {
      // Verificar suporte a notificações
      if (!('Notification' in window)) {
        console.log('Este navegador não suporta notificações push');
        return;
      }
      
      // Verificar suporte a service worker
      if (!('serviceWorker' in navigator)) {
        console.log('Este navegador não suporta service workers');
        return;
      }
      
      // Verificar suporte a PushManager
      if (!('PushManager' in window)) {
        console.log('Este navegador não suporta Push API');
        return;
      }
      
      // Carregar preferências salvas
      this.loadPreferences();
      
      // Verificar permissão atual
      this.checkPermission();
      
      // Verificar registro existente
      await this.checkExistingSubscription();
      
      console.log('Serviço de notificações push inicializado');
    } catch (error) {
      console.error('Erro ao inicializar serviço de notificações push:', error);
    }
  }
  
  /**
   * Carregar preferências salvas
   */
  loadPreferences() {
    try {
      const savedPreferences = localStorage.getItem('push_notification_preferences');
      
      if (savedPreferences) {
        this.preferences = { ...this.preferences, ...JSON.parse(savedPreferences) };
      }
    } catch (error) {
      console.error('Erro ao carregar preferências de notificação:', error);
    }
  }
  
  /**
   * Salvar preferências
   */
  savePreferences() {
    try {
      localStorage.setItem('push_notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Erro ao salvar preferências de notificação:', error);
    }
  }
  
  /**
   * Verificar permissão atual
   * @returns {String} - Estado da permissão ('granted', 'denied', 'default')
   */
  checkPermission() {
    const permission = Notification.permission;
    
    console.log(`Permissão de notificação atual: ${permission}`);
    
    return permission;
  }
  
  /**
   * Verificar registro existente
   */
  async checkExistingSubscription() {
    try {
      // Obter registro do service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Obter assinatura existente
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('Assinatura existente encontrada');
        this.isRegistered = true;
        
        // Em um ambiente real, enviaríamos a assinatura para o servidor
        // para verificar se ainda é válida
      } else {
        console.log('Nenhuma assinatura existente encontrada');
        this.isRegistered = false;
      }
    } catch (error) {
      console.error('Erro ao verificar assinatura existente:', error);
      this.isRegistered = false;
    }
  }
  
  /**
   * Solicitar permissão para notificações
   * @returns {Promise<String>} - Promessa resolvida com o estado da permissão
   */
  async requestPermission() {
    try {
      // Verificar permissão atual
      if (Notification.permission === 'granted') {
        console.log('Permissão já concedida');
        return 'granted';
      }
      
      if (Notification.permission === 'denied') {
        console.log('Permissão negada anteriormente');
        return 'denied';
      }
      
      // Solicitar permissão
      const permission = await Notification.requestPermission();
      
      console.log(`Permissão de notificação: ${permission}`);
      
      // Se a permissão foi concedida, registrar para notificações push
      if (permission === 'granted') {
        await this.registerForPushNotifications();
      }
      
      return permission;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return 'error';
    }
  }
  
  /**
   * Registrar para notificações push
   * @returns {Promise<PushSubscription|null>} - Promessa resolvida com a assinatura ou null
   */
  async registerForPushNotifications() {
    try {
      // Verificar se já está registrado
      if (this.isRegistered) {
        console.log('Já registrado para notificações push');
        return null;
      }
      
      // Verificar permissão
      if (Notification.permission !== 'granted') {
        console.log('Permissão não concedida para notificações push');
        return null;
      }
      
      // Obter registro do service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Converter chave VAPID para Uint8Array
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      
      // Registrar para notificações push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      
      console.log('Registrado para notificações push');
      this.isRegistered = true;
      
      // Em um ambiente real, enviaríamos a assinatura para o servidor
      // para armazenar no banco de dados
      console.log('Assinatura:', JSON.stringify(subscription));
      
      return subscription;
    } catch (error) {
      console.error('Erro ao registrar para notificações push:', error);
      return null;
    }
  }
  
  /**
   * Cancelar registro de notificações push
   * @returns {Promise<Boolean>} - Promessa resolvida com verdadeiro se o cancelamento for bem-sucedido
   */
  async unregisterFromPushNotifications() {
    try {
      // Obter registro do service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Obter assinatura existente
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Cancelar assinatura
        const result = await subscription.unsubscribe();
        
        if (result) {
          console.log('Cancelado registro de notificações push');
          this.isRegistered = false;
          
          // Em um ambiente real, enviaríamos uma solicitação para o servidor
          // para remover a assinatura do banco de dados
          
          return true;
        } else {
          console.log('Falha ao cancelar registro de notificações push');
          return false;
        }
      } else {
        console.log('Nenhuma assinatura encontrada para cancelar');
        this.isRegistered = false;
        return true;
      }
    } catch (error) {
      console.error('Erro ao cancelar registro de notificações push:', error);
      return false;
    }
  }
  
  /**
   * Atualizar preferências de notificação
   * @param {Object} preferences - Novas preferências
   * @returns {Promise<Boolean>} - Promessa resolvida com verdadeiro se a atualização for bem-sucedida
   */
  async updatePreferences(preferences) {
    try {
      // Atualizar preferências
      this.preferences = { ...this.preferences, ...preferences };
      
      // Salvar preferências
      this.savePreferences();
      
      // Em um ambiente real, enviaríamos as preferências para o servidor
      // para sincronizar com o banco de dados
      
      console.log('Preferências de notificação atualizadas');
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar preferências de notificação:', error);
      return false;
    }
  }
  
  /**
   * Enviar notificação local
   * @param {Object} options - Opções da notificação
   * @returns {Promise<Notification|null>} - Promessa resolvida com a notificação ou null
   */
  async sendLocalNotification(options) {
    try {
      // Verificar permissão
      if (Notification.permission !== 'granted') {
        console.log('Permissão não concedida para notificações');
        return null;
      }
      
      // Verificar preferências
      if (!this.shouldSendNotification(options.type)) {
        console.log(`Notificação do tipo ${options.type} desativada nas preferências`);
        return null;
      }
      
      // Verificar janela de tempo
      if (!this.isWithinTimeWindow()) {
        console.log('Fora da janela de tempo para notificações');
        return null;
      }
      
      // Configurar opções padrão
      const defaultOptions = {
        icon: '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        actions: []
      };
      
      // Mesclar opções
      const notificationOptions = { ...defaultOptions, ...options };
      
      // Criar notificação
      const notification = new Notification(notificationOptions.title, notificationOptions);
      
      // Configurar eventos
      notification.onclick = (event) => {
        event.preventDefault();
        
        // Focar na janela
        window.focus();
        
        // Fechar notificação
        notification.close();
        
        // Executar ação personalizada
        if (notificationOptions.onClick) {
          notificationOptions.onClick();
        }
      };
      
      return notification;
    } catch (error) {
      console.error('Erro ao enviar notificação local:', error);
      return null;
    }
  }
  
  /**
   * Verificar se deve enviar notificação com base nas preferências
   * @param {String} type - Tipo de notificação
   * @returns {Boolean} - Verdadeiro se a notificação deve ser enviada
   */
  shouldSendNotification(type) {
    // Verificar tipo de notificação
    switch (type) {
      case this.notificationTypes.ACTIVITY_REMINDER:
        return this.preferences.reminders;
      
      case this.notificationTypes.CHALLENGE_DEADLINE:
      case this.notificationTypes.CHALLENGE_COMPLETED:
      case this.notificationTypes.NEW_CHALLENGE:
        return this.preferences.challenges;
      
      case this.notificationTypes.ACHIEVEMENT_UNLOCKED:
      case this.notificationTypes.LEVEL_UP:
        return this.preferences.achievements;
      
      case this.notificationTypes.FRIEND_REQUEST:
      case this.notificationTypes.ACTIVITY_LIKE:
      case this.notificationTypes.ACTIVITY_COMMENT:
        return this.preferences.social;
      
      case this.notificationTypes.SYSTEM_UPDATE:
        return true; // Notificações do sistema sempre são enviadas
      
      default:
        return true;
    }
  }
  
  /**
   * Verificar se o horário atual está dentro da janela de tempo para notificações
   * @returns {Boolean} - Verdadeiro se estiver dentro da janela de tempo
   */
  isWithinTimeWindow() {
    const now = new Date();
    const hour = now.getHours();
    
    return hour >= this.preferences.timeWindow.start && hour < this.preferences.timeWindow.end;
  }
  
  /**
   * Converter string base64 URL para Uint8Array
   * @param {String} base64String - String base64 URL
   * @returns {Uint8Array} - Array de bytes
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
  
  /**
   * Mostrar interface de preferências de notificação
   */
  showPreferencesUI() {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4';
    modal.innerHTML = `
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Preferências de Notificação</h2>
        <button id="close-notification-prefs" class="text-gray-400 hover:text-gray-500 focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="p-4">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label for="pref-activities" class="text-sm font-medium text-gray-700">Atividades e Lembretes</label>
            <div class="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" id="pref-activities" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.preferences.reminders ? 'checked' : ''}>
              <label for="pref-activities" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <label for="pref-challenges" class="text-sm font-medium text-gray-700">Desafios</label>
            <div class="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" id="pref-challenges" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.preferences.challenges ? 'checked' : ''}>
              <label for="pref-challenges" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <label for="pref-social" class="text-sm font-medium text-gray-700">Interações Sociais</label>
            <div class="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" id="pref-social" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.preferences.social ? 'checked' : ''}>
              <label for="pref-social" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <label for="pref-achievements" class="text-sm font-medium text-gray-700">Conquistas</label>
            <div class="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" id="pref-achievements" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.preferences.achievements ? 'checked' : ''}>
              <label for="pref-achievements" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <label for="pref-marketing" class="text-sm font-medium text-gray-700">Marketing e Promoções</label>
            <div class="relative inline-block w-10 mr-2 align-middle select-none">
              <input type="checkbox" id="pref-marketing" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" ${this.preferences.marketing ? 'checked' : ''}>
              <label for="pref-marketing" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
            </div>
          </div>
          
          <div class="mt-4">
            <label for="time-window" class="block text-sm font-medium text-gray-700 mb-1">Horário para Notificações</label>
            <div class="flex items-center space-x-2">
              <select id="time-start" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                ${this.generateTimeOptions(this.preferences.timeWindow.start)}
              </select>
              <span class="text-gray-500">até</span>
              <select id="time-end" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                ${this.generateTimeOptions(this.preferences.timeWindow.end)}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div class="px-4 py-3 bg-gray-50 flex justify-end rounded-b-lg">
        <button id="save-notification-prefs" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          Salvar
        </button>
      </div>
    `;
    
    // Adicionar modal ao overlay
    overlay.appendChild(modal);
    
    // Adicionar overlay ao body
    document.body.appendChild(overlay);
    
    // Configurar eventos
    document.getElementById('close-notification-prefs').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    document.getElementById('save-notification-prefs').addEventListener('click', () => {
      // Obter valores
      const reminders = document.getElementById('pref-activities').checked;
      const challenges = document.getElementById('pref-challenges').checked;
      const social = document.getElementById('pref-social').checked;
      const achievements = document.getElementById('pref-achievements').checked;
      const marketing = document.getElementById('pref-marketing').checked;
      const timeStart = parseInt(document.getElementById('time-start').value);
      const timeEnd = parseInt(document.getElementById('time-end').value);
      
      // Atualizar preferências
      this.updatePreferences({
        reminders,
        challenges,
        social,
        achievements,
        marketing,
        timeWindow: {
          start: timeStart,
          end: timeEnd
        }
      });
      
      // Fechar modal
      document.body.removeChild(overlay);
      
      // Mostrar feedback
      if (typeof showToast === 'function') {
        showToast('Preferências de notificação salvas com sucesso', 'success');
      }
    });
    
    // Adicionar estilos para o toggle
    const style = document.createElement('style');
    style.textContent = `
      .toggle-checkbox:checked {
        right: 0;
        border-color: #4f46e5;
      }
      .toggle-checkbox:checked + .toggle-label {
        background-color: #4f46e5;
      }
      .toggle-label {
        transition: background-color 0.3s ease;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Gerar opções de horário para selects
   * @param {Number} selectedHour - Hora selecionada
   * @returns {String} - HTML das opções
   */
  generateTimeOptions(selectedHour) {
    let options = '';
    
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : i;
      const selected = i === selectedHour ? 'selected' : '';
      options += `<option value="${i}" ${selected}>${hour}:00</option>`;
    }
    
    return options;
  }
}

// Criar instância global
const pushNotifications = new PushNotificationService();
