/**
 * Serviço de Cache
 * 
 * Este módulo implementa um sistema de cache para armazenar dados
 * temporariamente, melhorando a performance e permitindo uso offline.
 */

export class CacheService {
  /**
   * Construtor do serviço de cache
   * @param {Number} defaultTtl - Tempo de vida padrão em milissegundos (1 hora)
   * @param {Object} options - Opções de configuração
   */
  constructor(defaultTtl = 3600000, options = {}) {
    this.cache = {};
    this.defaultTtl = defaultTtl;
    this.namespace = options.namespace || 'app_cache';
    this.useLocalStorage = options.useLocalStorage !== false;
    this.useIndexedDB = options.useIndexedDB !== false;
    this.debug = options.debug || false;
    
    // Inicializar IndexedDB se disponível
    if (this.useIndexedDB) {
      this._initIndexedDB();
    }
    
    // Carregar cache do localStorage se disponível
    if (this.useLocalStorage) {
      this._loadFromLocalStorage();
    }
  }

  /**
   * Definir um item no cache
   * @param {String} key - Chave do item
   * @param {*} value - Valor a ser armazenado
   * @param {Number} ttl - Tempo de vida em milissegundos (opcional)
   * @returns {Promise<Boolean>} - Verdadeiro se armazenado com sucesso
   */
  async set(key, value, ttl = this.defaultTtl) {
    // Criar item de cache
    const item = {
      value,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    };
    
    // Armazenar em memória
    this.cache[key] = item;
    
    // Armazenar em localStorage se disponível
    if (this.useLocalStorage) {
      this._saveToLocalStorage(key, item);
    }
    
    // Armazenar em IndexedDB se disponível
    if (this.useIndexedDB && this.db) {
      await this._saveToIndexedDB(key, item);
    }
    
    if (this.debug) {
      console.log(`Cache: Set "${key}" (expires in ${ttl}ms)`);
    }
    
    return true;
  }

  /**
   * Obter um item do cache
   * @param {String} key - Chave do item
   * @returns {Promise<*>} - Valor armazenado ou null se não encontrado ou expirado
   */
  async get(key) {
    // Verificar cache em memória
    const item = this.cache[key];
    
    if (item && Date.now() < item.expiry) {
      if (this.debug) {
        console.log(`Cache: Hit "${key}" (memory)`);
      }
      return item.value;
    }
    
    // Se não encontrado em memória ou expirado, verificar localStorage
    if (this.useLocalStorage) {
      const localItem = this._getFromLocalStorage(key);
      
      if (localItem && Date.now() < localItem.expiry) {
        // Atualizar cache em memória
        this.cache[key] = localItem;
        
        if (this.debug) {
          console.log(`Cache: Hit "${key}" (localStorage)`);
        }
        
        return localItem.value;
      }
    }
    
    // Se não encontrado em localStorage ou expirado, verificar IndexedDB
    if (this.useIndexedDB && this.db) {
      const idbItem = await this._getFromIndexedDB(key);
      
      if (idbItem && Date.now() < idbItem.expiry) {
        // Atualizar cache em memória
        this.cache[key] = idbItem;
        
        // Atualizar localStorage
        if (this.useLocalStorage) {
          this._saveToLocalStorage(key, idbItem);
        }
        
        if (this.debug) {
          console.log(`Cache: Hit "${key}" (IndexedDB)`);
        }
        
        return idbItem.value;
      }
    }
    
    if (this.debug) {
      console.log(`Cache: Miss "${key}"`);
    }
    
    return null;
  }

  /**
   * Invalidar um item do cache
   * @param {String} key - Chave do item
   * @returns {Promise<Boolean>} - Verdadeiro se removido com sucesso
   */
  async invalidate(key) {
    // Remover da memória
    delete this.cache[key];
    
    // Remover do localStorage
    if (this.useLocalStorage) {
      this._removeFromLocalStorage(key);
    }
    
    // Remover do IndexedDB
    if (this.useIndexedDB && this.db) {
      await this._removeFromIndexedDB(key);
    }
    
    if (this.debug) {
      console.log(`Cache: Invalidated "${key}"`);
    }
    
    return true;
  }

  /**
   * Limpar todo o cache
   * @returns {Promise<Boolean>} - Verdadeiro se limpo com sucesso
   */
  async clear() {
    // Limpar memória
    this.cache = {};
    
    // Limpar localStorage
    if (this.useLocalStorage) {
      this._clearLocalStorage();
    }
    
    // Limpar IndexedDB
    if (this.useIndexedDB && this.db) {
      await this._clearIndexedDB();
    }
    
    if (this.debug) {
      console.log('Cache: Cleared all items');
    }
    
    return true;
  }

