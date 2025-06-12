-- =====================================================
-- FUSEtech Development Seed Data
-- =====================================================
-- 
-- This file contains sample data for development and testing
-- DO NOT RUN IN PRODUCTION
-- =====================================================

-- Clear existing data (development only)
TRUNCATE TABLE transactions, activities, strava_connections, user_achievements, achievements, notification_tokens, user_sessions, users RESTART IDENTITY CASCADE;

-- =====================================================
-- SAMPLE USERS
-- =====================================================

INSERT INTO users (id, email, name, avatar_url, provider, provider_id, wallet_address, points_balance, total_earned, total_spent) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.runner@example.com', 'John Runner', 'https://example.com/avatars/john.jpg', 'strava', 'strava_12345', '0x1234567890123456789012345678901234567890', 245.50, 300.00, 54.50),
('550e8400-e29b-41d4-a716-446655440002', 'sarah.cyclist@example.com', 'Sarah Cyclist', 'https://example.com/avatars/sarah.jpg', 'google', 'google_67890', '0x2345678901234567890123456789012345678901', 189.25, 220.00, 30.75),
('550e8400-e29b-41d4-a716-446655440003', 'mike.swimmer@example.com', 'Mike Swimmer', 'https://example.com/avatars/mike.jpg', 'apple', 'apple_54321', '0x3456789012345678901234567890123456789012', 412.75, 450.00, 37.25),
('550e8400-e29b-41d4-a716-446655440004', 'lisa.hiker@example.com', 'Lisa Hiker', 'https://example.com/avatars/lisa.jpg', 'email', 'email_98765', '0x4567890123456789012345678901234567890123', 78.00, 78.00, 0.00);

-- =====================================================
-- STRAVA CONNECTIONS
-- =====================================================

INSERT INTO strava_connections (id, user_id, athlete_id, access_token, refresh_token, expires_at, scope, athlete_data, last_sync_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 12345, 'strava_access_token_12345', 'strava_refresh_token_12345', EXTRACT(EPOCH FROM NOW() + INTERVAL '6 hours'), 'read,activity:read_all', '{"firstname": "John", "lastname": "Runner", "city": "San Francisco", "state": "CA", "country": "USA", "premium": true}', NOW() - INTERVAL '2 hours');

-- =====================================================
-- SAMPLE ACTIVITIES
-- =====================================================

-- John's running activities
INSERT INTO activities (id, user_id, strava_id, type, name, distance, moving_time, elapsed_time, total_elevation_gain, average_speed, max_speed, calories, start_date, tokens_earned, is_verified) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1001, 'Run', 'Morning Run in Golden Gate Park', 5000, 1800, 1950, 45.5, 2.78, 4.2, 320, NOW() - INTERVAL '1 day', 25.0, true),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 1002, 'Run', 'Evening Jog', 3200, 1200, 1320, 12.3, 2.67, 3.8, 210, NOW() - INTERVAL '2 days', 16.0, true),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 1003, 'Run', 'Weekend Long Run', 10000, 3600, 3900, 89.2, 2.78, 4.5, 650, NOW() - INTERVAL '3 days', 50.0, true);

-- Sarah's cycling activities
INSERT INTO activities (id, user_id, strava_id, type, name, distance, moving_time, elapsed_time, total_elevation_gain, average_speed, max_speed, calories, start_date, tokens_earned, is_verified) VALUES
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 2001, 'Ride', 'Bay Area Bike Tour', 25000, 3600, 4200, 234.7, 6.94, 12.5, 890, NOW() - INTERVAL '1 day', 50.0, true),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 2002, 'Ride', 'Commute to Work', 8000, 1200, 1500, 45.2, 6.67, 9.8, 280, NOW() - INTERVAL '2 days', 16.0, true);

-- Mike's swimming activities
INSERT INTO activities (id, user_id, strava_id, type, name, distance, moving_time, elapsed_time, total_elevation_gain, average_speed, max_speed, calories, start_date, tokens_earned, is_verified) VALUES
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 3001, 'Swim', 'Pool Training Session', 2000, 2400, 2400, 0, 0.83, 1.2, 450, NOW() - INTERVAL '1 day', 16.0, true),
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 3002, 'Swim', 'Open Water Swim', 1500, 1800, 1800, 0, 0.83, 1.1, 380, NOW() - INTERVAL '3 days', 12.0, true);

-- Lisa's hiking activities
INSERT INTO activities (id, user_id, strava_id, type, name, distance, moving_time, elapsed_time, total_elevation_gain, average_speed, max_speed, calories, start_date, tokens_earned, is_verified) VALUES
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440004', 4001, 'Hike', 'Mount Tamalpais Trail', 8000, 7200, 8400, 456.8, 1.11, 2.1, 520, NOW() - INTERVAL '2 days', 32.0, true),
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 4002, 'Walk', 'Neighborhood Walk', 3000, 1800, 2100, 23.4, 1.67, 2.3, 180, NOW() - INTERVAL '4 days', 9.0, true);

