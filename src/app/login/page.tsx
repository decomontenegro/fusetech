'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SocialLogin from '@/components/auth/SocialLogin';
import { useAuth } from '@/components/auth/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { auth, login, sendMagicLink, loginAsDevelopmentUser } = useAuth();

  // Redirecionar se já estiver autenticado
  React.useEffect(() => {
    if (auth.status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [auth.status, router]);

  const handleLogin = async (provider: 'strava' | 'google' | 'apple' | 'email', credential?: string) => {
    try {
      await login(provider, credential);
      // Redirecionamento será feito pelo useEffect acima
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  const handleSendMagicLink = async (email: string) => {
    try {
      await sendMagicLink(email);
    } catch (error) {
      console.error('Erro ao enviar magic link:', error);
    }
  };

  if (auth.status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gray-900">FUSEtech</span>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo à FUSEtech
            </h1>
            <p className="text-gray-600 text-lg">
              Transforme suas atividades físicas em recompensas reais
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">O que você ganha:</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">🏃‍♂️</span>
                </div>
                <span className="text-sm text-gray-700">Pontos por cada atividade física</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">🎁</span>
                </div>
                <span className="text-sm text-gray-700">Troque por produtos reais</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">🔐</span>
                </div>
                <span className="text-sm text-gray-700">Wallet automática e segura</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">💰</span>
                </div>
                <span className="text-sm text-gray-700">Tokens FUSE reais em julho</span>
              </div>
            </div>
          </div>

          {/* Social Login Component */}
          <SocialLogin
            onLogin={handleLogin}
            onSendMagicLink={handleSendMagicLink}
            isLoading={false}
          />

          {/* Error Display */}
          {auth.status === 'error' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600">❌</span>
                <span className="text-sm font-medium text-red-900">Erro no login</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                {auth.error.message}
              </p>
            </div>
          )}

          {/* Development Login - Only in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">🧪</span>
                  <span className="text-sm font-medium text-yellow-900">Modo Desenvolvimento</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Use este botão apenas para testes. Em produção, os usuários devem usar login social real.
                </p>
              </div>

              <button
                onClick={loginAsDevelopmentUser}
                disabled={false}
                className="w-full px-4 py-3 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                🧪 Login de Desenvolvimento
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2024 FUSEtech. Transformando fitness em valor real.
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <a href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Termos de Uso
              </a>
              <a href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
                Privacidade
              </a>
              <a href="/support" className="text-sm text-gray-500 hover:text-gray-700">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
