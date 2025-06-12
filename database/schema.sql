-- =====================================================
-- FUSEtech Database Schema for Neon PostgreSQL
-- =====================================================
-- 
-- This schema supports:
-- - User management with wallet abstraction
-- - Strava integration and OAuth tokens  
-- - Activity tracking with FUSE token calculations
-- - Transaction history for earnings and spending
-- - Scalable design for production use
--
-- Compatible with TypeScript interfaces in src/lib/database/neon.ts
-- =====================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- -----------------------------------------------------
-- Users Table
-- -----------------------------------------------------
-- Stores user account information with wallet abstraction
-- Supports multiple authentication providers (Strava, Google, Apple, Email)
-- Tracks FUSE token balances and verification status
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    
    -- Authentication provider information
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('email', 'google', 'apple', 'strava')),
    provider_id VARCHAR(255) NOT NULL,
    
    -- Wallet abstraction - automatically generated blockchain wallet
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    
    -- FUSE token balances (using DECIMAL for precision)
    points_balance DECIMAL(15,4) DEFAULT 0.0000 CHECK (points_balance >= 0),
    total_earned DECIMAL(15,4) DEFAULT 0.0000 CHECK (total_earned >= 0),
    total_spent DECIMAL(15,4) DEFAULT 0.0000 CHECK (total_spent >= 0),
    staking_balance DECIMAL(15,4) DEFAULT 0.0000 CHECK (staking_balance >= 0),
    
    -- User verification and compliance
    is_verified BOOLEAN DEFAULT false,
    kyc_completed BOOLEAN DEFAULT false,
    
    -- User preferences and settings
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "marketing": false}',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure unique provider combinations
    UNIQUE(provider, provider_id)
);

-- -----------------------------------------------------
-- Strava Connections Table  
-- -----------------------------------------------------
-- Stores OAuth tokens and athlete data for Strava integration
-- Handles token refresh and webhook subscriptions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS strava_connections (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Strava athlete information
    athlete_id BIGINT UNIQUE NOT NULL,
    
    -- OAuth tokens (encrypted in production)
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at BIGINT NOT NULL,
    scope TEXT NOT NULL,
    
    -- Athlete profile data from Strava API
    athlete_data JSONB,
    
    -- Connection status and settings
    is_active BOOLEAN DEFAULT true,
    webhook_subscription_id INTEGER,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency_hours INTEGER DEFAULT 24,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------
-- Activities Table
-- -----------------------------------------------------
-- Stores fitness activities from various sources (Strava, manual entry)
-- Calculates and tracks FUSE token rewards
-- Supports activity verification and fraud prevention
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS activities (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- External source identification
    strava_id BIGINT UNIQUE,
    source VARCHAR(20) DEFAULT 'strava' CHECK (source IN ('strava', 'manual', 'apple_health', 'google_fit')),
    
    -- Activity details
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Performance metrics (using DECIMAL for precision)
    distance DECIMAL(10,3) NOT NULL CHECK (distance >= 0), -- in meters
    moving_time INTEGER NOT NULL CHECK (moving_time > 0), -- in seconds
    elapsed_time INTEGER NOT NULL CHECK (elapsed_time >= moving_time), -- in seconds
    total_elevation_gain DECIMAL(8,2) DEFAULT 0 CHECK (total_elevation_gain >= 0), -- in meters
    
    -- Speed and pace calculations
    average_speed DECIMAL(8,3) DEFAULT 0 CHECK (average_speed >= 0), -- m/s
    max_speed DECIMAL(8,3) DEFAULT 0 CHECK (max_speed >= 0), -- m/s
    
    -- Additional metrics
    calories INTEGER CHECK (calories > 0),
    heart_rate_avg INTEGER CHECK (heart_rate_avg > 0 AND heart_rate_avg < 300),
    heart_rate_max INTEGER CHECK (heart_rate_max > 0 AND heart_rate_max < 300),
    
    -- Timing information
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- FUSE token rewards
    tokens_earned DECIMAL(10,4) NOT NULL DEFAULT 0 CHECK (tokens_earned >= 0),
    bonus_multiplier DECIMAL(4,2) DEFAULT 1.00 CHECK (bonus_multiplier >= 0),
    
    -- Verification and fraud prevention
    is_verified BOOLEAN DEFAULT true,
    verification_method VARCHAR(20) DEFAULT 'automatic',
    flagged_for_review BOOLEAN DEFAULT false,
    review_notes TEXT,
    
    -- Geographic data (optional)
    start_latitude DECIMAL(10,8),
    start_longitude DECIMAL(11,8),
    end_latitude DECIMAL(10,8),
    end_longitude DECIMAL(11,8),
    
    -- Activity metadata
    gear_id VARCHAR(50),
    weather_data JSONB,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- -----------------------------------------------------
-- Transactions Table
-- -----------------------------------------------------
-- Records all FUSE token movements (earnings, spending, staking)
-- Provides complete audit trail for token economy
-- Supports marketplace purchases and staking rewards
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction classification
    type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'stake', 'unstake', 'reward', 'penalty', 'refund')),
    category VARCHAR(50), -- 'activity_reward', 'marketplace_purchase', 'staking_reward', etc.
    
    -- Amount and currency
    amount DECIMAL(15,4) NOT NULL CHECK (amount != 0),
    currency VARCHAR(10) DEFAULT 'FUSE',
    
    -- Transaction details
    description TEXT NOT NULL,
    reference_id VARCHAR(100), -- External reference (order ID, etc.)
    
    -- Related entities
    activity_id UUID REFERENCES activities(id),
    marketplace_item_id VARCHAR(255),
    staking_pool_id VARCHAR(100),
    
    -- Transaction status and processing
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    blockchain_tx_hash VARCHAR(66), -- For future blockchain integration
    
    -- Balances after transaction (for reconciliation)
    balance_before DECIMAL(15,4),
    balance_after DECIMAL(15,4),
    
    -- Processing metadata
    processed_by VARCHAR(50) DEFAULT 'system',
    processing_fee DECIMAL(10,4) DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure amount consistency
    CHECK (
        (type IN ('earn', 'reward', 'refund') AND amount > 0) OR
        (type IN ('spend', 'stake', 'penalty') AND amount < 0) OR
        (type = 'unstake')
    )
);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(is_verified, kyc_completed);

