#!/bin/bash

# =====================================================
# FUSEtech Database Setup Script
# =====================================================
# 
# This script sets up the FUSEtech database schema on Neon
# Usage: ./database/setup.sh [environment]
# 
# Environments:
#   development (default) - Sets up with sample data
#   staging              - Sets up clean schema
#   production           - Sets up with security hardening
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if psql is installed
    if ! command -v psql &> /dev/null; then
        log_error "psql is not installed. Please install PostgreSQL client."
        exit 1
    fi
    
    # Check if .env.local exists
    if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
        log_error ".env.local file not found. Please create it with DATABASE_URL."
        exit 1
    fi
    
    # Load environment variables
    source "$PROJECT_ROOT/.env.local"
    
    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL not found in .env.local"
        exit 1
    fi
    
    log_success "Requirements check passed"
}

test_connection() {
    log_info "Testing database connection..."
    
    if psql "$DATABASE_URL" -c "SELECT version();" > /dev/null 2>&1; then
        log_success "Database connection successful"
    else
        log_error "Failed to connect to database. Please check your DATABASE_URL."
        exit 1
    fi
}

run_schema() {
    log_info "Running database schema..."
    
    if psql "$DATABASE_URL" -f "$SCRIPT_DIR/schema.sql" > /dev/null 2>&1; then
        log_success "Schema applied successfully"
    else
        log_error "Failed to apply schema"
        exit 1
    fi
}

run_migrations() {
    log_info "Running database migrations..."
    
    # Check if migrations directory exists
    if [ -d "$SCRIPT_DIR/migrations" ]; then
        for migration in "$SCRIPT_DIR/migrations"/*.sql; do
            if [ -f "$migration" ]; then
                log_info "Running migration: $(basename "$migration")"
                if psql "$DATABASE_URL" -f "$migration" > /dev/null 2>&1; then
                    log_success "Migration $(basename "$migration") completed"
                else
                    log_warning "Migration $(basename "$migration") failed or already applied"
                fi
            fi
        done
    else
        log_warning "No migrations directory found"
    fi
}

load_seed_data() {
    if [ "$ENVIRONMENT" = "development" ]; then
        log_info "Loading development seed data..."
        
        if [ -f "$SCRIPT_DIR/seeds/development_data.sql" ]; then
            if psql "$DATABASE_URL" -f "$SCRIPT_DIR/seeds/development_data.sql" > /dev/null 2>&1; then
                log_success "Development seed data loaded"
            else
                log_warning "Failed to load seed data (may already exist)"
            fi
        else
            log_warning "Development seed data file not found"
        fi
    else
        log_info "Skipping seed data for $ENVIRONMENT environment"
    fi
}

verify_setup() {
    log_info "Verifying database setup..."
    
    # Check if core tables exist
    TABLES=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'activities', 'transactions', 'strava_connections');")
    
    if [ "$TABLES" -eq 4 ]; then
        log_success "All core tables found"
    else
        log_error "Missing core tables. Found $TABLES out of 4."
        exit 1
    fi
    
    # Check if functions exist
    FUNCTIONS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('calculate_activity_tokens', 'get_user_stats');")
    
    if [ "$FUNCTIONS" -ge 2 ]; then
        log_success "Core functions found"
    else
        log_warning "Some functions may be missing. Found $FUNCTIONS."
    fi
    
    # Check sample data for development
    if [ "$ENVIRONMENT" = "development" ]; then
        USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;")
        if [ "$USER_COUNT" -gt 0 ]; then
            log_success "Sample users found: $USER_COUNT"
        else
            log_warning "No sample users found"
        fi
    fi
}

create_app_user() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Creating application user for production..."
        
        read -p "Enter application user password: " -s APP_PASSWORD
        echo
        
        psql "$DATABASE_URL" -c "
            DO \$\$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'fusetech_app') THEN
                    CREATE USER fusetech_app WITH PASSWORD '$APP_PASSWORD';
                    GRANT CONNECT ON DATABASE fusetech TO fusetech_app;
                    GRANT USAGE ON SCHEMA public TO fusetech_app;
                    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fusetech_app;
                    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO fusetech_app;
                    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fusetech_app;
                END IF;
            END
            \$\$;
        " > /dev/null 2>&1
        
        log_success "Application user created"
    fi
}

show_summary() {
    echo
    echo "======================================"
    echo "  FUSEtech Database Setup Complete"
    echo "======================================"
    echo
    echo "Environment: $ENVIRONMENT"
    echo "Database URL: ${DATABASE_URL%/*}/***"
    echo
    echo "Next steps:"
    echo "1. Update your application configuration"
    echo "2. Test the connection from your app"
    echo "3. Run your application tests"
    echo
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "Development features enabled:"
        echo "- Sample users and activities loaded"
        echo "- Test data for all features"
        echo "- Debug functions available"
        echo
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "Production security features:"
        echo "- Application user created"
        echo "- Minimal permissions granted"
        echo "- No sample data loaded"
        echo
        log_warning "Remember to:"
        log_warning "- Change default passwords"
        log_warning "- Set up SSL certificates"
        log_warning "- Configure backup procedures"
        log_warning "- Set up monitoring"
    fi
}

# Main execution
main() {
    echo "======================================"
    echo "  FUSEtech Database Setup"
    echo "======================================"
    echo "Environment: $ENVIRONMENT"
    echo

    check_requirements
    test_connection
    run_schema
    run_migrations
    load_seed_data
    create_app_user
    verify_setup
    show_summary
}

# Handle script arguments
case "$ENVIRONMENT" in
    development|staging|production)
        main
        ;;
    *)
        echo "Usage: $0 [development|staging|production]"
        echo "Default: development"
        exit 1
        ;;
esac
