import { createSupabaseBrowserClient } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  user_metadata?: {
    name?: string
    avatar_url?: string
  }
}

export class AuthService {
  private supabase = createSupabaseBrowserClient()

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) throw error

    // Create user profile and token balance
    if (data.user) {
      await this.createUserProfile(data.user.id, email, name)
      await this.createUserTokenBalance(data.user.id)
    }

    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await this.supabase.auth.getUser()
    return user as AuthUser
  }

  async updateProfile(updates: { name?: string; avatar_url?: string }) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('No user logged in')

    const { error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error
  }

  private async createUserProfile(userId: string, email: string, name: string) {
    const { error } = await this.supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
      })

    if (error) throw error
  }

  private async createUserTokenBalance(userId: string) {
    const { error } = await this.supabase
      .from('user_tokens')
      .insert({
        user_id: userId,
        balance: 100, // Welcome bonus
        total_earned: 100,
        total_spent: 0,
      })

    if (error) throw error

    // Create welcome bonus transaction
    await this.supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: 100,
        type: 'bonus',
        source: 'signup',
        metadata: { reason: 'Welcome bonus' },
      })
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as AuthUser || null)
    })
  }
}

export const authService = new AuthService()
