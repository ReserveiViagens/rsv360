#!/bin/bash

# scripts/health-check.sh
# Health check for RSV360 services
# Usage: ./health-check.sh <environment>
# Returns: 0 (healthy) or 1 (unhealthy)

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
    ENVIRONMENT="staging"  # Default
fi

echo "🏥 Running health checks for $ENVIRONMENT environment"

HEALTHY=true

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local service=$2
    echo -n "Checking $service ($url)... "
    if curl -f -s --max-time 10 "$url" > /dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ FAIL"
        HEALTHY=false
    fi
}

# Function to check database
check_database() {
    echo -n "Checking PostgreSQL... "
    if PGPASSWORD=${DB_PASSWORD:-password} psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d ${DB_NAME:-rsv360} -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ FAIL"
        HEALTHY=false
    fi
}

# Function to check Redis
check_redis() {
    echo -n "Checking Redis... "
    if redis-cli -h ${REDIS_HOST:-localhost} -p ${REDIS_PORT:-6379} ping | grep -q PONG; then
        echo "✅ OK"
    else
        echo "❌ FAIL"
        HEALTHY=false
    fi
}

# Determine base URL based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    BASE_URL="https://rsv360.com"
else
    BASE_URL="http://localhost"
fi

# Check services
check_http "$BASE_URL:3002/health" "API Backend"
check_http "$BASE_URL:3000/api/health" "Frontend"
check_http "$BASE_URL/marketing/health" "Marketing Service"
check_http "$BASE_URL/pricing/health" "Pricing Service"
check_database
check_redis

echo ""
if [ "$HEALTHY" = true ]; then
    echo "✅ All services are healthy!"
    exit 0
else
    echo "❌ Some services are unhealthy!"
    exit 1
fi