// Funcionalidades para a página de atividades

// Gerenciamento do modal de nova atividade
function setupNovaAtividadeModal() {
  const novaAtividadeBtn = document.getElementById('nova-atividade-btn');
  const modal = document.getElementById('nova-atividade-modal');
  const cancelarBtn = document.getElementById('cancelar-atividade-btn');
  const salvarBtn = document.getElementById('salvar-atividade-btn');
  const form = document.getElementById('nova-atividade-form');

  if (!novaAtividadeBtn || !modal || !cancelarBtn || !salvarBtn || !form) {
    console.warn('Elementos do modal de nova atividade não encontrados');
    return;
  }

  // Abrir modal
  novaAtividadeBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden'); // Impedir rolagem do body
  });

  // Fechar modal
  cancelarBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    form.reset();
  });

  // Salvar atividade
  salvarBtn.addEventListener('click', () => {
    // Aqui seria implementada a lógica para salvar a atividade
    // Por enquanto, apenas fechamos o modal e mostramos uma mensagem

    const tipoAtividade = document.getElementById('tipo-atividade').value;
    const nomeAtividade = document.getElementById('nome-atividade').value;

    if (!nomeAtividade) {
      alert('Por favor, informe um nome para a atividade.');
      return;
    }

    console.log('Atividade salva:', {
      tipo: tipoAtividade,
      nome: nomeAtividade,
      data: document.getElementById('data-atividade').value,
      hora: document.getElementById('hora-atividade').value,
      duracao: document.getElementById('duracao-atividade').value,
      distancia: document.getElementById('distancia-atividade').value,
      calorias: document.getElementById('calorias-atividade').value,
      fc: document.getElementById('fc-atividade').value,
      notas: document.getElementById('notas-atividade').value
    });

    // Adicionar a nova atividade à lista (simulação)
    adicionarAtividadeNaLista({
      tipo: tipoAtividade,
      nome: nomeAtividade,
      data: new Date().toLocaleString(),
      distancia: document.getElementById('distancia-atividade').value || '0',
      duracao: document.getElementById('duracao-atividade').value || '0',
      calorias: document.getElementById('calorias-atividade').value || '0',
      fc: document.getElementById('fc-atividade').value || '0'
    });

    // Fechar o modal
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    form.reset();

    // Mostrar mensagem de sucesso
    mostrarNotificacao('Atividade adicionada com sucesso!');
  });

  // Fechar modal ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      form.reset();
    }
  });

  // Preencher data e hora atuais
  const dataAtual = new Date();
  const dataFormatada = dataAtual.toISOString().split('T')[0];
  const horaFormatada = dataAtual.toTimeString().split(' ')[0].substring(0, 5);

  document.getElementById('data-atividade').value = dataFormatada;
  document.getElementById('hora-atividade').value = horaFormatada;
}

// Adicionar atividade à lista (simulação)
function adicionarAtividadeNaLista(atividade) {
  const listaAtividades = document.querySelector('#all ul');
  if (!listaAtividades) return;

  // Determinar o ícone com base no tipo
  let icone = 'fa-running';
  let corFundo = 'bg-blue-100';
  let corTexto = 'text-blue-500';

  switch (atividade.tipo) {
    case 'cycling':
      icone = 'fa-bicycle';
      corFundo = 'bg-green-100';
      corTexto = 'text-green-500';
      break;
    case 'walking':
      icone = 'fa-walking';
      corFundo = 'bg-yellow-100';
      corTexto = 'text-yellow-500';
      break;
    case 'swimming':
      icone = 'fa-swimmer';
      corFundo = 'bg-blue-100';
      corTexto = 'text-blue-500';
      break;
    case 'strength':
      icone = 'fa-dumbbell';
      corFundo = 'bg-purple-100';
      corTexto = 'text-purple-500';
      break;
    default:
      icone = 'fa-running';
      corFundo = 'bg-blue-100';
      corTexto = 'text-blue-500';
  }

  // Criar o elemento HTML da atividade
  const novaAtividade = document.createElement('li');
  novaAtividade.className = 'p-4 hover:bg-gray-50';
  novaAtividade.innerHTML = `
    <div class="flex items-center space-x-4">
      <div class="flex-shrink-0">
        <div class="w-12 h-12 rounded-full ${corFundo} flex items-center justify-center">
          <i class="fas ${icone} ${corTexto} text-xl"></i>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <p class="text-sm font-medium text-gray-900 truncate">
            ${atividade.nome}
          </p>
          <div class="flex items-center">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
              <i class="fas fa-check-circle mr-1"></i> Concluída
            </span>
            <span class="text-sm text-gray-500">${atividade.data}</span>
          </div>
        </div>
        <div class="mt-2 flex flex-wrap gap-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <i class="fas fa-road mr-1"></i> ${atividade.distancia} km
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <i class="fas fa-stopwatch mr-1"></i> ${atividade.duracao} min
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <i class="fas fa-fire mr-1"></i> ${atividade.calorias} kcal
          </span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <i class="fas fa-heartbeat mr-1"></i> ${atividade.fc} bpm
          </span>
        </div>
      </div>
      <div class="flex-shrink-0 flex space-x-2">
        <button class="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-500">
          <i class="fas fa-star"></i>
        </button>
        <button class="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-500">
          <i class="fas fa-edit"></i>
        </button>
        <button class="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:text-gray-500">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </div>
  `;

  // Adicionar ao início da lista
  listaAtividades.insertBefore(novaAtividade, listaAtividades.firstChild);

  // Atualizar o contador de atividades
  atualizarContadorAtividades();
}

