/**
 * FUSEtech Social Features Controller
 * Gerencia funcionalidades sociais, feed e interações da comunidade
 */

class SocialController {
  constructor() {
    this.posts = [];
    this.groups = [];
    this.suggestedFriends = [];
    this.currentFilter = 'all';
    this.currentPage = 1;
    this.postsPerPage = 10;
    
    this.init();
  }

  init() {
    this.loadPosts();
    this.loadGroups();
    this.loadSuggestedFriends();
    this.setupEventListeners();
    this.startRealTimeUpdates();
  }

  /**
   * Carrega posts do feed
   */
  loadPosts() {
    this.posts = [
      {
        id: 1,
        user: {
          name: 'Ana Silva',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
          username: 'ana_runner'
        },
        type: 'activity',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        content: 'Acabei de completar minha corrida matinal! Que sensação incrível começar o dia assim 🏃‍♀️',
        activity: {
          type: 'running',
          title: 'Corrida Matinal',
          distance: 8.5,
          duration: '42:30',
          pace: '5:00',
          calories: 420,
          elevation: 120
        },
        likes: 23,
        comments: 5,
        isLiked: false
      },
      {
        id: 2,
        user: {
          name: 'Carlos Mendes',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          username: 'carlos_fit'
        },
        type: 'achievement',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        content: 'Finalmente consegui! 🎉',
        achievement: {
          title: 'Maratonista',
          description: 'Completou 42km em atividades',
          icon: 'fas fa-running',
          tier: 'gold'
        },
        likes: 67,
        comments: 12,
        isLiked: true
      },
      {
        id: 3,
        user: {
          name: 'Maria Costa',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          username: 'maria_yoga'
        },
        type: 'activity',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
        content: 'Sessão de yoga ao ar livre hoje. A natureza é o melhor estúdio! 🧘‍♀️🌿',
        activity: {
          type: 'yoga',
          title: 'Yoga no Parque',
          duration: '60:00',
          calories: 180,
          intensity: 'Moderada'
        },
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
        likes: 34,
        comments: 8,
        isLiked: false
      },
      {
        id: 4,
        user: {
          name: 'Pedro Santos',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          username: 'pedro_cyclist'
        },
        type: 'activity',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
        content: 'Pedalada épica hoje! Subida desafiadora mas a vista valeu cada pedalada 🚴‍♂️',
        activity: {
          type: 'cycling',
          title: 'Trilha da Montanha',
          distance: 45.2,
          duration: '2:15:30',
          speed: '20.1',
          elevation: 890,
          calories: 1250
        },
        likes: 45,
        comments: 15,
        isLiked: true
      }
    ];

    this.renderPosts();
  }

  /**
   * Carrega grupos do usuário
   */
  loadGroups() {
    this.groups = [
      {
        id: 1,
        name: 'Corredores SP',
        members: 1247,
        avatar: 'CS',
        hasNotification: true
      },
      {
        id: 2,
        name: 'Yoga Lovers',
        members: 892,
        avatar: 'YL',
        hasNotification: false
      },
      {
        id: 3,
        name: 'Ciclistas Unidos',
        members: 2156,
        avatar: 'CU',
        hasNotification: true
      },
      {
        id: 4,
        name: 'Fitness Motivation',
        members: 3421,
        avatar: 'FM',
        hasNotification: false
      }
    ];

    this.renderGroups();
  }

