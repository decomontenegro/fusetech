'use client';

import React, { useState } from 'react';
import { Mail, Smartphone, Chrome } from 'lucide-react';

interface SocialLoginProps {
  onLogin: (provider: 'strava' | 'google' | 'apple' | 'email', credential?: string) => Promise<void>;
  onSendMagicLink: (email: string) => Promise<void>;
  isLoading: boolean;
}

export default function SocialLogin({ onLogin, onSendMagicLink, isLoading }: SocialLoginProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleStravaLogin = () => {
    // Em produção, redirecionaria para OAuth real do Strava
    // Para demonstração, simula o fluxo
    if (process.env.NODE_ENV === 'production') {
      // Redirecionar para Strava OAuth real
      window.location.href = 'https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&scope=read,activity:read';
    } else {
      // Mock para desenvolvimento
      const mockCode = 'strava_auth_code_' + Date.now();
      onLogin('strava', mockCode);
    }
  };

  const handleGoogleLogin = () => {
    // Em produção, usaria Google OAuth real
    if (process.env.NODE_ENV === 'production') {
      // Implementar Google OAuth real
      console.log('Google OAuth seria implementado aqui');
    } else {
      // Mock para desenvolvimento
      const mockToken = 'google_auth_token_' + Date.now();
      onLogin('google', mockToken);
    }
  };

  const handleAppleLogin = () => {
    // Em produção, usaria Apple Sign In real
    if (process.env.NODE_ENV === 'production') {
      // Implementar Apple Sign In real
      console.log('Apple Sign In seria implementado aqui');
    } else {
      // Mock para desenvolvimento
      const mockToken = 'apple_auth_token_' + Date.now();
      onLogin('apple', mockToken);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await onSendMagicLink(email);
      setEmailSent(true);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Email Enviado!
          </h3>
          <p className="text-green-700 text-sm mb-4">
            Enviamos um link de acesso para <strong>{email}</strong>.
            Clique no link para fazer login automaticamente.
          </p>
          <button
            onClick={() => {
              setEmailSent(false);
              setEmail('');
              setShowEmailForm(false);
            }}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
            aria-label="Tentar com outro endereço de email"
          >
            Tentar outro email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Entre na FUSEtech
        </h2>
        <p className="text-gray-600">
          Conecte-se e comece a ganhar pontos por suas atividades físicas
        </p>
      </div>

      {/* Strava Login - Destaque para usuários fitness */}
      <button
        onClick={handleStravaLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        aria-label="Fazer login com Strava"
        aria-busy={isLoading}
        aria-disabled={isLoading}
      >
        <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
          <span className="text-orange-500 font-bold text-sm">S</span>
        </div>
        {isLoading ? 'Conectando...' : 'Continuar com Strava'}
      </button>

      <div className="text-center text-xs text-gray-500 -mt-2 mb-4">
        ⭐ Recomendado para atletas - Sincronização automática de atividades
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou continue com</span>
        </div>
      </div>

      {/* Google Login */}
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Fazer login com Google"
        aria-busy={isLoading}
        aria-disabled={isLoading}
      >
        <Chrome className="w-5 h-5 text-blue-500" />
        {isLoading ? 'Conectando...' : 'Continuar com Google'}
      </button>

      {/* Apple Login */}
      <button
        onClick={handleAppleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 bg-black text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Fazer login com Apple"
        aria-busy={isLoading}
        aria-disabled={isLoading}
      >
        <Smartphone className="w-5 h-5" />
        {isLoading ? 'Conectando...' : 'Continuar com Apple'}
      </button>

      {/* Email Login */}
      {!showEmailForm ? (
        <button
          onClick={() => setShowEmailForm(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Fazer login com email"
          aria-busy={isLoading}
          aria-disabled={isLoading}
        >
          <Mail className="w-5 h-5" />
          Continuar com Email
        </button>
      ) : (
        <form onSubmit={handleEmailSubmit} className="space-y-3" aria-label="Formulário de login por email">
          <div>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              aria-label="Endereço de email"
              aria-required="true"
              aria-invalid={false}
              autoComplete="email"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !email}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Enviar link de acesso por email"
              aria-busy={isLoading}
              aria-disabled={isLoading || !email}
            >
              {isLoading ? 'Enviando...' : 'Enviar Link'}
            </button>
            <button
              type="button"
              onClick={() => setShowEmailForm(false)}
              className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Cancelar login por email"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Authentication Status Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-sm">🔐</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Login Seguro e Simples
            </h4>
            <p className="text-xs text-blue-700 mb-2">
              Use suas contas existentes para fazer login. Criamos automaticamente uma carteira segura para você.
            </p>
            <div className="text-xs text-blue-600">
              ✓ Sem senhas para lembrar<br/>
              ✓ Wallet automática criada<br/>
              ✓ Dados protegidos e criptografados
            </div>
          </div>
        </div>
      </div>

      {/* Development Mode Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-600">🧪</span>
            <span className="text-sm font-medium text-yellow-900">Modo Desenvolvimento</span>
          </div>
          <p className="text-xs text-yellow-700">
            Os logins sociais acima são simulações para teste. Use o botão de desenvolvimento abaixo para testar o fluxo completo.
          </p>
        </div>
      )}

      {/* Terms */}
      <p className="text-xs text-gray-500 text-center mt-6">
        Ao continuar, você concorda com nossos{' '}
        <a href="/terms" className="text-blue-500 hover:underline" aria-label="Ler Termos de Uso">
          Termos de Uso
        </a>{' '}
        e{' '}
        <a href="/privacy" className="text-blue-500 hover:underline" aria-label="Ler Política de Privacidade">
          Política de Privacidade
        </a>
      </p>
    </div>
  );
}
