/**
 * Serviço de compartilhamento social para FuseLabs
 * 
 * Este módulo gerencia o compartilhamento de atividades, conquistas e desafios
 * em redes sociais e outras plataformas.
 */

class SocialSharingService {
  constructor() {
    // Plataformas de compartilhamento
    this.platforms = {
      NATIVE: 'native',
      FACEBOOK: 'facebook',
      TWITTER: 'twitter',
      WHATSAPP: 'whatsapp',
      TELEGRAM: 'telegram',
      EMAIL: 'email',
      COPY: 'copy'
    };
    
    // URLs base para compartilhamento
    this.shareUrls = {
      [this.platforms.FACEBOOK]: 'https://www.facebook.com/sharer/sharer.php?u=',
      [this.platforms.TWITTER]: 'https://twitter.com/intent/tweet?text=',
      [this.platforms.WHATSAPP]: 'https://api.whatsapp.com/send?text=',
      [this.platforms.TELEGRAM]: 'https://t.me/share/url?url=',
      [this.platforms.EMAIL]: 'mailto:?body='
    };
    
    // Tipos de conteúdo para compartilhamento
    this.contentTypes = {
      ACTIVITY: 'activity',
      ACHIEVEMENT: 'achievement',
      CHALLENGE: 'challenge',
      PROFILE: 'profile',
      CUSTOM: 'custom'
    };
    
    // Inicializar
    this.init();
  }
  
  /**
   * Inicializar o serviço de compartilhamento
   */
  init() {
    // Verificar suporte ao Web Share API
    this.hasNativeShare = 'share' in navigator;
    
    // Adicionar botões de compartilhamento a elementos existentes
    this.setupShareButtons();
    
    // Observar novos elementos para adicionar botões de compartilhamento
    this.observeNewElements();
    
    console.log('Serviço de compartilhamento social inicializado');
  }
  
  /**
   * Configurar botões de compartilhamento existentes
   */
  setupShareButtons() {
    // Selecionar todos os botões de compartilhamento
    const shareButtons = document.querySelectorAll('[data-share]');
    
    // Adicionar evento de clique a cada botão
    shareButtons.forEach(button => {
      this.setupShareButton(button);
    });
  }
  
  /**
   * Configurar botão de compartilhamento
   * @param {HTMLElement} button - Botão de compartilhamento
   */
  setupShareButton(button) {
    // Verificar se o botão já foi configurado
    if (button.hasAttribute('data-share-initialized')) {
      return;
    }
    
    // Marcar como inicializado
    button.setAttribute('data-share-initialized', 'true');
    
    // Adicionar evento de clique
    button.addEventListener('click', (event) => {
      event.preventDefault();
      
      // Obter dados de compartilhamento
      const contentType = button.getAttribute('data-share-type') || this.contentTypes.CUSTOM;
      const contentId = button.getAttribute('data-share-id');
      const platform = button.getAttribute('data-share-platform') || this.platforms.NATIVE;
      
      // Compartilhar conteúdo
      if (contentId) {
        this.shareContent(contentType, contentId, platform);
      } else {
        // Compartilhar URL atual
        const url = button.getAttribute('data-share-url') || window.location.href;
        const title = button.getAttribute('data-share-title') || document.title;
        const text = button.getAttribute('data-share-text') || '';
        
        this.share({
          url,
          title,
          text
        }, platform);
      }
    });
  }
  
