/**
 * Serviço de sincronização offline para FuseLabs
 * 
 * Este módulo gerencia o armazenamento e sincronização de dados
 * quando o usuário está offline.
 */

class OfflineSyncManager {
  constructor() {
    // Nome do banco de dados
    this.dbName = 'fuselabs-offline-db';
    
    // Versão do banco de dados
    this.dbVersion = 1;
    
    // Referência ao banco de dados
    this.db = null;
    
    // Estado de sincronização
    this.isSyncing = false;
    
    // Inicializar
    this.init();
  }
  
  /**
   * Inicializar o gerenciador de sincronização offline
   */
  async init() {
    try {
      // Abrir banco de dados
      await this.openDatabase();
      
      // Verificar conexão
      this.setupConnectionListeners();
      
      // Registrar para sincronização em segundo plano
      this.registerBackgroundSync();
      
      console.log('Gerenciador de sincronização offline inicializado');
    } catch (error) {
      console.error('Erro ao inicializar gerenciador de sincronização offline:', error);
    }
  }
  
  /**
   * Abrir banco de dados IndexedDB
   * @returns {Promise} - Promessa resolvida quando o banco de dados for aberto
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      // Verificar suporte a IndexedDB
      if (!window.indexedDB) {
        reject(new Error('Seu navegador não suporta IndexedDB'));
        return;
      }
      
      // Abrir banco de dados
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      // Manipular erro
      request.onerror = (event) => {
        console.error('Erro ao abrir banco de dados:', event.target.error);
        reject(event.target.error);
      };
      
      // Manipular sucesso
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Banco de dados aberto com sucesso');
        resolve(this.db);
      };
      
      // Manipular atualização
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Criar object stores
        if (!db.objectStoreNames.contains('activities')) {
          const activitiesStore = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
          activitiesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          activitiesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('challenges')) {
          const challengesStore = db.createObjectStore('challenges', { keyPath: 'id', autoIncrement: true });
          challengesStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          challengesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        console.log('Banco de dados atualizado para versão', db.version);
      };
    });
  }
  
  /**
   * Configurar listeners para mudanças de conexão
   */
  setupConnectionListeners() {
    // Sincronizar quando a conexão for restaurada
    window.addEventListener('online', () => {
      console.log('Conexão restaurada, iniciando sincronização...');
      this.syncAll();
    });
    
    // Atualizar UI quando a conexão for perdida
    window.addEventListener('offline', () => {
      console.log('Conexão perdida, modo offline ativado');
      // Atualizar UI para modo offline
      if (typeof showToast === 'function') {
        showToast('Você está offline. Os dados serão sincronizados quando a conexão for restaurada.', 'warning');
      }
    });
  }
  
