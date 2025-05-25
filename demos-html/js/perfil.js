// Funcionalidades específicas para a página de perfil

// Configurar modal de configurações
function setupSettingsModal() {
  // Criar o modal de configurações se ainda não existir
  if (!document.getElementById('settings-modal')) {
    const modalHTML = `
      <div id="settings-modal" class="fixed inset-0 overflow-y-auto hidden z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Configurações da Conta
                  </h3>
                  <div class="mt-4">
                    <!-- Formulário de configurações -->
                    <form id="settings-form">
                      <!-- Seção de Perfil -->
                      <div class="mb-6">
                        <h4 class="text-sm font-medium text-gray-900 mb-3">Perfil</h4>
                        <div class="space-y-4">
                          <div>
                            <label for="settings-name" class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input type="text" id="settings-name" name="name" value="João Silva" class="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                          </div>
                          <div>
                            <label for="settings-username" class="block text-sm font-medium text-gray-700 mb-1">Nome de usuário</label>
                            <div class="mt-1 flex rounded-md shadow-sm">
                              <span class="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                @
                              </span>
                              <input type="text" id="settings-username" name="username" value="joaosilva" class="focus:ring-primary focus:border-primary flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300">
                            </div>
                          </div>
                          <div>
                            <label for="settings-bio" class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea id="settings-bio" name="bio" rows="3" class="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">Corredor amador e entusiasta de fitness. Buscando melhorar minha saúde e compartilhar minha jornada com outros.</textarea>
                          </div>
                          <div>
                            <label for="settings-location" class="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                            <input type="text" id="settings-location" name="location" value="São Paulo, Brasil" class="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                          </div>
                        </div>
                      </div>

                      <!-- Seção de Privacidade -->
                      <div class="mb-6">
                        <h4 class="text-sm font-medium text-gray-900 mb-3">Privacidade</h4>
                        <div class="space-y-4">
                          <div class="flex items-center">
                            <input id="settings-public-profile" name="public_profile" type="checkbox" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                            <label for="settings-public-profile" class="ml-2 block text-sm text-gray-700">
                              Perfil público
                            </label>
                          </div>
                          <div class="flex items-center">
                            <input id="settings-show-activity" name="show_activity" type="checkbox" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                            <label for="settings-show-activity" class="ml-2 block text-sm text-gray-700">
                              Mostrar atividades para todos
                            </label>
                          </div>
                          <div class="flex items-center">
                            <input id="settings-show-location" name="show_location" type="checkbox" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                            <label for="settings-show-location" class="ml-2 block text-sm text-gray-700">
                              Mostrar localização nas atividades
                            </label>
                          </div>
                        </div>
                      </div>

                      <!-- Seção de Notificações -->
                      <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-3">Notificações</h4>
                        <div class="space-y-4">
                          <div class="flex items-center">
                            <input id="settings-email-notifications" name="email_notifications" type="checkbox" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                            <label for="settings-email-notifications" class="ml-2 block text-sm text-gray-700">
                              Receber notificações por e-mail
                            </label>
                          </div>
                          <div class="flex items-center">
                            <input id="settings-push-notifications" name="push_notifications" type="checkbox" checked class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                            <label for="settings-push-notifications" class="ml-2 block text-sm text-gray-700">
                              Receber notificações push
                            </label>
                          </div>
                          <div class="flex items-center">
                            <input id="settings-activity-reminders" name="activity_reminders" type="checkbox" class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                            <label for="settings-activity-reminders" class="ml-2 block text-sm text-gray-700">
                              Lembretes de atividade
                            </label>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" id="save-settings-btn" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Salvar alterações
              </button>
              <button type="button" id="close-settings-btn" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Adicionar o modal ao DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Configurar eventos do modal
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Fechar modal
    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.classList.add('hidden');
    });

    // Clicar fora para fechar
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
      }
    });

    // Salvar configurações
    saveSettingsBtn.addEventListener('click', () => {
      // Em um ambiente real, isso enviaria os dados para o servidor
      // Para fins de demonstração, apenas mostraremos uma mensagem

      // Mostrar notificação de sucesso
      if (window.animationsManager) {
        window.animationsManager.animateNotification('Configurações salvas com sucesso!', 'success');
      } else {
        alert('Configurações salvas com sucesso!');
      }

      // Fechar modal
      settingsModal.classList.add('hidden');

      // Atualizar informações do perfil com os novos valores
      updateProfileInfo();
    });
  }
}

// Atualizar informações do perfil com base nas configurações
function updateProfileInfo() {
  const nameInput = document.getElementById('settings-name');
  const bioInput = document.getElementById('settings-bio');
  const locationInput = document.getElementById('settings-location');

  if (nameInput && bioInput && locationInput) {
    // Atualizar nome
    const profileName = document.querySelector('.profile-header h1');
    if (profileName) {
      profileName.textContent = nameInput.value;
    }

    // Atualizar bio
    const profileBio = document.querySelector('.profile-header p.mt-3');
    if (profileBio) {
      profileBio.textContent = bioInput.value;
    }

    // Atualizar localização
    const profileLocation = document.querySelector('.profile-header p.text-sm.text-gray-500');
    if (profileLocation) {
      const username = profileLocation.textContent.split(' • ')[0];
      profileLocation.textContent = `${username} • ${locationInput.value}`;
    }
  }
}

// Configurar botão de editar perfil
function setupEditProfileButton() {
  const editProfileBtn = document.querySelector('button:has(i.fas.fa-edit)');

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      alert('Funcionalidade de edição de perfil será implementada em breve!');
    });
  }
}

// Configurar botão de configurações
function setupSettingsButton() {
  // Selecionar o botão pelo ID
  const settingsBtn = document.getElementById('settings-button');

  if (settingsBtn) {
    console.log('Botão de configurações encontrado pelo ID');

    // Remover qualquer listener existente para evitar duplicação
    settingsBtn.removeEventListener('click', openSettingsModal);

    // Adicionar o listener
    settingsBtn.addEventListener('click', openSettingsModal);
  } else {
    // Tentar selecionar pelo seletor alternativo
    const altSettingsBtn = document.querySelector('button:has(.fa-cog)');
    if (altSettingsBtn) {
      console.log('Botão de configurações encontrado pelo seletor alternativo');

      // Adicionar ID para referência futura
      altSettingsBtn.id = 'settings-button';

      // Adicionar o listener
      altSettingsBtn.addEventListener('click', openSettingsModal);
    } else {
      console.error('Botão de configurações não encontrado por nenhum método');
    }
  }
}

// Função para abrir o modal de configurações
function openSettingsModal() {
  console.log('Função openSettingsModal chamada');
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.classList.remove('hidden');
  } else {
    console.error('Modal de configurações não encontrado');
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  console.log('Script de perfil carregado');

  // Verificar se estamos na página de perfil
  if (document.body.getAttribute('data-page') === 'profile') {
    console.log('Página de perfil detectada');

    // Configurar modal de configurações
    setupSettingsModal();

    // Configurar botões
    setupEditProfileButton();
    setupSettingsButton();

    // Adicionar listener direto para garantir
    setTimeout(function() {
      const settingsButton = document.getElementById('settings-button');
      if (settingsButton) {
        console.log('Botão de configurações encontrado após timeout, adicionando listener direto');
        settingsButton.addEventListener('click', openSettingsModal);
      } else {
        console.error('Botão de configurações não encontrado após timeout');

        // Último recurso: adicionar listener a todos os botões com ícone de engrenagem
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(button => {
          if (button.innerHTML.includes('fa-cog')) {
            console.log('Encontrado botão com ícone de engrenagem, adicionando listener');
            button.addEventListener('click', openSettingsModal);
          }
        });
      }
    }, 500); // Pequeno delay para garantir que o DOM esteja completamente carregado
  }
});
