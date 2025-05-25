/**
 * Sistema de internacionalização (i18n) para FuseLabs
 * 
 * Este módulo gerencia traduções e localização para diferentes idiomas.
 */

class I18nManager {
  constructor() {
    // Idioma padrão
    this.defaultLocale = 'pt-BR';
    
    // Idioma atual
    this.currentLocale = this.defaultLocale;
    
    // Traduções disponíveis
    this.translations = {};
    
    // Inicializar
    this.init();
  }
  
  /**
   * Inicializar o gerenciador de i18n
   */
  init() {
    // Carregar idioma do localStorage ou do navegador
    this.currentLocale = localStorage.getItem('locale') || 
                         navigator.language || 
                         navigator.userLanguage || 
                         this.defaultLocale;
    
    // Verificar se o idioma é suportado
    if (!this.isSupportedLocale(this.currentLocale)) {
      // Tentar encontrar um idioma compatível
      const baseLocale = this.currentLocale.split('-')[0];
      
      // Verificar se o idioma base é suportado
      if (this.isSupportedLocale(baseLocale)) {
        this.currentLocale = baseLocale;
      } else {
        // Usar idioma padrão
        this.currentLocale = this.defaultLocale;
      }
    }
    
    // Carregar traduções para o idioma atual
    this.loadTranslations(this.currentLocale);
  }
  
  /**
   * Verificar se um idioma é suportado
   * @param {String} locale - Código do idioma
   * @returns {Boolean} - Verdadeiro se o idioma for suportado
   */
  isSupportedLocale(locale) {
    return ['pt-BR', 'en-US', 'es'].includes(locale);
  }
  
  /**
   * Carregar traduções para um idioma
   * @param {String} locale - Código do idioma
   * @returns {Promise} - Promessa resolvida quando as traduções forem carregadas
   */
  loadTranslations(locale) {
    return new Promise((resolve, reject) => {
      // Verificar se as traduções já foram carregadas
      if (this.translations[locale]) {
        resolve(this.translations[locale]);
        return;
      }
      
      // Carregar arquivo de traduções
      fetch(`locales/${locale}.json`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Falha ao carregar traduções para ${locale}`);
          }
          return response.json();
        })
        .then(data => {
          // Armazenar traduções
          this.translations[locale] = data;
          resolve(data);
        })
        .catch(error => {
          console.error(`Erro ao carregar traduções para ${locale}:`, error);
          
          // Tentar carregar o idioma padrão como fallback
          if (locale !== this.defaultLocale) {
            return this.loadTranslations(this.defaultLocale)
              .then(resolve)
              .catch(reject);
          }
          
          reject(error);
        });
    });
  }
  
  /**
   * Alterar o idioma atual
   * @param {String} locale - Código do idioma
   * @returns {Promise} - Promessa resolvida quando o idioma for alterado
   */
  changeLocale(locale) {
    return new Promise((resolve, reject) => {
      // Verificar se o idioma é suportado
      if (!this.isSupportedLocale(locale)) {
        reject(new Error(`Idioma não suportado: ${locale}`));
        return;
      }
      
      // Carregar traduções para o novo idioma
      this.loadTranslations(locale)
        .then(() => {
          // Atualizar idioma atual
          this.currentLocale = locale;
          
          // Salvar no localStorage
          localStorage.setItem('locale', locale);
          
          // Atualizar a página
          this.updatePageTranslations();
          
          // Disparar evento de alteração de idioma
          window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
          
          resolve();
        })
        .catch(reject);
    });
  }
  
  /**
   * Obter uma tradução
   * @param {String} key - Chave da tradução
   * @param {Object} params - Parâmetros para substituição
   * @returns {String} - Texto traduzido
   */
  translate(key, params = {}) {
    // Obter traduções para o idioma atual
    const translations = this.translations[this.currentLocale] || {};
    
    // Dividir a chave em partes (para acessar objetos aninhados)
    const parts = key.split('.');
    
    // Navegar pelo objeto de traduções
    let value = translations;
    for (const part of parts) {
      value = value?.[part];
      
      // Se não encontrar a tradução, tentar no idioma padrão
      if (value === undefined) {
        break;
      }
    }
    
    // Se não encontrar a tradução, tentar no idioma padrão
    if (value === undefined && this.currentLocale !== this.defaultLocale) {
      const defaultTranslations = this.translations[this.defaultLocale] || {};
      
      value = defaultTranslations;
      for (const part of parts) {
        value = value?.[part];
        
        if (value === undefined) {
          break;
        }
      }
    }
    
    // Se ainda não encontrar, retornar a chave
    if (value === undefined) {
      return key;
    }
    
    // Substituir parâmetros
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramName) => {
        return params[paramName] !== undefined ? params[paramName] : match;
      });
    }
    
    return value;
  }
  
  /**
   * Atualizar traduções na página
   */
  updatePageTranslations() {
    // Selecionar todos os elementos com atributo data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const params = {};
      
      // Obter parâmetros do atributo data-i18n-params
      const paramsAttr = element.getAttribute('data-i18n-params');
      if (paramsAttr) {
        try {
          Object.assign(params, JSON.parse(paramsAttr));
        } catch (error) {
          console.error(`Erro ao analisar parâmetros de i18n: ${paramsAttr}`, error);
        }
      }
      
      // Traduzir e atualizar o conteúdo
      element.textContent = this.translate(key, params);
    });
    
    // Atualizar placeholders
    const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    placeholders.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.translate(key);
    });
    
    // Atualizar títulos
    const titles = document.querySelectorAll('[data-i18n-title]');
    titles.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.translate(key);
    });
    
    // Atualizar atributos aria-label
    const ariaLabels = document.querySelectorAll('[data-i18n-aria-label]');
    ariaLabels.forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      element.setAttribute('aria-label', this.translate(key));
    });
  }
  
  /**
   * Formatar data de acordo com o idioma atual
   * @param {Date|String|Number} date - Data a ser formatada
   * @param {Object} options - Opções de formatação
   * @returns {String} - Data formatada
   */
  formatDate(date, options = {}) {
    // Converter para objeto Date se necessário
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Formatar data
    return new Intl.DateTimeFormat(this.currentLocale, options).format(dateObj);
  }
  
  /**
   * Formatar número de acordo com o idioma atual
   * @param {Number} number - Número a ser formatado
   * @param {Object} options - Opções de formatação
   * @returns {String} - Número formatado
   */
  formatNumber(number, options = {}) {
    return new Intl.NumberFormat(this.currentLocale, options).format(number);
  }
  
  /**
   * Formatar moeda de acordo com o idioma atual
   * @param {Number} amount - Valor a ser formatado
   * @param {String} currency - Código da moeda (padrão: BRL)
   * @returns {String} - Valor formatado
   */
  formatCurrency(amount, currency = 'BRL') {
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
  
  /**
   * Obter o nome do idioma atual
   * @returns {String} - Nome do idioma
   */
  getLanguageName() {
    const names = {
      'pt-BR': 'Português',
      'en-US': 'English',
      'es': 'Español'
    };
    
    return names[this.currentLocale] || this.currentLocale;
  }
}

// Criar instância global
const i18n = new I18nManager();

// Atalho para tradução
function __(key, params) {
  return i18n.translate(key, params);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Atualizar traduções na página
  i18n.updatePageTranslations();
  
  // Configurar seletor de idioma
  const languageSelector = document.getElementById('language-selector');
  if (languageSelector) {
    // Definir valor inicial
    languageSelector.value = i18n.currentLocale;
    
    // Configurar evento de alteração
    languageSelector.addEventListener('change', function() {
      i18n.changeLocale(this.value);
    });
  }
});
