# FUSEtech Database Schema

## Overview

This directory contains the complete database schema for the FUSEtech fitness tracking and token rewards platform. The schema is designed for **Neon Database** (PostgreSQL) and supports all core features including user management, Strava integration, activity tracking, and FUSE token transactions.

## Files

- `schema.sql` - Complete database schema with tables, indexes, functions, and triggers
- `migrations/` - Database migration files for version control
- `seeds/` - Sample data for development and testing

## Quick Setup

### 1. Create Database on Neon

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project: "FUSEtech"
3. Copy the connection string
4. Update your `.env.local` file:

```bash
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Run Schema

```bash
# Connect to your Neon database and run:
psql "postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require" -f database/schema.sql
```

### 3. Verify Installation

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check functions were created
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- View schema info
SELECT * FROM schema_info;
```

## Schema Architecture

### Core Tables

#### 1. **users**
- **Purpose**: User accounts with wallet abstraction
- **Key Features**: 
  - Multiple auth providers (Strava, Google, Apple, Email)
  - Automatic wallet generation
  - FUSE token balance tracking
  - KYC and verification status

#### 2. **strava_connections**
- **Purpose**: OAuth tokens and Strava athlete data
- **Key Features**:
  - Secure token storage
  - Automatic token refresh
  - Webhook subscription management
  - Sync frequency control

#### 3. **activities**
- **Purpose**: Fitness activities from all sources
- **Key Features**:
  - Multi-source support (Strava, manual, Apple Health)
  - Detailed performance metrics
  - FUSE token calculation
  - Fraud prevention and verification

#### 4. **transactions**
- **Purpose**: Complete FUSE token transaction history
- **Key Features**:
  - All transaction types (earn, spend, stake, unstake)
  - Audit trail with balance snapshots
  - Marketplace integration
  - Blockchain preparation

### Auxiliary Tables

#### 5. **user_sessions**
- Session management and device tracking

#### 6. **achievements** & **user_achievements**
- Gamification system with badges and rewards

#### 7. **notification_tokens**
- Push notification device token management

## Key Features

### 🔐 Security
- UUID primary keys for all tables
- Encrypted token storage capability
- Input validation and constraints
- Audit trails for all changes

### ⚡ Performance
- Optimized indexes for common queries
- Composite indexes for complex filters
- Efficient pagination support
- Query performance monitoring

### 🎮 Gamification
- Achievement system with automatic tracking
- Streak calculation functions
- Token reward calculations
- Progress tracking

### 🔗 Integration Ready
- Strava OAuth flow support
- Webhook processing capability
- Multi-platform notification support
- Blockchain transaction preparation

## Functions and Procedures

### Token Calculation
```sql
-- Calculate FUSE tokens for an activity
SELECT calculate_activity_tokens('run', 5000, 1800, 1.2);
-- Returns: tokens earned for 5km run in 30 minutes with 1.2x bonus
```

### User Statistics
```sql
-- Get comprehensive user stats
SELECT * FROM get_user_stats('user-uuid-here');
-- Returns: activities, distance, time, tokens, streak, achievements
```

### Maintenance
```sql
-- Clean up expired sessions
SELECT cleanup_expired_sessions();

-- Get tokens expiring soon
SELECT * FROM get_expiring_strava_tokens(24);
```

## Data Types and Precision

### Financial Precision
- **FUSE Tokens**: `DECIMAL(15,4)` - Supports up to 999,999,999,999.9999 tokens
- **Distances**: `DECIMAL(10,3)` - Meter precision for activities
- **Speeds**: `DECIMAL(8,3)` - High precision for performance metrics

### Geographic Data
- **Coordinates**: `DECIMAL(10,8)` and `DECIMAL(11,8)` for lat/lng
- **Elevation**: `DECIMAL(8,2)` - Centimeter precision

### Time Handling
- **Timestamps**: `TIMESTAMP WITH TIME ZONE` for global users
- **Durations**: `INTEGER` seconds for activities

## Constraints and Validation

### Business Rules
- Token balances cannot be negative
- Activity durations must be reasonable (max 24h moving time)
- Start dates cannot be in the future
- Wallet addresses must be valid Ethereum format

### Data Integrity
- Foreign key constraints with CASCADE deletes
- Unique constraints on external IDs
- Check constraints for valid enum values
- Trigger-based automatic updates

## Indexing Strategy

### Primary Indexes
- All foreign keys are indexed
- Timestamp fields for chronological queries
- Status fields for filtering

### Composite Indexes
- User + date combinations for activity queries
- User + type + status for transaction filtering
- Multi-column indexes for dashboard queries

## Migration Strategy

### Version Control
- Each schema change gets a migration file
- Migrations are numbered and timestamped
- Rollback procedures for each migration

### Deployment
- Test migrations on staging first
- Use transactions for atomic deployments
- Monitor performance after migrations

## Performance Considerations

### Query Optimization
- Use prepared statements
- Implement connection pooling
- Monitor slow query logs
- Regular VACUUM and ANALYZE

### Scaling
- Partition large tables by date if needed
- Consider read replicas for analytics
- Implement caching for frequent queries
- Archive old data periodically

## Security Best Practices

### Production Setup
- Create dedicated application user
- Use connection pooling
- Encrypt sensitive data at rest
- Regular security audits

### Access Control
```sql
-- Example production user setup
CREATE USER fusetech_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE fusetech TO fusetech_app;
GRANT USAGE ON SCHEMA public TO fusetech_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fusetech_app;
```

## Monitoring and Maintenance

### Regular Tasks
- Clean up expired sessions daily
- Refresh expiring Strava tokens
- Archive old transaction data
- Update user statistics

### Health Checks
- Monitor connection counts
- Check for long-running queries
- Verify data consistency
- Track storage usage

## Development Workflow

### Local Development
1. Use the schema.sql file to set up local database
2. Run seed data for testing
3. Use migrations for schema changes
4. Test with realistic data volumes

### Testing
- Unit tests for all functions
- Integration tests for complex queries
- Performance tests with large datasets
- Data consistency validation

## Support and Documentation

### Resources
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [FUSEtech API Documentation](../docs/API.md)

### Getting Help
- Check the schema comments for table purposes
- Review function documentation
- Use `EXPLAIN ANALYZE` for query optimization
- Monitor logs for errors and warnings

---

**Schema Version**: 1.0  
**Last Updated**: 2024  
**Compatible With**: PostgreSQL 14+, Neon Database  
**TypeScript Interfaces**: `src/lib/database/neon.ts`
