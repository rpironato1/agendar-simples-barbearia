#!/bin/bash
# Script de início rápido baseado no grafo de dependências

echo "🚀 Iniciando Elite Barber SaaS..."

# Verificar se o setup foi executado
if [ ! -f ".env.local" ]; then
    echo "❌ Execute primeiro: ./setup-dev-graph.sh"
    exit 1
fi

# Iniciar desenvolvimento na ordem correta do grafo
echo "📱 Iniciando Frontend (Nível 5) na porta 8050..."
npm run dev

