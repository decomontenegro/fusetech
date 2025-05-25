import { createSupabaseBrowserClient } from './supabase'

export interface TokenBalance {
  balance: number
  total_earned: number
  total_spent: number
}

export interface TokenTransaction {
  id: string
  amount: number
  type: 'earned' | 'spent' | 'bonus'
  source: 'activity' | 'purchase' | 'referral' | 'signup'
  metadata: any
  created_at: string
}

export class TokenService {
  private supabase = createSupabaseBrowserClient()

  async getBalance(userId: string): Promise<TokenBalance> {
    const { data, error } = await this.supabase
      .from('user_tokens')
      .select('balance, total_earned, total_spent')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  }

  async addTokens(
    userId: string, 
    amount: number, 
    source: 'activity' | 'referral' | 'signup',
    metadata: any = {}
  ): Promise<void> {
    // Start transaction
    const { data: currentBalance, error: balanceError } = await this.supabase
      .from('user_tokens')
      .select('balance, total_earned')
      .eq('user_id', userId)
      .single()

    if (balanceError) throw balanceError

    // Update balance
    const { error: updateError } = await this.supabase
      .from('user_tokens')
      .update({
        balance: currentBalance.balance + amount,
        total_earned: currentBalance.total_earned + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) throw updateError

    // Create transaction record
    const { error: transactionError } = await this.supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount,
        type: 'earned',
        source,
        metadata,
      })

    if (transactionError) throw transactionError
  }

  async spendTokens(
    userId: string, 
    amount: number, 
    purpose: string,
    metadata: any = {}
  ): Promise<void> {
    // Check balance first
    const balance = await this.getBalance(userId)
    if (balance.balance < amount) {
      throw new Error('Insufficient token balance')
    }

    // Update balance
    const { error: updateError } = await this.supabase
      .from('user_tokens')
      .update({
        balance: balance.balance - amount,
        total_spent: balance.total_spent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) throw updateError

    // Create transaction record
    const { error: transactionError } = await this.supabase
      .from('token_transactions')
      .insert({
        user_id: userId,
        amount: -amount,
        type: 'spent',
        source: 'purchase',
        metadata: { purpose, ...metadata },
      })

    if (transactionError) throw transactionError
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<TokenTransaction[]> {
    const { data, error } = await this.supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }

  // Calculate tokens earned from activity
  calculateActivityTokens(distance: number, type: string): number {
    const baseRate = 1 // 1 token per km
    const typeMultipliers = {
      'Run': 1.2,
      'Ride': 0.8,
      'Walk': 1.0,
      'Hike': 1.1,
      'Swim': 2.0, // per km swimming is harder
    }

    const multiplier = typeMultipliers[type as keyof typeof typeMultipliers] || 1.0
    const distanceKm = distance / 1000 // Convert meters to km
    
    return Math.round(distanceKm * baseRate * multiplier)
  }
}

export const tokenService = new TokenService()
