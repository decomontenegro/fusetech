// Funcionalidades para a página de dispositivos

// Classe para gerenciar dispositivos
class DevicesManager {
  constructor() {
    this.devices = [];
    this.availableDevices = [];
    
    // Elementos da UI
    this.connectedDevicesContainer = document.getElementById('connected-devices');
    
    // Botões
    this.addDeviceBtn = document.getElementById('add-device-btn');
    this.connectDeviceBtn = document.getElementById('connect-device-btn');
    this.cancelAddDeviceBtn = document.getElementById('cancel-add-device-btn');
    
    // Modal
    this.addDeviceModal = document.getElementById('add-device-modal');
    this.deviceTypeSelect = document.getElementById('device-type');
    this.deviceBrandSelect = document.getElementById('device-brand');
    this.deviceModelInput = document.getElementById('device-model');
    this.syncActivitiesCheckbox = document.getElementById('sync-activities');
    
    this.init();
  }
  
  init() {
    // Carregar dispositivos conectados
    this.loadConnectedDevices();
    
    // Configurar eventos
    this.setupEventListeners();
  }
  
  loadConnectedDevices() {
    // Em um ambiente real, isso seria uma chamada de API
    // Para fins de demonstração, usaremos dados simulados
    
    // Dados já estão no HTML para este exemplo
    
    // Configurar botões de sincronização
    const syncButtons = document.querySelectorAll('button:has(i.fas.fa-sync-alt)');
    syncButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const deviceElement = e.target.closest('.p-6');
        const deviceName = deviceElement.querySelector('h4').textContent;
        this.syncDevice(deviceName);
      });
    });
    
    // Configurar botões de configurações
    const configButtons = document.querySelectorAll('button:has(i.fas.fa-cog)');
    configButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const deviceElement = e.target.closest('.p-6');
        const deviceName = deviceElement.querySelector('h4').textContent;
        this.configureDevice(deviceName);
      });
    });
    
    // Configurar botões de desconexão
    const disconnectButtons = document.querySelectorAll('button:has(i.fas.fa-unlink)');
    disconnectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const deviceElement = e.target.closest('.p-6');
        const deviceName = deviceElement.querySelector('h4').textContent;
        this.disconnectDevice(deviceName);
      });
    });
  }
  
  setupEventListeners() {
    // Botão de adicionar dispositivo
    if (this.addDeviceBtn) {
      this.addDeviceBtn.addEventListener('click', () => {
        this.openAddDeviceModal();
      });
    }
    
    // Botão de conectar dispositivo
    if (this.connectDeviceBtn) {
      this.connectDeviceBtn.addEventListener('click', () => {
        this.connectNewDevice();
      });
    }
    
    // Botão de cancelar adição
    if (this.cancelAddDeviceBtn) {
      this.cancelAddDeviceBtn.addEventListener('click', () => {
        this.closeAddDeviceModal();
      });
    }
    
    // Botões de conectar na lista de dispositivos disponíveis
    const connectButtons = document.querySelectorAll('.divide-y.divide-gray-200 button');
    connectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const deviceElement = e.target.closest('.p-4');
        const deviceName = deviceElement.querySelector('h4').textContent;
        this.openAddDeviceModal(deviceName);
      });
    });
  }
  
  openAddDeviceModal(deviceName = '') {
    if (!this.addDeviceModal) return;
    
    // Resetar formulário
    this.deviceTypeSelect.value = '';
    this.deviceBrandSelect.value = '';
    this.deviceModelInput.value = '';
    this.syncActivitiesCheckbox.checked = true;
    
    // Preencher marca se fornecida
    if (deviceName) {
      // Mapear nome do dispositivo para marca
      const brandMap = {
        'Fitbit': 'fitbit',
        'Polar': 'polar',
        'Suunto': 'suunto',
        'Google Fit': 'other',
        'Samsung Health': 'samsung'
      };
      
      if (brandMap[deviceName]) {
        this.deviceBrandSelect.value = brandMap[deviceName];
      }
    }
    
    // Mostrar modal
    this.addDeviceModal.classList.remove('hidden');
  }
  
  closeAddDeviceModal() {
    if (!this.addDeviceModal) return;
    this.addDeviceModal.classList.add('hidden');
  }
  
  connectNewDevice() {
    // Validar formulário
    const deviceType = this.deviceTypeSelect.value;
    const deviceBrand = this.deviceBrandSelect.value;
    
    if (!deviceType || !deviceBrand) {
      alert('Por favor, selecione o tipo e a marca do dispositivo.');
      return;
    }
    
    // Em um ambiente real, isso enviaria os dados para o servidor
    // e iniciaria o processo de autenticação OAuth
    
    // Simular conexão
    this.simulateDeviceConnection(deviceType, deviceBrand);
  }
  
  simulateDeviceConnection(deviceType, deviceBrand) {
    // Fechar modal
    this.closeAddDeviceModal();
    
    // Mostrar mensagem de carregamento
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50';
    loadingMessage.id = 'loading-message';
    loadingMessage.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <div class="flex items-center">
          <i class="fas fa-spinner fa-spin text-primary text-2xl mr-3"></i>
          <p class="text-gray-700">Conectando ao dispositivo...</p>
        </div>
      </div>
    `;
    document.body.appendChild(loadingMessage);
    
    // Simular delay de conexão
    setTimeout(() => {
      // Remover mensagem de carregamento
      document.getElementById('loading-message').remove();
      
      // Mostrar mensagem de sucesso
      alert('Dispositivo conectado com sucesso! A página será recarregada para mostrar o novo dispositivo.');
      
      // Recarregar página
      window.location.reload();
    }, 2000);
  }
  
  syncDevice(deviceName) {
    // Mostrar mensagem de carregamento
    const deviceElement = Array.from(document.querySelectorAll('.p-6')).find(el => 
      el.querySelector('h4').textContent === deviceName
    );
    
    if (!deviceElement) return;
    
    const syncButton = deviceElement.querySelector('button:has(i.fas.fa-sync-alt)');
    const originalText = syncButton.innerHTML;
    
    // Desabilitar botão e mostrar spinner
    syncButton.disabled = true;
    syncButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i> Sincronizando...`;
    
    // Simular sincronização
    setTimeout(() => {
      // Restaurar botão
      syncButton.disabled = false;
      syncButton.innerHTML = originalText;
      
      // Atualizar última sincronização
      const lastSyncElement = deviceElement.querySelector('p.text-sm.text-gray-500');
      lastSyncElement.textContent = `Última sincronização: Agora mesmo`;
      
      // Mostrar mensagem de sucesso
      this.showNotification(`${deviceName} sincronizado com sucesso!`);
    }, 2000);
  }
  
  configureDevice(deviceName) {
    // Em um ambiente real, isso abriria uma página de configurações
    alert(`Configurações para ${deviceName} serão implementadas em breve.`);
  }
  
  disconnectDevice(deviceName) {
    // Confirmar desconexão
    if (confirm(`Tem certeza que deseja desconectar ${deviceName}?`)) {
      // Em um ambiente real, isso enviaria uma solicitação para o servidor
      
      // Simular desconexão
      const deviceElement = Array.from(document.querySelectorAll('.p-6')).find(el => 
        el.querySelector('h4').textContent === deviceName
      );
      
      if (!deviceElement) return;
      
      // Animar remoção
      deviceElement.style.transition = 'opacity 0.5s, transform 0.5s';
      deviceElement.style.opacity = '0';
      deviceElement.style.transform = 'translateX(20px)';
      
      setTimeout(() => {
        deviceElement.remove();
        this.showNotification(`${deviceName} desconectado com sucesso!`);
      }, 500);
    }
  }
  
  showNotification(message) {
    // Verificar se já existe uma notificação
    let notification = document.getElementById('notification');
    
    if (!notification) {
      // Criar elemento de notificação
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-20 opacity-0';
      document.body.appendChild(notification);
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
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se estamos na página de dispositivos
  if (document.body.getAttribute('data-page') === 'devices') {
    const devicesManager = new DevicesManager();
  }
});
