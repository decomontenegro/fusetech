import { type ClassValue, clsx } from 'clsx';

// Função para mesclar classes condicionalmente
export function combineClasses(...inputs: ClassValue[]) {
  return clsx(inputs);
} 