/**
 * Cliente API para consumir serviços do backend
 */
import axios from 'axios';

// Tipos para respostas de API
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Cliente API base
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(config => {
  // Durante o desenvolvimento, simularemos um token fixo
  // Na produção, este token virá do estado de autenticação
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Interceptor para tratamento de erros
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Log de erro para depuração
    console.error('API Error:', error);
    
    // Tratamento específico para cada tipo de erro
    if (error.response) {
      // Erro de servidor - o servidor respondeu com um status fora do intervalo 2xx
      console.error('Server error:', error.response.data);
      
      // Tratamento de erros de autenticação
      if (error.response.status === 401) {
        // Redirecionar para login ou limpar estado de autenticação
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // window.location.href = '/auth/login';
        }
      }
    } else if (error.request) {
      // Erro de rede - a requisição foi feita mas não houve resposta
      console.error('Network error:', error.request);
    } else {
      // Algo aconteceu ao configurar a requisição
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API de Atividades
export const actividadesApi = {
  // Listar atividades do usuário
  listar: async (userId: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/atividades/${userId}`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  // Obter detalhes de uma atividade
  obter: async (atividadeId: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/atividades/detalhes/${atividadeId}`);
    return response.data;
  },
  
  // Registrar uma atividade manual
  registrarManual: async (dados: any) => {
    const response = await apiClient.post<ApiResponse<any>>('/atividades/manual', dados);
    return response.data;
  }
};

// API de Desafios
export const desafiosApi = {
  // Listar desafios disponíveis
  listar: async (status?: string, categoria?: string) => {
    const response = await apiClient.get<ApiResponse<any[]>>('/desafios', {
      params: { status, categoria }
    });
    return response.data;
  },
  
  // Obter detalhes de um desafio
  obter: async (desafioId: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/desafios/${desafioId}`);
    return response.data;
  },
  
  // Inscrever-se em um desafio
  inscrever: async (desafioId: string, userId: string) => {
    const response = await apiClient.post<ApiResponse<any>>(`/desafios/${desafioId}/inscrever`, { userId });
    return response.data;
  }
};

// API de Carteira/Tokens
export const walletApi = {
  // Obter saldo da carteira
  getSaldo: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/wallet/${userId}/saldo`);
    return response.data;
  },
  
  // Listar transações
  listarTransacoes: async (userId: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/wallet/${userId}/transacoes`, {
      params: { page, limit }
    });
    return response.data;
  },
  
  // Enviar tokens
  enviar: async (dados: { de: string; para: string; valor: number; descricao?: string }) => {
    const response = await apiClient.post<ApiResponse<any>>('/wallet/enviar', dados);
    return response.data;
  }
}; 