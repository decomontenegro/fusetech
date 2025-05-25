/**
 * Classe para padronizar erros da API
 */
export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code: string, status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /**
   * Criar ApiError a partir de um erro do Axios
   */
  static fromAxiosError(error: any): ApiError {
    // Se já é um ApiError, retorna-o
    if (error instanceof ApiError) {
      return error;
    }

    // Se é um erro do Axios com resposta
    if (error.response) {
      const { data, status } = error.response;
      
      // Se o backend retornou um erro estruturado
      if (data && data.error) {
        return new ApiError(
          data.error.message || 'Erro na requisição',
          data.error.code || 'request_failed',
          status,
          data.error.details
        );
      }
      
      // Erro genérico com base no status HTTP
      return new ApiError(
        `Erro na requisição: ${status}`,
        'request_failed',
        status
      );
    }
    
    // Erro de timeout ou conexão
    if (error.request) {
      return new ApiError(
        'Não foi possível conectar ao servidor',
        'connection_error',
        0
      );
    }
    
    // Outro tipo de erro
    return new ApiError(
      error.message || 'Erro desconhecido',
      'unknown_error',
      500
    );
  }

  /**
   * Converte para o formato da API
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      details: this.details
    };
  }
} 