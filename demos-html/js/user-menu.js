// Funcionalidades para o menu do usuário

// Configurar o menu dropdown do usuário
function setupUserMenu() {
  const userMenuButton = document.getElementById('user-menu-button');

  if (!userMenuButton) {
    console.warn('Botão do menu do usuário não encontrado');
    return;
  }

  // Criar o menu dropdown se ainda não existir
  let userMenuDropdown = document.getElementById('user-menu-dropdown');

  if (!userMenuDropdown) {
    // Criar o menu dropdown
    const dropdownHTML = `
      <div id="user-menu-dropdown" class="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabindex="-1">
        <a href="perfil.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Seu Perfil</a>
        <a href="#" id="user-settings-link" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Configurações</a>
        <a href="#" id="user-logout-link" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Sair</a>
      </div>
    `;

    // Adicionar o menu ao DOM
    const userMenuContainer = userMenuButton.closest('.relative');
    if (userMenuContainer) {
      userMenuContainer.insertAdjacentHTML('beforeend', dropdownHTML);
      userMenuDropdown = document.getElementById('user-menu-dropdown');
    }
  }

  // Adicionar atributos ARIA para acessibilidade
  userMenuButton.setAttribute('aria-haspopup', 'true');
  userMenuButton.setAttribute('aria-expanded', 'false');
  userMenuButton.setAttribute('aria-label', 'Menu do usuário');

  // Configurar o evento de clique no botão do menu
  userMenuButton.addEventListener('click', function(event) {
    event.stopPropagation(); // Impedir propagação para não fechar imediatamente
    const isHidden = userMenuDropdown.classList.toggle('hidden');

    // Atualizar atributo ARIA
    userMenuButton.setAttribute('aria-expanded', isHidden ? 'false' : 'true');

    // Focar no primeiro item do menu para acessibilidade
    if (!isHidden) {
      const firstMenuItem = userMenuDropdown.querySelector('a');
      if (firstMenuItem) {
        setTimeout(() => {
          firstMenuItem.focus();
        }, 100);
      }
    }
  });

  // Adicionar navegação por teclado
  userMenuButton.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      userMenuButton.click();
    } else if (event.key === 'Escape' && !userMenuDropdown.classList.contains('hidden')) {
      userMenuDropdown.classList.add('hidden');
      userMenuButton.setAttribute('aria-expanded', 'false');
      userMenuButton.focus();
    }
  });

  // Adicionar navegação por teclado dentro do dropdown
  userMenuDropdown.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      userMenuDropdown.classList.add('hidden');
      userMenuButton.setAttribute('aria-expanded', 'false');
      userMenuButton.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusNextMenuItem(event.target);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusPreviousMenuItem(event.target);
    }
  });

  // Função para focar no próximo item do menu
  function focusNextMenuItem(currentItem) {
    const menuItems = Array.from(userMenuDropdown.querySelectorAll('a[role="menuitem"]'));
    const currentIndex = menuItems.indexOf(currentItem);
    const nextIndex = (currentIndex + 1) % menuItems.length;
    menuItems[nextIndex].focus();
  }

  // Função para focar no item anterior do menu
  function focusPreviousMenuItem(currentItem) {
    const menuItems = Array.from(userMenuDropdown.querySelectorAll('a[role="menuitem"]'));
    const currentIndex = menuItems.indexOf(currentItem);
    const previousIndex = (currentIndex - 1 + menuItems.length) % menuItems.length;
    menuItems[previousIndex].focus();
  }

  // Fechar o menu ao clicar fora dele
  document.addEventListener('click', function(event) {
    if (userMenuDropdown && !userMenuDropdown.classList.contains('hidden') &&
        !userMenuDropdown.contains(event.target) && event.target !== userMenuButton) {
      userMenuDropdown.classList.add('hidden');
      userMenuButton.setAttribute('aria-expanded', 'false');
    }
  });

  // Configurar o link de configurações no menu
  const userSettingsLink = document.getElementById('user-settings-link');
  if (userSettingsLink) {
    userSettingsLink.addEventListener('click', function(event) {
      event.preventDefault();

      // Fechar o dropdown
      userMenuDropdown.classList.add('hidden');
      userMenuButton.setAttribute('aria-expanded', 'false');

      // Abrir o modal de configurações se estivermos na página de perfil
      if (document.body.getAttribute('data-page') === 'profile') {
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
          settingsModal.classList.remove('hidden');
          // Mostrar feedback
          if (typeof showToast === 'function') {
            showToast('Configurações abertas', 'info');
          }
        }
      } else {
        // Mostrar feedback
        if (typeof showToast === 'function') {
          showToast('Redirecionando para configurações', 'info');
        }
        // Redirecionar para a página de perfil com parâmetro para abrir configurações
        setTimeout(() => {
          window.location.href = 'perfil.html?settings=open';
        }, 500);
      }
    });
  }

  // Configurar o link de logout
  const userLogoutLink = document.getElementById('user-logout-link');
  if (userLogoutLink) {
    userLogoutLink.addEventListener('click', function(event) {
      event.preventDefault();

      // Em um ambiente real, isso chamaria a função de logout
      // Para fins de demonstração, removemos dados do localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Fechar o dropdown
      userMenuDropdown.classList.add('hidden');
      userMenuButton.setAttribute('aria-expanded', 'false');

      // Mostrar feedback
      if (typeof showToast === 'function') {
        showToast('Logout realizado com sucesso!', 'success');
      } else {
        alert('Logout realizado com sucesso!');
      }

      // Redirecionar para a página de login após um breve delay
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    });
  }
}

// Verificar se há parâmetros na URL para abrir configurações
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('settings') === 'open') {
    // Abrir o modal de configurações
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) {
      settingsModal.classList.remove('hidden');
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Configurar o menu do usuário
  setupUserMenu();

  // Verificar parâmetros da URL
  checkUrlParams();
});
