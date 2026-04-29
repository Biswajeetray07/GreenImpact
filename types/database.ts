export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string | null
          email: string
          full_name: string
          role: 'subscriber' | 'admin'
          created_at: string | null
        }
        Insert: {
          id?: string
          auth_id?: string | null
          email: string
          full_name: string
          role?: 'subscriber' | 'admin'
          created_at?: string | null
        }
        Update: {
          id?: string
          auth_id?: string | null
          email?: string
          full_name?: string
          role?: 'subscriber' | 'admin'
          created_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'monthly' | 'yearly'
          status: 'active' | 'cancelled' | 'lapsed' | 'inactive'
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          charity_id: string | null
          charity_percentage: number
          current_period_end: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan: 'monthly' | 'yearly'
          status?: 'active' | 'cancelled' | 'lapsed' | 'inactive'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          charity_id?: string | null
          charity_percentage?: number
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'monthly' | 'yearly'
          status?: 'active' | 'cancelled' | 'lapsed' | 'inactive'
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          charity_id?: string | null
          charity_percentage?: number
          current_period_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      charities: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          website: string | null
          is_featured: boolean | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          image_url?: string | null
          website?: string | null
          is_featured?: boolean | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          website?: string | null
          is_featured?: boolean | null
          is_active?: boolean | null
          created_at?: string | null
        }
      }
      charity_events: {
        Row: {
          id: string
          charity_id: string
          title: string
          description: string | null
          event_date: string
          created_at: string | null
        }
        Insert: {
          id?: string
          charity_id: string
          title: string
          description?: string | null
          event_date: string
          created_at?: string | null
        }
        Update: {
          id?: string
          charity_id?: string
          title?: string
          description?: string | null
          event_date?: string
          created_at?: string | null
        }
      }
      donations: {
        Row: {
          id: string
          user_id: string
          charity_id: string
          amount: number
          type: 'subscription_split' | 'independent'
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          charity_id: string
          amount: number
          type: 'subscription_split' | 'independent'
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          charity_id?: string
          amount?: number
          type?: 'subscription_split' | 'independent'
          created_at?: string | null
        }
      }
      scores: {
        Row: {
          id: string
          user_id: string
          score: number
          date: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          score: number
          date: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          score?: number
          date?: string
          created_at?: string | null
        }
      }
      draws: {
        Row: {
          id: string
          month: string
          status: 'draft' | 'simulated' | 'published'
          draw_type: 'random' | 'algorithm'
          drawn_numbers: number[] | null
          jackpot_rollover: boolean | null
          prize_pool_total: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          month: string
          status?: 'draft' | 'simulated' | 'published'
          draw_type: 'random' | 'algorithm'
          drawn_numbers?: number[] | null
          jackpot_rollover?: boolean | null
          prize_pool_total?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          month?: string
          status?: 'draft' | 'simulated' | 'published'
          draw_type?: 'random' | 'algorithm'
          drawn_numbers?: number[] | null
          jackpot_rollover?: boolean | null
          prize_pool_total?: number | null
          created_at?: string | null
        }
      }
      draw_entries: {
        Row: {
          id: string
          draw_id: string
          user_id: string
          user_scores: number[] | null
          match_count: number | null
          tier: 3 | 4 | 5 | null
          created_at: string | null
        }
        Insert: {
          id?: string
          draw_id: string
          user_id: string
          user_scores?: number[] | null
          match_count?: number | null
          tier?: 3 | 4 | 5 | null
          created_at?: string | null
        }
        Update: {
          id?: string
          draw_id?: string
          user_id?: string
          user_scores?: number[] | null
          match_count?: number | null
          tier?: 3 | 4 | 5 | null
          created_at?: string | null
        }
      }
      winners: {
        Row: {
          id: string
          draw_id: string
          user_id: string
          tier: 3 | 4 | 5
          prize_amount: number
          proof_url: string | null
          status: 'pending' | 'approved' | 'rejected' | 'paid'
          reviewed_at: string | null
          paid_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          draw_id: string
          user_id: string
          tier: 3 | 4 | 5
          prize_amount?: number
          proof_url?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          reviewed_at?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          draw_id?: string
          user_id?: string
          tier?: 3 | 4 | 5
          prize_amount?: number
          proof_url?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'paid'
          reviewed_at?: string | null
          paid_at?: string | null
          created_at?: string | null
        }
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
  }
}
