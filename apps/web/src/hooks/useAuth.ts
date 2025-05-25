'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { apolloClient } from '../lib/graphql';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  username: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });
  const router = useRouter();

  // Verificar se o usuário está autenticado
  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      // Verificar se há token no localStorage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
        return;
      }
      
      // Fazer uma requisição para obter os dados do usuário
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: userData.data,
        });
      } else {
        // Se a requisição falhar, limpar o token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  }, []);

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login
  const login = async (credentials: LoginCredentials) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Armazenar tokens
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('tokenExpiry', (Date.now() + data.data.expiresIn * 1000).toString());
        
        // Resetar o cliente Apollo para usar o novo token
        apolloClient.resetStore();
        
        // Atualizar estado
        await checkAuth();
        
        toast.success('Login realizado com sucesso!');
        return true;
      } else {
        toast.error(data.error || 'Erro ao fazer login');
        setState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // Registro
  const register = async (data: RegisterData) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        // Armazenar tokens
        localStorage.setItem('accessToken', responseData.data.accessToken);
        localStorage.setItem('refreshToken', responseData.data.refreshToken);
        localStorage.setItem('tokenExpiry', (Date.now() + responseData.data.expiresIn * 1000).toString());
        
        // Resetar o cliente Apollo para usar o novo token
        apolloClient.resetStore();
        
        // Atualizar estado
        await checkAuth();
        
        toast.success('Registro realizado com sucesso!');
        return true;
      } else {
        toast.error(responseData.error || 'Erro ao fazer registro');
        setState((prev) => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Erro ao fazer registro:', error);
      toast.error('Erro ao fazer registro. Tente novamente.');
      setState((prev) => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  // Logout
  const logout = useCallback(() => {
    // Limpar tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    
    // Resetar o cliente Apollo
    apolloClient.resetStore();
    
    // Atualizar estado
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
    
    // Redirecionar para a página de login
    router.push('/login');
    
    toast.success('Logout realizado com sucesso!');
  }, [router]);

  return {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    login,
    register,
    logout,
    checkAuth,
  };
}
