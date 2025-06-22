'use client'

import React, { useState, useEffect } from 'react';
import { Play, Zap, Activity, Trophy } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const response = await fetch('/api/user');
      const userData = await response.json();
      if (userData.authenticated) {
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <p className="text-gray-700 font-semibold">Carregando FUSEtech...</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = async () => {
    if (user) {
      // Se já está logado, vai para dashboard
      window.location.href = '/dashboard';
    } else {
      // SEMPRE usar modo mock para demonstração no Vercel
      // Modo mock - criar usuário fake e ir direto para dashboard
      try {
        const response = await fetch('/api/auth/mock-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mockUser: true, forceDemo: true })
        });

        if (response.ok) {
          // Recarregar a página para atualizar o estado do usuário
          window.location.reload();
        } else {
          console.error('Mock login falhou, tentando Strava...');
          window.location.href = '/api/auth/strava?action=login';
        }
      } catch (error) {
        console.error('Erro no mock login:', error);
        // Fallback para Strava se mock falhar
        window.location.href = '/api/auth/strava?action=login';
      }
    }
  };

  const handleSwitchAccount = () => {
    // Força nova autorização do Strava (permite escolher conta diferente)
    window.location.href = '/api/auth/strava?action=login';
  };

  const handleViewDemo = () => {
    // Go to demo page
    window.location.href = '/demo';
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/user', { method: 'DELETE' });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Elegant Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FUSEtech</h1>
              <p className="text-xs text-purple-600 font-medium">Fitness meets Blockchain</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleGetStarted}
              className="px-6 py-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors hover:bg-purple-50 rounded-lg"
            >
              Entrar
            </button>
            <button
              onClick={handleGetStarted}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
            >
              🚀 Começar Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Colorful Hero Section */}
      <main className="px-6 py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Colorful Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full border-2 border-green-200 mb-8 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-bold">✨ Transforme movimento em valor real</span>
          </div>

          {/* Vibrant Headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ganhe tokens
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              correndo! 🏃‍♂️
            </span>
          </h1>

          {/* Colorful Subtitle */}
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Conecte seu <span className="text-orange-500 font-bold">Strava</span>, corra, pedale ou caminhe e ganhe <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold">FUSE tokens</span> que podem ser trocados por produtos reais! 💎
          </p>

          {/* Vibrant CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            {!loading && (
              <>
                {user ? (
                  // Usuário logado
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg text-gray-700 mb-2">
                        Bem-vindo de volta, <span className="font-bold text-blue-600">{user.name}</span>! 👋
                      </p>
                      <p className="text-sm text-gray-500">Conectado via Strava</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleGetStarted}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105 shadow-lg"
                      >
                        📊 Ir para Dashboard
                      </button>
                      <button
                        onClick={handleSwitchAccount}
                        className="px-6 py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl text-lg font-bold hover:shadow-2xl transition-all transform hover:scale-105 shadow-lg"
                        title="Conectar com uma conta Strava diferente"
                      >
                        🔄 Trocar Conta
                      </button>
                      <button
                        onClick={handleLogout}
                        className="px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-2xl text-lg font-bold hover:from-gray-200 hover:to-gray-300 transition-all shadow-lg hover:shadow-xl"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                ) : (
                  // Usuário não logado
                  <>
                    <button
                      onClick={handleGetStarted}
                      className="px-10 py-5 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white rounded-2xl text-xl font-black hover:shadow-2xl transition-all transform hover:scale-110 hover:-translate-y-2 shadow-lg"
                    >
                      🚀 Começar Agora - GRÁTIS!
                    </button>
                    <button
                      onClick={handleViewDemo}
                      className="px-10 py-5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-2xl text-xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Play className="w-6 h-6 text-blue-500" />
                      🎬 Ver Demo
                    </button>
                  </>
                )}
              </>
            )}
            {loading && (
              <div className="px-10 py-5 bg-gray-200 text-gray-500 rounded-2xl text-xl font-bold animate-pulse">
                Carregando...
              </div>
            )}
          </div>

          {/* Colorful Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">25K+</div>
              <div className="text-sm text-blue-700 font-semibold">🏃‍♂️ Atletas</div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-2">5.2M</div>
              <div className="text-sm text-purple-700 font-semibold">💎 Tokens</div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2">1.8M</div>
              <div className="text-sm text-green-700 font-semibold">⚡ Atividades</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-200 p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <div className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">99%</div>
              <div className="text-sm text-orange-700 font-semibold">⭐ Satisfação</div>
            </div>
          </div>
        </div>
      </main>

      {/* Colorful Features */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Como funciona ⚡
              </span>
            </h2>
            <p className="text-2xl text-gray-700 font-semibold">
              Três passos simples para começar a <span className="text-green-500">ganhar! 💰</span>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl text-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2 border-2 border-blue-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-blue-600 mb-4">1. 🔗 Conecte</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Conecte seu <span className="text-orange-500 font-bold">Strava</span>, <span className="text-gray-600 font-bold">Apple Health</span> ou <span className="text-green-500 font-bold">Google Fit</span> em segundos! ⚡
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl text-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2 border-2 border-purple-100">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-purple-600 mb-4">2. 🏃‍♂️ Mova-se</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Corra, pedale, caminhe. Cada movimento gera <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold">tokens automaticamente</span>! 🚀
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl text-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 hover:-translate-y-2 border-2 border-green-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-black text-green-600 mb-4">3. 💎 Resgate</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Troque seus tokens por <span className="text-blue-500 font-bold">produtos</span>, <span className="text-purple-500 font-bold">equipamentos</span> e <span className="text-pink-500 font-bold">experiências</span> incríveis! 🎁
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Explore o App 🚀
              </span>
            </h2>
            <p className="text-2xl text-gray-700 font-semibold">
              Descubra todas as funcionalidades do <span className="text-blue-500">FUSEtech</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button onClick={handleGetStarted} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl hover:shadow-lg transition-all block group w-full text-left">
              <Activity className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Dashboard</h3>
              <p className="text-blue-100">Veja seu progresso e estatísticas</p>
            </button>

            <button onClick={handleGetStarted} className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl hover:shadow-lg transition-all block group w-full text-left">
              <Activity className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Atividades</h3>
              <p className="text-green-100">Registre e acompanhe suas atividades</p>
            </button>

            <button onClick={handleGetStarted} className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl hover:shadow-lg transition-all block group w-full text-left">
              <Trophy className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Perfil</h3>
              <p className="text-purple-100">Gerencie seu perfil e conquistas</p>
            </button>

            <button onClick={handleGetStarted} className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 rounded-2xl hover:shadow-lg transition-all block group w-full text-left">
              <Zap className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">Recompensas</h3>
              <p className="text-pink-100">Troque FUSE por recompensas</p>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}



