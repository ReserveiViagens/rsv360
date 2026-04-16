#!/bin/bash

# scripts/rollback.sh
# Rollback RSV360 deployment to previous version
# Usage: ./rollback.sh <environment> <failed_version>
# Example: ./rollback.sh production v1.2.3

set -e

ENVIRONMENT=$1
FAILED_VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$FAILED_VERSION" ]; then
    echo "❌ Usage: $0 <environment> <failed_version>"
    echo "   Environment: staging or production"
    echo "   Failed Version: e.g., v1.2.3"
    exit 1
fi

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ Invalid environment. Must be 'staging' or 'production'"
    exit 1
fi

echo "🔄 Starting rollback for $ENVIRONMENT (failed version: $FAILED_VERSION)"

# Set compose file based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    COMPOSE_FILE="docker-compose.staging.yml"
else
    COMPOSE_FILE="docker-compose.prod.yml"
fi

# Stop current deployment
echo "🛑 Stopping current deployment..."
docker-compose -f "$COMPOSE_FILE" down

# Note: In a real scenario, you would pull the previous version's images
# For now, assuming previous version is cached or manually restored
echo "⚠️  Manual intervention required: Ensure previous version images are available"

# Restart with previous version (assuming images are available)
echo "🔄 Restarting with previous version..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait and health check
echo "⏳ Waiting for rollback to complete..."
sleep 30

if ./scripts/health-check.sh "$ENVIRONMENT"; then
    echo "✅ Rollback successful!"
    echo "📊 Services are healthy after rollback"
else
    echo "❌ Rollback failed! Manual intervention required."
    echo "🔍 Check logs and services status"
    exit 1
fi