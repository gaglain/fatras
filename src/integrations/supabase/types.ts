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
      artist_events: {
        Row: {
          artist_id: string
          created_at: string
          event_id: string
          id: string
          role: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string
          event_id: string
          id?: string
          role?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string
          event_id?: string
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_events_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      artist_opportunities: {
        Row: {
          artist_id: string
          created_at: string
          id: string
          opportunity_id: string
          role: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string
          id?: string
          opportunity_id: string
          role?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string
          id?: string
          opportunity_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_opportunities_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_users: {
        Row: {
          artist_id: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_users_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      background_images: {
        Row: {
          category: string | null
          created_at: string | null
          file_size: number | null
          height: number | null
          id: string
          name: string
          source_id: string | null
          source_type: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string | null
          url: string
          user_id: string
          width: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          name: string
          source_id?: string | null
          source_type?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          url: string
          user_id: string
          width?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          name?: string
          source_id?: string | null
          source_type?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          calendar_id: string
          created_at: string
          description: string | null
          end_time: string
          external_id: string
          id: string
          location: string | null
          provider: string
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          calendar_id: string
          created_at?: string
          description?: string | null
          end_time: string
          external_id: string
          id?: string
          location?: string | null
          provider?: string
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          calendar_id?: string
          created_at?: string
          description?: string | null
          end_time?: string
          external_id?: string
          id?: string
          location?: string | null
          provider?: string
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "email_campaigns"
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
          audio_files: Json | null
          audio_url: string | null
          bio: string | null
          booking_contact_id: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          current_tour: string | null
          email_template_id: string | null
          facebook: string | null
          genre: string
          id: string
          image: string | null
          instagram: string | null
          logo_url: string | null
          name: string
          official_photos: string[] | null
          photos: string[] | null
          presentation_pdf_url: string | null
          presentation_text: string | null
          press_kit_url: string | null
          quote_template_id: string | null
          rating: number | null
          short_description: string | null
          status: string
          tech_sheet_pdf_url: string | null
          technical_contact_id: string | null
          total_shows: number | null
          upcoming_shows: number | null
          updated_at: string
          user_id: string
          video_url: string | null
          website: string | null
        }
        Insert: {
          audio_files?: Json | null
          audio_url?: string | null
          bio?: string | null
          booking_contact_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_tour?: string | null
          email_template_id?: string | null
          facebook?: string | null
          genre: string
          id?: string
          image?: string | null
          instagram?: string | null
          logo_url?: string | null
          name: string
          official_photos?: string[] | null
          photos?: string[] | null
          presentation_pdf_url?: string | null
          presentation_text?: string | null
          press_kit_url?: string | null
          quote_template_id?: string | null
          rating?: number | null
          short_description?: string | null
          status?: string
          tech_sheet_pdf_url?: string | null
          technical_contact_id?: string | null
          total_shows?: number | null
          upcoming_shows?: number | null
          updated_at?: string
          user_id: string
          video_url?: string | null
          website?: string | null
        }
        Update: {
          audio_files?: Json | null
          audio_url?: string | null
          bio?: string | null
          booking_contact_id?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          current_tour?: string | null
          email_template_id?: string | null
          facebook?: string | null
          genre?: string
          id?: string
          image?: string | null
          instagram?: string | null
          logo_url?: string | null
          name?: string
          official_photos?: string[] | null
          photos?: string[] | null
          presentation_pdf_url?: string | null
          presentation_text?: string | null
          press_kit_url?: string | null
          quote_template_id?: string | null
          rating?: number | null
          short_description?: string | null
          status?: string
          tech_sheet_pdf_url?: string | null
          technical_contact_id?: string | null
          total_shows?: number | null
          upcoming_shows?: number | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centralized_artists_booking_contact_id_fkey"
            columns: ["booking_contact_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centralized_artists_email_template_id_fkey"
            columns: ["email_template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centralized_artists_quote_template_id_fkey"
            columns: ["quote_template_id"]
            isOneToOne: false
            referencedRelation: "quote_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centralized_artists_technical_contact_id_fkey"
            columns: ["technical_contact_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      contact_artists: {
        Row: {
          artist_id: string
          contact_id: string
          created_at: string
          id: string
          role: string | null
        }
        Insert: {
          artist_id: string
          contact_id: string
          created_at?: string
          id?: string
          role?: string | null
        }
        Update: {
          artist_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      contact_events: {
        Row: {
          contact_id: string
          created_at: string
          event_id: string
          id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          event_id: string
          id?: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          event_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "centralized_events"
            referencedColumns: ["id"]
          },
        ]
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
          artist_id: string | null
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_lists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_lists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_opportunities: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          opportunity_id: string
          role: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          opportunity_id: string
          role?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          opportunity_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_quotes: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          quote_id: string
          role: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          quote_id: string
          role?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          quote_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_quotes_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_types: {
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
      contacts: {
        Row: {
          accepts_marketing_emails: boolean | null
          address: string | null
          city: string | null
          company: string | null
          contact_type_id: string | null
          country: string | null
          created_at: string | null
          email: string | null
          event_id: string | null
          event_type_id: string | null
          external_id: string | null
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
          contact_type_id?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          event_type_id?: string | null
          external_id?: string | null
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
          contact_type_id?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          event_id?: string | null
          event_type_id?: string | null
          external_id?: string | null
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
            foreignKeyName: "contacts_contact_type_id_fkey"
            columns: ["contact_type_id"]
            isOneToOne: false
            referencedRelation: "contact_types"
            referencedColumns: ["id"]
          },
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
      email_accounts: {
        Row: {
          access_token: string | null
          created_at: string | null
          email: string
          id: string
          imap_config: Json | null
          is_active: boolean | null
          is_organization_shared: boolean | null
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          email: string
          id?: string
          imap_config?: Json | null
          is_active?: boolean | null
          is_organization_shared?: boolean | null
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          email?: string
          id?: string
          imap_config?: Json | null
          is_active?: boolean | null
          is_organization_shared?: boolean | null
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          artist_id: string | null
          auto_send: boolean | null
          bounced_count: number | null
          click_rate: number | null
          clicked_count: number | null
          content: string
          created_at: string
          delivered_count: number | null
          event_id: string | null
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
          artist_id?: string | null
          auto_send?: boolean | null
          bounced_count?: number | null
          click_rate?: number | null
          clicked_count?: number | null
          content: string
          created_at?: string
          delivered_count?: number | null
          event_id?: string | null
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
          artist_id?: string | null
          auto_send?: boolean | null
          bounced_count?: number | null
          click_rate?: number | null
          clicked_count?: number | null
          content?: string
          created_at?: string
          delivered_count?: number | null
          event_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "email_campaigns_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      email_notifications: {
        Row: {
          created_at: string | null
          email_id: string | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          attachments: Json | null
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
          attachments?: Json | null
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
          attachments?: Json | null
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
          bcc_emails: string[] | null
          campaign_id: string | null
          cc_email: string | null
          cc_emails: string[] | null
          contact_id: string | null
          content: string | null
          created_at: string
          delivered_at: string | null
          direction: string | null
          from_email: string | null
          from_name: string | null
          html_content: string | null
          id: string
          is_read: boolean | null
          is_starred: boolean | null
          labels: string[] | null
          message_id: string | null
          metadata: Json | null
          opened_at: string | null
          provider: string | null
          read_at: string | null
          received_at: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          thread_id: string | null
          to_email: string | null
          to_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          bcc_emails?: string[] | null
          campaign_id?: string | null
          cc_email?: string | null
          cc_emails?: string[] | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          labels?: string[] | null
          message_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          provider?: string | null
          read_at?: string | null
          received_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          to_email?: string | null
          to_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          bcc_emails?: string[] | null
          campaign_id?: string | null
          cc_email?: string | null
          cc_emails?: string[] | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          delivered_at?: string | null
          direction?: string | null
          from_email?: string | null
          from_name?: string | null
          html_content?: string | null
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          labels?: string[] | null
          message_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          provider?: string | null
          read_at?: string | null
          received_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          thread_id?: string | null
          to_email?: string | null
          to_name?: string | null
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
          {
            foreignKeyName: "emails_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
          artist_id: string | null
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
          external_id: string | null
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
          artist_id?: string | null
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
          external_id?: string | null
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
          artist_id?: string | null
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
          external_id?: string | null
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
            foreignKeyName: "events_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string | null
          data: Json
          form_id: string
          id: string
          ip_address: string | null
          submitted_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          form_id: string
          id?: string
          ip_address?: string | null
          submitted_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          form_id?: string
          id?: string
          ip_address?: string | null
          submitted_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          name: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          name: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          name?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inbound_emails: {
        Row: {
          attachments: Json | null
          content: string | null
          created_at: string | null
          direction: string | null
          from_email: string
          from_name: string | null
          html_content: string | null
          id: string
          labels: string[] | null
          message_id: string
          provider: string
          read_at: string | null
          received_at: string | null
          sender_name: string | null
          subject: string | null
          thread_id: string | null
          to_email: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          created_at?: string | null
          direction?: string | null
          from_email: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          labels?: string[] | null
          message_id: string
          provider: string
          read_at?: string | null
          received_at?: string | null
          sender_name?: string | null
          subject?: string | null
          thread_id?: string | null
          to_email: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          created_at?: string | null
          direction?: string | null
          from_email?: string
          from_name?: string | null
          html_content?: string | null
          id?: string
          labels?: string[] | null
          message_id?: string
          provider?: string
          read_at?: string | null
          received_at?: string | null
          sender_name?: string | null
          subject?: string | null
          thread_id?: string | null
          to_email?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      messaging_channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "messaging_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_channels: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          roadshow_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          roadshow_id?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          roadshow_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messaging_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          edited_at: string | null
          id: string
          message_type: string
          metadata: Json | null
          reply_to_id: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          reply_to_id?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          reply_to_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "messaging_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messaging_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messaging_messages"
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
      opportunities: {
        Row: {
          artist_id: string | null
          budget: number | null
          contact: string | null
          contact_id: string | null
          created_at: string
          date: string | null
          deadline: string | null
          description: string | null
          event_id: string | null
          id: string
          location: string | null
          probability_percentage: number | null
          requirements: string | null
          status: string | null
          task_id: string | null
          title: string
          updated_at: string
          user_id: string
          venue: string | null
        }
        Insert: {
          artist_id?: string | null
          budget?: number | null
          contact?: string | null
          contact_id?: string | null
          created_at?: string
          date?: string | null
          deadline?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          location?: string | null
          probability_percentage?: number | null
          requirements?: string | null
          status?: string | null
          task_id?: string | null
          title: string
          updated_at?: string
          user_id: string
          venue?: string | null
        }
        Update: {
          artist_id?: string | null
          budget?: number | null
          contact?: string | null
          contact_id?: string | null
          created_at?: string
          date?: string | null
          deadline?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          location?: string | null
          probability_percentage?: number | null
          requirements?: string | null
          status?: string | null
          task_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      opportunity_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          opportunity_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          opportunity_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          opportunity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_events_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
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
      public_shop_stats: {
        Row: {
          average_order_value: number | null
          completed_orders: number | null
          total_orders: number | null
          total_revenue: number | null
          user_id: string | null
        }
        Insert: {
          average_order_value?: number | null
          completed_orders?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          user_id?: string | null
        }
        Update: {
          average_order_value?: number | null
          completed_orders?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          user_id?: string | null
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
          artist_id: string | null
          assigned_to: string | null
          assigned_username: string | null
          content: string
          created_at: string
          created_by: string
          event_id: string | null
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
          artist_id?: string | null
          assigned_to?: string | null
          assigned_username?: string | null
          content: string
          created_at?: string
          created_by: string
          event_id?: string | null
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
          artist_id?: string | null
          assigned_to?: string | null
          assigned_username?: string | null
          content?: string
          created_at?: string
          created_by?: string
          event_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "publications_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_events: {
        Row: {
          created_at: string
          event_id: string
          id: string
          quote_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          quote_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_events_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
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
      quote_opportunities: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          quote_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          quote_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_opportunities_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_templates: {
        Row: {
          category: string
          created_at: string
          default_items: Json | null
          default_terms: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          default_items?: Json | null
          default_terms?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          default_items?: Json | null
          default_terms?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          artist_id: string | null
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
          vat_rate: number
        }
        Insert: {
          artist_id?: string | null
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
          vat_rate?: number
        }
        Update: {
          artist_id?: string | null
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
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
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
      roadshow_contacts: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          roadshow_stop_id: string
          role: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          roadshow_stop_id: string
          role?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          roadshow_stop_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadshow_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadshow_contacts_roadshow_stop_id_fkey"
            columns: ["roadshow_stop_id"]
            isOneToOne: false
            referencedRelation: "roadshow_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      roadshow_expenses: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          file_type: string
          file_url: string
          id: string
          roadshow_stop_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          file_type: string
          file_url: string
          id?: string
          roadshow_stop_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          file_type?: string
          file_url?: string
          id?: string
          roadshow_stop_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadshow_expenses_roadshow_stop_id_fkey"
            columns: ["roadshow_stop_id"]
            isOneToOne: false
            referencedRelation: "roadshow_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      roadshow_opportunities: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          roadshow_stop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          roadshow_stop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          roadshow_stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadshow_opportunities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadshow_opportunities_roadshow_stop_id_fkey"
            columns: ["roadshow_stop_id"]
            isOneToOne: false
            referencedRelation: "roadshow_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      roadshow_stop_contacts: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          roadshow_stop_id: string
          role: string | null
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          roadshow_stop_id: string
          role?: string | null
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          roadshow_stop_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadshow_stop_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadshow_stop_contacts_roadshow_stop_id_fkey"
            columns: ["roadshow_stop_id"]
            isOneToOne: false
            referencedRelation: "roadshow_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      roadshow_stop_contracts: {
        Row: {
          contract_id: string
          created_at: string | null
          id: string
          roadshow_stop_id: string
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          id?: string
          roadshow_stop_id: string
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          id?: string
          roadshow_stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadshow_stop_contracts_roadshow_stop_id_fkey"
            columns: ["roadshow_stop_id"]
            isOneToOne: false
            referencedRelation: "roadshow_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      roadshow_stop_events: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          roadshow_stop_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          roadshow_stop_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          roadshow_stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadshow_stop_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadshow_stop_events_roadshow_stop_id_fkey"
            columns: ["roadshow_stop_id"]
            isOneToOne: false
            referencedRelation: "roadshow_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      roadshow_stop_quotes: {
        Row: {
          created_at: string | null
          id: string
          quote_id: string
          roadshow_stop_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          quote_id: string
          roadshow_stop_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          quote_id?: string
          roadshow_stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadshow_stop_quotes_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadshow_stop_quotes_roadshow_stop_id_fkey"
            columns: ["roadshow_stop_id"]
            isOneToOne: false
            referencedRelation: "roadshow_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      roadshow_stops: {
        Row: {
          accommodation: string | null
          accommodation_address: string | null
          address: string | null
          artist_lineup: Json | null
          artists: string[] | null
          capacity: number | null
          check_in_time: string | null
          city: string
          created_at: string
          crew: string[] | null
          departure_time: string | null
          equipment: string[] | null
          event_date: string | null
          event_time: string | null
          id: string
          local_contact: string | null
          local_contact_phone: string | null
          notes: string | null
          opportunity_id: string | null
          quote_id: string | null
          status: string
          tickets_available: number | null
          transport: string | null
          updated_at: string
          user_id: string
          venue: string
        }
        Insert: {
          accommodation?: string | null
          accommodation_address?: string | null
          address?: string | null
          artist_lineup?: Json | null
          artists?: string[] | null
          capacity?: number | null
          check_in_time?: string | null
          city: string
          created_at?: string
          crew?: string[] | null
          departure_time?: string | null
          equipment?: string[] | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          local_contact?: string | null
          local_contact_phone?: string | null
          notes?: string | null
          opportunity_id?: string | null
          quote_id?: string | null
          status?: string
          tickets_available?: number | null
          transport?: string | null
          updated_at?: string
          user_id: string
          venue: string
        }
        Update: {
          accommodation?: string | null
          accommodation_address?: string | null
          address?: string | null
          artist_lineup?: Json | null
          artists?: string[] | null
          capacity?: number | null
          check_in_time?: string | null
          city?: string
          created_at?: string
          crew?: string[] | null
          departure_time?: string | null
          equipment?: string[] | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          local_contact?: string | null
          local_contact_phone?: string | null
          notes?: string | null
          opportunity_id?: string | null
          quote_id?: string | null
          status?: string
          tickets_available?: number | null
          transport?: string | null
          updated_at?: string
          user_id?: string
          venue?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadshow_stops_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadshow_stops_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_read: boolean
          can_update: boolean
          created_at: string
          id: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_read?: boolean
          can_update?: boolean
          created_at?: string
          id?: string
          resource: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_read?: boolean
          can_update?: boolean
          created_at?: string
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
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
          artists: string[] | null
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
          artists?: string[] | null
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
          artists?: string[] | null
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
      show_bible_notes: {
        Row: {
          artist_id: string | null
          content: string
          content_type: string
          created_at: string
          id: string
          is_pinned: boolean | null
          mentioned_users: string[] | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_id?: string | null
          content: string
          content_type?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          mentioned_users?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_id?: string | null
          content?: string
          content_type?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          mentioned_users?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "show_bible_notes_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_notifications: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          is_read: boolean
          message: string
          notification_type: string
          sync_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          is_read?: boolean
          message: string
          notification_type: string
          sync_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: string
          sync_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_tasks: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          last_sync_at: string | null
          next_sync_at: string | null
          sync_interval_minutes: number
          sync_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          next_sync_at?: string | null
          sync_interval_minutes?: number
          sync_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          last_sync_at?: string | null
          next_sync_at?: string | null
          sync_interval_minutes?: number
          sync_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_entities: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_entities_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_imports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          errors: Json | null
          filename: string
          id: string
          processed_rows: number | null
          status: string
          total_rows: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          errors?: Json | null
          filename: string
          id?: string
          processed_rows?: number | null
          status?: string
          total_rows?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          errors?: Json | null
          filename?: string
          id?: string
          processed_rows?: number | null
          status?: string
          total_rows?: number | null
          user_id?: string
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
          task_type: string | null
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
          task_type?: string | null
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
          task_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "centralized_artists"
            referencedColumns: ["id"]
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
          email_signature: string | null
          email_tracking_enabled: boolean | null
          entertainment_leave_number: string | null
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
          tax_reduction: boolean | null
          updated_at: string
          user_id: string | null
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
          email_signature?: string | null
          email_tracking_enabled?: boolean | null
          entertainment_leave_number?: string | null
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
          tax_reduction?: boolean | null
          updated_at?: string
          user_id?: string | null
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
          email_signature?: string | null
          email_tracking_enabled?: boolean | null
          entertainment_leave_number?: string | null
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
          tax_reduction?: boolean | null
          updated_at?: string
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
            foreignKeyName: "website_menu_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "website_menu"
            referencedColumns: ["id"]
          },
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
      [_ in never]: never
    }
    Functions: {
      check_channel_access: {
        Args: { channel_id_param: string; user_id_param: string }
        Returns: boolean
      }
      create_direct_message_channel: {
        Args: { other_user_id: string }
        Returns: string
      }
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
      create_messaging_channel: {
        Args: {
          channel_description?: string
          channel_name: string
          channel_type?: string
          member_user_ids?: string[]
          roadshow_ref_id?: string
        }
        Returns: string
      }
      create_user_with_profile: {
        Args: { profile_data: Json; user_email: string; user_password: string }
        Returns: Json
      }
      delete_user_completely: {
        Args: { target_user_id: string }
        Returns: Json
      }
      get_active_users_basic: {
        Args: never
        Returns: {
          avatar_url: string
          email: string
          first_name: string
          is_active: boolean
          last_name: string
          role: string
          user_id: string
          username: string
        }[]
      }
      get_event_contacts: {
        Args: { event_id_param: string }
        Returns: {
          company: string
          contact_id: string
          email: string
          first_name: string
          last_name: string
          phone: string
          role: string
        }[]
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
        Args: never
        Returns: {
          average_order_value: number
          completed_orders: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_user_profiles: {
        Args: never
        Returns: {
          address: string
          associated_artists: string[]
          availability: Json
          avatar_url: string
          bank_details: Json
          birth_date: string
          birth_place: string
          city: string
          contracts_fees: Json
          created_at: string
          email: string
          first_name: string
          function_title: string
          guso_id: string
          id: string
          identity_documents: Json
          is_active: boolean
          last_name: string
          nationality: string
          phone: string
          postal_code: string
          role: string
          show_name: string
          skills: string[]
          social_security_number: string
          updated_at: string
          user_id: string
          username: string
        }[]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: { _action: string; _resource: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: { Args: never; Returns: boolean }
      is_channel_owner: { Args: { channel_id_param: string }; Returns: boolean }
      is_member_of_channel: {
        Args: { _channel_id: string; _user_id: string }
        Returns: boolean
      }
      is_owner_of_channel: {
        Args: { _channel_id: string; _user_id: string }
        Returns: boolean
      }
      is_public_active_channel: {
        Args: { _channel_id: string }
        Returns: boolean
      }
      refresh_shop_stats: { Args: never; Returns: undefined }
      send_password_reset_email: { Args: { user_email: string }; Returns: Json }
      update_campaign_stats: {
        Args: { campaign_id: string; event_type: string }
        Returns: undefined
      }
      update_email_contact_links: { Args: never; Returns: undefined }
      update_user_profile_data: {
        Args: { profile_data: Json; profile_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "collaborator"
        | "artiste"
        | "user"
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
    Enums: {
      app_role: [
        "super_admin",
        "admin",
        "manager",
        "collaborator",
        "artiste",
        "user",
      ],
    },
  },
} as const
