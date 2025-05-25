/**
 * Serviço de integração com dispositivos para FuseLabs
 *
 * Este módulo gerencia a conexão e sincronização com diversos
 * dispositivos e plataformas de monitoramento de atividades físicas.
 */

class DeviceIntegrationService {
  constructor() {
    // Dispositivos suportados
    this.supportedDevices = [
      {
        id: 'garmin',
        name: 'Garmin',
        icon: 'fa-watch',
        color: '#00A9E0',
        connected: false,
        authUrl: 'https://connect.garmin.com/oauthConfirm',
        scopes: ['activity:read', 'profile:read'],
        apiEndpoint: 'https://api.garmin.com/connect/v1',
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'elevation', 'cadence', 'stress', 'bloodOxygen'],
        deviceTypes: ['smartwatch', 'bike_computer', 'heart_rate_monitor']
      },
      {
        id: 'fitbit',
        name: 'Fitbit',
        icon: 'fa-heartbeat',
        color: '#00B0B9',
        connected: false,
        authUrl: 'https://www.fitbit.com/oauth2/authorize',
        scopes: ['activity', 'heartrate', 'profile'],
        apiEndpoint: 'https://api.fitbit.com/1',
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'elevation', 'stress', 'bloodOxygen'],
        deviceTypes: ['smartwatch', 'fitness_tracker']
      },
      {
        id: 'polar',
        name: 'Polar',
        icon: 'fa-snowflake',
        color: '#D40029',
        connected: false,
        authUrl: 'https://flow.polar.com/oauth2/authorization',
        scopes: ['accesslink.read_all'],
        apiEndpoint: 'https://www.polaraccesslink.com/v3',
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'elevation', 'cadence', 'power', 'runningIndex'],
        deviceTypes: ['smartwatch', 'heart_rate_monitor', 'bike_computer']
      },
      {
        id: 'strava',
        name: 'Strava',
        icon: 'fa-person-running',
        color: '#FC4C02',
        connected: false,
        authUrl: 'https://www.strava.com/oauth/authorize',
        scopes: ['read_all', 'activity:read_all'],
        apiEndpoint: 'https://www.strava.com/api/v3',
        capabilities: ['distance', 'calories', 'elevation', 'cadence', 'power', 'heartRate'],
        deviceTypes: ['app', 'service']
      },
      {
        id: 'apple_health',
        name: 'Apple Health',
        icon: 'fa-apple',
        color: '#FF2D55',
        connected: false,
        authUrl: null, // Requer integração nativa
        scopes: [],
        apiEndpoint: null,
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'elevation', 'bloodOxygen', 'bloodPressure', 'bloodGlucose'],
        deviceTypes: ['app', 'service']
      },
      {
        id: 'google_fit',
        name: 'Google Fit',
        icon: 'fa-heart',
        color: '#4285F4',
        connected: false,
        authUrl: 'https://accounts.google.com/o/oauth2/auth',
        scopes: ['https://www.googleapis.com/auth/fitness.activity.read'],
        apiEndpoint: 'https://www.googleapis.com/fitness/v1/users/me',
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'weight'],
        deviceTypes: ['app', 'service']
      },
      {
        id: 'suunto',
        name: 'Suunto',
        icon: 'fa-compass',
        color: '#0082C3',
        connected: false,
        authUrl: 'https://cloudapi-oauth.suunto.com/oauth/authorize',
        scopes: ['workout', 'profile'],
        apiEndpoint: 'https://cloudapi.suunto.com/v2',
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'elevation', 'cadence'],
        deviceTypes: ['smartwatch', 'dive_computer']
      },
      {
        id: 'samsung_health',
        name: 'Samsung Health',
        icon: 'fa-heart-pulse',
        color: '#1428A0',
        connected: false,
        authUrl: null, // Requer integração nativa
        scopes: [],
        apiEndpoint: null,
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'stress', 'bloodOxygen', 'bloodPressure'],
        deviceTypes: ['app', 'service', 'smartwatch']
      },
      {
        id: 'wahoo',
        name: 'Wahoo',
        icon: 'fa-bicycle',
        color: '#00A5E0',
        connected: false,
        authUrl: 'https://api.wahooligan.com/oauth/authorize',
        scopes: ['user_read', 'workouts_read'],
        apiEndpoint: 'https://api.wahooligan.com/v1',
        capabilities: ['heartRate', 'cadence', 'power', 'distance', 'speed'],
        deviceTypes: ['bike_computer', 'heart_rate_monitor', 'smart_trainer']
      },
      {
        id: 'zwift',
        name: 'Zwift',
        icon: 'fa-mountain',
        color: '#FF6B00',
        connected: false,
        authUrl: 'https://secure.zwift.com/auth/realms/zwift/protocol/openid-connect/auth',
        scopes: ['profile:read', 'activity:read'],
        apiEndpoint: 'https://us-or-rapp.zwift.com/api',
        capabilities: ['heartRate', 'cadence', 'power', 'distance', 'speed', 'elevation'],
        deviceTypes: ['app', 'service', 'smart_trainer']
      },
      {
        id: 'coros',
        name: 'COROS',
        icon: 'fa-stopwatch',
        color: '#FF5A00',
        connected: false,
        authUrl: 'https://api.coros.com/oauth/authorize',
        scopes: ['activity:read', 'user:read'],
        apiEndpoint: 'https://api.coros.com/v1',
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'elevation', 'cadence', 'runningPower'],
        deviceTypes: ['smartwatch']
      },
      {
        id: 'huawei_health',
        name: 'Huawei Health',
        icon: 'fa-mobile-screen',
        color: '#CF0A2C',
        connected: false,
        authUrl: 'https://oauth-login.cloud.huawei.com/oauth2/v3/authorize',
        scopes: ['https://www.huawei.com/health/profile.readonly', 'https://www.huawei.com/health/activity.readonly'],
        apiEndpoint: 'https://health-api.cloud.huawei.com/healthkit',
        capabilities: ['heartRate', 'steps', 'distance', 'calories', 'sleep', 'stress', 'bloodOxygen'],
        deviceTypes: ['smartwatch', 'fitness_tracker', 'app']
      }
    ];

    // Sensores suportados
    this.supportedSensors = [
      {
        id: 'bluetooth_heart_rate',
        name: 'Bluetooth Heart Rate Monitor',
        icon: 'fa-heartbeat',
        type: 'heart_rate',
        connectionType: 'bluetooth',
        serviceUUID: '0x180D',
        characteristicUUID: '0x2A37'
      },
      {
        id: 'bluetooth_cadence',
        name: 'Bluetooth Cadence Sensor',
        icon: 'fa-gauge-high',
        type: 'cadence',
        connectionType: 'bluetooth',
        serviceUUID: '0x1816',
        characteristicUUID: '0x2A5B'
      },
      {
        id: 'bluetooth_power',
        name: 'Bluetooth Power Meter',
        icon: 'fa-bolt',
        type: 'power',
        connectionType: 'bluetooth',
        serviceUUID: '0x1818',
        characteristicUUID: '0x2A63'
      },
      {
        id: 'bluetooth_speed',
        name: 'Bluetooth Speed Sensor',
        icon: 'fa-tachometer-alt',
        type: 'speed',
        connectionType: 'bluetooth',
        serviceUUID: '0x1816',
        characteristicUUID: '0x2A5B'
      },
      {
        id: 'bluetooth_foot_pod',
        name: 'Bluetooth Foot Pod',
        icon: 'fa-shoe-prints',
        type: 'foot_pod',
        connectionType: 'bluetooth',
        serviceUUID: '0x1814',
        characteristicUUID: '0x2A53'
      }
    ];

    // Estado de conexão
    this.connections = {};

    // Estado dos sensores
    this.sensors = {
      connected: [],
      scanning: false,
      available: []
    };

    // Configurações
    this.config = {
      syncInterval: 30, // minutos
      autoSync: true,
      preferredDevice: null,
      mergeStrategy: 'most_complete', // 'most_recent', 'manual'
      bluetoothEnabled: true,
      antEnabled: false,
      realTimeDataEnabled: true,
      dataProcessing: {
        heartRateZones: true,
        powerZones: true,
        paceCalculation: true,
        calorieEstimation: true,
        trainingLoad: true,
        recoveryTime: true
      }
    };

    // Inicializar
    this.init();
  }

  /**
   * Inicializar o serviço de integração
   */
  async init() {
    try {
      // Carregar conexões salvas
      await this.loadConnections();

      // Carregar configurações
      await this.loadConfig();

      // Configurar sincronização automática
      if (this.config.autoSync) {
        this.setupAutoSync();
      }

      console.log('Serviço de integração com dispositivos inicializado');
    } catch (error) {
      console.error('Erro ao inicializar serviço de integração:', error);
    }
  }

  /**
   * Carregar conexões salvas
   */
  async loadConnections() {
    try {
      const savedConnections = localStorage.getItem('device_connections');

      if (savedConnections) {
        this.connections = JSON.parse(savedConnections);

        // Atualizar estado de conexão dos dispositivos
        this.supportedDevices.forEach(device => {
          device.connected = !!this.connections[device.id];
        });
      }
    } catch (error) {
      console.error('Erro ao carregar conexões:', error);
    }
  }

  /**
   * Carregar configurações
   */
  async loadConfig() {
    try {
      const savedConfig = localStorage.getItem('device_integration_config');

      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }

  /**
   * Salvar configurações
   */
  async saveConfig() {
    try {
      localStorage.setItem('device_integration_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  }

  /**
   * Configurar sincronização automática
   */
  setupAutoSync() {
    // Limpar intervalo existente
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Configurar novo intervalo
    const intervalMs = this.config.syncInterval * 60 * 1000;
    this.syncInterval = setInterval(() => this.syncAll(), intervalMs);

    console.log(`Sincronização automática configurada a cada ${this.config.syncInterval} minutos`);
  }

  /**
   * Obter dispositivos suportados
   * @returns {Array} Lista de dispositivos suportados
   */
  getSupportedDevices() {
    return this.supportedDevices;
  }

  /**
   * Obter dispositivos conectados
   * @returns {Array} Lista de dispositivos conectados
   */
  getConnectedDevices() {
    return this.supportedDevices.filter(device => device.connected);
  }

  /**
   * Iniciar processo de conexão com dispositivo
   * @param {String} deviceId - ID do dispositivo
   * @returns {Promise} - Promessa resolvida quando a conexão for iniciada
   */
  async connectDevice(deviceId) {
    try {
      const device = this.supportedDevices.find(d => d.id === deviceId);

      if (!device) {
        throw new Error(`Dispositivo não suportado: ${deviceId}`);
      }

      if (device.connected) {
        console.log(`Dispositivo já conectado: ${device.name}`);
        return;
      }

      // Dispositivos que requerem integração nativa
      if (!device.authUrl) {
        if (device.id === 'apple_health') {
          this.showAppleHealthInstructions();
        } else if (device.id === 'samsung_health') {
          this.showSamsungHealthInstructions();
        }
        return;
      }

      // Iniciar fluxo OAuth para dispositivos suportados
      const clientId = this.getClientId(device.id);
      const redirectUri = `${window.location.origin}/device-callback.html`;
      const state = this.generateState();

      // Salvar estado para validação posterior
      localStorage.setItem('device_auth_state', state);
      localStorage.setItem('device_auth_id', device.id);

      // Construir URL de autorização
      let authUrl = `${device.authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&response_type=code`;

      // Adicionar escopos se necessário
      if (device.scopes && device.scopes.length > 0) {
        authUrl += `&scope=${encodeURIComponent(device.scopes.join(' '))}`;
      }

      // Abrir janela de autorização
      window.open(authUrl, 'deviceAuth', 'width=600,height=700');

      console.log(`Iniciando conexão com ${device.name}`);
    } catch (error) {
      console.error(`Erro ao conectar dispositivo ${deviceId}:`, error);
      throw error;
    }
  }

  /**
   * Finalizar processo de conexão com dispositivo
   * @param {String} code - Código de autorização
   * @param {String} state - Estado para validação
   * @returns {Promise} - Promessa resolvida quando a conexão for finalizada
   */
  async finalizeConnection(code, state) {
    try {
      // Verificar estado
      const savedState = localStorage.getItem('device_auth_state');
      const deviceId = localStorage.getItem('device_auth_id');

      if (state !== savedState) {
        throw new Error('Estado inválido, possível ataque CSRF');
      }

      const device = this.supportedDevices.find(d => d.id === deviceId);

      if (!device) {
        throw new Error(`Dispositivo não encontrado: ${deviceId}`);
      }

      // Em um ambiente real, trocaríamos o código por um token de acesso
      // Para fins de demonstração, simulamos uma conexão bem-sucedida

      // Simular troca de código por token
      const token = this.simulateTokenExchange(code, device.id);

      // Salvar conexão
      this.connections[device.id] = {
        token,
        connected: true,
        connectedAt: new Date().toISOString(),
        lastSync: null
      };

      // Atualizar estado do dispositivo
      device.connected = true;

      // Salvar conexões
      localStorage.setItem('device_connections', JSON.stringify(this.connections));

      // Limpar estado de autorização
      localStorage.removeItem('device_auth_state');
      localStorage.removeItem('device_auth_id');

      console.log(`Conexão com ${device.name} finalizada com sucesso`);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast(`Conexão com ${device.name} realizada com sucesso!`, 'success');
      }

      return device;
    } catch (error) {
      console.error('Erro ao finalizar conexão:', error);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Erro ao conectar dispositivo. Tente novamente.', 'error');
      }

      throw error;
    }
  }

  /**
   * Desconectar dispositivo
   * @param {String} deviceId - ID do dispositivo
   * @returns {Promise} - Promessa resolvida quando o dispositivo for desconectado
   */
  async disconnectDevice(deviceId) {
    try {
      const device = this.supportedDevices.find(d => d.id === deviceId);

      if (!device) {
        throw new Error(`Dispositivo não suportado: ${deviceId}`);
      }

      if (!device.connected) {
        console.log(`Dispositivo já desconectado: ${device.name}`);
        return;
      }

      // Remover conexão
      delete this.connections[device.id];

      // Atualizar estado do dispositivo
      device.connected = false;

      // Salvar conexões
      localStorage.setItem('device_connections', JSON.stringify(this.connections));

      console.log(`Dispositivo ${device.name} desconectado com sucesso`);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast(`${device.name} desconectado com sucesso`, 'success');
      }

      return device;
    } catch (error) {
      console.error(`Erro ao desconectar dispositivo ${deviceId}:`, error);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Erro ao desconectar dispositivo', 'error');
      }

      throw error;
    }
  }

  /**
   * Sincronizar dados de todos os dispositivos conectados
   * @returns {Promise} - Promessa resolvida quando a sincronização for concluída
   */
  async syncAll() {
    try {
      const connectedDevices = this.getConnectedDevices();

      if (connectedDevices.length === 0) {
        console.log('Nenhum dispositivo conectado para sincronizar');
        return [];
      }

      console.log(`Iniciando sincronização de ${connectedDevices.length} dispositivos`);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Sincronizando dados de dispositivos...', 'info');
      }

      // Sincronizar cada dispositivo
      const results = await Promise.all(
        connectedDevices.map(device => this.syncDevice(device.id))
      );

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Sincronização concluída com sucesso!', 'success');
      }

      return results;
    } catch (error) {
      console.error('Erro ao sincronizar dispositivos:', error);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Erro ao sincronizar dispositivos', 'error');
      }

      throw error;
    }
  }

  /**
   * Escanear por sensores Bluetooth disponíveis
   * @param {String} type - Tipo de sensor (opcional)
   * @returns {Promise<Array>} - Lista de sensores encontrados
   */
  async scanForSensors(type = null) {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth não suportado neste navegador');
      }

      if (this.sensors.scanning) {
        console.log('Já existe um escaneamento em andamento');
        return [];
      }

      console.log('Iniciando escaneamento de sensores Bluetooth...');
      this.sensors.scanning = true;

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Procurando sensores Bluetooth...', 'info');
      }

      // Filtrar por tipo de sensor, se especificado
      let filters = [];

      if (type) {
        const sensorsByType = this.supportedSensors.filter(s => s.type === type);

        if (sensorsByType.length > 0) {
          filters = sensorsByType.map(sensor => ({
            services: [sensor.serviceUUID]
          }));
        }
      } else {
        // Incluir todos os tipos de sensores suportados
        filters = this.supportedSensors.map(sensor => ({
          services: [sensor.serviceUUID]
        }));
      }

      // Opções de escaneamento
      const options = {
        filters: filters,
        optionalServices: []
      };

      // Iniciar escaneamento
      const device = await navigator.bluetooth.requestDevice(options);

      // Adicionar dispositivo encontrado à lista
      if (device) {
        const sensorType = this.getSensorTypeFromDevice(device);

        const sensor = {
          id: device.id || `sensor-${Date.now()}`,
          name: device.name || 'Sensor Desconhecido',
          device: device,
          type: sensorType,
          connected: false,
          lastSeen: new Date().toISOString()
        };

        // Verificar se o sensor já está na lista
        const existingIndex = this.sensors.available.findIndex(s => s.id === sensor.id);

        if (existingIndex >= 0) {
          // Atualizar sensor existente
          this.sensors.available[existingIndex] = sensor;
        } else {
          // Adicionar novo sensor
          this.sensors.available.push(sensor);
        }

        console.log(`Sensor encontrado: ${sensor.name} (${sensor.type || 'tipo desconhecido'})`);
      }

      this.sensors.scanning = false;

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast(`${this.sensors.available.length} sensores encontrados`, 'success');
      }

      return this.sensors.available;
    } catch (error) {
      console.error('Erro ao escanear sensores:', error);
      this.sensors.scanning = false;

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Erro ao procurar sensores', 'error');
      }

      return [];
    }
  }

  /**
   * Conectar a um sensor Bluetooth
   * @param {String} sensorId - ID do sensor
   * @returns {Promise<Object>} - Informações do sensor conectado
   */
  async connectToSensor(sensorId) {
    try {
      const sensor = this.sensors.available.find(s => s.id === sensorId);

      if (!sensor) {
        throw new Error(`Sensor não encontrado: ${sensorId}`);
      }

      if (sensor.connected) {
        console.log(`Sensor já conectado: ${sensor.name}`);
        return sensor;
      }

      console.log(`Conectando ao sensor ${sensor.name}...`);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast(`Conectando ao sensor ${sensor.name}...`, 'info');
      }

      // Conectar ao dispositivo
      const server = await sensor.device.gatt.connect();

      // Obter serviço apropriado com base no tipo de sensor
      const sensorDef = this.getSensorDefinition(sensor.type);

      if (!sensorDef) {
        throw new Error(`Definição de sensor não encontrada para o tipo: ${sensor.type}`);
      }

      const service = await server.getPrimaryService(sensorDef.serviceUUID);
      const characteristic = await service.getCharacteristic(sensorDef.characteristicUUID);

      // Iniciar notificações
      await characteristic.startNotifications();

      // Configurar listener para dados
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const value = event.target.value;
        this.handleSensorData(sensor, value);
      });

      // Atualizar estado do sensor
      sensor.connected = true;
      sensor.server = server;
      sensor.service = service;
      sensor.characteristic = characteristic;
      sensor.connectedAt = new Date().toISOString();

      // Adicionar à lista de sensores conectados
      const existingIndex = this.sensors.connected.findIndex(s => s.id === sensor.id);

      if (existingIndex >= 0) {
        // Atualizar sensor existente
        this.sensors.connected[existingIndex] = sensor;
      } else {
        // Adicionar novo sensor
        this.sensors.connected.push(sensor);
      }

      console.log(`Sensor ${sensor.name} conectado com sucesso`);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast(`Sensor ${sensor.name} conectado com sucesso`, 'success');
      }

      return sensor;
    } catch (error) {
      console.error(`Erro ao conectar ao sensor ${sensorId}:`, error);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Erro ao conectar ao sensor', 'error');
      }

      throw error;
    }
  }

  /**
   * Desconectar de um sensor
   * @param {String} sensorId - ID do sensor
   * @returns {Promise<Boolean>} - Verdadeiro se desconectado com sucesso
   */
  async disconnectSensor(sensorId) {
    try {
      const sensorIndex = this.sensors.connected.findIndex(s => s.id === sensorId);

      if (sensorIndex < 0) {
        console.log(`Sensor não conectado: ${sensorId}`);
        return true;
      }

      const sensor = this.sensors.connected[sensorIndex];
      console.log(`Desconectando do sensor ${sensor.name}...`);

      // Parar notificações, se possível
      if (sensor.characteristic && typeof sensor.characteristic.stopNotifications === 'function') {
        await sensor.characteristic.stopNotifications();
      }

      // Desconectar do dispositivo
      if (sensor.device && sensor.device.gatt && sensor.device.gatt.connected) {
        sensor.device.gatt.disconnect();
      }

      // Atualizar estado do sensor
      sensor.connected = false;
      sensor.server = null;
      sensor.service = null;
      sensor.characteristic = null;

      // Remover da lista de sensores conectados
      this.sensors.connected.splice(sensorIndex, 1);

      // Atualizar na lista de sensores disponíveis
      const availableIndex = this.sensors.available.findIndex(s => s.id === sensorId);

      if (availableIndex >= 0) {
        this.sensors.available[availableIndex].connected = false;
      }

      console.log(`Sensor ${sensor.name} desconectado com sucesso`);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast(`Sensor ${sensor.name} desconectado`, 'success');
      }

      return true;
    } catch (error) {
      console.error(`Erro ao desconectar sensor ${sensorId}:`, error);

      // Mostrar feedback ao usuário
      if (typeof showToast === 'function') {
        showToast('Erro ao desconectar sensor', 'error');
      }

      return false;
    }
  }

  /**
   * Processar dados recebidos de um sensor
   * @param {Object} sensor - Sensor
   * @param {DataView} value - Valor recebido
   */
  handleSensorData(sensor, value) {
    try {
      // Processar dados com base no tipo de sensor
      let data = null;

      switch (sensor.type) {
        case 'heart_rate':
          data = this.parseHeartRateData(value);
          break;
        case 'cadence':
          data = this.parseCadenceData(value);
          break;
        case 'power':
          data = this.parsePowerData(value);
          break;
        case 'speed':
          data = this.parseSpeedData(value);
          break;
        case 'foot_pod':
          data = this.parseFootPodData(value);
          break;
        default:
          console.warn(`Tipo de sensor desconhecido: ${sensor.type}`);
          return;
      }

      if (!data) return;

      // Adicionar metadados
      data.sensorId = sensor.id;
      data.sensorName = sensor.name;
      data.sensorType = sensor.type;
      data.timestamp = new Date().toISOString();

      // Disparar evento com os dados
      const event = new CustomEvent('sensorData', { detail: data });
      document.dispatchEvent(event);

      // Armazenar dados mais recentes no sensor
      sensor.lastData = data;

      // Atualizar UI, se necessário
      this.updateSensorUI(sensor, data);
    } catch (error) {
      console.error('Erro ao processar dados do sensor:', error);
    }
  }

  /**
   * Analisar dados de frequência cardíaca
   * @param {DataView} value - Valor recebido
   * @returns {Object} - Dados analisados
   */
  parseHeartRateData(value) {
    // Verificar se o valor é válido
    if (!value || value.byteLength < 2) return null;

    // Primeiro byte contém flags
    const flags = value.getUint8(0);

    // Verificar formato do valor (16 bits ou 8 bits)
    const isFormat16Bits = (flags & 0x01) === 0x01;

    // Obter valor da frequência cardíaca
    let heartRate;
    if (isFormat16Bits) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }

    // Verificar se o valor é razoável
    if (heartRate < 30 || heartRate > 240) {
      console.warn(`Valor de frequência cardíaca fora do intervalo esperado: ${heartRate}`);
      return null;
    }

    return {
      type: 'heart_rate',
      value: heartRate,
      unit: 'bpm'
    };
  }

  /**
   * Analisar dados de cadência
   * @param {DataView} value - Valor recebido
   * @returns {Object} - Dados analisados
   */
  parseCadenceData(value) {
    // Implementação simplificada
    // Em um ambiente real, a análise seria mais complexa

    // Verificar se o valor é válido
    if (!value || value.byteLength < 2) return null;

    // Extrair cadência (simplificado)
    const cadence = value.getUint16(0, true);

    // Verificar se o valor é razoável
    if (cadence > 300) {
      console.warn(`Valor de cadência fora do intervalo esperado: ${cadence}`);
      return null;
    }

    return {
      type: 'cadence',
      value: cadence,
      unit: 'rpm'
    };
  }

  /**
   * Analisar dados de potência
   * @param {DataView} value - Valor recebido
   * @returns {Object} - Dados analisados
   */
  parsePowerData(value) {
    // Implementação simplificada
    // Em um ambiente real, a análise seria mais complexa

    // Verificar se o valor é válido
    if (!value || value.byteLength < 2) return null;

    // Extrair potência (simplificado)
    const power = value.getUint16(0, true);

    // Verificar se o valor é razoável
    if (power > 3000) {
      console.warn(`Valor de potência fora do intervalo esperado: ${power}`);
      return null;
    }

    return {
      type: 'power',
      value: power,
      unit: 'watts'
    };
  }

  /**
   * Analisar dados de velocidade
   * @param {DataView} value - Valor recebido
   * @returns {Object} - Dados analisados
   */
  parseSpeedData(value) {
    // Implementação simplificada
    // Em um ambiente real, a análise seria mais complexa

    // Verificar se o valor é válido
    if (!value || value.byteLength < 2) return null;

    // Extrair velocidade (simplificado)
    const speed = value.getUint16(0, true) / 100; // Converter para m/s

    // Verificar se o valor é razoável
    if (speed > 30) {
      console.warn(`Valor de velocidade fora do intervalo esperado: ${speed}`);
      return null;
    }

    return {
      type: 'speed',
      value: speed,
      unit: 'm/s'
    };
  }

  /**
   * Analisar dados de foot pod
   * @param {DataView} value - Valor recebido
   * @returns {Object} - Dados analisados
   */
  parseFootPodData(value) {
    // Implementação simplificada
    // Em um ambiente real, a análise seria mais complexa

    // Verificar se o valor é válido
    if (!value || value.byteLength < 4) return null;

    // Extrair cadência (simplificado)
    const cadence = value.getUint8(0);

    // Extrair comprimento do passo (simplificado)
    const strideLength = value.getUint16(1, true) / 100; // Converter para metros

    return {
      type: 'foot_pod',
      cadence: cadence,
      strideLength: strideLength,
      unit: {
        cadence: 'spm',
        strideLength: 'm'
      }
    };
  }

  /**
   * Atualizar UI com dados do sensor
   * @param {Object} sensor - Sensor
   * @param {Object} data - Dados do sensor
   */
  updateSensorUI(sensor, data) {
    // Buscar elemento de UI para o sensor, se existir
    const sensorElement = document.querySelector(`[data-sensor-id="${sensor.id}"]`);

    if (!sensorElement) return;

    // Atualizar valor exibido
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
   * Obter definição de sensor pelo tipo
   * @param {String} type - Tipo de sensor
   * @returns {Object|null} - Definição do sensor ou null
   */
  getSensorDefinition(type) {
    return this.supportedSensors.find(s => s.type === type) || null;
  }

  /**
   * Determinar tipo de sensor a partir do dispositivo Bluetooth
   * @param {BluetoothDevice} device - Dispositivo Bluetooth
   * @returns {String|null} - Tipo de sensor ou null
   */
  getSensorTypeFromDevice(device) {
    // Verificar serviços anunciados
    if (!device || !device.gatt) return null;

    // Tentar determinar pelo nome
    const name = device.name || '';

    if (name.toLowerCase().includes('heart') || name.toLowerCase().includes('hr')) {
      return 'heart_rate';
    }

    if (name.toLowerCase().includes('cadence')) {
      return 'cadence';
    }

    if (name.toLowerCase().includes('power')) {
      return 'power';
    }

    if (name.toLowerCase().includes('speed')) {
      return 'speed';
    }

    if (name.toLowerCase().includes('foot') || name.toLowerCase().includes('pod')) {
      return 'foot_pod';
    }

    // Tipo desconhecido
    return null;
  }

  /**
   * Obter sensores conectados
   * @returns {Array} - Lista de sensores conectados
   */
  getConnectedSensors() {
    return [...this.sensors.connected];
  }

  /**
   * Obter sensores disponíveis
   * @returns {Array} - Lista de sensores disponíveis
   */
  getAvailableSensors() {
    return [...this.sensors.available];
  }

  // Métodos auxiliares e simulações para demonstração

  /**
   * Gerar estado para fluxo OAuth
   * @returns {String} - Estado aleatório
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Obter client ID para o dispositivo
   * @param {String} deviceId - ID do dispositivo
   * @returns {String} - Client ID
   */
  getClientId(deviceId) {
    // Em um ambiente real, esses IDs seriam armazenados de forma segura
    const clientIds = {
      garmin: 'garmin-client-id',
      fitbit: 'fitbit-client-id',
      polar: 'polar-client-id',
      strava: 'strava-client-id',
      google_fit: 'google-client-id',
      suunto: 'suunto-client-id'
    };

    return clientIds[deviceId] || 'default-client-id';
  }

  /**
   * Simular troca de código por token
   * @param {String} code - Código de autorização
   * @param {String} deviceId - ID do dispositivo
   * @returns {Object} - Token simulado
   */
  simulateTokenExchange(code, deviceId) {
    return {
      access_token: `simulated-token-${deviceId}-${Date.now()}`,
      refresh_token: `simulated-refresh-${deviceId}-${Date.now()}`,
      expires_in: 3600,
      token_type: 'Bearer'
    };
  }
}

// Criar instância global
const deviceIntegration = new DeviceIntegrationService();
