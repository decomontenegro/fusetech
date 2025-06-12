# FUSEtech Database Schema Documentation

## 📋 Complete Schema Overview

This document provides comprehensive documentation for the FUSEtech database schema, designed for **Neon Database (PostgreSQL)** with full compatibility with the TypeScript interfaces in `src/lib/database/neon.ts`.

## 🗂️ Files Structure

```
database/
├── schema.sql                 # Complete database schema
├── README.md                  # Setup and usage guide
├── SCHEMA_DOCUMENTATION.md    # This file - detailed documentation
├── setup.sh                  # Automated setup script
├── migrations/
│   └── 001_initial_schema.sql # Initial migration
└── seeds/
    └── development_data.sql   # Sample data for development
```

## 🏗️ Schema Architecture

### Core Design Principles

1. **Scalability**: Designed to handle millions of users and activities
2. **Performance**: Optimized indexes for common query patterns
3. **Security**: Built-in constraints and validation
4. **Flexibility**: JSONB fields for extensible data
5. **Audit Trail**: Complete transaction history
6. **Multi-Platform**: Support for various fitness data sources

### Entity Relationship Diagram

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    users    │    │ strava_connections│    │   activities    │
│             │◄──►│                  │    │                 │
│ id (PK)     │    │ user_id (FK)     │    │ user_id (FK)    │
│ email       │    │ athlete_id       │    │ strava_id       │
│ wallet_addr │    │ access_token     │    │ tokens_earned   │
│ balance     │    │ refresh_token    │    │ is_verified     │
└─────────────┘    └──────────────────┘    └─────────────────┘
       │                                            │
       │            ┌─────────────────┐            │
       └───────────►│  transactions   │◄───────────┘
                    │                 │
                    │ user_id (FK)    │
                    │ activity_id(FK) │
                    │ amount          │
                    │ type            │
                    └─────────────────┘
