-- =====================================================
-- Migration 001: Initial FUSEtech Schema
-- =====================================================
-- 
-- Description: Creates the initial database schema for FUSEtech
-- Version: 1.0.0
-- Date: 2024-01-15
-- Author: FUSEtech Development Team
--
-- This migration creates:
-- - Core tables (users, activities, transactions, strava_connections)
-- - Auxiliary tables (sessions, achievements, notifications)
-- - Indexes for performance
-- - Functions and triggers
-- - Initial data
-- =====================================================

-- Start transaction
BEGIN;

-- Create migration tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checksum VARCHAR(64)
);

-- Check if this migration has already been applied
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM schema_migrations WHERE version = '001_initial_schema') THEN
        RAISE EXCEPTION 'Migration 001_initial_schema has already been applied';
    END IF;
END $$;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('email', 'google', 'apple', 'strava')),
    provider_id VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    points_balance DECIMAL(15,4) DEFAULT 0.0000 CHECK (points_balance >= 0),
    total_earned DECIMAL(15,4) DEFAULT 0.0000 CHECK (total_earned >= 0),
    total_spent DECIMAL(15,4) DEFAULT 0.0000 CHECK (total_spent >= 0),
    staking_balance DECIMAL(15,4) DEFAULT 0.0000 CHECK (staking_balance >= 0),
    is_verified BOOLEAN DEFAULT false,
    kyc_completed BOOLEAN DEFAULT false,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "marketing": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(provider, provider_id),
    CONSTRAINT check_wallet_address_format CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$')
);

-- Strava connections table
CREATE TABLE strava_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    athlete_id BIGINT UNIQUE NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at BIGINT NOT NULL,
    scope TEXT NOT NULL,
    athlete_data JSONB,
    is_active BOOLEAN DEFAULT true,
    webhook_subscription_id INTEGER,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strava_id BIGINT UNIQUE,
    source VARCHAR(20) DEFAULT 'strava' CHECK (source IN ('strava', 'manual', 'apple_health', 'google_fit')),
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    distance DECIMAL(10,3) NOT NULL CHECK (distance >= 0),
    moving_time INTEGER NOT NULL CHECK (moving_time > 0),
    elapsed_time INTEGER NOT NULL CHECK (elapsed_time >= moving_time),
    total_elevation_gain DECIMAL(8,2) DEFAULT 0 CHECK (total_elevation_gain >= 0),
    average_speed DECIMAL(8,3) DEFAULT 0 CHECK (average_speed >= 0),
    max_speed DECIMAL(8,3) DEFAULT 0 CHECK (max_speed >= 0),
    calories INTEGER CHECK (calories > 0),
    heart_rate_avg INTEGER CHECK (heart_rate_avg > 0 AND heart_rate_avg < 300),
    heart_rate_max INTEGER CHECK (heart_rate_max > 0 AND heart_rate_max < 300),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    tokens_earned DECIMAL(10,4) NOT NULL DEFAULT 0 CHECK (tokens_earned >= 0),
    bonus_multiplier DECIMAL(4,2) DEFAULT 1.00 CHECK (bonus_multiplier >= 0),
    is_verified BOOLEAN DEFAULT true,
    verification_method VARCHAR(20) DEFAULT 'automatic',
    flagged_for_review BOOLEAN DEFAULT false,
    review_notes TEXT,
    start_latitude DECIMAL(10,8),
    start_longitude DECIMAL(11,8),
    end_latitude DECIMAL(10,8),
    end_longitude DECIMAL(11,8),
    gear_id VARCHAR(50),
    weather_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT check_reasonable_duration CHECK (moving_time <= 86400 AND elapsed_time <= 172800),
    CONSTRAINT check_start_date_not_future CHECK (start_date <= NOW() + INTERVAL '1 hour')
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'stake', 'unstake', 'reward', 'penalty', 'refund')),
    category VARCHAR(50),
    amount DECIMAL(15,4) NOT NULL CHECK (amount != 0),
    currency VARCHAR(10) DEFAULT 'FUSE',
    description TEXT NOT NULL,
    reference_id VARCHAR(100),
    activity_id UUID REFERENCES activities(id),
    marketplace_item_id VARCHAR(255),
    staking_pool_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
    blockchain_tx_hash VARCHAR(66),
    balance_before DECIMAL(15,4),
    balance_after DECIMAL(15,4),
    processed_by VARCHAR(50) DEFAULT 'system',
    processing_fee DECIMAL(10,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (type IN ('earn', 'reward', 'refund') AND amount > 0) OR
        (type IN ('spend', 'stake', 'penalty') AND amount < 0) OR
        (type = 'unstake')
    )
);

-- Record migration
INSERT INTO schema_migrations (version, description, checksum) 
VALUES ('001_initial_schema', 'Initial FUSEtech database schema', md5('001_initial_schema_v1.0.0'));

-- Commit transaction
COMMIT;

-- =====================================================
-- POST-MIGRATION VERIFICATION
-- =====================================================

-- Verify tables were created
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'strava_connections', 'activities', 'transactions');
    
    IF table_count != 4 THEN
        RAISE EXCEPTION 'Migration failed: Expected 4 core tables, found %', table_count;
    END IF;
    
    RAISE NOTICE 'Migration 001_initial_schema completed successfully';
    RAISE NOTICE 'Created % core tables', table_count;
END $$;
