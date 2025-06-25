# 🔧 Configuração Detalhada do Projeto

## 📋 Configuração do Banco de Dados Supabase

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:
```bash
# .env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

### 2. Estrutura do Banco

Execute as migrações SQL na seguinte ordem no SQL Editor do Supabase:

1. **001_initial_schema.sql** - Estrutura básica das tabelas
2. **Demais migrações** - Na ordem cronológica

### 3. Configuração RLS (Row Level Security)

As políticas RLS já estão configuradas nas migrações, mas você pode verificar:

```sql
-- Verificar políticas ativas
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 4. Dados Iniciais

Execute para criar dados básicos:

```sql
-- Barbeiros padrão
INSERT INTO barbers (name, phone, active) VALUES 
('João Silva', '11999999999', true),
('Maria Santos', '11888888888', true);

-- Serviços padrão
INSERT INTO services (name, description, price, duration, active) VALUES 
('Corte de Cabelo', 'Corte tradicional masculino', 35.00, 30, true),
('Barba', 'Aparar e modelar barba', 25.00, 20, true),
('Combo Premium', 'Corte + Barba + Sobrancelha', 55.00, 60, true);
```

## 👥 Configuração de Usuários Admin

### Criar Primeiro Admin

1. Registre-se normalmente no sistema
2. Execute no SQL Editor:

```sql
-- Substituir pelo email do admin
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' 
FROM auth.users 
WHERE email = 'admin@exemplo.com';
```

## 🚀 Deploy

### Vercel
1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático

### Netlify
1. Conecte repositório
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure as mesmas variáveis de ambiente

## 🔧 Desenvolvimento Local

### Dependências Opcionais

```bash
# Para análise de bundle
npm install -D @rollup/plugin-analyzer

# Para testes (futuro)
npm install -D vitest @testing-library/react
```

### Scripts Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint

# Build de desenvolvimento (com source maps)
npm run build:dev
```

## 📱 Configuração Mobile/PWA (Futuro)

Para transformar em PWA, adicione:

```bash
npm install -D vite-plugin-pwa
```

## 🎨 Customização Visual

### Cores do Tema
Edite `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Suas cores personalizadas
      primary: '#f59e0b', // Âmbar
      secondary: '#1f2937', // Slate
    }
  }
}
```

### Componentes shadcn/ui
Para adicionar novos componentes:

```bash
npx shadcn-ui@latest add [component-name]
```

## 🔐 Segurança

### Configurações Importantes

1. **RLS Habilitado** em todas as tabelas
2. **Políticas restritivas** por padrão
3. **Validação client e server-side**
4. **Sanitização de inputs**

### Verificação de Segurança

```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 📊 Monitoramento

### Logs do Supabase
- Auth logs
- Database logs  
- API logs

### Métricas Importantes
- Número de usuários ativos
- Agendamentos por dia
- Receita mensal
- Taxa de cancelamento

---

**💡 Dica:** Mantenha sempre backups regulares do banco de dados! 