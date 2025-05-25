/**
 * Serviço de integração com dispositivos
 * 
 * Este módulo gerencia a integração com dispositivos físicos,
 * incluindo sensores Bluetooth, dispositivos GPS e smartwatches.
 */

export class DeviceService {
  /**
   * Construtor do serviço de dispositivos
   * @param {Object} apiClient - Cliente API para comunicação com o backend
   * @param {Object} store - Store para gerenciamento de estado
   * @param {Object} eventBus - Barramento de eventos
   */
  constructor(apiClient, store, eventBus) {
    this.apiClient = apiClient;
    this.store = store;
    this.eventBus = eventBus;
    this.connectedDevices = [];
    this.connectedSensors = [];
    this.scanning = false;
    this.bluetoothAvailable = typeof navigator.bluetooth !== 'undefined';
    
    // Configurações padrão
    this.config = {
      autoSync: true,
      syncInterval: 30 * 60 * 1000, // 30 minutos
      mergeStrategy: 'most_complete',
      bluetoothEnabled: true,
      realTimeDataEnabled: true
    };
    
    // Inicializar listeners para eventos de dispositivos
    this._initEventListeners();
  }

  /**
   * Inicializar o serviço de dispositivos
   * @returns {Promise<Boolean>} - Verdadeiro se inicializado com sucesso
   */
  async init() {
    try {
      // Carregar configurações do backend ou localStorage
      await this.loadConfig();
      
      // Carregar dispositivos conectados
      await this.loadConnectedDevices();
      
      // Iniciar sincronização automática se habilitada
      if (this.config.autoSync) {
        this._startAutoSync();
      }
      
      // Emitir evento de inicialização
      this.eventBus.emit('devices:initialized', { success: true });
      
      return true;
    } catch (error) {
      console.error('Failed to initialize device service:', error);
      
      // Emitir evento de erro
      this.eventBus.emit('devices:error', { error });
      
      return false;
    }
  }

  /**
   * Carregar configurações
   * @returns {Promise<Object>} - Configurações carregadas
   */
  async loadConfig() {
    try {
      // Tentar carregar do backend
      const config = await this.apiClient.get('/devices/config');
      this.config = { ...this.config, ...config };
    } catch (error) {
      console.warn('Failed to load device config from API, using defaults:', error);
      
      // Tentar carregar do localStorage
      try {
        const storedConfig = localStorage.getItem('device_config');
        if (storedConfig) {
          this.config = { ...this.config, ...JSON.parse(storedConfig) };
        }
      } catch (localError) {
        console.warn('Failed to load device config from localStorage:', localError);
      }
    }
    
    return this.config;
  }

  /**
   * Atualizar configurações
   * @param {Object} newConfig - Novas configurações
   * @returns {Promise<Object>} - Configurações atualizadas
   */
  async updateConfig(newConfig) {
    try {
      // Mesclar com configurações atuais
      this.config = { ...this.config, ...newConfig };
      
      // Salvar no backend
      await this.apiClient.put('/devices/config', this.config);
      
      // Salvar no localStorage como backup
      localStorage.setItem('device_config', JSON.stringify(this.config));
      
      // Reiniciar sincronização automática se necessário
      if (this.config.autoSync) {
        this._startAutoSync();
      } else {
        this._stopAutoSync();
      }
      
      // Emitir evento de atualização
      this.eventBus.emit('devices:config-updated', { config: this.config });
      
      return this.config;
    } catch (error) {
      console.error('Failed to update device config:', error);
      throw error;
    }
  }

  /**
   * Carregar dispositivos conectados
   * @returns {Promise<Array>} - Lista de dispositivos conectados
   */
  async loadConnectedDevices() {
    try {
      // Carregar do backend
      const devices = await this.apiClient.get('/devices');
      this.connectedDevices = devices;
      
      // Atualizar estado
      this.store.setState({ devices }, 'devices-loaded');
      
      // Emitir evento
      this.eventBus.emit('devices:loaded', { devices });
      
      return devices;
    } catch (error) {
      console.error('Failed to load connected devices:', error);
      throw error;
    }
  }

  /**
   * Obter dispositivos suportados
   * @returns {Promise<Array>} - Lista de dispositivos suportados
   */
  async getSupportedDevices() {
    try {
      return await this.apiClient.get('/devices/supported');
    } catch (error) {
      console.error('Failed to get supported devices:', error);
      throw error;
    }
  }

