-- =====================================================
-- FUSEtech Lite - Simplified MVP Database Schema
-- =====================================================
-- 
-- Simplified from 8 tables to 3 core tables for faster MVP validation
-- Focus: Strava-only authentication, distance-based token rewards
-- 
-- Tables:
-- 1. users - Core user data with Strava integration
-- 2. activities - Simplified activity tracking
-- 3. transactions - Basic token transaction history
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE (Simplified)
-- =====================================================
-- Combines user data with Strava connection info
-- Removes: multi-provider auth, wallet abstraction, complex preferences
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Strava integration (only auth provider for MVP)
    strava_athlete_id BIGINT UNIQUE NOT NULL,
    strava_access_token TEXT NOT NULL,
    strava_refresh_token TEXT NOT NULL,
    strava_expires_at BIGINT NOT NULL,
    
    -- Basic user info from Strava
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    
    -- Simplified token balance (no complex wallet system)
    tokens_balance DECIMAL(10,2) DEFAULT 0.00 CHECK (tokens_balance >= 0),
    total_tokens_earned DECIMAL(10,2) DEFAULT 0.00 CHECK (total_tokens_earned >= 0),
    
    -- Basic settings
    is_active BOOLEAN DEFAULT true,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. ACTIVITIES TABLE (Simplified)
-- =====================================================
-- Core activity data from Strava only
-- Removes: multi-source support, complex validation, fraud detection
-- =====================================================

CREATE TABLE IF NOT EXISTS activities (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Strava activity data
    strava_activity_id BIGINT UNIQUE NOT NULL,
    
    -- Core activity info
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Run, Ride, Walk, etc.
    
    -- Essential metrics for token calculation
    distance_meters DECIMAL(10,2) NOT NULL CHECK (distance_meters >= 0),
    moving_time_seconds INTEGER NOT NULL CHECK (moving_time_seconds > 0),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Simplified token calculation
    tokens_earned DECIMAL(10,2) NOT NULL DEFAULT 0.00 CHECK (tokens_earned >= 0),
    
    -- Basic status
    is_processed BOOLEAN DEFAULT false,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 3. TRANSACTIONS TABLE (Simplified)
-- =====================================================
-- Basic token transaction history
-- Removes: complex transaction types, blockchain preparation, marketplace
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Simplified transaction types (only earn for MVP)
    type VARCHAR(20) NOT NULL DEFAULT 'earn' CHECK (type IN ('earn', 'bonus')),
    
    -- Transaction details
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    
    -- Reference to activity (if applicable)
    activity_id UUID REFERENCES activities(id),
    
    -- Simple status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_strava_athlete ON users(strava_athlete_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_strava ON activities(strava_activity_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_activities_processed ON activities(is_processed);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_activity ON transactions(activity_id) WHERE activity_id IS NOT NULL;

-- =====================================================
-- SIMPLIFIED FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Simplified token calculation function (distance-based only)
CREATE OR REPLACE FUNCTION calculate_simple_tokens(
    activity_type VARCHAR(50),
    distance_meters DECIMAL(10,2)
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    distance_km DECIMAL(10,2);
    tokens DECIMAL(10,2);
BEGIN
    -- Convert to kilometers
    distance_km := distance_meters / 1000.0;
    
    -- Simple calculation: 1 token per km for running, 0.5 for cycling
    CASE LOWER(activity_type)
        WHEN 'run' THEN tokens := distance_km * 1.0;
        WHEN 'ride' THEN tokens := distance_km * 0.5;
        WHEN 'walk' THEN tokens := distance_km * 0.7;
        ELSE tokens := distance_km * 0.3;
    END CASE;
    
    -- Minimum 1 token for any activity
    RETURN GREATEST(1.0, ROUND(tokens, 2));
END;
$$ LANGUAGE plpgsql;

-- Function to process activity and award tokens
CREATE OR REPLACE FUNCTION process_activity_tokens()
RETURNS TRIGGER AS $$
DECLARE
    earned_tokens DECIMAL(10,2);
BEGIN
    -- Calculate tokens for new activity
    IF NEW.is_processed = false AND OLD.is_processed IS DISTINCT FROM NEW.is_processed THEN
        -- Calculate tokens
        earned_tokens := calculate_simple_tokens(NEW.type, NEW.distance_meters);
        
        -- Update activity with earned tokens
        NEW.tokens_earned := earned_tokens;
        NEW.processed_at := NOW();
        
        -- Update user balance
        UPDATE users 
        SET 
            tokens_balance = tokens_balance + earned_tokens,
            total_tokens_earned = total_tokens_earned + earned_tokens,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Create transaction record
        INSERT INTO transactions (user_id, type, amount, description, activity_id)
        VALUES (
            NEW.user_id,
            'earn',
            earned_tokens,
            'Tokens earned for ' || NEW.type || ': ' || NEW.name,
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically process activities
CREATE TRIGGER process_activity_tokens_trigger
    BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION process_activity_tokens();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Get user stats (simplified)
CREATE OR REPLACE FUNCTION get_user_stats_lite(user_uuid UUID)
RETURNS TABLE(
    total_activities BIGINT,
    total_distance_km DECIMAL(10,2),
    total_tokens DECIMAL(10,2),
    this_week_activities BIGINT,
    this_week_tokens DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(a.id) as total_activities,
        ROUND(COALESCE(SUM(a.distance_meters), 0) / 1000.0, 2) as total_distance_km,
        COALESCE(SUM(a.tokens_earned), 0) as total_tokens,
        COUNT(a.id) FILTER (WHERE a.start_date >= date_trunc('week', NOW())) as this_week_activities,
        COALESCE(SUM(a.tokens_earned) FILTER (WHERE a.start_date >= date_trunc('week', NOW())), 0) as this_week_tokens
    FROM users u
    LEFT JOIN activities a ON u.id = a.user_id AND a.is_processed = true
    WHERE u.id = user_uuid
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample user (for development only)
INSERT INTO users (
    strava_athlete_id, 
    strava_access_token, 
    strava_refresh_token, 
    strava_expires_at,
    name, 
    email
) VALUES (
    12345,
    'sample_access_token',
    'sample_refresh_token',
    EXTRACT(EPOCH FROM NOW() + INTERVAL '6 hours'),
    'Test Runner',
    'test@fusetech.app'
) ON CONFLICT (strava_athlete_id) DO NOTHING;

-- =====================================================
-- SCHEMA INFORMATION
-- =====================================================

COMMENT ON TABLE users IS 'Simplified users table with Strava-only authentication';
COMMENT ON TABLE activities IS 'Core activity data from Strava with distance-based token calculation';
COMMENT ON TABLE transactions IS 'Basic token transaction history for MVP';

-- Schema version
CREATE OR REPLACE VIEW schema_info_lite AS
SELECT 
    'FUSEtech Lite v1.0' as schema_name,
    NOW() as created_at,
    'Simplified MVP schema: 3 tables, Strava-only, distance-based tokens' as description,
    3 as tables_count;

-- =====================================================
-- END OF LITE SCHEMA
-- =====================================================
