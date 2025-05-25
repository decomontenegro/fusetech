import { FastifyReply } from 'fastify';
import { ZodError } from 'zod';

/**
 * Tipos de erros da aplicação
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

/**
 * Interface para erros da aplicação
 */
export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  statusCode: number;
}

/**
 * Classe para erros da aplicação
 */
export class ApplicationError extends Error implements AppError {
  type: ErrorType;
  details?: any;
  statusCode: number;

  constructor(type: ErrorType, message: string, details?: any, statusCode?: number) {
    super(message);
    this.name = 'ApplicationError';
    this.type = type;
    this.details = details;
    
    // Definir código de status com base no tipo de erro
    switch (type) {
      case ErrorType.VALIDATION:
      case ErrorType.BAD_REQUEST:
        this.statusCode = 400;
        break;
      case ErrorType.UNAUTHORIZED:
        this.statusCode = 401;
        break;
      case ErrorType.FORBIDDEN:
        this.statusCode = 403;
        break;
      case ErrorType.NOT_FOUND:
        this.statusCode = 404;
        break;
      case ErrorType.CONFLICT:
        this.statusCode = 409;
        break;
      case ErrorType.INTERNAL:
      default:
        this.statusCode = 500;
        break;
    }
    
    // Sobrescrever código de status se fornecido
    if (statusCode) {
      this.statusCode = statusCode;
    }
  }
}

/**
 * Função para lidar com erros e enviar resposta apropriada
 */
export function handleError(error: Error, reply: FastifyReply) {
  // Registrar erro no log
  reply.log.error({ error }, error.message);
  
  // Verificar tipo de erro
  if (error instanceof ApplicationError) {
    // Erro da aplicação
    return reply.status(error.statusCode).send({
      error: {
        type: error.type,
        message: error.message,
        details: error.details,
      },
    });
  } else if (error instanceof ZodError) {
    // Erro de validação Zod
    return reply.status(400).send({
      error: {
        type: ErrorType.VALIDATION,
        message: 'Erro de validação',
        details: error.errors,
      },
    });
  } else {
    // Erro genérico
    return reply.status(500).send({
      error: {
        type: ErrorType.INTERNAL,
        message: 'Erro interno do servidor',
      },
    });
  }
}

/**
 * Funções auxiliares para criar erros específicos
 */
export const createError = {
  validation: (message: string, details?: any) => 
    new ApplicationError(ErrorType.VALIDATION, message, details),
  
  notFound: (message: string, details?: any) => 
    new ApplicationError(ErrorType.NOT_FOUND, message, details),
  
  unauthorized: (message: string, details?: any) => 
    new ApplicationError(ErrorType.UNAUTHORIZED, message, details),
  
  forbidden: (message: string, details?: any) => 
    new ApplicationError(ErrorType.FORBIDDEN, message, details),
  
  conflict: (message: string, details?: any) => 
    new ApplicationError(ErrorType.CONFLICT, message, details),
  
  internal: (message: string, details?: any) => 
    new ApplicationError(ErrorType.INTERNAL, message, details),
  
  badRequest: (message: string, details?: any) => 
    new ApplicationError(ErrorType.BAD_REQUEST, message, details),
};
