#!/bin/bash

echo "🚀 Iniciando demonstração do Sistema SaaS Barbearia"
echo "======================================================"
echo ""

echo "📦 Instalando dependências..."
npm install

echo ""
echo "🔧 Configurando ambiente de teste (LocalStorage)..."
export VITE_USE_SUPABASE=false

echo ""
echo "🏗️ Construindo aplicação..."
npm run build

echo ""
echo "🧪 Sistema configurado com:"
echo "  - ✅ LocalStorage otimizado para Supabase"
echo "  - ✅ Multitenancy completo com isolamento de dados"  
echo "  - ✅ Admin God para gestão da plataforma"
echo "  - ✅ Sistema de planos (Básico, Premium, Enterprise)"
echo "  - ✅ Autenticação com roles (admin, barbershop, user)"
echo ""

echo "🔑 Credenciais de demonstração:"
echo "  Admin God: admin@demo.com / admin123"
echo "  Barbearia: barbershop@demo.com / demo123"
echo ""

echo "🎯 Para iniciar o sistema:"
echo "  npm run dev"
echo ""

echo "🧪 Para rodar os testes E2E:"
echo "  npm run test:e2e"
echo ""

echo "💾 Para migrar para Supabase no futuro:"
echo "  1. Altere VITE_USE_SUPABASE=true no .env"
echo "  2. Configure as variáveis do Supabase"
echo "  3. Execute: barbershopDb.migrateToSupabase() no console"
echo ""

echo "✅ Sistema pronto para demonstração!"