-- =====================================================
-- SAMPLE TRANSACTIONS
-- =====================================================

-- Activity reward transactions
INSERT INTO transactions (id, user_id, type, category, amount, description, activity_id, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'earn', 'activity_reward', 25.0, 'FUSE tokens earned for Morning Run in Golden Gate Park', '770e8400-e29b-41d4-a716-446655440001', 'completed'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'earn', 'activity_reward', 16.0, 'FUSE tokens earned for Evening Jog', '770e8400-e29b-41d4-a716-446655440002', 'completed'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'earn', 'activity_reward', 50.0, 'FUSE tokens earned for Weekend Long Run', '770e8400-e29b-41d4-a716-446655440003', 'completed'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'earn', 'activity_reward', 50.0, 'FUSE tokens earned for Bay Area Bike Tour', '770e8400-e29b-41d4-a716-446655440004', 'completed'),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'earn', 'activity_reward', 16.0, 'FUSE tokens earned for Commute to Work', '770e8400-e29b-41d4-a716-446655440005', 'completed');

-- Marketplace spending transactions
INSERT INTO transactions (id, user_id, type, category, amount, description, marketplace_item_id, status) VALUES
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'spend', 'marketplace_purchase', -25.0, 'Purchased Nike Running Shoes', 'nike_shoes_001', 'completed'),
('880e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'spend', 'marketplace_purchase', -15.0, 'Purchased Protein Powder', 'protein_powder_001', 'completed');

-- Achievement reward transactions
INSERT INTO transactions (id, user_id, type, category, amount, description, status) VALUES
('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'earn', 'achievement_reward', 10.0, 'Achievement unlocked: First Steps', 'completed'),
('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'earn', 'achievement_reward', 25.0, 'Achievement unlocked: 10K Explorer', 'completed');

-- =====================================================
-- SAMPLE ACHIEVEMENTS
-- =====================================================

INSERT INTO achievements (id, code, name, description, category, requirements, reward_tokens, badge_icon_url) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'first_activity', 'First Steps', 'Complete your first activity', 'milestone', '{"activities": 1}', 10.0, '/badges/first_steps.svg'),
('990e8400-e29b-41d4-a716-446655440002', 'distance_10k', '10K Explorer', 'Cover 10 kilometers total distance', 'distance', '{"total_distance": 10000}', 25.0, '/badges/10k_explorer.svg'),
('990e8400-e29b-41d4-a716-446655440003', 'distance_100k', '100K Adventurer', 'Cover 100 kilometers total distance', 'distance', '{"total_distance": 100000}', 100.0, '/badges/100k_adventurer.svg'),
('990e8400-e29b-41d4-a716-446655440004', 'streak_7', 'Week Warrior', 'Maintain a 7-day activity streak', 'consistency', '{"streak_days": 7}', 50.0, '/badges/week_warrior.svg'),
('990e8400-e29b-41d4-a716-446655440005', 'tokens_100', 'Century Club', 'Earn 100 FUSE tokens', 'earnings', '{"total_tokens": 100}', 20.0, '/badges/century_club.svg');

-- =====================================================
-- SAMPLE USER ACHIEVEMENTS
-- =====================================================

INSERT INTO user_achievements (id, user_id, achievement_id, earned_at, progress_data) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '3 days', '{"activities_completed": 1}'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days', '{"total_distance": 18200}'),
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440005', NOW() - INTERVAL '1 day', '{"total_tokens": 245.50}'),
('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '3 days', '{"activities_completed": 1}'),
('aa0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440002', NOW() - INTERVAL '2 days', '{"total_distance": 3500}');

-- =====================================================
-- SAMPLE NOTIFICATION TOKENS
-- =====================================================

INSERT INTO notification_tokens (id, user_id, token, platform, device_id) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'fcm_token_john_web_browser', 'web', 'browser_john_chrome'),
('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'fcm_token_sarah_iphone', 'ios', 'iphone_sarah_12pro'),
('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'fcm_token_mike_android', 'android', 'android_mike_pixel6');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data was inserted correctly
DO $$
DECLARE
    user_count INTEGER;
    activity_count INTEGER;
    transaction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO activity_count FROM activities;
    SELECT COUNT(*) INTO transaction_count FROM transactions;
    
    RAISE NOTICE 'Development seed data loaded successfully:';
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- Activities: %', activity_count;
    RAISE NOTICE '- Transactions: %', transaction_count;
    
    IF user_count < 4 OR activity_count < 8 OR transaction_count < 9 THEN
        RAISE WARNING 'Some seed data may not have been loaded correctly';
    END IF;
END $$;
