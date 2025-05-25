/**
 * FUSEtech Marketplace Controller
 * Gerencia funcionalidades do marketplace
 */

class MarketplaceController {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.cart = JSON.parse(localStorage.getItem('fusetech_cart')) || [];
    this.currentPage = 1;
    this.productsPerPage = 12;
    this.currentCategory = 'all';
    this.currentSort = 'featured';
    this.searchQuery = '';

    this.init();
  }

  init() {
    this.loadProducts();
    this.setupEventListeners();
    this.updateCartUI();
    this.setupCart();
  }

  /**
   * Carrega produtos (simulação de API)
   */
  async loadProducts() {
    // Simula carregamento da API
    this.showLoading();

    // Dados simulados de produtos
    this.products = [
      {
        id: 1,
        title: 'Whey Protein Isolado 1kg',
        brand: 'Growth Supplements',
        description: 'Proteína isolada de alta qualidade para ganho de massa muscular',
        price: 450,
        originalPrice: 500,
        category: 'supplements',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        rating: 4.8,
        reviewCount: 234,
        stock: 15,
        badge: 'popular',
        featured: true
      },
      {
        id: 2,
        title: 'Tênis de Corrida Air Zoom',
        brand: 'Nike',
        description: 'Tênis profissional para corrida com tecnologia de amortecimento',
        price: 1200,
        originalPrice: null,
        category: 'equipment',
        image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
        rating: 4.9,
        reviewCount: 156,
        stock: 8,
        badge: 'limited',
        featured: true
      },
      {
        id: 3,
        title: 'Plano Academia Smart Fit - 1 Mês',
        brand: 'Smart Fit',
        description: 'Acesso completo a todas as unidades Smart Fit por 30 dias',
        price: 800,
        originalPrice: 900,
        category: 'gym',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
        rating: 4.7,
        reviewCount: 89,
        stock: 50,
        badge: null,
        featured: true
      },
      {
        id: 4,
        title: 'Camiseta Dri-FIT Training',
        brand: 'Nike',
        description: 'Camiseta esportiva com tecnologia de secagem rápida',
        price: 180,
        originalPrice: 220,
        category: 'apparel',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        rating: 4.6,
        reviewCount: 67,
        stock: 25,
        badge: 'new',
        featured: false
      },
      {
        id: 5,
        title: 'Creatina Monohidratada 300g',
        brand: 'Optimum Nutrition',
        description: 'Creatina pura para aumento de força e resistência',
        price: 320,
        originalPrice: null,
        category: 'supplements',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        rating: 4.9,
        reviewCount: 312,
        stock: 30,
        badge: null,
        featured: false
      },
      {
        id: 6,
        title: 'Halteres Ajustáveis 20kg',
        brand: 'Domyos',
        description: 'Par de halteres com peso ajustável de 5kg a 20kg cada',
        price: 2500,
        originalPrice: 2800,
        category: 'equipment',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        rating: 4.5,
        reviewCount: 45,
        stock: 5,
        badge: 'limited',
        featured: false
      },
      {
        id: 7,
        title: 'Shorts de Treino Performance',
        brand: 'Under Armour',
        description: 'Shorts esportivo com tecnologia anti-odor',
        price: 250,
        originalPrice: null,
        category: 'apparel',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        rating: 4.4,
        reviewCount: 23,
        stock: 18,
        badge: null,
        featured: false
      },
      {
        id: 8,
        title: 'Barra de Proteína Chocolate',
        brand: 'Quest Nutrition',
        description: 'Barra proteica com 20g de proteína e baixo carboidrato',
        price: 45,
        originalPrice: 50,
        category: 'nutrition',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
        rating: 4.3,
        reviewCount: 156,
        stock: 100,
        badge: null,
        featured: false
      }
    ];

    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.filteredProducts = [...this.products];
    this.renderFeaturedProducts();
    this.renderProducts();
    this.updateProductsCount();
    this.hideLoading();
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Filtros de categoria
    document.querySelectorAll('.category-filter').forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleCategoryFilter(e.target.dataset.category);
      });
    });

    // Busca
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Ordenação
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.handleSort(e.target.value);
      });
    }

    // Visualização
    document.getElementById('grid-view')?.addEventListener('click', () => {
      this.setViewMode('grid');
    });

    document.getElementById('list-view')?.addEventListener('click', () => {
      this.setViewMode('list');
    });

    // Carregar mais
    document.getElementById('load-more')?.addEventListener('click', () => {
      this.loadMoreProducts();
    });
  }

  /**
   * Filtra produtos por categoria
   */
  handleCategoryFilter(category) {
    this.currentCategory = category;
    this.currentPage = 1;

    // Atualiza UI dos filtros
    document.querySelectorAll('.category-filter').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('btn-outline');
      btn.classList.remove('btn-primary');
    });

    const activeButton = document.querySelector(`[data-category="${category}"]`);
    activeButton.classList.add('active');
    activeButton.classList.remove('btn-outline');
    activeButton.classList.add('btn-primary');

    this.filterProducts();
  }

  /**
   * Busca produtos
   */
  handleSearch(query) {
    this.searchQuery = query.toLowerCase();
    this.currentPage = 1;
    this.filterProducts();
  }

  /**
   * Ordena produtos
   */
  handleSort(sortBy) {
    this.currentSort = sortBy;
    this.sortProducts();
    this.renderProducts();
  }

  /**
   * Filtra produtos baseado nos critérios atuais
   */
  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = this.currentCategory === 'all' || product.category === this.currentCategory;
      const matchesSearch = this.searchQuery === '' ||
        product.title.toLowerCase().includes(this.searchQuery) ||
        product.brand.toLowerCase().includes(this.searchQuery) ||
        product.description.toLowerCase().includes(this.searchQuery);

      return matchesCategory && matchesSearch;
    });

    this.sortProducts();
    this.renderProducts();
    this.updateProductsCount();
  }

  /**
   * Ordena produtos
   */
  sortProducts() {
    switch (this.currentSort) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => b.id - a.id);
        break;
      case 'popular':
        this.filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'featured':
      default:
        this.filteredProducts.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });
        break;
    }
  }

  /**
   * Renderiza produtos em destaque
   */
  renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const featuredProducts = this.products.filter(p => p.featured).slice(0, 4);

    container.innerHTML = featuredProducts.map(product =>
      this.createProductCard(product, true)
    ).join('');

    this.attachProductEventListeners();
  }

  /**
   * Renderiza produtos
   */
  renderProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;

    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    const productsToShow = this.filteredProducts.slice(0, endIndex);

    if (this.currentPage === 1) {
      container.innerHTML = '';
    }

    const newProductsHTML = this.filteredProducts
      .slice(startIndex, endIndex)
      .map(product => this.createProductCard(product))
      .join('');

    container.insertAdjacentHTML('beforeend', newProductsHTML);

    // Mostra/esconde botão "Carregar Mais"
    const loadMoreBtn = document.getElementById('load-more');
    if (loadMoreBtn) {
      if (endIndex < this.filteredProducts.length) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }

    this.attachProductEventListeners();
  }

  /**
   * Cria HTML de um card de produto
   */
  createProductCard(product, isFeatured = false) {
    const stockClass = product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock';
    const stockText = product.stock > 10 ? 'Em estoque' : product.stock > 0 ? `Apenas ${product.stock} restantes` : 'Fora de estoque';

    return `
      <div class="product-card animate-fade-in" data-product-id="${product.id}">
        <div class="product-card-image">
          <img src="${product.image}" alt="${product.title}" loading="lazy">
          ${product.badge ? `<div class="product-badge ${product.badge}">${this.getBadgeText(product.badge)}</div>` : ''}
          <button class="product-favorite" data-product-id="${product.id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
        <div class="product-card-content">
          <div class="product-brand">${product.brand}</div>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.description}</p>

          <div class="product-rating">
            <div class="product-stars">
              ${this.renderStars(product.rating)}
            </div>
            <span class="product-rating-count">(${product.reviewCount})</span>
          </div>

          <div class="product-price">
            <div class="product-price-tokens">
              <span class="product-price-value">${product.price.toLocaleString()}</span>
              <span class="product-price-currency">FUSE</span>
            </div>
            ${product.originalPrice ? `<span class="product-price-original">${product.originalPrice.toLocaleString()} FUSE</span>` : ''}
          </div>

          <div class="product-stock ${stockClass}">
            ${stockText}
          </div>

          <div class="product-actions">
            <button class="btn-add-to-cart" data-product-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
              <i class="fas fa-shopping-cart"></i>
              ${product.stock === 0 ? 'Indisponível' : 'Adicionar'}
            </button>
            <button class="btn-quick-view" data-product-id="${product.id}">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Retorna texto do badge
   */
  getBadgeText(badge) {
    const badges = {
      'new': 'Novo',
      'popular': 'Popular',
      'limited': 'Limitado'
    };
    return badges[badge] || badge;
  }

  /**
   * Renderiza estrelas de avaliação
   */
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Estrelas cheias
    for (let i = 0; i < fullStars; i++) {
      starsHTML += '<i class="fas fa-star"></i>';
    }

    // Meia estrela
    if (hasHalfStar) {
      starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }

    // Estrelas vazias
    for (let i = 0; i < emptyStars; i++) {
      starsHTML += '<i class="far fa-star"></i>';
    }

    return starsHTML;
  }

  /**
   * Anexa event listeners aos produtos
   */
  attachProductEventListeners() {
    // Adicionar ao carrinho
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(btn.dataset.productId);
        this.addToCart(productId);
      });
    });

    // Favoritar
    document.querySelectorAll('.product-favorite').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.toggle('active');
        const icon = btn.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
      });
    });

    // Visualização rápida
    document.querySelectorAll('.btn-quick-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = parseInt(btn.dataset.productId);
        this.showQuickView(productId);
      });
    });
  }

  /**
   * Adiciona produto ao carrinho
   */
  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existingItem = this.cart.find(item => item.id === productId);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
      } else {
        if (window.animationsManager) {
          window.animationsManager.animateNotification('Quantidade máxima atingida!', 'warning');
        }
        return;
      }
    } else {
      this.cart.push({
        id: productId,
        quantity: 1,
        ...product
      });
    }

    this.saveCart();
    this.updateCartUI();

    if (window.animationsManager) {
      window.animationsManager.animateNotification(`${product.title} adicionado ao carrinho!`, 'success');
    }
  }

  /**
   * Salva carrinho no localStorage
   */
  saveCart() {
    localStorage.setItem('fusetech_cart', JSON.stringify(this.cart));
  }

  /**
   * Atualiza UI do carrinho
   */
  updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

  /**
   * Configura carrinho lateral
   */
  setupCart() {
    const cartButton = document.getElementById('cart-button');
    if (cartButton) {
      cartButton.addEventListener('click', () => {
        this.showCart();
      });
    }
  }

  /**
   * Mostra carrinho lateral
   */
  showCart() {
    this.createCartSidebar();
    this.renderCartItems();

    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');

    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
  }

  /**
   * Cria estrutura do carrinho lateral
   */
  createCartSidebar() {
    // Remove carrinho existente se houver
    const existingCart = document.getElementById('cart-sidebar');
    const existingOverlay = document.getElementById('cart-overlay');

    if (existingCart) existingCart.remove();
    if (existingOverlay) existingOverlay.remove();

    // Cria overlay
    const overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.className = 'cart-overlay';
    overlay.addEventListener('click', () => this.hideCart());
    document.body.appendChild(overlay);

    // Cria sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'cart-sidebar';
    sidebar.className = 'cart-sidebar';

    sidebar.innerHTML = `
      <div class="cart-header">
        <h3 class="cart-title">Meu Carrinho</h3>
        <button class="cart-close" onclick="window.marketplaceController.hideCart()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="cart-content" id="cart-items">
        <!-- Items serão renderizados aqui -->
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>Total:</span>
          <span class="cart-total-tokens" id="cart-total">0 FUSE</span>
        </div>
        <button class="cart-checkout" id="cart-checkout" onclick="window.marketplaceController.checkout()">
          <i class="fas fa-credit-card mr-2"></i>
          Finalizar Compra
        </button>
      </div>
    `;

    document.body.appendChild(sidebar);
  }

  /**
   * Renderiza itens do carrinho
   */
  renderCartItems() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('cart-checkout');

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-cart empty-state-icon"></i>
          <h3 class="empty-state-title">Carrinho Vazio</h3>
          <p class="empty-state-description">Adicione produtos para começar suas compras</p>
          <button class="btn btn-primary" onclick="window.marketplaceController.hideCart()">
            Continuar Comprando
          </button>
        </div>
      `;
      totalElement.textContent = '0 FUSE';
      checkoutButton.disabled = true;
      return;
    }

    container.innerHTML = this.cart.map(item => `
      <div class="cart-item" data-item-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.title}">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-brand">${item.brand}</div>
          <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()} FUSE</div>
          <div class="cart-item-actions">
            <div class="quantity-control">
              <button class="quantity-btn" onclick="window.marketplaceController.updateQuantity(${item.id}, ${item.quantity - 1})">
                <i class="fas fa-minus"></i>
              </button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.stock}"
                     onchange="window.marketplaceController.updateQuantity(${item.id}, this.value)">
              <button class="quantity-btn" onclick="window.marketplaceController.updateQuantity(${item.id}, ${item.quantity + 1})">
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <button class="cart-remove" onclick="window.marketplaceController.removeFromCart(${item.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Atualiza total
    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = `${total.toLocaleString()} FUSE`;
    checkoutButton.disabled = false;
  }

  /**
   * Esconde carrinho lateral
   */
  hideCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');

    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');

    setTimeout(() => {
      if (cartSidebar) cartSidebar.remove();
      if (cartOverlay) cartOverlay.remove();
    }, 300);
  }

  /**
   * Atualiza quantidade de um item
   */
  updateQuantity(productId, newQuantity) {
    const quantity = parseInt(newQuantity);
    const item = this.cart.find(item => item.id === productId);

    if (!item) return;

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    if (quantity > item.stock) {
      if (window.animationsManager) {
        window.animationsManager.animateNotification('Quantidade não disponível em estoque!', 'warning');
      }
      return;
    }

    item.quantity = quantity;
    this.saveCart();
    this.updateCartUI();
    this.renderCartItems();
  }

  /**
   * Remove item do carrinho
   */
  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
    this.renderCartItems();

    if (window.animationsManager) {
      window.animationsManager.animateNotification('Item removido do carrinho!', 'info');
    }
  }

  /**
   * Finaliza compra
   */
  checkout() {
    if (this.cart.length === 0) return;

    const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const userTokens = 1247; // Simula tokens do usuário

    if (total > userTokens) {
      if (window.animationsManager) {
        window.animationsManager.animateNotification('Tokens insuficientes para esta compra!', 'error');
      }
      return;
    }

    this.showCheckoutModal(total);
  }

  /**
   * Mostra modal de checkout
   */
  showCheckoutModal(total) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div class="text-center mb-6">
          <i class="fas fa-credit-card text-4xl text-primary mb-4"></i>
          <h3 class="text-xl font-bold mb-2">Confirmar Compra</h3>
          <p class="text-gray-600">Você está prestes a gastar <strong>${total.toLocaleString()} FUSE</strong></p>
        </div>

        <div class="space-y-4 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">Resumo da Compra:</h4>
            ${this.cart.map(item => `
              <div class="flex justify-between text-sm">
                <span>${item.quantity}x ${item.title}</span>
                <span>${(item.price * item.quantity).toLocaleString()} FUSE</span>
              </div>
            `).join('')}
            <div class="border-t pt-2 mt-2 font-semibold">
              <div class="flex justify-between">
                <span>Total:</span>
                <span>${total.toLocaleString()} FUSE</span>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg">
            <div class="flex justify-between text-sm">
              <span>Saldo Atual:</span>
              <span class="font-semibold">1,247 FUSE</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Saldo Após Compra:</span>
              <span class="font-semibold">${(1247 - total).toLocaleString()} FUSE</span>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="btn btn-outline flex-1" onclick="this.parentElement.parentElement.parentElement.remove()">
            Cancelar
          </button>
          <button class="btn btn-primary flex-1" onclick="window.marketplaceController.processPayment(${total}, this.parentElement.parentElement.parentElement)">
            <i class="fas fa-check mr-2"></i>
            Confirmar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  /**
   * Processa pagamento
   */
  processPayment(total, modal) {
    // Simula processamento
    const confirmButton = modal.querySelector('.btn-primary');
    confirmButton.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i>Processando...';
    confirmButton.disabled = true;

    setTimeout(() => {
      // Limpa carrinho
      this.cart = [];
      this.saveCart();
      this.updateCartUI();

      // Fecha modal e carrinho
      modal.remove();
      this.hideCart();

      // Mostra sucesso
      if (window.animationsManager) {
        window.animationsManager.animateNotification('Compra realizada com sucesso! 🎉', 'success');
      }

      // Simula celebração
      setTimeout(() => {
        if (window.animationsManager) {
          const tokenDisplay = document.querySelector('[class*="bg-gradient-primary"]');
          if (tokenDisplay) {
            window.animationsManager.celebrateAchievement(tokenDisplay);
          }
        }
      }, 1000);

    }, 2000);
  }

  /**
   * Mostra visualização rápida do produto
   */
  showQuickView(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    // Implementar modal de visualização rápida
    console.log('Visualização rápida:', product);
  }

  /**
   * Carrega mais produtos
   */
  loadMoreProducts() {
    this.currentPage++;
    this.renderProducts();
  }

  /**
   * Define modo de visualização
   */
  setViewMode(mode) {
    const gridView = document.getElementById('grid-view');
    const listView = document.getElementById('list-view');
    const productsGrid = document.getElementById('products-grid');

    if (mode === 'grid') {
      gridView.classList.remove('btn-outline');
      gridView.classList.add('btn-ghost');
      listView.classList.add('btn-outline');
      listView.classList.remove('btn-ghost');
      productsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    } else {
      listView.classList.remove('btn-outline');
      listView.classList.add('btn-ghost');
      gridView.classList.add('btn-outline');
      gridView.classList.remove('btn-ghost');
      productsGrid.className = 'grid grid-cols-1 gap-6';
    }
  }

  /**
   * Atualiza contador de produtos
   */
  updateProductsCount() {
    const counter = document.getElementById('products-count');
    if (counter) {
      counter.textContent = `${this.filteredProducts.length} produtos encontrados`;
    }
  }

  /**
   * Mostra estado de carregamento
   */
  showLoading() {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      loadingState.style.display = 'block';
    }
  }

  /**
   * Esconde estado de carregamento
   */
  hideLoading() {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      loadingState.style.display = 'none';
    }
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.marketplaceController = new MarketplaceController();
});

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarketplaceController;
}
