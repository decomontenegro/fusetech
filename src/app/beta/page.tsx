'use client'

import React, { useState } from 'react';
import { CheckCircle, Star, Users, Zap, Trophy, ArrowRight } from 'lucide-react';

export default function BetaPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular envio (implementar integração real depois)
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎉 Você está na lista!
          </h1>
          <p className="text-gray-600 mb-6">
            Obrigado pelo interesse! Você receberá acesso prioritário ao FUSEtech beta em breve.
          </p>
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
            <h3 className="font-bold text-gray-800 mb-2">O que acontece agora?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✅ Você está na lista de beta testers</li>
              <li>📧 Receberá email com instruções em 1-2 semanas</li>
              <li>🎁 Acesso gratuito + tokens bonus</li>
              <li>🏆 Status de early adopter</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            ← Voltar ao FUSEtech
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-purple-100 px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FUSEtech Beta</h1>
              <p className="text-xs text-purple-600 font-medium">Acesso Antecipado</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 text-purple-600 hover:text-purple-800 font-semibold transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </header>

      <main className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border-2 border-yellow-200 mb-8 shadow-lg">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-sm bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent font-bold">🚀 Seja um dos primeiros 100 beta testers!</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Acesso Beta
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                FUSEtech! 🏃‍♂️
              </span>
            </h1>

            <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
              Seja um dos primeiros a testar o futuro do fitness! Ganhe <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent font-bold">FUSE tokens</span> correndo e ajude a moldar o produto. 💎
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-3xl text-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-600 mb-4">🎯 Acesso Exclusivo</h3>
              <p className="text-gray-700 leading-relaxed">
                Seja um dos <span className="font-bold text-blue-600">primeiros 100 usuários</span> a testar todas as funcionalidades antes do lançamento público.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl text-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-600 mb-4">⚡ Tokens Bonus</h3>
              <p className="text-gray-700 leading-relaxed">
                Receba <span className="font-bold text-purple-600">1000 FUSE tokens grátis</span> para começar + multiplicador 2x nos primeiros 30 dias.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl text-center shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 border-2 border-green-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-4">🏆 Status VIP</h3>
              <p className="text-gray-700 leading-relaxed">
                Badge especial de <span className="font-bold text-green-600">"Founder"</span> + acesso vitalício a features premium quando lançarmos.
              </p>
            </div>
          </div>

          {/* Sign Up Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-gray-100">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                🚀 Quero ser Beta Tester!
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Quero Acesso Beta!
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                Sem spam. Apenas atualizações importantes sobre o beta.
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">Junte-se a outros early adopters:</p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span>47 pessoas se inscreveram hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span>23 vagas restantes</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
