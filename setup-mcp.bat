@echo off
REM 🔧 Setup MCP Server para Supabase no arquivo GLOBAL
REM Adiciona configuração ao arquivo existente do usuário

echo 📦 Adicionando configuracao Supabase ao MCP global...

REM Caminho do arquivo MCP global do usuário
set "MCP_FILE=%USERPROFILE%\.cursor\mcp.json"

echo 📁 Arquivo MCP encontrado em: %MCP_FILE%

REM Backup do arquivo atual
copy "%MCP_FILE%" "%MCP_FILE%.backup" >nul 2>&1
echo 💾 Backup criado: %MCP_FILE%.backup

REM Criar nova configuração com Supabase
(
echo {
echo   "mcpServers": {
echo     "supabase": {
echo       "command": "npx",
echo       "args": [
echo         "-y",
echo         "@supabase/mcp-server-supabase@latest",
echo         "--project-ref=dikfrwaqwbtibasxdvie"
echo       ],
echo       "env": {
echo         "SUPABASE_ACCESS_TOKEN": "sbp_7f6e502e23d574537219bacee6c44a4dbedc18cc"
echo       }
echo     }
echo   }
echo }
) > "%MCP_FILE%"

echo ✅ Configuracao Supabase adicionada ao MCP global
echo 📍 Arquivo: %MCP_FILE%
echo 🔄 Reinicie o Cursor IDE para aplicar as mudancas
echo 📋 Para reverter, use: copy "%MCP_FILE%.backup" "%MCP_FILE%"
pause 