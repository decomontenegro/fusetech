/**
 * Barramento de eventos
 * 
 * Este módulo implementa um sistema de publicação/assinatura (pub/sub)
 * para comunicação entre componentes desacoplados.
 */

export class EventBus {
  /**
   * Construtor do barramento de eventos
   */
  constructor() {
    this.listeners = {};
  }

  /**
   * Assinar um evento
   * @param {String} event - Nome do evento
   * @param {Function} callback - Função a ser chamada quando o evento ocorrer
   * @returns {Function} - Função para cancelar a assinatura
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    
    // Retornar função para cancelar a assinatura
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Assinar um evento uma única vez
   * @param {String} event - Nome do evento
   * @param {Function} callback - Função a ser chamada quando o evento ocorrer
   * @returns {Function} - Função para cancelar a assinatura
   */
  once(event, callback) {
    const onceCallback = (...args) => {
      this.off(event, onceCallback);
      callback(...args);
    };
    
    return this.on(event, onceCallback);
  }

  /**
   * Cancelar assinatura de um evento
   * @param {String} event - Nome do evento
   * @param {Function} callback - Função a ser removida
   */
  off(event, callback) {
    if (!this.listeners[event]) {
      return;
    }
    
    this.listeners[event] = this.listeners[event].filter(
      listener => listener !== callback
    );
    
    // Remover array vazio
    if (this.listeners[event].length === 0) {
      delete this.listeners[event];
    }
  }

  /**
   * Emitir um evento
   * @param {String} event - Nome do evento
   * @param {...any} args - Argumentos a serem passados para os callbacks
   */
  emit(event, ...args) {
    if (!this.listeners[event]) {
      return;
    }
    
    // Criar cópia do array para evitar problemas se callbacks modificarem a lista
    const callbacks = [...this.listeners[event]];
    
    for (const callback of callbacks) {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }
  }

  /**
   * Remover todos os listeners de um evento
   * @param {String} event - Nome do evento (opcional, se não fornecido, remove todos)
   */
  clear(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Obter todos os eventos registrados
   * @returns {Array} - Lista de nomes de eventos
   */
  getEvents() {
    return Object.keys(this.listeners);
  }

  /**
   * Obter número de listeners para um evento
   * @param {String} event - Nome do evento
   * @returns {Number} - Número de listeners
   */
  listenerCount(event) {
    if (!this.listeners[event]) {
      return 0;
    }
    
    return this.listeners[event].length;
  }
}
