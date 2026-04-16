# RSV360 Development and Deployment Makefile
# Usage: make <target>

.PHONY: help install dev build test lint format clean docker-build docker-up docker-down docker-logs backup restore deploy health-check setup-monitoring

# Default target
help: ## Show this help message
	@echo "RSV360 Development and Deployment Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ============================================
# DEVELOPMENT COMMANDS
# ============================================

install: ## Install all dependencies
	@echo "Installing dependencies..."
	npm install
	cd backend && npm install
	cd apps/site-publico && npm install

install-backend: ## Install backend dependencies
	cd backend && npm install

install-frontend: ## Install frontend dependencies
	cd apps/site-publico && npm install

dev: ## Start development servers
	@echo "Starting development servers..."
	npm run dev

dev-backend: ## Start backend development server
	cd backend && npm run dev

dev-frontend: ## Start frontend development server
	cd apps/site-publico && npm run dev

build: ## Build all applications
	@echo "Building applications..."
	npm run build --workspace=apps/site-publico
	cd backend && npx tsc --noEmit

build-backend: ## Build backend
	cd backend && npx tsc --noEmit

build-frontend: ## Build frontend
	npm run build --workspace=apps/site-publico

test: ## Run all tests
	@echo "Running tests..."
	npm test

test-backend: ## Run backend tests
	cd backend && npm test

test-frontend: ## Run frontend tests
	cd apps/site-publico && npm test

lint: ## Run linting
	@echo "Running linters..."
	npm run lint
	cd backend && npm run lint
	cd apps/site-publico && npm run lint

format: ## Format code
	@echo "Formatting code..."
	npm run format
	cd backend && npm run format
	cd apps/site-publico && npm run format

clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -rf node_modules apps/*/node_modules backend/node_modules
	rm -rf apps/site-publico/.next apps/site-publico/out
	rm -rf backend/dist
	rm -rf .next coverage test-results playwright-report

# ============================================
# DOCKER COMMANDS
# ============================================

docker-build: ## Build Docker images
	@echo "Building Docker images..."
	docker build -f docker/backend/Dockerfile -t rsv360-backend:latest ./backend
	docker build -f docker/frontend/Dockerfile -t rsv360-frontend:latest ./apps/site-publico

docker-up: ## Start Docker Compose (development)
	@echo "Starting Docker Compose..."
	docker-compose up -d

docker-up-prod: ## Start Docker Compose (production)
	@echo "Starting production Docker Compose..."
	docker-compose -f docker-compose.prod.yml up -d

docker-down: ## Stop Docker Compose
	@echo "Stopping Docker Compose..."
	docker-compose down

docker-down-prod: ## Stop production Docker Compose
	@echo "Stopping production Docker Compose..."
	docker-compose -f docker-compose.prod.yml down

docker-logs: ## Show Docker Compose logs
	docker-compose logs -f

docker-logs-prod: ## Show production Docker Compose logs
	docker-compose -f docker-compose.prod.yml logs -f

# ============================================
# DATABASE COMMANDS
# ============================================

db-backup: ## Backup database
	@echo "Creating database backup..."
	./scripts/backup-db.sh development "manual-$(date +%Y%m%d-%H%M%S)"

db-backup-prod: ## Backup production database
	@echo "Creating production database backup..."
	./scripts/backup-db.sh production "manual-$(date +%Y%m%d-%H%M%S)"

db-restore: ## Restore database (use with caution)
	@echo "⚠️  WARNING: This will restore the database!"
	@read -p "Enter backup name to restore: " backup_name; \
	./scripts/restore-db.sh development "$$backup_name"

db-seed: ## Seed database with test data
	@echo "Seeding database..."
	./scripts/seed-production.sh development

db-migrate: ## Run database migrations
	cd backend && npm run migrate

# ============================================
# DEPLOYMENT COMMANDS
# ============================================

deploy-staging: ## Deploy to staging
	@echo "Deploying to staging..."
	./scripts/deploy.sh staging "$(shell git rev-parse --short HEAD)"

deploy-prod: ## Deploy to production
	@echo "Deploying to production..."
	./scripts/deploy.sh production "$(shell git rev-parse --short HEAD)"

rollback-staging: ## Rollback staging deployment
	@echo "Rolling back staging..."
	./scripts/rollback.sh staging "rollback-$(shell date +%Y%m%d-%H%M%S)"

rollback-prod: ## Rollback production deployment
	@echo "Rolling back production..."
	./scripts/rollback.sh production "rollback-$(shell date +%Y%m%d-%H%M%S)"

# ============================================
# MONITORING COMMANDS
# ============================================

health-check: ## Run health checks
	@echo "Running health checks..."
	./scripts/health-check.sh development

setup-monitoring: ## Setup monitoring stack
	@echo "Setting up monitoring..."
	docker-compose -f docker-compose.prod.yml up -d prometheus grafana postgres-exporter redis-exporter

# ============================================
# UTILITY COMMANDS
# ============================================

setup: ## Initial project setup
	@echo "Setting up RSV360 project..."
	make install
	make build
	cp .env.example .env
	@echo "Setup complete! Edit .env with your configuration."

setup-prod: ## Setup production environment
	@echo "Setting up production environment..."
	cp .env.production.example .env.production
	@echo "Edit .env.production with your production values."

setup-staging: ## Setup staging environment
	@echo "Setting up staging environment..."
	cp .env.staging.example .env.staging
	@echo "Edit .env.staging with your staging values."

validate: ## Validate configuration and setup
	@echo "Validating setup..."
	./validate-cd.bat
	make health-check

logs: ## Show application logs
	docker-compose logs -f backend frontend

update-deps: ## Update all dependencies
	@echo "Updating dependencies..."
	npm update
	cd backend && npm update
	cd apps/site-publico && npm update