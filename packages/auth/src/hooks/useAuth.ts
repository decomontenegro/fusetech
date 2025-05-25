import { useState, useEffect, useCallback } from 'react';
import { AuthError, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

/**
 * Hook para gerenciar autenticação com Supabase
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  
  // Carregar usuário atual
  useEffect(() => {
    if (!supabase) return setLoading(false);
    
    // Iniciar como carregando
    setLoading(true);
    
    // Verificar usuário atual
    const getCurrentUser = async () => {
      try {
        if (supabase?.auth?.getUser) {
          const { data } = await supabase.auth.getUser();
          setUser(data?.user || null);
        }
      } catch (err) {
        console.error('Erro ao buscar usuário atual:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getCurrentUser();
    
    // Quando o estado de autenticação mudar
    const { data: { subscription } } = supabase?.auth?.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    // Limpar assinatura ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Login com email e senha
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase) throw new Error('Cliente Supabase não inicializado');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) setError(error);
      
      return { user: data?.user || null, error };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { user: null, error: authError };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Cadastro com email e senha
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase) throw new Error('Cliente Supabase não inicializado');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) setError(error);
      
      return { user: data?.user || null, error };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { user: null, error: authError };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Logout
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase) throw new Error('Cliente Supabase não inicializado');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) setError(error);
      
      return { error };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Resetar senha
  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!supabase) throw new Error('Cliente Supabase não inicializado');
      
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) setError(error);
      
      return { error };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
} 