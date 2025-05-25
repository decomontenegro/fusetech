// Final do arquivo
'use client';

import { createClient, SupabaseClient, User, AuthResponse } from '@supabase/supabase-js';
import { createContext, useContext, ReactNode } from 'react';
import { User as FuseAppUser } from '@fuseapp/types';

// Tipos para a autenticação
export interface AuthOptions {
  supabaseUrl: string;
  supabaseKey: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  name?: string;
}

export interface OAuthProviderOptions {
  provider: 'google' | 'facebook' | 'twitter';
  redirectTo?: string;
}

// Contexto de autenticação
interface AuthContextType {
  user: FuseAppUser | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Criar contexto com valores padrão
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => { throw new Error('Not implemented'); },
  signUp: async () => { throw new Error('Not implemented'); },
  signOut: async () => { throw new Error('Not implemented'); },
  resetPassword: async () => { throw new Error('Not implemented'); },
});

// Hook para usar autenticação
export function useAuth() {
  return useContext(AuthContext);
}

// Provedor de autenticação (removido JSX)
export interface AuthProviderProps {
  children: ReactNode;
}

// NOTA: A implementação do AuthProvider foi movida para /context/AuthContext.tsx
// para evitar problemas com JSX em arquivos .ts

// Classe para gerenciar autenticação
export class AuthService {
  private client: SupabaseClient;

  constructor(options: AuthOptions) {
    this.client = createClient(options.supabaseUrl, options.supabaseKey);
  }

  // Obter o cliente Supabase
  getSupabaseClient(): SupabaseClient {
    return this.client;
  }

  // Login com email e senha
  async signInWithEmail({ email, password }: SignInCredentials): Promise<AuthResponse> {
    return this.client.auth.signInWithPassword({ email, password });
  }

  // Cadastro com email e senha
  async signUpWithEmail({ email, password, name }: SignUpCredentials): Promise<AuthResponse> {
    return this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
  }

  // Login com OAuth
  async signInWithOAuth({ provider, redirectTo }: OAuthProviderOptions) {
    return this.client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    });
  }

  // Obter usuário atual
  async getCurrentUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.client.auth.getUser();
      return { user: data?.user || null, error };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  }

  // Logout
  async signOut(): Promise<{ error: Error | null }> {
    return this.client.auth.signOut();
  }
}

// Função auxiliar para criar o serviço de autenticação
export const createAuthService = (options: AuthOptions): AuthService => {
  return new AuthService(options);
};

// Export default
export default {
  createAuthService,
};

// Componentes e hooks
