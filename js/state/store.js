/**
 * Store (Gerenciador de Estado)
 *
 * Este módulo implementa um sistema de gerenciamento de estado centralizado
 * para manter a consistência dos dados em toda a aplicação.
 */

import { EventBus } from './event-bus.js';

export class Store {
  /**
   * Construtor do store
   * @param {Object} initialState - Estado inicial
   * @param {Object} options - Opções de configuração
   */
  constructor(initialState = {}, options = {}) {
    this.state = { ...initialState };
    this.eventBus = options.eventBus || new EventBus();
    this.debug = options.debug || false;
    this.persistKey = options.persistKey || null;

    // Carregar estado persistido se configurado
    if (this.persistKey) {
      this._loadPersistedState();
    }
  }

  /**
   * Obter o estado atual
   * @returns {Object} - Estado atual
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Atualizar o estado
   * @param {Object} newState - Novo estado parcial
   * @param {String} source - Fonte da atualização (para depuração)
   */
  setState(newState, source = 'unknown') {
    // Verificar se há mudanças reais
    const changedKeys = Object.keys(newState).filter(
      key => JSON.stringify(newState[key]) !== JSON.stringify(this.state[key])
    );

    if (changedKeys.length === 0) {
      return;
    }

    // Criar cópia do estado anterior para eventos
    const previousState = { ...this.state };

    // Atualizar estado
    this.state = {
      ...this.state,
      ...newState
    };

    // Registrar mudanças no console se debug estiver ativado
    if (this.debug) {
      console.group('Store Update');
      console.log('Source:', source);
      console.log('Changed keys:', changedKeys);
      console.log('Previous state:', previousState);
      console.log('New state:', this.state);
      console.groupEnd();
    }

    // Persistir estado se configurado
    if (this.persistKey) {
      this._persistState();
    }

    // Emitir evento global de atualização
    this.eventBus.emit('state:update', this.state, previousState, changedKeys, source);

    // Emitir eventos para cada chave alterada
    changedKeys.forEach(key => {
      this.eventBus.emit(`state:update:${key}`, this.state[key], previousState[key], source);
    });
  }

  /**
   * Assinar atualizações de estado
   * @param {Function} callback - Função a ser chamada quando o estado mudar
   * @returns {Function} - Função para cancelar a assinatura
   */
  subscribe(callback) {
    return this.eventBus.on('state:update', callback);
  }

  /**
   * Assinar atualizações de uma chave específica do estado
   * @param {String} key - Chave do estado a ser observada
   * @param {Function} callback - Função a ser chamada quando a chave mudar
   * @returns {Function} - Função para cancelar a assinatura
   */
  subscribeToKey(key, callback) {
    return this.eventBus.on(`state:update:${key}`, callback);
  }

  /**
   * Redefinir o estado para o valor inicial
   * @param {Object} initialState - Novo estado inicial (opcional)
   */
  resetState(initialState = {}) {
    const previousState = { ...this.state };
    this.state = { ...initialState };

    // Persistir estado se configurado
    if (this.persistKey) {
      this._persistState();
    }

    // Emitir evento de redefinição
    this.eventBus.emit('state:reset', this.state, previousState);
    this.eventBus.emit('state:update', this.state, previousState, Object.keys(this.state), 'reset');
  }

  /**
   * Carregar estado persistido do localStorage
   * @private
   */
  _loadPersistedState() {
    try {
      const persistedState = localStorage.getItem(this.persistKey);

      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        this.state = {
          ...this.state,
          ...parsedState
        };

        if (this.debug) {
          console.log('Loaded persisted state:', this.state);
        }
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  /**
   * Persistir estado atual no localStorage
   * @private
   */
  _persistState() {
    try {
      localStorage.setItem(this.persistKey, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }
}

// Estado inicial da aplicação
const initialState = {
  user: null,
  leagues: [],
  userLeagues: [],
  competitions: [],
  userCompetitions: [],
  activities: [],
  devices: [],
  notifications: [],
  ui: {
    loading: false,
    error: null,
    activeTab: 'dashboard',
    theme: 'light'
  }
};

// Criar instância global do store
export const store = new Store(initialState, {
  persistKey: 'fusetech_app_state',
  debug: process.env.NODE_ENV !== 'production'
});
