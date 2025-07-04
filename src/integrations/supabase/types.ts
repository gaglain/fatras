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
      campaigns: {
        Row: {
          click_rate: number | null
          content: string | null
          created_at: string | null
          id: string
          name: string
          open_rate: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          target_audience: Json | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          click_rate?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          name: string
          open_rate?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          target_audience?: Json | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          click_rate?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          name?: string
          open_rate?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          target_audience?: Json | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          accepts_marketing_emails: boolean | null
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          event_id: string | null
          event_type_id: string | null
          first_name: string
          id: string
          last_name: string
          lead_score: number | null
          notes: string | null
          phone: string | null
          position: string | null
          postal_code: string | null
          role: string | null
          source: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepts_marketing_emails?: boolean | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          event_type_id?: string | null
          first_name: string
          id?: string
          last_name: string
          lead_score?: number | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          postal_code?: string | null
          role?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepts_marketing_emails?: boolean | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          event_type_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          lead_score?: number | null
          notes?: string | null
          phone?: string | null
          position?: string | null
          postal_code?: string | null
          role?: string | null
          source?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          address: string | null
          attendees_count: number | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          contact_id: string | null
          country: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          id: string
          notes: string | null
          postal_code: string | null
          requirements: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          venue: string | null
        }
        Insert: {
          address?: string | null
          attendees_count?: number | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          contact_id?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          notes?: string | null
          postal_code?: string | null
          requirements?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          venue?: string | null
        }
        Update: {
          address?: string | null
          attendees_count?: number | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          contact_id?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          notes?: string | null
          postal_code?: string | null
          requirements?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          service: string
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          service: string
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          service?: string
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          channel: string | null
          contact_id: string
          content: string | null
          created_at: string | null
          direction: string | null
          id: string
          metadata: Json | null
          subject: string | null
          type: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          contact_id: string
          content?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          metadata?: Json | null
          subject?: string | null
          type: string
          user_id: string
        }
        Update: {
          channel?: string | null
          contact_id?: string
          content?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          metadata?: Json | null
          subject?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          name: string
          order_id: string
          product_id: string | null
          product_variation_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          order_id: string
          product_id?: string | null
          product_variation_id?: string | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          order_id?: string
          product_id?: string | null
          product_variation_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_variation_id_fkey"
            columns: ["product_variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          contact_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variations: {
        Row: {
          attributes: Json | null
          created_at: string | null
          id: string
          name: string
          price: number
          product_id: string
          sku: string | null
          stock_quantity: number | null
        }
        Insert: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          name: string
          price: number
          product_id: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Update: {
          attributes?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          price?: number
          product_id?: string
          sku?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          min_stock_level: number | null
          name: string
          price: number
          sku: string | null
          status: string | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          min_stock_level?: number | null
          name: string
          price?: number
          sku?: string | null
          status?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          min_stock_level?: number | null
          name?: string
          price?: number
          sku?: string | null
          status?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          quantity: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          quantity?: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          quantity?: number
          quote_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          contact_id: string | null
          created_at: string | null
          description: string | null
          discount_amount: number | null
          event_id: string | null
          id: string
          notes: string | null
          quote_number: string
          status: string | null
          tax_amount: number | null
          terms: string | null
          title: string
          total_amount: number
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          event_id?: string | null
          id?: string
          notes?: string | null
          quote_number: string
          status?: string | null
          tax_amount?: number | null
          terms?: string | null
          title: string
          total_amount?: number
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          event_id?: string | null
          id?: string
          notes?: string | null
          quote_number?: string
          status?: string | null
          tax_amount?: number | null
          terms?: string | null
          title?: string
          total_amount?: number
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address: string | null
          associated_artists: string[] | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          created_at: string
          email: string | null
          first_name: string | null
          function_title: string | null
          guso_id: string | null
          id: string
          last_name: string | null
          nationality: string | null
          phone: string | null
          postal_code: string | null
          role: string
          show_name: string | null
          social_security_number: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          address?: string | null
          associated_artists?: string[] | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          function_title?: string | null
          guso_id?: string | null
          id?: string
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string
          show_name?: string | null
          social_security_number?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          address?: string | null
          associated_artists?: string[] | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          function_title?: string | null
          guso_id?: string | null
          id?: string
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string
          show_name?: string | null
          social_security_number?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