```

## 📊 Table Specifications

### 1. users
**Purpose**: Core user accounts with wallet abstraction

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| name | VARCHAR(255) | NOT NULL | Display name |
| avatar_url | TEXT | NULL | Profile picture URL |
| provider | VARCHAR(50) | NOT NULL, CHECK | Auth provider (email, google, apple, strava) |
| provider_id | VARCHAR(255) | NOT NULL | External provider ID |
| wallet_address | VARCHAR(42) | UNIQUE, NOT NULL | Ethereum wallet address |
| points_balance | DECIMAL(15,4) | DEFAULT 0, CHECK >= 0 | Current FUSE token balance |
| total_earned | DECIMAL(15,4) | DEFAULT 0, CHECK >= 0 | Lifetime tokens earned |
| total_spent | DECIMAL(15,4) | DEFAULT 0, CHECK >= 0 | Lifetime tokens spent |
| staking_balance | DECIMAL(15,4) | DEFAULT 0, CHECK >= 0 | Tokens currently staked |
| is_verified | BOOLEAN | DEFAULT false | Email verification status |
| kyc_completed | BOOLEAN | DEFAULT false | KYC compliance status |
| timezone | VARCHAR(50) | DEFAULT 'UTC' | User timezone |
| language | VARCHAR(10) | DEFAULT 'en' | Preferred language |
| notification_preferences | JSONB | DEFAULT {...} | Notification settings |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update time |
| last_login_at | TIMESTAMP WITH TIME ZONE | NULL | Last login timestamp |

**Indexes**:
- `idx_users_email` on (email)
- `idx_users_provider` on (provider, provider_id)
- `idx_users_wallet` on (wallet_address)
- `idx_users_verification` on (is_verified, kyc_completed)

### 2. strava_connections
**Purpose**: OAuth tokens and Strava athlete data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Connection identifier |
| user_id | UUID | FK users(id), NOT NULL | Associated user |
| athlete_id | BIGINT | UNIQUE, NOT NULL | Strava athlete ID |
| access_token | TEXT | NOT NULL | OAuth access token |
| refresh_token | TEXT | NOT NULL | OAuth refresh token |
| expires_at | BIGINT | NOT NULL | Token expiration timestamp |
| scope | TEXT | NOT NULL | OAuth scope permissions |
| athlete_data | JSONB | NULL | Strava athlete profile |
| is_active | BOOLEAN | DEFAULT true | Connection status |
| webhook_subscription_id | INTEGER | NULL | Webhook subscription ID |
| last_sync_at | TIMESTAMP WITH TIME ZONE | NULL | Last data sync time |
| sync_frequency_hours | INTEGER | DEFAULT 24 | Sync frequency |

**Indexes**:
- `idx_strava_athlete` on (athlete_id)
- `idx_strava_user` on (user_id)
- `idx_strava_expires` on (expires_at)

### 3. activities
**Purpose**: Fitness activities from all sources

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Activity identifier |
| user_id | UUID | FK users(id), NOT NULL | Activity owner |
| strava_id | BIGINT | UNIQUE | Strava activity ID |
| source | VARCHAR(20) | DEFAULT 'strava', CHECK | Data source |
| type | VARCHAR(50) | NOT NULL | Activity type (Run, Ride, etc.) |
| name | VARCHAR(255) | NOT NULL | Activity name |
| description | TEXT | NULL | Activity description |
| distance | DECIMAL(10,3) | NOT NULL, CHECK >= 0 | Distance in meters |
| moving_time | INTEGER | NOT NULL, CHECK > 0 | Moving time in seconds |
| elapsed_time | INTEGER | NOT NULL, CHECK >= moving_time | Total time in seconds |
| total_elevation_gain | DECIMAL(8,2) | DEFAULT 0, CHECK >= 0 | Elevation gain in meters |
| average_speed | DECIMAL(8,3) | DEFAULT 0, CHECK >= 0 | Average speed in m/s |
| max_speed | DECIMAL(8,3) | DEFAULT 0, CHECK >= 0 | Maximum speed in m/s |
| calories | INTEGER | CHECK > 0 | Calories burned |
| heart_rate_avg | INTEGER | CHECK 0-300 | Average heart rate |
| heart_rate_max | INTEGER | CHECK 0-300 | Maximum heart rate |
| start_date | TIMESTAMP WITH TIME ZONE | NOT NULL | Activity start time |
| end_date | TIMESTAMP WITH TIME ZONE | NULL | Activity end time |
| tokens_earned | DECIMAL(10,4) | NOT NULL, DEFAULT 0 | FUSE tokens earned |
| bonus_multiplier | DECIMAL(4,2) | DEFAULT 1.00 | Bonus multiplier applied |
| is_verified | BOOLEAN | DEFAULT true | Verification status |
| verification_method | VARCHAR(20) | DEFAULT 'automatic' | How it was verified |
| flagged_for_review | BOOLEAN | DEFAULT false | Fraud detection flag |

**Indexes**:
- `idx_activities_user` on (user_id)
- `idx_activities_date` on (start_date DESC)
- `idx_activities_user_date` on (user_id, start_date DESC)
- `idx_activities_strava` on (strava_id) WHERE strava_id IS NOT NULL
- `idx_activities_tokens` on (tokens_earned) WHERE tokens_earned > 0

### 4. transactions
**Purpose**: Complete FUSE token transaction history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | Transaction identifier |
| user_id | UUID | FK users(id), NOT NULL | Transaction owner |
| type | VARCHAR(20) | NOT NULL, CHECK | Transaction type |
| category | VARCHAR(50) | NULL | Transaction category |
| amount | DECIMAL(15,4) | NOT NULL, CHECK != 0 | Token amount |
| currency | VARCHAR(10) | DEFAULT 'FUSE' | Currency type |
| description | TEXT | NOT NULL | Transaction description |
| reference_id | VARCHAR(100) | NULL | External reference |
| activity_id | UUID | FK activities(id) | Related activity |
| marketplace_item_id | VARCHAR(255) | NULL | Marketplace item |
| staking_pool_id | VARCHAR(100) | NULL | Staking pool |
| status | VARCHAR(20) | DEFAULT 'completed', CHECK | Transaction status |
| blockchain_tx_hash | VARCHAR(66) | NULL | Blockchain transaction hash |
| balance_before | DECIMAL(15,4) | NULL | Balance before transaction |
| balance_after | DECIMAL(15,4) | NULL | Balance after transaction |
| processed_by | VARCHAR(50) | DEFAULT 'system' | Processing entity |
| processing_fee | DECIMAL(10,4) | DEFAULT 0 | Transaction fee |

**Indexes**:
- `idx_transactions_user` on (user_id)
- `idx_transactions_user_created` on (user_id, created_at DESC)
- `idx_transactions_type` on (type)
- `idx_transactions_status` on (status)

## 🔧 Functions and Procedures

### Token Calculation Function
```sql
calculate_activity_tokens(
    activity_type VARCHAR(50),
    distance_meters DECIMAL(10,3),
    moving_time_seconds INTEGER,
    bonus_multiplier DECIMAL(4,2) DEFAULT 1.00
) RETURNS DECIMAL(10,4)
```

**Purpose**: Calculates FUSE tokens for activities based on type and performance

**Token Multipliers**:
- Running: 5 tokens/km
- Cycling: 2 tokens/km  
- Walking: 3 tokens/km
- Swimming: 8 tokens/km
- Hiking: 4 tokens/km

**Performance Bonuses**:
- Running sub-6min pace: +20% bonus
- Minimum 1 token per activity
- Maximum 1000 tokens per activity

### User Statistics Function
```sql
get_user_stats(user_uuid UUID) 
RETURNS TABLE(
    total_activities BIGINT,
    total_distance DECIMAL(15,3),
    total_time INTEGER,
    total_tokens DECIMAL(15,4),
    current_streak INTEGER,
    achievements_count BIGINT
)
```

**Purpose**: Provides comprehensive user statistics for dashboard

### Streak Calculation Function
```sql
calculate_current_streak(user_uuid UUID) RETURNS INTEGER
```

**Purpose**: Calculates consecutive days with activities

## 🔒 Security Features

### Data Validation
- Wallet address format validation (Ethereum format)
- Activity duration limits (max 24h moving, 48h elapsed)
- Future date prevention for activities
- Token balance non-negative constraints

### Access Control
- Row-level security ready
- Application user with minimal permissions
- Audit trails for all changes
- Encrypted token storage capability

### Fraud Prevention
- Activity verification system
- Review flagging mechanism
- Performance anomaly detection
- Duplicate activity prevention

## 📈 Performance Optimizations

### Indexing Strategy
- Primary keys on all tables
- Foreign key indexes
- Composite indexes for common queries
- Partial indexes for filtered queries

### Query Patterns
- Efficient pagination with LIMIT/OFFSET
- Date range queries optimized
- User-specific data access patterns
- Aggregation query support

### Scaling Considerations
- UUID primary keys for distributed systems
- Timestamp partitioning ready
- Read replica support
- Connection pooling compatible

## 🔄 Maintenance Procedures

### Regular Maintenance
```sql
-- Clean expired sessions
SELECT cleanup_expired_sessions();

