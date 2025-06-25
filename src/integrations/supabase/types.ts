export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          barber_id: string | null
          client_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          price: number | null
          service_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          barber_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          barber_id?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          service_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_barber_id_fkey"
            columns: ["barber_id"]
            isOneToOne: false
            referencedRelation: "barbers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      barbers: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          accepts_whatsapp: boolean | null
          cpf: string
          created_at: string | null
          id: string
          last_visit: string | null
          name: string
          phone: string
          status: string | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          accepts_whatsapp?: boolean | null
          cpf: string
          created_at?: string | null
          id?: string
          last_visit?: string | null
          name: string
          phone: string
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          accepts_whatsapp?: boolean | null
          cpf?: string
          created_at?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          phone?: string
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cost_items: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      cost_records: {
        Row: {
          cost_item_id: string | null
          created_at: string
          id: string
          notes: string | null
          purchase_date: string
          quantity: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          cost_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          quantity?: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          cost_item_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          purchase_date?: string
          quantity?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_records_cost_item_id_fkey"
            columns: ["cost_item_id"]
            isOneToOne: false
            referencedRelation: "cost_items"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          created_at: string
          description: string | null
          id: string
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          title: string
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          title: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          title?: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          duration: number
          id: string
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
