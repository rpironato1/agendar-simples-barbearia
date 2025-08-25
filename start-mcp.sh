#!/bin/bash
# Script para iniciar MCP Server (Nível 3)

echo "🤖 Iniciando MCP Server na porta 8051..."

if [ ! -f "src/mcp/server.ts" ]; then
    echo "❌ MCP Server não encontrado"
    exit 1
fi

node src/mcp/server.ts --port 8051