  /**
   * Conectar dispositivo
   * @param {String} deviceId - ID do dispositivo
   * @returns {Promise<Object>} - Dispositivo conectado
   */
  async connectDevice(deviceId) {
    try {
      // Conectar via API
      const device = await this.apiClient.post(`/devices/${deviceId}/connect`);
      
      // Adicionar à lista de dispositivos conectados
      this.connectedDevices.push(device);
      
      // Atualizar estado
      this.store.setState({ devices: this.connectedDevices }, 'device-connected');
      
      // Emitir evento
      this.eventBus.emit('devices:connected', { device });
      
      return device;
    } catch (error) {
      console.error(`Failed to connect device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Desconectar dispositivo
   * @param {String} deviceId - ID do dispositivo
   * @returns {Promise<Boolean>} - Verdadeiro se desconectado com sucesso
   */
  async disconnectDevice(deviceId) {
    try {
      // Desconectar via API
      await this.apiClient.post(`/devices/${deviceId}/disconnect`);
      
      // Remover da lista de dispositivos conectados
      this.connectedDevices = this.connectedDevices.filter(d => d.id !== deviceId);
      
      // Atualizar estado
      this.store.setState({ devices: this.connectedDevices }, 'device-disconnected');
      
      // Emitir evento
      this.eventBus.emit('devices:disconnected', { deviceId });
      
      return true;
    } catch (error) {
      console.error(`Failed to disconnect device ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Sincronizar dispositivo
   * @param {String} deviceId - ID do dispositivo
   * @returns {Promise<Object>} - Resultado da sincronização
   */
  async syncDevice(deviceId) {
    try {
      // Atualizar estado para indicar sincronização em andamento
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingDevice: deviceId
        }
      }, 'device-sync-start');
      
      // Sincronizar via API
      const result = await this.apiClient.post(`/devices/${deviceId}/sync`);
      
      // Atualizar estado
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingDevice: null
        }
      }, 'device-sync-complete');
      
      // Emitir evento
      this.eventBus.emit('devices:synced', { deviceId, result });
      
      return result;
    } catch (error) {
      console.error(`Failed to sync device ${deviceId}:`, error);
      
      // Atualizar estado para indicar erro
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingDevice: null,
          deviceError: error.message
        }
      }, 'device-sync-error');
      
      throw error;
    }
  }

  /**
   * Sincronizar todos os dispositivos
   * @returns {Promise<Array>} - Resultados das sincronizações
   */
  async syncAll() {
    try {
      // Atualizar estado para indicar sincronização em andamento
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingAllDevices: true
        }
      }, 'devices-sync-all-start');
      
      // Sincronizar via API
      const results = await this.apiClient.post('/devices/sync-all');
      
      // Atualizar estado
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingAllDevices: false,
          lastDeviceSync: new Date().toISOString()
        }
      }, 'devices-sync-all-complete');
      
      // Emitir evento
      this.eventBus.emit('devices:all-synced', { results });
      
      return results;
    } catch (error) {
      console.error('Failed to sync all devices:', error);
      
      // Atualizar estado para indicar erro
      this.store.setState({
        ui: {
          ...this.store.getState().ui,
          syncingAllDevices: false,
          deviceError: error.message
        }
      }, 'devices-sync-all-error');
      
      throw error;
    }
  }

  /**
   * Escanear por sensores Bluetooth
   * @returns {Promise<Array>} - Sensores encontrados
   */
  async scanForSensors() {
    // Verificar se Bluetooth está disponível
    if (!this.bluetoothAvailable) {
      throw new Error('Bluetooth is not available on this device');
    }
    
    // Verificar se já está escaneando
    if (this.scanning) {
      throw new Error('Already scanning for sensors');
    }
    
    try {
      this.scanning = true;
      
      // Emitir evento de início de escaneamento
      this.eventBus.emit('devices:scan-start');
      
      // Solicitar dispositivo Bluetooth
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['cycling_power'] },
          { services: ['cycling_speed_and_cadence'] },
          { services: ['running_speed_and_cadence'] }
        ],
        optionalServices: ['battery_service', 'device_information']
      });
      
      // Conectar ao dispositivo
      const server = await device.gatt.connect();
      
      // Processar dispositivo encontrado
      const sensor = await this._processBleDevice(device, server);
      
      // Adicionar à lista de sensores conectados
      this.connectedSensors.push(sensor);
      
      // Emitir evento de sensor conectado
      this.eventBus.emit('devices:sensor-connected', { sensor });
      
      this.scanning = false;
      return [sensor];
    } catch (error) {
      console.error('Failed to scan for sensors:', error);
      this.scanning = false;
      
      // Emitir evento de erro
      this.eventBus.emit('devices:scan-error', { error });
      
      throw error;
    }
  }

  /**
   * Processar dispositivo Bluetooth encontrado
   * @param {BluetoothDevice} device - Dispositivo Bluetooth
   * @param {BluetoothRemoteGATTServer} server - Servidor GATT
   * @returns {Promise<Object>} - Sensor processado
   * @private
   */
  async _processBleDevice(device, server) {
    // Determinar tipo de sensor
    let type = 'unknown';
    let service = null;
    
    try {
      // Verificar serviços disponíveis
      if (await server.getPrimaryService('heart_rate')) {
        type = 'heart_rate';
        service = await server.getPrimaryService('heart_rate');
      } else if (await server.getPrimaryService('cycling_power')) {
        type = 'power';
        service = await server.getPrimaryService('cycling_power');
      } else if (await server.getPrimaryService('cycling_speed_and_cadence')) {
        type = 'cadence';
        service = await server.getPrimaryService('cycling_speed_and_cadence');
      } else if (await server.getPrimaryService('running_speed_and_cadence')) {
        type = 'foot_pod';
        service = await server.getPrimaryService('running_speed_and_cadence');
      }
    } catch (error) {
      console.warn('Error determining sensor type:', error);
    }
    
    // Criar objeto do sensor
    const sensor = {
      id: device.id,
      name: device.name || `Sensor ${type}`,
      type,
      connected: true,
      device,
      server,
      service
    };
    
    // Iniciar monitoramento se o serviço estiver disponível
    if (service && this.config.realTimeDataEnabled) {
      this._startSensorMonitoring(sensor);
    }
    
    return sensor;
  }

  /**
   * Iniciar monitoramento de sensor
   * @param {Object} sensor - Sensor a ser monitorado
   * @private
   */
  async _startSensorMonitoring(sensor) {
    try {
      let characteristic = null;
      
      // Obter característica apropriada com base no tipo
      switch (sensor.type) {
        case 'heart_rate':
          characteristic = await sensor.service.getCharacteristic('heart_rate_measurement');
          break;
        case 'power':
          characteristic = await sensor.service.getCharacteristic('cycling_power_measurement');
          break;
        case 'cadence':
          characteristic = await sensor.service.getCharacteristic('csc_measurement');
          break;
        case 'foot_pod':
          characteristic = await sensor.service.getCharacteristic('rsc_measurement');
          break;
      }
      
      if (!characteristic) {
        return;
      }
      
      // Iniciar notificações
      await characteristic.startNotifications();
      
      // Adicionar listener para notificações
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        this._handleSensorData(sensor, value);
      });
      
      // Salvar característica no sensor
      sensor.characteristic = characteristic;
    } catch (error) {
      console.error(`Failed to start monitoring sensor ${sensor.id}:`, error);
    }
  }

  /**
   * Manipular dados recebidos de um sensor
   * @param {Object} sensor - Sensor que enviou os dados
   * @param {DataView} dataView - Dados recebidos
   * @private
   */
  _handleSensorData(sensor, dataView) {
    try {
      let value = null;
      let unit = '';
      
      // Processar dados com base no tipo de sensor
      switch (sensor.type) {
        case 'heart_rate':
          // Primeiro byte contém flags
          const flags = dataView.getUint8(0);
          // Verificar formato (16 bits ou 8 bits)
          const isFormat16Bits = (flags & 0x1) !== 0;
          // Obter valor da frequência cardíaca
          value = isFormat16Bits ? dataView.getUint16(1, true) : dataView.getUint8(1);
          unit = 'bpm';
          break;
          
        case 'power':
          // Bytes 2-3 contêm o valor de potência instantânea
          value = dataView.getUint16(2, true);
          unit = 'W';
          break;
          
        // Implementar outros tipos conforme necessário
      }
      
      if (value !== null) {
        // Criar evento com os dados do sensor
        const event = new CustomEvent('sensorData', {
          detail: {
            sensorId: sensor.id,
            type: sensor.type,
            value,
            unit,
            timestamp: new Date()
          }
        });
        
        // Disparar evento
        document.dispatchEvent(event);
      }
    } catch (error) {
      console.error(`Error processing sensor data for ${sensor.id}:`, error);
    }
  }

  /**
   * Desconectar sensor
   * @param {String} sensorId - ID do sensor
   * @returns {Promise<Boolean>} - Verdadeiro se desconectado com sucesso
   */
  async disconnectSensor(sensorId) {
    try {
      // Encontrar sensor
      const sensor = this.connectedSensors.find(s => s.id === sensorId);
      
      if (!sensor) {
        throw new Error(`Sensor ${sensorId} not found`);
      }
      
      // Parar notificações se estiver monitorando
      if (sensor.characteristic) {
        await sensor.characteristic.stopNotifications();
      }
      
      // Desconectar GATT
      if (sensor.device && sensor.device.gatt.connected) {
        sensor.device.gatt.disconnect();
      }
      
      // Remover da lista de sensores conectados
      this.connectedSensors = this.connectedSensors.filter(s => s.id !== sensorId);
      
      // Emitir evento
      this.eventBus.emit('devices:sensor-disconnected', { sensorId });
      
      return true;
    } catch (error) {
      console.error(`Failed to disconnect sensor ${sensorId}:`, error);
      throw error;
    }
  }

  /**
   * Inicializar listeners para eventos de dispositivos
   * @private
   */
  _initEventListeners() {
    // Listener para desconexão de dispositivo Bluetooth
    if (this.bluetoothAvailable) {
      navigator.bluetooth.addEventListener('advertisementreceived', (event) => {
        console.log('BLE advertisement received:', event);
      });
    }
  }

  /**
   * Iniciar sincronização automática
   * @private
   */
  _startAutoSync() {
    // Limpar intervalo existente
    this._stopAutoSync();
    
    // Criar novo intervalo
    this.autoSyncInterval = setInterval(() => {
      this.syncAll().catch(error => {
        console.error('Auto-sync failed:', error);
      });
    }, this.config.syncInterval);
  }

  /**
   * Parar sincronização automática
   * @private
   */
  _stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }
}
