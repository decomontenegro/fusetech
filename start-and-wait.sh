#!/bin/bash

echo "🚀 Iniciando FuseApp..."
echo ""

# Limpar processos antigos
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Limpar cache
rm -rf .next

# Iniciar o servidor em background
echo "📦 Iniciando servidor Next.js..."
npm run dev &
SERVER_PID=$!

# Esperar o servidor ficar pronto
echo "⏳ Aguardando servidor ficar pronto..."
sleep 3

# Tentar conectar várias vezes
for i in {1..10}; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|302\|404"; then
        echo "✅ Servidor pronto!"
        echo ""
        echo "🌐 Acesse: http://localhost:3000"
        echo ""
        echo "Para parar o servidor, pressione Ctrl+C"
        
        # Aguardar o usuário
        wait $SERVER_PID
        break
    else
        echo "⏳ Tentativa $i/10..."
        sleep 2
    fi
done

if ! ps -p $SERVER_PID > /dev/null; then
    echo "❌ Servidor falhou ao iniciar"
    exit 1
fi