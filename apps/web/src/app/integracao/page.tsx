'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Switch,
  Label,
  Alert,
  AlertTitle,
  AlertDescription
} from '@fuseapp/ui';
import { useAuth } from '../../context/AuthContext';
import { 
  Smartphone, 
  Watch, 
  Link, 
  LinkOff, 
  Check, 
  X, 
  RefreshCw, 
  Settings, 
  Info, 
  AlertCircle, 
  CheckCircle,
  Bluetooth,
  Wifi,
  Footprints,
  Heart,
  Activity,
  BarChart,
  Zap,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos de dispositivos
interface Device {
  id: string;
  name: string;
  type: 'smartwatch' | 'smartphone' | 'fitness_tracker' | 'smart_scale';
  brand: string;
  model: string;
  connected: boolean;
  lastSync?: Date;
  batteryLevel?: number;
  permissions: {
    steps: boolean;
    distance: boolean;
    calories: boolean;
    heartRate: boolean;
    sleep: boolean;
    activities: boolean;
    location: boolean;
  };
}

// Tipos de serviços
interface Service {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  lastSync?: Date;
  description: string;
}

export default function IntegracaoPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('devices');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);

  // Carregar dispositivos e serviços
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Em produção, buscar da API
        // const devicesResponse = await fetch('/api/devices');
        // const servicesResponse = await fetch('/api/services');
        
        // Simulação para demonstração
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados - Dispositivos
        const mockDevices: Device[] = [
          {
            id: 'device_1',
            name: 'Apple Watch Series 7',
            type: 'smartwatch',
            brand: 'Apple',
            model: 'Watch Series 7',
            connected: true,
            lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
            batteryLevel: 68,
            permissions: {
              steps: true,
              distance: true,
              calories: true,
              heartRate: true,
              sleep: true,
              activities: true,
              location: true
            }
          },
          {
            id: 'device_2',
            name: 'iPhone 13 Pro',
            type: 'smartphone',
            brand: 'Apple',
            model: 'iPhone 13 Pro',
            connected: true,
            lastSync: new Date(Date.now() - 30 * 60 * 1000),
            batteryLevel: 82,
            permissions: {
              steps: true,
              distance: true,
              calories: true,
              heartRate: false,
              sleep: false,
              activities: true,
              location: true
            }
          },
          {
            id: 'device_3',
            name: 'Fitbit Charge 5',
            type: 'fitness_tracker',
            brand: 'Fitbit',
            model: 'Charge 5',
            connected: false,
            permissions: {
              steps: false,
              distance: false,
              calories: false,
              heartRate: false,
              sleep: false,
              activities: false,
              location: false
            }
          }
        ];
        
        // Dados simulados - Serviços
        const mockServices: Service[] = [
          {
            id: 'service_1',
            name: 'Apple Health',
            logo: '/logos/apple-health.png',
            connected: true,
            lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
            description: 'Sincronize seus dados de saúde e atividades do Apple Health.'
          },
          {
            id: 'service_2',
            name: 'Google Fit',
            logo: '/logos/google-fit.png',
            connected: false,
            description: 'Conecte-se ao Google Fit para sincronizar suas atividades físicas.'
          },
          {
            id: 'service_3',
            name: 'Strava',
            logo: '/logos/strava.png',
            connected: true,
            lastSync: new Date(Date.now() - 5 * 60 * 60 * 1000),
            description: 'Importe suas corridas, pedaladas e outras atividades do Strava.'
          },
          {
            id: 'service_4',
            name: 'Fitbit',
            logo: '/logos/fitbit.png',
            connected: false,
            description: 'Sincronize dados de atividades, sono e saúde do seu dispositivo Fitbit.'
          },
          {
            id: 'service_5',
            name: 'Garmin Connect',
            logo: '/logos/garmin.png',
            connected: false,
            description: 'Conecte-se ao Garmin Connect para importar suas atividades.'
          },
          {
            id: 'service_6',
            name: 'Samsung Health',
            logo: '/logos/samsung-health.png',
            connected: false,
            description: 'Sincronize seus dados de saúde e atividades do Samsung Health.'
          }
        ];
        
        setDevices(mockDevices);
        setServices(mockServices);
      } catch (error) {
        console.error('Erro ao carregar dados de integração:', error);
        toast.error('Não foi possível carregar os dados de integração. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Conectar dispositivo
  const handleConnectDevice = async (device: Device) => {
    setIsConnecting(true);
    
    try {
      // Em produção, chamar API
      // await fetch(`/api/devices/${device.id}/connect`, { method: 'POST' });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedDevices = devices.map(d => {
        if (d.id === device.id) {
          return {
            ...d,
            connected: true,
            lastSync: new Date(),
            permissions: {
              ...d.permissions,
              steps: true,
              distance: true,
              calories: true,
              activities: true,
              location: true
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
      toast.success(`${device.name} conectado com sucesso!`);
    } catch (error) {
      console.error('Erro ao conectar dispositivo:', error);
      toast.error(`Não foi possível conectar o ${device.name}. Tente novamente.`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Desconectar dispositivo
  const handleDisconnectDevice = async (device: Device) => {
    try {
      // Em produção, chamar API
      // await fetch(`/api/devices/${device.id}/disconnect`, { method: 'POST' });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedDevices = devices.map(d => {
        if (d.id === device.id) {
          return {
            ...d,
            connected: false,
            permissions: {
              steps: false,
              distance: false,
              calories: false,
              heartRate: false,
              sleep: false,
              activities: false,
              location: false
            }
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
      toast.success(`${device.name} desconectado.`);
    } catch (error) {
      console.error('Erro ao desconectar dispositivo:', error);
      toast.error(`Não foi possível desconectar o ${device.name}. Tente novamente.`);
    }
  };

  // Sincronizar dispositivo
  const handleSyncDevice = async (device: Device) => {
    setIsSyncing(true);
    
    try {
      // Em produção, chamar API
      // await fetch(`/api/devices/${device.id}/sync`, { method: 'POST' });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedDevices = devices.map(d => {
        if (d.id === device.id) {
          return {
            ...d,
            lastSync: new Date()
          };
        }
        return d;
      });
      
      setDevices(updatedDevices);
      toast.success(`${device.name} sincronizado com sucesso!`);
    } catch (error) {
      console.error('Erro ao sincronizar dispositivo:', error);
      toast.error(`Não foi possível sincronizar o ${device.name}. Tente novamente.`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Conectar serviço
  const handleConnectService = async (service: Service) => {
    try {
      // Em produção, chamar API
      // await fetch(`/api/services/${service.id}/connect`, { method: 'POST' });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedServices = services.map(s => {
        if (s.id === service.id) {
          return {
            ...s,
            connected: true,
            lastSync: new Date()
          };
        }
        return s;
      });
      
      setServices(updatedServices);
      toast.success(`${service.name} conectado com sucesso!`);
    } catch (error) {
      console.error('Erro ao conectar serviço:', error);
      toast.error(`Não foi possível conectar o ${service.name}. Tente novamente.`);
    }
  };

  // Desconectar serviço
  const handleDisconnectService = async (service: Service) => {
    try {
      // Em produção, chamar API
      // await fetch(`/api/services/${service.id}/disconnect`, { method: 'POST' });
      
      // Simulação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedServices = services.map(s => {
        if (s.id === service.id) {
          return {
            ...s,
            connected: false
          };
        }
        return s;
      });
      
      setServices(updatedServices);
      toast.success(`${service.name} desconectado.`);
    } catch (error) {
      console.error('Erro ao desconectar serviço:', error);
      toast.error(`Não foi possível desconectar o ${service.name}. Tente novamente.`);
    }
  };

  // Atualizar permissões do dispositivo
  const handleUpdatePermission = (deviceId: string, permission: keyof Device['permissions'], value: boolean) => {
    const updatedDevices = devices.map(device => {
      if (device.id === deviceId) {
        return {
          ...device,
          permissions: {
            ...device.permissions,
            [permission]: value
          }
        };
      }
      return device;
    });
    
    setDevices(updatedDevices);
    
    if (selectedDevice && selectedDevice.id === deviceId) {
      setSelectedDevice(updatedDevices.find(d => d.id === deviceId) || null);
    }
    
    // Em produção, chamar API
    // fetch(`/api/devices/${deviceId}/permissions`, { 
    //   method: 'PUT',
    //   body: JSON.stringify({ permission, value })
    // });
    
    toast.success(`Permissão atualizada.`);
  };

  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Integrações</h1>
            <p className="text-muted-foreground">
              Conecte seus dispositivos e serviços para sincronizar suas atividades
            </p>
          </div>
        </header>
        
        <Tabs defaultValue="devices" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
          </TabsList>
          
          <TabsContent value="devices">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-6 w-3/4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-muted rounded mb-4"></div>
                      <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : devices.length === 0 ? (
                <div className="col-span-2 py-8 text-center">
                  <Watch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Nenhum dispositivo encontrado.
                  </p>
                  <Button>
                    Adicionar Dispositivo
                  </Button>
                </div>
              ) : (
                <>
                  {devices.map(device => (
                    <Card key={device.id} className={device.connected ? 'border-green-200' : ''}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            {device.type === 'smartwatch' ? (
                              <Watch className="h-5 w-5 text-primary" />
                            ) : device.type === 'smartphone' ? (
                              <Smartphone className="h-5 w-5 text-primary" />
                            ) : (
                              <Activity className="h-5 w-5 text-primary" />
                            )}
                            <CardTitle className="text-lg">{device.name}</CardTitle>
                          </div>
                          {device.connected ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted">
                              <X className="h-3 w-3 mr-1" />
                              Desconectado
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          {device.brand} {device.model}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        {device.connected && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Última sincronização:</span>
                              </div>
                              <span className="font-medium">
                                {device.lastSync ? new Date(device.lastSync).toLocaleString() : 'Nunca'}
                              </span>
                            </div>
                            
                            {device.batteryLevel !== undefined && (
                              <div className="flex justify-between text-sm">
                                <span>Bateria:</span>
                                <span className={`font-medium ${
                                  device.batteryLevel > 50 ? 'text-green-500' : 
                                  device.batteryLevel > 20 ? 'text-orange-500' : 
                                  'text-red-500'
                                }`}>
                                  {device.batteryLevel}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="flex gap-2">
                        {device.connected ? (
                          <>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => {
                                setSelectedDevice(device);
                                setShowDeviceSettings(true);
                              }}
                            >
                              <Settings className="h-4 w-4 mr-2" />
                              Configurar
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleSyncDevice(device)}
                              disabled={isSyncing}
                            >
                              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                              Sincronizar
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="flex-none"
                              onClick={() => handleDisconnectDevice(device)}
                            >
                              <LinkOff className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button 
                            className="w-full"
                            onClick={() => handleConnectDevice(device)}
                            disabled={isConnecting}
                          >
                            <Link className="h-4 w-4 mr-2" />
                            {isConnecting ? 'Conectando...' : 'Conectar'}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                  
                  <Card className="border-dashed flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="rounded-full bg-primary/10 p-3 mb-3">
                      <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-medium mb-1">Adicionar Dispositivo</p>
                    <p className="text-sm text-muted-foreground text-center">
                      Conecte um novo smartwatch, smartphone ou rastreador de fitness
                    </p>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-6 w-3/4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-muted rounded mb-4"></div>
                      <div className="h-4 w-2/3 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : services.length === 0 ? (
                <div className="col-span-3 py-8 text-center">
                  <Link className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum serviço disponível no momento.
                  </p>
                </div>
              ) : (
                services.map(service => (
                  <Card key={service.id} className={service.connected ? 'border-green-200' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        {service.connected && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Conectado
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      
                      {service.connected && service.lastSync && (
                        <div className="flex justify-between text-sm mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Última sincronização:</span>
                          </div>
                          <span className="font-medium">
                            {new Date(service.lastSync).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter>
                      {service.connected ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleDisconnectService(service)}
                        >
                          <LinkOff className="h-4 w-4 mr-2" />
                          Desconectar
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => handleConnectService(service)}
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Conectar
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Modal de configurações do dispositivo */}
      {selectedDevice && showDeviceSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {selectedDevice.type === 'smartwatch' ? (
                    <Watch className="h-6 w-6 text-primary" />
                  ) : selectedDevice.type === 'smartphone' ? (
                    <Smartphone className="h-6 w-6 text-primary" />
                  ) : (
                    <Activity className="h-6 w-6 text-primary" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{selectedDevice.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDevice.brand} {selectedDevice.model}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Permissões</h3>
                  
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Ative as permissões necessárias para sincronizar seus dados corretamente.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Footprints className="h-5 w-5 text-primary" />
                        <Label htmlFor="permission-steps">Passos e distância</Label>
                      </div>
                      <Switch 
                        id="permission-steps"
                        checked={selectedDevice.permissions.steps}
                        onCheckedChange={(checked) => 
                          handleUpdatePermission(selectedDevice.id, 'steps', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <Label htmlFor="permission-calories">Calorias</Label>
                      </div>
                      <Switch 
                        id="permission-calories"
                        checked={selectedDevice.permissions.calories}
                        onCheckedChange={(checked) => 
                          handleUpdatePermission(selectedDevice.id, 'calories', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        <Label htmlFor="permission-heart">Frequência cardíaca</Label>
                      </div>
                      <Switch 
                        id="permission-heart"
                        checked={selectedDevice.permissions.heartRate}
                        onCheckedChange={(checked) => 
                          handleUpdatePermission(selectedDevice.id, 'heartRate', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <Label htmlFor="permission-activities">Atividades</Label>
                      </div>
                      <Switch 
                        id="permission-activities"
                        checked={selectedDevice.permissions.activities}
                        onCheckedChange={(checked) => 
                          handleUpdatePermission(selectedDevice.id, 'activities', checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-5 w-5 text-primary" />
                        <Label htmlFor="permission-location">Localização</Label>
                      </div>
                      <Switch 
                        id="permission-location"
                        checked={selectedDevice.permissions.location}
                        onCheckedChange={(checked) => 
                          handleUpdatePermission(selectedDevice.id, 'location', checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowDeviceSettings(false)}
                >
                  Fechar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    handleSyncDevice(selectedDevice);
                    setShowDeviceSettings(false);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar Agora
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
