import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dikfrwaqwbtibasxdvie.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpa2Zyd2Fxd2J0aWJhc3hkdmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MDI0MDksImV4cCI6MjA2NjM3ODQwOX0.iOOjd_rXKeDhYAMJuuRDQRP47rhthxLG_OlkCSaXmSA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types
export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  accepts_whatsapp: boolean;
  total_spent: number;
  last_visit: string | null;
  status: "active" | "blocked";
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Barber {
  id: string;
  name: string;
  phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
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
  client?: Client;
  service?: Service;
  barber?: Barber;
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  valid_until: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  appointment_id: string | null;
  amount: number;
  transaction_date: string;
  description: string | null;
  type: "income" | "expense";
  created_at: string;
  updated_at: string;
}

export interface CostItem {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  category: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CostRecord {
  id: string;
  cost_item_id: string;
  quantity: number;
  total_amount: number;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  cost_items?: CostItem;
}
