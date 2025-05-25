/**
 * Sistema de notificações para a aplicação
 * Abstração em torno da biblioteca 'sonner' para padronizar as notificações
 */
import { toast, ExternalToast } from 'sonner';

interface NotificationOptions extends ExternalToast {
  // Opções adicionais específicas da aplicação
  log?: boolean; // Se deve logar a notificação no console
  error?: Error; // Objeto de erro original
}

/**
 * Exibe uma notificação de sucesso
 * @param message Mensagem a ser exibida
 * @param options Opções adicionais
 */
export function notifySuccess(message: string, options?: NotificationOptions) {
  if (options?.log) {
    console.log(`[SUCESSO] ${message}`);
  }
  
  return toast.success(message, options);
}

/**
 * Exibe uma notificação de erro
 * @param message Mensagem a ser exibida
 * @param options Opções adicionais
 */
export function notifyError(message: string, options?: NotificationOptions) {
  const error = options?.error || new Error(message);
  
  if (options?.log !== false) { // Log por padrão para erros
    console.error(`[ERRO] ${message}`, error);
  }
  
  return toast.error(message, options);
}

/**
 * Exibe uma notificação de informação
 * @param message Mensagem a ser exibida
 * @param options Opções adicionais
 */
export function notifyInfo(message: string, options?: NotificationOptions) {
  if (options?.log) {
    console.info(`[INFO] ${message}`);
  }
  
  return toast(message, options);
}

/**
 * Exibe uma notificação de aviso
 * @param message Mensagem a ser exibida
 * @param options Opções adicionais
 */
export function notifyWarning(message: string, options?: NotificationOptions) {
  if (options?.log) {
    console.warn(`[AVISO] ${message}`);
  }
  
  // Sonner não tem um método específico para avisos, então usamos o método padrão
  // com um estilo personalizado
  return toast(message, {
    ...options,
    className: 'toast-warning', // Use com CSS personalizado
  });
}

/**
 * Exibe uma notificação de carregamento
 * @param message Mensagem a ser exibida
 * @param options Opções adicionais
 */
export function notifyLoading(message: string, options?: NotificationOptions) {
  if (options?.log) {
    console.log(`[CARREGANDO] ${message}`);
  }
  
  // Usar Promise para simular loading, já que toast.loading pode não estar disponível
  const id = toast(message, {
    ...options,
    duration: Infinity, // Não desaparece automaticamente
  });
  
  return id;
}

/**
 * Remove uma notificação pelo ID
 * @param id ID da notificação
 */
export function dismissNotification(id: string | number) {
  toast.dismiss(id);
}

// Re-exportar o toast para uso direto quando necessário
export { toast }; 