  /**
   * Carrega sugestões de amigos
   */
  loadSuggestedFriends() {
    this.suggestedFriends = [
      {
        id: 1,
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        mutualFriends: 5
      },
      {
        id: 2,
        name: 'Fernanda Lima',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        mutualFriends: 3
      },
      {
        id: 3,
        name: 'Roberto Alves',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        mutualFriends: 8
      }
    ];

    this.renderSuggestedFriends();
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Filtros do feed
    document.querySelectorAll('.feed-filter').forEach(filter => {
      filter.addEventListener('click', (e) => {
        this.handleFilterChange(e.target.dataset.filter);
      });
    });

    // Botões de ação rápida
    document.getElementById('create-post-btn')?.addEventListener('click', () => {
      this.showCreatePostModal();
    });

    document.getElementById('create-group-btn')?.addEventListener('click', () => {
      this.showCreateGroupModal();
    });

    document.getElementById('find-friends-btn')?.addEventListener('click', () => {
      this.showFindFriendsModal();
    });

    // Carregar mais posts
    document.getElementById('load-more-posts')?.addEventListener('click', () => {
      this.loadMorePosts();
    });

    // Busca de usuários
    document.getElementById('user-search')?.addEventListener('input', (e) => {
      this.handleUserSearch(e.target.value);
    });
  }

  /**
   * Filtra posts por categoria
   */
  handleFilterChange(filter) {
    this.currentFilter = filter;
    this.currentPage = 1;

    // Atualiza UI dos filtros
    document.querySelectorAll('.feed-filter').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeButton = document.querySelector(`[data-filter="${filter}"]`);
    activeButton.classList.add('active');

    // Filtra e renderiza posts
    this.renderPosts();
  }

  /**
   * Renderiza posts do feed
   */
  renderPosts() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    // Filtra posts baseado no filtro atual
    let filteredPosts = this.posts;
    
    switch (this.currentFilter) {
      case 'following':
        // Simula posts apenas de pessoas que o usuário segue
        filteredPosts = this.posts.filter(post => ['ana_runner', 'carlos_fit'].includes(post.user.username));
        break;
      case 'groups':
        // Simula posts de grupos
        filteredPosts = this.posts.filter(post => Math.random() > 0.5);
        break;
      case 'achievements':
        filteredPosts = this.posts.filter(post => post.type === 'achievement');
        break;
      default:
        filteredPosts = this.posts;
    }

    // Renderiza posts
    container.innerHTML = filteredPosts.map(post => this.createPostHTML(post)).join('');

    // Adiciona event listeners aos posts
    this.attachPostEventListeners();

