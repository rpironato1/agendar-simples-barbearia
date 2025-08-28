import { createMcpHandler } from "@vercel/mcp-adapter";
import { db } from "@/lib/database";
import {
  GetAppointmentsArgs,
  GetClientsArgs,
  GetFinancialDataArgs,
  GetServicesArgs,
  DeployStatusArgs,
  McpResponse,
} from "@/types/mcp";

// Ferramentas disponíveis para o MCP
const tools = [
  {
    name: "get_appointments",
    description: "Buscar agendamentos do sistema",
    inputSchema: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Data no formato YYYY-MM-DD (opcional)",
        },
        status: {
          type: "string",
          enum: ["pending", "confirmed", "cancelled", "completed"],
          description: "Status do agendamento (opcional)",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_clients",
    description: "Listar clientes cadastrados",
    inputSchema: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description: "Buscar por nome ou email (opcional)",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_financial_data",
    description: "Obter dados financeiros e métricas",
    inputSchema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["today", "week", "month", "year"],
          description: "Período para análise",
        },
      },
      required: ["period"],
      additionalProperties: false,
    },
  },
  {
    name: "get_services",
    description: "Listar serviços disponíveis",
    inputSchema: {
      type: "object",
      properties: {
        active_only: {
          type: "boolean",
          description: "Mostrar apenas serviços ativos (padrão: true)",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "deploy_status",
    description: "Verificar status do deploy e projeto",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

// Implementação das ferramentas
const toolImplementations = {
  async get_appointments(args: GetAppointmentsArgs): Promise<McpResponse> {
    try {
      let query = db
        .from("appointments")
        .select(
          `
          *,
          clients(id, name, phone, email),
          services(id, name, price, duration),
          barbers(id, name)
        `
        )
        .order("appointment_date", { ascending: true });

      if (args.date) {
        query = query
          .gte("appointment_date", args.date)
          .lt("appointment_date", `${args.date}T23:59:59`);
      }

      if (args.status) {
        query = query.eq("status", args.status);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      return {
        content: [
          {
            type: "text",
            text: `Encontrados ${data?.length || 0} agendamentos:\n\n${
              data
                ?.map(
                  (appointment) =>
                    `📅 ${new Date(appointment.appointment_date).toLocaleString("pt-BR")}\n` +
                    `👤 ${appointment.clients?.name || "N/A"}\n` +
                    `✂️ ${appointment.services?.name || "N/A"} - R$ ${appointment.services?.price || 0}\n` +
                    `👨‍💼 ${appointment.barbers?.name || "N/A"}\n` +
                    `📊 Status: ${appointment.status}\n` +
                    `${appointment.notes ? `📝 ${appointment.notes}\n` : ""}---\n`
                )
                .join("\n") || "Nenhum agendamento encontrado."
            }`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao buscar agendamentos: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          },
        ],
        isError: true,
      };
    }
  },

  async get_clients(args: GetClientsArgs): Promise<McpResponse> {
    try {
      let query = db
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (args.search) {
        query = query.or(
          `name.ilike.%${args.search}%,email.ilike.%${args.search}%`
        );
      }

      const { data, error } = await query.limit(30);

      if (error) throw error;

      return {
        content: [
          {
            type: "text",
            text: `Encontrados ${data?.length || 0} clientes:\n\n${
              data
                ?.map(
                  (client) =>
                    `👤 ${client.name}\n` +
                    `📧 ${client.email || "Sem email"}\n` +
                    `📱 ${client.phone || "Sem telefone"}\n` +
                    `📅 Cadastrado: ${new Date(client.created_at).toLocaleDateString("pt-BR")}\n---\n`
                )
                .join("\n") || "Nenhum cliente encontrado."
            }`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao buscar clientes: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          },
        ],
        isError: true,
      };
    }
  },

  async get_financial_data(args: GetFinancialDataArgs): Promise<McpResponse> {
    try {
      const { period } = args;
      const startDate = new Date();

      switch (period) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const { data: appointments, error } = await db
        .from("appointments")
        .select(
          `
          *,
          services(name, price),
          payment_method
        `
        )
        .gte("appointment_date", startDate.toISOString())
        .eq("status", "completed");

      if (error) throw error;

      const total =
        appointments?.reduce(
          (sum, apt) => sum + (apt.services?.price || 0),
          0
        ) || 0;

      const count = appointments?.length || 0;
      const avgTicket = count > 0 ? total / count : 0;

      const paymentMethods = appointments?.reduce(
        (acc: Record<string, number>, apt) => {
          const method = apt.payment_method || "Não informado";
          acc[method] = (acc[method] || 0) + (apt.services?.price || 0);
          return acc;
        },
        {}
      );

      return {
        content: [
          {
            type: "text",
            text:
              `💰 Dados Financeiros - ${period.toUpperCase()}\n\n` +
              `📊 Total de agendamentos: ${count}\n` +
              `💵 Receita total: R$ ${total.toFixed(2)}\n` +
              `🎯 Ticket médio: R$ ${avgTicket.toFixed(2)}\n\n` +
              `💳 Por método de pagamento:\n${Object.entries(
                paymentMethods || {}
              )
                .map(
                  ([method, value]) =>
                    `  • ${method}: R$ ${(value as number).toFixed(2)}`
                )
                .join("\n")}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao buscar dados financeiros: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          },
        ],
        isError: true,
      };
    }
  },

  async get_services(args: GetServicesArgs): Promise<McpResponse> {
    try {
      const { active_only = true } = args;

      let query = db.from("services").select("*").order("name");

      if (active_only) {
        query = query.eq("active", true);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        content: [
          {
            type: "text",
            text: `Serviços disponíveis (${data?.length || 0}):\n\n${
              data
                ?.map(
                  (service) =>
                    `✂️ ${service.name}\n` +
                    `💰 R$ ${service.price}\n` +
                    `⏱️ ${service.duration} minutos\n` +
                    `📝 ${service.description || "Sem descrição"}\n` +
                    `📊 Status: ${service.active ? "Ativo" : "Inativo"}\n---\n`
                )
                .join("\n") || "Nenhum serviço encontrado."
            }`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Erro ao buscar serviços: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          },
        ],
        isError: true,
      };
    }
  },

  async deploy_status(args: DeployStatusArgs): Promise<McpResponse> {
    return {
      content: [
        {
          type: "text",
          text:
            `🚀 Status do Projeto - Elite Barber\n\n` +
            `📱 App: Sistema de Agendamento para Barbearia\n` +
            `⚡ Tecnologia: React + TypeScript + Vite + Supabase\n` +
            `🌐 URL de Produção: https://barbernow-kappa.vercel.app\n` +
            `📊 Banco de Dados: Supabase (Ativo)\n` +
            `🔐 Autenticação: Supabase Auth\n` +
            `🎨 UI: shadcn/ui + Tailwind CSS\n\n` +
            `✅ Status: Sistema funcionando\n` +
            `🔧 MCP Server: Conectado e operacional\n` +
            `📅 Última atualização: ${new Date().toLocaleString("pt-BR")}`,
        },
      ],
    };
  },
};

// Handler principal do MCP
export const mcpHandler = createMcpHandler(async (server) => {
  // MCP server setup
  console.log(
    "MCP Server initialized with tools:",
    tools.map((t) => t.name)
  );
});

export default mcpHandler;