// Atualizar contador de atividades
function atualizarContadorAtividades() {
  const contadorEl = document.querySelector('.analytics-card:nth-child(4) .text-2xl');
  if (contadorEl) {
    const contador = parseInt(contadorEl.textContent) + 1;
    contadorEl.textContent = contador;
  }
}

// Mostrar notificação
function mostrarNotificacao(mensagem) {
  // Verificar se já existe uma notificação
  let notificacao = document.getElementById('notificacao');

  if (!notificacao) {
    // Criar elemento de notificação
    notificacao = document.createElement('div');
    notificacao.id = 'notificacao';
    notificacao.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-20 opacity-0';
    document.body.appendChild(notificacao);
  }

  // Definir mensagem
  notificacao.textContent = mensagem;

  // Mostrar notificação
  setTimeout(() => {
    notificacao.classList.remove('translate-y-20', 'opacity-0');
  }, 100);

  // Esconder notificação após 3 segundos
  setTimeout(() => {
    notificacao.classList.add('translate-y-20', 'opacity-0');
  }, 3000);
}

// Carregar o widget de previsão do tempo
function loadWeatherWidget() {
  const container = document.getElementById('weather-widget-container');
  if (!container) return;

  fetch('components/weather-widget.html')
    .then(response => response.text())
    .then(html => {
      container.innerHTML = html;
    })
    .catch(error => {
      console.error('Erro ao carregar o widget de previsão do tempo:', error);
      container.innerHTML = `
        <div class="bg-white shadow rounded-lg p-6 text-center">
          <i class="fas fa-exclamation-circle text-red-500 text-3xl mb-3"></i>
          <p class="text-gray-700 mb-2">Não foi possível carregar a previsão do tempo.</p>
          <button id="retry-weather-widget" class="text-primary hover:text-indigo-700 text-sm">
            Tentar novamente
          </button>
        </div>
      `;

      // Configurar botão de tentar novamente
      const retryBtn = document.getElementById('retry-weather-widget');
      if (retryBtn) {
        retryBtn.addEventListener('click', loadWeatherWidget);
      }
    });
}

// Carregar o componente de importação de atividades
function loadImportActivityComponent() {
  fetch('components/import-activity.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);

      // Configurar botão de importação
      const importActivityBtn = document.getElementById('import-activity-btn');
      if (importActivityBtn) {
        importActivityBtn.addEventListener('click', () => {
          const modal = document.getElementById('import-activity-modal');
          if (modal) {
            modal.classList.remove('hidden');
          }
        });
      }
    })
    .catch(error => {
      console.error('Erro ao carregar o componente de importação de atividades:', error);
    });
}

// Carregar o componente de comentários
function loadCommentsComponent() {
  const commentsContainer = document.getElementById('comments-container');
  if (!commentsContainer) return;

  fetch('components/comments.html')
    .then(response => response.text())
    .then(html => {
      commentsContainer.innerHTML = html;

      // Inicializar componente de comentários
      if (typeof initCommentsSection === 'function') {
        // Passar opções para o componente
        initCommentsSection({
          entityType: 'activity',
          entityId: '1' // ID da atividade atual
        });
      }
    })
    .catch(error => {
      console.error('Erro ao carregar o componente de comentários:', error);
    });
}

