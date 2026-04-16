#!/bin/bash

# scripts/deploy.sh
# Deploy RSV360 application to staging or production
# Usage: ./deploy.sh <environment> <version>
# Example: ./deploy.sh production v1.2.3

set -e

ENVIRONMENT=$1
VERSION=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$VERSION" ]; then
    echo "❌ Usage: $0 <environment> <version>"
    echo "   Environment: staging or production"
    echo "   Version: e.g., v1.2.3"
    exit 1
fi

if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ Invalid environment. Must be 'staging' or 'production'"
    exit 1
fi

echo "🚀 Starting deployment to $ENVIRONMENT with version $VERSION"

# Set compose file based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    COMPOSE_FILE="docker-compose.staging.yml"
else
    COMPOSE_FILE="docker-compose.prod.yml"
fi

# Pre-deployment backup
echo "📦 Creating pre-deployment backup..."
./scripts/backup-db.sh "$ENVIRONMENT" "pre-deploy-$VERSION"

# Pull latest images
echo "📥 Pulling Docker images..."
docker-compose -f "$COMPOSE_FILE" pull

# Deploy
echo "🔄 Deploying services..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Running health checks..."
if ./scripts/health-check.sh "$ENVIRONMENT"; then
    echo "✅ Deployment successful!"
    echo "📊 Services are healthy"
else
    echo "❌ Health check failed! Initiating rollback..."
    ./scripts/rollback.sh "$ENVIRONMENT" "$VERSION"
    exit 1
fi