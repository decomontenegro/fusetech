/**
 * Script para gerenciar dispositivos e sensores
 *
 * Este script gerencia a interface de usuário para conectar, sincronizar
 * e configurar dispositivos e sensores no FuseLabs.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Elementos da UI
  const connectedDevicesList = document.getElementById('connected-devices-list');
  const availableDevicesList = document.getElementById('available-devices-list');
  const sensorsList = document.getElementById('sensors-list');
  const addDeviceButton = document.getElementById('add-device-button');
  const scanSensorsButton = document.getElementById('scan-sensors-button');
  const syncAllButton = document.getElementById('sync-all-button');
  const saveSettingsButton = document.getElementById('save-settings-button');
  const addDeviceModal = document.getElementById('add-device-modal');
  const closeModalButton = document.getElementById('close-modal-button');
  const addDeviceList = document.getElementById('add-device-list');

  // Configurações
  const autoSyncToggle = document.getElementById('auto-sync-toggle');
  const syncIntervalSelect = document.getElementById('sync-interval');
  const mergeStrategySelect = document.getElementById('merge-strategy');
  const bluetoothToggle = document.getElementById('bluetooth-toggle');
  const realtimeToggle = document.getElementById('realtime-toggle');

  // Verificar se o serviço de integração de dispositivos está disponível
  if (!window.deviceIntegration) {
    showError('Serviço de integração de dispositivos não disponível');
    return;
  }

  // Inicializar serviço de integração de dispositivos
  initDeviceIntegration();

  // Carregar dispositivos conectados e disponíveis
  loadConnectedDevices();
  loadAvailableDevices();

  // Carregar sensores conectados
  loadConnectedSensors();

  // Carregar configurações
  loadSettings();

  // Adicionar event listeners
  addEventListeners();

  /**
   * Inicializar serviço de integração de dispositivos
   */
  function initDeviceIntegration() {
    try {
      // Verificar se o serviço já foi inicializado
      if (window.deviceIntegration.state && window.deviceIntegration.state.initialized) {
        console.log('Serviço de integração de dispositivos já inicializado');
        return;
      }

      // Inicializar serviço
      window.deviceIntegration.init({
        autoConnect: true,
        syncInterval: 30 * 60 * 1000, // 30 minutos
        bluetoothEnabled: true,
        realTimeDataEnabled: true
      });

      console.log('Serviço de integração de dispositivos inicializado');
    } catch (error) {
      console.error('Erro ao inicializar serviço de integração de dispositivos:', error);
      showError('Erro ao inicializar serviço de integração de dispositivos');
    }
  }

  /**
   * Carregar dispositivos conectados
   */
  function loadConnectedDevices() {
    try {
      // Obter dispositivos conectados
      const connectedDevices = window.deviceIntegration.getConnectedDevices();

      // Limpar lista
      if (connectedDevicesList) {
        connectedDevicesList.innerHTML = '';
      }

      // Verificar se há dispositivos conectados
      if (connectedDevices.length === 0) {
        if (connectedDevicesList) {
          connectedDevicesList.innerHTML = `
            <div class="p-4 text-center text-gray-500">
              <p>Nenhum dispositivo conectado</p>
              <p class="text-sm mt-2">Clique em "Adicionar Dispositivo" para conectar um dispositivo</p>
            </div>
          `;
        }
        return;
      }

      // Renderizar dispositivos conectados
      connectedDevices.forEach(device => {
        renderConnectedDevice(device);
      });
    } catch (error) {
      console.error('Erro ao carregar dispositivos conectados:', error);
      showError('Erro ao carregar dispositivos conectados');
    }
  }

  /**
   * Renderizar dispositivo conectado
   * @param {Object} device - Dispositivo conectado
   */
  function renderConnectedDevice(device) {
    if (!connectedDevicesList) return;

    // Criar elemento para o dispositivo
    const deviceElement = document.createElement('div');
    deviceElement.className = 'p-4 border-b border-gray-200';
    deviceElement.setAttribute('data-device-id', device.id);

    // Formatar última sincronização
    const lastSync = device.connections && device.connections[device.id] && device.connections[device.id].lastSync
      ? new Date(device.connections[device.id].lastSync)
      : null;

    const lastSyncText = lastSync
      ? formatRelativeTime(lastSync)
      : 'Nunca';

    // Obter capacidades do dispositivo
    const capabilities = device.capabilities || [];

    // Renderizar HTML
    deviceElement.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <div class="h-12 w-12 rounded-full bg-${device.color.replace('#', '')}-100 flex items-center justify-center">
            <i class="fas ${device.icon} text-${device.color.replace('#', ''}-500 text-xl"></i>
          </div>
        </div>
        <div class="ml-4 flex-1">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-medium text-gray-900">${device.name}</h4>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i class="fas fa-check-circle mr-1"></i> Conectado
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500">Última sincronização: ${lastSyncText}</p>

          <div class="mt-3 flex flex-wrap gap-2">
            ${capabilities.map(capability => {
              let icon, label;

              switch (capability) {
                case 'heartRate':
                  icon = 'fa-heartbeat';
                  label = 'Freq. Cardíaca';
                  break;
                case 'steps':
                  icon = 'fa-shoe-prints';
                  label = 'Passos';
                  break;
                case 'distance':
                  icon = 'fa-route';
                  label = 'Distância';
                  break;
                case 'calories':
                  icon = 'fa-fire';
                  label = 'Calorias';
                  break;
                case 'sleep':
                  icon = 'fa-bed';
                  label = 'Sono';
                  break;
                case 'elevation':
                  icon = 'fa-mountain';
                  label = 'Elevação';
                  break;
                case 'cadence':
                  icon = 'fa-tachometer-alt';
                  label = 'Cadência';
                  break;
                case 'power':
                  icon = 'fa-bolt';
                  label = 'Potência';
                  break;
                default:
                  icon = 'fa-check';
                  label = capability;
              }

              return `
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <i class="fas ${icon} mr-1"></i> ${label}
                </span>
              `;
            }).join('')}
          </div>

          <div class="mt-4 flex space-x-3">
            <button class="sync-device-button inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none" data-device-id="${device.id}">
              <i class="fas fa-sync-alt mr-1"></i> Sincronizar
            </button>
            <button class="device-settings-button inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none" data-device-id="${device.id}">
              <i class="fas fa-cog mr-1"></i> Configurações
            </button>
            <button class="disconnect-device-button inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none" data-device-id="${device.id}">
              <i class="fas fa-unlink mr-1"></i> Desconectar
            </button>
          </div>
        </div>
      </div>
    `;

    // Adicionar event listeners
    const syncButton = deviceElement.querySelector('.sync-device-button');
    if (syncButton) {
      syncButton.addEventListener('click', () => {
        syncDevice(device.id);
      });
    }

    const settingsButton = deviceElement.querySelector('.device-settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => {
        showDeviceSettings(device.id);
      });
    }

    const disconnectButton = deviceElement.querySelector('.disconnect-device-button');
    if (disconnectButton) {
      disconnectButton.addEventListener('click', () => {
        disconnectDevice(device.id);
      });
    }

    // Adicionar à lista
    connectedDevicesList.appendChild(deviceElement);
  }

  /**
   * Carregar dispositivos disponíveis
   */
  function loadAvailableDevices() {
    try {
      // Obter dispositivos suportados
      const supportedDevices = window.deviceIntegration.getSupportedDevices();

      // Obter dispositivos conectados
      const connectedDevices = window.deviceIntegration.getConnectedDevices();
      const connectedDeviceIds = connectedDevices.map(device => device.id);

      // Filtrar dispositivos não conectados
      const availableDevices = supportedDevices.filter(device => !connectedDeviceIds.includes(device.id));

      // Limpar lista
      if (availableDevicesList) {
        availableDevicesList.innerHTML = '';
      }

      // Verificar se há dispositivos disponíveis
      if (availableDevices.length === 0) {
        if (availableDevicesList) {
          availableDevicesList.innerHTML = `
            <div class="p-4 text-center text-gray-500">
              <p>Nenhum dispositivo disponível</p>
            </div>
          `;
        }
        return;
      }

      // Renderizar dispositivos disponíveis (limitado a 5)
      const devicesToShow = availableDevices.slice(0, 5);

      devicesToShow.forEach(device => {
        renderAvailableDevice(device);
      });

      // Adicionar link "Ver mais" se houver mais dispositivos
      if (availableDevices.length > 5) {
        const viewMoreElement = document.createElement('div');
        viewMoreElement.className = 'p-4 text-center';
        viewMoreElement.innerHTML = `
          <button id="view-more-devices" class="text-sm text-primary hover:text-indigo-700">
            Ver mais dispositivos (${availableDevices.length - 5} restantes)
          </button>
        `;

        // Adicionar event listener
        viewMoreElement.querySelector('#view-more-devices').addEventListener('click', () => {
          showAddDeviceModal();
        });

        // Adicionar à lista
        if (availableDevicesList) {
          availableDevicesList.appendChild(viewMoreElement);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dispositivos disponíveis:', error);
      showError('Erro ao carregar dispositivos disponíveis');
    }
  }

  /**
   * Renderizar dispositivo disponível
   * @param {Object} device - Dispositivo disponível
   */
  function renderAvailableDevice(device) {
    if (!availableDevicesList) return;

    // Criar elemento para o dispositivo
    const deviceElement = document.createElement('div');
    deviceElement.className = 'p-4 hover:bg-gray-50';
    deviceElement.setAttribute('data-device-id', device.id);

    // Renderizar HTML
    deviceElement.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="h-10 w-10 rounded-full bg-${device.color.replace('#', '')}-100 flex items-center justify-center">
            <i class="fas ${device.icon} text-${device.color.replace('#', '')}-500"></i>
          </div>
        </div>
        <div class="ml-3 flex-1">
          <h4 class="text-sm font-medium text-gray-900">${device.name}</h4>
        </div>
        <button class="connect-device-button inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary hover:bg-indigo-700 focus:outline-none" data-device-id="${device.id}">
          Conectar
        </button>
      </div>
    `;

    // Adicionar event listener
    const connectButton = deviceElement.querySelector('.connect-device-button');
    if (connectButton) {
      connectButton.addEventListener('click', () => {
        connectDevice(device.id);
      });
    }

    // Adicionar à lista
    availableDevicesList.appendChild(deviceElement);
  }

  /**
   * Carregar sensores conectados
   */
  function loadConnectedSensors() {
    try {
      // Obter sensores conectados
      const connectedSensors = window.deviceIntegration.getConnectedSensors();

      // Limpar lista
      if (sensorsList) {
        sensorsList.innerHTML = '';
      }

      // Verificar se há sensores conectados
      if (connectedSensors.length === 0) {
        if (sensorsList) {
          sensorsList.innerHTML = `
            <div class="p-4 text-center text-gray-500">
              <p>Nenhum sensor conectado</p>
              <p class="text-sm mt-2">Clique em "Escanear" para procurar sensores Bluetooth próximos</p>
            </div>
          `;
        }
        return;
      }

      // Renderizar sensores conectados
      connectedSensors.forEach(sensor => {
        renderConnectedSensor(sensor);
      });
    } catch (error) {
      console.error('Erro ao carregar sensores conectados:', error);
      showError('Erro ao carregar sensores conectados');
    }
  }

  /**
   * Renderizar sensor conectado
   * @param {Object} sensor - Sensor conectado
   */
  function renderConnectedSensor(sensor) {
    if (!sensorsList) return;

    // Criar elemento para o sensor
    const sensorElement = document.createElement('div');
    sensorElement.className = 'p-4 border-b border-gray-200';
    sensorElement.setAttribute('data-sensor-id', sensor.id);

    // Obter ícone e rótulo com base no tipo
    let icon, label;

    switch (sensor.type) {
      case 'heart_rate':
        icon = 'fa-heartbeat';
        label = 'Monitor de Frequência Cardíaca';
        break;
      case 'cadence':
        icon = 'fa-tachometer-alt';
        label = 'Sensor de Cadência';
        break;
      case 'power':
        icon = 'fa-bolt';
        label = 'Medidor de Potência';
        break;
      case 'speed':
        icon = 'fa-tachometer-alt';
        label = 'Sensor de Velocidade';
        break;
      case 'foot_pod':
        icon = 'fa-shoe-prints';
        label = 'Foot Pod';
        break;
      default:
        icon = 'fa-bluetooth';
        label = 'Sensor Bluetooth';
    }

    // Renderizar HTML
    sensorElement.innerHTML = `
      <div class="flex items-start" data-sensor-id="${sensor.id}">
        <div class="flex-shrink-0">
          <div class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <i class="fas ${icon} text-blue-500 text-xl"></i>
          </div>
        </div>
        <div class="ml-4 flex-1">
          <div class="flex items-center justify-between">
            <h4 class="text-lg font-medium text-gray-900">${sensor.name}</h4>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <i class="fas fa-check-circle mr-1"></i> Conectado
            </span>
          </div>
          <p class="mt-1 text-sm text-gray-500">${label}</p>

          <div class="mt-3 p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Valor atual:</span>
              <span class="sensor-value text-lg font-medium text-gray-900">--</span>
            </div>
            <div class="text-right text-xs text-gray-400 sensor-timestamp">--:--:--</div>
          </div>

          <div class="mt-4 flex space-x-3">
            <button class="disconnect-sensor-button inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 hover:bg-red-50 focus:outline-none" data-sensor-id="${sensor.id}">
              <i class="fas fa-unlink mr-1"></i> Desconectar
            </button>
          </div>
        </div>
      </div>
    `;

    // Adicionar event listener
    const disconnectButton = sensorElement.querySelector('.disconnect-sensor-button');
    if (disconnectButton) {
      disconnectButton.addEventListener('click', () => {
        disconnectSensor(sensor.id);
      });
    }

    // Adicionar à lista
    sensorsList.appendChild(sensorElement);
  }

  /**
   * Carregar configurações
   */
  function loadSettings() {
    try {
      // Obter configurações do serviço
      const config = window.deviceIntegration.config;

      // Atualizar UI
      if (autoSyncToggle) {
        autoSyncToggle.checked = config.autoSync;
      }

      if (syncIntervalSelect) {
        const intervalMinutes = Math.floor(config.syncInterval / (60 * 1000));
        syncIntervalSelect.value = intervalMinutes.toString();
      }

      if (mergeStrategySelect) {
        mergeStrategySelect.value = config.mergeStrategy;
      }

      if (bluetoothToggle) {
        bluetoothToggle.checked = config.bluetoothEnabled;
      }

      if (realtimeToggle) {
        realtimeToggle.checked = config.realTimeDataEnabled;
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      showError('Erro ao carregar configurações');
    }
  }

  /**
   * Adicionar event listeners
   */
  function addEventListeners() {
    // Botão de adicionar dispositivo
    if (addDeviceButton) {
      addDeviceButton.addEventListener('click', showAddDeviceModal);
    }

    // Botão de escanear sensores
    if (scanSensorsButton) {
      scanSensorsButton.addEventListener('click', scanForSensors);
    }

    // Botão de sincronizar todos
    if (syncAllButton) {
      syncAllButton.addEventListener('click', syncAllDevices);
    }

    // Botão de salvar configurações
    if (saveSettingsButton) {
      saveSettingsButton.addEventListener('click', saveSettings);
    }

    // Botão de fechar modal
    if (closeModalButton) {
      closeModalButton.addEventListener('click', hideAddDeviceModal);
    }

    // Listener para dados de sensores
    document.addEventListener('sensorData', handleSensorData);
  }

  /**
   * Mostrar modal de adicionar dispositivo
   */
  function showAddDeviceModal() {
    if (!addDeviceModal) return;

    // Mostrar modal
    addDeviceModal.classList.remove('hidden');

    // Carregar dispositivos disponíveis
    loadDevicesForModal();
  }

  /**
   * Esconder modal de adicionar dispositivo
   */
  function hideAddDeviceModal() {
    if (!addDeviceModal) return;

    // Esconder modal
    addDeviceModal.classList.add('hidden');
  }

  /**
   * Carregar dispositivos para o modal
   */
  function loadDevicesForModal() {
    try {
      if (!addDeviceList) return;

      // Limpar lista
      addDeviceList.innerHTML = '';

      // Obter dispositivos suportados
      const supportedDevices = window.deviceIntegration.getSupportedDevices();

      // Obter dispositivos conectados
      const connectedDevices = window.deviceIntegration.getConnectedDevices();
      const connectedDeviceIds = connectedDevices.map(device => device.id);

      // Filtrar dispositivos não conectados
      const availableDevices = supportedDevices.filter(device => !connectedDeviceIds.includes(device.id));

      // Verificar se há dispositivos disponíveis
      if (availableDevices.length === 0) {
        addDeviceList.innerHTML = `
          <div class="col-span-2 p-4 text-center text-gray-500">
            <p>Nenhum dispositivo disponível para conectar</p>
          </div>
        `;
        return;
      }

      // Renderizar dispositivos disponíveis
      availableDevices.forEach(device => {
        const deviceElement = document.createElement('div');
        deviceElement.className = 'p-3 border rounded-lg hover:bg-gray-50 cursor-pointer';
        deviceElement.setAttribute('data-device-id', device.id);

        deviceElement.innerHTML = `
          <div class="flex flex-col items-center text-center">
            <div class="h-12 w-12 rounded-full bg-${device.color.replace('#', '')}-100 flex items-center justify-center mb-2">
              <i class="fas ${device.icon} text-${device.color.replace('#', '')}-500 text-xl"></i>
            </div>
            <h4 class="text-sm font-medium text-gray-900">${device.name}</h4>
          </div>
        `;

        // Adicionar event listener
        deviceElement.addEventListener('click', () => {
          connectDevice(device.id);
          hideAddDeviceModal();
        });

        // Adicionar à lista
        addDeviceList.appendChild(deviceElement);
      });
    } catch (error) {
      console.error('Erro ao carregar dispositivos para o modal:', error);
      showError('Erro ao carregar dispositivos disponíveis');
    }
  }

  /**
   * Conectar dispositivo
   * @param {String} deviceId - ID do dispositivo
   */
  async function connectDevice(deviceId) {
    try {
      // Mostrar feedback ao usuário
      showToast('Conectando ao dispositivo...', 'info');

      // Conectar dispositivo
      const result = await window.deviceIntegration.connectDevice(deviceId);

      if (result) {
        // Mostrar feedback ao usuário
        showToast('Dispositivo conectado com sucesso!', 'success');

        // Recarregar listas
        loadConnectedDevices();
        loadAvailableDevices();
      } else {
        // Mostrar feedback ao usuário
        showToast('Erro ao conectar dispositivo', 'error');
      }
    } catch (error) {
      console.error('Erro ao conectar dispositivo:', error);
      showToast('Erro ao conectar dispositivo', 'error');
    }
  }

  /**
   * Desconectar dispositivo
   * @param {String} deviceId - ID do dispositivo
   */
  async function disconnectDevice(deviceId) {
    try {
      // Confirmar com o usuário
      if (!confirm('Tem certeza que deseja desconectar este dispositivo?')) {
        return;
      }

      // Mostrar feedback ao usuário
      showToast('Desconectando dispositivo...', 'info');

      // Desconectar dispositivo
      const result = await window.deviceIntegration.disconnectDevice(deviceId);

      if (result) {
        // Mostrar feedback ao usuário
        showToast('Dispositivo desconectado com sucesso!', 'success');

        // Recarregar listas
        loadConnectedDevices();
        loadAvailableDevices();
      } else {
        // Mostrar feedback ao usuário
        showToast('Erro ao desconectar dispositivo', 'error');
      }
    } catch (error) {
      console.error('Erro ao desconectar dispositivo:', error);
      showToast('Erro ao desconectar dispositivo', 'error');
    }
  }

  /**
   * Sincronizar dispositivo
   * @param {String} deviceId - ID do dispositivo
   */
  async function syncDevice(deviceId) {
    try {
      // Mostrar feedback ao usuário
      showToast('Sincronizando dispositivo...', 'info');

      // Sincronizar dispositivo
      const result = await window.deviceIntegration.syncDevice(deviceId);

      if (result) {
        // Mostrar feedback ao usuário
        showToast('Dispositivo sincronizado com sucesso!', 'success');

        // Recarregar lista de dispositivos conectados
        loadConnectedDevices();
      } else {
        // Mostrar feedback ao usuário
        showToast('Erro ao sincronizar dispositivo', 'error');
      }
    } catch (error) {
      console.error('Erro ao sincronizar dispositivo:', error);
      showToast('Erro ao sincronizar dispositivo', 'error');
    }
  }

  /**
   * Sincronizar todos os dispositivos
   */
  async function syncAllDevices() {
    try {
      // Mostrar feedback ao usuário
      showToast('Sincronizando todos os dispositivos...', 'info');

      // Sincronizar todos os dispositivos
      const results = await window.deviceIntegration.syncAll();

      // Verificar resultados
      const successCount = results.filter(result => result.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        // Mostrar feedback ao usuário
        showToast(`${successCount} dispositivos sincronizados com sucesso!`, 'success');
      } else {
        // Mostrar feedback ao usuário
        showToast(`${successCount} dispositivos sincronizados, ${failCount} falhas`, 'warning');
      }

      // Recarregar lista de dispositivos conectados
      loadConnectedDevices();
    } catch (error) {
      console.error('Erro ao sincronizar dispositivos:', error);
      showToast('Erro ao sincronizar dispositivos', 'error');
    }
  }

  /**
   * Escanear por sensores Bluetooth
   */
  async function scanForSensors() {
    try {
      // Verificar suporte a Bluetooth
      if (!navigator.bluetooth) {
        showToast('Bluetooth não suportado neste navegador', 'error');
        return;
      }

      // Mostrar feedback ao usuário
      showToast('Escaneando por sensores Bluetooth...', 'info');

      // Escanear por sensores
      const sensors = await window.deviceIntegration.scanForSensors();

      if (sensors.length > 0) {
        // Mostrar feedback ao usuário
        showToast(`${sensors.length} sensores encontrados`, 'success');

        // Mostrar modal de sensores encontrados
        showSensorsFoundModal(sensors);
      } else {
        // Mostrar feedback ao usuário
        showToast('Nenhum sensor encontrado', 'warning');
      }
    } catch (error) {
      console.error('Erro ao escanear por sensores:', error);
      showToast('Erro ao escanear por sensores', 'error');
    }
  }

  /**
   * Mostrar modal de sensores encontrados
   * @param {Array} sensors - Sensores encontrados
   */
  function showSensorsFoundModal(sensors) {
    // Implementação simplificada
    // Em um ambiente real, mostraríamos um modal com os sensores encontrados

    // Para cada sensor não conectado, perguntar se deseja conectar
    sensors.filter(sensor => !sensor.connected).forEach(sensor => {
      if (confirm(`Deseja conectar ao sensor "${sensor.name}"?`)) {
        connectToSensor(sensor.id);
      }
    });
  }

  /**
   * Conectar a um sensor
   * @param {String} sensorId - ID do sensor
   */
  async function connectToSensor(sensorId) {
    try {
      // Mostrar feedback ao usuário
      showToast('Conectando ao sensor...', 'info');

      // Conectar ao sensor
      const sensor = await window.deviceIntegration.connectToSensor(sensorId);

      if (sensor) {
        // Mostrar feedback ao usuário
        showToast('Sensor conectado com sucesso!', 'success');

        // Recarregar lista de sensores
        loadConnectedSensors();
      } else {
        // Mostrar feedback ao usuário
        showToast('Erro ao conectar ao sensor', 'error');
      }
    } catch (error) {
      console.error('Erro ao conectar ao sensor:', error);
      showToast('Erro ao conectar ao sensor', 'error');
    }
  }

  /**
   * Desconectar sensor
   * @param {String} sensorId - ID do sensor
   */
  async function disconnectSensor(sensorId) {
    try {
      // Confirmar com o usuário
      if (!confirm('Tem certeza que deseja desconectar este sensor?')) {
        return;
      }

      // Mostrar feedback ao usuário
      showToast('Desconectando sensor...', 'info');

      // Desconectar sensor
      const result = await window.deviceIntegration.disconnectSensor(sensorId);

      if (result) {
        // Mostrar feedback ao usuário
        showToast('Sensor desconectado com sucesso!', 'success');

        // Recarregar lista de sensores
        loadConnectedSensors();
      } else {
        // Mostrar feedback ao usuário
        showToast('Erro ao desconectar sensor', 'error');
      }
    } catch (error) {
      console.error('Erro ao desconectar sensor:', error);
      showToast('Erro ao desconectar sensor', 'error');
    }
  }

  /**
   * Manipular dados de sensores
   * @param {CustomEvent} event - Evento com dados do sensor
   */
  function handleSensorData(event) {
    const data = event.detail;

    if (!data || !data.sensorId) return;

    // Buscar elemento do sensor
    const sensorElement = document.querySelector(`[data-sensor-id="${data.sensorId}"]`);

    if (!sensorElement) return;

    // Atualizar valor
    const valueElement = sensorElement.querySelector('.sensor-value');

    if (valueElement && data.value !== undefined) {
      valueElement.textContent = `${data.value} ${data.unit || ''}`;
    }

    // Atualizar timestamp
    const timestampElement = sensorElement.querySelector('.sensor-timestamp');

    if (timestampElement) {
      const now = new Date();
      timestampElement.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    }
  }

  /**
   * Salvar configurações
   */
  function saveSettings() {
    try {
      // Obter valores da UI
      const autoSync = autoSyncToggle ? autoSyncToggle.checked : true;
      const syncInterval = syncIntervalSelect ? parseInt(syncIntervalSelect.value, 10) * 60 * 1000 : 30 * 60 * 1000;
      const mergeStrategy = mergeStrategySelect ? mergeStrategySelect.value : 'most_complete';
      const bluetoothEnabled = bluetoothToggle ? bluetoothToggle.checked : true;
      const realTimeDataEnabled = realtimeToggle ? realtimeToggle.checked : true;

      // Atualizar configurações
      window.deviceIntegration.updateConfig({
        autoSync,
        syncInterval,
        mergeStrategy,
        bluetoothEnabled,
        realTimeDataEnabled
      });

      // Mostrar feedback ao usuário
      showToast('Configurações salvas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      showToast('Erro ao salvar configurações', 'error');
    }
  }

  /**
   * Mostrar mensagem de erro
   * @param {String} message - Mensagem de erro
   */
  function showError(message) {
    // Implementação simplificada
    // Em um ambiente real, mostraríamos uma mensagem de erro mais elaborada
    alert(message);
  }

  /**
   * Mostrar toast
   * @param {String} message - Mensagem
   * @param {String} type - Tipo de toast (info, success, warning, error)
   */
  function showToast(message, type = 'info') {
    // Verificar se a função global está disponível
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }

    // Implementação fallback
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Mostrar alerta para tipos error e warning
    if (type === 'error' || type === 'warning') {
      alert(message);
    }
  }

  /**
   * Formatar tempo relativo
   * @param {Date} date - Data
   * @returns {String} - Tempo relativo formatado
   */
  function formatRelativeTime(date) {
    if (!date) return 'Nunca';

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'Agora mesmo';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'} atrás`;
    } else if (diffHour < 24) {
      return `${diffHour} ${diffHour === 1 ? 'hora' : 'horas'} atrás`;
    } else if (diffDay < 7) {
      return `${diffDay} ${diffDay === 1 ? 'dia' : 'dias'} atrás`;
    } else {
      return date.toLocaleDateString();
    }
  }
});
