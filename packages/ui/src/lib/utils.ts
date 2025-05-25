import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes CSS, útil para componentes com Tailwind e variantes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor numérico para exibição de tokens
 */
export function formatTokenValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Formata um timestamp para exibição de data localizada
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
}

/**
 * Trunca um texto com elipses no meio
 */
export function truncateMiddle(text: string, startChars = 6, endChars = 4): string {
  if (text.length <= startChars + endChars) {
    return text;
  }
  return `${text.substring(0, startChars)}...${text.substring(text.length - endChars)}`;
} 