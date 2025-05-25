import { z } from 'zod';
import { ZodError, ZodSchema } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Schema para validação de email
 */
export const emailSchema = z
  .string()
  .email('Email inválido')
  .min(5, 'Email deve ter no mínimo 5 caracteres')
  .max(255, 'Email deve ter no máximo 255 caracteres');

/**
 * Schema para validação de senha
 */
export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .max(72, 'Senha deve ter no máximo 72 caracteres')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
    'Senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial'
  );

/**
 * Schema para validação de nome
 */
export const nameSchema = z
  .string()
  .min(2, 'Nome deve ter no mínimo 2 caracteres')
  .max(100, 'Nome deve ter no máximo 100 caracteres');

/**
 * Schema para validação de URL
 */
export const urlSchema = z
  .string()
  .url('URL inválida')
  .max(2048, 'URL deve ter no máximo 2048 caracteres');

/**
 * Utilitários para validação de dados
 */

/**
 * Valida dados contra um esquema Zod
 * @param schema Esquema Zod para validação
 * @param data Dados a serem validados
 * @returns Objeto com dados validados ou erros
 */
export function validateSchema<T>(schema: ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T;
  error?: string;
} {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return {
        success: false,
        error: validationError.message
      };
    }
    
    return {
      success: false,
      error: 'Erro de validação desconhecido'
    };
  }
}

/**
 * Verifica se uma string é um endereço de e-mail válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Verifica se uma string é um CPF válido
 */
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Algoritmo de validação do CPF
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
} 