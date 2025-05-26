'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { AuthState, UserAccount, AuthProvider } from './types';
import { SocialAuthProviders } from './social-providers';

// Context de autenticação
const AuthContext = createContext<{
  auth: AuthState;
  login: (provider: AuthProvider, credential?: string) => Promise<void>;
  logout: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
} | null>(null);

// Hook de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

// Hook interno para lógica de autenticação
export function useAuthLogic() {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' });

  // Verificar sessão existente ao carregar
  useEffect(() => {
    checkExistingSession();
  }, []);

  /**
   * Verificar se existe sessão ativa
   */
  const checkExistingSession = async () => {
    try {
      const savedSession = localStorage.getItem('fusetech_session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        
        // Verificar se sessão não expirou
        if (new Date(session.expiresAt) > new Date()) {
          setAuth({
            status: 'authenticated',
            user: session.user
          });
          return;
        } else {
          // Sessão expirada
          localStorage.removeItem('fusetech_session');
        }
      }
      
      setAuth({ status: 'unauthenticated' });
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      setAuth({ status: 'unauthenticated' });
    }
  };

  /**
   * Login com provider social
   */
  const login = async (provider: AuthProvider, credential?: string) => {
    try {
      setAuth({ status: 'loading' });

      let user: UserAccount;

      switch (provider) {
        case 'strava':
          if (!credential) throw new Error('Código do Strava necessário');
          user = await SocialAuthProviders.authenticateWithStrava(credential);
          break;
          
        case 'google':
          if (!credential) throw new Error('Token do Google necessário');
          user = await SocialAuthProviders.authenticateWithGoogle(credential);
          break;
          
        case 'apple':
          if (!credential) throw new Error('Token da Apple necessário');
          user = await SocialAuthProviders.authenticateWithApple(credential);
          break;
          
        default:
          throw new Error('Provider não suportado');
      }

      // Criar sessão
      const session = {
        user,
        accessToken: generateAccessToken(),
        refreshToken: generateRefreshToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      };

      // Salvar sessão
      localStorage.setItem('fusetech_session', JSON.stringify(session));

      setAuth({
        status: 'authenticated',
        user
      });

      console.log('✅ Login realizado com sucesso:', {
        provider,
        userId: user.id,
        walletAddress: user.wallet.address
      });

    } catch (error) {
      console.error('Erro no login:', error);
      setAuth({
        status: 'error',
        error: {
          code: 'LOGIN_FAILED',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          provider
        }
      });
    }
  };

  /**
   * Enviar magic link por email
   */
  const sendMagicLink = async (email: string) => {
    try {
      setAuth({ status: 'loading' });
      
      const result = await SocialAuthProviders.authenticateWithEmail(email);
      
      if (result.success) {
        // Voltar para estado não autenticado mas mostrar mensagem
        setAuth({ status: 'unauthenticated' });
        
        // Mostrar notificação de sucesso
        alert(result.message);
      }
    } catch (error) {
      console.error('Erro ao enviar magic link:', error);
      setAuth({
        status: 'error',
        error: {
          code: 'MAGIC_LINK_FAILED',
          message: error instanceof Error ? error.message : 'Erro ao enviar email'
        }
      });
    }
  };

  /**
   * Verificar magic link
   */
  const verifyMagicLink = async (token: string) => {
    try {
      setAuth({ status: 'loading' });
      
      const user = await SocialAuthProviders.verifyMagicLink(token);
      
      // Criar sessão
      const session = {
        user,
        accessToken: generateAccessToken(),
        refreshToken: generateRefreshToken(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };

      localStorage.setItem('fusetech_session', JSON.stringify(session));

      setAuth({
        status: 'authenticated',
        user
      });

      console.log('✅ Magic link verificado com sucesso');

    } catch (error) {
      console.error('Erro na verificação do magic link:', error);
      setAuth({
        status: 'error',
        error: {
          code: 'MAGIC_LINK_INVALID',
          message: 'Link inválido ou expirado'
        }
      });
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      // Remover sessão local
      localStorage.removeItem('fusetech_session');
      
      // Logout no backend (se autenticado)
      if (auth.status === 'authenticated') {
        await SocialAuthProviders.logout(auth.user.id);
      }
      
      setAuth({ status: 'unauthenticated' });
      
      console.log('👋 Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, fazer logout local
      setAuth({ status: 'unauthenticated' });
    }
  };

  return {
    auth,
    login,
    logout,
    sendMagicLink,
    verifyMagicLink
  };
}

// Funções auxiliares
function generateAccessToken(): string {
  return `access_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

function generateRefreshToken(): string {
  return `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

// Provider de contexto
export { AuthContext };
