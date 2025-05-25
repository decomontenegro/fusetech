import { format, formatDistance, formatRelative, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Funções para formatação de datas
 */

/**
 * Formata uma data para exibição
 * @param date Data a ser formatada
 * @param options Opções de formatação
 * @returns Data formatada
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
}

/**
 * Formata uma data ISO para formato com hora local
 */
export function formatDateTime(date: Date | string | number): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formata uma data relativa ao momento atual (ex: "há 2 dias")
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return '';
  return formatDistance(new Date(date), new Date(), { 
    addSuffix: true,
    locale: ptBR
  });
}

/**
 * Formata uma data relativa a outra data de referência
 */
export function formatRelativeDate(
  date: Date | string | number,
  baseDate: Date | string | number = new Date()
): string {
  if (!date) return '';
  return formatRelative(new Date(date), new Date(baseDate), { locale: ptBR });
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function daysBetween(
  startDate: Date | string | number,
  endDate: Date | string | number = new Date()
): number {
  if (!startDate) return 0;
  return differenceInDays(new Date(endDate), new Date(startDate));
} 