-- Strava connections indexes
CREATE INDEX IF NOT EXISTS idx_strava_athlete ON strava_connections(athlete_id);
CREATE INDEX IF NOT EXISTS idx_strava_user ON strava_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_strava_active ON strava_connections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_strava_expires ON strava_connections(expires_at);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_strava ON activities(strava_id) WHERE strava_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_verified ON activities(is_verified);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_tokens ON activities(tokens_earned) WHERE tokens_earned > 0;
CREATE INDEX IF NOT EXISTS idx_activities_review ON activities(flagged_for_review) WHERE flagged_for_review = true;

-- Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_activity ON transactions(activity_id) WHERE activity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_id) WHERE reference_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activities_user_type_date ON activities(user_id, type, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_status ON transactions(user_id, type, status);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at fields
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strava_connections_updated_at
    BEFORE UPDATE ON strava_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate FUSE tokens for activities
CREATE OR REPLACE FUNCTION calculate_activity_tokens(
    activity_type VARCHAR(50),
    distance_meters DECIMAL(10,3),
    moving_time_seconds INTEGER,
    bonus_multiplier DECIMAL(4,2) DEFAULT 1.00
) RETURNS DECIMAL(10,4) AS $$
DECLARE
    base_multiplier DECIMAL(4,2);
    distance_km DECIMAL(10,3);
    base_tokens DECIMAL(10,4);
    performance_bonus DECIMAL(10,4) := 0;
    final_tokens DECIMAL(10,4);
BEGIN
    -- Convert distance to kilometers
    distance_km := distance_meters / 1000.0;

    -- Set base multipliers per activity type (tokens per km)
    CASE LOWER(activity_type)
        WHEN 'run' THEN base_multiplier := 5.0;
        WHEN 'ride' THEN base_multiplier := 2.0;
        WHEN 'walk' THEN base_multiplier := 3.0;
        WHEN 'swim' THEN base_multiplier := 8.0;
        WHEN 'hike' THEN base_multiplier := 4.0;
        WHEN 'virtualrun' THEN base_multiplier := 4.0;
        WHEN 'virtualride' THEN base_multiplier := 1.5;
        WHEN 'workout' THEN base_multiplier := 3.0;
        WHEN 'weighttraining' THEN base_multiplier := 2.0;
        WHEN 'yoga' THEN base_multiplier := 2.0;
        ELSE base_multiplier := 1.0;
    END CASE;

    -- Calculate base tokens
    base_tokens := distance_km * base_multiplier;

    -- Performance bonus for running (sub 6-minute pace)
    IF LOWER(activity_type) = 'run' AND moving_time_seconds > 0 AND distance_km > 0 THEN
        DECLARE
            pace_min_per_km DECIMAL(8,2);
        BEGIN
            pace_min_per_km := (moving_time_seconds / 60.0) / distance_km;
            IF pace_min_per_km < 6.0 THEN
                performance_bonus := base_tokens * 0.2;
            END IF;
        END;
    END IF;

    -- Apply bonus multiplier and ensure minimum 1 token
    final_tokens := (base_tokens + performance_bonus) * bonus_multiplier;

    -- Minimum 1 token for any activity, maximum 1000 tokens per activity
    RETURN GREATEST(1.0, LEAST(1000.0, ROUND(final_tokens, 4)));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUXILIARY TABLES
-- =====================================================

-- -----------------------------------------------------
-- User Sessions Table (for authentication tracking)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- -----------------------------------------------------
-- Achievements Table (for gamification)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL,
    badge_icon_url TEXT,
    requirements JSONB NOT NULL,
    reward_tokens DECIMAL(10,4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------
-- User Achievements Table (tracking earned achievements)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB,

    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned ON user_achievements(earned_at DESC);

-- -----------------------------------------------------
-- Notification Tokens Table (for push notifications)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS notification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('web', 'ios', 'android')),
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(user_id, token)
);