// Carregar o componente de compartilhamento
function loadShareComponent() {
  fetch('components/share.html')
    .then(response => response.text())
    .then(html => {
      document.body.insertAdjacentHTML('beforeend', html);

      // Configurar botão de compartilhamento
      const shareActivityBtn = document.getElementById('share-activity-btn');
      if (shareActivityBtn) {
        shareActivityBtn.addEventListener('click', () => {
          // Obter dados da atividade atual
          const activityTitle = document.getElementById('activity-title').textContent;
          const activityDistance = document.getElementById('activity-distance').textContent;
          const activityDuration = document.getElementById('activity-duration').textContent;

          // Compartilhar atividade
          if (typeof shareActivity === 'function') {
            shareActivity({
              id: '1', // ID da atividade atual
              name: activityTitle,
              type: 'running', // Tipo padrão
              distance: activityDistance,
              duration: activityDuration,
              date: new Date().toLocaleDateString('pt-BR')
            });
          }
        });
      }
    })
    .catch(error => {
      console.error('Erro ao carregar o componente de compartilhamento:', error);
    });
}

// Inicializar funcionalidades quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de atividades
  if (document.body.getAttribute('data-page') === 'activities') {
    // Carregar o modal de nova atividade
    fetch('components/nova-atividade-modal.html')
      .then(response => response.text())
      .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        setupNovaAtividadeModal();

        // Configurar botão de nova atividade
        const novaAtividadeBtn = document.querySelector('button:has(i.fas.fa-plus)');
        if (novaAtividadeBtn) {
          novaAtividadeBtn.id = 'nova-atividade-btn';
        }
      })
      .catch(error => {
        console.error('Erro ao carregar o modal:', error);
      });

    // Carregar o widget de previsão do tempo
    loadWeatherWidget();

    // Carregar o componente de importação de atividades
    loadImportActivityComponent();

    // Carregar o componente de conexão de dispositivos
    loadDeviceConnectComponent();

    // Carregar o componente de comentários
    loadCommentsComponent();

    // Carregar o componente de compartilhamento
    loadShareComponent();

    // Carregar o componente de notificações
    fetch('components/notifications.html')
      .then(response => response.text())
      .then(html => {
        const container = document.createElement('div');
        container.className = 'relative';
        container.innerHTML = html;
        document.body.appendChild(container);
      })
      .catch(error => {
        console.error('Erro ao carregar o componente de notificações:', error);
      });

    // Configurar listener para mensagens de conexão de dispositivos
    window.addEventListener('message', function(event) {
      // Verificar origem da mensagem
      if (event.origin !== window.location.origin) return;

      // Verificar tipo de mensagem
      if (event.data && event.data.type === 'device_connected') {
        // Atualizar componente de dispositivos
        if (typeof renderDevices === 'function') {
          renderDevices();
        }

        // Mostrar feedback ao usuário
        if (typeof showToast === 'function') {
          showToast('Dispositivo conectado com sucesso!', 'success');
        }
      }
    });
  }
});

/**
 * Carregar componente de conexão de dispositivos
 */
function loadDeviceConnectComponent() {
  fetch('components/device-connect.html')
    .then(response => response.text())
    .then(html => {
      // Criar container para o componente
      const deviceSection = document.createElement('div');
      deviceSection.className = 'mb-6';
      deviceSection.innerHTML = '<h2 class="text-xl font-bold text-gray-900 mb-4">Dispositivos</h2>';

      // Adicionar componente ao container
      const deviceComponent = document.createElement('div');
      deviceComponent.innerHTML = html;
      deviceSection.appendChild(deviceComponent.firstChild);

      // Inserir após o resumo e previsão do tempo
      const weatherWidget = document.getElementById('weather-widget-container');
      if (weatherWidget && weatherWidget.parentNode) {
        weatherWidget.parentNode.parentNode.after(deviceSection);
      }
    })
    .catch(error => {
      console.error('Erro ao carregar o componente de conexão de dispositivos:', error);
    });
}
