
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  accepts_whatsapp: boolean;
  total_spent: number;
  last_visit: string | null;
  status: 'active' | 'blocked';
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
  status: 'scheduled' | 'completed' | 'cancelled';
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