CREATE INDEX IF NOT EXISTS idx_notification_tokens_user ON notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_active ON notification_tokens(is_active) WHERE is_active = true;

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
    total_activities BIGINT,
    total_distance DECIMAL(15,3),
    total_time INTEGER,
    total_tokens DECIMAL(15,4),
    current_streak INTEGER,
    achievements_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(a.id) as total_activities,
        COALESCE(SUM(a.distance), 0) as total_distance,
        COALESCE(SUM(a.moving_time), 0) as total_time,
        COALESCE(SUM(a.tokens_earned), 0) as total_tokens,
        COALESCE(calculate_current_streak(user_uuid), 0) as current_streak,
        COUNT(ua.id) as achievements_count
    FROM users u
    LEFT JOIN activities a ON u.id = a.user_id AND a.is_verified = true
    LEFT JOIN user_achievements ua ON u.id = ua.user_id
    WHERE u.id = user_uuid
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate current activity streak
CREATE OR REPLACE FUNCTION calculate_current_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    streak_count INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    has_activity BOOLEAN;
BEGIN
    LOOP
        -- Check if user has activity on check_date
        SELECT EXISTS(
            SELECT 1 FROM activities
            WHERE user_id = user_uuid
            AND DATE(start_date) = check_date
            AND is_verified = true
        ) INTO has_activity;

        IF has_activity THEN
            streak_count := streak_count + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            -- If today has no activity, check if it's today (streak might continue)
            IF check_date = CURRENT_DATE THEN
                check_date := check_date - INTERVAL '1 day';
            ELSE
                EXIT;
            END IF;
        END IF;

        -- Safety limit to prevent infinite loops
        IF streak_count > 365 THEN
            EXIT;
        END IF;
    END LOOP;

    RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update user balance after transaction
