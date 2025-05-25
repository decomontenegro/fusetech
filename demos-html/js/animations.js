/**
 * FUSEtech Animations Controller
 * Gerencia animações e microinterações da interface
 * Inspirado nas melhores práticas de Apple, Google e Strava
 */

class AnimationsManager {
  constructor() {
    // Configurações
    this.animationsEnabled = true;
    this.reducedMotion = false;

    // Inicializar
    this.init();
  }

  init() {
    // Verificar preferência de movimento reduzido
    this.checkReducedMotion();

    // Aplicar animações iniciais
    this.applyPageTransition();
    this.setupCardAnimations();
    this.setupButtonAnimations();
    this.setupFadeInElements();

    // Configurar observadores para elementos que entram na viewport
    this.setupScrollObservers();
  }

  checkReducedMotion() {
    // Verificar se o usuário prefere movimento reduzido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reducedMotion = true;
      this.animationsEnabled = false;
    }

    // Observar mudanças na preferência
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
      this.reducedMotion = e.matches;
      this.animationsEnabled = !e.matches;

      // Atualizar estilos
      this.updateAnimationStyles();
    });
  }

  updateAnimationStyles() {
    // Adicionar ou remover classe de animações desativadas
    if (this.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }

  applyPageTransition() {
    if (!this.animationsEnabled) return;

    // Adicionar classe para animar entrada da página
    document.body.classList.add('page-transition-in');

    // Remover após a animação
    setTimeout(() => {
      document.body.classList.remove('page-transition-in');
    }, 500);
  }

  setupCardAnimations() {
    if (!this.animationsEnabled) return;

    // Adicionar classe para animar cards
    const cards = document.querySelectorAll('.challenge-card, .analytics-card, .route-card');
    cards.forEach((card, index) => {
      // Atrasar a animação para cada card
      setTimeout(() => {
        card.classList.add('animate-in');
      }, 100 + (index * 50));
    });
  }

  setupButtonAnimations() {
    if (!this.animationsEnabled) return;

    // Adicionar efeito de ripple aos botões
    const buttons = document.querySelectorAll('button:not([disabled]), .btn');
    buttons.forEach(button => {
      button.addEventListener('click', e => {
        // Criar elemento de ripple
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');

        // Posicionar o ripple onde o usuário clicou
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        // Adicionar ao botão
        button.appendChild(ripple);

        // Remover após a animação
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  setupFadeInElements() {
    if (!this.animationsEnabled) return;

    // Animar elementos com a classe fade-in
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((element, index) => {
      // Atrasar a animação para cada elemento
      setTimeout(() => {
        element.classList.add('visible');
      }, 200 + (index * 100));
    });
  }

  setupScrollObservers() {
    if (!this.animationsEnabled) return;

    // Configurar Intersection Observer para animar elementos quando entram na viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Parar de observar após animar
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1, // Animar quando 10% do elemento está visível
      rootMargin: '0px 0px -50px 0px' // Margem negativa para animar um pouco antes
    });

    // Observar elementos com a classe scroll-animate
    const scrollElements = document.querySelectorAll('.scroll-animate');
    scrollElements.forEach(element => {
      observer.observe(element);
    });
  }

  // Método para animar transição entre páginas
  animatePageTransition(callback) {
    if (!this.animationsEnabled) {
      // Se animações estiverem desativadas, apenas executar o callback
      if (typeof callback === 'function') callback();
      return;
    }

    // Adicionar classe para animar saída da página
    document.body.classList.add('page-transition-out');

    // Executar callback após a animação
    setTimeout(() => {
      document.body.classList.remove('page-transition-out');
      if (typeof callback === 'function') callback();
    }, 300);
  }

  // Método para animar entrada de um elemento
  animateElementEntrance(element, delay = 0) {
    if (!this.animationsEnabled || !element) return;

    // Adicionar classe para animar entrada
    element.classList.add('element-entrance');

    // Aplicar delay se necessário
    if (delay > 0) {
      element.style.animationDelay = `${delay}ms`;
    }

    // Remover classe após a animação
    element.addEventListener('animationend', () => {
      element.classList.remove('element-entrance');
      element.style.animationDelay = '';
    }, { once: true });
  }

  // Método para animar saída de um elemento
  animateElementExit(element, callback) {
    if (!this.animationsEnabled || !element) {
      // Se animações estiverem desativadas, apenas executar o callback
      if (typeof callback === 'function') callback();
      return;
    }

    // Adicionar classe para animar saída
    element.classList.add('element-exit');

    // Executar callback após a animação
    element.addEventListener('animationend', () => {
      element.classList.remove('element-exit');
      if (typeof callback === 'function') callback();
    }, { once: true });
  }

  // Método para animar notificações
  animateNotification(message, type = 'success') {
    if (!this.animationsEnabled) {
      // Se animações estiverem desativadas, mostrar notificação sem animação
      alert(message);
      return;
    }

    // Verificar se já existe uma notificação
    let notification = document.getElementById('animated-notification');

    if (!notification) {
      // Criar elemento de notificação
      notification = document.createElement('div');
      notification.id = 'animated-notification';
      notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 translate-y-20 opacity-0`;
      document.body.appendChild(notification);
    }

    // Definir classe de cor com base no tipo
    notification.className = notification.className.replace(/bg-\w+-\d+/g, '');
    switch (type) {
      case 'success':
        notification.classList.add('bg-green-500', 'text-white');
        break;
      case 'error':
        notification.classList.add('bg-red-500', 'text-white');
        break;
      case 'warning':
        notification.classList.add('bg-yellow-500', 'text-white');
        break;
      case 'info':
        notification.classList.add('bg-blue-500', 'text-white');
        break;
      default:
        notification.classList.add('bg-gray-800', 'text-white');
    }

    // Definir mensagem
    notification.textContent = message;

    // Mostrar notificação
    setTimeout(() => {
      notification.classList.remove('translate-y-20', 'opacity-0');
    }, 100);

    // Esconder notificação após 3 segundos
    setTimeout(() => {
      notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
  }

  /**
   * Anima celebração de conquista
   */
  celebrateAchievement(element) {
    if (!this.animationsEnabled) return;

    element.classList.add('animate-celebration');

    // Cria confetes
    this.createConfetti(element);

    // Remove a classe após a animação
    setTimeout(() => {
      element.classList.remove('animate-celebration');
    }, 600);
  }

  /**
   * Cria efeito de confetes
   */
  createConfetti(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 20; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = centerX + 'px';
      confetti.style.top = centerY + 'px';
      confetti.style.width = '6px';
      confetti.style.height = '6px';
      confetti.style.backgroundColor = this.getRandomColor();
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';

      document.body.appendChild(confetti);

      // Anima o confete
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 100 + Math.random() * 100;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 200;

      confetti.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${vx}px, ${vy}px) rotate(720deg)`, opacity: 0 }
      ], {
        duration: 1000 + Math.random() * 500,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => {
        confetti.remove();
      };
    }
  }

  /**
   * Retorna uma cor aleatória para confetes
   */
  getRandomColor() {
    const colors = ['#5046e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Anima contadores numéricos
   */
  animateCounter(element, targetValue, duration = 2000) {
    if (!this.animationsEnabled) return;

    const startValue = 0;
    const increment = targetValue / (duration / 16);
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;

      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }

      element.textContent = Math.floor(currentValue);
    }, 16);
  }
}

// Adicionar estilos CSS para animações
function addAnimationStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Transições de página */
    .page-transition-in {
      animation: fadeIn 0.5s ease-out;
    }

    .page-transition-out {
      animation: fadeOut 0.3s ease-in;
    }

    /* Animações de elementos */
    .element-entrance {
      animation: slideInUp 0.4s ease-out forwards;
    }

    .element-exit {
      animation: fadeOut 0.3s ease-in forwards;
    }

    /* Animações de cards */
    .challenge-card, .analytics-card, .route-card {
      opacity: 0;
      transform: translateY(20px);
    }

    .challenge-card.animate-in, .analytics-card.animate-in, .route-card.animate-in {
      animation: slideInUp 0.5s ease-out forwards;
    }

    /* Animações de fade */
    .fade-in {
      opacity: 0;
      transition: opacity 0.5s ease-in-out;
    }

    .fade-in.visible {
      opacity: 1;
    }

    /* Animações de scroll */
    .scroll-animate {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .scroll-animate.in-view {
      opacity: 1;
      transform: translateY(0);
    }

    /* Efeito de ripple para botões */
    button, .btn {
      position: relative;
      overflow: hidden;
    }

    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.4);
      width: 100px;
      height: 100px;
      margin-top: -50px;
      margin-left: -50px;
      animation: ripple 0.6s linear;
      transform: scale(0);
      pointer-events: none;
    }

    /* Keyframes */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }

    /* Desativar animações para usuários que preferem movimento reduzido */
    .reduced-motion * {
      animation: none !important;
      transition: none !important;
    }
  `;

  document.head.appendChild(styleElement);
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar estilos de animação
  addAnimationStyles();

  // Inicializar gerenciador de animações
  const animationsManager = new AnimationsManager();

  // Expor globalmente para uso em outros scripts
  window.animationsManager = animationsManager;
});
