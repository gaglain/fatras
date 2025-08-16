export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      artist_files: {
        Row: {
          artist_id: string | null
          bucket_name: string
          category: string | null
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_id?: string | null
          bucket_name: string
          category?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_id?: string | null
          bucket_name?: string
          category?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_files_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      campaign_contact_lists: {
        Row: {
          campaign_id: string
          contact_list_id: string
          created_at: string
          id: string
        }
        Insert: {
          campaign_id: string
          contact_list_id: string
          created_at?: string
          id?: string
        }
        Update: {
          campaign_id?: string
          contact_list_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contact_lists_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contact_lists_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          bounced_count: number | null
          click_rate: number | null
          clicked_count: number | null
          content: string | null
          created_at: string | null
          delivered_count: number | null
          id: string
          name: string
          open_rate: number | null
          opened_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          subject: string | null
          target_audience: Json | null
          type: string
          unsubscribed_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bounced_count?: number | null
          click_rate?: number | null
          clicked_count?: number | null
          content?: string | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          name: string
          open_rate?: number | null
          opened_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string | null
          target_audience?: Json | null
          type: string
          unsubscribed_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bounced_count?: number | null
          click_rate?: number | null
          clicked_count?: number | null
          content?: string | null
          created_at?: string | null
          delivered_count?: number | null
          id?: string
          name?: string
          open_rate?: number | null
          opened_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          subject?: string | null
          target_audience?: Json | null
          type?: string
          unsubscribed_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      centralized_artists: {
        Row: {
          bio: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          current_tour: string | null
          facebook: string | null
          genre: string
          id: string
          image: string | null
          instagram: string | null
          name: string
          rating: number | null
          status: string
          total_shows: number | null
          upcoming_shows: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_tour?: string | null
          facebook?: string | null
          genre: string
          id?: string
          image?: string | null
          instagram?: string | null
          name: string
          rating?: number | null
          status?: string
          total_shows?: number | null
          upcoming_shows?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_tour?: string | null
          facebook?: string | null
          genre?: string
          id?: string
          image?: string | null
          instagram?: string | null
          name?: string
          rating?: number | null
          status?: string
          total_shows?: number | null
          upcoming_shows?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      centralized_events: {
        Row: {
          address: string | null
          artist_id: string | null
          attendees_count: number | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          end_date: string | null
          event_type: string | null
          id: string
          image: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          venue: string | null
        }
        Insert: {
          address?: string | null
          artist_id?: string | null
          attendees_count?: number | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          venue?: string | null
        }
        Update: {
          address?: string | null
          artist_id?: string | null
          attendees_count?: number | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      contact_list_members: {
        Row: {
          contact_id: string
          contact_list_id: string
          created_at: string
          id: string
        }
        Insert: {
          contact_id: string
          contact_list_id: string
          created_at?: string
          id?: string
        }
        Update: {
          contact_id?: string
          contact_list_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_list_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_list_members_contact_list_id_fkey"
            columns: ["contact_list_id"]
            isOneToOne: false
            referencedRelation: "contact_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          accepts_marketing_emails: boolean | null
          address: string | null
          city: string | null
          company: string | null
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
          company?: string | null
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
          company?: string | null
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
      email_analytics: {
        Row: {
          campaign_id: string
          contact_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          campaign_id: string
          contact_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          auto_send: boolean | null
          bounced_count: number | null
          click_rate: number | null
          clicked_count: number | null
          content: string
          created_at: string
          delivered_count: number | null
          id: string
          name: string
          open_rate: number | null
          opened_count: number | null
          recipient_count: number | null
          scheduled_at: string | null
          scheduled_for: string | null
          sent_at: string | null
          sent_count: number | null
          status: string
          subject: string
          template_id: string | null
          unsubscribed_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_send?: boolean | null
          bounced_count?: number | null
          click_rate?: number | null
          clicked_count?: number | null
          content: string
          created_at?: string
          delivered_count?: number | null
          id?: string
          name: string
          open_rate?: number | null
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject: string
          template_id?: string | null
          unsubscribed_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_send?: boolean | null
          bounced_count?: number | null
          click_rate?: number | null
          clicked_count?: number | null
          content?: string
          created_at?: string
          delivered_count?: number | null
          id?: string
          name?: string
          open_rate?: number | null
          opened_count?: number | null
          recipient_count?: number | null
          scheduled_at?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string
          subject?: string
          template_id?: string | null
          unsubscribed_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          is_subscribed: boolean | null
          last_name: string | null
          tags: Json | null
          unsubscribed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          is_subscribed?: boolean | null
          last_name?: string | null
          tags?: Json | null
          unsubscribed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          is_subscribed?: boolean | null
          last_name?: string | null
          tags?: Json | null
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_system: boolean | null
          name: string
          subject: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          name: string
          subject: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_system?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      emails: {
        Row: {
          attachments: Json | null
          campaign_id: string | null
          cc_email: string | null
          content: string
          created_at: string
          delivered_at: string | null
          from_email: string
          html_content: string | null
          id: string
          is_read: boolean | null
          is_starred: boolean | null
          metadata: Json | null
          opened_at: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          to_email: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          campaign_id?: string | null
          cc_email?: string | null
          content: string
          created_at?: string
          delivered_at?: string | null
          from_email: string
          html_content?: string | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          metadata?: Json | null
          opened_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          to_email: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          campaign_id?: string | null
          cc_email?: string | null
          content?: string
          created_at?: string
          delivered_at?: string | null
          from_email?: string
          html_content?: string | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          metadata?: Json | null
          opened_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          to_email?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
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
      legal_content: {
        Row: {
          content: string
          content_type: string
          created_at: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          content_type: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      publication_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          publication_id: string
          user_id: string
          username: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          publication_id: string
          user_id: string
          username: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          publication_id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_comments_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          assigned_to: string | null
          assigned_username: string | null
          content: string
          created_at: string
          created_by: string
          external_link: string | null
          id: string
          media_type: string | null
          media_url: string | null
          platform: string
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          assigned_username?: string | null
          content: string
          created_at?: string
          created_by: string
          external_link?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          platform: string
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          assigned_username?: string | null
          content?: string
          created_at?: string
          created_by?: string
          external_link?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          platform?: string
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
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
      shop_orders: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_address: Json | null
          customer_email: string
          customer_name: string | null
          id: string
          items: Json
          payment_method: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_address?: Json | null
          customer_email: string
          customer_name?: string | null
          id?: string
          items?: Json
          payment_method?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_address?: Json | null
          customer_email?: string
          customer_name?: string | null
          id?: string
          items?: Json
          payment_method?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      show_bible_documents: {
        Row: {
          bucket_name: string
          category: string
          created_at: string
          description: string | null
          file_path: string
          file_size_bytes: number
          file_size_display: string
          id: string
          name: string
          tags: string[] | null
          type: string
          updated_at: string
          url: string
          user_id: string
          version: string
        }
        Insert: {
          bucket_name?: string
          category: string
          created_at?: string
          description?: string | null
          file_path: string
          file_size_bytes?: number
          file_size_display: string
          id?: string
          name: string
          tags?: string[] | null
          type: string
          updated_at?: string
          url: string
          user_id: string
          version?: string
        }
        Update: {
          bucket_name?: string
          category?: string
          created_at?: string
          description?: string | null
          file_path?: string
          file_size_bytes?: number
          file_size_display?: string
          id?: string
          name?: string
          tags?: string[] | null
          type?: string
          updated_at?: string
          url?: string
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          artist_id: string | null
          assigned_to: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          event_id: string | null
          id: string
          priority: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          event_id?: string | null
          id?: string
          priority?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_event_id_fkey"
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
          availability: Json | null
          avatar_url: string | null
          bank_details: Json | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          contracts_fees: Json | null
          created_at: string
          email: string | null
          first_name: string | null
          function_title: string | null
          guso_id: string | null
          id: string
          identity_documents: Json | null
          is_active: boolean | null
          last_name: string | null
          nationality: string | null
          phone: string | null
          postal_code: string | null
          role: string
          show_name: string | null
          skills: string[] | null
          social_security_number: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          address?: string | null
          associated_artists?: string[] | null
          availability?: Json | null
          avatar_url?: string | null
          bank_details?: Json | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          contracts_fees?: Json | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          function_title?: string | null
          guso_id?: string | null
          id?: string
          identity_documents?: Json | null
          is_active?: boolean | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string
          show_name?: string | null
          skills?: string[] | null
          social_security_number?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          address?: string | null
          associated_artists?: string[] | null
          availability?: Json | null
          avatar_url?: string | null
          bank_details?: Json | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          contracts_fees?: Json | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          function_title?: string | null
          guso_id?: string | null
          id?: string
          identity_documents?: Json | null
          is_active?: boolean | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string
          show_name?: string | null
          skills?: string[] | null
          social_security_number?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      website_designs: {
        Row: {
          accent_color: string
          created_at: string
          footer_bg: string
          header_bg: string
          id: string
          link_color: string
          logo: string | null
          primary_color: string
          secondary_color: string
          site_name: string
          text_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color: string
          created_at?: string
          footer_bg: string
          header_bg: string
          id?: string
          link_color: string
          logo?: string | null
          primary_color: string
          secondary_color: string
          site_name: string
          text_color: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          footer_bg?: string
          header_bg?: string
          id?: string
          link_color?: string
          logo?: string | null
          primary_color?: string
          secondary_color?: string
          site_name?: string
          text_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      website_menu: {
        Row: {
          created_at: string | null
          id: string
          is_visible: boolean | null
          label: string
          menu_order: number | null
          parent_id: string | null
          target: string | null
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          menu_order?: number | null
          parent_id?: string | null
          target?: string | null
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          menu_order?: number | null
          parent_id?: string | null
          target?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "website_menu_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "website_menu"
            referencedColumns: ["id"]
          },
        ]
      }
      website_pages: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string | null
          page_type: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          page_type?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string | null
          page_type?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      website_seo: {
        Row: {
          created_at: string | null
          google_analytics_id: string | null
          google_search_console_id: string | null
          id: string
          og_image: string | null
          robots_txt: string | null
          site_description: string | null
          site_keywords: string | null
          site_title: string | null
          twitter_card_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          google_analytics_id?: string | null
          google_search_console_id?: string | null
          id?: string
          og_image?: string | null
          robots_txt?: string | null
          site_description?: string | null
          site_keywords?: string | null
          site_title?: string | null
          twitter_card_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          google_analytics_id?: string | null
          google_search_console_id?: string | null
          id?: string
          og_image?: string | null
          robots_txt?: string | null
          site_description?: string | null
          site_keywords?: string | null
          site_title?: string | null
          twitter_card_type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_shop_stats: {
        Row: {
          average_order_value: number | null
          completed_orders: number | null
          total_orders: number | null
          total_revenue: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_guest_order: {
        Args: {
          currency_param?: string
          customer_address_param?: Json
          customer_email_param: string
          customer_name_param?: string
          items_param?: Json
          payment_method_param?: string
          shop_owner_id: string
          total_amount_param: number
        }
        Returns: string
      }
      create_user_with_profile: {
        Args: { profile_data: Json; user_email: string; user_password: string }
        Returns: Json
      }
      get_guest_order_by_email: {
        Args: { customer_email_param: string; order_id_param: string }
        Returns: {
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          id: string
          items: Json
          status: string
          total_amount: number
        }[]
      }
      get_my_shop_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          average_order_value: number
          completed_orders: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_user_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          avatar_url: string
          city: string
          created_at: string
          email: string
          first_name: string
          function_title: string
          id: string
          is_active: boolean
          last_name: string
          phone: string
          role: string
          show_name: string
          updated_at: string
          user_id: string
          username: string
        }[]
      }
      update_campaign_stats: {
        Args: { campaign_id: string; event_type: string }
        Returns: undefined
      }
      update_user_profile_data: {
        Args: { profile_data: Json; profile_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
