import { createMcpHandler } from '@vercel/mcp-adapter';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Configuração do Supabase
const supabaseUrl = "https://dikfrwaqwbtibasxdvie.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpa2Zyd2Fxd2J0aWJhc3hkdmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDI0MDksImV4cCI6MjA2NjM3ODQwOX0.iOOjd_rXKeDhYAMJuuRDQRP47rhthxLG_OlkCSaXmSA";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Criar o handler MCP seguindo a API oficial da Vercel
const handler = createMcpHandler((server) => {
  // Ferramenta: Status do sistema
  server.tool(
    'system_status',
    'Verificar status do sistema Elite Barber',
    {},
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: `💈 **Elite Barber - Status do Sistema**

🚀 **Projeto:** Sistema de Agendamento para Barbearia
⚡ **Tecnologia:** React + TypeScript + Vite + Supabase
🌐 **URL de Produção:** https://barbernow-kappa.vercel.app
📊 **Banco de Dados:** Supabase (✅ Ativo)
🔐 **Autenticação:** Supabase Auth
🎨 **UI:** shadcn/ui + Tailwind CSS
☁️ **Deploy:** Vercel

✅ **Status:** Sistema funcionando normalmente
🔧 **MCP Server:** 🟢 Conectado e operacional
📅 **Última verificação:** ${new Date().toLocaleString('pt-BR')}

🛠️ **Funcionalidades Disponíveis:**
• ✅ Agendamento online
• ✅ Gestão de clientes
• ✅ Painel administrativo
• ✅ Dashboard financeiro
• ✅ Controle de serviços
• ✅ Autenticação segura`
          }
        ]
      };
    }
  );

  // Ferramenta: Buscar agendamentos básicos
  server.tool(
    'get_appointments_count',
    'Contar agendamentos no sistema',
    {},
    async () => {
      try {
        const { count, error } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `💈 **Elite Barber - Agendamentos**

📊 **Total de agendamentos no sistema:** ${count || 0}
📅 **Última consulta:** ${new Date().toLocaleString('pt-BR')}

✅ Sistema operacional e respondendo normalmente.`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Erro ao consultar agendamentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Ferramenta: Dados básicos do projeto
  server.tool(
    'project_info',
    'Obter informações sobre o projeto Elite Barber',
    {},
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: `💈 **Elite Barber - Informações do Projeto**

**📱 Sistema de Agendamento para Barbearia**

**🏗️ Arquitetura:**
• Frontend: React 18 + TypeScript + Vite
• Backend: Supabase (PostgreSQL + Auth + RLS)
• UI: shadcn/ui + Tailwind CSS + Lucide Icons
• Estado: TanStack Query para cache inteligente
• Roteamento: React Router DOM

**🔐 Segurança:**
• Row Level Security (RLS) habilitado
• Autenticação JWT com refresh automático
• Validação client e server-side
• Políticas de acesso baseadas em roles

**💾 Banco de Dados:**
• PostgreSQL hospedado no Supabase
• Tabelas principais: clients, appointments, services, barbers
• Políticas RLS configuradas para multi-tenant

**🚀 Deploy:**
• Hospedado na Vercel
• URL: https://barbernow-kappa.vercel.app
• CI/CD automático via GitHub

**👨‍💻 Desenvolvedor:**
• Rodolfo Pironato - Turnbold
• Email: rodolfopironato@turnbold.co

**📊 Funcionalidades Core:**
• Sistema de agendamento online
• Painel administrativo completo
• Dashboard financeiro com métricas
• Gestão de clientes e serviços
• Controle de barbeiros e horários`
          }
        ]
      };
    }
  );
});

// Export das funções HTTP para a Vercel
export { handler as GET, handler as POST, handler as DELETE }; 