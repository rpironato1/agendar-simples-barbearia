# 🚀 Quick Start - Elite Barber SaaS

## ⚡ Inicio Rápido para Desenvolvimento Local

### 1. Setup Automático
```bash
# Execute o script de setup automático
./setup-dev.sh
```

### 2. Desenvolvimento
```bash
# Inicie o servidor de desenvolvimento (porta 8050)
npm run dev

# Acesse: http://localhost:8050
```

### 3. Testes
```bash
# Testes E2E (em outro terminal)
npm run test:e2e
```

## 🎯 Configuração de Portas (8050-8060)

| Serviço | Porta | URL | Descrição |
|---------|-------|-----|-----------|
| Frontend (Vite) | 8050 | http://localhost:8050 | Aplicação principal |
| MCP Server | 8051 | http://localhost:8051 | Server MCP (quando necessário) |
| API Endpoints | 8050 | http://localhost:8050/api/* | APIs serverless |
| Testes E2E | 8050 | - | Testa na porta 8050 |

## 📁 Arquitetura Modular

```
src/
├── core/              # 🧠 Lógica de negócio agnóstica
├── mcp/               # 🌐 Servidor MCP (Model Context Protocol)
├── components/        # 🎨 Componentes UI reutilizáveis
├── pages/             # 📄 Páginas e fluxos de usuário
├── hooks/             # 🎣 Custom hooks React
├── lib/               # 🛠️ Bibliotecas e configurações
├── integrations/      # 🔗 Integrações externas
└── utils/             # ⚙️ Utilitários gerais

api/                   # 🌍 Endpoints serverless
tests/                 # 🧪 Testes E2E
```

## 🔄 Comunicação Entre Módulos

```
Pages → Components → Hooks → Lib → Integrations
  ↓         ↓         ↓
Core ← → MCP Server ← API
```

## 📚 Documentação Completa

Para documentação detalhada da arquitetura modular:
**MODULAR-ARCHITECTURE-GUIDE.md**

---

**Elite Barber SaaS** - Sistema modular, escalável e mobile-first! 💈✨