    // Anima entrada dos posts
    setTimeout(() => {
      container.querySelectorAll('.feed-post').forEach((post, index) => {
        post.classList.add('post-enter');
        post.style.animationDelay = `${index * 100}ms`;
      });
    }, 100);
  }

  /**
   * Cria HTML de um post
   */
  createPostHTML(post) {
    const timeAgo = this.getTimeAgo(post.timestamp);
    
    if (post.type === 'achievement') {
      return this.createAchievementPostHTML(post, timeAgo);
    }
    
    return `
      <div class="feed-post" data-post-id="${post.id}">
        <div class="post-header">
          <img src="${post.user.avatar}" alt="${post.user.name}" class="post-avatar">
          <div class="post-user-info">
            <div class="post-username">${post.user.name}</div>
            <div class="post-time">${timeAgo}</div>
          </div>
          <button class="post-menu">
            <i class="fas fa-ellipsis-h"></i>
          </button>
        </div>
        
        <div class="post-content">
          <p class="post-text">${post.content}</p>
          
          ${post.activity ? this.createActivityHTML(post.activity) : ''}
          ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        </div>
        
        <div class="post-actions">
          <button class="post-action ${post.isLiked ? 'liked' : ''}" data-action="like">
            <i class="fas fa-heart"></i>
            <span>${post.likes}</span>
          </button>
          <button class="post-action" data-action="comment">
            <i class="fas fa-comment"></i>
            <span>${post.comments}</span>
          </button>
          <button class="post-action" data-action="share">
            <i class="fas fa-share"></i>
            <span>Compartilhar</span>
          </button>
        </div>
        
        ${this.createCommentsHTML(post)}
      </div>
    `;
  }

  /**
   * Cria HTML de post de conquista
   */
  createAchievementPostHTML(post, timeAgo) {
    return `
      <div class="feed-post achievement-post" data-post-id="${post.id}">
        <div class="post-header">
          <img src="${post.user.avatar}" alt="${post.user.name}" class="post-avatar">
          <div class="post-user-info">
            <div class="post-username">${post.user.name}</div>
            <div class="post-time">${timeAgo}</div>
          </div>
          <button class="post-menu">
            <i class="fas fa-ellipsis-h"></i>
          </button>
        </div>
        
        <div class="post-content">
          <div class="achievement-badge-large">
            <i class="${post.achievement.icon}"></i>
          </div>
          <h3 class="achievement-title">${post.achievement.title}</h3>
          <p class="achievement-description">${post.achievement.description}</p>
          <p class="post-text">${post.content}</p>
        </div>
        
        <div class="post-actions">
          <button class="post-action ${post.isLiked ? 'liked' : ''}" data-action="like">
            <i class="fas fa-heart"></i>
            <span>${post.likes}</span>
          </button>
          <button class="post-action" data-action="comment">
            <i class="fas fa-comment"></i>
            <span>${post.comments}</span>
          </button>
          <button class="post-action" data-action="share">
            <i class="fas fa-share"></i>
            <span>Compartilhar</span>
          </button>
        </div>
        
        ${this.createCommentsHTML(post)}
      </div>
    `;
  }

  /**
   * Cria HTML de atividade
   */
  createActivityHTML(activity) {
    const activityIcons = {
      running: 'fa-running',
      cycling: 'fa-bicycle',
      yoga: 'fa-leaf',
      swimming: 'fa-swimmer'
    };

    const stats = [];
    if (activity.distance) stats.push({ label: 'Distância', value: `${activity.distance} km` });
    if (activity.duration) stats.push({ label: 'Tempo', value: activity.duration });
    if (activity.pace) stats.push({ label: 'Pace', value: `${activity.pace}/km` });
    if (activity.speed) stats.push({ label: 'Velocidade', value: `${activity.speed} km/h` });
    if (activity.calories) stats.push({ label: 'Calorias', value: activity.calories });
    if (activity.elevation) stats.push({ label: 'Elevação', value: `${activity.elevation}m` });

    return `
      <div class="post-activity">
        <div class="activity-header">
          <div class="activity-icon">
            <i class="fas ${activityIcons[activity.type] || 'fa-dumbbell'}"></i>
          </div>
          <div class="activity-info">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-details">${this.getActivityTypeLabel(activity.type)}</div>
          </div>
        </div>
        
        <div class="activity-stats">
          ${stats.map(stat => `
            <div class="activity-stat">
              <div class="activity-stat-value">${stat.value}</div>
              <div class="activity-stat-label">${stat.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Cria HTML de comentários
   */
  createCommentsHTML(post) {
    // Simula alguns comentários
    const sampleComments = [
      {
        user: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        text: 'Parabéns! Que performance incrível! 👏',
        time: '2h'
      },
      {
        user: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        text: 'Inspirador! Vou tentar fazer o mesmo amanhã 💪',
        time: '1h'
      }
    ];

    return `
      <div class="post-comments">
        ${sampleComments.slice(0, 2).map(comment => `
          <div class="comment">
            <img src="${comment.avatar}" alt="${comment.user}" class="comment-avatar">
            <div class="comment-content">
              <div class="comment-username">${comment.user}</div>
              <div class="comment-text">${comment.text}</div>
              <div class="comment-time">${comment.time}</div>
            </div>
          </div>
        `).join('')}
        
        <div class="comment-input">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Você" class="comment-avatar">
          <input type="text" placeholder="Escreva um comentário...">
          <button type="submit">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Anexa event listeners aos posts
   */
  attachPostEventListeners() {
    // Ações dos posts (curtir, comentar, compartilhar)
    document.querySelectorAll('.post-action').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.dataset.action;
        const postId = parseInt(button.closest('.feed-post').dataset.postId);
        this.handlePostAction(action, postId, button);
      });
    });

    // Envio de comentários
    document.querySelectorAll('.comment-input button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const input = button.previousElementSibling;
        const postId = parseInt(button.closest('.feed-post').dataset.postId);
        this.handleComment(postId, input.value, input);
      });
    });

    // Enter para enviar comentário
    document.querySelectorAll('.comment-input input').forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const postId = parseInt(input.closest('.feed-post').dataset.postId);
          this.handleComment(postId, input.value, input);
        }
      });
    });
  }

  /**
   * Manipula ações dos posts
   */
  handlePostAction(action, postId, button) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    switch (action) {
      case 'like':
        this.toggleLike(post, button);
        break;
      case 'comment':
        // Foca no input de comentário
        const commentInput = button.closest('.feed-post').querySelector('.comment-input input');
        commentInput.focus();
        break;
      case 'share':
        this.sharePost(post);
        break;
    }
  }

  /**
   * Toggle curtida
   */
  toggleLike(post, button) {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;

    // Atualiza UI
    button.classList.toggle('liked');
    button.querySelector('span').textContent = post.likes;

    // Animação de curtida
    const icon = button.querySelector('i');
    icon.classList.add('like-animation');
    setTimeout(() => {
      icon.classList.remove('like-animation');
    }, 600);

    // Notificação
    if (window.animationsManager && post.isLiked) {
      window.animationsManager.animateNotification('Post curtido! ❤️', 'success');
    }
  }

  /**
   * Manipula comentários
   */
  handleComment(postId, text, input) {
    if (!text.trim()) return;

    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    // Incrementa contador de comentários
    post.comments++;

    // Atualiza UI
    const commentButton = input.closest('.feed-post').querySelector('[data-action="comment"] span');
    commentButton.textContent = post.comments;

    // Limpa input
    input.value = '';

    // Simula adição do comentário
    const commentsContainer = input.closest('.post-comments');
    const newComment = document.createElement('div');
    newComment.className = 'comment comment-appear';
    newComment.innerHTML = `
      <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Você" class="comment-avatar">
      <div class="comment-content">
        <div class="comment-username">Você</div>
        <div class="comment-text">${text}</div>
        <div class="comment-time">agora</div>
      </div>
    `;

    commentsContainer.insertBefore(newComment, input.closest('.comment-input'));

    if (window.animationsManager) {
      window.animationsManager.animateNotification('Comentário adicionado!', 'success');
    }
  }

  /**
   * Compartilha post
   */
  sharePost(post) {
    if (navigator.share) {
      navigator.share({
        title: `${post.user.name} - FUSEtech`,
        text: post.content,
        url: window.location.href
      });
    } else {
      // Fallback para navegadores sem suporte
      navigator.clipboard.writeText(window.location.href);
      if (window.animationsManager) {
        window.animationsManager.animateNotification('Link copiado para a área de transferência!', 'info');
      }
    }
  }

  /**
   * Renderiza grupos
   */
  renderGroups() {
    const container = document.getElementById('my-groups');
    if (!container) return;

    container.innerHTML = this.groups.map(group => `
      <div class="group-item" data-group-id="${group.id}">
        <div class="group-avatar">${group.avatar}</div>
        <div class="group-info">
          <div class="group-name">${group.name}</div>
          <div class="group-members">${group.members.toLocaleString()} membros</div>
        </div>
        ${group.hasNotification ? '<div class="group-notification"></div>' : ''}
      </div>
    `).join('');
  }

  /**
   * Renderiza sugestões de amigos
   */
  renderSuggestedFriends() {
    const container = document.getElementById('suggested-friends');
    if (!container) return;

    container.innerHTML = this.suggestedFriends.map(friend => `
      <div class="friend-suggestion" data-friend-id="${friend.id}">
        <img src="${friend.avatar}" alt="${friend.name}" class="friend-avatar">
        <div class="friend-info">
          <div class="friend-name">${friend.name}</div>
          <div class="friend-mutual">${friend.mutualFriends} amigos em comum</div>
        </div>
        <div class="friend-actions">
          <button class="btn-follow" onclick="window.socialController.followUser(${friend.id})">
            Seguir
          </button>
          <button class="btn-dismiss" onclick="window.socialController.dismissSuggestion(${friend.id})">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Segue um usuário
   */
  followUser(friendId) {
    const friend = this.suggestedFriends.find(f => f.id === friendId);
    if (!friend) return;

    // Remove da lista de sugestões
    this.suggestedFriends = this.suggestedFriends.filter(f => f.id !== friendId);
    this.renderSuggestedFriends();

    if (window.animationsManager) {
      window.animationsManager.animateNotification(`Agora você segue ${friend.name}!`, 'success');
    }
  }

  /**
   * Dispensa sugestão de amigo
   */
  dismissSuggestion(friendId) {
    this.suggestedFriends = this.suggestedFriends.filter(f => f.id !== friendId);
    this.renderSuggestedFriends();
  }

  /**
   * Carrega mais posts
   */
  loadMorePosts() {
    // Simula carregamento de mais posts
    const loadButton = document.getElementById('load-more-posts');
    loadButton.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i>Carregando...';
    loadButton.disabled = true;

    setTimeout(() => {
      // Simula novos posts
      const newPosts = [
        {
          id: this.posts.length + 1,
          user: {
            name: 'Fernanda Lima',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
            username: 'fernanda_swim'
          },
          type: 'activity',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          content: 'Natação é vida! 🏊‍♀️ Que treino incrível hoje na piscina.',
          activity: {
            type: 'swimming',
            title: 'Treino de Natação',
            distance: 2.5,
            duration: '45:00',
            calories: 380
          },
          likes: 18,
          comments: 3,
          isLiked: false
        }
      ];

      this.posts.push(...newPosts);
      this.renderPosts();

      loadButton.innerHTML = 'Carregar Mais Posts';
      loadButton.disabled = false;
    }, 1500);
  }

  /**
   * Busca usuários
   */
  handleUserSearch(query) {
    if (query.length < 2) return;

    // Simula busca de usuários
    console.log('Buscando usuários:', query);
    // Implementar dropdown de resultados
  }

  /**
   * Mostra modal de criar post
   */
  showCreatePostModal() {
    console.log('Mostrar modal de criar post');
    // Implementar modal
  }

  /**
   * Mostra modal de criar grupo
   */
  showCreateGroupModal() {
    console.log('Mostrar modal de criar grupo');
    // Implementar modal
  }

  /**
   * Mostra modal de encontrar amigos
   */
  showFindFriendsModal() {
    console.log('Mostrar modal de encontrar amigos');
    // Implementar modal
  }

  /**
   * Inicia atualizações em tempo real
   */
  startRealTimeUpdates() {
    // Simula atualizações em tempo real
    setInterval(() => {
      // Simula novos posts ocasionalmente
      if (Math.random() > 0.9) {
        this.simulateNewPost();
      }
    }, 30000);
  }

  /**
   * Simula novo post
   */
  simulateNewPost() {
    const newPost = {
      id: this.posts.length + 1,
      user: {
        name: 'Usuário Ativo',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        username: 'usuario_ativo'
      },
      type: 'activity',
      timestamp: new Date(),
      content: 'Acabei de completar um treino incrível! 💪',
      activity: {
        type: 'running',
        title: 'Corrida Rápida',
        distance: 5.0,
        duration: '25:00',
        pace: '5:00',
        calories: 300
      },
      likes: 0,
      comments: 0,
      isLiked: false
    };

    this.posts.unshift(newPost);
    this.renderPosts();

    if (window.animationsManager) {
      window.animationsManager.animateNotification('Novo post no feed!', 'info');
    }
  }

  /**
   * Utilitários
   */
  getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}min`;
    return 'agora';
  }

  getActivityTypeLabel(type) {
    const labels = {
      running: 'Corrida',
      cycling: 'Ciclismo',
      yoga: 'Yoga',
      swimming: 'Natação'
    };
    return labels[type] || 'Atividade';
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.socialController = new SocialController();
});

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialController;
}
