-- Remover triggers
DROP TRIGGER IF EXISTS update_auth_users_updated_at ON auth.users;
DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;
DROP TRIGGER IF EXISTS update_physical_activities_updated_at ON public.physical_activities;
DROP TRIGGER IF EXISTS update_social_activities_updated_at ON public.social_activities;
DROP TRIGGER IF EXISTS update_token_transactions_updated_at ON public.token_transactions;
DROP TRIGGER IF EXISTS update_challenges_updated_at ON public.challenges;
DROP TRIGGER IF EXISTS update_user_challenges_updated_at ON public.user_challenges;
DROP TRIGGER IF EXISTS update_achievements_updated_at ON public.achievements;
DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON public.user_achievements;
DROP TRIGGER IF EXISTS update_strava_connections_updated_at ON public.strava_connections;
DROP TRIGGER IF EXISTS update_social_connections_updated_at ON public.social_connections;
DROP TRIGGER IF EXISTS update_friendships_updated_at ON public.friendships;

-- Remover função
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Remover tabelas
DROP TABLE IF EXISTS public.friendships;
DROP TABLE IF EXISTS public.social_connections;
DROP TABLE IF EXISTS public.strava_connections;
DROP TABLE IF EXISTS public.user_achievements;
DROP TABLE IF EXISTS public.achievements;
DROP TABLE IF EXISTS public.user_challenges;
DROP TABLE IF EXISTS public.challenges;
DROP TABLE IF EXISTS public.token_transactions;
DROP TABLE IF EXISTS public.social_activities;
DROP TABLE IF EXISTS public.physical_activities;
DROP TABLE IF EXISTS public.wallets;
DROP TABLE IF EXISTS auth.users;

-- Remover esquema
DROP SCHEMA IF EXISTS auth;
