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
      admin_webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          failure_count: number
          id: string
          is_active: boolean
          last_status: number | null
          last_triggered_at: string | null
          name: string
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_status?: number | null
          last_triggered_at?: string | null
          name: string
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_status?: number | null
          last_triggered_at?: string | null
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          published_at: string | null
          status: string
          target: string
          target_panel_ids: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          status?: string
          target?: string
          target_panel_ids?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          status?: string
          target?: string
          target_panel_ids?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_logs: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown
          method: string
          panel_id: string | null
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown
          method: string
          panel_id?: string | null
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown
          method?: string
          panel_id?: string | null
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          panel_id: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          panel_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          panel_id?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      balance_alerts: {
        Row: {
          alert_type: string
          created_at: string
          current_balance: number
          id: string
          is_read: boolean | null
          panel_id: string | null
          threshold: number
        }
        Insert: {
          alert_type?: string
          created_at?: string
          current_balance: number
          id?: string
          is_read?: boolean | null
          panel_id?: string | null
          threshold: number
        }
        Update: {
          alert_type?: string
          created_at?: string
          current_balance?: number
          id?: string
          is_read?: boolean | null
          panel_id?: string | null
          threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "balance_alerts_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          panel_id: string | null
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          panel_id?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          panel_id?: string | null
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_operation_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_log: Json | null
          failed_items: number
          id: string
          operation_data: Json | null
          operation_type: string
          panel_id: string | null
          processed_items: number
          started_at: string | null
          status: string
          target_ids: string[]
          total_items: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_log?: Json | null
          failed_items?: number
          id?: string
          operation_data?: Json | null
          operation_type: string
          panel_id?: string | null
          processed_items?: number
          started_at?: string | null
          status?: string
          target_ids?: string[]
          total_items: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_log?: Json | null
          failed_items?: number
          id?: string
          operation_data?: Json | null
          operation_type?: string
          panel_id?: string | null
          processed_items?: number
          started_at?: string | null
          status?: string
          target_ids?: string[]
          total_items?: number
        }
        Relationships: [
          {
            foreignKeyName: "bulk_operation_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_operation_jobs_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_cart: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          panel_id: string
          quantity: number
          service_id: string
          target_url: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          panel_id: string
          quantity?: number
          service_id: string
          target_url: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          panel_id?: string
          quantity?: number
          service_id?: string
          target_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_cart_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_cart_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_cart_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_favorites: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          id: string
          panel_id: string | null
          service_id: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          panel_id?: string | null
          service_id?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          panel_id?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_favorites_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_favorites_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_favorites_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_notifications: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          order_id: string | null
          panel_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          order_id?: string | null
          panel_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          order_id?: string | null
          panel_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_notifications_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_notifications_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_themes: {
        Row: {
          created_at: string | null
          dark_palette: Json | null
          font_family: string | null
          heading_font: string | null
          id: string
          is_active: boolean | null
          layout_config: Json | null
          light_palette: Json | null
          panel_id: string | null
          theme_key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dark_palette?: Json | null
          font_family?: string | null
          heading_font?: string | null
          id?: string
          is_active?: boolean | null
          layout_config?: Json | null
          light_palette?: Json | null
          panel_id?: string | null
          theme_key?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dark_palette?: Json | null
          font_family?: string | null
          heading_font?: string | null
          id?: string
          is_active?: boolean | null
          layout_config?: Json | null
          light_palette?: Json | null
          panel_id?: string | null
          theme_key?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_themes_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      canned_responses: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          panel_id: string | null
          shortcut: string | null
          title: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          panel_id?: string | null
          shortcut?: string | null
          title: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          panel_id?: string | null
          shortcut?: string | null
          title?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "canned_responses_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_type: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_type: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          panel_id: string | null
          status: string
          updated_at: string
          visitor_email: string | null
          visitor_id: string
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          panel_id?: string | null
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_id: string
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          panel_id?: string | null
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_id?: string
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      client_custom_prices: {
        Row: {
          client_id: string | null
          created_at: string
          custom_price: number | null
          discount_percent: number | null
          id: string
          panel_id: string | null
          service_id: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          custom_price?: number | null
          discount_percent?: number | null
          id?: string
          panel_id?: string | null
          service_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          custom_price?: number | null
          discount_percent?: number | null
          id?: string
          panel_id?: string | null
          service_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_custom_prices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_prices_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_custom_prices_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          balance: number | null
          ban_reason: string | null
          banned_at: string | null
          created_at: string
          custom_discount: number | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          is_banned: boolean | null
          is_vip: boolean | null
          last_login_at: string | null
          low_balance_threshold: number | null
          panel_id: string | null
          password_hash: string | null
          password_temp: string | null
          preferred_language: string | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          timezone: string | null
          total_spent: number | null
          updated_at: string
          username: string | null
          vip_since: string | null
        }
        Insert: {
          balance?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          created_at?: string
          custom_discount?: number | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_banned?: boolean | null
          is_vip?: boolean | null
          last_login_at?: string | null
          low_balance_threshold?: number | null
          panel_id?: string | null
          password_hash?: string | null
          password_temp?: string | null
          preferred_language?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          timezone?: string | null
          total_spent?: number | null
          updated_at?: string
          username?: string | null
          vip_since?: string | null
        }
        Update: {
          balance?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          created_at?: string
          custom_discount?: number | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_banned?: boolean | null
          is_vip?: boolean | null
          last_login_at?: string | null
          low_balance_threshold?: number | null
          panel_id?: string | null
          password_hash?: string | null
          password_temp?: string | null
          preferred_language?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          timezone?: string | null
          total_spent?: number | null
          updated_at?: string
          username?: string | null
          vip_since?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_users_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_verifications: {
        Row: {
          created_at: string
          dns_records: Json | null
          domain: string
          expires_at: string | null
          id: string
          panel_id: string | null
          updated_at: string
          verification_status: string | null
          verification_token: string
          verification_type: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          dns_records?: Json | null
          domain: string
          expires_at?: string | null
          id?: string
          panel_id?: string | null
          updated_at?: string
          verification_status?: string | null
          verification_token: string
          verification_type: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          dns_records?: Json | null
          domain?: string
          expires_at?: string | null
          id?: string
          panel_id?: string | null
          updated_at?: string
          verification_status?: string | null
          verification_token?: string
          verification_type?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "domain_verifications_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_logs: {
        Row: {
          created_at: string
          email: string
          email_action_type: string
          id: string
          metadata: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_action_type: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_action_type?: string
          id?: string
          metadata?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      order_refills: {
        Row: {
          created_at: string | null
          external_refill_id: string | null
          id: string
          order_id: string | null
          panel_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          external_refill_id?: string | null
          id?: string
          order_id?: string | null
          panel_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          external_refill_id?: string | null
          id?: string
          order_id?: string | null
          panel_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_refills_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_refills_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string | null
          completed_at: string | null
          created_at: string
          estimated_completion: string | null
          id: string
          notes: string | null
          order_number: string
          panel_id: string | null
          price: number
          progress: number | null
          provider_order_id: string | null
          quantity: number
          remains: number | null
          service_id: string | null
          start_count: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          target_url: string
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_completion?: string | null
          id?: string
          notes?: string | null
          order_number: string
          panel_id?: string | null
          price: number
          progress?: number | null
          provider_order_id?: string | null
          quantity: number
          remains?: number | null
          service_id?: string | null
          start_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          target_url: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string
          estimated_completion?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          panel_id?: string | null
          price?: number
          progress?: number | null
          provider_order_id?: string | null
          quantity?: number
          remains?: number | null
          service_id?: string | null
          start_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          target_url?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_analytics: {
        Row: {
          active_users: number | null
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          new_users: number | null
          panel_id: string | null
          total_orders: number | null
          total_revenue: number | null
        }
        Insert: {
          active_users?: number | null
          conversion_rate?: number | null
          created_at?: string
          date: string
          id?: string
          new_users?: number | null
          panel_id?: string | null
          total_orders?: number | null
          total_revenue?: number | null
        }
        Update: {
          active_users?: number | null
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          new_users?: number | null
          panel_id?: string | null
          total_orders?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_analytics_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          panel_id: string | null
          updated_at: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          panel_id?: string | null
          updated_at?: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          panel_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panel_api_keys_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_domains: {
        Row: {
          created_at: string
          dns_configured: boolean | null
          domain: string
          expected_target: string | null
          hosting_provider: string | null
          id: string
          is_primary: boolean | null
          panel_id: string | null
          ssl_status: string | null
          txt_verification_record: string | null
          txt_verified_at: string | null
          updated_at: string
          verification_status: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          dns_configured?: boolean | null
          domain: string
          expected_target?: string | null
          hosting_provider?: string | null
          id?: string
          is_primary?: boolean | null
          panel_id?: string | null
          ssl_status?: string | null
          txt_verification_record?: string | null
          txt_verified_at?: string | null
          updated_at?: string
          verification_status?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          dns_configured?: boolean | null
          domain?: string
          expected_target?: string | null
          hosting_provider?: string | null
          id?: string
          is_primary?: boolean | null
          panel_id?: string | null
          ssl_status?: string | null
          txt_verification_record?: string | null
          txt_verified_at?: string | null
          updated_at?: string
          verification_status?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_domains_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          panel_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          panel_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          panel_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_notifications_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "panel_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_settings: {
        Row: {
          blog_enabled: boolean | null
          contact_info: Json | null
          created_at: string | null
          custom_css: string | null
          floating_chat_custom_label: string | null
          floating_chat_custom_url: string | null
          floating_chat_discord: string | null
          floating_chat_enabled: boolean | null
          floating_chat_message: string | null
          floating_chat_messenger: string | null
          floating_chat_position: string | null
          floating_chat_telegram: string | null
          floating_chat_whatsapp: string | null
          id: string
          live_chat_enabled: boolean | null
          low_balance_alert_enabled: boolean | null
          low_balance_threshold: number | null
          maintenance_message: string | null
          maintenance_mode: boolean | null
          panel_id: string | null
          privacy_policy: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          social_links: Json | null
          terms_of_service: string | null
          updated_at: string | null
        }
        Insert: {
          blog_enabled?: boolean | null
          contact_info?: Json | null
          created_at?: string | null
          custom_css?: string | null
          floating_chat_custom_label?: string | null
          floating_chat_custom_url?: string | null
          floating_chat_discord?: string | null
          floating_chat_enabled?: boolean | null
          floating_chat_message?: string | null
          floating_chat_messenger?: string | null
          floating_chat_position?: string | null
          floating_chat_telegram?: string | null
          floating_chat_whatsapp?: string | null
          id?: string
          live_chat_enabled?: boolean | null
          low_balance_alert_enabled?: boolean | null
          low_balance_threshold?: number | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          panel_id?: string | null
          privacy_policy?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          social_links?: Json | null
          terms_of_service?: string | null
          updated_at?: string | null
        }
        Update: {
          blog_enabled?: boolean | null
          contact_info?: Json | null
          created_at?: string | null
          custom_css?: string | null
          floating_chat_custom_label?: string | null
          floating_chat_custom_url?: string | null
          floating_chat_discord?: string | null
          floating_chat_enabled?: boolean | null
          floating_chat_message?: string | null
          floating_chat_messenger?: string | null
          floating_chat_position?: string | null
          floating_chat_telegram?: string | null
          floating_chat_whatsapp?: string | null
          id?: string
          live_chat_enabled?: boolean | null
          low_balance_alert_enabled?: boolean | null
          low_balance_threshold?: number | null
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          panel_id?: string | null
          privacy_policy?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          social_links?: Json | null
          terms_of_service?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "panel_settings_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: true
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          panel_id: string
          payment_id: string | null
          plan_type: Database["public"]["Enums"]["subscription_plan"]
          price: number
          started_at: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          panel_id: string
          payment_id?: string | null
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          panel_id?: string
          payment_id?: string | null
          plan_type?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          started_at?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panel_subscriptions_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: true
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_team_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          panel_id: string
          permissions: Json | null
          role: Database["public"]["Enums"]["panel_role"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          panel_id: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["panel_role"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          panel_id?: string
          permissions?: Json | null
          role?: Database["public"]["Enums"]["panel_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panel_team_members_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panel_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          panel_id: string | null
          template_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          panel_id?: string | null
          template_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          panel_id?: string | null
          template_data?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panel_templates_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      panels: {
        Row: {
          balance: number | null
          blog_enabled: boolean | null
          buyer_theme: string | null
          commission_rate: number | null
          created_at: string
          custom_branding: Json | null
          custom_domain: string | null
          description: string | null
          dns_records: Json | null
          domain: string | null
          domain_verification_status: string | null
          domain_verification_token: string | null
          features: Json | null
          hosting_provider: string | null
          id: string
          is_approved: boolean | null
          logo_url: string | null
          max_services: number | null
          monthly_revenue: number | null
          name: string
          onboarding_completed: boolean | null
          owner_id: string | null
          primary_color: string | null
          secondary_color: string | null
          settings: Json | null
          ssl_status: string | null
          status: Database["public"]["Enums"]["panel_status"] | null
          subdomain: string
          theme_type: Database["public"]["Enums"]["theme_type"] | null
          total_orders: number | null
          updated_at: string
        }
        Insert: {
          balance?: number | null
          blog_enabled?: boolean | null
          buyer_theme?: string | null
          commission_rate?: number | null
          created_at?: string
          custom_branding?: Json | null
          custom_domain?: string | null
          description?: string | null
          dns_records?: Json | null
          domain?: string | null
          domain_verification_status?: string | null
          domain_verification_token?: string | null
          features?: Json | null
          hosting_provider?: string | null
          id?: string
          is_approved?: boolean | null
          logo_url?: string | null
          max_services?: number | null
          monthly_revenue?: number | null
          name: string
          onboarding_completed?: boolean | null
          owner_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          ssl_status?: string | null
          status?: Database["public"]["Enums"]["panel_status"] | null
          subdomain: string
          theme_type?: Database["public"]["Enums"]["theme_type"] | null
          total_orders?: number | null
          updated_at?: string
        }
        Update: {
          balance?: number | null
          blog_enabled?: boolean | null
          buyer_theme?: string | null
          commission_rate?: number | null
          created_at?: string
          custom_branding?: Json | null
          custom_domain?: string | null
          description?: string | null
          dns_records?: Json | null
          domain?: string | null
          domain_verification_status?: string | null
          domain_verification_token?: string | null
          features?: Json | null
          hosting_provider?: string | null
          id?: string
          is_approved?: boolean | null
          logo_url?: string | null
          max_services?: number | null
          monthly_revenue?: number | null
          name?: string
          onboarding_completed?: boolean | null
          owner_id?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          settings?: Json | null
          ssl_status?: string | null
          status?: Database["public"]["Enums"]["panel_status"] | null
          subdomain?: string
          theme_type?: Database["public"]["Enums"]["theme_type"] | null
          total_orders?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "panels_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_fees: {
        Row: {
          created_at: string
          description: string | null
          fee_amount: number
          fee_percentage: number
          id: string
          order_amount: number
          order_id: string | null
          panel_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          fee_amount: number
          fee_percentage?: number
          id?: string
          order_amount: number
          order_id?: string | null
          panel_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          fee_amount?: number
          fee_percentage?: number
          id?: string
          order_amount?: number
          order_id?: string | null
          panel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_fees_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_fees_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_providers: {
        Row: {
          api_endpoint: string
          api_key: string
          balance: number | null
          commission_percentage: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          logo_url: string | null
          name: string
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint: string
          api_key: string
          balance?: number | null
          commission_percentage?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          logo_url?: string | null
          name: string
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string
          api_key?: string
          balance?: number | null
          commission_percentage?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          logo_url?: string | null
          name?: string
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          created_at: string
          email: string
          email_verified_at: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          onboarding_completed_at: string | null
          onboarding_step: number | null
          role: Database["public"]["Enums"]["user_role"]
          theme_preference: string | null
          total_spent: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string
          email: string
          email_verified_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          theme_preference?: string | null
          total_spent?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string
          email?: string
          email_verified_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_step?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          theme_preference?: string | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          panel_id: string | null
          updated_at: string
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          panel_id?: string | null
          updated_at?: string
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          panel_id?: string | null
          updated_at?: string
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_integrations: {
        Row: {
          api_endpoint: string
          api_key: string
          balance: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          panel_id: string | null
          provider_name: string
          settings: Json | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint: string
          api_key: string
          balance?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          panel_id?: string | null
          provider_name: string
          settings?: Json | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string
          api_key?: string
          balance?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          panel_id?: string | null
          provider_name?: string
          settings?: Json | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_integrations_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          api_endpoint: string
          api_key: string
          balance: number | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          panel_id: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint: string
          api_key: string
          balance?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          panel_id?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string
          api_key?: string
          balance?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          panel_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "providers_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_rewards: {
        Row: {
          created_at: string
          id: string
          order_amount: number
          order_id: string | null
          panel_id: string | null
          referred_id: string
          referrer_id: string
          reward_amount: number
          reward_percentage: number | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_amount: number
          order_id?: string | null
          panel_id?: string | null
          referred_id: string
          referrer_id: string
          reward_amount: number
          reward_percentage?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_amount?: number
          order_id?: string | null
          panel_id?: string | null
          referred_id?: string
          referrer_id?: string
          reward_amount?: number
          reward_percentage?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reviews: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          is_visible: boolean | null
          order_id: string | null
          panel_id: string | null
          rating: number
          review_text: string | null
          service_id: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          is_visible?: boolean | null
          order_id?: string | null
          panel_id?: string | null
          rating: number
          review_text?: string | null
          service_id?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          is_visible?: boolean | null
          order_id?: string | null
          panel_id?: string | null
          rating?: number
          review_text?: string | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          average_time: string | null
          cancel_available: boolean | null
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          display_order: number | null
          estimated_time: string | null
          features: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          markup_percent: number | null
          max_quantity: number | null
          min_quantity: number | null
          name: string
          panel_id: string | null
          price: number
          provider_id: string | null
          provider_price: number | null
          provider_service_id: string | null
          refill_available: boolean | null
          service_type: string | null
          updated_at: string
        }
        Insert: {
          average_time?: string | null
          cancel_available?: boolean | null
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_time?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          markup_percent?: number | null
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          panel_id?: string | null
          price: number
          provider_id?: string | null
          provider_price?: number | null
          provider_service_id?: string | null
          refill_available?: boolean | null
          service_type?: string | null
          updated_at?: string
        }
        Update: {
          average_time?: string | null
          cancel_available?: boolean | null
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          display_order?: number | null
          estimated_time?: string | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          markup_percent?: number | null
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          panel_id?: string | null
          price?: number
          provider_id?: string | null
          provider_price?: number | null
          provider_service_id?: string | null
          refill_available?: boolean | null
          service_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          messages: Json | null
          panel_id: string | null
          priority: string | null
          status: string | null
          subject: string
          ticket_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json | null
          panel_id?: string | null
          priority?: string | null
          status?: string | null
          subject: string
          ticket_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json | null
          panel_id?: string | null
          priority?: string | null
          status?: string | null
          subject?: string
          ticket_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_logs: {
        Row: {
          component: string
          created_at: string
          id: string
          message: string | null
          metrics: Json | null
          status: string
        }
        Insert: {
          component: string
          created_at?: string
          id?: string
          message?: string | null
          metrics?: Json | null
          status: string
        }
        Update: {
          component?: string
          created_at?: string
          id?: string
          message?: string | null
          metrics?: Json | null
          status?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          payment_id: string | null
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
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
      approve_panel: { Args: { panel_id: string }; Returns: boolean }
      create_panel_notification: {
        Args: {
          p_message: string
          p_panel_id: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      generate_order_number: { Args: never; Returns: string }
      generate_panel_api_key: { Args: never; Returns: string }
      generate_subdomain: { Args: { panel_name: string }; Returns: string }
      get_masked_provider_credentials: {
        Args: { provider_id: string }
        Returns: Json
      }
      get_service_avg_rating: {
        Args: { p_service_id: string }
        Returns: number
      }
      has_completed_onboarding: { Args: { user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_any_admin: { Args: { _user_id: string }; Returns: boolean }
      is_email_verified: { Args: { user_id: string }; Returns: boolean }
      update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "moderator" | "support"
      order_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "partial"
      panel_role: "panel_admin" | "manager" | "agent"
      panel_status: "pending" | "active" | "suspended" | "rejected"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      service_category:
        | "instagram"
        | "facebook"
        | "twitter"
        | "youtube"
        | "tiktok"
        | "linkedin"
        | "telegram"
        | "other"
        | "threads"
        | "snapchat"
        | "pinterest"
        | "whatsapp"
        | "twitch"
        | "discord"
        | "spotify"
        | "soundcloud"
        | "audiomack"
        | "reddit"
        | "vk"
        | "kick"
        | "rumble"
        | "dailymotion"
        | "deezer"
        | "shazam"
        | "tidal"
        | "reverbnation"
        | "mixcloud"
        | "quora"
        | "tumblr"
        | "clubhouse"
        | "likee"
        | "kwai"
        | "trovo"
        | "odysee"
        | "bilibili"
        | "lemon8"
        | "bereal"
        | "weibo"
        | "line"
        | "patreon"
        | "medium"
        | "roblox"
        | "steam"
        | "applemusic"
        | "amazonmusic"
        | "napster"
        | "iheart"
      subscription_plan: "free" | "basic" | "pro"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
      theme_type: "dark_gradient" | "professional" | "vibrant"
      user_role: "admin" | "panel_owner"
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
      app_role: ["super_admin", "admin", "moderator", "support"],
      order_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "partial",
      ],
      panel_role: ["panel_admin", "manager", "agent"],
      panel_status: ["pending", "active", "suspended", "rejected"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      service_category: [
        "instagram",
        "facebook",
        "twitter",
        "youtube",
        "tiktok",
        "linkedin",
        "telegram",
        "other",
        "threads",
        "snapchat",
        "pinterest",
        "whatsapp",
        "twitch",
        "discord",
        "spotify",
        "soundcloud",
        "audiomack",
        "reddit",
        "vk",
        "kick",
        "rumble",
        "dailymotion",
        "deezer",
        "shazam",
        "tidal",
        "reverbnation",
        "mixcloud",
        "quora",
        "tumblr",
        "clubhouse",
        "likee",
        "kwai",
        "trovo",
        "odysee",
        "bilibili",
        "lemon8",
        "bereal",
        "weibo",
        "line",
        "patreon",
        "medium",
        "roblox",
        "steam",
        "applemusic",
        "amazonmusic",
        "napster",
        "iheart",
      ],
      subscription_plan: ["free", "basic", "pro"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      theme_type: ["dark_gradient", "professional", "vibrant"],
      user_role: ["admin", "panel_owner"],
    },
  },
} as const