  /**
   * Verificar se um item existe no cache e não expirou
   * @param {String} key - Chave do item
   * @returns {Promise<Boolean>} - Verdadeiro se o item existir e não tiver expirado
   */
  async has(key) {
    // Verificar cache em memória
    const item = this.cache[key];
    
    if (item && Date.now() < item.expiry) {
      return true;
    }
    
    // Verificar localStorage
    if (this.useLocalStorage) {
      const localItem = this._getFromLocalStorage(key);
      
      if (localItem && Date.now() < localItem.expiry) {
        return true;
      }
    }
    
    // Verificar IndexedDB
    if (this.useIndexedDB && this.db) {
      const idbItem = await this._getFromIndexedDB(key);
      
      if (idbItem && Date.now() < idbItem.expiry) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Inicializar IndexedDB
   * @private
   */
  _initIndexedDB() {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported');
      return;
    }
    
    const request = indexedDB.open(`${this.namespace}_db`, 1);
    
    request.onerror = (event) => {
      console.error('IndexedDB error:', event.target.error);
      this.useIndexedDB = false;
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Criar object store para cache
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    };
    
    request.onsuccess = (event) => {
      this.db = event.target.result;
      
      if (this.debug) {
        console.log('IndexedDB initialized');
      }
    };
  }

  /**
   * Salvar item no localStorage
   * @param {String} key - Chave do item
   * @param {Object} item - Item a ser salvo
   * @private
   */
  _saveToLocalStorage(key, item) {
    try {
      const storageKey = `${this.namespace}_${key}`;
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * Obter item do localStorage
   * @param {String} key - Chave do item
   * @returns {Object|null} - Item ou null se não encontrado
   * @private
   */
  _getFromLocalStorage(key) {
    try {
      const storageKey = `${this.namespace}_${key}`;
      const data = localStorage.getItem(storageKey);
      
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to get from localStorage:', error);
    }
    
    return null;
  }

  /**
   * Remover item do localStorage
   * @param {String} key - Chave do item
   * @private
   */
  _removeFromLocalStorage(key) {
    try {
      const storageKey = `${this.namespace}_${key}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Limpar todos os itens do localStorage para este namespace
   * @private
   */
  _clearLocalStorage() {
    try {
      const prefix = `${this.namespace}_`;
      
      Object.keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Carregar cache do localStorage
   * @private
   */
  _loadFromLocalStorage() {
    try {
      const prefix = `${this.namespace}_`;
      const now = Date.now();
      
      Object.keys(localStorage)
        .filter(key => key.startsWith(prefix))
        .forEach(storageKey => {
          try {
            const key = storageKey.substring(prefix.length);
            const item = JSON.parse(localStorage.getItem(storageKey));
            
            // Adicionar ao cache em memória apenas se não expirou
            if (item && item.expiry > now) {
              this.cache[key] = item;
            } else {
              // Remover itens expirados
              localStorage.removeItem(storageKey);
            }
          } catch (error) {
            console.warn(`Failed to parse cache item ${storageKey}:`, error);
          }
        });
      
      if (this.debug) {
        console.log(`Loaded ${Object.keys(this.cache).length} items from localStorage`);
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  /**
   * Salvar item no IndexedDB
   * @param {String} key - Chave do item
   * @param {Object} item - Item a ser salvo
   * @returns {Promise<Boolean>} - Verdadeiro se salvo com sucesso
   * @private
   */
  _saveToIndexedDB(key, item) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }
      
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        const request = store.put({
          key,
          ...item
        });
        
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => {
          console.error('IndexedDB save error:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('IndexedDB save error:', error);
        reject(error);
      }
    });
  }

  /**
   * Obter item do IndexedDB
   * @param {String} key - Chave do item
   * @returns {Promise<Object|null>} - Item ou null se não encontrado
   * @private
   */
  _getFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }
      
      try {
        const transaction = this.db.transaction(['cache'], 'readonly');
        const store = transaction.objectStore('cache');
        
        const request = store.get(key);
        
        request.onsuccess = (event) => {
          const result = event.target.result;
          resolve(result || null);
        };
        
        request.onerror = (event) => {
          console.error('IndexedDB get error:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('IndexedDB get error:', error);
        reject(error);
      }
    });
  }

  /**
   * Remover item do IndexedDB
   * @param {String} key - Chave do item
   * @returns {Promise<Boolean>} - Verdadeiro se removido com sucesso
   * @private
   */
  _removeFromIndexedDB(key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }
      
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        const request = store.delete(key);
        
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => {
          console.error('IndexedDB remove error:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('IndexedDB remove error:', error);
        reject(error);
      }
    });
  }

  /**
   * Limpar todos os itens do IndexedDB
   * @returns {Promise<Boolean>} - Verdadeiro se limpo com sucesso
   * @private
   */
  _clearIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB not initialized'));
        return;
      }
      
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        
        const request = store.clear();
        
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => {
          console.error('IndexedDB clear error:', event.target.error);
          reject(event.target.error);
        };
      } catch (error) {
        console.error('IndexedDB clear error:', error);
        reject(error);
      }
    });
  }
}
