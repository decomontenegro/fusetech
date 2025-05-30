/**
 * Neon Database Configuration and Connection
 * Serverless PostgreSQL database for FUSEtech
 */

import { neon } from '@neondatabase/serverless';

// Database connection
const sql = neon(process.env.DATABASE_URL!);

// Types for database entities
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'email' | 'google' | 'apple' | 'strava';
  provider_id: string;
  wallet_address: string;
  points_balance: number;
  total_earned: number;
  total_spent: number;
  staking_balance: number;
  is_verified: boolean;
  kyc_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StravaConnection {
  id: string;
  user_id: string;
  athlete_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
  athlete_data: any;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Activity {
  id: string;
  user_id: string;
  strava_id?: number;
  type: string;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: Date;
  average_speed: number;
  max_speed: number;
  calories?: number;
  tokens_earned: number;
  is_verified: boolean;
  created_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'earn' | 'spend' | 'stake' | 'unstake';
  amount: number;
  description: string;
  activity_id?: string;
  marketplace_item_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
}

// Database service class
class NeonDatabaseService {
  /**
   * Initialize database tables
   */
  async initializeTables(): Promise<void> {
    try {
      // Users table
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          avatar_url TEXT,
          provider VARCHAR(50) NOT NULL,
          provider_id VARCHAR(255) NOT NULL,
          wallet_address VARCHAR(42) NOT NULL,
          points_balance DECIMAL(10,2) DEFAULT 0,
          total_earned DECIMAL(10,2) DEFAULT 0,
          total_spent DECIMAL(10,2) DEFAULT 0,
          staking_balance DECIMAL(10,2) DEFAULT 0,
          is_verified BOOLEAN DEFAULT false,
          kyc_completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Strava connections table
      await sql`
        CREATE TABLE IF NOT EXISTS strava_connections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          athlete_id BIGINT UNIQUE NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT NOT NULL,
          expires_at BIGINT NOT NULL,
          scope TEXT NOT NULL,
          athlete_data JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Activities table
      await sql`
        CREATE TABLE IF NOT EXISTS activities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          strava_id BIGINT,
          type VARCHAR(50) NOT NULL,
          name VARCHAR(255) NOT NULL,
          distance DECIMAL(10,2) NOT NULL,
          moving_time INTEGER NOT NULL,
          elapsed_time INTEGER NOT NULL,
          total_elevation_gain DECIMAL(8,2) DEFAULT 0,
          start_date TIMESTAMP NOT NULL,
          average_speed DECIMAL(8,2) DEFAULT 0,
          max_speed DECIMAL(8,2) DEFAULT 0,
          calories INTEGER,
          tokens_earned DECIMAL(10,2) NOT NULL,
          is_verified BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Transactions table
      await sql`
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(20) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          description TEXT NOT NULL,
          activity_id UUID REFERENCES activities(id),
          marketplace_item_id VARCHAR(255),
          status VARCHAR(20) DEFAULT 'completed',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      // Create indexes for better performance
      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_strava_athlete ON strava_connections(athlete_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_activities_strava ON activities(strava_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`;

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    }
  }

  /**
   * Create or update user
   */
  async upsertUser(userData: Partial<User>): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, name, avatar_url, provider, provider_id, wallet_address)
      VALUES (${userData.email}, ${userData.name}, ${userData.avatar_url}, ${userData.provider}, ${userData.provider_id}, ${userData.wallet_address})
      ON CONFLICT (email) 
      DO UPDATE SET 
        name = EXCLUDED.name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW()
      RETURNING *
    `;
    return result[0] as User;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result[0] as User || null;
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;
    return result[0] as User || null;
  }

  /**
   * Update user points balance
   */
  async updateUserBalance(userId: string, amount: number, type: 'earn' | 'spend'): Promise<void> {
    if (type === 'earn') {
      await sql`
        UPDATE users 
        SET 
          points_balance = points_balance + ${amount},
          total_earned = total_earned + ${amount},
          updated_at = NOW()
        WHERE id = ${userId}
      `;
    } else {
      await sql`
        UPDATE users 
        SET 
          points_balance = points_balance - ${amount},
          total_spent = total_spent + ${amount},
          updated_at = NOW()
        WHERE id = ${userId}
      `;
    }
  }

  /**
   * Save Strava connection
   */
  async saveStravaConnection(connectionData: Partial<StravaConnection>): Promise<StravaConnection> {
    const result = await sql`
      INSERT INTO strava_connections (user_id, athlete_id, access_token, refresh_token, expires_at, scope, athlete_data)
      VALUES (${connectionData.user_id}, ${connectionData.athlete_id}, ${connectionData.access_token}, ${connectionData.refresh_token}, ${connectionData.expires_at}, ${connectionData.scope}, ${JSON.stringify(connectionData.athlete_data)})
      ON CONFLICT (athlete_id)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        scope = EXCLUDED.scope,
        athlete_data = EXCLUDED.athlete_data,
        is_active = true,
        updated_at = NOW()
      RETURNING *
    `;
    return result[0] as StravaConnection;
  }

  /**
   * Save activity
   */
  async saveActivity(activityData: Partial<Activity>): Promise<Activity> {
    const result = await sql`
      INSERT INTO activities (user_id, strava_id, type, name, distance, moving_time, elapsed_time, total_elevation_gain, start_date, average_speed, max_speed, calories, tokens_earned)
      VALUES (${activityData.user_id}, ${activityData.strava_id}, ${activityData.type}, ${activityData.name}, ${activityData.distance}, ${activityData.moving_time}, ${activityData.elapsed_time}, ${activityData.total_elevation_gain}, ${activityData.start_date}, ${activityData.average_speed}, ${activityData.max_speed}, ${activityData.calories}, ${activityData.tokens_earned})
      ON CONFLICT (strava_id)
      DO NOTHING
      RETURNING *
    `;
    return result[0] as Activity;
  }

  /**
   * Create transaction
   */
  async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
    const result = await sql`
      INSERT INTO transactions (user_id, type, amount, description, activity_id, marketplace_item_id, status)
      VALUES (${transactionData.user_id}, ${transactionData.type}, ${transactionData.amount}, ${transactionData.description}, ${transactionData.activity_id}, ${transactionData.marketplace_item_id}, ${transactionData.status})
      RETURNING *
    `;
    return result[0] as Transaction;
  }

  /**
   * Get user activities
   */
  async getUserActivities(userId: string, limit = 20, offset = 0): Promise<Activity[]> {
    const result = await sql`
      SELECT * FROM activities 
      WHERE user_id = ${userId}
      ORDER BY start_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result as Activity[];
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId: string, limit = 20, offset = 0): Promise<Transaction[]> {
    const result = await sql`
      SELECT * FROM transactions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return result as Transaction[];
  }
}

export const neonDb = new NeonDatabaseService();
