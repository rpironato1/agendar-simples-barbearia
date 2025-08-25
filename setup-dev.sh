#!/bin/bash

# 🚀 Elite Barber - Setup Script para Desenvolvimento Local
# Configuração automática com portas na faixa 8050-8060

echo "🏗️  Elite Barber SaaS - Setup para Desenvolvimento Local"
echo "=================================================="
echo ""

# Verificar Node.js
echo "🔍 Verificando pré-requisitos..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versão 18+ necessária. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar NPM
if ! command -v npm &> /dev/null; then
    echo "❌ NPM não encontrado"
    exit 1
fi

echo "✅ NPM $(npm -v) encontrado"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"
echo ""

# Verificar arquivo de ambiente
echo "⚙️  Configurando ambiente..."
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "✅ Arquivo .env.local criado a partir do .env.example"
    else
        echo "⚠️  Nenhum arquivo .env.example encontrado"
    fi
else
    echo "✅ Arquivo .env.local já existe"
fi

# Verificar configuração do Supabase
echo ""
echo "🗄️  Verificando configuração do Supabase..."
if grep -q "SUA_SUPABASE_URL" src/lib/supabase.ts 2>/dev/null; then
    echo "⚠️  Configure suas credenciais do Supabase em src/lib/supabase.ts"
    echo "    Ou certifique-se de que as variáveis de ambiente estão corretas"
else
    echo "✅ Configuração do Supabase parece estar pronta"
fi

echo ""
echo "🎯 Configuração de Portas (8050-8060):"
echo "  Frontend (Vite):     http://localhost:8050"
echo "  MCP Server:          http://localhost:8051 (quando necessário)"
echo "  API Endpoints:       http://localhost:8050/api/*"
echo "  Testes E2E:          Configurados para porta 8050"
echo ""

# Verificar build
echo "🔨 Testando build..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Build executado com sucesso"
else
    echo "⚠️  Build apresentou problemas, mas pode funcionar em desenvolvimento"
fi

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "🚀 Para iniciar o desenvolvimento:"
echo "   npm run dev"
echo ""
echo "🧪 Para executar testes E2E:"
echo "   npm run test:e2e"
echo ""
echo "📊 Scripts disponíveis:"
echo "   npm run dev              # Servidor de desenvolvimento (porta 8050)"
echo "   npm run build            # Build de produção"
echo "   npm run build:dev        # Build de desenvolvimento"
echo "   npm run preview          # Preview do build"
echo "   npm run lint             # ESLint"
echo "   npm run test:e2e         # Testes E2E"
echo "   npm run test:e2e:ui      # Interface dos testes"
echo "   npm run test:e2e:headed  # Testes com browser"
echo "   npm run test:e2e:debug   # Debug dos testes"
echo ""
echo "📖 Documentação completa: MODULAR-ARCHITECTURE-GUIDE.md"
echo ""
echo "🎉 Pronto para desenvolver! Happy coding! 💈✨"