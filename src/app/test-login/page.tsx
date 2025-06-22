'use client'

import React, { useState } from 'react';

export default function TestLoginPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testMockLogin = async () => {
    setLoading(true);
    setResult('Testando mock login...');
    
    try {
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mockUser: true, forceDemo: true })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Mock login SUCCESS: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Mock login FAILED: ${response.status} - ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setResult(`💥 ERROR: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testUserAPI = async () => {
    setLoading(true);
    setResult('Testando API do usuário...');
    
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      
      setResult(`👤 User API: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`💥 ERROR: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testStravaLogin = () => {
    setResult('Redirecionando para Strava...');
    window.location.href = '/api/auth/strava?action=login';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Teste de Login - FUSEtech</h1>
        
        <div className="grid gap-4 mb-8">
          <button
            onClick={testMockLogin}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            🎭 Testar Mock Login
          </button>
          
          <button
            onClick={testUserAPI}
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            👤 Testar API do Usuário
          </button>
          
          <button
            onClick={testStravaLogin}
            disabled={loading}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            🏃‍♂️ Testar Login Strava
          </button>
          
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            📊 Ir para Dashboard
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            🏠 Voltar para Home
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">📋 Resultado:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {result || 'Clique em um botão para testar...'}
          </pre>
        </div>
        
        <div className="mt-8 bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug Info:</h3>
          <p><strong>URL atual:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
