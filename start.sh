#!/bin/bash

echo "🚀 Iniciando FuseApp..."
echo ""

# Matar processos existentes
echo "🧹 Limpando processos antigos..."
lsof -ti:9001 | xargs kill -9 2>/dev/null || true

# Limpar cache
echo "🗑️  Limpando cache..."
rm -rf .next

# Verificar dependências
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar servidor
echo ""
echo "🔧 Iniciando servidor Next.js na porta 9001..."
echo "📍 URL: http://localhost:9001"
echo ""

export PORT=9001
export NODE_ENV=development

# Usar exec para que o processo seja substituído
exec npm run dev