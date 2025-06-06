'use client';

import React, { createContext, useContext } from 'react';
import { AuthContext, useAuthLogic } from '@/lib/auth/useAuth';
import { AuthState, AuthProvider as AuthProviderType } from '@/lib/auth/types';

interface AuthContextType {
  auth: AuthState;
  login: (provider: AuthProviderType, credential?: string) => Promise<void>;
  logout: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  loginAsDevelopmentUser: () => Promise<void>;
}

// Provider de autenticação para toda a aplicação
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const authLogic = useAuthLogic();

  return (
    <AuthContext.Provider value={authLogic}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar autenticação em qualquer componente
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}

// Componente para proteger rotas que precisam de autenticação
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();

  // SEMPRE redirecionar para login se não estiver autenticado
  React.useEffect(() => {
    console.log('🔐 ProtectedRoute - Status:', auth.status);

    if (auth.status === 'unauthenticated') {
      console.log('🚨 Redirecionando para login - usuário não autenticado');
      window.location.href = '/login';
    }
  }, [auth.status]);

  // Mostrar loading enquanto verifica
  if (auth.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, não mostrar conteúdo
  if (auth.status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  if (auth.status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Erro de Autenticação
          </h2>
          <p className="text-gray-600 mb-6">
            {auth.error.message}
          </p>
          <div className="space-y-3">
            <a
              href="/login"
              className="block w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tentar Novamente
            </a>
            <a
              href="/"
              className="block w-full px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Voltar ao Início
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Usuário autenticado - mostrar conteúdo
  return <>{children}</>;
}

// Componente para mostrar informações do usuário
export function UserInfo() {
  const { auth, logout } = useAuth();

  if (auth.status !== 'authenticated') {
    return null;
  }

  const { user } = auth;

  // Verificações de segurança para evitar erros
  if (!user || !user.user) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-600 text-sm">?</span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sair
        </button>
      </div>
    );
  }

  const userName = user.user.name || 'Usuário';
  const userAvatar = user.user.avatar;
  const pointsBalance = user.pointsBalance || 0;

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-white text-sm font-semibold">
            {userName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* User Info */}
      <div className="hidden md:block">
        <p className="text-sm font-medium text-gray-900">{userName}</p>
        <p className="text-xs text-gray-500">
          {pointsBalance.toLocaleString('pt-BR')} FUSE Points
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        Sair
      </button>
    </div>
  );
}

// Componente para mostrar status da wallet
export function WalletStatus() {
  const { auth } = useAuth();

  if (auth.status !== 'authenticated') {
    return null;
  }

  const { user } = auth;

  // Verificações de segurança
  if (!user || !user.wallet) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-600">⏳</span>
          <span className="text-sm font-medium text-gray-900">Carregando Wallet...</span>
        </div>
      </div>
    );
  }

  const { wallet } = user;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-green-600">🔐</span>
        <span className="text-sm font-medium text-green-900">Wallet Ativa</span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-700">Endereço:</span>
          <code className="bg-green-100 px-2 py-1 rounded text-green-800">
            {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Carregando...'}
          </code>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-700">Rede:</span>
          <span className="text-green-800">Base L2</span>
        </div>
      </div>
    </div>
  );
}