-- Get expiring Strava tokens
SELECT * FROM get_expiring_strava_tokens(24);

-- Update user statistics
REFRESH MATERIALIZED VIEW user_stats_summary;
```

### Monitoring Queries
```sql
-- Check database health
SELECT * FROM schema_info;

-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname = 'public';
```

## 🚀 Deployment Guide

### Development Setup
```bash
# Run automated setup
./database/setup.sh development

# Manual setup
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/seeds/development_data.sql
```

### Production Setup
```bash
# Run production setup
./database/setup.sh production

# Manual security hardening
psql $DATABASE_URL -c "CREATE USER fusetech_app WITH PASSWORD 'secure_password';"
psql $DATABASE_URL -c "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fusetech_app;"
```

### Migration Process
1. Test migration on staging
2. Backup production database
3. Run migration in transaction
4. Verify data integrity
5. Monitor performance

## 📊 Sample Queries

### User Dashboard Data
```sql
-- Get user overview
SELECT u.name, u.points_balance, s.* 
FROM users u
LEFT JOIN get_user_stats(u.id) s ON true
WHERE u.id = $1;

-- Recent activities
SELECT * FROM activities 
WHERE user_id = $1 
ORDER BY start_date DESC 
LIMIT 10;
```

### Token Economics
```sql
-- Total tokens in circulation
SELECT SUM(points_balance) FROM users;

-- Daily token distribution
SELECT DATE(created_at), SUM(amount) 
FROM transactions 
WHERE type = 'earn' 
GROUP BY DATE(created_at) 
ORDER BY DATE(created_at) DESC;
```

### Performance Analytics
```sql
-- Most active users
SELECT u.name, COUNT(a.id) as activity_count
FROM users u
JOIN activities a ON u.id = a.user_id
WHERE a.start_date >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name
ORDER BY activity_count DESC
LIMIT 10;
```

---

**Schema Version**: 1.0  
**Last Updated**: January 2024  
**Compatibility**: PostgreSQL 14+, Neon Database  
**TypeScript Interfaces**: `src/lib/database/neon.ts`
