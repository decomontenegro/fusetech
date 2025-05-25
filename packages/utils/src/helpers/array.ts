/**
 * Utilitários para manipulação de arrays
 */

/**
 * Agrupa um array de objetos por uma propriedade
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, currentValue) => {
      const groupKey = String(currentValue[key]);
      (result[groupKey] = result[groupKey] || []).push(currentValue);
      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Ordena um array de objetos por uma propriedade
 */
export function sortBy<T>(
  array: T[], 
  key: keyof T, 
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const valueA = a[key];
    const valueB = b[key];
    
    if (valueA === valueB) return 0;
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    if (valueA < valueB) {
      return direction === 'asc' ? -1 : 1;
    }
    
    return direction === 'asc' ? 1 : -1;
  });
}

/**
 * Remove itens duplicados de um array
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Pagina um array
 */
export function paginateArray<T>(
  array: T[], 
  page: number = 1, 
  pageSize: number = 10
): T[] {
  const startIndex = (page - 1) * pageSize;
  return array.slice(startIndex, startIndex + pageSize);
} 