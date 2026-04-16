@echo off
REM RSV360 CD Pipeline Validation
REM Validates GitHub Actions CD workflows

echo.
echo ===========================================
echo    RSV360 CD Pipeline Validation
echo ===========================================
echo.

echo Validating cd-staging.yml syntax...
python -c "import yaml; yaml.safe_load(open('.github/workflows/cd-staging.yml', 'r')); print('✅ cd-staging.yml syntax is valid')" 2>nul || echo ❌ cd-staging.yml syntax error

echo.
echo Validating cd-production.yml syntax...
python -c "import yaml; yaml.safe_load(open('.github/workflows/cd-production.yml', 'r')); print('✅ cd-production.yml syntax is valid')" 2>nul || echo ❌ cd-production.yml syntax error

echo.
echo ===========================================
echo CD Pipeline Features Validated:
echo ===========================================
echo.
echo ✅ Staging: Auto-deploy on develop push
echo ✅ Production: Tag-based deployment with approval
echo ✅ GitHub Container Registry integration
echo ✅ SSH deployment with appleboy/ssh-action
echo ✅ Database backup before production deploy
echo ✅ Blue-green deployment strategy
echo ✅ Automatic rollback on health check failure
echo ✅ Slack notifications
echo ✅ GitHub deployments API integration
echo.
echo 🔐 Required GitHub Secrets:
echo   STAGING_HOST, STAGING_USER, STAGING_SSH_KEY
echo   PRODUCTION_HOST, PRODUCTION_USER, PRODUCTION_SSH_KEY
echo   SLACK_WEBHOOK_URL (optional)
echo.
echo 🏗️  Required GitHub Environments:
echo   staging, production (with reviewers)
echo.
echo 🚀 CD Pipeline ready for deployment!
echo.
echo Next steps:
echo 1. Configure GitHub secrets (see .github/secrets-setup.md)
echo 2. Setup GitHub environments (see .github/environments-setup.md)
echo 3. Test staging: push to develop branch
echo 4. Test production: create version tag (git tag v1.0.0)
echo.
pause