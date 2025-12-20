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
      client_users: {
        Row: {
          balance: number | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          panel_id: string | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          panel_id?: string | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          panel_id?: string | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "panels"
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
      orders: {
        Row: {
          buyer_id: string | null
          created_at: string
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
          status: Database["public"]["Enums"]["order_status"] | null
          target_url: string
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
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
          status?: Database["public"]["Enums"]["order_status"] | null
          target_url: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
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
      panel_domains: {
        Row: {
          created_at: string
          dns_configured: boolean | null
          domain: string
          id: string
          is_primary: boolean | null
          panel_id: string | null
          ssl_status: string | null
          updated_at: string
          verification_status: string | null
          verification_token: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          dns_configured?: boolean | null
          domain: string
          id?: string
          is_primary?: boolean | null
          panel_id?: string | null
          ssl_status?: string | null
          updated_at?: string
          verification_status?: string | null
          verification_token?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          dns_configured?: boolean | null
          domain?: string
          id?: string
          is_primary?: boolean | null
          panel_id?: string | null
          ssl_status?: string | null
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
          contact_info: Json | null
          created_at: string | null
          custom_css: string | null
          id: string
          maintenance_message: string | null
          maintenance_mode: boolean | null
          panel_id: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          social_links: Json | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          custom_css?: string | null
          id?: string
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          panel_id?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          social_links?: Json | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          custom_css?: string | null
          id?: string
          maintenance_message?: string | null
          maintenance_mode?: boolean | null
          panel_id?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          social_links?: Json | null
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
          id: string
          is_approved: boolean | null
          logo_url: string | null
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
          id?: string
          is_approved?: boolean | null
          logo_url?: string | null
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
          id?: string
          is_approved?: boolean | null
          logo_url?: string | null
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
          total_spent?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          estimated_time: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_quantity: number | null
          min_quantity: number | null
          name: string
          panel_id: string | null
          price: number
          provider_id: string | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          estimated_time?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          panel_id?: string | null
          price: number
          provider_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          estimated_time?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          panel_id?: string | null
          price?: number
          provider_id?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_panel: { Args: { panel_id: string }; Returns: boolean }
      generate_order_number: { Args: never; Returns: string }
      generate_subdomain: { Args: { panel_name: string }; Returns: string }
      get_masked_provider_credentials: {
        Args: { provider_id: string }
        Returns: Json
      }
      has_completed_onboarding: { Args: { user_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
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
      order_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "partial"
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
      order_status: [
        "pending",
        "in_progress",
        "completed",
        "cancelled",
        "partial",
      ],
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
      ],
      theme_type: ["dark_gradient", "professional", "vibrant"],
      user_role: ["admin", "panel_owner"],
    },
  },
} as const