CREATE OR REPLACE FUNCTION update_user_balance_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update for completed transactions
    IF NEW.status = 'completed' THEN
        UPDATE users
        SET
            points_balance = points_balance + NEW.amount,
            total_earned = CASE
                WHEN NEW.amount > 0 THEN total_earned + NEW.amount
                ELSE total_earned
            END,
            total_spent = CASE
                WHEN NEW.amount < 0 THEN total_spent + ABS(NEW.amount)
                ELSE total_spent
            END,
            updated_at = NOW()
        WHERE id = NEW.user_id;

        -- Update balance_after in the transaction record
        UPDATE transactions
        SET balance_after = (
            SELECT points_balance FROM users WHERE id = NEW.user_id
        )
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user balance
CREATE TRIGGER update_balance_after_transaction
    AFTER INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_user_balance_after_transaction();

-- =====================================================
-- DATA VALIDATION AND CONSTRAINTS
-- =====================================================

-- Add constraint to ensure wallet addresses are valid Ethereum addresses
ALTER TABLE users ADD CONSTRAINT check_wallet_address_format
    CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$');

-- Add constraint to ensure reasonable activity durations
ALTER TABLE activities ADD CONSTRAINT check_reasonable_duration
    CHECK (moving_time <= 86400 AND elapsed_time <= 172800); -- Max 24h moving, 48h elapsed

-- Add constraint to ensure start_date is not in the future
ALTER TABLE activities ADD CONSTRAINT check_start_date_not_future
    CHECK (start_date <= NOW() + INTERVAL '1 hour'); -- Allow 1 hour buffer for timezone issues

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default achievements
INSERT INTO achievements (code, name, description, category, requirements, reward_tokens) VALUES
('first_activity', 'First Steps', 'Complete your first activity', 'milestone', '{"activities": 1}', 10.0),
('distance_10k', '10K Explorer', 'Cover 10 kilometers total distance', 'distance', '{"total_distance": 10000}', 25.0),
('distance_100k', '100K Adventurer', 'Cover 100 kilometers total distance', 'distance', '{"total_distance": 100000}', 100.0),
('streak_7', 'Week Warrior', 'Maintain a 7-day activity streak', 'consistency', '{"streak_days": 7}', 50.0),
('streak_30', 'Monthly Master', 'Maintain a 30-day activity streak', 'consistency', '{"streak_days": 30}', 200.0),
('tokens_100', 'Century Club', 'Earn 100 FUSE tokens', 'earnings', '{"total_tokens": 100}', 20.0),
('tokens_1000', 'Token Titan', 'Earn 1000 FUSE tokens', 'earnings', '{"total_tokens": 1000}', 100.0)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- MAINTENANCE PROCEDURES
-- =====================================================

-- Procedure to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < NOW() OR (last_accessed_at < NOW() - INTERVAL '30 days');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to refresh Strava tokens that are about to expire
CREATE OR REPLACE FUNCTION get_expiring_strava_tokens(hours_before_expiry INTEGER DEFAULT 24)
RETURNS TABLE(
    connection_id UUID,
    user_id UUID,
    athlete_id BIGINT,
    refresh_token TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.id,
        sc.user_id,
        sc.athlete_id,
        sc.refresh_token
    FROM strava_connections sc
    WHERE sc.is_active = true
    AND sc.expires_at < EXTRACT(EPOCH FROM NOW() + INTERVAL '1 hour' * hours_before_expiry);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEMA INFORMATION
-- =====================================================

-- Create a view for schema information
CREATE OR REPLACE VIEW schema_info AS
SELECT
    'FUSEtech Database Schema v1.0' as schema_name,
    NOW() as created_at,
    'Production-ready schema for fitness tracking and token rewards' as description,
    4 as core_tables_count,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables_count,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as functions_count;

-- =====================================================
-- PERMISSIONS (for production deployment)
-- =====================================================

-- Create application user (run this in production)
-- CREATE USER fusetech_app WITH PASSWORD 'secure_password_here';
-- GRANT CONNECT ON DATABASE fusetech TO fusetech_app;
-- GRANT USAGE ON SCHEMA public TO fusetech_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fusetech_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fusetech_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fusetech_app;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
