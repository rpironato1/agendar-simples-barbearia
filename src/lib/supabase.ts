
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For development/demo purposes, we'll create a mock client if env vars are missing
let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase environment variables not found. Using mock mode.');
  // Create a mock supabase client for development
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock mode - authentication disabled' } }),
      signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Mock mode - authentication disabled' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Mock mode - database disabled' } })
        })
      }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Mock mode - database disabled' } })
    })
  };
}

export { supabase };

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
