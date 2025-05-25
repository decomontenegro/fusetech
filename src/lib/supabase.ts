import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for client components
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server client for server components
export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          strava_id: string | null
          strava_access_token: string | null
          strava_refresh_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          strava_id?: string | null
          strava_access_token?: string | null
          strava_refresh_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          strava_id?: string | null
          strava_access_token?: string | null
          strava_refresh_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_tokens: {
        Row: {
          id: string
          user_id: string
          balance: number
          total_earned: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          total_earned?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          total_earned?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      token_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'earned' | 'spent' | 'bonus'
          source: 'activity' | 'purchase' | 'referral' | 'signup'
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'earned' | 'spent' | 'bonus'
          source: 'activity' | 'purchase' | 'referral' | 'signup'
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'earned' | 'spent' | 'bonus'
          source?: 'activity' | 'purchase' | 'referral' | 'signup'
          metadata?: any
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          strava_id: string
          name: string
          type: string
          distance: number
          moving_time: number
          elapsed_time: number
          total_elevation_gain: number
          start_date: string
          tokens_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          strava_id: string
          name: string
          type: string
          distance: number
          moving_time: number
          elapsed_time: number
          total_elevation_gain: number
          start_date: string
          tokens_earned: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          strava_id?: string
          name?: string
          type?: string
          distance?: number
          moving_time?: number
          elapsed_time?: number
          total_elevation_gain?: number
          start_date?: string
          tokens_earned?: number
          created_at?: string
        }
      }
    }
  }
}
