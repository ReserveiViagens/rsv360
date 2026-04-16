# RSV360 GitHub Secrets Configuration
# Required secrets for CI/CD pipelines

## 🔐 Repository Secrets (Settings > Secrets and variables > Actions)

### Staging Environment
```
STAGING_HOST          # Server hostname/IP for staging
STAGING_USER          # SSH username for staging server
STAGING_SSH_KEY       # Private SSH key for staging server access
STAGING_PORT          # SSH port (default: 22)
STAGING_PATH          # Path to application on staging server
```

### Production Environment
```
PRODUCTION_HOST       # Server hostname/IP for production
PRODUCTION_USER       # SSH username for production server
PRODUCTION_SSH_KEY    # Private SSH key for production server access
PRODUCTION_PORT       # SSH port (default: 22)
PRODUCTION_PATH       # Path to application on production server
```

### Notifications (Optional)
```
SLACK_WEBHOOK_URL     # Slack webhook for deployment notifications
```

## 🔧 Environment Variables (Settings > Environments)

### Staging Environment
- **Name**: `staging`
- **URL**: `https://staging.yourdomain.com`

### Production Environment
- **Name**: `production`
- **URL**: `https://yourdomain.com`
- **Required reviewers**: Add GitHub usernames for production approval

## 📋 Setup Instructions

### 1. Generate SSH Keys
```bash
# Generate SSH key pair for staging
ssh-keygen -t rsa -b 4096 -C "github-staging" -f ~/.ssh/github_staging

# Generate SSH key pair for production
ssh-keygen -t rsa -b 4096 -C "github-production" -f ~/.ssh/github_production
```

### 2. Add Public Keys to Servers
```bash
# Copy public key to staging server
ssh-copy-id -i ~/.ssh/github_staging.pub user@staging-server

# Copy public key to production server
ssh-copy-id -i ~/.ssh/github_production.pub user@production-server
```

### 3. Configure GitHub Secrets
1. Go to Repository Settings
2. Navigate to "Secrets and variables" > "Actions"
3. Add each secret listed above

### 4. Configure Environments
1. Go to Repository Settings
2. Navigate to "Environments"
3. Create "staging" and "production" environments
4. Add required reviewers for production

### 5. Test SSH Connection
```bash
# Test staging connection
ssh -i ~/.ssh/github_staging -o StrictHostKeyChecking=no user@staging-server

# Test production connection
ssh -i ~/.ssh/github_production -o StrictHostKeyChecking=no user@production-server
```

## 🔍 Verification

### Test Staging Deployment
```bash
# Push to develop branch to trigger staging deployment
git checkout develop
git push origin develop
```

### Test Production Deployment
```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

## 🚨 Security Notes

- ✅ SSH keys are encrypted at rest
- ✅ Secrets are only accessible to this repository
- ✅ Production requires manual approval
- ✅ SSH keys have restricted access
- ✅ No secrets are logged in workflow runs

## 📊 Monitoring

- ✅ Deployment status visible in GitHub Actions
- ✅ Environment URLs configured
- ✅ Slack notifications (optional)
- ✅ Deployment history tracked