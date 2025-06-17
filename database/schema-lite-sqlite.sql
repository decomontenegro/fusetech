-- =====================================================
-- FUSEtech Lite - SQLite Schema for Local Testing
-- =====================================================
-- 
-- Simplified 3-table schema adapted for SQLite
-- For local development and testing only
-- =====================================================

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- =====================================================
-- 1. USERS TABLE (SQLite version)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    -- Primary identification
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    
    -- Strava integration (only auth provider for MVP)
    strava_athlete_id INTEGER UNIQUE NOT NULL,
    strava_access_token TEXT NOT NULL,
    strava_refresh_token TEXT NOT NULL,
    strava_expires_at INTEGER NOT NULL,
    
    -- Basic user info from Strava
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    
    -- Simplified token balance
    tokens_balance REAL DEFAULT 0.0 CHECK (tokens_balance >= 0),
    total_tokens_earned REAL DEFAULT 0.0 CHECK (total_tokens_earned >= 0),
    
    -- Basic settings
    is_active INTEGER DEFAULT 1,
    timezone TEXT DEFAULT 'UTC',
    
    -- Audit fields
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login_at TEXT DEFAULT (datetime('now')),
    last_sync_at TEXT
);

-- =====================================================
-- 2. ACTIVITIES TABLE (SQLite version)
-- =====================================================

CREATE TABLE IF NOT EXISTS activities (
    -- Primary identification
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Strava activity data
    strava_activity_id INTEGER UNIQUE NOT NULL,
    
    -- Core activity info
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- Run, Ride, Walk, etc.
    
    -- Essential metrics for token calculation
    distance_meters REAL NOT NULL CHECK (distance_meters >= 0),
    moving_time_seconds INTEGER NOT NULL CHECK (moving_time_seconds > 0),
    start_date TEXT NOT NULL,
    
    -- Simplified token calculation
    tokens_earned REAL NOT NULL DEFAULT 0.0 CHECK (tokens_earned >= 0),
    
    -- Basic status
    is_processed INTEGER DEFAULT 0,
    
    -- Audit
    created_at TEXT DEFAULT (datetime('now')),
    processed_at TEXT
);

-- =====================================================
-- 3. TRANSACTIONS TABLE (SQLite version)
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
    -- Primary identification
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Simplified transaction types (only earn for MVP)
    type TEXT NOT NULL DEFAULT 'earn' CHECK (type IN ('earn', 'bonus')),
    
    -- Transaction details
    amount REAL NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    
    -- Reference to activity (if applicable)
    activity_id TEXT REFERENCES activities(id),
    
    -- Simple status
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
    
    -- Audit
    created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_strava_athlete ON users(strava_athlete_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = 1;
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_strava ON activities(strava_activity_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_activities_processed ON activities(is_processed);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_activity ON transactions(activity_id) WHERE activity_id IS NOT NULL;

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Update updated_at on users table
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- =====================================================
-- SAMPLE DATA FOR LOCAL TESTING
-- =====================================================

-- Insert test user
INSERT OR IGNORE INTO users (
    strava_athlete_id, 
    strava_access_token, 
    strava_refresh_token, 
    strava_expires_at,
    name, 
    email,
    tokens_balance,
    total_tokens_earned
) VALUES (
    12345,
    'test_access_token_12345',
    'test_refresh_token_12345',
    strftime('%s', 'now', '+6 hours'),
    'Test Runner',
    'test@fusetech.app',
    47.50,
    127.25
);

-- Insert test activities
INSERT OR IGNORE INTO activities (
    user_id,
    strava_activity_id,
    name,
    type,
    distance_meters,
    moving_time_seconds,
    start_date,
    tokens_earned,
    is_processed
) VALUES 
(
    (SELECT id FROM users WHERE strava_athlete_id = 12345),
    1001,
    'Morning Run',
    'Run',
    5000,
    1800,
    datetime('now', '-1 day'),
    5.0,
    1
),
(
    (SELECT id FROM users WHERE strava_athlete_id = 12345),
    1002,
    'Bike Commute',
    'Ride',
    8000,
    1200,
    datetime('now', '-2 days'),
    4.0,
    1
),
(
    (SELECT id FROM users WHERE strava_athlete_id = 12345),
    1003,
    'Evening Jog',
    'Run',
    3200,
    1080,
    datetime('now', '-3 days'),
    3.2,
    1
);

-- Insert test transactions
INSERT OR IGNORE INTO transactions (
    user_id,
    type,
    amount,
    description,
    activity_id,
    status
) VALUES 
(
    (SELECT id FROM users WHERE strava_athlete_id = 12345),
    'earn',
    5.0,
    'Tokens earned for Run: Morning Run',
    (SELECT id FROM activities WHERE strava_activity_id = 1001),
    'completed'
),
(
    (SELECT id FROM users WHERE strava_athlete_id = 12345),
    'earn',
    4.0,
    'Tokens earned for Ride: Bike Commute',
    (SELECT id FROM activities WHERE strava_activity_id = 1002),
    'completed'
),
(
    (SELECT id FROM users WHERE strava_athlete_id = 12345),
    'earn',
    3.2,
    'Tokens earned for Run: Evening Jog',
    (SELECT id FROM activities WHERE strava_activity_id = 1003),
    'completed'
);

-- =====================================================
-- UTILITY VIEWS FOR TESTING
-- =====================================================

-- User stats view
CREATE VIEW IF NOT EXISTS user_stats AS
SELECT 
    u.id,
    u.name,
    u.tokens_balance,
    u.total_tokens_earned,
    COUNT(a.id) as total_activities,
    ROUND(COALESCE(SUM(a.distance_meters), 0) / 1000.0, 2) as total_distance_km,
    COALESCE(SUM(a.tokens_earned), 0) as calculated_tokens,
    COUNT(CASE WHEN a.start_date >= date('now', '-7 days') THEN 1 END) as this_week_activities,
    COALESCE(SUM(CASE WHEN a.start_date >= date('now', '-7 days') THEN a.tokens_earned ELSE 0 END), 0) as this_week_tokens
FROM users u
LEFT JOIN activities a ON u.id = a.user_id AND a.is_processed = 1
GROUP BY u.id, u.name, u.tokens_balance, u.total_tokens_earned;

-- Recent activities view
CREATE VIEW IF NOT EXISTS recent_activities AS
SELECT 
    a.*,
    u.name as user_name,
    ROUND(a.distance_meters / 1000.0, 2) as distance_km,
    ROUND(a.moving_time_seconds / 60.0, 1) as duration_minutes
FROM activities a
JOIN users u ON a.user_id = u.id
ORDER BY a.start_date DESC
LIMIT 20;

-- =====================================================
-- SCHEMA INFO
-- =====================================================

CREATE VIEW IF NOT EXISTS schema_info AS
SELECT 
    'FUSEtech Lite SQLite v1.0' as schema_name,
    datetime('now') as created_at,
    'Local testing schema: 3 tables, SQLite, mock data included' as description,
    3 as tables_count;

-- =====================================================
-- END OF SQLITE SCHEMA
-- =====================================================
