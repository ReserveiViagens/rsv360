# 🚀 RSV360 Deployment Guide

## Overview
This guide covers the deployment process for RSV360 across different environments (development, staging, production).

## Prerequisites
- Docker and Docker Compose installed
- Git repository access
- Environment variables configured
- SSL certificates (for production)

## Environment Setup

### 1. Development Environment
```bash
# Clone repository
git clone <repository-url>
cd rsv360

# Setup environment
make setup
# Edit .env with your local configuration

# Start development
make dev
```

### 2. Staging Environment
```bash
# Setup staging environment
make setup-staging
# Edit .env.staging with staging configuration

# Deploy to staging
make deploy-staging
```

### 3. Production Environment
```bash
# Setup production environment
make setup-prod
# Edit .env.production with production configuration

# Deploy to production
make deploy-prod
```

## Deployment Process

### Automated Deployment (Recommended)
```bash
# Staging deployment
make deploy-staging

# Production deployment (requires approval)
make deploy-prod
```

### Manual Deployment
```bash
# Using deployment scripts
./scripts/deploy.sh <environment> <version>

# Examples
./scripts/deploy.sh staging v1.2.3
./scripts/deploy.sh production v1.2.3
```

## Rollback Procedures

### Automated Rollback
```bash
# Rollback staging
make rollback-staging

# Rollback production
make rollback-prod
```

### Manual Rollback
```bash
# Using rollback script
./scripts/rollback.sh <environment> <failed_version>
```

## Monitoring

### Health Checks
```bash
# Run health checks
make health-check

# Or directly
./scripts/health-check.sh <environment>
```

### Monitoring Stack
- **Prometheus**: http://localhost:9090 (production: port 9090)
- **Grafana**: http://localhost:3001 (production: port 3001)
- **Application Metrics**: http://localhost:3002/api/v1/metrics

## Database Operations

### Backup
```bash
# Development backup
make db-backup

# Production backup
make db-backup-prod

# Custom backup
./scripts/backup-db.sh <environment> <backup_name>
```

### Restore
```bash
# Restore database (use with caution)
make db-restore
# Follow prompts for backup selection
```

### Seeding
```bash
# Seed database
make db-seed
```

## SSL Configuration (Production)

1. Obtain SSL certificates from Let's Encrypt or your CA
2. Place certificates in `docker/nginx/ssl/`:
   - `cert.pem` - Full chain certificate
   - `key.pem` - Private key
3. Update nginx configuration if needed

## Troubleshooting

### Common Issues

#### Services not starting
```bash
# Check logs
make docker-logs

# Check health
make health-check

# Restart services
make docker-down && make docker-up
```

#### Database connection issues
```bash
# Check database status
docker-compose exec postgres pg_isready

# View database logs
docker-compose logs postgres
```

#### Memory issues
```bash
# Check resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

### Logs and Debugging
```bash
# Application logs
make logs

# Docker logs
make docker-logs

# Specific service logs
docker-compose logs <service_name>
```

## Security Considerations

- Use strong, unique passwords for all services
- Regularly rotate JWT secrets
- Keep dependencies updated
- Monitor security scan results
- Use environment-specific configurations

## Performance Optimization

- Configure resource limits in docker-compose files
- Use Redis for caching
- Optimize database queries
- Monitor memory and CPU usage
- Scale services as needed

## Backup Strategy

- Automated daily backups
- Keep last 30 backups
- Test restore procedures regularly
- Store backups securely
- Monitor backup success/failure

## Support

For deployment issues:
1. Check this documentation
2. Review logs and health checks
3. Consult the runbook for specific procedures
4. Contact the development team