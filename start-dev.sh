#!/bin/bash

echo "🚀 Iniciando FuseApp na porta 9001..."
echo ""

# Kill any existing process on port 9001
lsof -ti:9001 | xargs kill -9 2>/dev/null

# Clear Next.js cache
rm -rf .next

# Configurar ambiente
export PORT=9001
export HOST=127.0.0.1
export HOSTNAME=127.0.0.1

# Start the development server
echo "📦 Instalando dependências..."
npm install

echo ""
echo "🔧 Iniciando servidor de desenvolvimento em http://127.0.0.1:9001"
npx next dev -p $PORT -H $HOST