/**
 * Utilitários para manipulação de objetos
 */

/**
 * Filtra propriedades nulas ou undefined de um objeto
 */
export function removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}

/**
 * Converte um objeto para query string
 */
export function toQueryString(obj: Record<string, any>): string {
  const cleanObj = removeNullish(obj);
  return Object.entries(cleanObj)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join('&');
}

/**
 * Verifica se dois objetos são iguais
 */
export function isEqual<T extends Record<string, any>>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  return keys1.every(key => {
    const val1 = obj1[key];
    const val2 = obj2[key];
    
    if (typeof val1 === 'object' && val1 !== null && typeof val2 === 'object' && val2 !== null) {
      return isEqual(val1, val2);
    }
    
    return val1 === val2;
  });
}

/**
 * Mescla dois objetos de forma profunda
 */
export function deepMerge<T extends Record<string, any>, U extends Record<string, any>>(
  target: T,
  source: U
): T & U {
  const output = { ...target } as T & U;
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' && 
        source[key] !== null && 
        !Array.isArray(source[key])
      ) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(
            target[key], 
            source[key]
          );
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    }
  }
  
  return output;
} 