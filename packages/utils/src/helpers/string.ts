/**
 * Utilitários para manipulação de strings
 */

/**
 * Trunca uma string para o tamanho máximo, adicionando '...' no final
 */
export function truncateString(str: string, maxLength: number = 100): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Converte uma string para formato slug
 * Ex: "Olá Mundo" => "ola-mundo"
 */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitaliza a primeira letra de cada palavra em uma string
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formata um valor numérico como moeda brasileira
 */
export function formatToBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata um CPF (xxx.xxx.xxx-xx)
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove caracteres não numéricos
  const digits = cpf.replace(/\D/g, '');
  
  if (digits.length !== 11) return cpf;
  
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata um número de telefone ((xx) xxxxx-xxxx)
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 10 || digits.length > 11) return phone;
  
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

/**
 * Trunca um endereço de carteira para exibição
 */
export function truncateWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Formata um valor para exibição como tokens
 */
export function formatTokenAmount(amount: number): string {
  return `${amount.toFixed(2)} FUSE`;
}

/**
 * Verifica se uma URL é válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
} 