  /**
   * Observar novos elementos para adicionar botões de compartilhamento
   */
  observeNewElements() {
    // Criar MutationObserver
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          // Verificar se é um elemento
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verificar se é um botão de compartilhamento
            if (node.hasAttribute && node.hasAttribute('data-share')) {
              this.setupShareButton(node);
            }
            
            // Verificar filhos
            const shareButtons = node.querySelectorAll ? node.querySelectorAll('[data-share]') : [];
            shareButtons.forEach(button => {
              this.setupShareButton(button);
            });
          }
        });
      });
    });
    
    // Observar mudanças no DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Compartilhar conteúdo
   * @param {String} contentType - Tipo de conteúdo
   * @param {String} contentId - ID do conteúdo
   * @param {String} platform - Plataforma de compartilhamento
   * @returns {Promise<Boolean>} - Promessa resolvida com verdadeiro se o compartilhamento for bem-sucedido
   */
  async shareContent(contentType, contentId, platform = this.platforms.NATIVE) {
    try {
      // Obter dados do conteúdo
      const content = await this.getContentData(contentType, contentId);
      
      if (!content) {
        console.error(`Conteúdo não encontrado: ${contentType} ${contentId}`);
        return false;
      }
      
      // Compartilhar conteúdo
      return this.share(content, platform);
    } catch (error) {
      console.error('Erro ao compartilhar conteúdo:', error);
      return false;
    }
  }
  
  /**
   * Obter dados do conteúdo
   * @param {String} contentType - Tipo de conteúdo
   * @param {String} contentId - ID do conteúdo
   * @returns {Promise<Object|null>} - Promessa resolvida com dados do conteúdo ou null
   */
  async getContentData(contentType, contentId) {
    // Em um ambiente real, buscaríamos os dados do servidor
    // Aqui, estamos simulando com dados estáticos
    
    switch (contentType) {
      case this.contentTypes.ACTIVITY:
        return {
          url: `${window.location.origin}/atividade.html?id=${contentId}`,
          title: 'Minha atividade no FuseLabs',
          text: 'Acabei de completar uma atividade no FuseLabs! Confira:',
          image: `${window.location.origin}/images/activities/${contentId}.jpg`
        };
      
      case this.contentTypes.ACHIEVEMENT:
        return {
          url: `${window.location.origin}/conquista.html?id=${contentId}`,
          title: 'Minha conquista no FuseLabs',
          text: 'Acabei de desbloquear uma conquista no FuseLabs! Confira:',
          image: `${window.location.origin}/images/achievements/${contentId}.jpg`
        };
      
      case this.contentTypes.CHALLENGE:
        return {
          url: `${window.location.origin}/desafio.html?id=${contentId}`,
          title: 'Desafio no FuseLabs',
          text: 'Estou participando deste desafio no FuseLabs! Junte-se a mim:',
          image: `${window.location.origin}/images/challenges/${contentId}.jpg`
        };
      
      case this.contentTypes.PROFILE:
        return {
          url: `${window.location.origin}/perfil.html?id=${contentId}`,
          title: 'Meu perfil no FuseLabs',
          text: 'Confira meu perfil no FuseLabs:',
          image: `${window.location.origin}/images/profiles/${contentId}.jpg`
        };
      
      default:
        return null;
    }
  }
  
  /**
   * Compartilhar conteúdo
   * @param {Object} content - Dados do conteúdo
   * @param {String} platform - Plataforma de compartilhamento
   * @returns {Promise<Boolean>} - Promessa resolvida com verdadeiro se o compartilhamento for bem-sucedido
   */
  async share(content, platform = this.platforms.NATIVE) {
    try {
      // Verificar se a plataforma é nativa e se há suporte
      if (platform === this.platforms.NATIVE && this.hasNativeShare) {
        return this.nativeShare(content);
      }
      
      // Compartilhar em plataforma específica
      switch (platform) {
        case this.platforms.FACEBOOK:
          return this.shareOnFacebook(content);
        
        case this.platforms.TWITTER:
          return this.shareOnTwitter(content);
        
        case this.platforms.WHATSAPP:
          return this.shareOnWhatsApp(content);
        
        case this.platforms.TELEGRAM:
          return this.shareOnTelegram(content);
        
        case this.platforms.EMAIL:
          return this.shareViaEmail(content);
        
        case this.platforms.COPY:
          return this.copyToClipboard(content);
        
        default:
          // Se não houver suporte nativo ou a plataforma não for reconhecida,
          // mostrar modal de compartilhamento personalizado
          this.showShareModal(content);
          return true;
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      
      // Mostrar modal de compartilhamento como fallback
      this.showShareModal(content);
      return false;
    }
  }
  
  /**
   * Compartilhar usando Web Share API nativa
   * @param {Object} content - Dados do conteúdo
   * @returns {Promise<Boolean>} - Promessa resolvida com verdadeiro se o compartilhamento for bem-sucedido
   */
  async nativeShare(content) {
    try {
      // Configurar dados de compartilhamento
      const shareData = {
        title: content.title,
        text: content.text,
        url: content.url
      };
      
      // Adicionar imagem se disponível e suportada
      if (content.image && 'canShare' in navigator && navigator.canShare({ files: [new File([new Blob()], 'test.png', { type: 'image/png' })] })) {
        try {
          // Buscar imagem
          const response = await fetch(content.image);
          const blob = await response.blob();
          
          // Criar arquivo
          const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
          
          // Adicionar arquivo aos dados de compartilhamento
          shareData.files = [file];
        } catch (error) {
          console.warn('Erro ao adicionar imagem ao compartilhamento:', error);
        }
      }
      
      // Compartilhar
      await navigator.share(shareData);
      
      return true;
    } catch (error) {
      console.error('Erro ao usar Web Share API:', error);
      
      // Mostrar modal de compartilhamento como fallback
      this.showShareModal(content);
      
      return false;
    }
  }
  
  /**
   * Compartilhar no Facebook
   * @param {Object} content - Dados do conteúdo
   * @returns {Boolean} - Verdadeiro se o compartilhamento for iniciado
   */
  shareOnFacebook(content) {
    const url = `${this.shareUrls[this.platforms.FACEBOOK]}${encodeURIComponent(content.url)}`;
    
    // Abrir janela de compartilhamento
    this.openShareWindow(url, 'Facebook');
    
    return true;
  }
  
  /**
   * Compartilhar no Twitter
   * @param {Object} content - Dados do conteúdo
   * @returns {Boolean} - Verdadeiro se o compartilhamento for iniciado
   */
  shareOnTwitter(content) {
    const text = `${content.text} ${content.url}`;
    const url = `${this.shareUrls[this.platforms.TWITTER]}${encodeURIComponent(text)}`;
    
    // Abrir janela de compartilhamento
    this.openShareWindow(url, 'Twitter');
    
    return true;
  }
  
  /**
   * Compartilhar no WhatsApp
   * @param {Object} content - Dados do conteúdo
   * @returns {Boolean} - Verdadeiro se o compartilhamento for iniciado
   */
  shareOnWhatsApp(content) {
    const text = `${content.text} ${content.url}`;
    const url = `${this.shareUrls[this.platforms.WHATSAPP]}${encodeURIComponent(text)}`;
    
    // Abrir janela de compartilhamento
    window.open(url, '_blank');
    
    return true;
  }
  
  /**
   * Compartilhar no Telegram
   * @param {Object} content - Dados do conteúdo
   * @returns {Boolean} - Verdadeiro se o compartilhamento for iniciado
   */
  shareOnTelegram(content) {
    const url = `${this.shareUrls[this.platforms.TELEGRAM]}${encodeURIComponent(content.url)}&text=${encodeURIComponent(content.text)}`;
    
    // Abrir janela de compartilhamento
    window.open(url, '_blank');
    
    return true;
  }
  
  /**
   * Compartilhar via e-mail
   * @param {Object} content - Dados do conteúdo
   * @returns {Boolean} - Verdadeiro se o compartilhamento for iniciado
   */
  shareViaEmail(content) {
    const subject = encodeURIComponent(content.title);
    const body = encodeURIComponent(`${content.text}\n\n${content.url}`);
    const url = `${this.shareUrls[this.platforms.EMAIL]}${body}&subject=${subject}`;
    
    // Abrir cliente de e-mail
    window.location.href = url;
    
    return true;
  }
  
  /**
   * Copiar para a área de transferência
   * @param {Object} content - Dados do conteúdo
   * @returns {Promise<Boolean>} - Promessa resolvida com verdadeiro se a cópia for bem-sucedida
   */
  async copyToClipboard(content) {
    try {
      // Texto a ser copiado
      const text = `${content.text}\n${content.url}`;
      
      // Copiar para a área de transferência
      await navigator.clipboard.writeText(text);
      
      // Mostrar feedback
      this.showToast('Link copiado para a área de transferência', 'success');
      
      return true;
    } catch (error) {
      console.error('Erro ao copiar para a área de transferência:', error);
      
      // Mostrar feedback
      this.showToast('Erro ao copiar link', 'error');
      
      return false;
    }
  }
  
  /**
   * Abrir janela de compartilhamento
   * @param {String} url - URL de compartilhamento
   * @param {String} title - Título da janela
   */
  openShareWindow(url, title) {
    // Configurar dimensões da janela
    const width = 550;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    // Abrir janela
    window.open(
      url,
      title,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  }
  
  /**
   * Mostrar modal de compartilhamento personalizado
   * @param {Object} content - Dados do conteúdo
   */
  showShareModal(content) {
    // Criar overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg shadow-xl max-w-md w-full mx-4';
    modal.innerHTML = `
      <div class="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Compartilhar</h2>
        <button id="close-share-modal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="p-4">
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">Compartilhar em</h3>
          <div class="grid grid-cols-4 gap-4">
            <button class="share-platform-btn flex flex-col items-center" data-platform="facebook">
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <i class="fab fa-facebook-f text-blue-600"></i>
              </div>
              <span class="text-xs">Facebook</span>
            </button>
            
            <button class="share-platform-btn flex flex-col items-center" data-platform="twitter">
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <i class="fab fa-twitter text-blue-400"></i>
              </div>
              <span class="text-xs">Twitter</span>
            </button>
            
            <button class="share-platform-btn flex flex-col items-center" data-platform="whatsapp">
              <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-1">
                <i class="fab fa-whatsapp text-green-500"></i>
              </div>
              <span class="text-xs">WhatsApp</span>
            </button>
            
            <button class="share-platform-btn flex flex-col items-center" data-platform="telegram">
              <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                <i class="fab fa-telegram-plane text-blue-500"></i>
              </div>
              <span class="text-xs">Telegram</span>
            </button>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-2">Ou copie o link</h3>
          <div class="flex">
            <input type="text" id="share-url" value="${content.url}" class="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 text-sm" readonly>
            <button id="copy-share-url" class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Adicionar modal ao overlay
    overlay.appendChild(modal);
    
    // Adicionar overlay ao body
    document.body.appendChild(overlay);
    
    // Configurar eventos
    document.getElementById('close-share-modal').addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    document.getElementById('copy-share-url').addEventListener('click', () => {
      const input = document.getElementById('share-url');
      input.select();
      document.execCommand('copy');
      
      // Mostrar feedback
      this.showToast('Link copiado para a área de transferência', 'success');
    });
    
    // Configurar botões de plataforma
    const platformButtons = document.querySelectorAll('.share-platform-btn');
    platformButtons.forEach(button => {
      button.addEventListener('click', () => {
        const platform = button.getAttribute('data-platform');
        
        // Compartilhar na plataforma selecionada
        this.share(content, platform);
        
        // Fechar modal
        document.body.removeChild(overlay);
      });
    });
    
    // Fechar ao clicar fora do modal
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }
  
  /**
   * Mostrar toast de notificação
   * @param {String} message - Mensagem
   * @param {String} type - Tipo de notificação ('success', 'error', 'info')
   */
  showToast(message, type = 'info') {
    // Verificar se a função global showToast existe
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }
    
    // Criar toast
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      'bg-blue-500'
    } text-white`;
    toast.textContent = message;
    
    // Adicionar ao body
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  }
  
  /**
   * Criar cartão de compartilhamento personalizado
   * @param {Object} content - Dados do conteúdo
   * @returns {Promise<Blob>} - Promessa resolvida com o blob da imagem
   */
  async createShareCard(content) {
    return new Promise((resolve, reject) => {
      try {
        // Criar canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        
        // Obter contexto
        const ctx = canvas.getContext('2d');
        
        // Desenhar fundo
        ctx.fillStyle = '#f9fafb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar borda
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
        
        // Desenhar logo
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.src = `${window.location.origin}/images/logo.png`;
        
        logo.onload = () => {
          // Desenhar logo
          ctx.drawImage(logo, 50, 50, 200, 200);
          
          // Desenhar título
          ctx.font = 'bold 60px Arial';
          ctx.fillStyle = '#111827';
          ctx.fillText(content.title, 50, 300, canvas.width - 100);
          
          // Desenhar texto
          ctx.font = '40px Arial';
          ctx.fillStyle = '#6b7280';
          ctx.fillText(content.text, 50, 380, canvas.width - 100);
          
          // Desenhar URL
          ctx.font = '30px Arial';
          ctx.fillStyle = '#6366f1';
          ctx.fillText(content.url, 50, 450, canvas.width - 100);
          
          // Desenhar imagem de conteúdo, se disponível
          if (content.image) {
            const contentImage = new Image();
            contentImage.crossOrigin = 'anonymous';
            contentImage.src = content.image;
            
            contentImage.onload = () => {
              // Desenhar imagem
              ctx.drawImage(contentImage, 600, 50, 550, 400);
              
              // Converter canvas para blob
              canvas.toBlob(blob => {
                resolve(blob);
              }, 'image/jpeg', 0.9);
            };
            
            contentImage.onerror = () => {
              // Converter canvas para blob mesmo sem a imagem
              canvas.toBlob(blob => {
                resolve(blob);
              }, 'image/jpeg', 0.9);
            };
          } else {
            // Converter canvas para blob
            canvas.toBlob(blob => {
              resolve(blob);
            }, 'image/jpeg', 0.9);
          }
        };
        
        logo.onerror = () => {
          // Desenhar título mesmo sem o logo
          ctx.font = 'bold 60px Arial';
          ctx.fillStyle = '#111827';
          ctx.fillText(content.title, 50, 300, canvas.width - 100);
          
          // Converter canvas para blob
          canvas.toBlob(blob => {
            resolve(blob);
          }, 'image/jpeg', 0.9);
        };
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Criar instância global
const socialSharing = new SocialSharingService();
