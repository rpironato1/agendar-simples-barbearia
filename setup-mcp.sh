#!/bin/bash
# 🔧 Setup MCP Server para Supabase no arquivo GLOBAL
# Adiciona configuração ao arquivo existente do usuário

echo "📦 Adicionando configuração Supabase ao MCP global..."

# Caminho do arquivo MCP global do usuário
MCP_FILE="$HOME/.cursor/mcp.json"

echo "📁 Arquivo MCP: $MCP_FILE"

# Backup do arquivo atual
if [ -f "$MCP_FILE" ]; then
    cp "$MCP_FILE" "$MCP_FILE.backup"
    echo "💾 Backup criado: $MCP_FILE.backup"
fi

# Criar nova configuração com Supabase
cat > "$MCP_FILE" << 'EOF'
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=dikfrwaqwbtibasxdvie"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_7f6e502e23d574537219bacee6c44a4dbedc18cc"
      }
    }
  }
}
EOF

echo "✅ Configuração Supabase adicionada ao MCP global"
echo "📍 Arquivo: $MCP_FILE"
echo "🔄 Reinicie o Cursor IDE para aplicar as mudanças"
echo "📋 Para reverter, use: cp $MCP_FILE.backup $MCP_FILE" 