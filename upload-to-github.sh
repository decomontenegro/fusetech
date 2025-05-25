#!/bin/bash

echo "🚀 Fazendo upload do FUSEtech para o GitHub..."

# Configurar remote
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/decomontenegro/fusetech.git

# Configurar branch
git branch -M main

# Fazer push
echo "📤 Enviando arquivos para o GitHub..."
git push -u origin main

echo "✅ Upload concluído! Verifique: https://github.com/decomontenegro/fusetech"
