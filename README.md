# 💈 Sistema de Agendamento para Barbearia

Um sistema completo de agendamento para barbearias desenvolvido com React + TypeScript + Supabase.

## 🚀 Funcionalidades

### Para Clientes
- ✅ **Agendamento Online**: Sistema intuitivo de marcação de horários
- ✅ **Autenticação**: Login/cadastro seguro
- ✅ **Dashboard Pessoal**: Visualização de agendamentos e histórico
- ✅ **Notificações**: Contato via WhatsApp
- ✅ **Cancelamento**: Cancelar agendamentos com antecedência

### Para Administradores
- ✅ **Painel Administrativo**: Controle total dos agendamentos
- ✅ **Gestão de Clientes**: Cadastro e histórico completo
- ✅ **Controle Financeiro**: Dashboard com métricas e relatórios
- ✅ **Gestão de Serviços**: Cadastro de serviços e preços
- ✅ **Equipe**: Gerenciamento de barbeiros
- ✅ **Pagamentos**: Controle de métodos de pagamento (PIX, Cartão, Dinheiro, Misto)

### Recursos Avançados
- 📊 **Dashboard Financeiro** com filtros em tempo real
- 💰 **Controle de Custos** e análise de lucro
- 📱 **Responsivo** para desktop e mobile
- 🔐 **Segurança RLS** (Row Level Security)
- ⚡ **Tempo Real** com atualizações instantâneas

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: shadcn/ui + Tailwind CSS + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Estado**: TanStack Query para cache inteligente
- **Roteamento**: React Router DOM
- **Validação**: Zod + React Hook Form
- **Notificações**: Sonner
- **Datas**: date-fns

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Conta no [Supabase](https://supabase.com/)

## 🚀 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd agendar-simples-barbearia
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

#### 3.1 Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima do projeto

#### 3.2 Configure as credenciais
Edite o arquivo `src/lib/supabase.ts` e substitua:
```typescript
const supabaseUrl = "SUA_SUPABASE_URL";
const supabaseAnonKey = "SUA_SUPABASE_ANON_KEY";
```

#### 3.3 Execute as migrações
```bash
# Se tiver o Supabase CLI instalado
npx supabase db push

# Ou execute manualmente no SQL Editor do Supabase
# os arquivos em supabase/migrations/
```

### 4. Inicie o desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes da biblioteca shadcn/ui
│   ├── FinancialDashboard.tsx
│   └── ClientManagement.tsx
├── hooks/              # Hooks customizados
│   ├── useAuth.tsx     # Hook de autenticação
│   └── use-toast.ts    # Hook de notificações
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Página inicial
│   ├── Booking.tsx     # Agendamento
│   ├── Admin.tsx       # Painel administrativo
│   ├── UserDashboard.tsx
│   └── ...
├── lib/                # Configurações e utilitários
│   ├── supabase.ts     # Cliente Supabase
│   └── utils.ts        # Funções utilitárias
├── utils/              # Validações e helpers
│   └── validation.ts   # Validação de formulários
└── integrations/       # Integrações externas
    └── supabase/       # Types do Supabase
```

## 🎯 Como Usar

### Acesso de Cliente
1. Acesse a página inicial
2. Clique em "Agendar Horário"
3. Faça login ou cadastre-se
4. Escolha serviço, barbeiro, data e horário
5. Confirme o agendamento

### Acesso Administrativo
1. Acesse `/admin-login`
2. Faça login com credenciais de administrador
3. Gerencie agendamentos, clientes e financeiro

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Visualiza build de produção
npm run lint         # Executa ESLint
```

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)
1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente do Supabase
3. Deploy automático a cada push

### Opção 2: Netlify
1. Conecte seu repositório ao Netlify
2. Configure build command: `npm run build`
3. Configure publish directory: `dist`

## 🔐 Segurança

- **RLS (Row Level Security)** ativado no Supabase
- **Autenticação JWT** com refresh automático
- **Validação** server-side e client-side
- **Sanitização** de inputs do usuário

## 📊 Banco de Dados

### Principais Tabelas
- `clients` - Cadastro de clientes
- `appointments` - Agendamentos
- `services` - Serviços oferecidos
- `barbers` - Equipe de barbeiros
- `financial_transactions` - Transações financeiras
- `profiles` - Perfis de usuários autenticados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma [issue](../../issues)
- Entre em contato: [seu-email@exemplo.com]

---

**Desenvolvido com ❤️ para barbeiros modernos** 💈
