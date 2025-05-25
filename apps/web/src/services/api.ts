import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

// Tipos de resposta da API
export interface ApiResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Classe para gerenciar requisições à API
export class ApiService {
  private api: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor(baseURL: string) {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para lidar com erros e renovação de token
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== '/api/auth/refresh'
        ) {
          originalRequest._retry = true;
          
          try {
            // Renovar token
            const newToken = await this.refreshToken();
            
            // Atualizar token na requisição original
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            // Repetir a requisição original
            return this.api(originalRequest);
          } catch (refreshError) {
            // Se falhar ao renovar o token, redirecionar para login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Métodos para gerenciar tokens
  private getAccessToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  }

  private getRefreshToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  }

  private setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', (Date.now() + expiresIn * 1000).toString());
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
    }
  }

  // Método para renovar token
  private async refreshToken(): Promise<string> {
    // Se já houver uma requisição de refresh em andamento, retornar a mesma promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return Promise.reject(new Error('Refresh token not found'));
    }

    // Criar nova promise para o refresh
    this.refreshTokenPromise = new Promise(async (resolve, reject) => {
      try {
        const response = await this.api.post<ApiResponse<{ accessToken: string; expiresIn: number }>>(
          '/api/auth/refresh',
          { refreshToken }
        );

        const { accessToken, expiresIn } = response.data.data;
        
        // Atualizar apenas o access token
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('tokenExpiry', (Date.now() + expiresIn * 1000).toString());
        }

        resolve(accessToken);
      } catch (error) {
        reject(error);
      } finally {
        this.refreshTokenPromise = null;
      }
    });

    return this.refreshTokenPromise;
  }

  // Métodos para autenticação
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await this.api.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>>(
        '/api/auth/login',
        { email, password }
      );

      const { accessToken, refreshToken, expiresIn } = response.data.data;
      this.setTokens(accessToken, refreshToken, expiresIn);
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  async register(userData: { email: string; password: string; name: string; username: string }): Promise<void> {
    try {
      const response = await this.api.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>>(
        '/api/auth/register',
        userData
      );

      const { accessToken, refreshToken, expiresIn } = response.data.data;
      this.setTokens(accessToken, refreshToken, expiresIn);
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Métodos genéricos para requisições
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.post<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiErrorResponse>);
    }
  }

  // Método para lidar com erros
  private handleError(error: AxiosError<ApiErrorResponse>): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error);
    }
    return error as Error;
  }
}

// Instância única do serviço de API
export const apiService = new ApiService(process.env.NEXT_PUBLIC_API_URL || '/api');

export default apiService;
