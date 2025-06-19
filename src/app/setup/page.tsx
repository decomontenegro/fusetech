'use client'

import React from 'react';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';

export default function SetupPage() {
  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fusetech-mvp.loca.lt';
  const callbackUrl = `${appUrl}/api/auth/strava/callback`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Configuração do Strava
          </h1>
          <p className="text-gray-600 mt-2">Configure a integração real com o Strava</p>
        </div>

        {/* Setup Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <h2 className="text-xl font-bold text-gray-800">Criar Aplicação no Strava</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Primeiro, você precisa criar uma aplicação no Strava Developers:
              </p>
              
              <a 
                href="https://developers.strava.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Strava Developers
              </a>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Configurações da Aplicação:</h3>
                <ul className="space-y-2 text-sm">
                  <li><strong>Application Name:</strong> FUSEtech</li>
                  <li><strong>Category:</strong> Training</li>
                  <li><strong>Website:</strong> {appUrl}</li>
                  <li><strong>Authorization Callback Domain:</strong> {new URL(appUrl).hostname}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <h2 className="text-xl font-bold text-gray-800">Configurar Variáveis de Ambiente</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Após criar a aplicação, copie as credenciais e configure as variáveis de ambiente:
              </p>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span># .env.local</span>
                  <button 
                    onClick={() => copyToClipboard(`STRAVA_CLIENT_ID=your_client_id_here\nSTRAVA_CLIENT_SECRET=your_client_secret_here\nNEXT_PUBLIC_APP_URL=${appUrl}`)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div>STRAVA_CLIENT_ID=your_client_id_here</div>
                <div>STRAVA_CLIENT_SECRET=your_client_secret_here</div>
                <div>NEXT_PUBLIC_APP_URL={appUrl}</div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Importante:</strong> Substitua "your_client_id_here" e "your_client_secret_here" 
                  pelas credenciais reais da sua aplicação Strava.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <h2 className="text-xl font-bold text-gray-800">URL de Callback</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Configure esta URL como Authorization Callback Domain no Strava:
              </p>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <code className="flex-1 text-sm">{callbackUrl}</code>
                <button 
                  onClick={() => copyToClipboard(callbackUrl)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <h2 className="text-xl font-bold text-gray-800">Testar Integração</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Após configurar tudo, reinicie o servidor e teste a integração:
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Ir para Homepage
                </button>
                
                <button 
                  onClick={() => window.location.href = '/api/auth/strava?action=login'}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Testar Login Strava
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Check */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Status da Configuração</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">APIs criadas</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Dashboard atualizado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              <span className="text-gray-500">Credenciais Strava configuradas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              <span className="text-gray-500">Integração testada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