  /**
   * Registrar para sincronização em segundo plano
   */
  registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then(registration => {
          // Registrar sincronização de atividades
          registration.sync.register('sync-activities')
            .then(() => console.log('Sincronização de atividades registrada'))
            .catch(error => console.error('Erro ao registrar sincronização de atividades:', error));
          
          // Registrar sincronização de desafios
          registration.sync.register('sync-challenges')
            .then(() => console.log('Sincronização de desafios registrada'))
            .catch(error => console.error('Erro ao registrar sincronização de desafios:', error));
        })
        .catch(error => console.error('Erro ao registrar sincronização em segundo plano:', error));
    }
  }
  
  /**
   * Salvar atividade localmente
   * @param {Object} activity - Dados da atividade
   * @returns {Promise} - Promessa resolvida com o ID da atividade
   */
  saveActivity(activity) {
    return new Promise((resolve, reject) => {
      // Verificar se o banco de dados está aberto
      if (!this.db) {
        reject(new Error('Banco de dados não inicializado'));
        return;
      }
      
      // Adicionar metadados
      const activityWithMeta = {
        ...activity,
        syncStatus: 'pending',
        timestamp: Date.now()
      };
      
      // Iniciar transação
      const transaction = this.db.transaction(['activities'], 'readwrite');
      const store = transaction.objectStore('activities');
      
      // Adicionar atividade
      const request = store.add(activityWithMeta);
      
      // Manipular erro
      request.onerror = (event) => {
        console.error('Erro ao salvar atividade:', event.target.error);
        reject(event.target.error);
      };
      
      // Manipular sucesso
      request.onsuccess = (event) => {
        const id = event.target.result;
        console.log('Atividade salva localmente com ID:', id);
        
        // Tentar sincronizar se estiver online
        if (navigator.onLine) {
          this.syncActivities();
        } else {
          // Mostrar feedback
          if (typeof showToast === 'function') {
            showToast('Atividade salva localmente. Será sincronizada quando a conexão for restaurada.', 'info');
          }
        }
        
        resolve(id);
      };
    });
  }
  
  /**
   * Obter atividades pendentes
   * @returns {Promise} - Promessa resolvida com array de atividades pendentes
   */
  getPendingActivities() {
    return new Promise((resolve, reject) => {
      // Verificar se o banco de dados está aberto
      if (!this.db) {
        reject(new Error('Banco de dados não inicializado'));
        return;
      }
      
      // Iniciar transação
      const transaction = this.db.transaction(['activities'], 'readonly');
      const store = transaction.objectStore('activities');
      const index = store.index('syncStatus');
      
      // Obter atividades pendentes
      const request = index.getAll('pending');
      
      // Manipular erro
      request.onerror = (event) => {
        console.error('Erro ao obter atividades pendentes:', event.target.error);
        reject(event.target.error);
      };
      
      // Manipular sucesso
      request.onsuccess = (event) => {
        const activities = event.target.result;
        resolve(activities);
      };
    });
  }
  
  /**
   * Marcar atividade como sincronizada
   * @param {Number} id - ID da atividade
   * @returns {Promise} - Promessa resolvida quando a atividade for marcada
   */
  markActivitySynced(id) {
    return new Promise((resolve, reject) => {
      // Verificar se o banco de dados está aberto
      if (!this.db) {
        reject(new Error('Banco de dados não inicializado'));
        return;
      }
      
      // Iniciar transação
      const transaction = this.db.transaction(['activities'], 'readwrite');
      const store = transaction.objectStore('activities');
      
      // Obter atividade
      const request = store.get(id);
      
      // Manipular erro
      request.onerror = (event) => {
        console.error('Erro ao obter atividade:', event.target.error);
        reject(event.target.error);
      };
      
      // Manipular sucesso
      request.onsuccess = (event) => {
        const activity = event.target.result;
        
        if (!activity) {
          reject(new Error(`Atividade com ID ${id} não encontrada`));
          return;
        }
        
        // Atualizar status
        activity.syncStatus = 'synced';
        
        // Salvar atividade atualizada
        const updateRequest = store.put(activity);
        
        // Manipular erro
        updateRequest.onerror = (event) => {
          console.error('Erro ao atualizar atividade:', event.target.error);
          reject(event.target.error);
        };
        
        // Manipular sucesso
        updateRequest.onsuccess = () => {
          console.log('Atividade marcada como sincronizada:', id);
          resolve();
        };
      };
    });
  }
  
  /**
   * Sincronizar atividades pendentes
   * @returns {Promise} - Promessa resolvida quando todas as atividades forem sincronizadas
   */
  async syncActivities() {
    // Verificar se já está sincronizando
    if (this.isSyncing) {
      console.log('Sincronização já em andamento');
      return;
    }
    
    // Verificar conexão
    if (!navigator.onLine) {
      console.log('Sem conexão, sincronização adiada');
      return;
    }
    
    try {
      this.isSyncing = true;
      
      // Obter atividades pendentes
      const activities = await this.getPendingActivities();
      
      if (activities.length === 0) {
        console.log('Nenhuma atividade pendente para sincronizar');
        this.isSyncing = false;
        return;
      }
      
      console.log(`Sincronizando ${activities.length} atividades...`);
      
      // Em um ambiente real, isso seria uma chamada de API
      // Para fins de demonstração, apenas simulamos a sincronização
      for (const activity of activities) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Marcar como sincronizada
        await this.markActivitySynced(activity.id);
      }
      
      // Mostrar feedback
      if (typeof showToast === 'function') {
        showToast(`${activities.length} atividades sincronizadas com sucesso!`, 'success');
      }
      
      console.log('Sincronização de atividades concluída');
    } catch (error) {
      console.error('Erro ao sincronizar atividades:', error);
      
      // Mostrar feedback
      if (typeof showToast === 'function') {
        showToast('Erro ao sincronizar atividades. Tente novamente mais tarde.', 'error');
      }
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * Sincronizar todos os dados pendentes
   */
  async syncAll() {
    try {
      await this.syncActivities();
      // Adicionar outras sincronizações aqui
    } catch (error) {
      console.error('Erro ao sincronizar todos os dados:', error);
    }
  }
}

// Criar instância global
const offlineSync = new OfflineSyncManager();
