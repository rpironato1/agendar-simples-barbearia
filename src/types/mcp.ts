// Tipos específicos para o MCP (Model Context Protocol)

// Argumentos para as ferramentas MCP
export interface GetAppointmentsArgs {
  date?: string; // formato YYYY-MM-DD
  status?: "pending" | "confirmed" | "cancelled" | "completed";
}

export interface GetClientsArgs {
  search?: string;
}

export interface GetFinancialDataArgs {
  period: "today" | "week" | "month" | "year";
}

export interface GetServicesArgs {
  active_only?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeployStatusArgs {
  // Sem argumentos necessários
}

// Tipos de resposta MCP
export interface McpResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
}

// Tipos para componentes Admin
export interface PaymentStatus {
  status: "pending" | "partial" | "paid";
  amount: number;
  method?: "cash" | "card" | "pix";
}

export interface AppointmentWithRelations {
  id: string;
  client_id: string;
  service_id: string | null;
  barber_id: string | null;
  appointment_date: string;
  appointment_time: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    cpf?: string;
    total_spent?: number;
    last_visit?: string | null;
  };
  services?: {
    id: string;
    name: string;
    price: number;
    duration: number;
  };
  barbers?: {
    id: string;
    name: string;
  };
}

// Tipo para QueryClient setQueryData
export type AppointmentsQueryData = AppointmentWithRelations[];
